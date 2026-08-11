import pandas as pd
import json
import re
from datetime import datetime
import math
import shutil
import os
from urllib.parse import unquote

# File paths
EXCEL_FILE = r'C:\Users\FOX\Desktop\فرح لستور\Final_Database_Import.xlsx'
CSV_FILE = r'C:\Users\FOX\Desktop\فرح لستور\new_images\products_analysis.csv'
DATA_JS_FILE = r'C:\Users\FOX\Desktop\فرح لستور\farah-store\js\data.js'
IMAGES_DEST_DIR = r'C:\Users\FOX\Desktop\فرح لستور\farah-store\images\products'

def clean_num(val, default=0):
    try:
        if pd.isna(val) or str(val).strip() == '':
            return default
        num = float(str(val).replace(',', '').strip())
        return int(num) if num.is_integer() else num
    except:
        return default

def generate_products():
    print(f"Loading data from {EXCEL_FILE} and {CSV_FILE}...")
    df = pd.read_excel(EXCEL_FILE)
    df_csv = pd.read_csv(CSV_FILE, encoding='utf-8-sig')
    df_csv.columns = df_csv.columns.str.strip()
    df_csv['كود المنتج'] = df_csv['كود المنتج'].astype(str).str.strip()
    
    # Ensure images destination directory exists
    os.makedirs(IMAGES_DEST_DIR, exist_ok=True)
    
    products = []
    
    for idx, row in df.iterrows():
        sku = str(row.get('كود المنتج (SKU)', '')).strip()
        if not sku or sku == 'nan':
            continue
            
        pid = sku.lower()
        name = str(row.get('اسم المنتج بالمتجر', '')).strip()
        nameEn = str(row.get('اسم المنتج التجاري', '')).strip()
        
        # Prices
        price = clean_num(row.get('سعر البيع'))
        priceOriginal = clean_num(row.get('السعر قبل الخصم'))
        priceWholesale = clean_num(row.get('سعر الجملة'))
        
        # Calculate discount properly
        discount = 0
        if priceOriginal > price and priceOriginal > 0:
            discount = math.floor(((priceOriginal - price) / priceOriginal) * 100)
            
        # Inventory
        stock = clean_num(row.get('الكمية المتاحة', 100))
        
        # Category
        category = str(row.get('الفئة', '')).strip()
        if not category or category == 'nan':
            category = 'beauty'  # Default for Farah Store
            
        # Description
        description = str(row.get('الوصف التفصيلي', '')).strip()
        if description == 'nan':
            description = str(row.get('الوصف القصير', '')).strip()
            if description == 'nan':
                description = ''
                
        # Local Images Processing
        images = []
        # Find local image path from original CSV
        csv_row = df_csv[df_csv['كود المنتج'] == sku]
        if not csv_row.empty:
            local_url = str(csv_row.iloc[0].get('رابط الصورة المحلي', '')).strip()
            if local_url and local_url != 'nan' and local_url.startswith('file:///'):
                # Extract file path
                local_path = unquote(local_url.replace('file:///', ''))
                local_path = local_path.replace('/', '\\') # Fix Windows slashes
                
                if os.path.exists(local_path):
                    filename = os.path.basename(local_path)
                    dest_path = os.path.join(IMAGES_DEST_DIR, filename)
                    try:
                        shutil.copy2(local_path, dest_path)
                        # The URL that the website expects is relative
                        images.append(f"images/products/{filename}")
                    except Exception as e:
                        print(f"Error copying {filename}: {e}")
                else:
                    print(f"Image not found locally: {local_path}")
            
        # Building the object
        product = {
            "id": pid,
            "sku": sku,
            "name": name if name and name != 'nan' else nameEn,
            "nameEn": nameEn,
            "category": category,
            "description": description,
            "price": price,
            "priceWholesale": priceWholesale,
            "priceOriginal": priceOriginal,
            "discount": discount,
            "stock": stock,
            "images": images,
            "variants": {},
            "rating": 4.5,
            "reviews": 120,
            "sold": 300,
            "badge": "جديد",
            "badgeType": "new",
            "featured": True,
            "createdAt": datetime.now().strftime("%Y-%m-%d")
        }
        products.append(product)
        
    print(f"Successfully processed {len(products)} products.")
    
    # Read the data.js file
    print(f"Reading {DATA_JS_FILE}...")
    with open(DATA_JS_FILE, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Generate JSON string
    products_json = json.dumps(products, ensure_ascii=False, indent=2)
    
    # Replace the PRODUCTS array using Regex
    pattern = re.compile(r'const\s+PRODUCTS\s*=\s*\[[\s\S]*?\];', re.MULTILINE)
    replacement = f'const PRODUCTS = {products_json};'
    new_content, count = pattern.subn(replacement, content)
    
    if count == 0:
        print("ERROR: Could not find 'const PRODUCTS = [...]' in data.js!")
        return
        
    # Save the updated data.js
    with open(DATA_JS_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"SUCCESS: Injected {len(products)} products into data.js!")

if __name__ == "__main__":
    generate_products()
