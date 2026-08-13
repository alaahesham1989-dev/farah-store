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
  { id: 'home',      name: 'المنزل والديكور',   icon: '🏠', count: 0 },
  { id: 'beauty',    name: 'العناية الشخصية',   icon: '✨', count: 0 },
  { id: 'kitchen',   name: 'المطبخ',             icon: '🍳', count: 0 },
  { id: 'fashion',   name: 'الأزياء والإكسسوار', icon: '👗', count: 0 },
  { id: 'sports',    name: 'الرياضة',            icon: '💪', count: 0 },
  { id: 'tech',      name: 'الإلكترونيات',       icon: '📱', count: 0 },
  { id: 'kids',      name: 'الأطفال',             icon: '🧸', count: 0 },
  { id: 'other',     name: 'منوعات',              icon: '🎁', count: 0 },
];

// ─── PRODUCTS ─────────────────────────────────────
// كل منتج فيه: سعر جملة (خاص)، سعر بيع (عام)، هامش ربح، فئة، صور
const PRODUCTS = [
  {
    "id": "code0025",
    "sku": "code0025",
    "name": "بدال تمارين رياضي",
    "nameEn": "Arm and Leg Pedal Exerciser",
    "category": "العناية بالجسم",
    "description": "جهاز تدريب رياضي للذراعين والقدمين قابل للطي مع شاشة ديجيتال، مثالي لعمل جلسات علاج طبيعي وتنشيط الدورة الدموية.",
    "price": 850,
    "priceWholesale": 650,
    "priceOriginal": 1000,
    "discount": 15,
    "stock": 50,
    "images": [
      "images/products/5881709725215297463.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0026",
    "sku": "code0026",
    "name": "جهاز بخار الوجه المنزلي",
    "nameEn": "HOME GOLD Ion Vapour Steamer",
    "category": "العناية بالبشرة",
    "description": "جهاز بخار الوجه الأيوني HG-606، يفتح المسام وينظف البشرة بعمق ويمنحك ترطيباً مثالياً لبشرة أكثر نضارة وإشراقاً.",
    "price": 950,
    "priceWholesale": 900,
    "priceOriginal": 1300,
    "discount": 26,
    "stock": 50,
    "images": [
      "images/products/5881709725215297481.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "غير متوفر",
    "sku": "غير متوفر",
    "name": "جهاز العناية بالبشرة 9 في 1",
    "nameEn": "Hydra Facial 9 in 1",
    "category": "العناية بالبشرة",
    "description": "جهاز متكامل للعناية بالبشرة وتنظيفها العميق، يجمع 9 وظائف في جهاز واحد للحصول على بشرة نضرة ومشرقة.",
    "price": 0,
    "priceWholesale": 0,
    "priceOriginal": 0,
    "discount": 0,
    "stock": 0,
    "images": [],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0001",
    "sku": "code0001",
    "name": "ديرما بن Dr. Pen Ultima A1",
    "nameEn": "Dr. Pen Ultima A1",
    "category": "العناية بالبشرة",
    "description": "قلم ديرما بن احترافي لتجديد خلايا البشرة وتحفيز الكولاجين، يأتي مع إبر غيار لنتائج مثالية.",
    "price": 1200,
    "priceWholesale": 1000,
    "priceOriginal": 1500,
    "discount": 20,
    "stock": 50,
    "images": [
      "images/products/5778280195398765958.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0002",
    "sku": "code0002",
    "name": "ديرما بن Dr. Pen Ultima A6",
    "nameEn": "Dr. Pen Ultima A6",
    "category": "العناية بالبشرة",
    "description": "جهاز ديرما بن لاسلكي متطور للعناية بالبشرة، يساعد على تقليل التجاعيد والندبات لتبدو بشرتك أكثر شباباً.",
    "price": 2000,
    "priceWholesale": 1600,
    "priceOriginal": 2500,
    "discount": 20,
    "stock": 50,
    "images": [
      "images/products/5881709725215297373.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0003",
    "sku": "code0003",
    "name": "جهاز تنظيف الأسنان الكهربائي",
    "nameEn": "Electric Teeth Cleaner",
    "category": "العناية بالأسنان",
    "description": "منظف أسنان كهربائي متطور يزيل الجير والتصبغات بفعالية بـ 31000 اهتزازة في الدقيقة، لابتسامة ناصعة البياض.",
    "price": 550,
    "priceWholesale": 380,
    "priceOriginal": 675,
    "discount": 18,
    "stock": 50,
    "images": [
      "images/products/5881709725215297376.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0027",
    "sku": "code0027",
    "name": "نظارات الرؤية الليلية والنهارية",
    "nameEn": "HD Vision WrapArounds",
    "category": "العناية الشخصية",
    "description": "نظارات HD Vision عالية الوضوح للقيادة، تقلل التوهج وتوضح الرؤية بشكل مثالي، يمكن ارتداؤها فوق النظارات الطبية.",
    "price": 90,
    "priceWholesale": 60,
    "priceOriginal": 120,
    "discount": 25,
    "stock": 50,
    "images": [
      "images/products/5881709725215297501.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0004",
    "sku": "code0004",
    "name": "ديرما رولر ZGTS",
    "nameEn": "ZGTS Derma Roller",
    "category": "العناية بالبشرة",
    "description": "أداة ديرما رولر باللون الذهبي لتحفيز الكولاجين وتجديد شباب البشرة بفعالية وأمان في المنزل.",
    "price": 150,
    "priceWholesale": 90,
    "priceOriginal": 180,
    "discount": 16,
    "stock": 50,
    "images": [
      "images/products/5881709725215297378.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "غير متوفر",
    "sku": "غير متوفر",
    "name": "جهاز شفط الرؤوس السوداء وتنظيف البشرة",
    "nameEn": "Water Facial Cleaner",
    "category": "العناية بالبشرة",
    "description": "جهاز تنظيف البشرة العميق وإزالة الشوائب بتقنية تدفق الماء، لبشرة نقية وصافية.",
    "price": 0,
    "priceWholesale": 0,
    "priceOriginal": 0,
    "discount": 0,
    "stock": 0,
    "images": [],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0005",
    "sku": "code0005",
    "name": "جهاز إزالة الرؤوس السوداء المائي",
    "nameEn": "SPA Micro Bubble Cleaner",
    "category": "العناية بالبشرة",
    "description": "جهاز تنظيف مسام البشرة وإزالة الرؤوس السوداء بتقنية الشفط المائي، يأتي مع رؤوس متعددة تناسب جميع أنواع البشرة.",
    "price": 500,
    "priceWholesale": 250,
    "priceOriginal": 700,
    "discount": 28,
    "stock": 50,
    "images": [
      "images/products/5881709725215297379.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0006",
    "sku": "code0006",
    "name": "جهاز التردد العالي المحمول",
    "nameEn": "Portable High Frequency LZ-006A",
    "category": "العناية بالبشرة",
    "description": "جهاز العناية بالبشرة بتقنية التردد العالي، يعالج حب الشباب ويحفز الدورة الدموية لتعزيز صحة ونضارة بشرتك.",
    "price": 650,
    "priceWholesale": 480,
    "priceOriginal": 800,
    "discount": 18,
    "stock": 50,
    "images": [
      "images/products/5881709725215297384.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0028",
    "sku": "code0028",
    "name": "جهاز الخيط المائي لتنظيف الأسنان",
    "nameEn": "Dental Water Flosser",
    "category": "العناية بالأسنان",
    "description": "جهاز تنظيف الأسنان بالخيط المائي اللاسلكي، يزيل بقايا الطعام والجير بفعالية للثة صحية وأسنان نظيفة مع 3 أوضاع تشغيل.",
    "price": 500,
    "priceWholesale": 330,
    "priceOriginal": 750,
    "discount": 33,
    "stock": 50,
    "images": [
      "images/products/5881709725215297502.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0007",
    "sku": "code0007",
    "name": "جهاز تقليل التجاعيد بالنبضات الضوئية",
    "nameEn": "Intense Pulsed Light ES-1081",
    "category": "العناية بالبشرة",
    "description": "جهاز لتدليك وشد الوجه والرقبة، يعمل بتقنية النبضات الضوئية لتقليل التجاعيد واستعادة شباب البشرة.",
    "price": 450,
    "priceWholesale": 220,
    "priceOriginal": 550,
    "discount": 18,
    "stock": 50,
    "images": [
      "images/products/5881709725215297387.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0008",
    "sku": "code0008",
    "name": "طقم كاسات حجامة سيليكون",
    "nameEn": "Silicone Cupping 4 Cups",
    "category": "العناية بالجسم",
    "description": "مجموعة كاسات حجامة سيليكون مرنة باللون الأزرق، تستخدم للتدليك وتنشيط الدورة الدموية وتخفيف آلام العضلات.",
    "price": 400,
    "priceWholesale": 290,
    "priceOriginal": 500,
    "discount": 20,
    "stock": 50,
    "images": [
      "images/products/5881709725215297388.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0009",
    "sku": "code0009",
    "name": "فرشاة تصفيف الشعر جوي",
    "nameEn": "Joy 2-in-1 Dryer & Styler",
    "category": "العناية بالشعر",
    "description": "مجفف ومصفف شعر احترافي 2 في 1 من جوي، يمنحك شعراً ناعماً وكثيفاً في وقت قياسي وبكل سهولة.",
    "price": 1000,
    "priceWholesale": 900,
    "priceOriginal": 1200,
    "discount": 16,
    "stock": 50,
    "images": [
      "images/products/5881709725215297389.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0010",
    "sku": "code0010",
    "name": "ماكينة حلاقة الشعر كيمي KM-099",
    "nameEn": "Kemei KM-099 / T99",
    "category": "العناية الشخصية للرجال",
    "description": "ماكينة حلاقة وتشذيب الشعر الاحترافية من كيمي، بتصميم أنيق ومحرك قوي لنتائج دقيقة وحلاقة مريحة.",
    "price": 0,
    "priceWholesale": 130,
    "priceOriginal": 0,
    "discount": 0,
    "stock": 50,
    "images": [
      "images/products/5881709725215297389 (1).jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0011",
    "sku": "code0011",
    "name": "جهاز بخار نانو للعناية بالشعر",
    "nameEn": "Blue Magic XH-040H",
    "category": "العناية الشخصية",
    "description": "مسدس رش بخار النانو لمعالجة الشعر وترطيبه بعمق، يساعد في تعزيز امتصاص منتجات العناية بالشعر.",
    "price": 1050,
    "priceWholesale": 750,
    "priceOriginal": 1450,
    "discount": 27,
    "stock": 50,
    "images": [
      "images/products/5881709725215297390.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0012",
    "sku": "code0012",
    "name": "ديرما بن دكتور بن ألتيما M5-W",
    "nameEn": "Dr. Pen Ultima M5-W",
    "category": "العناية بالبشرة",
    "description": "جهاز ديرما بن اللاسلكي الأنيق باللون الذهبي الوردي، مثالي لتحسين ملمس البشرة وعلاج عيوبها.",
    "price": 1300,
    "priceWholesale": 1000,
    "priceOriginal": 1680,
    "discount": 22,
    "stock": 50,
    "images": [
      "images/products/5881709725215297391.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0013",
    "sku": "code0013",
    "name": "جهاز تجعيد الشعر التلقائي",
    "nameEn": "The Glam Hair Curler",
    "category": "العناية بالشعر",
    "description": "جهاز تجعيد الشعر الأوتوماتيكي للحصول على تموجات رائعة ومثالية بسهولة وأمان في ثوانٍ معدودة.",
    "price": 1000,
    "priceWholesale": 550,
    "priceOriginal": 2000,
    "discount": 50,
    "stock": 50,
    "images": [
      "images/products/5881709725215297392.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0014",
    "sku": "code0014",
    "name": "جهاز إزالة شعر الوجه DSP",
    "nameEn": "DSP Flawless Facial Remover",
    "category": "العناية الشخصية للنساء",
    "description": "مزيل شعر الوجه الصغير والأنيق من DSP، يزيل الشعر الزائد بلطف وبدون ألم لبشرة ناعمة خالية من العيوب.",
    "price": 350,
    "priceWholesale": 240,
    "priceOriginal": 400,
    "discount": 12,
    "stock": 50,
    "images": [
      "images/products/5881709725215297393.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0015",
    "sku": "code0015",
    "name": "كاسات مساج سيليكون للجسم",
    "nameEn": "Versatile Silicone Cupping",
    "category": "العناية بالجسم",
    "description": "مجموعة كاسات تدليك سيليكون فعالة في محاربة السيلوليت وشد ترهلات الجسم للحصول على قوام متناسق.",
    "price": 400,
    "priceWholesale": 200,
    "priceOriginal": 500,
    "discount": 20,
    "stock": 50,
    "images": [
      "images/products/5881709725215297395.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0016",
    "sku": "code0016",
    "name": "ماكينة حلاقة وتشذيب كيمي KM-1910",
    "nameEn": "Kemei KM-1910",
    "category": "العناية الشخصية للرجال",
    "description": "ماكينة حلاقة رجالية متعددة الاستخدامات لتشذيب اللحية والجسم، تأتي مع أمشاط درجات مختلفة وتعمل شحناً بـ USB.",
    "price": 0,
    "priceWholesale": 390,
    "priceOriginal": 0,
    "discount": 0,
    "stock": 50,
    "images": [
      "images/products/5881709725215297418.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0017",
    "sku": "code0017",
    "name": "جهاز تقشير وتغذية البشرة مع كبسولات",
    "nameEn": "Geneo Oxygenation pods",
    "category": "العناية بالبشرة",
    "description": "جهاز متطور لتقشير البشرة بالأكسجين وتغذيتها، يأتي مع كبسولات متنوعة لتلبية جميع احتياجات العناية بالبشرة.",
    "price": 6000,
    "priceWholesale": 2300,
    "priceOriginal": 7000,
    "discount": 14,
    "stock": 50,
    "images": [
      "images/products/5881709725215297425.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0018",
    "sku": "code0018",
    "name": "جهاز بخار الوجه الاحترافي",
    "nameEn": "Hot & Cool Facial Steamer",
    "category": "العناية بالبشرة",
    "description": "جهاز بخار للوجه مزود بحامل يوفر بخاراً ساخناً وبارداً، مثالي لتنظيف المسام وتجهيز البشرة للعناية في الصالونات أو المنزل.",
    "price": 3000,
    "priceWholesale": 1900,
    "priceOriginal": 3450,
    "discount": 13,
    "stock": 50,
    "images": [
      "images/products/5881709725215297432.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0019",
    "sku": "code0019",
    "name": "جهاز فلاوليس لإزالة الشعر",
    "nameEn": "Flawless Hair Remover F-120",
    "category": "العناية الشخصية للنساء",
    "description": "جهاز إزالة الشعر الصغير والمحمول، بتصميم يشبه أحمر الشفاه لإزالة شعر الوجه بلطف ودقة في أي وقت ومكان.",
    "price": 220,
    "priceWholesale": 120,
    "priceOriginal": 250,
    "discount": 12,
    "stock": 50,
    "images": [
      "images/products/5881709725215297436.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0020",
    "sku": "code0020",
    "name": "مجموعة إزالة الشعر 4 في 1 كيمي",
    "nameEn": "Kemei 4 in 1 KM-3024",
    "category": "العناية الشخصية للنساء",
    "description": "ماكينة إزالة الشعر النسائية المتكاملة 4 في 1، تشمل رؤوساً متعددة للحلاقة وتشذيب الحواجب وإزالة شعر الأنف.",
    "price": 450,
    "priceWholesale": 240,
    "priceOriginal": 600,
    "discount": 25,
    "stock": 50,
    "images": [
      "images/products/5881709725215297437.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0029",
    "sku": "code0029",
    "name": "كشاف طوارئ متعدد الاستخدامات",
    "nameEn": "F-37 Multi-function Flashlight",
    "category": "إلكترونيات وإكسسوارات",
    "description": "كشاف طوارئ F-37 احترافي بقوة إضاءة عالية مع بطارية كبيرة، يحتوي على شفرة قاطع، صافرة إنذار، وشحن Type-C.",
    "price": 600,
    "priceWholesale": 450,
    "priceOriginal": 770,
    "discount": 22,
    "stock": 50,
    "images": [
      "images/products/5881709725215297503.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0030",
    "sku": "code0030",
    "name": "ولاعة قوسية قابلة للشحن",
    "nameEn": "USB Type-C Electric Arc Lighter",
    "category": "أدوات منزلية",
    "description": "ولاعة الكترونية حديثة مقاومة للرياح تعمل بالشحن عن طريق USB، آمنة ومناسبة للاستخدام المنزلي والرحلات.",
    "price": 0,
    "priceWholesale": 0,
    "priceOriginal": 0,
    "discount": 0,
    "stock": 0,
    "images": [
      "images/products/5897814783128440119.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0031",
    "sku": "code0031",
    "name": "طوق شد فقرات الرقبة 3 طبقات",
    "nameEn": "Tractors for Cervical Spine",
    "category": "العناية بالجسم",
    "description": "جهاز شد فقرات الرقبة القابل للنفخ يساعد على تخفيف آلام الرقبة وتصحيح الوضعية، تصميم مريح من 3 طبقات.",
    "price": 255,
    "priceWholesale": 145,
    "priceOriginal": 340,
    "discount": 25,
    "stock": 50,
    "images": [
      "images/products/5897814783128440123.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0021",
    "sku": "code0021",
    "name": "جهاز تدليك الصدر KL-2022",
    "nameEn": "Chest Massager KL-2022",
    "category": "العناية الشخصية",
    "description": "حمالة صدر لتدليك الصدر وتنشيط الدورة الدموية مزودة بخاصية التدفئة، لتوفير الراحة والعناية المتكاملة.",
    "price": 700,
    "priceWholesale": 450,
    "priceOriginal": 900,
    "discount": 22,
    "stock": 50,
    "images": [
      "images/products/5881709725215297447.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0022",
    "sku": "code0022",
    "name": "جهاز تنظيف البشرة بالفقاعات الدقيقة",
    "nameEn": "Super Micro Bubble D-Clean",
    "category": "العناية بالبشرة",
    "description": "جهاز تنظيف وتقشير الوجه بالفقاعات المائية الدقيقة، يزيل الرؤوس السوداء ويمنح بشرتك ترطيباً ونظافة عميقة.",
    "price": 430,
    "priceWholesale": 230,
    "priceOriginal": 610,
    "discount": 29,
    "stock": 50,
    "images": [
      "images/products/5881709725215297454.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0032",
    "sku": "code0032",
    "name": "قناع الوجه الضوئي LED",
    "nameEn": "Colorful LED Beauty Mask",
    "category": "العناية بالبشرة",
    "description": "قناع الجمال بتقنية إضاءة LED الملونة لعلاج مشاكل البشرة وتجديد الخلايا وتقليل التجاعيد، لبشرة أكثر نضارة.",
    "price": 1400,
    "priceWholesale": 900,
    "priceOriginal": 2000,
    "discount": 30,
    "stock": 50,
    "images": [
      "images/products/5897814783128440127.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0023",
    "sku": "code0023",
    "name": "حزام شد البطن لما بعد الولادة",
    "nameEn": "Postpartum Abdomen Support",
    "category": "العناية بالجسم",
    "description": "طقم أحزمة دعم وشد البطن لما بعد الولادة من 3 قطع، يساعد في استعادة شكل الجسم ودعم عضلات البطن بفعالية.",
    "price": 450,
    "priceWholesale": 300,
    "priceOriginal": 550,
    "discount": 18,
    "stock": 50,
    "images": [
      "images/products/5881709725215297455.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0024",
    "sku": "code0024",
    "name": "جهاز تنظيف مسام الوجه متعدد الوظائف",
    "nameEn": "Multifunctional HT-808",
    "category": "العناية بالبشرة",
    "description": "جهاز إزالة الرؤوس السوداء وشفط دهون البشرة HT-808، يأتي مع رؤوس متعددة لتنظيف البشرة بعمق والحفاظ على نقائها.",
    "price": 300,
    "priceWholesale": 170,
    "priceOriginal": 380,
    "discount": 21,
    "stock": 50,
    "images": [
      "images/products/5881709725215297458.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0033",
    "sku": "code0033",
    "name": "مقبض تمارين اليد مع عداد",
    "nameEn": "Adjustable Hand Grip Strengthener",
    "category": "العناية بالجسم",
    "description": "أداة تمرين قبضة اليد قابلة للتعديل ومزودة بعداد إلكتروني، مثالية لتقوية عضلات اليد والساعد.",
    "price": 90,
    "priceWholesale": 60,
    "priceOriginal": 140,
    "discount": 35,
    "stock": 50,
    "images": [
      "images/products/5897814783128440129.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0034",
    "sku": "code0034",
    "name": "مشط تدليك فروة الرأس",
    "nameEn": "NANOFOG Scalp Massage Comb",
    "category": "العناية الشخصية",
    "description": "مشط ذكي لتدليك فروة الرأس وتوزيع السوائل والعلاجات بتقنية النانو، يحفز نمو الشعر ويقوي الجذور.",
    "price": 250,
    "priceWholesale": 175,
    "priceOriginal": 300,
    "discount": 16,
    "stock": 50,
    "images": [
      "images/products/5897814783128440130.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0035",
    "sku": "code0035",
    "name": "راديو ديجيتال JOC H799",
    "nameEn": "JOC Radio H799",
    "category": "إلكترونيات وإكسسوارات",
    "description": "راديو محمول مشغل ديجيتال مع إضاءة وبطارية تدوم طويلاً، يدعم FM وصوت نقي وعالي الجودة.",
    "price": 300,
    "priceWholesale": 225,
    "priceOriginal": 340,
    "discount": 11,
    "stock": 50,
    "images": [
      "images/products/5900094680618175469.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0036",
    "sku": "code0036",
    "name": "راديو كلاسيكي 5 موجات",
    "nameEn": "Classic 5 Band Radio",
    "category": "إلكترونيات وإكسسوارات",
    "description": "راديو كلاسيكي أنيق يدعم موجات FM/AM/SW بتصميم عصري وصوت واضح لجميع المحطات المفضلة.",
    "price": 300,
    "priceWholesale": 225,
    "priceOriginal": 350,
    "discount": 14,
    "stock": 50,
    "images": [
      "images/products/5938073942545337618.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0037",
    "sku": "code0037",
    "name": "سخان فحم كهربائي",
    "nameEn": "Electric Coal Starter",
    "category": "أدوات منزلية",
    "description": "سخان وموقد فحم كهربائي سريع الاشتعال، آمن وعملي لتسخين الفحم للشيشة أو البخور في دقائق.",
    "price": 300,
    "priceWholesale": 190,
    "priceOriginal": 330,
    "discount": 9,
    "stock": 50,
    "images": [
      "images/products/5938073942545337648.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0038",
    "sku": "code0038",
    "name": "جهاز بديكير إلكتروني فلاوليس",
    "nameEn": "FLAWLESS Pedi",
    "category": "العناية الشخصية للنساء",
    "description": "أداة العناية بالقدمين الكهربائية لإزالة الجلد الميت والتشققات بسهولة وأمان للحصول على أقدام ناعمة كالحرير.",
    "price": 140,
    "priceWholesale": 85,
    "priceOriginal": 220,
    "discount": 36,
    "stock": 50,
    "images": [
      "images/products/5938073942545337652.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0039",
    "sku": "code0039",
    "name": "منفاخ هواء للسيارات ذكي",
    "nameEn": "Air Compressor LS-208",
    "category": "إلكترونيات وإكسسوارات",
    "description": "كمبروسر هواء محمول للسيارات بقوة 350 واط وشاشة ديجيتال ذكية وفصل أوتوماتيكي مع كشاف طوارئ.",
    "price": 1050,
    "priceWholesale": 850,
    "priceOriginal": 1200,
    "discount": 12,
    "stock": 50,
    "images": [
      "images/products/5938073942545337676.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  },
  {
    "id": "code0040",
    "sku": "code0040",
    "name": "مسدس مساج كهربائي MAXTOP",
    "nameEn": "MAXTOP Compact Power Massager",
    "category": "العناية بالجسم",
    "description": "جهاز تدليك قوي ولاسلكي بـ 6 سرعات ورؤوس متعددة، لتخفيف آلام العضلات والمفاصل باحترافية عالية.",
    "price": 600,
    "priceWholesale": 350,
    "priceOriginal": 900,
    "discount": 33,
    "stock": 50,
    "images": [
      "images/products/5938073942545337724.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-13"
  }
];

// ─── ORDERS SCHEMA ────────────────────────────────
// بيانات الطلبات — كل طلب منفصل عن المنتج
const ordersSchema = {
  id: 'string',           // ord_XXXXXXXXXXXX
  customerId: 'string',   // optional (زوار بدون حساب)
  customerName: 'string',
  customerPhone: 'string',
  customerAddress: 'object',  // { governorate, city, street, buildingNo, floor, apt }
  items: 'array',         // [{ productId, sku, name, price, qty, variantSelected }]
  subtotal: 'number',
  shipping: 'number',
  discount: 'number',
  total: 'number',
  paymentMethod: 'string', // 'cash_on_delivery' | 'paymob_card' | 'paymob_wallet'
  paymentStatus: 'string', // 'pending' | 'paid' | 'failed'
  orderStatus: 'string',   // 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  trackingNumber: 'string',
  notes: 'string',
  createdAt: 'datetime',
  updatedAt: 'datetime',
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
function calculateShipping(subtotal, governorate = 'cairo') {
  const FREE_THRESHOLD = 500;
  const BASE_RATE      = 65;   // القاهرة والجيزة
  const PROVINCE_RATE  = 90;   // باقي المحافظات

  if (subtotal >= FREE_THRESHOLD) return 0;
  return ['cairo', 'giza'].includes(governorate.toLowerCase()) ? BASE_RATE : PROVINCE_RATE;
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
  if (!window.db || !window.db.collection) {
    console.warn('Firebase Firestore is not available, using built-in product data');
    dispatchProductsUpdated();
    productsReadyResolve(PRODUCTS);
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
