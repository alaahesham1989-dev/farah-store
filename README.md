# ميسرة MAYSARA — Store v1.0

> متجر إلكتروني متكامل — Arabic RTL First — مبني للتوسع

---

## 🗂️ هيكل الملفات

```
maysara-store/
│
├── index.html              ← الصفحة الرئيسية
├── css/
│   └── style.css           ← Design System كامل (RTL, Variables, Components)
├── js/
│   ├── data.js             ← Data Layer (Products / Orders / Sellers schemas)
│   ├── cart.js             ← Cart Manager (localStorage + Drawer UI)
│   └── main.js             ← Homepage Controller
└── pages/
    ├── product.html        ← صفحة تفاصيل المنتج
    ├── product.js          ← Product Page Controller
    ├── checkout.html       ← صفحة الدفع
    ├── checkout.js         ← Checkout Controller
    └── contact.html        ← صفحة التواصل + FAQ
```

---

## 🛠️ كيف تشغّل الموقع محلياً

افتح `index.html` مباشرة في المتصفح — لا يحتاج server.

> 💡 للتطوير المريح: نصّب VS Code + Live Server Extension

---

## ➕ كيف تضيف منتج جديد

افتح `js/data.js` وأضف object جديد في array `PRODUCTS`:

```js
{
  id:             'prod_009',          // ID فريد
  sku:            'MYS-XX-009',        // كود المنتج
  name:           'اسم المنتج',
  nameEn:         'Product Name',
  category:       'home',              // home | beauty | kitchen | fashion | sports | tech | kids | other
  description:    'وصف المنتج...',
  price:          350,                 // سعر البيع (جنيه)
  priceWholesale: 150,                 // سعر الجملة (خاص — مش بيظهر للعميل)
  priceOriginal:  499,                 // السعر الأصلي قبل الخصم (null لو مفيش خصم)
  discount:       30,                  // نسبة الخصم (0 لو مفيش)
  stock:          40,
  images: [
    'https://...',                     // صورة رئيسية
    'https://...',                     // صورة إضافية (اختياري)
  ],
  variants: {
    colors: ['أحمر', 'أزرق'],         // اختياري — أو {} لو مفيش variants
  },
  rating:    4.7,
  reviews:   120,
  sold:      300,
  badge:     'جديد',                  // null لو مفيش
  badgeType: 'new',                   // 'new' | 'hot' | 'sale'
  featured:  true,                    // هيظهر في الصفحة الرئيسية؟
  createdAt: '2026-04-01',
}
```

---

## 💳 ربط Paymob (المرحلة القادمة)

في `pages/checkout.js` في دالة `initPlaceOrder()` فيه comment:

```js
// TODO: هنا هيتم استدعاء Paymob API بعد ربط الـ API key
```

**خطوات الربط:**
1. سجّل على [paymob.com](https://paymob.com) واحصل على API Key
2. في `checkout.js`، استبدل الـ simulation بـ `fetch()` لـ Paymob `/auth/tokens`
3. Paymob flow: Auth → Order Registration → Payment Key → iFrame

---

## 🚚 ربط شركة شحن

في `js/data.js` دالة `calculateShipping()`:
```js
function calculateShipping(subtotal, governorate = 'cairo') {
  const FREE_THRESHOLD = 500;   // ← عدّل حد الشحن المجاني
  const BASE_RATE      = 65;    // ← سعر القاهرة/الجيزة
  const PROVINCE_RATE  = 90;    // ← سعر المحافظات
  // ...
}
```

---

## 📦 هيكل البيانات للتوسع

```
products/   ✅ جاهز — المنتج (سعر، صور، فئة، stock)
orders/     ✅ جاهز — الطلبات (منفصلة عن المنتج)
sellers/    ⏳ محجوز — جاهز للأفلييت في المرحلة 4
```

---

## 🗺️ خارطة الطريق

| المرحلة | الوصف | الحالة |
|---------|-------|--------|
| 1 | الموقع الأساسي + Cart + Checkout | ✅ مكتمل |
| 2 | ربط Paymob + شركة شحن | 🔜 التالي |
| 3 | Dashboard إدارة المنتجات والطلبات | 📋 مخطط |
| 4 | نظام الأفلييت (sellers table) | 🔮 مستقبلي |

---

© 2026 MAYSARA — Built for scale from day one.
