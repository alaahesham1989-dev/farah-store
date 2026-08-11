import csv
path = r'C:\Users\FOX\Desktop\فرح لستور\Final_Database_Import.csv'
encodings = ['utf-8-sig','utf-8','cp1256','iso-8859-6','cp1252']
print('path:', path)
for enc in encodings:
    try:
        with open(path, 'r', encoding=enc, newline='') as f:
            sample = f.read(4096)
        print('can read with', enc, 'len', len(sample))
    except Exception as e:
        print('fail', enc, e)
print('---')
for enc in encodings:
    try:
        with open(path, 'r', encoding=enc, newline='') as f:
            reader = csv.reader(f)
            rows = [next(reader) for _ in range(6)]
        print('ENCODING', enc)
        for i, row in enumerate(rows):
            print(i, row)
        break
    except Exception as e:
        print('bad', enc, e)
