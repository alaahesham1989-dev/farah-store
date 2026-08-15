/**
 * FARAH 2026 — Main Page Controller
 * Bento Grid · Quick View · Flash Deals · Scroll Animations
 */

'use strict';

/* ══════════════════════════════════════
   BOOT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initSearch();
  initBento();
  initFlashTimer();

  Cart.updateUI();
  renderCartDrawerNew(); // Fix: Render cart items on page load
  initMobileBottomNav();
  initCategoriesDrawer();
  initAdvancedIntersectionObserver();
  initHeroVideo();
  initThemeSwitcher();
  initDSHero();
  syncShippingSettings(); // ← Firestore shipping settings sync

  const renderAllSections = () => {
    initCounterAnimation();
    initNewArrivals();
    initDailyDeal();
    initAllProducts();
    initQuickView();
    initScrollUtils();
    initNewsletter();
    initSeeAll();
  };

  if (window.FarahDB && window.FarahDB.productsReady) {
    window.FarahDB.productsReady.then(renderAllSections).catch(renderAllSections);
  } else {
    renderAllSections();
  }

  window.addEventListener('FarahDBProductsUpdated', () => {
    initNewArrivals();
    initDailyDeal();
    renderAllProducts();
  });
});

/* ══════════════════════════════════════
   SHIPPING SETTINGS — Firestore Sync
══════════════════════════════════════ */
/**
 * يستمع لـ settings/shipping في Firestore ويخزن النتيجة في Storage
 * لتستخدمها calculateShipping() بشكل تلقائي في كل حساب.
 * لو المستند غير موجود، يكتب القيم الافتراضية فيه.
 */
function syncShippingSettings() {
  if (!window.db) return; // Firestore غير متاح

  const DEFAULT_SETTINGS = {
    freeShippingThreshold: 600,
    rates: { zone1: 85, zone2: 95, zone3: 110 }
  };

  const ref = window.db.collection('settings').doc('shipping');

  ref.get().then(snap => {
    if (!snap.exists) {
      // أول مرة: اكتب القيم الافتراضية
      ref.set(DEFAULT_SETTINGS)
        .then(() => console.log('[Farah] Seeded default shipping settings in Firestore'))
        .catch(err => console.warn('[Farah] Could not seed shipping settings:', err));
    }
  });

  // استمع للتغييرات اللحظية
  ref.onSnapshot(snap => {
    if (snap.exists) {
      const data = snap.data();
      if (window.FarahDB && FarahDB.Storage) {
        FarahDB.Storage.set('shipping_settings', data);
      }
    }
  }, err => {
    console.warn('[Farah] Shipping settings onSnapshot error:', err);
  });
}


/* ══════════════════════════════════════
   NAVBAR
══════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 30);
  }, { passive: true });
}

/* ══════════════════════════════════════
   MOBILE NAV
══════════════════════════════════════ */
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const overlay   = document.getElementById('mobile-nav-overlay');
  const closeBtn  = document.getElementById('mobile-nav-close');

  const open  = () => { mobileNav?.classList.add('open'); overlay?.classList.add('open'); hamburger?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { mobileNav?.classList.remove('open'); overlay?.classList.remove('open'); hamburger?.classList.remove('open'); document.body.style.overflow = ''; };

  hamburger?.addEventListener('click', () => mobileNav?.classList.contains('open') ? close() : open());
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

/* ══════════════════════════════════════
   SEARCH
══════════════════════════════════════ */
function initSearch() {
  const searchBtn     = document.getElementById('search-btn');
  const searchOverlay = document.getElementById('search-overlay');
  const searchClose   = document.getElementById('search-close');
  const searchInput   = document.getElementById('search-input');
  const resultsEl     = document.getElementById('search-results');

  const open  = () => { searchOverlay?.classList.add('open'); setTimeout(() => searchInput?.focus(), 150); };
  const close = () => { searchOverlay?.classList.remove('open'); if (searchInput) searchInput.value = ''; if (resultsEl) resultsEl.innerHTML = ''; };

  searchBtn?.addEventListener('click', open);
  searchClose?.addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  let debounce;
  searchInput?.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      const q = searchInput.value.trim();
      if (!q) { resultsEl.innerHTML = ''; return; }
      const results = FarahDB.searchProducts(q).slice(0, 6);
      if (!resultsEl) return;
      if (!results.length) {
        resultsEl.innerHTML = `<p style="color:var(--text-soft);font-size:.9rem">لا توجد نتائج لـ "${q}"</p>`;
        return;
      }
      resultsEl.innerHTML = results.map(p => `
        <a href="pages/product.html?id=${p.id}" class="search-result-item" style="
          display:flex;align-items:center;gap:10px;
          background:#fff;border:1.5px solid var(--cream-2);
          border-radius:12px;padding:10px;cursor:pointer;
          text-decoration:none;color:inherit;
          transition:border-color .15s;min-width:200px;
          flex:1 0 180px;
        " onmouseenter="this.classList.add('search-hover')" onmouseleave="this.classList.remove('search-hover')">
          <img src="${p.images[0]}" alt="${p.name}" style="width:52px;height:52px;object-fit:cover;border-radius:8px;background:var(--cream)" />
          <div>
            <div style="font-size:.82rem;font-weight:700;color:var(--navy)">${p.name}</div>
            <div style="font-size:.78rem;color:var(--gold-dark);font-weight:800">${p.price.toLocaleString('ar-EG')} ج.م</div>
          </div>
        </a>
      `).join('');
    }, 280);
  });
}

