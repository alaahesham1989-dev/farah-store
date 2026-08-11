import json
import os
import time
import base64
from pathlib import Path
from typing import List, Set
from datetime import datetime

import pandas as pd
import requests

from google import genai

# ==========================================
# إعداد المجلدات والملفات
# ==========================================
WORKSPACE_DIR = Path(__file__).resolve().parent
IMAGE_DIR = WORKSPACE_DIR / "unique_images"
OUTPUT_FILE = WORKSPACE_DIR / "AI_Products_Report.xlsx"
PROGRESS_FILE = WORKSPACE_DIR / "ai_progress.json"

# ==========================================
# مفاتيح الـ API
# ==========================================
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or "AQ.Ab8RN6JBeLaWX9hwO703yEHEaONWxJF0RlM8qyf449aT1gb25w"
IMGBB_KEY_PATH = WORKSPACE_DIR / "imgbb_key.txt"

DAILY_LIMIT = 5000  # سنسمح بأي عدد هنا، والحد الفعلي من جوجل

ANALYSIS_PROMPT = """اقرأ هذه الصورة بدقة واستخرج معلومات المنتج.
أريد النتيجة فقط كـ JSON صالح يحتوي على الحقول التالية باللغة العربية:
1. "product_name": اسم المنتج
2. "product_description": وصف تسويقي جذاب ومفصل للمنتج
3. "how_to_use": طريقة استخدام المنتج بشكل مبسط
4. "department": القسم الذي ينتمي إليه المنتج (مثل: "أدوات منزلية" أو "أدوات تجميل" أو "إلكترونيات")
5. "target_audience": فئة المستخدمين المستهدفة (مثل: "نساء"، "رجال"، "أطفال"، "للجنسين")

مهم جداً: أرجع فقط كود الـ JSON بدون أي مقدمات أو شروحات."""

def load_progress() -> Set[str]:
    if not PROGRESS_FILE.exists():
        return set()
    try:
        data = json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
        return set(data.get("processed_files", []))
    except Exception:
        return set()

def save_progress(processed_files: Set[str]):
    PROGRESS_FILE.write_text(json.dumps({
        "processed_files": sorted(processed_files)
    }, ensure_ascii=False, indent=2), encoding="utf-8")

def clean_json(text: str) -> str:
    text = text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]
    return text

def parse_result(text: str, image_name: str) -> dict:
    try:
        return json.loads(clean_json(text))
    except json.JSONDecodeError:
        print(f"  ⚠️ فشل تحليل JSON لصورة {image_name}")
        return {
            "product_name": "غير واضح",
            "product_description": text[:200] if text else "غير متوفر",
            "how_to_use": "غير متوفر",
            "department": "غير محدد",
            "target_audience": "غير محدد"
        }

def upload_image_to_imgbb(image_path: Path) -> str:
    if not IMGBB_KEY_PATH.exists():
        return "محلي (لم يتم الرفع)"
    try:
        api_key = IMGBB_KEY_PATH.read_text(encoding="utf-8").strip()
        with open(image_path, "rb") as file:
            url = "https://api.imgbb.com/1/upload"
            payload = {
                "key": api_key,
                "image": base64.b64encode(file.read()).decode('utf-8')
            }
            res = requests.post(url, data=payload, timeout=30)
            if res.status_code == 200:
                return res.json()["data"]["url"]
            else:
                return "خطأ في الرفع"
    except Exception as e:
        return "خطأ في الرفع"

def save_to_excel(new_rows: List[dict]):
    if OUTPUT_FILE.exists():
        try:
            df_existing = pd.read_excel(OUTPUT_FILE)
        except Exception:
            df_existing = pd.DataFrame()
    else:
        df_existing = pd.DataFrame()
        
    df_new = pd.DataFrame(new_rows)
    df_combined = pd.concat([df_existing, df_new], ignore_index=True)
    df_combined.to_excel(OUTPUT_FILE, index=False)

def main():
    print("=" * 60)
    print("   🚀 Farah Store - محلل المنتجات بالذكاء الاصطناعي")
    print("=" * 60)
    
    if not IMAGE_DIR.exists():
        print(f"❌ المجلد {IMAGE_DIR.name} غير موجود!")
        return
        
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    all_images = sorted([p for p in IMAGE_DIR.iterdir() if p.is_file() and p.suffix.lower() in allowed_exts])
    processed_files = load_progress()
    
    remaining_images = [p for p in all_images if p.name not in processed_files]
    total_remaining = len(remaining_images)
    
    if total_remaining == 0:
        print("🎉 تم تحليل جميع الصور بالكامل!")
        return
    
    print(f"📸 إجمالي الصور: {len(all_images)} | تم تحليلها: {len(processed_files)} | متبقي: {total_remaining}")
    
    images_to_process = remaining_images[:DAILY_LIMIT]
    
    client = genai.Client(api_key=GEMINI_API_KEY)
    new_rows = []
    
    for index, image_path in enumerate(images_to_process, 1):
        print(f"\n[{index}/{len(images_to_process)}] 📷 {image_path.name}")
        try:
            public_url = upload_image_to_imgbb(image_path)
            
            uploaded_file = client.files.upload(file=str(image_path))
            response = client.models.generate_content(
                model="gemini-flash-lite-latest",
                contents=[ANALYSIS_PROMPT, uploaded_file]
            )
            
            result = parse_result(response.text, image_path.name)
            
            new_rows.append({
                "اسم الملف": image_path.name,
                "رابط الصورة المباشر": public_url,
                "اسم المنتج": result.get("product_name", "غير معروف"),
                "الوصف": result.get("product_description", "غير متوفر"),
                "طريقة الاستخدام": result.get("how_to_use", "غير متوفر"),
                "القسم": result.get("department", "غير محدد"),
                "الجمهور المستهدف": result.get("target_audience", "غير محدد")
            })
            
            processed_files.add(image_path.name)
            save_progress(processed_files)
            
            if len(new_rows) % 5 == 0:
                save_to_excel(new_rows)
                new_rows = []
                print(f"  💾 تم حفظ البيانات مؤقتاً...")
            
            time.sleep(3)
            
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e) or "Quota exceeded" in str(e):
                print(f"\n{'='*60}")
                print(f"⛔ تم استنفاد حصة جوجل المجانية لهذا اليوم!")
                print(f"📅 ارجع شغل السكريبت بكرة، أو قم بترقية حسابك في Google AI Studio.")
                print(f"{'='*60}")
                break
            elif "503" in str(e):
                print(f"  ⏳ ضغط على سيرفرات جوجل، انتظار 30 ثانية...")
                time.sleep(30)
            else:
                print(f"  ❌ خطأ: {e}")
                time.sleep(5)
                
    if new_rows:
        save_to_excel(new_rows)
        
    print(f"\n✅ الجلسة انتهت وتم الحفظ في {OUTPUT_FILE.name}")

if __name__ == "__main__":
    main()
