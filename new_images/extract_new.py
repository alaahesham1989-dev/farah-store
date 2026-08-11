import csv
import os
import urllib.parse

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
all_images_file = os.path.join(img_dir, "all_images_analysis.csv")
new_only_file = os.path.join(img_dir, "new_products_only.csv")

# The original 26 items base codes
original_26_codes = {
    "5881709725215297376", "5881709725215297378", "5881709725215297379",
    "5881709725215297384", "5881709725215297388", "5881709725215297389 (1)",
    "5881709725215297389", "5881709725215297390", "5881709725215297392",
    "5881709725215297393", "5881709725215297395", "5881709725215297418",
    "5881709725215297425", "5881709725215297432", "5881709725215297436",
    "5881709725215297437", "5881709725215297447", "5881709725215297454",
    "5881709725215297455", "5881709725215297458", "5881709725215297463",
    "5881709725215297481", "5897814783128440119", "5897814783128440123",
    "5897814783128440129", "5897814783128440130"
}

def extract_new_only():
    header = []
    new_rows = []
    
    with open(all_images_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row: continue
            
            img_url = row[8]
            filename = img_url.split('/')[-1]
            base_code, _ = os.path.splitext(urllib.parse.unquote(filename))
            
            if base_code not in original_26_codes:
                new_rows.append(row)
                
    with open(new_only_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(header)
        writer.writerows(new_rows)
        
    print(f"Extracted {len(new_rows)} new products successfully.")

if __name__ == "__main__":
    extract_new_only()
