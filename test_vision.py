import os
import requests
import base64

GROQ_KEY_PATH = r"C:\Users\FOX\Desktop\فرح لستور\groq_key.txt"
with open(GROQ_KEY_PATH, 'r', encoding='utf-8') as f:
    api_key = f.read().strip()

# test with a dummy 1x1 image
pixel = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "llama-3.3-70b-versatile",
    "messages": [
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is this?"},
                {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{pixel}"}}
            ]
        }
    ]
}

response = requests.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
print(response.status_code, response.text[:200])
