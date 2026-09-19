const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'js', 'data.js');
const backupPath = path.join(__dirname, '..', 'js', 'data_backup.js');

const backupContent = fs.readFileSync(backupPath, 'utf8');

// Extract PRODUCTS array block from data_backup.js
const startIndex = backupContent.indexOf('const PRODUCTS = [');
const endIndex = backupContent.indexOf('// ─── ORDERS SCHEMA');

if (startIndex === -1 || endIndex === -1) {
  console.error('Could not locate PRODUCTS array range');
  process.exit(1);
}

let productsArrayStr = backupContent.substring(startIndex + 'const PRODUCTS = '.length, endIndex).trim();

// Ensure it ends with semicolon
if (productsArrayStr.endsWith(',')) {
  productsArrayStr = productsArrayStr.slice(0, -1);
}

// Normalize image paths (replace ../images with images)
productsArrayStr = productsArrayStr.replace(/\.\.\/images\//g, 'images/');

let dataContent = fs.readFileSync(dataPath, 'utf8');

// Replace empty const PRODUCTS = []; with full array
dataContent = dataContent.replace('const PRODUCTS = [];', `const PRODUCTS = ${productsArrayStr}`);

// Update applyFirestoreProducts to only overwrite if Firestore returns > 0 items
const oldApply = `function applyFirestoreProducts(products) {
  if (!Array.isArray(products)) return;
  PRODUCTS.splice(0, PRODUCTS.length, ...products);
  dispatchProductsUpdated();
}`;

const newApply = `function applyFirestoreProducts(products) {
  if (!Array.isArray(products) || products.length === 0) return;
  PRODUCTS.splice(0, PRODUCTS.length, ...products);
  dispatchProductsUpdated();
}`;

dataContent = dataContent.replace(oldApply, newApply);

// Ensure productsReady resolves with initial fallback products immediately
if (!dataContent.includes('// Resolve immediately with built-in products')) {
  dataContent = dataContent.replace(
    `initProductsRealtime();`,
    `// Resolve immediately with built-in products so UI renders without waiting
productsReadyResolve(PRODUCTS);
dispatchProductsUpdated();

initProductsRealtime();`
  );
}

fs.writeFileSync(dataPath, dataContent, 'utf8');
console.log('Successfully restored fallback products into js/data.js!');
