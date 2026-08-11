import os, time
from google import genai
from pathlib import Path

API_KEY = os.getenv('GEMINI_API_KEY') or 'AQ.Ab8RN6JBeLaWX9hwO703yEHEaONWxJF0RlM8qyf449aT1gb25w'
client = genai.Client(api_key=API_KEY)

IMAGE_DIR = Path(r'C:\Users\FOX\Desktop\فرح لستور\unique_images')
test_images = sorted(IMAGE_DIR.glob('*.jpg'))[:3]

for img in test_images:
    try:
        uploaded = client.files.upload(file=str(img))
        response = client.models.generate_content(
            model='gemini-flash-lite-latest',
            contents=['What product is this? Reply in 10 words max.', uploaded]
        )
        print(f'OK: {img.name} -> {response.text.strip()[:60]}')
    except Exception as e:
        err = str(e)
        if 'limit' in err.lower():
            import re
            limits = re.findall(r"quotaValue.*?'(\d+)'", err)
            print(f'LIMIT INFO: {limits}')
        print(f'ERROR: {img.name} -> {err[:150]}')
    time.sleep(2)
