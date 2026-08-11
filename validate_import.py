import pandas as pd
path = 'Final_Database_Import.xlsx'
df = pd.read_excel(path)
print('rows', len(df))
print('columns', len(df))
print('column names:', list(df.columns))
print('\nmissing counts:')
print(df.isna().sum())
print('\nhead:')
print(df.head(5).to_dict(orient='records'))
print('\ndtypes:')
print(df.dtypes)
print('\nunique counts:')
for col in df.columns:
    nunique = df[col].nunique(dropna=False)
    if nunique <= 20:
        print(col, 'unique', nunique, 'values', df[col].unique())
    else:
        print(col, 'unique', nunique)
if 'كود المنتج (SKU)' in df.columns:
    dup = df[df['كود المنتج (SKU)'].duplicated(keep=False)]
    print('\nduplicated SKUs:', len(dup))
    if not dup.empty:
        print(dup[['كود المنتج (SKU)','اسم المنتج التجاري','اسم المنتج بالمتجر']])
for col in ['سعر الجملة','سعر البيع','السعر قبل الخصم','نسبة الخصم %','هامش الربح','الكمية المتاحة','حد التنبيه','الوزن (جرام)']:
    if col in df.columns:
        bad = df[~pd.to_numeric(df[col], errors='coerce').notna() & df[col].notna()]
        print(f'bad numeric in {col}:', len(bad))
        if len(bad) > 0:
            print(bad[[col, 'كود المنتج (SKU)' if 'كود المنتج (SKU)' in df.columns else df.columns[0]]].head(10))
if 'الفئة' in df.columns:
    print('\nmissing category count', df['الفئة'].isna().sum())
if 'الفئة الفرعية' in df.columns:
    print('missing subcategory count', df['الفئة الفرعية'].isna().sum())
