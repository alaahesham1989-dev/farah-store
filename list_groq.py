import os
import requests

GROQ_KEY_PATH = r"C:\Users\FOX\Desktop\فرح لستور\groq_key.txt"
if os.path.exists(GROQ_KEY_PATH):
    with open(GROQ_KEY_PATH, 'r', encoding='utf-8') as f:
        api_key = f.read().strip()
    
    headers = {"Authorization": f"Bearer {api_key}"}
    response = requests.get("https://api.groq.com/openai/v1/models", headers=headers)
    if response.status_code == 200:
        models = response.json().get("data", [])
        for m in models:
            print(m.get("id"))
    else:
        print(f"Error: {response.text}")
