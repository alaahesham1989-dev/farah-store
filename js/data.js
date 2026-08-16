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
const PRODUCTS = [];

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
  // Default fallback settings (تُحدَّث من Firestore عبر onSnapshot في main.js)
  let settings = {
    freeShippingThreshold: 600,
    rates: { zone1: 85, zone2: 95, zone3: 110 }
  };

  // Read dynamic settings from Storage (Firestore cache)
  if (window.FarahDB && FarahDB.Storage) {
    const saved = FarahDB.Storage.get('shipping_settings');
    if (saved) settings = saved;
  }

  // Free shipping threshold
  if (subtotal >= settings.freeShippingThreshold) return 0;

  const gov = (governorate || '').trim().toLowerCase();

  // English keys (from HTML select value attribute) + Arabic fallback
  const zone1 = [
    'cairo', 'giza', 'alexandria', 'qalubia', 'dakahlia', 'gharbia',
    'beheira', 'monufia', 'sharqia', 'kafr-el-sheikh', 'damietta',
    'port-said', 'suez', 'ismailia',
    // Arabic fallback
    'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الدقهلية',
    'الغربية', 'البحيرة', 'المنوفية', 'الشرقية', 'كفر الشيخ',
    'دمياط', 'بورسعيد', 'السويس', 'الإسماعيلية'
  ];
  const zone2 = [
    'fayoum', 'beni-suef', 'minya', 'assiut', 'sohag', 'qena',
    'luxor', 'aswan', 'red-sea',
    // Arabic fallback
    'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج',
    'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر'
  ];
  const zone3 = [
    'matrouh', 'new-valley', 'south-sinai', 'north-sinai',
    // Arabic fallback
    'مطروح', 'الوادي الجديد', 'جنوب سيناء', 'شمال سيناء'
  ];

  if (zone1.includes(gov)) return settings.rates.zone1;
  if (zone2.includes(gov)) return settings.rates.zone2;
  if (zone3.includes(gov)) return settings.rates.zone3;

  // Default to zone1 if unknown
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
  const activeProducts = PRODUCTS.filter(p => p.isActive !== false);
  if (categoryId === 'all') return activeProducts;
  return activeProducts.filter(p => p.category === categoryId);
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
  const p = PRODUCTS.find(p => p.id === id) || null;
  if (p && p.isActive === false) return null;
  return p;
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
  getProducts: () => PRODUCTS.filter(p => p.isActive !== false),
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
