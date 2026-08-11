const i18n = {
  ar: {
    "nav_home": "الرئيسية",
    "nav_new": "وصل جديد",
    "nav_categories": "الأقسام",
    "nav_offers": "عروض",
    "nav_contact": "تواصل",
    "search_placeholder": "ابحث عن منتج...",
    "cart_title": "سلة المشتريات",
    "cart_empty": "السلة فارغة",
    "cart_total": "الإجمالي",
    "cart_checkout": "إتمام الطلب",
    "hero_title": "تسوق بذكاء، ووفر أكثر",
    "hero_subtitle": "عروض وخصومات مميزة يومياً على كل ما تحتاجه.",
    "hero_btn": "تسوق الآن",
    "trust_free_shipping": "شحن مجاني فوق 500 ج.م",
    "trust_cod": "دفع عند الاستلام متاح",
    "trust_daily_offers": "🎁 عروض يومية حصرية",
    "trust_fast_delivery": "توصيل 24 ساعة",
    "trust_secure_pay": "دفع آمن",
    "trust_returns": "إرجاع 7 أيام",
    "new_arrivals_badge": "✨ وصل حديثاً",
    "new_arrivals_title": "الجديد في المتجر",
    "categories_badge": "📦 أقسام المتجر",
    "categories_title": "تسوق حسب اهتمامك",
    "curated_home_badge": "🏠 أجهزة ذكية وعملية",
    "curated_home_title": "اختيارات ذكية ليومك",
    "see_all": "عرض الكل ←",
    "flash_deals_badge": "⚡ تصفيات وخصومات محدودة",
    "flash_deals_title": "عروض الحرق السريع!",
    "curated_beauty_badge": "✨ أجهزة العناية والجمال",
    "curated_beauty_title": "دللي نفسك",
    "footer_rights": "جميع الحقوق محفوظة © فرح استور 2026",
    "product_items": "منتج",
    "product_add_to_cart": "أضف للسلة",
    "product_price_currency": "ج.م",
    "btn_lang": "EN",
    "cat_home": "المنزل والديكور",
    "cat_beauty": "العناية الشخصية",
    "cat_kitchen": "المطبخ",
    "cat_fashion": "الأزياء والإكسسوار",
    "cat_sports": "الرياضة",
    "cat_tech": "الإلكترونيات",
    "cat_kids": "الأطفال",
    "cat_other": "منوعات"
  },
  en: {
    "nav_home": "Home",
    "nav_new": "New Arrivals",
    "nav_categories": "Categories",
    "nav_offers": "Offers",
    "nav_contact": "Contact",
    "search_placeholder": "Search products...",
    "cart_title": "Shopping Cart",
    "cart_empty": "Your cart is empty",
    "cart_total": "Total",
    "cart_checkout": "Checkout",
    "hero_title": "Shop Smart, Save More",
    "hero_subtitle": "Exclusive daily deals on everything you need.",
    "hero_btn": "Shop Now",
    "trust_free_shipping": "Free Shipping over 500 EGP",
    "trust_cod": "Cash on Delivery Available",
    "trust_daily_offers": "🎁 Exclusive Daily Offers",
    "trust_fast_delivery": "24H Delivery",
    "trust_secure_pay": "Secure Payment",
    "trust_returns": "7-Day Returns",
    "new_arrivals_badge": "✨ New Arrivals",
    "new_arrivals_title": "Latest in Store",
    "categories_badge": "📦 Store Categories",
    "categories_title": "Shop by Interest",
    "curated_home_badge": "🏠 Smart & Practical",
    "curated_home_title": "Smart Picks for You",
    "see_all": "See All ←",
    "flash_deals_badge": "⚡ Limited Time Offers",
    "flash_deals_title": "Flash Sales!",
    "curated_beauty_badge": "✨ Beauty & Care",
    "curated_beauty_title": "Pamper Yourself",
    "footer_rights": "All Rights Reserved © Farah Store 2026",
    "product_items": "Items",
    "product_add_to_cart": "Add to Cart",
    "product_price_currency": "EGP",
    "btn_lang": "عربي",
    "cat_home": "Home & Decor",
    "cat_beauty": "Beauty & Care",
    "cat_kitchen": "Kitchen",
    "cat_fashion": "Fashion",
    "cat_sports": "Sports",
    "cat_tech": "Electronics",
    "cat_kids": "Kids",
    "cat_other": "Misc"
  }
};

let currentLang = localStorage.getItem('siteLang') || (navigator.language.startsWith('ar') ? 'ar' : 'en');

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('siteLang', lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) {
      if (el.tagName === 'INPUT' && el.type === 'search') {
        el.placeholder = i18n[lang][key];
      } else {
        const textNode = Array.from(el.childNodes).find(n => n.nodeType === 3 && n.nodeValue.trim() !== '');
        if (textNode) {
          textNode.nodeValue = i18n[lang][key];
        } else if (el.children.length > 0) {
          el.append(document.createTextNode(' ' + i18n[lang][key]));
        } else {
          el.textContent = i18n[lang][key];
        }
      }
    }
  });

  const langBtns = document.querySelectorAll('.lang-toggle-btn');
  langBtns.forEach(btn => {
    btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
  });
  
  if (typeof initCategoryMosaic === 'function') initCategoryMosaic();
  if (typeof renderAllProducts === 'function') renderAllProducts();
}

function toggleLang() {
  applyLang(currentLang === 'ar' ? 'en' : 'ar');
}

document.addEventListener('DOMContentLoaded', () => {
  applyLang(currentLang);
  document.querySelectorAll('.lang-toggle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleLang();
    });
  });
});
