/**
 * فرح استور — Data Layer
 * ================================================
 * هيكل البيانات مصمم يستحمل التوسع من أول يوم:
 *   products/  → المنتجات
 *   orders/    → الطلبات
 *   sellers/   → فاضية دلوقتي، جاهزة للأفلييت
 * ================================================
 */

'use strict';

// ─── SCHEMA VERSION ───────────────────────────────
const DB_VERSION = '2.0.0'; // فرح استور

// ─── CATEGORIES ───────────────────────────────────
const CATEGORIES = [
  { id: 'العناية بالجسم', name: 'العناية بالجسم', icon: '💆', count: 0 },
  { id: 'العناية بالبشرة', name: 'العناية بالبشرة', icon: '✨', count: 0 },
  { id: 'العناية بالأسنان', name: 'العناية بالأسنان', icon: '🦷', count: 0 },
  { id: 'العناية الشخصية', name: 'العناية الشخصية', icon: '🚿', count: 0 },
  { id: 'العناية بالشعر', name: 'العناية بالشعر', icon: '💇‍♀️', count: 0 },
  { id: 'العناية الشخصية للرجال', name: 'العناية الشخصية للرجال', icon: '🧔', count: 0 },
  { id: 'العناية الشخصية للنساء', name: 'العناية الشخصية للنساء', icon: '👩', count: 0 },
  { id: 'إلكترونيات وإكسسوارات', name: 'إلكترونيات وإكسسوارات', icon: '📱', count: 0 },
  { id: 'أدوات منزلية', name: 'أدوات منزلية', icon: '🏠', count: 0 }
];

