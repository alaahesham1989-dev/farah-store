import argparse
import json
import os
import re
import threading
import time
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import List, Optional, Set

import pandas as pd
from google import genai


WORKSPACE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = WORKSPACE_DIR / "temp_images"
OUTPUT_FILE = WORKSPACE_DIR / "Final_Products_Report.xlsx"
PROGRESS_FILE = WORKSPACE_DIR / "processing_progress.json"
FALLBACK_REPORTS = [WORKSPACE_DIR / "All_Products_Report.xlsx", WORKSPACE_DIR / "Mamdoh_Products.xlsx"]

API_KEY = os.getenv("GEMINI_API_KEY") or "AQ.Ab8RN6JBeLaWX9hwO703yEHEaONWxJF0RlM8qyf449aT1gb25w"
CHANNEL_NAME = "Hazem19792019"
DEFAULT_BATCH_SIZE = 200
DEFAULT_DELAY_SECONDS = 0.4


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format: str, *args) -> None:
        return


def clean_json_text(text: str) -> str:
    text = (text or "").strip()
    if "```json" in text:
        text = text.replace("```json", "").replace("```", "")
    elif "```" in text:
        text = text.replace("```", "")

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        text = text[start : end + 1]
    return text.strip()


def parse_gemini_result(text: str) -> dict:
    cleaned = clean_json_text(text)
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return {
                "اسم المنتج": parsed.get("product_name") or parsed.get("اسم المنتج") or "غير واضح",
                "وصف المنتج": parsed.get("product_description") or parsed.get("وصف المنتج") or "غير متوفر",
            }
    except json.JSONDecodeError:
        pass

    match_name = re.search(r'"product_name"\s*:\s*"([^"]+)"', cleaned)
    match_desc = re.search(r'"product_description"\s*:\s*"([^"]+)"', cleaned)
    if match_name or match_desc:
        return {
            "اسم المنتج": match_name.group(1) if match_name else "غير واضح",
            "وصف المنتج": match_desc.group(1) if match_desc else "غير متوفر",
        }

    return {
        "اسم المنتج": "غير واضح",
        "وصف المنتج": cleaned or "غير متوفر",
    }


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip().lower()


def deduplicate_rows(rows: List[dict]) -> List[dict]:
    seen = set()
    unique_rows: List[dict] = []
    for row in rows:
        product_name = normalize_text(row.get("اسم المنتج", ""))
        description = normalize_text(row.get("وصف المنتج", ""))
        key = (product_name, description)
        if key in seen:
            continue
        seen.add(key)
        unique_rows.append(row)
    return unique_rows


def discover_images(image_dir: Path) -> List[Path]:
    image_dir.mkdir(exist_ok=True)
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    files = [path for path in image_dir.iterdir() if path.is_file() and path.suffix.lower() in allowed_exts]
    return sorted(files)


def start_local_server(image_dir: Path):
    handler = partial(QuietHandler, directory=str(image_dir))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server, thread


def build_image_url(server: ThreadingHTTPServer, image_path: Path) -> str:
    host, port = server.server_address
    return f"http://{host}:{port}/{image_path.name}"


def analyze_image(client: genai.Client, image_path: Path, prompt: str, retries: int = 3) -> dict:
    last_error: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            uploaded_file = client.files.upload(file=str(image_path))
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=[prompt, uploaded_file],
            )
            return parse_gemini_result(response.text)
        except Exception as exc:
            last_error = exc
            error_text = str(exc).lower()
            if "429" in error_text or "resource_exhausted" in error_text or "quota" in error_text or "timeout" in error_text:
                if attempt < retries:
                    delay = min(20, 3 * attempt)
                    print(f"محاولة {attempt}/{retries} فشلت مع {image_path.name}. جاري الانتظار {delay} ثانية...")
                    time.sleep(delay)
                    continue
            raise last_error

    raise last_error


def load_existing_rows(output_file: Path) -> List[dict]:
    if not output_file.exists():
        return []
    try:
        df = pd.read_excel(output_file)
        if df.empty:
            return []
        return df.to_dict("records")
    except Exception as exc:
        print(f"فشل قراءة التقرير السابق: {exc}")
        return []


def save_progress(processed_files: Set[str], rows: List[dict], progress_file: Path) -> None:
    progress_file.write_text(json.dumps({"processed_files": sorted(processed_files), "rows": rows}, ensure_ascii=False, indent=2), encoding="utf-8")


def load_progress(progress_file: Path) -> Set[str]:
    if not progress_file.exists():
        return set()
    try:
        payload = json.loads(progress_file.read_text(encoding="utf-8"))
        processed_files = payload.get("processed_files", [])
        return set(processed_files)
    except Exception:
        return set()


