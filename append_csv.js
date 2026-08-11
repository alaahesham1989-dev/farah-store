const fs = require('fs');

const imgDir = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\new_images';
const csvFile = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\farah-store\\products_data.csv';
const targetImgDir = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\farah-store\\images';

const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.mp4'));

let newRows = '';
let counter = 100;

files.forEach(file => {
  // Copy media to project folder
  try {
    fs.copyFileSync(imgDir + '\\' + file, targetImgDir + '\\' + file);
  } catch(e) {}

  const id = 'sk-new-' + counter;
  const sku = 'SK-NEW-' + counter;
  const imagePath = 'images/' + file;
  
  const row = [
    id,
    sku,
    `"منتج جديد ${counter}"`, 
    'other', 
    `"وصف المنتج..."`, 
    0, 
    0, 
    0, 
    `""`, 
    0, 
    0, 
    `"${imagePath}"` // Note: image column is at the end based on my previous export script
  ];
  
  newRows += row.join(',') + '\n';
  counter++;
});

fs.appendFileSync(csvFile, newRows);
console.log(`Appended ${files.length} items and copied media!`);
