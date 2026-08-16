const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

// Load service account key
const keyPath = path.join(__dirname, '..', 'firebase_key.json');
if (!fs.existsSync(keyPath)) {
  console.error(`Firebase key not found at: ${keyPath}`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(require(keyPath))
});

const db = admin.firestore();
const artifactDir = 'C:\\Users\\FOX\\.gemini\\antigravity\\brain\\017fecd0-b6c0-4ec5-9bef-cd4838a3b475';
const reportPath = path.join(artifactDir, 'product_inspection_report.md');

async function runInspection() {
  console.log('Fetching products from Firestore...');
  const snapshot = await db.collection('products').get();
  console.log(`Fetched ${snapshot.size} products.`);

  const products = [];
  snapshot.forEach(doc => {
    products.push({ id: doc.id, ...doc.data() });
  });

  let stats = {
    total: products.length,
    hasMarketing: 0,
    hasDescObject: 0,
    hasDescString: 0,
    hasConflict: 0
  };

  const reportEntries = [];
  const conflictEntries = [];

  for (const p of products) {
    const hasMarketing = p.marketing && typeof p.marketing === 'object' && Object.keys(p.marketing).length > 0;
    const isDescObject = p.description && typeof p.description === 'object';
    const isDescString = p.description && typeof p.description === 'string';

    if (hasMarketing) stats.hasMarketing++;
    if (isDescObject) stats.hasDescObject++;
    if (isDescString) stats.hasDescString++;

    const isConflict = hasMarketing && isDescObject;
    if (isConflict) {
      stats.hasConflict++;
    }

    let statusLabel = '';
    if (isConflict) {
      statusLabel = '🔴 تعارض (يوجد محتوى تسويقي ووصف كائن معاً)';
    } else if (hasMarketing) {
      statusLabel = '🟢 محتوى تسويقي فقط (Excel الأصلي)';
    } else if (isDescObject) {
      statusLabel = '🔵 وصف كائن فقط (تعديل لوحة التحكم)';
    } else if (isDescString) {
      statusLabel = '🟡 وصف نصي فقط (قاعدة بيانات قديمة)';
    } else {
      statusLabel = '⚪ بدون أي محتوى وصفي';
    }

    reportEntries.push(`| ${p.id} | ${p.name || 'بدون اسم'} | ${statusLabel} |`);

    if (isConflict) {
      conflictEntries.push(`
### المنتج: ${p.name} (ID: ${p.id})

| الحقل | المحتوى التسويقي الأصلي (marketing) | المحتوى المعدل يدوياً (description) |
| :--- | :--- | :--- |
| **دواعي الاستخدام / الفوائد** | ${p.marketing.uses || '*فارغ*'} | ${p.description.indications || '*فارغ*'} |
| **المشاكل التي يحلها** | ${p.marketing.problemsSolved || '*فارغ*'} | ${p.description.problemsSolved || '*فارغ*'} |
| **كيف يعمل / نظرة عامة** | ${p.marketing.howItWorks || '*فارغ*'} | ${p.description.overview || '*فارغ*'} |
| **طريقة الاستخدام** | ${p.marketing.howToUse || '*فارغ*'} | ${p.description.howToUse || '*فارغ*'} |
| **الهوك التسويقي / النص البديل** | ${p.marketing.landingPageScript || '*فارغ*'} | *غير مدعوم في الكائن اليدوي* |
`);
    }
  }

  // Generate Markdown report
  const markdown = `# تقرير فحص ومطابقة بيانات المنتجات (فرح ستور)

> [!IMPORTANT]
> تم إجراء هذا الفحص تلقائياً للتحقق من سلامة وتطابق البيانات قبل القيام بأي عملية ترحيل أو تدمير للبيانات في Firestore.

## ملخص الإحصائيات

* **إجمالي المنتجات:** ${stats.total}
* **منتجات تحتوي على محتوى تسويقي أصلي (Excel):** ${stats.hasMarketing}
* **منتجات تحتوي على وصف كائن (معدل يدوياً):** ${stats.hasDescObject}
* **منتجات تحتوي على وصف نصي بسيط (قديم):** ${stats.hasDescString}
* **حالات التعارض المكتشفة (وجود المصدرين معاً):** ${stats.hasConflict}

---

## المنتجات التي تعاني من تعارض (🔴)
*يرجى مراجعة قيم الحقول أدناه لتحديد أيهما أصح وأحدث:*
${conflictEntries.length > 0 ? conflictEntries.join('\n') : '*لا توجد تعارضات نشطة حالياً.*'}

---

## جدول حالة كافة المنتجات

| معرف المنتج (ID) | اسم المنتج | الحالة الحالية للمحتوى |
| :--- | :--- | :--- |
${reportEntries.join('\n')}
`;

  fs.writeFileSync(reportPath, markdown, 'utf8');
  console.log(`Report successfully written to ${reportPath}`);
  console.log('Stats:', JSON.stringify(stats));
}

runInspection().catch(console.error);