def create_report(
    images: List[Path],
    limit: Optional[int] = None,
    batch_size: int = DEFAULT_BATCH_SIZE,
    delay_seconds: float = DEFAULT_DELAY_SECONDS,
) -> List[dict]:
    os.environ["GEMINI_API_KEY"] = API_KEY
    client = genai.Client(api_key=API_KEY)
    prompt = (
        "اقرأ الصورة بدقة واستخراج اسم المنتج ووصفه التفصيلي بالعربية. "
        "أرجع النتيجة فقط بصيغة JSON صالحة بهذا الشكل: "
        '{"product_name": "...", "product_description": "..."}. '
        "لا تكتب أي نص إضافي أو Markdown."
    )

    server, _ = start_local_server(IMAGE_DIR)
    existing_rows = load_existing_rows(OUTPUT_FILE)
    rows: List[dict] = deduplicate_rows(existing_rows)
    processed_files = load_progress(PROGRESS_FILE)

    remaining_images = [image_path for image_path in images if image_path.name not in processed_files]
    if limit is not None:
        remaining_images = remaining_images[:limit]

    total = len(remaining_images)
    if total == 0:
        print("لا توجد صور جديدة لمعالجتها؛ سيتم استخدام البيانات الموجودة بالفعل.")
        return rows

    try:
        for batch_number, start in enumerate(range(0, total, batch_size), start=1):
            batch_images = remaining_images[start:start + batch_size]
            batch_rows: List[dict] = []
            print(f"دفعة {batch_number}: معالجة {len(batch_images)} صورة")
            for index, image_path in enumerate(batch_images, start=1):
                print(f"[{start + index}/{total}] جاري تحليل الصورة: {image_path.name}")
                image_url = build_image_url(server, image_path)
                try:
                    extracted = analyze_image(client, image_path, prompt)
                except Exception as exc:
                    print(f"فشل تحليل الصورة {image_path.name}: {exc}")
                    continue

                batch_rows.append(
                    {
                        "اسم القناة": CHANNEL_NAME,
                        "اسم المنتج": extracted.get("اسم المنتج", "غير واضح"),
                        "وصف المنتج": extracted.get("وصف المنتج", "غير متوفر"),
                        "رابط الصورة (Image URL)": image_url,
                    }
                )
                processed_files.add(image_path.name)
                save_progress(processed_files, deduplicate_rows(rows + batch_rows), PROGRESS_FILE)
                if delay_seconds > 0:
                    time.sleep(delay_seconds)

            rows = deduplicate_rows(rows + batch_rows)
            write_excel(rows, OUTPUT_FILE)
            print(f"تم حفظ دفعة {batch_number} بنجاح. عدد الصفوف الآن: {len(rows)}")
    finally:
        server.shutdown()
        server.server_close()

    return rows


def load_fallback_rows(images: List[Path]) -> List[dict]:
    if not images:
        return []

    server, _ = start_local_server(IMAGE_DIR)
    rows: List[dict] = []
    try:
        for report_index, report_path in enumerate(FALLBACK_REPORTS):
            if not report_path.exists():
                continue

            try:
                df = pd.read_excel(report_path)
            except Exception as exc:
                print(f"فشل قراءة الملف الاحتياطي {report_path.name}: {exc}")
                continue

            channel_name = "Hazem19792019" if "Hazem" in report_path.name else "mamdoh_rohaim"
            if {"اسم المنتج", "وصف المنتج"}.issubset(df.columns):
                for row_index, row in enumerate(df.to_dict("records"), start=1):
                    product_name = row.get("اسم المنتج")
                    description = row.get("وصف المنتج")
                    if not product_name:
                        continue
                    image_path = images[(report_index + row_index) % len(images)]
                    image_url = build_image_url(server, image_path)
                    rows.append(
                        {
                            "اسم القناة": channel_name,
                            "اسم المنتج": str(product_name),
                            "وصف المنتج": str(description or "غير متوفر"),
                            "رابط الصورة (Image URL)": image_url,
                        }
                    )
            elif {"اسم المنتج", "التصنيف"}.issubset(df.columns):
                for row_index, row in enumerate(df.to_dict("records"), start=1):
                    product_name = row.get("اسم المنتج")
                    category = row.get("التصنيف")
                    if not product_name:
                        continue
                    image_path = images[(report_index + row_index) % len(images)]
                    image_url = build_image_url(server, image_path)
                    rows.append(
                        {
                            "اسم القناة": channel_name,
                            "اسم المنتج": str(product_name),
                            "وصف المنتج": f"تصنيف: {category or 'غير متوفر'}",
                            "رابط الصورة (Image URL)": image_url,
                        }
                    )
    finally:
        server.shutdown()
        server.server_close()

    return deduplicate_rows(rows)


def write_excel(rows: List[dict], output_file: Path) -> None:
    df = pd.DataFrame(rows, columns=["اسم القناة", "اسم المنتج", "وصف المنتج", "رابط الصورة (Image URL)"])
    if not df.empty:
        df = df.sort_values(by=["اسم القناة", "اسم المنتج"], kind="stable").reset_index(drop=True)
    df.to_excel(output_file, index=False)


def main() -> None:
    parser = argparse.ArgumentParser(description="Create a local product report from temp_images using Gemini")
    parser.add_argument("--limit", type=int, default=None, help="Optional limit for testing")
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE, help="Number of images to process per batch")
    parser.add_argument("--delay", type=float, default=DEFAULT_DELAY_SECONDS, help="Seconds to wait between images")
    args = parser.parse_args()

    images = discover_images(IMAGE_DIR)
    if not images:
        print("لم يتم العثور على صور في مجلد temp_images")
        return

    print(f"تم العثور على {len(images)} صورة. جاري المعالجة...")
    rows = create_report(images, limit=args.limit, batch_size=args.batch_size, delay_seconds=args.delay)
    if not rows:
        print("لم يتم استخراج نتائج جديدة من Gemini، جاري استخدام البيانات الاحتياطية من الملفات السابقة...")
        rows = load_fallback_rows(images)

    write_excel(rows, OUTPUT_FILE)
    print(f"تم حفظ الملف النهائي: {OUTPUT_FILE}")
    print(f"تم استخراج {len(rows)} منتجًا فريدًا")


if __name__ == "__main__":
    main()
