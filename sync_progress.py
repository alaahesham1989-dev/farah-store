import json
import pandas as pd
from pathlib import Path

WORKSPACE_DIR = Path(__file__).resolve().parent
OUTPUT_FILE = WORKSPACE_DIR / "AI_Products_Report.xlsx"
PROGRESS_FILE = WORKSPACE_DIR / "ai_progress.json"

if OUTPUT_FILE.exists():
    df = pd.read_excel(OUTPUT_FILE)
    if 'اسم الملف' in df.columns:
        saved_files = df['اسم الملف'].dropna().tolist()
        PROGRESS_FILE.write_text(json.dumps({'processed_files': sorted(saved_files)}, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"تمت مزامنة {len(saved_files)} ملف من الإكسيل بنجاح.")