/* ══════════════════════════════════════
   BENTO GRID — Quick events
══════════════════════════════════════ */
function initBento() {
  // Quick add buttons in bento
  document.querySelectorAll('.bento-quick-add[data-product-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = FarahDB.getProductById(btn.dataset.productId);
      if (p) { Cart.add(p); animateAddBtn(btn); }
    });
  });

  // Quick view from bento
  document.querySelectorAll('[data-quick-view]').forEach(el => {
    el.addEventListener('click', e => {
      const id = el.dataset.quickView;
      if (id) openQuickView(id);
    });
  });

  // Product hero → product page
  document.getElementById('bento-feat')?.addEventListener('click', e => {
    if (e.target.closest('.bento-quick-add')) return;
    window.location.href = 'pages/product.html?id=prod_003';
  });
  document.querySelectorAll('.bento-product-sm[data-quick-view]').forEach(card => {
    card.addEventListener('click', () => openQuickView(card.dataset.quickView));
  });
}

function animateAddBtn(btn) {
  const orig = btn.innerHTML;
  btn.innerHTML = '✓';
  btn.style.background = 'var(--gold)';
  setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 1800);
}

/* ══════════════════════════════════════
   FLASH TIMER
══════════════════════════════════════ */
let flashEnd;
function initFlashTimer() {
  const saved = FarahDB.Storage.get('flash_end');
  if (saved && saved > Date.now()) {
    flashEnd = saved;
  } else {
    flashEnd = Date.now() + (3 * 3600 + 27 * 60 + 45) * 1000;
    FarahDB.Storage.set('flash_end', flashEnd);
  }
  tickTimer();
  setInterval(tickTimer, 1000);
}
function tickTimer() {
  const diff = Math.max(0, flashEnd - Date.now());
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const fmt = n => String(n).padStart(2, '0');

  ['t-h','t-h2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fmt(h); });
  ['t-m','t-m2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fmt(m); });
  ['t-s','t-s2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = fmt(s); });
}

/* ══════════════════════════════════════
   COUNTER ANIMATION
══════════════════════════════════════ */
function initCounterAnimation() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el     = entry.target;
      const target = +el.dataset.target;
      const suffix = target >= 100 ? '%' : (target >= 1000 ? '+' : '+');
      let cur = 0;
      const step = Math.ceil(target / 50);
      const iv = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = cur.toLocaleString('ar-EG') + suffix;
        if (cur >= target) clearInterval(iv);
      }, 30);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
}