// ─── PRODUCTS ─────────────────────────────────────
// كل منتج فيه: سعر جملة (خاص)، سعر بيع (عام)، هامش ربح، فئة، صور
const PRODUCTS = [
  {
    "id": "code0025",
    "name": "بدال تمارين رياضي",
    "nameEn": "بدال تمارين رياضي",
    "price": 850.0,
    "priceOriginal": 1000.0,
    "priceWholesale": 650.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تدريب رياضي للذراعين والقدمين قابل للطي مع شاشة ديجيتال..</li><li><strong>التفاصيل:</strong> جهاز تدريب رياضي للذراعين والقدمين قابل للطي مع شاشة ديجيتال، مثالي لعمل جلسات علاج طبيعي وتنشيط الدورة الدموية.</li></ul>",
    "mainImg": "../images/products/5778280195398765958.jpg",
    "images": [
      "../images/products/5778280195398765958.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0026",
    "name": "جهاز بخار الوجه المنزلي",
    "nameEn": "جهاز بخار الوجه المنزلي",
    "price": 950.0,
    "priceOriginal": 1300.0,
    "priceWholesale": 900.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز بخار الوجه الأيوني HG-606..</li><li><strong>التفاصيل:</strong> جهاز بخار الوجه الأيوني HG-606، يفتح المسام وينظف البشرة بعمق ويمنحك ترطيباً مثالياً لبشرة أكثر نضارة وإشراقاً.</li></ul>",
    "mainImg": "../images/products/5881709725215297373.jpg",
    "images": [
      "../images/products/5881709725215297373.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "غير متوفر",
    "name": "جهاز العناية بالبشرة 9 في 1",
    "nameEn": "جهاز العناية بالبشرة 9 في 1",
    "price": 0,
    "priceOriginal": 0,
    "priceWholesale": 0.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز متكامل للعناية بالبشرة وتنظيفها العميق..</li><li><strong>التفاصيل:</strong> جهاز متكامل للعناية بالبشرة وتنظيفها العميق، يجمع 9 وظائف في جهاز واحد للحصول على بشرة نضرة ومشرقة.</li></ul>",
    "mainImg": "../images/products/5881709725215297376.jpg",
    "images": [
      "../images/products/5881709725215297376.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0001",
    "name": "ديرما بن Dr. Pen Ultima A1",
    "nameEn": "ديرما بن Dr. Pen Ultima A1",
    "price": 1200.0,
    "priceOriginal": 1500.0,
    "priceWholesale": 1000.0,
    "category": "العناية بالبشرة",
    "description": {
      "overview": "قلم ديرما بن احترافي لتجديد خلايا البشرة وتحفيز الكولاجين الطبيعي بالجلد لنتائج فورية وفعالة.",
      "indications": "مناسب لعلاج آثار حب الشباب، التجاعيد الخفيفة، التصبغات، المسام الواسعة، وبهتان البشرة.",
      "howToUse": "1. عقم الجهاز والإبر جيداً بكحول طبي.<br>2. نظف بشرتك وضعي سيروم الهيالورونيك.<br>3. مرر الجهاز بلطف بشكل عمودي وأفقي.<br>4. تجنب التعرض للشمس لمدة 24 ساعة.",
      "problemsSolved": "يعالج المسام الواسعة، الندبات، التصبغات، ويشد البشرة ليعيد إليها نضارتها وحيويتها."
    },
    "mainImg": "../images/products/5881709725215297378.jpg",
    "images": [
      "../images/products/5881709725215297378.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0002",
    "name": "ديرما بن Dr. Pen Ultima A6",
    "nameEn": "ديرما بن Dr. Pen Ultima A6",
    "price": 2000.0,
    "priceOriginal": 2500.0,
    "priceWholesale": 1600.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز ديرما بن لاسلكي متطور للعناية بالبشرة..</li><li><strong>التفاصيل:</strong> جهاز ديرما بن لاسلكي متطور للعناية بالبشرة، يساعد على تقليل التجاعيد والندبات لتبدو بشرتك أكثر شباباً.</li></ul>",
    "mainImg": "../images/products/5881709725215297379.jpg",
    "images": [
      "../images/products/5881709725215297379.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0003",
    "name": "جهاز تنظيف الأسنان الكهربائي",
    "nameEn": "جهاز تنظيف الأسنان الكهربائي",
    "price": 550.0,
    "priceOriginal": 675.0,
    "priceWholesale": 380.0,
    "category": "العناية بالأسنان",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> منظف أسنان كهربائي متطور يزيل الجير والتصبغات بفعالية بـ 31000 اهتزازة في الدقيقة..</li><li><strong>التفاصيل:</strong> منظف أسنان كهربائي متطور يزيل الجير والتصبغات بفعالية بـ 31000 اهتزازة في الدقيقة، لابتسامة ناصعة البياض.</li></ul>",
    "mainImg": "../images/products/5881709725215297384.jpg",
    "images": [
      "../images/products/5881709725215297384.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0027",
    "name": "نظارات الرؤية الليلية والنهارية",
    "nameEn": "نظارات الرؤية الليلية والنهارية",
    "price": 90.0,
    "priceOriginal": 120.0,
    "priceWholesale": 60.0,
    "category": "العناية الشخصية",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> نظارات HD Vision عالية الوضوح للقيادة..</li><li><strong>التفاصيل:</strong> نظارات HD Vision عالية الوضوح للقيادة، تقلل التوهج وتوضح الرؤية بشكل مثالي، يمكن ارتداؤها فوق النظارات الطبية.</li></ul>",
    "mainImg": "../images/products/5881709725215297387.jpg",
    "images": [
      "../images/products/5881709725215297387.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0004",
    "name": "ديرما رولر ZGTS",
    "nameEn": "ديرما رولر ZGTS",
    "price": 150.0,
    "priceOriginal": 180.0,
    "priceWholesale": 90.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> أداة ديرما رولر باللون الذهبي لتحفيز الكولاجين وتجديد شباب البشرة بفعالية وأمان في المنزل...</li><li><strong>التفاصيل:</strong> أداة ديرما رولر باللون الذهبي لتحفيز الكولاجين وتجديد شباب البشرة بفعالية وأمان في المنزل.</li></ul>",
    "mainImg": "../images/products/5881709725215297388.jpg",
    "images": [
      "../images/products/5881709725215297388.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "غير متوفر",
    "name": "جهاز شفط الرؤوس السوداء وتنظيف البشرة",
    "nameEn": "جهاز شفط الرؤوس السوداء وتنظيف البشرة",
    "price": 0,
    "priceOriginal": 0,
    "priceWholesale": 0.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تنظيف البشرة العميق وإزالة الشوائب بتقنية تدفق الماء..</li><li><strong>التفاصيل:</strong> جهاز تنظيف البشرة العميق وإزالة الشوائب بتقنية تدفق الماء، لبشرة نقية وصافية.</li></ul>",
    "mainImg": "../images/products/5881709725215297389.jpg",
    "images": [
      "../images/products/5881709725215297389.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0005",
    "name": "جهاز إزالة الرؤوس السوداء المائي",
    "nameEn": "جهاز إزالة الرؤوس السوداء المائي",
    "price": 500.0,
    "priceOriginal": 700.0,
    "priceWholesale": 250.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تنظيف مسام البشرة وإزالة الرؤوس السوداء بتقنية الشفط المائي..</li><li><strong>التفاصيل:</strong> جهاز تنظيف مسام البشرة وإزالة الرؤوس السوداء بتقنية الشفط المائي، يأتي مع رؤوس متعددة تناسب جميع أنواع البشرة.</li></ul>",
    "mainImg": "../images/products/5881709725215297389 (1).jpg",
    "images": [
      "../images/products/5881709725215297389 (1).jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0006",
    "name": "جهاز التردد العالي المحمول",
    "nameEn": "جهاز التردد العالي المحمول",
    "price": 650.0,
    "priceOriginal": 800.0,
    "priceWholesale": 480.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز العناية بالبشرة بتقنية التردد العالي..</li><li><strong>التفاصيل:</strong> جهاز العناية بالبشرة بتقنية التردد العالي، يعالج حب الشباب ويحفز الدورة الدموية لتعزيز صحة ونضارة بشرتك.</li></ul>",
    "mainImg": "../images/products/5881709725215297390.jpg",
    "images": [
      "../images/products/5881709725215297390.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0028",
    "name": "جهاز الخيط المائي لتنظيف الأسنان",
    "nameEn": "جهاز الخيط المائي لتنظيف الأسنان",
    "price": 500.0,
    "priceOriginal": 750.0,
    "priceWholesale": 330.0,
    "category": "العناية بالأسنان",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تنظيف الأسنان بالخيط المائي اللاسلكي..</li><li><strong>التفاصيل:</strong> جهاز تنظيف الأسنان بالخيط المائي اللاسلكي، يزيل بقايا الطعام والجير بفعالية للثة صحية وأسنان نظيفة مع 3 أوضاع تشغيل.</li></ul>",
    "mainImg": "../images/products/5881709725215297391.jpg",
    "images": [
      "../images/products/5881709725215297391.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0007",
    "name": "جهاز تقليل التجاعيد بالنبضات الضوئية",
    "nameEn": "جهاز تقليل التجاعيد بالنبضات الضوئية",
    "price": 450.0,
    "priceOriginal": 550.0,
    "priceWholesale": 220.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز لتدليك وشد الوجه والرقبة..</li><li><strong>التفاصيل:</strong> جهاز لتدليك وشد الوجه والرقبة، يعمل بتقنية النبضات الضوئية لتقليل التجاعيد واستعادة شباب البشرة.</li></ul>",
    "mainImg": "../images/products/5881709725215297392.jpg",
    "images": [
      "../images/products/5881709725215297392.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0008",
    "name": "طقم كاسات حجامة سيليكون",
    "nameEn": "طقم كاسات حجامة سيليكون",
    "price": 400.0,
    "priceOriginal": 500.0,
    "priceWholesale": 290.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> مجموعة كاسات حجامة سيليكون مرنة باللون الأزرق..</li><li><strong>التفاصيل:</strong> مجموعة كاسات حجامة سيليكون مرنة باللون الأزرق، تستخدم للتدليك وتنشيط الدورة الدموية وتخفيف آلام العضلات.</li></ul>",
    "mainImg": "../images/products/5881709725215297393.jpg",
    "images": [
      "../images/products/5881709725215297393.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0009",
    "name": "فرشاة تصفيف الشعر جوي",
    "nameEn": "فرشاة تصفيف الشعر جوي",
    "price": 1000.0,
    "priceOriginal": 1200.0,
    "priceWholesale": 900.0,
    "category": "العناية بالشعر",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> مجفف ومصفف شعر احترافي 2 في 1 من جوي..</li><li><strong>التفاصيل:</strong> مجفف ومصفف شعر احترافي 2 في 1 من جوي، يمنحك شعراً ناعماً وكثيفاً في وقت قياسي وبكل سهولة.</li></ul>",
    "mainImg": "../images/products/5881709725215297395.jpg",
    "images": [
      "../images/products/5881709725215297395.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": true,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0010",
    "name": "ماكينة حلاقة الشعر كيمي KM-099",
    "nameEn": "ماكينة حلاقة الشعر كيمي KM-099",
    "price": 0,
    "priceOriginal": 0,
    "priceWholesale": 130.0,
    "category": "العناية الشخصية للرجال",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> ماكينة حلاقة وتشذيب الشعر الاحترافية من كيمي..</li><li><strong>التفاصيل:</strong> ماكينة حلاقة وتشذيب الشعر الاحترافية من كيمي، بتصميم أنيق ومحرك قوي لنتائج دقيقة وحلاقة مريحة.</li></ul>",
    "mainImg": "../images/products/5881709725215297418.jpg",
    "images": [
      "../images/products/5881709725215297418.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0011",
    "name": "جهاز بخار نانو للعناية بالشعر",
    "nameEn": "جهاز بخار نانو للعناية بالشعر",
    "price": 1050.0,
    "priceOriginal": 1450.0,
    "priceWholesale": 750.0,
    "category": "العناية الشخصية",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> مسدس رش بخار النانو لمعالجة الشعر وترطيبه بعمق..</li><li><strong>التفاصيل:</strong> مسدس رش بخار النانو لمعالجة الشعر وترطيبه بعمق، يساعد في تعزيز امتصاص منتجات العناية بالشعر.</li></ul>",
    "mainImg": "../images/products/5881709725215297425.jpg",
    "images": [
      "../images/products/5881709725215297425.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0012",
    "name": "ديرما بن دكتور بن ألتيما M5-W",
    "nameEn": "ديرما بن دكتور بن ألتيما M5-W",
    "price": 1300.0,
    "priceOriginal": 1680.0,
    "priceWholesale": 1000.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز ديرما بن اللاسلكي الأنيق باللون الذهبي الوردي..</li><li><strong>التفاصيل:</strong> جهاز ديرما بن اللاسلكي الأنيق باللون الذهبي الوردي، مثالي لتحسين ملمس البشرة وعلاج عيوبها.</li></ul>",
    "mainImg": "../images/products/5881709725215297432.jpg",
    "images": [
      "../images/products/5881709725215297432.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0013",
    "name": "جهاز تجعيد الشعر التلقائي",
    "nameEn": "جهاز تجعيد الشعر التلقائي",
    "price": 1000.0,
    "priceOriginal": 2000.0,
    "priceWholesale": 550.0,
    "category": "العناية بالشعر",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تجعيد الشعر الأوتوماتيكي للحصول على تموجات رائعة ومثالية بسهولة وأمان في ثوانٍ معدودة...</li><li><strong>التفاصيل:</strong> جهاز تجعيد الشعر الأوتوماتيكي للحصول على تموجات رائعة ومثالية بسهولة وأمان في ثوانٍ معدودة.</li></ul>",
    "mainImg": "../images/products/5881709725215297436.jpg",
    "images": [
      "../images/products/5881709725215297436.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0014",
    "name": "جهاز إزالة شعر الوجه DSP",
    "nameEn": "جهاز إزالة شعر الوجه DSP",
    "price": 350.0,
    "priceOriginal": 400.0,
    "priceWholesale": 240.0,
    "category": "العناية الشخصية للنساء",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> مزيل شعر الوجه الصغير والأنيق من DSP..</li><li><strong>التفاصيل:</strong> مزيل شعر الوجه الصغير والأنيق من DSP، يزيل الشعر الزائد بلطف وبدون ألم لبشرة ناعمة خالية من العيوب.</li></ul>",
    "mainImg": "../images/products/5881709725215297437.jpg",
    "images": [
      "../images/products/5881709725215297437.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0015",
    "name": "كاسات مساج سيليكون للجسم",
    "nameEn": "كاسات مساج سيليكون للجسم",
    "price": 400.0,
    "priceOriginal": 500.0,
    "priceWholesale": 200.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> مجموعة كاسات تدليك سيليكون فعالة في محاربة السيلوليت وشد ترهلات الجسم للحصول على قوام متناسق...</li><li><strong>التفاصيل:</strong> مجموعة كاسات تدليك سيليكون فعالة في محاربة السيلوليت وشد ترهلات الجسم للحصول على قوام متناسق.</li></ul>",
    "mainImg": "../images/products/5881709725215297447.jpg",
    "images": [
      "../images/products/5881709725215297447.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0016",
    "name": "ماكينة حلاقة وتشذيب كيمي KM-1910",
    "nameEn": "ماكينة حلاقة وتشذيب كيمي KM-1910",
    "price": 0,
    "priceOriginal": 0,
    "priceWholesale": 390.0,
    "category": "العناية الشخصية للرجال",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> ماكينة حلاقة رجالية متعددة الاستخدامات لتشذيب اللحية والجسم..</li><li><strong>التفاصيل:</strong> ماكينة حلاقة رجالية متعددة الاستخدامات لتشذيب اللحية والجسم، تأتي مع أمشاط درجات مختلفة وتعمل شحناً بـ USB.</li></ul>",
    "mainImg": "../images/products/5881709725215297454.jpg",
    "images": [
      "../images/products/5881709725215297454.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0017",
    "name": "جهاز تقشير وتغذية البشرة مع كبسولات",
    "nameEn": "جهاز تقشير وتغذية البشرة مع كبسولات",
    "price": 6000.0,
    "priceOriginal": 7000.0,
    "priceWholesale": 2300.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز متطور لتقشير البشرة بالأكسجين وتغذيتها..</li><li><strong>التفاصيل:</strong> جهاز متطور لتقشير البشرة بالأكسجين وتغذيتها، يأتي مع كبسولات متنوعة لتلبية جميع احتياجات العناية بالبشرة.</li></ul>",
    "mainImg": "../images/products/5881709725215297455.jpg",
    "images": [
      "../images/products/5881709725215297455.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0018",
    "name": "جهاز بخار الوجه الاحترافي",
    "nameEn": "جهاز بخار الوجه الاحترافي",
    "price": 3000.0,
    "priceOriginal": 3450.0,
    "priceWholesale": 1900.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز بخار للوجه مزود بحامل يوفر بخاراً ساخناً وبارداً..</li><li><strong>التفاصيل:</strong> جهاز بخار للوجه مزود بحامل يوفر بخاراً ساخناً وبارداً، مثالي لتنظيف المسام وتجهيز البشرة للعناية في الصالونات أو المنزل.</li></ul>",
    "mainImg": "../images/products/5881709725215297458.jpg",
    "images": [
      "../images/products/5881709725215297458.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0019",
    "name": "جهاز فلاوليس لإزالة الشعر",
    "nameEn": "جهاز فلاوليس لإزالة الشعر",
    "price": 220.0,
    "priceOriginal": 250.0,
    "priceWholesale": 120.0,
    "category": "العناية الشخصية للنساء",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز إزالة الشعر الصغير والمحمول..</li><li><strong>التفاصيل:</strong> جهاز إزالة الشعر الصغير والمحمول، بتصميم يشبه أحمر الشفاه لإزالة شعر الوجه بلطف ودقة في أي وقت ومكان.</li></ul>",
    "mainImg": "../images/products/5881709725215297463.jpg",
    "images": [
      "../images/products/5881709725215297463.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0020",
    "name": "مجموعة إزالة الشعر 4 في 1 كيمي",
    "nameEn": "مجموعة إزالة الشعر 4 في 1 كيمي",
    "price": 450.0,
    "priceOriginal": 600.0,
    "priceWholesale": 240.0,
    "category": "العناية الشخصية للنساء",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> ماكينة إزالة الشعر النسائية المتكاملة 4 في 1..</li><li><strong>التفاصيل:</strong> ماكينة إزالة الشعر النسائية المتكاملة 4 في 1، تشمل رؤوساً متعددة للحلاقة وتشذيب الحواجب وإزالة شعر الأنف.</li></ul>",
    "mainImg": "../images/products/5881709725215297481.jpg",
    "images": [
      "../images/products/5881709725215297481.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0029",
    "name": "كشاف طوارئ متعدد الاستخدامات",
    "nameEn": "كشاف طوارئ متعدد الاستخدامات",
    "price": 600.0,
    "priceOriginal": 770.0,
    "priceWholesale": 450.0,
    "category": "إلكترونيات وإكسسوارات",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> كشاف طوارئ F-37 احترافي بقوة إضاءة عالية مع بطارية كبيرة..</li><li><strong>التفاصيل:</strong> كشاف طوارئ F-37 احترافي بقوة إضاءة عالية مع بطارية كبيرة، يحتوي على شفرة قاطع، صافرة إنذار، وشحن Type-C.</li></ul>",
    "mainImg": "../images/products/5881709725215297501.jpg",
    "images": [
      "../images/products/5881709725215297501.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0030",
    "name": "ولاعة قوسية قابلة للشحن",
    "nameEn": "ولاعة قوسية قابلة للشحن",
    "price": 0,
    "priceOriginal": 0,
    "priceWholesale": 0.0,
    "category": "أدوات منزلية",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> ولاعة الكترونية حديثة مقاومة للرياح تعمل بالشحن عن طريق USB..</li><li><strong>التفاصيل:</strong> ولاعة الكترونية حديثة مقاومة للرياح تعمل بالشحن عن طريق USB، آمنة ومناسبة للاستخدام المنزلي والرحلات.</li></ul>",
    "mainImg": "../images/products/5881709725215297502.jpg",
    "images": [
      "../images/products/5881709725215297502.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0031",
    "name": "طوق شد فقرات الرقبة 3 طبقات",
    "nameEn": "طوق شد فقرات الرقبة 3 طبقات",
    "price": 255.0,
    "priceOriginal": 340.0,
    "priceWholesale": 145.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز شد فقرات الرقبة القابل للنفخ يساعد على تخفيف آلام الرقبة وتصحيح الوضعية..</li><li><strong>التفاصيل:</strong> جهاز شد فقرات الرقبة القابل للنفخ يساعد على تخفيف آلام الرقبة وتصحيح الوضعية، تصميم مريح من 3 طبقات.</li></ul>",
    "mainImg": "../images/products/5881709725215297503.jpg",
    "images": [
      "../images/products/5881709725215297503.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0021",
    "name": "جهاز تدليك الصدر KL-2022",
    "nameEn": "جهاز تدليك الصدر KL-2022",
    "price": 700.0,
    "priceOriginal": 900.0,
    "priceWholesale": 450.0,
    "category": "العناية الشخصية",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> حمالة صدر لتدليك الصدر وتنشيط الدورة الدموية مزودة بخاصية التدفئة..</li><li><strong>التفاصيل:</strong> حمالة صدر لتدليك الصدر وتنشيط الدورة الدموية مزودة بخاصية التدفئة، لتوفير الراحة والعناية المتكاملة.</li></ul>",
    "mainImg": "../images/products/5897814783128440119.jpg",
    "images": [
      "../images/products/5897814783128440119.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0022",
    "name": "جهاز تنظيف البشرة بالفقاعات الدقيقة",
    "nameEn": "جهاز تنظيف البشرة بالفقاعات الدقيقة",
    "price": 430.0,
    "priceOriginal": 610.0,
    "priceWholesale": 230.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تنظيف وتقشير الوجه بالفقاعات المائية الدقيقة..</li><li><strong>التفاصيل:</strong> جهاز تنظيف وتقشير الوجه بالفقاعات المائية الدقيقة، يزيل الرؤوس السوداء ويمنح بشرتك ترطيباً ونظافة عميقة.</li></ul>",
    "mainImg": "../images/products/5897814783128440123.jpg",
    "images": [
      "../images/products/5897814783128440123.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0032",
    "name": "قناع الوجه الضوئي LED",
    "nameEn": "قناع الوجه الضوئي LED",
    "price": 1400.0,
    "priceOriginal": 2000.0,
    "priceWholesale": 900.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> قناع الجمال بتقنية إضاءة LED الملونة لعلاج مشاكل البشرة وتجديد الخلايا وتقليل التجاعيد..</li><li><strong>التفاصيل:</strong> قناع الجمال بتقنية إضاءة LED الملونة لعلاج مشاكل البشرة وتجديد الخلايا وتقليل التجاعيد، لبشرة أكثر نضارة.</li></ul>",
    "mainImg": "../images/products/5897814783128440127.jpg",
    "images": [
      "../images/products/5897814783128440127.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0023",
    "name": "حزام شد البطن لما بعد الولادة",
    "nameEn": "حزام شد البطن لما بعد الولادة",
    "price": 450.0,
    "priceOriginal": 550.0,
    "priceWholesale": 300.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> طقم أحزمة دعم وشد البطن لما بعد الولادة من 3 قطع..</li><li><strong>التفاصيل:</strong> طقم أحزمة دعم وشد البطن لما بعد الولادة من 3 قطع، يساعد في استعادة شكل الجسم ودعم عضلات البطن بفعالية.</li></ul>",
    "mainImg": "../images/products/5897814783128440129.jpg",
    "images": [
      "../images/products/5897814783128440129.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0024",
    "name": "جهاز تنظيف مسام الوجه متعدد الوظائف",
    "nameEn": "جهاز تنظيف مسام الوجه متعدد الوظائف",
    "price": 300.0,
    "priceOriginal": 380.0,
    "priceWholesale": 170.0,
    "category": "العناية بالبشرة",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز إزالة الرؤوس السوداء وشفط دهون البشرة HT-808..</li><li><strong>التفاصيل:</strong> جهاز إزالة الرؤوس السوداء وشفط دهون البشرة HT-808، يأتي مع رؤوس متعددة لتنظيف البشرة بعمق والحفاظ على نقائها.</li></ul>",
    "mainImg": "../images/products/5897814783128440130.jpg",
    "images": [
      "../images/products/5897814783128440130.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0033",
    "name": "مقبض تمارين اليد مع عداد",
    "nameEn": "مقبض تمارين اليد مع عداد",
    "price": 90.0,
    "priceOriginal": 140.0,
    "priceWholesale": 60.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> أداة تمرين قبضة اليد قابلة للتعديل ومزودة بعداد إلكتروني..</li><li><strong>التفاصيل:</strong> أداة تمرين قبضة اليد قابلة للتعديل ومزودة بعداد إلكتروني، مثالية لتقوية عضلات اليد والساعد.</li></ul>",
    "mainImg": "../images/products/5900094680618175469.jpg",
    "images": [
      "../images/products/5900094680618175469.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0034",
    "name": "مشط تدليك فروة الرأس",
    "nameEn": "مشط تدليك فروة الرأس",
    "price": 250.0,
    "priceOriginal": 300.0,
    "priceWholesale": 175.0,
    "category": "العناية الشخصية",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> مشط ذكي لتدليك فروة الرأس وتوزيع السوائل والعلاجات بتقنية النانو..</li><li><strong>التفاصيل:</strong> مشط ذكي لتدليك فروة الرأس وتوزيع السوائل والعلاجات بتقنية النانو، يحفز نمو الشعر ويقوي الجذور.</li></ul>",
    "mainImg": "../images/products/5938073942545337618.jpg",
    "images": [
      "../images/products/5938073942545337618.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0035",
    "name": "راديو ديجيتال JOC H799",
    "nameEn": "راديو ديجيتال JOC H799",
    "price": 300.0,
    "priceOriginal": 340.0,
    "priceWholesale": 225.0,
    "category": "إلكترونيات وإكسسوارات",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> راديو محمول مشغل ديجيتال مع إضاءة وبطارية تدوم طويلاً..</li><li><strong>التفاصيل:</strong> راديو محمول مشغل ديجيتال مع إضاءة وبطارية تدوم طويلاً، يدعم FM وصوت نقي وعالي الجودة.</li></ul>",
    "mainImg": "../images/products/5938073942545337648.jpg",
    "images": [
      "../images/products/5938073942545337648.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0036",
    "name": "راديو كلاسيكي 5 موجات",
    "nameEn": "راديو كلاسيكي 5 موجات",
    "price": 300.0,
    "priceOriginal": 350.0,
    "priceWholesale": 225.0,
    "category": "إلكترونيات وإكسسوارات",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> راديو كلاسيكي أنيق يدعم موجات FM/AM/SW بتصميم عصري وصوت واضح لجميع المحطات المفضلة...</li><li><strong>التفاصيل:</strong> راديو كلاسيكي أنيق يدعم موجات FM/AM/SW بتصميم عصري وصوت واضح لجميع المحطات المفضلة.</li></ul>",
    "mainImg": "../images/products/5938073942545337652.jpg",
    "images": [
      "../images/products/5938073942545337652.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0037",
    "name": "سخان فحم كهربائي",
    "nameEn": "سخان فحم كهربائي",
    "price": 300.0,
    "priceOriginal": 330.0,
    "priceWholesale": 190.0,
    "category": "أدوات منزلية",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> سخان وموقد فحم كهربائي سريع الاشتعال..</li><li><strong>التفاصيل:</strong> سخان وموقد فحم كهربائي سريع الاشتعال، آمن وعملي لتسخين الفحم للشيشة أو البخور في دقائق.</li></ul>",
    "mainImg": "../images/products/5938073942545337676.jpg",
    "images": [
      "../images/products/5938073942545337676.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0038",
    "name": "جهاز بديكير إلكتروني فلاوليس",
    "nameEn": "جهاز بديكير إلكتروني فلاوليس",
    "price": 140.0,
    "priceOriginal": 220.0,
    "priceWholesale": 85.0,
    "category": "العناية الشخصية للنساء",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> أداة العناية بالقدمين الكهربائية لإزالة الجلد الميت والتشققات بسهولة وأمان للحصول على أقدام ناعمة كالحرير...</li><li><strong>التفاصيل:</strong> أداة العناية بالقدمين الكهربائية لإزالة الجلد الميت والتشققات بسهولة وأمان للحصول على أقدام ناعمة كالحرير.</li></ul>",
    "mainImg": "../images/products/5938073942545337724.jpg",
    "images": [
      "../images/products/5938073942545337724.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  },
  {
    "id": "code0039",
    "name": "منفاخ هواء للسيارات ذكي",
    "nameEn": "منفاخ هواء للسيارات ذكي",
    "price": 1050.0,
    "priceOriginal": 1200.0,
    "priceWholesale": 850.0,
    "category": "إلكترونيات وإكسسوارات",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> كمبروسر هواء محمول للسيارات بقوة 350 واط وشاشة ديجيتال ذكية وفصل أوتوماتيكي مع كشاف طوارئ...</li><li><strong>التفاصيل:</strong> كمبروسر هواء محمول للسيارات بقوة 350 واط وشاشة ديجيتال ذكية وفصل أوتوماتيكي مع كشاف طوارئ.</li></ul>",
    "mainImg": "../images/products/5938073942545337747.jpg",
    "images": [
      "../images/products/5938073942545337747.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": true,
    "brand": "Farah Store"
  },
  {
    "id": "code0040",
    "name": "مسدس مساج كهربائي MAXTOP",
    "nameEn": "مسدس مساج كهربائي MAXTOP",
    "price": 600.0,
    "priceOriginal": 900.0,
    "priceWholesale": 350.0,
    "category": "العناية بالجسم",
    "description": "<ul class=\"product-features-list\" style=\"list-style:disc; padding-right:20px; line-height:1.8;\"><li><strong>نظرة عامة:</strong> جهاز تدليك قوي ولاسلكي بـ 6 سرعات ورؤوس متعددة..</li><li><strong>التفاصيل:</strong> جهاز تدليك قوي ولاسلكي بـ 6 سرعات ورؤوس متعددة، لتخفيف آلام العضلات والمفاصل باحترافية عالية.</li></ul>",
    "mainImg": "../images/products/5967608899336604470.jpg",
    "images": [
      "../images/products/5967608899336604470.jpg"
    ],
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "stock": 50,
    "isNew": false,
    "isFlash": false,
    "brand": "Farah Store"
  }
];

// ─── ORDERS SCHEMA ────────────────────────────────
// بيانات الطلبات — كل طلب منفصل عن المنتج
const ordersSchema = {
  id: 'string',           // ord_XXXXXXXXXXXX
  customerId: 'string',   // optional (زوار بدون حساب)
  customerName: 'string',
  customerPhone: 'string',
  address: 'object',      // { governorate, city, street, details }
  items: 'array',         // [{ productId, sku, name, price, qty, variantSelected }]
  subtotal: 'number',
  shipping: 'number',
  discount: 'number',
  total: 'number',
  paymentMethod: 'string', // 'cash_on_delivery' | 'paymob_card' | 'paymob_wallet'
  paymentStatus: 'string', // 'pending' | 'paid' | 'failed'
  status: 'string',        // 'new' | 'processing' | 'shipped' | 'delivered' | 'returned' | 'cancelled'
  trackingNumber: 'string',
  notes: 'string',
  createdAt: 'number',     // Timestamp
  updatedAt: 'number',     // Timestamp
};

// ─── SELLERS SCHEMA (جاهز للأفلييت — Phase 4) ────
// فاضية دلوقتي، لما يجي الوقت هنفعّلها
const sellersSchema = {
  id: 'string',             // sel_XXXXXXXXXXXX
  name: 'string',
  phone: 'string',
  email: 'string',
  nationalId: 'string',
  bankAccount: 'object',    // { bankName, accountNumber, accountName }
  commissionRate: 'number', // % من السعر الكامل
  referralCode: 'string',   // كود خاص بكل مسوق
  totalSales: 'number',
  totalEarnings: 'number',
  status: 'string',         // 'pending' | 'active' | 'suspended'
  joinedAt: 'datetime',
};

// ─── HELPERS ──────────────────────────────────────
/**
 * حساب سعر الشحن
 * دلوقتي: ثابت — ممكن يتطور لاحقاً بالمحافظة
 */
function calculateShipping(subtotal, governorate = '') {
  // Default fallback settings
  let settings = {
    freeShippingThreshold: 600,
    rates: {
      zone1: 85,
      zone2: 95,
      zone3: 110
    }
  };
  
  // Read dynamic settings from Storage (Firestore cache)
  if (window.FarahDB && FarahDB.Storage) {
    const saved = FarahDB.Storage.get('shipping_settings');
    if (saved) settings = saved;
  }
  
  // If subtotal is over threshold, shipping is free!
  if (subtotal >= settings.freeShippingThreshold) return 0;
  
  const gov = governorate.trim().toLowerCase();
  
  const zone1 = ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية', 'الغربية', 'البحيرة', 'المنوفية', 'الشرقية', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'السويس', 'الإسماعيلية', 'cairo', 'giza', 'alexandria'];
  const zone2 = ['الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر'];
  const zone3 = ['مطروح', 'الوادي الجديد', 'جنوب سيناء'];
  
  if (zone1.includes(gov)) return settings.rates.zone1;
  if (zone2.includes(gov)) return settings.rates.zone2;
  if (zone3.includes(gov)) return settings.rates.zone3;
  
  // Default to zone 1 if unknown
  return settings.rates.zone1;
}

/**
 * توليد ID للطلب
 */
function generateOrderId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${ts}-${rand}`;
}

/**
 * تنسيق السعر بالجنيه المصري
 */
function formatPrice(amount) {
  return `${amount.toLocaleString('ar-EG')} ج.م`;
}

/**
 * المنتجات المميزة (للصفحة الرئيسية)
 */
function getFeaturedProducts() {
  return PRODUCTS.filter(p => p.featured && p.stock > 0);
}

/**
 * بحث في المنتجات
 */
function searchProducts(query) {
  const q = query.trim().toLowerCase();
  if (!q) return PRODUCTS;
  return PRODUCTS.filter(p =>
    p.name.includes(q) ||
    (p.nameEn && p.nameEn.toLowerCase().includes(q)) ||
    (p.description && p.description.includes(q))
  );
}

/**
 * تصفية بالفئة
 */
function getProductsByCategory(categoryId) {
  if (categoryId === 'all') return PRODUCTS;
  return PRODUCTS.filter(p => p.category === categoryId);
}

/**
 * حساب أعداد المنتجات لكل فئة
 */
function enrichCategoriesWithCount() {
  return CATEGORIES.map(cat => ({
    ...cat,
    count: PRODUCTS.filter(p => p.category === cat.id).length,
  }));
}

/**
 * الحصول على منتج بالـ ID
 */
function getProductById(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

// ─── LOCAL STORAGE HELPERS ────────────────────────
const Storage = {
  get(key, fallback = null) {
    try {
      const prefixed = localStorage.getItem(`farah_${key}`);
      if (prefixed !== null) return JSON.parse(prefixed);
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(`farah_${key}`, serialized);
      if (key === 'orders') {
        localStorage.setItem('orders', serialized);
      }
    } catch {}
  },
  remove(key) {
    try {
      localStorage.removeItem(`farah_${key}`);
      if (key === 'orders') {
        localStorage.removeItem('orders');
      }
    } catch {}
  },
};

let productsReadyResolve;
let productsReadyReject;
const productsReady = new Promise((resolve, reject) => {
  productsReadyResolve = resolve;
  productsReadyReject = reject;
});
let firestoreProductsUnsubscribe = null;
let firestoreProductsConnected = false;

function dispatchProductsUpdated() {
  window.dispatchEvent(new CustomEvent('FarahDBProductsUpdated', { detail: { products: PRODUCTS.slice() } }));
}

function applyFirestoreProducts(products) {
  if (!Array.isArray(products)) return;
  PRODUCTS.splice(0, PRODUCTS.length, ...products);
  dispatchProductsUpdated();
}

function initProductsRealtime() {
  // 1) RESOLVE IMMEDIATELY so the UI doesn't hang! We have the hardcoded PRODUCTS array ready.
  productsReadyResolve(PRODUCTS);
  
  if (!window.db || !window.db.collection) {
    console.warn('Firebase Firestore is not available, using built-in product data');
    dispatchProductsUpdated();
    return;
  }

  try {
    const productsRef = window.db.collection('products');
    let firstSnapshot = true;

    firestoreProductsUnsubscribe = productsRef.onSnapshot(snapshot => {
      const docs = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        docs.push({ id: doc.id, ...data });
      });
      firestoreProductsConnected = true;
      applyFirestoreProducts(docs);
      if (firstSnapshot) {
        firstSnapshot = false;
        productsReadyResolve(PRODUCTS);
      }
    }, err => {
      console.warn('Firestore products listener error:', err);
      if (firstSnapshot) {
        firstSnapshot = false;
        dispatchProductsUpdated();
        productsReadyResolve(PRODUCTS);
      }
    });
  } catch (err) {
    console.warn('Failed to initialize Firestore products listener:', err);
    dispatchProductsUpdated();
    productsReadyResolve(PRODUCTS);
  }
}

initProductsRealtime();

window.FarahDB = {
  version: DB_VERSION,
  PRODUCTS,
  CATEGORIES,
  calculateShipping,
  generateOrderId,
  formatPrice,
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory,
  enrichCategoriesWithCount,
  getProductById,
  getProducts: () => PRODUCTS,
  Storage,
  productsReady,
  firestoreProductsConnected: () => firestoreProductsConnected,
  unsubscribeProductsRealtime: () => {
    if (typeof firestoreProductsUnsubscribe === 'function') {
      firestoreProductsUnsubscribe();
      firestoreProductsUnsubscribe = null;
    }
  },
};
window.MaysaraDB = window.FarahDB; // Legacy alias
