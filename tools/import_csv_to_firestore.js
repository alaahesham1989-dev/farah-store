const fs = require('fs');
const path = require('path');

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const headerLine = lines[0];
  const splitter = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/; // split on commas not inside quotes
  const headers = headerLine.split(splitter).map(h => h.replace(/^"|"$/g, '').trim());
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(splitter).map(c => c.replace(/^"|"$/g, '').trim());
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
    rows.push(obj);
  }
  return rows;
}

function detectImagesField(headers) {
  const candidates = ['images', 'روابط صور إضافية', 'رابط الصورة الرئيسية', 'image', 'صور', 'images_urls', 'images_urls'];
  for (const c of candidates) {
    for (const h of headers) {
      if (h.toLowerCase().includes(c.toLowerCase())) return h;
    }
  }
  return null;
}

function splitImagesField(fieldValue) {
  if (!fieldValue) return [];
  // allow comma, semicolon, pipe separators
  return fieldValue.split(/[,;|]+/).map(s => s.trim()).filter(Boolean);
}

async function main() {
  try {
    const csvPathArg = process.argv[2] || path.resolve(__dirname, '..', 'products_data.csv');
    const keyPath = path.resolve(__dirname, '..', '..', 'firebase_key.json');

    if (!fs.existsSync(csvPathArg)) {
      console.error('CSV file not found:', csvPathArg);
      process.exit(2);
    }
    if (!fs.existsSync(keyPath)) {
      console.error('firebase_key.json not found at', keyPath);
      process.exit(2);
    }

    const csv = fs.readFileSync(csvPathArg, 'utf8');
    const rows = parseCSV(csv);
    if (!rows.length) {
      console.error('No rows parsed from CSV');
      process.exit(2);
    }

    const headers = Object.keys(rows[0]);
    const imagesField = detectImagesField(headers) || headers.find(h => /image/i.test(h)) || headers[6] || null;
    console.log('Detected images column:', imagesField);

    const admin = require('firebase-admin');
    const serviceAccount = require(keyPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    const db = admin.firestore();

    let batch = db.batch();
    let opCount = 0;
    let uploaded = 0;

    for (const row of rows) {
      // best-effort mapping: look for id/sku columns
      const id = row['id'] || row['كود المنتج'] || row['SKU'] || row['sku'] || row['code'] || (row[Object.keys(row)[0]] || '').toString();
      if (!id) continue;
      const product = { id: id.toString() };
      product.sku = row['sku'] || row['SKU'] || row['كود المنتج'] || '';
      product.name = row['name'] || row['اسم المنتج بالمتجر'] || row['اسم المنتج التجاري'] || '';
      product.category = row['category'] || row['الفئة'] || '';
      product.price = Number(row['price'] || row['سعر البيع'] || row['أقل سعر مستهلك (ج.م)'] || 0) || 0;
      product.stock = Number(row['stock'] || row['الكمية المتاحة'] || 0) || 0;

      // images
      if (imagesField && row[imagesField]) {
        product.images = splitImagesField(row[imagesField]);
      } else if (row['image']) {
        product.images = splitImagesField(row['image']);
      } else {
        product.images = [];
      }

      const ref = db.collection('products').doc(product.id);
      batch.set(ref, product);
      opCount++;
      uploaded++;
      if (opCount >= 450) {
        await batch.commit();
        console.log('Committed batch of', opCount);
        batch = db.batch();
        opCount = 0;
      }
    }
    if (opCount > 0) {
      await batch.commit();
      console.log('Committed final batch of', opCount);
    }
    console.log('Imported', uploaded, 'products from CSV to Firestore');
    process.exit(0);
  } catch (err) {
    console.error('Import failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
