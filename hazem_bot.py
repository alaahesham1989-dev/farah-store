import asyncio
import json
import os
import re
from pathlib import Path

import pandas as pd
from google import genai
from telethon import TelegramClient

# ==========================================
# بيانات الاتصال
# ==========================================
API_ID = 33725795
API_HASH = '902879368529527d4091b15d3cebb043'
GEMINI_API_KEY = 'AQ.Ab8RN6JBeLaWX9hwO703yEHEaONWxJF0RlM8qyf449aT1gb25w'
BOT_TOKEN = '8856744287:AAGeRoknbswc7b1HIIKWTzrXDWerBV15BKQ'
CHANNELS = ['Hazem19792019', 'mamdoh_rohaim']
SESSION_NAME = 'my_user_session'
DOWNLOAD_DIR = Path('temp_images')
OUTPUT_FILE = 'All_Products_Report.xlsx'
MAX_IMAGES_PER_CHANNEL = None

os.environ['GEMINI_API_KEY'] = GEMINI_API_KEY

client_telethon = TelegramClient(SESSION_NAME, API_ID, API_HASH)
gemini_client = genai.Client(api_key=GEMINI_API_KEY)


def clean_json_text(text: str) -> str:
    text = (text or '').strip()
    if '```json' in text:
        text = text.replace('```json', '').replace('```', '')
    elif '```' in text:
        text = text.replace('```', '')

    start = text.find('{')
    end = text.rfind('}')
    if start != -1 and end != -1 and end > start:
        text = text[start:end + 1]
    return text.strip()


def sanitize_sheet_name(name: str) -> str:
    safe_name = re.sub(r'[\\/*?:\[\]]', '', str(name))
    return safe_name[:31] or 'Sheet1'


def parse_gemini_result(text: str) -> dict:
    cleaned = clean_json_text(text)
    try:
        parsed = json.loads(cleaned)
        if isinstance(parsed, dict):
            return {
                'اسم المنتج': parsed.get('product_name') or parsed.get('اسم المنتج') or 'غير واضح',
                'وصف المنتج': parsed.get('product_description') or parsed.get('وصف المنتج') or 'غير متوفر',
                'الفئة': parsed.get('category') or parsed.get('الفئة') or 'غير مصنف'
            }
    except json.JSONDecodeError:
        pass

    match_name = re.search(r'"product_name"\s*:\s*"([^"]+)"', cleaned)
    match_desc = re.search(r'"product_description"\s*:\s*"([^"]+)"', cleaned)
    match_category = re.search(r'"category"\s*:\s*"([^"]+)"', cleaned)
    if match_name or match_desc or match_category:
        return {
            'اسم المنتج': match_name.group(1) if match_name else 'غير واضح',
            'وصف المنتج': match_desc.group(1) if match_desc else 'غير متوفر',
            'الفئة': match_category.group(1) if match_category else 'غير مصنف'
        }

    return {
        'اسم المنتج': 'غير واضح',
        'وصف المنتج': cleaned or 'غير متوفر',
        'الفئة': 'غير مصنف'
    }


def clear_download_dir():
    DOWNLOAD_DIR.mkdir(exist_ok=True)
    for file_path in DOWNLOAD_DIR.glob('*'):
        if file_path.is_file():
            file_path.unlink()


async def download_latest_product_images(channel: str):
    DOWNLOAD_DIR.mkdir(exist_ok=True)
    downloaded_files = []
    print(f'جاري سحب جميع الصور المتاحة من القناة: {channel}')

    async for message in client_telethon.iter_messages(channel):
        if not message.photo:
            continue

        safe_name = f'{channel}_{message.id}.jpg'
        destination = str(DOWNLOAD_DIR / safe_name)
        file_path = await message.download_media(file=destination)
        if file_path:
            downloaded_files.append(Path(file_path))
            print(f'تم تحميل الصورة: {file_path}')

    return downloaded_files


async def analyze_image(image_path: Path):
    prompt = (
        'اقرأ الصورة بدقة واستخراج اسم المنتج ووصفه التفصيلي والفئة بالعربية. '
        'أرجع النتيجة فقط بصيغة JSON صالحة بهذا الشكل: '
        '{"product_name": "...", "product_description": "...", "category": "..."}. '
        'لا تكتب أي نص إضافي أو Markdown.'
    )

    for attempt in range(3):
        try:
            uploaded_file = gemini_client.files.upload(file=str(image_path))
            response = gemini_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, uploaded_file],
            )
            return parse_gemini_result(response.text)
        except Exception as exc:
            error_text = str(exc)
            if '429' in error_text or 'RESOURCE_EXHAUSTED' in error_text or 'quota' in error_text.lower():
                if attempt < 2:
                    wait_seconds = 65
                    print(f'تم تجاوز الكوتا، جاري الانتظار {wait_seconds} ثانية ثم إعادة المحاولة...')
                    await asyncio.sleep(wait_seconds)
                    continue
            raise


async def main():
    await client_telethon.start()
    print('تم الاتصال بحساب Telegram بنجاح')

    all_rows = []
    clear_download_dir()

    try:
        for channel in CHANNELS:
            images = await download_latest_product_images(channel)
            if not images:
                print(f'لم يتم العثور على صور في القناة: {channel}')
                continue

            print(f'جاري تحليل {len(images)} صورة من القناة: {channel}')
            for image_path in images:
                try:
                    extracted = await analyze_image(image_path)
                    all_rows.append({
                        'اسم القناة': channel,
                        'اسم المنتج': extracted['اسم المنتج'],
                        'وصف المنتج': extracted['وصف المنتج'],
                        'الفئة': extracted['الفئة']
                    })
                except Exception as exc:
                    print(f'فشل تحليل الصورة {image_path}: {exc}')
                finally:
                    if image_path.exists():
                        image_path.unlink()

        if all_rows:
            df = pd.DataFrame(all_rows, columns=['اسم القناة', 'اسم المنتج', 'وصف المنتج', 'الفئة'])
            with pd.ExcelWriter(OUTPUT_FILE) as writer:
                df.to_excel(writer, sheet_name='All_Products', index=False)

                channel_summary = df.groupby('اسم القناة').size().reset_index(name='عدد المنتجات')
                channel_summary.to_excel(writer, sheet_name='By_Channel', index=False)

                category_summary = df.groupby('الفئة').size().reset_index(name='عدد المنتجات')
                category_summary.to_excel(writer, sheet_name='By_Category', index=False)

                for channel_name in sorted(df['اسم القناة'].dropna().unique()):
                    channel_df = df[df['اسم القناة'] == channel_name][['اسم المنتج', 'وصف المنتج', 'الفئة']]
                    channel_df.to_excel(writer, sheet_name=sanitize_sheet_name(channel_name), index=False)

            print(f'تم حفظ التقرير النهائي في: {OUTPUT_FILE}')
        else:
            print('لم يتم استخراج أي بيانات ناجحة.')

    finally:
        await client_telethon.disconnect()


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass