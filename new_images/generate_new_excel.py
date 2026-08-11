import os
import csv
import urllib.parse

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
# Creating a completely new file
csv_file = os.path.join(img_dir, "all_images_analysis.csv")

def generate_new_excel():
    headers = [
        "كود المنتج",
        "اسم المنتج التجاري",
        "اسم المنتج بالمتجر",
        "وصف المنتج",
        "أقل سعر مستهلك (ج.م)",
        "أعلى سعر مستهلك (ج.م)",
        "احطياطي مخزون",
        "سعر الجمله",
        "رابط الصورة المحلي"
    ]
    
    rows = []
    rows.append(headers)
    
    valid_exts = ('.jpg', '.png', '.jpeg', '.mp4')
    
    try:
        files = os.listdir(img_dir)
    except FileNotFoundError:
        print(f"Directory not found: {img_dir}")
        return
        
    added_count = 0
    for filename in files:
        if filename.lower().endswith(valid_exts):
            base_code, _ = os.path.splitext(filename)
            
            # Create local file link exactly as requested
            file_url = f"file:///C:/Users/FOX/Desktop/فرح%20لستور/new_images/{filename}"
            
            new_row = [
                base_code,
                "", # اسم المنتج التجاري
                "", # اسم المنتج بالمتجر
                "", # وصف المنتج
                "", # أقل سعر مستهلك
                "", # أعلى سعر مستهلك
                "", # احطياطي مخزون
                "", # سعر الجمله
                file_url
            ]
            rows.append(new_row)
            added_count += 1
            
    # Save to a new CSV file with utf-8-sig so Excel reads Arabic correctly
    with open(csv_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerows(rows)
        
    print(f"Successfully generated new Excel file with {added_count} images.")

if __name__ == "__main__":
    generate_new_excel()
