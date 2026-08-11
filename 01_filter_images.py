import os
import shutil
from pathlib import Path
try:
    import imagehash
    from PIL import Image
except ImportError:
    print("يرجى تثبيت المكتبات المطلوبة: pip install imagehash Pillow")
    exit(1)

# إعداد المجلدات
WORKSPACE_DIR = Path(__file__).resolve().parent
SOURCE_DIR = WORKSPACE_DIR / "temp_images"
DEST_DIR = WORKSPACE_DIR / "unique_images"

def filter_duplicates(source_dir: Path, dest_dir: Path):
    if not source_dir.exists():
        print(f"المجلد {source_dir.name} غير موجود! يرجى التأكد من مسار الصور.")
        return

    dest_dir.mkdir(exist_ok=True)
    allowed_exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    
    files = [p for p in source_dir.iterdir() if p.is_file() and p.suffix.lower() in allowed_exts]
    total_files = len(files)
    
    if total_files == 0:
        print("لا توجد صور لمعالجتها في المجلد المصدر.")
        return

    print(f"تم العثور على {total_files} صورة. جاري الفلترة (قد تستغرق هذه العملية بعض الوقت)...")

    seen_hashes = {}
    unique_count = 0
    duplicate_count = 0

    for index, file_path in enumerate(files, 1):
        if index % 500 == 0:
            print(f"تمت معالجة {index}/{total_files} صورة...")

        try:
            with Image.open(file_path) as img:
                # استخدام pHash لاكتشاف التطابق حتى لو اختلف حجم الصورة قليلاً
                img_hash = str(imagehash.phash(img))
                
            if img_hash in seen_hashes:
                duplicate_count += 1
            else:
                seen_hashes[img_hash] = file_path.name
                unique_count += 1
                
                # نسخ الصورة للمجلد الجديد
                dest_path = dest_dir / file_path.name
                if not dest_path.exists():
                    shutil.copy2(file_path, dest_path)
                    
        except Exception as e:
            print(f"خطأ في قراءة الصورة {file_path.name}: {e}")

    print("\n" + "="*40)
    print("🎉 انتهت عملية الفلترة بنجاح!")
    print(f"إجمالي الصور: {total_files}")
    print(f"الصور الفريدة (تم نسخها): {unique_count}")
    print(f"الصور المكررة (تم تخطيها): {duplicate_count}")
    print(f"المجلد الجديد: {dest_dir.name}")
    print("="*40)

if __name__ == "__main__":
    filter_duplicates(SOURCE_DIR, DEST_DIR)
