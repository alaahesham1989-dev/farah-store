import os
import csv
import urllib.parse

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
csv_file = os.path.join(img_dir, "products_analysis.csv")

def fix_and_update():
    clean_rows = []
    existing_codes = set()
    
    # 1. Read and clean existing CSV
    try:
        # Try reading with utf-8 first (it might have BOM)
        with open(csv_file, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                if not row: continue
                
                # Check if this row is corrupted (contains )
                is_corrupted = any('' in col for col in row)
                if not is_corrupted:
                    clean_rows.append(row)
                    if len(row) > 0 and row[0] != 'كود المنتج':
                        existing_codes.add(row[0].strip())
    except Exception as e:
        print(f"Error reading: {e}")
        return

    # 2. Find missing images
    valid_exts = ('.jpg', '.png', '.jpeg', '.mp4')
    missing_files = []
    
    for filename in os.listdir(img_dir):
        if filename.lower().endswith(valid_exts):
            base_code, _ = os.path.splitext(filename)
            if base_code not in existing_codes:
                missing_files.append(filename)

    # 3. Add missing files with correct Arabic
    added_count = 0
    for filename in missing_files:
        base_code, _ = os.path.splitext(filename)
        file_url = f"file:///C:/Users/FOX/Desktop/فرح%20لستور/new_images/{filename}"
        
        # كود المنتج,اسم المنتج التجاري,اسم المنتج بالمتجر,وصف المنتج,أقل سعر مستهلك (ج.م),أعلى سعر مستهلك (ج.م),رابط الصورة المحلي,تنسيق اللون في الشيت
        new_row = [
            base_code,
            "منتج العناية المميز (مضاف تلقائياً)",
            "منتج جديد مميز",
            "منتج رائع للعناية الشخصية، يوفر لك تجربة فريدة للحصول على أفضل النتائج.",
            "200",
            "400",
            file_url,
            ""
        ]
        clean_rows.append(new_row)
        added_count += 1
        
    # 4. Save everything back cleanly with utf-8-sig for Excel
    with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerows(clean_rows)
        
    print(f"Cleaned corrupted rows and successfully added {added_count} missing images using Python.")

if __name__ == "__main__":
    fix_and_update()
