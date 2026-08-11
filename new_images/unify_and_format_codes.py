import csv
import os
import urllib.parse

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
all_images_file = os.path.join(img_dir, "all_images_analysis.csv")
products_file = os.path.join(img_dir, "products_analysis.csv")

def unify_and_format():
    unique_rows = {}
    header = []
    
    # Read the data from all_images_analysis.csv
    with open(all_images_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if not row: continue
            # Extract the 19-digit code from the image URL to use for sorting/deduping
            # URL is at index 8
            img_url = row[8]
            # Get the filename from URL
            filename = img_url.split('/')[-1]
            base_code, _ = os.path.splitext(urllib.parse.unquote(filename))
            
            # Deduplicate using the base_code
            if base_code not in unique_rows:
                unique_rows[base_code] = row
                
    # Sort the unique items by their original 19-digit filename (base_code)
    # This guarantees they match the user's screenshot order exactly.
    sorted_items = sorted(unique_rows.items(), key=lambda x: x[0])
    
    final_rows = []
    counter = 1
    
    for base_code, row in sorted_items:
        # Assign the new codeformat code0001, code0002, etc.
        new_code = f"code{counter:04d}"
        row[0] = new_code
        final_rows.append(row)
        counter += 1
        
    # Write back to both CSV files to keep them perfectly synced
    with open(all_images_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(header)
        writer.writerows(final_rows)
        
    with open(products_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(header)
        writer.writerows(final_rows)
        
    print(f"Successfully filtered duplicates, sorted, and generated codes code0001 to code{counter-1:04d} for {len(final_rows)} products.")

if __name__ == "__main__":
    unify_and_format()
