const fs = require('fs');
const path = require('path');

const imgDir = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\new_images';
const targetImgDir = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\farah-store\\images';
const csvFile = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\farah-store\\products_data.csv';

try {
  // 1. Load existing products from data.js
  const content = fs.readFileSync('js/data.js', 'utf8');
  const sandbox = { window: {} };
  const modifiedContent = content.replace('const PRODUCTS', 'var PRODUCTS').replace('const CATEGORIES', 'var CATEGORIES');
  require('vm').runInNewContext(modifiedContent, sandbox);
  const existingProducts = sandbox.PRODUCTS || [];
  
  // 2. Load new images
  const newFiles = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.mp4'));
  
  // Create unified array
  let allProducts = [];
  
  // Map existing products to the new format
  existingProducts.forEach(p => {
    allProducts.push({
      sku: p.sku || p.id || '',
      commercialName: p.name || '',
      storeName: p.name || '',
      description: p.description || '',
      minPrice: p.price || 0,
      maxPrice: p.priceOriginal || 0,
      stock: p.stock || 0,
      wholesale: p.priceWholesale || 0,
      imagePath: (p.images && p.images.length > 0) ? p.images[0] : '',
      colorFormat: ''
    });
  });
  
  // Map new products
  let counter = 100;
  newFiles.forEach(file => {
    try {
      fs.copyFileSync(imgDir + '\\' + file, targetImgDir + '\\' + file);
    } catch(e) {}
    
    allProducts.push({
      sku: 'SK-NEW-' + counter,
      commercialName: `منتج جديد ${counter}`,
      storeName: `منتج جديد ${counter}`,
      description: '',
      minPrice: 0,
      maxPrice: 0,
      stock: 0,
      wholesale: 0,
      imagePath: 'images/' + file,
      colorFormat: ''
    });
    counter++;
  });
  
  // 3. Generate CSV with Arabic Headers
  const BOM = '\uFEFF';
  const headers = [
    'كود المنتج',
    'اسم المنتج التجاري',
    'اسم المنتج بالمتجر',
    'وصف المنتج',
    'أقل سعر مستهلك (ج.م)',
    'أعلى سعر مستهلك (ج.م)',
    'احطياطي مخزون',
    'سعر الجمله',
    'رابط الصورة المحلي',
    'تنسيق اللون في الشيت'
  ];
  
  let csv = BOM + headers.join(',') + '\n';
  
  allProducts.forEach(p => {
    const row = [
      `"${(p.sku + '').replace(/"/g, '""')}"`,
      `"${(p.commercialName + '').replace(/"/g, '""')}"`,
      `"${(p.storeName + '').replace(/"/g, '""')}"`,
      `"${(p.description + '').replace(/"/g, '""')}"`,
      p.minPrice,
      p.maxPrice,
      p.stock,
      p.wholesale,
      `"${(p.imagePath + '').replace(/"/g, '""')}"`,
      `"${(p.colorFormat + '').replace(/"/g, '""')}"`
    ];
    csv += row.join(',') + '\n';
  });
  
  fs.writeFileSync(csvFile, csv);
  console.log(`Successfully created CSV with ${allProducts.length} total products (Old + New).`);
  
} catch (e) {
  console.error("Error:", e);
}
