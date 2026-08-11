import csv
import os

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
all_images_file = os.path.join(img_dir, "all_images_analysis.csv")
products_file = os.path.join(img_dir, "products_analysis.csv")

def sort_and_sync():
    rows = []
    header = []
    
    # Read the good data from all_images_analysis.csv (which I just restored/generated)
    with open(all_images_file, 'r', encoding='utf-8-sig') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if row:
                rows.append(row)
                
    # Sort the rows by the first column (كود المنتج)
    rows.sort(key=lambda x: x[0])
    
    # Write back to all_images_analysis.csv
    with open(all_images_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(header)
        writer.writerows(rows)
        
    # ALSO overwrite products_analysis.csv to fix the corruption there
    with open(products_file, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(header)
        writer.writerows(rows)
        
    print(f"Successfully sorted {len(rows)} products by code and synced to both files.")

if __name__ == "__main__":
    sort_and_sync()
