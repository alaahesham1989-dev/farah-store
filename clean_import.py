import pandas as pd

path = 'Final_Database_Import.xlsx'
df = pd.read_excel(path)

# Step 1: filter valid rows
mask = df['اسم المنتج التجاري'].notna() | df['اسم المنتج بالمتجر'].notna()
clean_df = df[mask].copy().reset_index(drop=True)

# Step 2: assign SKU
sku_col = 'كود المنتج (SKU)'
new_skus = []
count = 1
for _, row in clean_df.iterrows():
    sku = row[sku_col]
    if pd.isna(sku) or str(sku).strip() == '' or str(sku).strip() == 'غير متوفر':
        new_skus.append(f'FS-{count:04d}')
        count += 1
    else:
        new_skus.append(str(sku).strip())
clean_df[sku_col] = new_skus

# Ensure unique SKUs after replacement, and if there are any duplicates from the original values, append suffixes.
existing = {}
final_skus = []
for sku in clean_df[sku_col]:
    candidate = sku
    if candidate in existing:
        existing[candidate] += 1
        candidate = f"{sku}-{existing[candidate]:02d}"
    else:
        existing[candidate] = 1
    final_skus.append(candidate)
clean_df[sku_col] = final_skus

# Step 3: report missing essentials
required = ['الفئة', 'سعر البيع', 'رابط الصورة الرئيسية']
missing_report = {col: clean_df[col].isna().sum() if col in clean_df.columns else len(clean_df) for col in required}
missing_rows = clean_df[clean_df[required].isna().any(axis=1)]

# Save clean file as CSV
clean_df.to_csv('Final_Database_Import_clean.csv', index=False, encoding='utf-8-sig')

print('final rows', len(clean_df))
print('missing report', missing_report)
print('missing rows count', len(missing_rows))
print('first 5 rows')
print(clean_df.head(5).to_dict(orient='records'))
print('missing rows details')
print(missing_rows[[sku_col, 'اسم المنتج التجاري', 'اسم المنتج بالمتجر'] + required].to_dict(orient='records'))
