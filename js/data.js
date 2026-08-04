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
const DB_VERSION = '1.1.0'; // فرح استور

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
    "id": "prod_001",
    "sku": "5881709725215297376",
    "name": "جهاز العناية بالبشرة 9 في 1",
    "nameEn": "Hydra Facial 9 in 1",
    "category": "beauty",
    "description": "جهاز متكامل للعناية بالبشرة وتنظيفها العميق، يجمع 9 وظائف في جهاز واحد للحصول على بشرة نضرة ومشرقة.",
    "price": 5750,
    "priceWholesale": 0,
    "priceOriginal": 8800,
    "discount": 34,
    "stock": 100,
    "images": [
      "images/5881709725215297376.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_002",
    "sku": "5881709725215297378",
    "name": "ديرما بن Dr. Pen Ultima A1",
    "nameEn": "Dr. Pen Ultima A1",
    "category": "beauty",
    "description": "قلم ديرما بن احترافي لتجديد خلايا البشرة وتحفيز الكولاجين، يأتي مع إبر غيار لنتائج مثالية.",
    "price": 1375,
    "priceWholesale": 0,
    "priceOriginal": 1815,
    "discount": 24,
    "stock": 100,
    "images": [
      "images/5881709725215297378.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_003",
    "sku": "5881709725215297379",
    "name": "ديرما بن Dr. Pen Ultima A6",
    "nameEn": "Dr. Pen Ultima A6",
    "category": "beauty",
    "description": "جهاز ديرما بن لاسلكي متطور للعناية بالبشرة، يساعد على تقليل التجاعيد والندبات لتبدو بشرتك أكثر شباباً.",
    "price": 2200,
    "priceWholesale": 0,
    "priceOriginal": 3190,
    "discount": 31,
    "stock": 100,
    "images": [
      "images/5881709725215297379.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_004",
    "sku": "5881709725215297384",
    "name": "جهاز تنظيف الأسنان الكهربائي",
    "nameEn": "Electric Teeth Cleaner",
    "category": "beauty",
    "description": "منظف أسنان كهربائي متطور يزيل الجير والتصبغات بفعالية بـ 31000 اهتزازة في الدقيقة، لابتسامة ناصعة البياض.",
    "price": 500,
    "priceWholesale": 0,
    "priceOriginal": 715,
    "discount": 30,
    "stock": 100,
    "images": [
      "images/5881709725215297384.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_005",
    "sku": "5881709725215297388",
    "name": "ديرما رولر ZGTS",
    "nameEn": "ZGTS Derma Roller",
    "category": "beauty",
    "description": "أداة ديرما رولر باللون الذهبي لتحفيز الكولاجين وتجديد شباب البشرة بفعالية وأمان في المنزل.",
    "price": 247,
    "priceWholesale": 0,
    "priceOriginal": 412,
    "discount": 40,
    "stock": 100,
    "images": [
      "images/5881709725215297388.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": "جديد",
    "badgeType": "new",
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_006",
    "sku": "5881709725215297389 (1)",
    "name": "جهاز إزالة الرؤوس السوداء المائي",
    "nameEn": "SPA Micro Bubble Cleaner",
    "category": "beauty",
    "description": "جهاز تنظيف مسام البشرة وإزالة الرؤوس السوداء بتقنية الشفط المائي، يأتي مع رؤوس متعددة تناسب جميع أنواع البشرة.",
    "price": 340,
    "priceWholesale": 0,
    "priceOriginal": 495,
    "discount": 31,
    "stock": 100,
    "images": [
      "images/5881709725215297389%20(1).jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_007",
    "sku": "5881709725215297389",
    "name": "جهاز شفط الرؤوس السوداء وتنظيف البشرة",
    "nameEn": "Water Facial Cleaner",
    "category": "beauty",
    "description": "جهاز تنظيف البشرة العميق وإزالة الشوائب بتقنية تدفق الماء، لبشرة نقية وصافية.",
    "price": 300,
    "priceWholesale": 0,
    "priceOriginal": 440,
    "discount": 31,
    "stock": 100,
    "images": [
      "images/5881709725215297389.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_008",
    "sku": "5881709725215297390",
    "name": "جهاز التردد العالي المحمول",
    "nameEn": "Portable High Frequency LZ-006A",
    "category": "beauty",
    "description": "جهاز العناية بالبشرة بتقنية التردد العالي، يعالج حب الشباب ويحفز الدورة الدموية لتعزيز صحة ونضارة بشرتك.",
    "price": 775,
    "priceWholesale": 0,
    "priceOriginal": 990,
    "discount": 21,
    "stock": 100,
    "images": [
      "images/5881709725215297390.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": true,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_009",
    "sku": "5881709725215297392",
    "name": "جهاز تقليل التجاعيد بالنبضات الضوئية",
    "nameEn": "Intense Pulsed Light ES-1081",
    "category": "beauty",
    "description": "جهاز لتدليك وشد الوجه والرقبة، يعمل بتقنية النبضات الضوئية لتقليل التجاعيد واستعادة شباب البشرة.",
    "price": 975,
    "priceWholesale": 0,
    "priceOriginal": 1210,
    "discount": 19,
    "stock": 100,
    "images": [
      "images/5881709725215297392.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_010",
    "sku": "5881709725215297393",
    "name": "طقم كاسات حجامة سيليكون",
    "nameEn": "Silicone Cupping 4 Cups",
    "category": "beauty",
    "description": "مجموعة كاسات حجامة سيليكون مرنة باللون الأزرق، تستخدم للتدليك وتنشيط الدورة الدموية وتخفيف آلام العضلات.",
    "price": 325,
    "priceWholesale": 0,
    "priceOriginal": 462,
    "discount": 29,
    "stock": 100,
    "images": [
      "images/5881709725215297393.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_011",
    "sku": "5881709725215297395",
    "name": "فرشاة تصفيف الشعر جوي",
    "nameEn": "Joy 2-in-1 Dryer & Styler",
    "category": "beauty",
    "description": "مجفف ومصفف شعر احترافي 2 في 1 من جوي، يمنحك شعراً ناعماً وكثيفاً في وقت قياسي وبكل سهولة.",
    "price": 1550,
    "priceWholesale": 0,
    "priceOriginal": 2200,
    "discount": 29,
    "stock": 100,
    "images": [
      "images/5881709725215297395.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_012",
    "sku": "5881709725215297418",
    "name": "ماكينة حلاقة الشعر كيمي KM-099",
    "nameEn": "Kemei KM-099 / T99",
    "category": "beauty",
    "description": "ماكينة حلاقة وتشذيب الشعر الاحترافية من كيمي، بتصميم أنيق ومحرك قوي لنتائج دقيقة وحلاقة مريحة.",
    "price": 327,
    "priceWholesale": 0,
    "priceOriginal": 528,
    "discount": 38,
    "stock": 100,
    "images": [
      "images/5881709725215297418.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_013",
    "sku": "5881709725215297425",
    "name": "جهاز بخار نانو للعناية بالشعر",
    "nameEn": "Blue Magic XH-040H",
    "category": "beauty",
    "description": "مسدس رش بخار النانو لمعالجة الشعر وترطيبه بعمق، يساعد في تعزيز امتصاص منتجات العناية بالشعر.",
    "price": 843,
    "priceWholesale": 0,
    "priceOriginal": 1232,
    "discount": 31,
    "stock": 100,
    "images": [
      "images/5881709725215297425.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_014",
    "sku": "5881709725215297432",
    "name": "ديرما بن دكتور بن ألتيما M5-W",
    "nameEn": "Dr. Pen Ultima M5-W",
    "category": "beauty",
    "description": "جهاز ديرما بن اللاسلكي الأنيق باللون الذهبي الوردي، مثالي لتحسين ملمس البشرة وعلاج عيوبها.",
    "price": 1650,
    "priceWholesale": 0,
    "priceOriginal": 2310,
    "discount": 28,
    "stock": 100,
    "images": [
      "images/5881709725215297432.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_015",
    "sku": "5881709725215297436",
    "name": "جهاز تجعيد الشعر التلقائي",
    "nameEn": "The Glam Hair Curler",
    "category": "beauty",
    "description": "جهاز تجعيد الشعر الأوتوماتيكي للحصول على تموجات رائعة ومثالية بسهولة وأمان في ثوانٍ معدودة.",
    "price": 700,
    "priceWholesale": 0,
    "priceOriginal": 990,
    "discount": 29,
    "stock": 100,
    "images": [
      "images/5881709725215297436.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_016",
    "sku": "5881709725215297437",
    "name": "جهاز إزالة شعر الوجه DSP",
    "nameEn": "DSP Flawless Facial Remover",
    "category": "beauty",
    "description": "مزيل شعر الوجه الصغير والأنيق من DSP، يزيل الشعر الزائد بلطف وبدون ألم لبشرة ناعمة خالية من العيوب.",
    "price": 190,
    "priceWholesale": 0,
    "priceOriginal": 275,
    "discount": 30,
    "stock": 100,
    "images": [
      "images/5881709725215297437.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_017",
    "sku": "5881709725215297447",
    "name": "كاسات مساج سيليكون للجسم",
    "nameEn": "Versatile Silicone Cupping",
    "category": "beauty",
    "description": "مجموعة كاسات تدليك سيليكون فعالة في محاربة السيلوليت وشد ترهلات الجسم للحصول على قوام متناسق.",
    "price": 365,
    "priceWholesale": 0,
    "priceOriginal": 550,
    "discount": 33,
    "stock": 100,
    "images": [
      "images/5881709725215297447.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_018",
    "sku": "5881709725215297454",
    "name": "ماكينة حلاقة وتشذيب كيمي KM-1910",
    "nameEn": "Kemei KM-1910",
    "category": "beauty",
    "description": "ماكينة حلاقة رجالية متعددة الاستخدامات لتشذيب اللحية والجسم، تأتي مع أمشاط درجات مختلفة وتعمل شحناً بـ USB.",
    "price": 250,
    "priceWholesale": 0,
    "priceOriginal": 352,
    "discount": 28,
    "stock": 100,
    "images": [
      "images/5881709725215297454.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_019",
    "sku": "5881709725215297455",
    "name": "جهاز تقشير وتغذية البشرة مع كبسولات",
    "nameEn": "Geneo Oxygenation pods",
    "category": "beauty",
    "description": "جهاز متطور لتقشير البشرة بالأكسجين وتغذيتها، يأتي مع كبسولات متنوعة لتلبية جميع احتياجات العناية بالبشرة.",
    "price": 2250,
    "priceWholesale": 0,
    "priceOriginal": 3300,
    "discount": 31,
    "stock": 100,
    "images": [
      "images/5881709725215297455.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_020",
    "sku": "5881709725215297458",
    "name": "جهاز بخار الوجه الاحترافي",
    "nameEn": "Hot & Cool Facial Steamer",
    "category": "beauty",
    "description": "جهاز بخار للوجه مزود بحامل يوفر بخاراً ساخناً وبارداً، مثالي لتنظيف المسام وتجهيز البشرة للعناية في الصالونات أو المنزل.",
    "price": 3100,
    "priceWholesale": 0,
    "priceOriginal": 4400,
    "discount": 29,
    "stock": 100,
    "images": [
      "images/5881709725215297458.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_021",
    "sku": "5881709725215297463",
    "name": "جهاز فلاوليس لإزالة الشعر",
    "nameEn": "Flawless Hair Remover F-120",
    "category": "beauty",
    "description": "جهاز إزالة الشعر الصغير والمحمول، بتصميم يشبه أحمر الشفاه لإزالة شعر الوجه بلطف ودقة في أي وقت ومكان.",
    "price": 190,
    "priceWholesale": 0,
    "priceOriginal": 275,
    "discount": 30,
    "stock": 100,
    "images": [
      "images/5881709725215297463.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_022",
    "sku": "5881709725215297481",
    "name": "مجموعة إزالة الشعر 4 في 1 كيمي",
    "nameEn": "Kemei 4 in 1 KM-3024",
    "category": "beauty",
    "description": "ماكينة إزالة الشعر النسائية المتكاملة 4 في 1، تشمل رؤوساً متعددة للحلاقة وتشذيب الحواجب وإزالة شعر الأنف.",
    "price": 290,
    "priceWholesale": 0,
    "priceOriginal": 418,
    "discount": 30,
    "stock": 100,
    "images": [
      "images/5881709725215297481.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_023",
    "sku": "5897814783128440119",
    "name": "جهاز تدليك الصدر KL-2022",
    "nameEn": "Chest Massager KL-2022",
    "category": "beauty",
    "description": "حمالة صدر لتدليك الصدر وتنشيط الدورة الدموية مزودة بخاصية التدفئة، لتوفير الراحة والعناية المتكاملة.",
    "price": 625,
    "priceWholesale": 0,
    "priceOriginal": 880,
    "discount": 28,
    "stock": 100,
    "images": [
      "images/5897814783128440119.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_024",
    "sku": "5897814783128440123",
    "name": "جهاز تنظيف البشرة بالفقاعات الدقيقة",
    "nameEn": "Super Micro Bubble D-Clean",
    "category": "beauty",
    "description": "جهاز تنظيف وتقشير الوجه بالفقاعات المائية الدقيقة، يزيل الرؤوس السوداء ويمنح بشرتك ترطيباً ونظافة عميقة.",
    "price": 550,
    "priceWholesale": 0,
    "priceOriginal": 825,
    "discount": 33,
    "stock": 100,
    "images": [
      "images/5897814783128440123.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_025",
    "sku": "5897814783128440129",
    "name": "حزام شد البطن لما بعد الولادة",
    "nameEn": "Postpartum Abdomen Support",
    "category": "beauty",
    "description": "طقم أحزمة دعم وشد البطن لما بعد الولادة من 3 قطع، يساعد في استعادة شكل الجسم ودعم عضلات البطن بفعالية.",
    "price": 650,
    "priceWholesale": 0,
    "priceOriginal": 990,
    "discount": 34,
    "stock": 100,
    "images": [
      "images/5897814783128440129.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
  },
  {
    "id": "prod_026",
    "sku": "5897814783128440130",
    "name": "جهاز تنظيف مسام الوجه متعدد الوظائف",
    "nameEn": "Multifunctional HT-808",
    "category": "beauty",
    "description": "جهاز إزالة الرؤوس السوداء وشفط دهون البشرة HT-808، يأتي مع رؤوس متعددة لتنظيف البشرة بعمق والحفاظ على نقائها.",
    "price": 325,
    "priceWholesale": 0,
    "priceOriginal": 495,
    "discount": 34,
    "stock": 100,
    "images": [
      "images/5897814783128440130.jpg"
    ],
    "variants": {},
    "rating": 4.5,
    "reviews": 120,
    "sold": 300,
    "badge": null,
    "badgeType": null,
    "featured": false,
    "createdAt": "2026-08-01"
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
      const v = localStorage.getItem(`maysara_${key}`);
      return v !== null ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(`maysara_${key}`, JSON.stringify(value)); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(`maysara_${key}`); } catch {}
  },
};

// ─── EXPORT (للاستخدام عبر الملفات الأخرى) ────────
window.MaysaraDB = {
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
};
