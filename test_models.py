import os
from google import genai

API_KEY = os.getenv("GEMINI_API_KEY") or "AQ.Ab8RN6JBeLaWX9hwO703yEHEaONWxJF0RlM8qyf449aT1gb25w"
client = genai.Client(api_key=API_KEY)

models_to_test = [
    "gemini-flash-lite-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.0-flash-lite",
    "gemini-flash-latest"
]

for m in models_to_test:
    try:
        response = client.models.generate_content(
            model=m,
            contents=["hello"]
        )
        print(f"{m}: OK")
    except Exception as e:
        print(f"{m}: {e}")
