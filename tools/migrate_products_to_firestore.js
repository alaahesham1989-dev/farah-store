const fs = require('fs');
const path = require('path');

function extractProductsArray(jsContent) {
  const marker = 'const PRODUCTS =';
  const idx = jsContent.indexOf(marker);
  if (idx === -1) throw new Error('PRODUCTS marker not found');
  const start = jsContent.indexOf('[', idx);
  if (start === -1) throw new Error('Products array start not found');

  let i = start;
  let depth = 0;
  let inString = false;
  let stringChar = null;
  let escape = false;

  while (i < jsContent.length) {
    const ch = jsContent[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === stringChar) inString = false;
    } else {
      if (ch === '"' || ch === "'") {
        inString = true; stringChar = ch;
      } else if (ch === '[') depth++;
      else if (ch === ']') {
        depth--;
        if (depth === 0) {
          const arrText = jsContent.slice(start, i + 1);
          return arrText;
        }
      }
    }
    i++;
  }
  throw new Error('Could not extract PRODUCTS array');
}

async function main() {
  try {
    const dataPath = path.resolve(__dirname, '..', 'js', 'data.js');
    const keyPath = path.resolve(__dirname, '..', '..', 'firebase_key.json');

    if (!fs.existsSync(dataPath)) {
      console.error('data.js not found at', dataPath);
      process.exit(2);
    }
    if (!fs.existsSync(keyPath)) {
      console.error('firebase_key.json not found at', keyPath);
      process.exit(2);
    }

    const js = fs.readFileSync(dataPath, 'utf8');
    const arrText = extractProductsArray(js);

    // Parse JSON — data.js uses double quotes and valid JSON for PRODUCTS
    const products = JSON.parse(arrText);
    console.log('Parsed products count:', products.length);

    // Normalize images field: ensure each product has `images` as array of strings
    function normalizeImagesField(prod) {
      const splitter = /[,;|]+/;
      if (!prod) return prod;
      if (Array.isArray(prod.images)) {
        prod.images = prod.images.map(x => (typeof x === 'string' ? x.trim() : x)).filter(Boolean);
        return prod;
      }
      // some exports might use `image` or a single string
      if (typeof prod.images === 'string' && prod.images.trim()) {
        prod.images = prod.images.split(splitter).map(s => s.trim()).filter(Boolean);
        return prod;
      }
      if (typeof prod.image === 'string' && prod.image.trim()) {
        prod.images = prod.image.split(splitter).map(s => s.trim()).filter(Boolean);
        return prod;
      }
      // default to empty array
      prod.images = Array.isArray(prod.images) ? prod.images : [];
      return prod;
    }

    // Initialize Firebase Admin
    const admin = require('firebase-admin');
    const serviceAccount = require(keyPath);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    const db = admin.firestore();

    // Batch write (max 500 per batch)
    let batch = db.batch();
    let opCount = 0;
    for (let i = 0; i < products.length; i++) {
      let p = products[i];
      p = normalizeImagesField(p);
      const ref = db.collection('products').doc(p.id);
      batch.set(ref, p);
      opCount++;
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

    console.log('Migration completed successfully. Uploaded', products.length, 'documents to collection "products"');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

main();
