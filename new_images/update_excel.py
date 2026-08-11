import os
import csv
import urllib.parse

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
csv_file = os.path.join(img_dir, "products_analysis.csv")

def update_csv():
    existing_codes = set()
    rows = []
    
    # 1. Read existing CSV
    try:
        # Use utf-8-sig to handle Arabic correctly in Excel
        with open(csv_file, 'r', encoding='utf-8-sig') as f:
            reader = csv.reader(f)
            headers = next(reader)
            rows.append(headers)
            
            for row in reader:
                if row:
                    # First column is the code
                    code = row[0].strip()
                    existing_codes.add(code)
                    rows.append(row)
    except FileNotFoundError:
        print("CSV file not found!")
        return
        
    # 2. Get all images in directory
    missing_files = []
    valid_exts = ('.jpg', '.png', '.jpeg', '.mp4')
    for filename in os.listdir(img_dir):
        if filename.lower().endswith(valid_exts):
            base_code, _ = os.path.splitext(filename)
            if base_code not in existing_codes:
                missing_files.append(filename)
                
    # 3. Append missing files
    added_count = 0
    for filename in missing_files:
        base_code, _ = os.path.splitext(filename)
        # Create the local file URL
        file_path_encoded = urllib.parse.quote("C:/Users/FOX/Desktop/فرح لستور/new_images/" + filename)
        file_url = f"file:///{file_path_encoded}"
        # We don't really need to encode everything, keeping it readable for the user is better, 
        # but standard is just replacing spaces with %20.
        # Let's just do exactly what was in the sheet: file:///C:/Users/FOX/Desktop/فرح%20لستور/new_images/filename.jpg
        file_url = f"file:///C:/Users/FOX/Desktop/فرح%20لستور/new_images/{filename}"
        
        # New row based on the 8 columns
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
        rows.append(new_row)
        added_count += 1
        
    # 4. Save back to CSV
    if added_count > 0:
        with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
            writer.writerows(rows)
        print(f"Successfully added {added_count} missing images using Python.")
    else:
        print("No missing images found. The CSV is already up to date.")

if __name__ == "__main__":
    update_csv()