/* ══════════════════════════════════════
   PRODUCT CARD FACTORY
══════════════════════════════════════ */
function buildProdCard(product, type = 'card') {
  const badge     = product.badge ? `<span class="prod-card-badge badge-${product.badgeType||'sale'}">${product.badge}</span>` : '';
  const hasDisc   = product.priceOriginal && product.discount > 0;
  const stars     = renderStars(product.rating);
  const catName   = getCatName(product.category);
  const isOutOfStock = product.stock <= 0;
  
  const cartBtnHtml = isOutOfStock
    ? `<button class="prod-add-btn notify-btn" data-id="${product.id}" aria-label="أعلمني عند التوفر" style="width: auto; padding: 0 12px; font-size: 0.8rem; border-radius: 4px; background: #666; color: #fff; font-family: var(--font);">أعلمني 🔔</button>`
    : `<button class="prod-add-btn add-cart-btn" data-id="${product.id}" aria-label="أضف للسلة">
         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
       </button>`;

  if (type === 'h-scroll') {
    return `
    <article class="prod-card fade-up" data-id="${product.id}">
      <div class="prod-card-img">
        <img src="${product.images[0]}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/240x220/f3efe7/0b1929?text=📦'" />
        ${badge}
        <div class="prod-card-actions">
          <button class="prod-action-btn quick-view-btn" data-id="${product.id}" aria-label="عرض سريع" title="عرض سريع">👁️</button>
          <button class="prod-action-btn wishlist-btn" aria-label="مفضلة" title="أضف للمفضلة">🤍</button>
        </div>
      </div>
      <div class="prod-card-body">
        <div class="prod-card-cat" data-i18n="cat_${product.category}">${typeof i18n !== 'undefined' ? i18n[currentLang]['cat_'+product.category] : catName}</div>
        <div class="prod-card-name">${typeof currentLang !== 'undefined' && currentLang === 'en' && product.nameEn ? product.nameEn : product.name}</div>
        <div class="prod-card-stars">${stars} <span>(${product.reviews})</span></div>
        <div class="prod-card-footer">
          <div class="prod-card-price">
            <span class="prod-price-now">${product.price.toLocaleString(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en-US' : 'ar-EG')} <span data-i18n="product_price_currency">${typeof i18n !== 'undefined' ? i18n[currentLang].product_price_currency : 'ج.م'}</span></span>
            ${hasDisc ? `<span class="prod-price-was">${product.priceOriginal.toLocaleString(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en-US' : 'ar-EG')} <span data-i18n="product_price_currency">${typeof i18n !== 'undefined' ? i18n[currentLang].product_price_currency : 'ج.م'}</span></span>` : ''}
          </div>
          ${cartBtnHtml}
        </div>
      </div>
    </article>`;
  }

  // grid card
  return `
  <article class="prod-grid-card fade-up" data-id="${product.id}">
    <div class="prod-card-img">
      <img src="${product.images[0]}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/260x260/f3efe7/0b1929?text=📦'" />
      ${badge}
      <div class="prod-card-actions">
        <button class="prod-action-btn quick-view-btn" data-id="${product.id}" aria-label="عرض سريع" title="عرض سريع">👁️</button>
        <button class="prod-action-btn wishlist-btn" aria-label="مفضلة" title="مفضلة">🤍</button>
      </div>
    </div>
    <div class="prod-card-body">
      <div class="prod-card-cat" data-i18n="cat_${product.category}">${typeof i18n !== 'undefined' ? i18n[currentLang]['cat_'+product.category] : catName}</div>
      <div class="prod-card-name">${typeof currentLang !== 'undefined' && currentLang === 'en' && product.nameEn ? product.nameEn : product.name}</div>
      <div class="prod-card-stars">${stars} <span>(${product.reviews})</span></div>
      <div class="prod-card-footer">
        <div class="prod-card-price">
          <span class="prod-price-now">${product.price.toLocaleString(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en-US' : 'ar-EG')} <span data-i18n="product_price_currency">${typeof i18n !== 'undefined' ? i18n[currentLang].product_price_currency : 'ج.م'}</span></span>
          ${hasDisc ? `<span class="prod-price-was">${product.priceOriginal.toLocaleString(typeof currentLang !== 'undefined' && currentLang === 'en' ? 'en-US' : 'ar-EG')} <span data-i18n="product_price_currency">${typeof i18n !== 'undefined' ? i18n[currentLang].product_price_currency : 'ج.م'}</span></span>` : ''}
        </div>
        ${cartBtnHtml}
      </div>
    </div>
  </article>`;
}

function attachCardEvents(container) {
  container.querySelectorAll('.add-cart-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = FarahDB.getProductById(btn.dataset.id);
      if (p) { Cart.add(p); animateAddBtn(btn); }
    });
  });
  container.querySelectorAll('.notify-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      window.location.href = `pages/product.html?id=${btn.dataset.id}`;
    });
  });
  container.querySelectorAll('.quick-view-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openQuickView(btn.dataset.id);
    });
  });
  container.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.textContent = btn.textContent === '🤍' ? '❤️' : '🤍';
      showToast('❤️ أُضيف للمفضلة', 'success', 2000);
    });
  });
  // Navigate to product page on card click
  container.querySelectorAll('[data-id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      window.location.href = `pages/product.html?id=${card.dataset.id}`;
    });
  });
}

/* ══════════════════════════════════════
   NEW ARRIVALS — Horizontal Scroll
══════════════════════════════════════ */
function initNewArrivals() {
  const track = document.getElementById('new-arrivals-track');
  if (!track) return;

  const sorted = [...FarahDB.PRODUCTS]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  track.innerHTML = sorted.map(p => buildProdCard(p, 'h-scroll')).join('');
  attachCardEvents(track);

  // Scroll button
  document.getElementById('arrivals-scroll-btn')?.addEventListener('click', () => {
    track.scrollBy({ left: -280, behavior: 'smooth' });
  });
}

/* ══════════════════════════════════════
   DAILY DEAL
══════════════════════════════════════ */
function getDailyDeal() {
  let dealsQueue = window.FarahDB && window.FarahDB.Storage ? FarahDB.Storage.get('daily_deals_queue', []) : [];
  
  // Clean up migration from old schemas
  if (dealsQueue.length > 0 && typeof dealsQueue[0] === 'string') {
    dealsQueue = [];
  }
  
  const now = new Date();
  
  // Fallback if empty
  if (!dealsQueue || dealsQueue.length === 0) {
    if (window.FarahDB && FarahDB.PRODUCTS) {
      const firstFlash = FarahDB.PRODUCTS.find(p => p.isFlash);
      if (firstFlash) {
        dealsQueue = [{ productId: firstFlash.id, offerPrice: firstFlash.price }];
      } else if (FarahDB.PRODUCTS.length > 0) {
        dealsQueue = [{ productId: FarahDB.PRODUCTS[0].id, offerPrice: FarahDB.PRODUCTS[0].price }];
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  
  let currentIndex = window.FarahDB && FarahDB.Storage ? FarahDB.Storage.get('current_deal_index', 0) : 0;
  let lastDealDate = window.FarahDB && FarahDB.Storage ? FarahDB.Storage.get('last_deal_date', now.toDateString()) : now.toDateString();
  
  const todayStr = now.toDateString();
  if (todayStr !== lastDealDate) {
    // It's a new day! Move to the next deal
    currentIndex = (currentIndex + 1) % dealsQueue.length;
    lastDealDate = todayStr;
    if (window.FarahDB && FarahDB.Storage) {
      FarahDB.Storage.set('current_deal_index', currentIndex);
      FarahDB.Storage.set('last_deal_date', lastDealDate);
    }
  }
  
  // The deal always ends at midnight today (23:59:59.999)
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
  
  // Ensure index is within bounds if queue was modified
  if (currentIndex >= dealsQueue.length) {
    currentIndex = 0;
  }
  
  const activeDeal = dealsQueue[currentIndex];
  
  return {
    productId: activeDeal.productId,
    offerPrice: activeDeal.offerPrice,
    expiresAt: endOfDay
  };
}

let dailyDealTimerInterval = null;

function initDailyDeal() {
  const grid = document.getElementById('daily-deal-wrapper');
  if (!grid) return;
  
  const dealInfo = getDailyDeal();
  if (!dealInfo) {
    grid.closest('section')?.remove();
    return;
  }
  
  const p = window.FarahDB ? FarahDB.getProductById(dealInfo.productId) : null;
  if (!p) {
    grid.closest('section')?.remove();
    return;
  }
  
  const offerPrice = dealInfo.offerPrice;
  const priceOriginal = p.priceOriginal || p.price;
  
  const disc = priceOriginal > offerPrice
    ? Math.round((1 - offerPrice / priceOriginal) * 100)
    : 0;

  grid.innerHTML = `
  <article class="flash-card" data-id="${p.id}" style="width: 100%; max-width: 400px; margin: 0 auto; transform: scale(1.05);">
    <div class="flash-card-img" style="height: 280px;">
      <img src="${p.images[0]}" alt="${p.name}" loading="lazy" onerror="this.src='https://placehold.co/220x200/0e0b1e/ffffff?text=\u{1F4E6}'" style="object-fit: contain;" />
      ${disc ? `<span class="flash-discount-badge" style="font-size: 1.1rem; padding: 6px 12px;">${disc}% خصم</span>` : ''}
    </div>
    <div class="flash-card-body">
      <div class="flash-card-name" style="font-size: 1.25rem;">${p.name}</div>
      <div class="flash-card-prices" style="margin-top: 10px;">
        <span class="flash-card-new" style="font-size: 1.5rem;">${offerPrice.toLocaleString('ar-EG')} ج.م</span>
        ${priceOriginal > offerPrice ? `<span class="flash-card-old" style="font-size: 1rem;">${priceOriginal.toLocaleString('ar-EG')} ج.م</span>` : ''}
      </div>
      <button class="btn btn-gold w-full add-cart-btn" data-id="${p.id}" style="margin-top:1.5rem;font-size:1.1rem;padding:12px; border-radius: 8px;">أضف للسلة الآن</button>
    </div>
  </article>`;

  if (dailyDealTimerInterval) clearInterval(dailyDealTimerInterval);
  
  const updateTimer = () => {
    const now = Date.now();
    const remaining = Math.max(0, dealInfo.expiresAt - now);
    
    if (remaining === 0) {
      clearInterval(dailyDealTimerInterval);
      initDailyDeal();
      return;
    }
    
    const h = Math.floor(remaining / (1000 * 60 * 60));
    const m = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((remaining % (1000 * 60)) / 1000);
    
    const hEl = document.getElementById('d-h2');
    const mEl = document.getElementById('d-m2');
    const sEl = document.getElementById('d-s2');
    
    if (hEl) hEl.textContent = String(h).padStart(2, '0');
    if (mEl) mEl.textContent = String(m).padStart(2, '0');
    if (sEl) sEl.textContent = String(s).padStart(2, '0');
  };
  
  updateTimer();
  dailyDealTimerInterval = setInterval(updateTimer, 1000);

  grid.querySelector('.add-cart-btn').addEventListener('click', e => {
    e.stopPropagation();
    if (window.Cart) { 
      // override price for cart? We might need to ensure cart takes the offerPrice
      // for now, we just pass the product. Ideally, we should clone it and set its price.
      const clone = { ...p, price: offerPrice, isOffer: true };
      Cart.add(clone); 
      animateAddBtn(e.target); 
    }
  });
  grid.querySelector('.flash-card').addEventListener('click', e => {
    if (e.target.closest('button')) return;
    openQuickView(p.id);
  });
}

/* ══════════════════════════════════════
   ALL PRODUCTS
══════════════════════════════════════ */
let allFilter   = 'all';
let allVisible  = 1000;
const PAGE_SIZE = 1000;

function initAllProducts() {
  const bar = document.getElementById('filter-bar');
  if (bar) {
    const cats = FarahDB.enrichCategoriesWithCount().filter(c => c.count > 0);
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-chip';
      btn.dataset.filter = cat.id;
      btn.textContent = `${cat.icon} ${cat.name}`;
      bar.appendChild(btn);
    });
    bar.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      bar.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      allFilter  = chip.dataset.filter;
      allVisible = 8;
      renderAllProducts();
    });
  }

  document.getElementById('load-more')?.addEventListener('click', () => {
    allVisible += PAGE_SIZE;
    renderAllProducts();
  });

  renderAllProducts();
}

function filterAllProducts(catId) {
  allFilter  = catId;
  allVisible = 1000;
  // Update chips
  document.querySelectorAll('.filter-chip').forEach(c => {
    c.classList.toggle('active', c.dataset.filter === catId);
  });
  renderAllProducts();
}

function renderAllProducts() {
  const grid = document.getElementById('all-products-grid');
  const btn  = document.getElementById('load-more');
  if (!grid) return;

  const all   = FarahDB.getProductsByCategory(allFilter);
  const slice = all.slice(0, allVisible);

  grid.innerHTML = slice.length
    ? slice.map(p => buildProdCard(p, 'grid')).join('')
    : `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-soft)">
         <div style="font-size:3rem;margin-bottom:.75rem">🔍</div>
         <p>لا توجد منتجات في هذا القسم</p>
       </div>`;

  if (btn) btn.style.display = all.length > allVisible ? 'inline-flex' : 'none';
  attachCardEvents(grid);
  observeCards(grid);
}

/* ══════════════════════════════════════
   QUICK VIEW DRAWER
══════════════════════════════════════ */
function initQuickView() {
  const overlay = document.getElementById('qv-overlay');
  const drawer  = document.getElementById('qv-drawer');
  const close   = document.getElementById('qv-close');

  overlay?.addEventListener('click', closeQV);
  close?.addEventListener('click', closeQV);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeQV(); });
}

function openQuickView(productId) {
  const product = FarahDB.getProductById(productId);
  if (!product) return;

  const drawer  = document.getElementById('qv-drawer');
  const overlay = document.getElementById('qv-overlay');
  const body    = document.getElementById('qv-body');
  const title   = document.getElementById('qv-title');

  if (!body) return;

  // Title
  if (title) title.textContent = product.name;

  // Thumbnails HTML
  const thumbsHTML = product.images.length > 1
    ? `<div class="qv-thumbs" id="qv-thumbs">${product.images.map((src, i) =>
        `<img src="${src}" class="qv-thumb ${i===0?'active':''}" data-idx="${i}" alt="صورة ${i+1}" loading="lazy" />`
      ).join('')}</div>`
    : '';

  // Variants
  const variantsHTML = product.variants && Object.keys(product.variants).length
    ? Object.entries(product.variants).map(([key, values]) => {
        const label = { colors: 'اللون', sizes: 'المقاس' }[key] || key;
        return `<div class="qv-variants">
          <div class="qv-variant-label">اختاري ${label}:</div>
          <div class="qv-variant-options">
            ${values.map((v, i) => `<button class="qv-variant-btn ${i===0?'active':''}" data-key="${key}" data-val="${v}">${v}</button>`).join('')}
          </div>
        </div>`;
      }).join('')
    : '';

  body.innerHTML = `
    <img src="${product.images[0]}" alt="${product.name}" class="qv-img" id="qv-main-img" />
    ${thumbsHTML}
    <div class="qv-cat">${getCatIcon(product.category)} ${getCatName(product.category)}</div>
    <div class="qv-name">${product.name}</div>
    <div class="qv-rating">
      <span class="qv-stars">${renderStars(product.rating)}</span>
      <span class="qv-rating-count">(${product.reviews} تقييم)</span>
      <span style="color:var(--text-soft);font-size:.8rem"> · ${product.sold.toLocaleString('ar-EG')} مبيع</span>
    </div>
    <p class="qv-desc">${typeof product.description === 'object' && product.description !== null ? (product.description.overview || '') : (product.description || '')}</p>
    <div class="qv-price-block">
      <span class="qv-price-now">${product.price.toLocaleString('ar-EG')} ج.م</span>
      ${product.priceOriginal ? `
        <span class="qv-price-was">${product.priceOriginal.toLocaleString('ar-EG')} ج.م</span>
        <span class="qv-discount">${product.discount}% خصم</span>
      ` : ''}
    </div>
    ${variantsHTML}
    ${product.stock <= 0 ? `
      <div id="qv-notify-wrap" style="background: rgba(11, 110, 79, 0.05); padding: 15px; border-radius: 8px; margin-top: 15px; border: 1px dashed var(--danger);">
        <h4 style="color: var(--danger); font-size: 1rem; margin-bottom: 8px;">❌ نفذت الكمية</h4>
        <p style="font-size: 0.85rem; color: var(--text-soft); margin-bottom: 10px;">اترك بياناتك وسنبلغك فور توفره</p>
        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
          <input type="text" id="qv-notify-name" class="form-control" placeholder="الاسم" style="flex:1; padding: 6px; font-size: 0.85rem;">
          <input type="text" id="qv-notify-phone" class="form-control" placeholder="الهاتف" style="flex:1; padding: 6px; font-size: 0.85rem;">
        </div>
        <button class="btn btn-secondary w-full" id="qv-notify-btn" style="padding: 8px;">أعلمني عند التوفر 🔔</button>
      </div>
    ` : `
      <div class="qv-actions">
        <div class="qv-qty">
          <button class="qv-qty-btn" id="qv-decrease">−</button>
          <input type="number" class="qv-qty-num" id="qv-qty" value="1" min="1" max="${product.stock}" readonly />
          <button class="qv-qty-btn" id="qv-increase">+</button>
        </div>
        <button class="btn btn-gold qv-add-btn" id="qv-add-cart">أضيفي للسلة 🛒</button>
      </div>
    `}
    <a href="pages/product.html?id=${product.id}" class="btn btn-outline-dark w-full qv-view-btn" style="margin-top:10px">عرض الصفحة الكاملة</a>
  `;

  // Thumb gallery
  body.querySelectorAll('.qv-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const mainImg = document.getElementById('qv-main-img');
      if (mainImg) mainImg.src = product.images[+thumb.dataset.idx];
      body.querySelectorAll('.qv-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  // Qty
  let qty = 1;
  document.getElementById('qv-decrease')?.addEventListener('click', () => { qty = Math.max(1, qty-1); document.getElementById('qv-qty').value = qty; });
  document.getElementById('qv-increase')?.addEventListener('click', () => { qty = Math.min(product.stock, qty+1); document.getElementById('qv-qty').value = qty; });

  // Notify Me
  document.getElementById('qv-notify-btn')?.addEventListener('click', () => {
    const name = document.getElementById('qv-notify-name').value.trim();
    const phone = document.getElementById('qv-notify-phone').value.trim();
    if(!name || !phone) {
      alert('يرجى إدخال الاسم ورقم الهاتف.');
      return;
    }
    let notifications = FarahDB.Storage ? FarahDB.Storage.get('stock_notifications', []) : [];
    notifications.push({ productId: product.id, name, phone, createdAt: Date.now() });
    if(FarahDB.Storage) FarahDB.Storage.set('stock_notifications', notifications);
    
    document.getElementById('qv-notify-wrap').innerHTML = `
      <div style="text-align: center; color: var(--success); padding: 10px;">
        <div style="font-size: 2rem; margin-bottom: 5px;">✅</div>
        <h4 style="font-size:0.95rem;">تم تسجيل طلبك بنجاح!</h4>
      </div>
    `;
  });

  // Variant click
  body.querySelectorAll('.qv-variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll(`.qv-variant-btn[data-key="${btn.dataset.key}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Add to cart
  const addBtn = document.getElementById('qv-add-cart');
  const handleQVAdd = () => {
    const variant = {};
    body.querySelectorAll('.qv-variant-btn.active').forEach(b => { variant[b.dataset.key] = b.dataset.val; });
    Cart.add(product, qty, variant);
    if (addBtn) {
      addBtn.textContent = '⬅️ متابعة التسوق';
      addBtn.style.background = 'var(--success)';
      addBtn.removeEventListener('click', handleQVAdd);
      addBtn.addEventListener('click', closeQV);
    }
  };
  addBtn?.addEventListener('click', handleQVAdd);

  // Open
  drawer?.classList.add('open');
  overlay?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeQV() {
  document.getElementById('qv-drawer')?.classList.remove('open');
  document.getElementById('qv-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

/* ══════════════════════════════════════
   (Cart Drawer logic is now in cart.js)
══════════════════════════════════════ */
// ─── CRO CART VARS ─────────────────────────────
function getFreeShippingThreshold() {
  let threshold = 600;
  if (window.FarahDB && FarahDB.Storage) {
    const saved = FarahDB.Storage.get('shipping_settings');
    if (saved && saved.freeShippingThreshold) {
      threshold = Number(saved.freeShippingThreshold);
    }
  }
  return threshold;
}
let cartRenderTimer = null;

// Override Cart renderCartDrawer to use new markup
function renderCartDrawerNew() {
  const itemsEl   = document.getElementById('cart-items');
  const emptyEl   = document.getElementById('cart-empty');
  const footerEl  = document.getElementById('cart-footer');
  const totalEl   = document.getElementById('cart-total');
  const shipEl    = document.getElementById('cart-shipping');
  const grandEl   = document.getElementById('cart-grand-total');
  const countLbl  = document.getElementById('cart-items-count');

  if (!itemsEl) return;

  const items = Cart.getItems();
  const count = Cart.getCount();

  if (countLbl) countLbl.textContent = `${count} ${count === 1 ? 'منتج' : 'منتجات'}`;

  if (Cart.isEmpty()) {
    if (emptyEl)  emptyEl.style.display  = 'flex';
    if (footerEl) footerEl.style.display = 'none';
    itemsEl.querySelectorAll('.cart-item-card').forEach(el => el.remove());
    return;
  }

  if (emptyEl)  emptyEl.style.display  = 'none';
  if (footerEl) footerEl.style.display = 'flex';

  itemsEl.querySelectorAll('.cart-item-card').forEach(el => el.remove());

  items.forEach(item => {
    const el = document.createElement('div');
    el.className = 'cart-item-card';
    el.dataset.productId  = item.productId;
    el.dataset.variantKey = item.variantKey;
    const variantLabel = item.variant && Object.values(item.variant).length
      ? `<div class="cart-item-variant">${Object.values(item.variant).join(' / ')}</div>` : '';
    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img"
           onerror="this.src='https://via.placeholder.com/72x72/f3efe7/0b1929?text=📦'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${variantLabel}
        <div class="cart-item-price">${FarahDB.formatPrice(item.price * item.qty)}</div>
        <div class="cart-item-row">
          <div class="qty-control">
            <button class="qty-btn" data-action="dec">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="inc">+</button>
          </div>
          <button class="cart-item-remove" data-action="remove">حذف</button>
        </div>
      </div>
    `;
    el.querySelector('[data-action="dec"]').addEventListener('click', () => Cart.updateQty(item.productId, item.variantKey, item.qty - 1));
    el.querySelector('[data-action="inc"]').addEventListener('click', () => Cart.updateQty(item.productId, item.variantKey, item.qty + 1));
    el.querySelector('[data-action="remove"]').addEventListener('click', () => {
      el.classList.add('removing');
      setTimeout(() => Cart.remove(item.productId, item.variantKey), 240);
    });
    itemsEl.appendChild(el);
  });

  const { subtotal, shipping, total } = Cart.getTotal();
  if (totalEl)  totalEl.textContent  = FarahDB.formatPrice(subtotal);
  if (shipEl)   shipEl.textContent   = shipping === 0 ? '🎉 مجاني' : FarahDB.formatPrice(shipping);
  if (grandEl)  grandEl.textContent  = FarahDB.formatPrice(total);

  // 1. Progress Bar Logic
  const threshold = getFreeShippingThreshold();
  const progressContainer = document.getElementById('cart-shipping-progress');
  const msgEl = document.getElementById('shipping-msg');
  const barFill = document.getElementById('shipping-bar-fill');
  const barContainer = document.getElementById('shipping-progress-bar');
  
  if (progressContainer && msgEl && barFill && barContainer) {
    if (Cart.isEmpty()) {
      progressContainer.style.display = 'none';
    } else {
      progressContainer.style.display = 'block';
      let progress = 0;
      if (subtotal < threshold) {
        const remaining = threshold - subtotal;
        msgEl.innerHTML = `باقي لك <span style="color:var(--admin-gold);font-weight:bold;">${remaining} ج.م</span> فقط وتحصل على الشحن المجاني! 🚚`;
        progress = (subtotal / threshold) * 100;
        barFill.style.background = '#FFB400'; // Gold Color
      } else {
        msgEl.innerHTML = `تهانينا! لقد حصلت على شحن مجاني تماماً على طلبك 🚚🎉`;
        progress = 100;
        barFill.style.background = '#0B6E4F'; // Teal Color
      }
      barFill.style.width = `${progress}%`;
      barContainer.setAttribute('aria-valuenow', Math.min(subtotal, threshold));
    }
  }

  // 2. Dynamic Upsell Logic (Cheapest available product in stock not already in cart)
  const upsellContainer = document.getElementById('cart-upsell-card');
  if (upsellContainer) {
    const cartProductIds = items.map(i => i.productId);
    const upsellProduct = FarahDB.PRODUCTS
      .filter(p => p.stock > 0 && !cartProductIds.includes(p.id))
      .sort((a, b) => a.price - b.price)[0];
    const isUpsellInCart = upsellProduct ? cartProductIds.includes(upsellProduct.id) : false;
    
    if (!Cart.isEmpty() && subtotal < threshold && upsellProduct && !isUpsellInCart) {
      const imgSrc = (upsellProduct.images && upsellProduct.images.length > 0) ? upsellProduct.images[0] : 'https://via.placeholder.com/80?text=📦';
      upsellContainer.innerHTML = `
        <div style="display: flex; gap: 10px; align-items: center;">
          <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" alt="${upsellProduct.name}">
          <div style="flex: 1;">
            <div style="font-size: 0.85rem; font-weight: 600; color: var(--admin-primary);">${upsellProduct.name}</div>
            <div style="font-size: 0.8rem; color: var(--text-soft);">عرض توفيري مميز 🎁</div>
            <div style="font-size: 0.9rem; font-weight: bold;">${upsellProduct.price} ج.م</div>
          </div>
          <button id="btn-upsell-add" class="btn btn-gold btn-upsell-pulse" style="padding: 6px 12px; font-size: 0.8rem; border-radius: 4px;">➕ أضف للسلة ووفر الشحن</button>
        </div>
      `;
      upsellContainer.style.display = 'block';
      setTimeout(() => upsellContainer.classList.remove('hidden-fade'), 10);
      
      const btnAddUpsell = document.getElementById('btn-upsell-add');
      if (btnAddUpsell) {
        btnAddUpsell.addEventListener('click', () => {
          Cart.add(upsellProduct);
        });
      }
    } else {
      upsellContainer.classList.add('hidden-fade');
      const onTransitionEnd = () => {
        if (upsellContainer.classList.contains('hidden-fade')) {
          upsellContainer.style.display = 'none';
        }
        upsellContainer.removeEventListener('transitionend', onTransitionEnd);
      };
      upsellContainer.addEventListener('transitionend', onTransitionEnd);
    }
  }
}

// Patch Cart.updateUI
document.addEventListener('cart:updated', () => {
  // Update badge
  const count = Cart.getCount();
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    if (count > 0) { badge.removeAttribute('data-hidden'); } else { badge.setAttribute('data-hidden',''); }
  }
  
  if (cartRenderTimer) clearTimeout(cartRenderTimer);
  cartRenderTimer = setTimeout(() => renderCartDrawerNew(), 100);
});

// Cart drawer init consolidated at the top

/* ══════════════════════════════════════
   SEE ALL LINKS
══════════════════════════════════════ */
function initSeeAll() {
  document.querySelectorAll('.see-all-link[data-filter]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const cat = link.dataset.filter;
      filterAllProducts(cat);
      document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════
   NEWSLETTER
══════════════════════════════════════ */
function initNewsletter() {
  document.getElementById('newsletter-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = e.target.querySelector('.nl-input');
    const email = input?.value?.trim();
    if (!email) return;
    const subs = FarahDB.Storage.get('newsletter', []);
    if (!subs.includes(email)) { subs.push(email); FarahDB.Storage.set('newsletter', subs); }
    showToast('🎉 تم الاشتراك! استنّي العروض الحصرية', 'success', 4000);
    if (input) input.value = '';
  });
}

/* ══════════════════════════════════════
   SCROLL UTILS
══════════════════════════════════════ */
function initScrollUtils() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => btn?.classList.toggle('show', window.scrollY > 500), { passive: true });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function observeCards(container) {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='none'; obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin:'0px 0px -30px 0px' });
  container.querySelectorAll('.fade-up').forEach(el => {
    el.style.opacity='0';el.style.transform='translateY(20px)';el.style.transition='opacity .5s ease, transform .5s ease';
    obs.observe(el);
  });
}

/* ══════════════════════════════════════
   HELPERS
══════════════════════════════════════ */
function renderStars(rating) {
  const full = Math.floor(rating), half = rating % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '⭐' : '') + '☆'.repeat(empty);
}
function getCatName(id) {
  return FarahDB.CATEGORIES.find(c => c.id === id)?.name || id;
}
function getCatIcon(id) {
  return FarahDB.CATEGORIES.find(c => c.id === id)?.icon || '📦';
}

/* ══════════════════════════════════════
   FARAH STORE 2026/2027 OVERRIDES JS
══════════════════════════════════════ */
function initMobileBottomNav() {
  // 1. Mobile Bottom Nav Cart Toggle
  const cartToggleBottom = document.getElementById('cart-toggle-bottom');
  if (cartToggleBottom) {
    cartToggleBottom.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('cart-drawer')?.classList.add('open');
      document.getElementById('cart-overlay')?.classList.add('open');
    });
  }
}

function initCategoriesDrawer() {
  const overlay = document.getElementById('cats-overlay');
  const drawer  = document.getElementById('cats-drawer');
  const closeBtn = document.getElementById('cats-close');
  const container = document.getElementById('cats-list-container');

  const open  = () => { drawer?.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const close = () => { drawer?.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow = ''; };

  // Bind triggers
  document.getElementById('cats-toggle-bottom')?.addEventListener('click', e => { e.preventDefault(); open(); });
  document.getElementById('cats-toggle-mobile')?.addEventListener('click', e => { e.preventDefault(); open(); });
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);

  // Check URL hash to open if navigated from another page
  if (window.location.hash === '#sections') {
    setTimeout(open, 300);
  }

  // Render categories dynamically
  if (container && window.FarahDB) {
    const renderCats = () => {
      const cats = FarahDB.enrichCategoriesWithCount();
      container.innerHTML = cats.map(cat => `
        <div class="cat-item-link" data-filter="${cat.id}">
          <span class="cat-item-icon">${cat.icon}</span>
          <span class="cat-item-name">${cat.name}</span>
          <span class="cat-item-count">${cat.count} منتج</span>
        </div>
      `).join('');

      container.querySelectorAll('.cat-item-link').forEach(link => {
        link.addEventListener('click', () => {
          const filter = link.dataset.filter;
          filterAllProducts(filter);
          document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth' });
          close();
        });
      });
    };

    // Render initially and on data updates
    renderCats();
    window.addEventListener('FarahDBProductsUpdated', renderCats);
  }
}

function initAdvancedIntersectionObserver() {
  // 2. Advanced IntersectionObserver for Smooth Reveals
  // Target only content elements INSIDE sections, NOT the sections themselves
  // This prevents hero/trust/topbar from getting opacity:0
  const revealElements = document.querySelectorAll('.cat-section .wide-container, .curated-section .wide-container, .flash-section .wide-container, .all-products-section .wide-container, .strip-section .strip-header, .strip-section .h-scroll-track, .newsletter .newsletter-inner, .bento-card, .prod-grid-card, .product-card');
  const revealOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -30px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
}
function initHeroVideo() {
  const video = document.getElementById('hero-video');
  const muteBtn = document.getElementById('mute-toggle-btn');
  const iconMuted = document.getElementById('icon-muted');
  const iconUnmuted = document.getElementById('icon-unmuted');
  
  if(video && muteBtn) {
    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if(video.muted) {
        iconMuted.style.display = 'block';
        iconUnmuted.style.display = 'none';
      } else {
        iconMuted.style.display = 'none';
        iconUnmuted.style.display = 'block';
      }
    });
  }
}

/* Theme Switcher */
function initThemeSwitcher() {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  
  // 1. Check local storage or default to dark (since site is built for dark primarily)
  let currentTheme = localStorage.getItem('theme') || 'dark';
  
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggles.forEach(btn => btn.textContent = '☀️'); // Show sun to switch to light
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggles.forEach(btn => btn.textContent = '🌙'); // Show moon to switch to dark
    }
    localStorage.setItem('theme', theme);
  };

  // Apply on load
  applyTheme(currentTheme);

  // Toggle on click
  themeToggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(currentTheme);
    });
  });
}

/* ═══════════════════════════════════════════════
   DS HERO LOGIC & CLICK SOUND
═══════════════════════════════════════════════ */
function initDSHero() {
  // Video toggle logic for new DS Hero
  const video = document.getElementById('hero-ds-video');
  const muteBtn = document.getElementById('ds-mute-toggle-btn');
  const iconMuted = document.getElementById('ds-icon-muted');
  const iconUnmuted = document.getElementById('ds-icon-unmuted');
  
  if(video && muteBtn) {
    muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      if(video.muted) {
        iconMuted.style.display = 'block';
        iconUnmuted.style.display = 'none';
      } else {
        iconMuted.style.display = 'none';
        iconUnmuted.style.display = 'block';
      }
    });
  }
}

// Minimal theme - Audio context removed
document.addEventListener('click', function(e) {
  const target = e.target.closest('button, a, .cat-tile, .flash-card');
  if (target) {
    // Play sound
    if(!target.classList.contains('ds-mute-btn')) {
      window.playClickSound();
    }
    
    // Ripple Effect
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const diameter = Math.max(rect.width, rect.height);
    const radius = diameter / 2;
    
    ripple.style.width = ripple.style.height = diameter + 'px';
    ripple.style.left = (e.clientX - rect.left - radius) + 'px';
    ripple.style.top = (e.clientY - rect.top - radius) + 'px';
    
    // Ensure parent is relative and overflow hidden
    const origPos = window.getComputedStyle(target).position;
    if(origPos === 'static') target.classList.add('relative-pos');
    const origOverflow = window.getComputedStyle(target).overflow;
    if(origOverflow !== 'hidden' && !target.classList.contains('ds-cta')) {
      // Don't clip glowing buttons
      target.classList.add('overflow-hidden'); 
    }
    
    target.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
});



