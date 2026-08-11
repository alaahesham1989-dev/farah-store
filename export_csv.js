const fs = require('fs');

try {
  const content = fs.readFileSync('js/data.js', 'utf8');
  
  const sandbox = { window: {} };
  const modifiedContent = content.replace('const PRODUCTS', 'var PRODUCTS').replace('const CATEGORIES', 'var CATEGORIES');
  require('vm').runInNewContext(modifiedContent, sandbox);
  const products = sandbox.PRODUCTS;
  
  if (!products || products.length === 0) {
    console.log("No products found.");
    process.exit(1);
  }
  
  const BOM = '\uFEFF';
  const headers = ['id', 'sku', 'name', 'category', 'description', 'price', 'priceOriginal', 'stock', 'badge', 'rating', 'sold'];
  
  let csv = BOM + headers.join(',') + '\n';
  
  products.forEach(p => {
    const row = [
      p.id || '',
      p.sku || '',
      `"${(p.name || '').replace(/"/g, '""')}"`,
      p.category || '',
      `"${(p.description || '').replace(/"/g, '""')}"`,
      p.price || 0,
      p.priceOriginal || 0,
      p.stock || 0,
      p.badge || '',
      p.rating || 0,
      p.sold || 0
    ];
    csv += row.join(',') + '\n';
  });
  
  fs.writeFileSync('products_data.csv', csv);
  console.log("Successfully created products_data.csv");
  
} catch (e) {
  console.error("Error:", e);
}
