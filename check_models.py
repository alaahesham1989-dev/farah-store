import os
from google import genai

API_KEY = os.getenv("GEMINI_API_KEY") or "AQ.Ab8RN6JBeLaWX9hwO703yEHEaONWxJF0RlM8qyf449aT1gb25w"
client = genai.Client(api_key=API_KEY)
models = client.models.list()
for m in models:
    if "flash" in m.name:
        print(m.name)
