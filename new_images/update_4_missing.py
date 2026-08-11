import csv
import os

img_dir = r"C:\Users\FOX\Desktop\فرح لستور\new_images"
all_images_file = os.path.join(img_dir, "all_images_analysis.csv")
new_only_file = os.path.join(img_dir, "new_products_only.csv")
products_file = os.path.join(img_dir, "products_analysis.csv")

missing_data = {
    "code0002": ["HOME GOLD Ion Vapour Steamer", "جهاز بخار الوجه المنزلي", "جهاز بخار الوجه الأيوني HG-606، يفتح المسام وينظف البشرة بعمق ويمنحك ترطيباً مثالياً لبشرة أكثر نضارة وإشراقاً.", "450", "850", "20", "300"],
    "code0007": ["HD Vision WrapArounds", "نظارات الرؤية الليلية والنهارية", "نظارات HD Vision عالية الوضوح للقيادة، تقلل التوهج وتوضح الرؤية بشكل مثالي، يمكن ارتداؤها فوق النظارات الطبية.", "120", "250", "50", "80"],
    "code0012": ["Dental Water Flosser", "جهاز الخيط المائي لتنظيف الأسنان", "جهاز تنظيف الأسنان بالخيط المائي اللاسلكي، يزيل بقايا الطعام والجير بفعالية للثة صحية وأسنان نظيفة مع 3 أوضاع تشغيل.", "350", "700", "25", "250"],
    "code0027": ["F-37 Multi-function Flashlight", "كشاف طوارئ متعدد الاستخدامات", "كشاف طوارئ F-37 احترافي بقوة إضاءة عالية مع بطارية كبيرة، يحتوي على شفرة قاطع، صافرة إنذار، وشحن Type-C.", "250", "550", "40", "180"]
}

def update_file(filepath):
    if not os.path.exists(filepath): return
    rows = []
    with open(filepath, 'r', encoding='utf-8-sig') as f:
        reader = list(csv.reader(f))
        if not reader: return
        header = reader[0]
        for row in reader[1:]:
            if not row: continue
            code = row[0]
            if code in missing_data:
                d = missing_data[code]
                row[1] = d[0]
                row[2] = d[1]
                row[3] = d[2]
                row[4] = d[3]
                row[5] = d[4]
                row[6] = d[5]
                row[7] = d[6]
            rows.append(row)
            
    with open(filepath, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_MINIMAL)
        writer.writerow(header)
        writer.writerows(rows)

def run_update():
    update_file(all_images_file)
    update_file(products_file)
    update_file(new_only_file)
    print("Successfully updated the 4 missing products in all files.")

if __name__ == "__main__":
    run_update()
