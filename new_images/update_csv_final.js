const fs = require('fs');
const path = require('path');

const imgDir = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\new_images';
const csvFile = 'C:\\Users\\FOX\\Desktop\\فرح لستور\\new_images\\products_analysis.csv';

try {
  // Read existing CSV
  const csvContent = fs.readFileSync(csvFile, 'utf8').trim().split('\n');
  const headers = csvContent[0];
  
  // Get all existing codes from CSV (first column)
  const existingCodes = new Set();
  for (let i = 1; i < csvContent.length; i++) {
    const columns = csvContent[i].split('","');
    if (columns.length > 0) {
      let code = columns[0].replace('"', '');
      existingCodes.add(code);
    }
  }
  
  // Read all images in directory
  const files = fs.readdirSync(imgDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.mp4'));
  
  let newRows = '';
  let addedCount = 0;
  
  files.forEach(file => {
    // The new code is the filename without extension
    let baseCode = path.parse(file).name;
    
    // Check if this image code already exists in the CSV
    if (!existingCodes.has(baseCode)) {
      // It's a missing image! We need to add it with placeholder data
      
      const row = [
        `"${baseCode}"`,
        `"منتج العناية المميز (مضاف تلقائياً)"`, // اسم المنتج التجاري
        `"منتج جديد مميز"`, // اسم المنتج بالمتجر
        `"منتج رائع للعناية الشخصية، يوفر لك تجربة فريدة للحصول على أفضل النتائج."`, // وصف المنتج
        200, // أقل سعر 
        400, // أعلى سعر
        `"file:///C:/Users/FOX/Desktop/فرح%20لستور/new_images/${file}"`, // رابط الصورة
        `""` // تنسيق اللون
      ];
      
      newRows += '\n' + row.join(',');
      addedCount++;
    }
  });
  
  if (addedCount > 0) {
    fs.appendFileSync(csvFile, newRows);
    console.log(`Successfully added ${addedCount} missing images to the CSV.`);
  } else {
    console.log(`No missing images found. All are already in the CSV.`);
  }
  
} catch (e) {
  console.error("Error:", e);
}
