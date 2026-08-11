import pandas as pd
import numpy as np
from datetime import datetime

# File paths
CSV_FILE = r'C:\Users\FOX\Desktop\فرح لستور\new_images\products_analysis.csv'
EXCEL_FILE = r'C:\Users\FOX\Desktop\فرح لستور\Marketing_Master.xlsx'
OUTPUT_FILE = r'C:\Users\FOX\Desktop\فرح لستور\Final_Database_Import.xlsx'

def clean_price(val):
    try:
        if pd.isna(val) or str(val).strip() == '':
            return 0.0
        return float(str(val).replace(',', '').strip())
    except:
        return 0.0

def generate_final_db():
    print("Loading data...")
    # Load the CSV and Excel files
    df_csv = pd.read_csv(CSV_FILE, encoding='utf-8-sig')
    df_excel = pd.read_excel(EXCEL_FILE)

    # Make sure both have the same key format
    df_csv.columns = df_csv.columns.str.strip()
    df_excel.columns = df_excel.columns.str.strip()
    
    df_csv['كود المنتج'] = df_csv['كود المنتج'].astype(str).str.strip()
    df_excel['كود المنتج'] = df_excel['كود المنتج'].astype(str).str.strip()

    # Merge dataframes on 'كود المنتج' (Left join to keep all original products)
    df_merged = pd.merge(df_csv, df_excel, on='كود المنتج', how='left')
    print(f"Merged data contains {len(df_merged)} rows.")
    print("Merged columns:", df_merged.columns.tolist())

    # Initialize the final dataframe with exact requested columns
    columns = [
        'كود المنتج (SKU)', 'اسم المنتج التجاري', 'اسم المنتج بالمتجر', 'الوصف القصير',
        'الوصف التفصيلي', 'الفئة', 'الفئة الفرعية', 'سعر الجملة', 'سعر البيع',
        'السعر قبل الخصم', 'نسبة الخصم %', 'هامش الربح', 'الكمية المتاحة',
        'حد التنبيه', 'الوزن (جرام)', 'رابط الصورة الرئيسية', 'روابط صور إضافية',
        'كود المورد', 'حالة المنتج', 'تاريخ الإضافة', 'الكلمات المفتاحية (SEO)'
    ]
    
    df_final = pd.DataFrame(columns=columns)

    # --- Mapping the Data ---
    
    # Basic mapping from CSV (Strictly source of truth)
    df_final['كود المنتج (SKU)'] = df_merged['كود المنتج']
    df_final['اسم المنتج التجاري'] = df_merged.get('اسم المنتج التجاري_x', df_merged.get('اسم المنتج التجاري'))
    df_final['اسم المنتج بالمتجر'] = df_merged['اسم المنتج بالمتجر']
    df_final['الوصف القصير'] = df_merged['وصف المنتج']
    
    # Financials (Strictly from CSV)
    wholesale_col = 'سعر الجمله' if 'سعر الجمله' in df_merged.columns else 'سعر الجملة'
    df_final['سعر الجملة'] = df_merged[wholesale_col]
    df_final['سعر البيع'] = df_merged['أقل سعر مستهلك (ج.م)']
    df_final['السعر قبل الخصم'] = df_merged['أعلى سعر مستهلك (ج.م)']
    
    # Inventory (Strictly from CSV)
    df_final['الكمية المتاحة'] = df_merged['احطياطي مخزون']
    
    # Mapping from Excel (Marketing Data)
    df_final['رابط الصورة الرئيسية'] = df_merged['رابط الصورة المباشر']
    
    # Detailed Description (from Marketing Master)
    def combine_details(row):
        details = []
        if pd.notna(row.get('1. الجمهور المستهدف')) and str(row.get('1. الجمهور المستهدف')).strip() != 'N/A':
            details.append(f"الجمهور المستهدف:\n{row.get('1. الجمهور المستهدف')}")
        if pd.notna(row.get('2. الزوايا الإعلانية')) and str(row.get('2. الزوايا الإعلانية')).strip() != 'N/A':
            details.append(f"زوايا الإعلان:\n{row.get('2. الزوايا الإعلانية')}")
        if pd.notna(row.get('7. اعتراضات العميل والرد')) and str(row.get('7. اعتراضات العميل والرد')).strip() != 'N/A':
            details.append(f"ملاحظات إضافية:\n{row.get('7. اعتراضات العميل والرد')}")
            
        return "\n\n".join(details) if details else str(row['وصف المنتج'])
        
    df_final['الوصف التفصيلي'] = df_merged.apply(combine_details, axis=1)

    # Empty columns for user to fill later (NO HYPOTHETICAL DATA)
    df_final['الفئة'] = ''
    df_final['الفئة الفرعية'] = ''
    df_final['نسبة الخصم %'] = ''
    df_final['هامش الربح'] = ''
    df_final['حد التنبيه'] = ''
    df_final['الوزن (جرام)'] = ''
    df_final['روابط صور إضافية'] = ''
    df_final['كود المورد'] = ''
    df_final['حالة المنتج'] = ''
    df_final['تاريخ الإضافة'] = ''
    df_final['الكلمات المفتاحية (SEO)'] = ''

    # Save to Excel
    print(f"Saving final database to {OUTPUT_FILE}...")
    df_final.to_excel(OUTPUT_FILE, index=False)
    print("Done!")

if __name__ == "__main__":
    generate_final_db()
