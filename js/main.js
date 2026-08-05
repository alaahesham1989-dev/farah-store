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
  initCounterAnimation();
  initNewArrivals();
  initCategoryMosaic();
  initCuratedSection('home', 'home-products-row');
  initCuratedSection('fashion', 'fashion-products-row');
  initFlashDeals();
  initAllProducts();
  initQuickView();
  initScrollUtils();
  initNewsletter();
  initSeeAll();
});

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
      const results = MaysaraDB.searchProducts(q).slice(0, 6);
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
        " onmouseenter="this.style.borderColor='var(--gold)'" onmouseleave="this.style.borderColor='var(--cream-2)'">
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
      const p = MaysaraDB.getProductById(btn.dataset.productId);
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
  const saved = MaysaraDB.Storage.get('flash_end');
  if (saved && saved > Date.now()) {
    flashEnd = saved;
  } else {
    flashEnd = Date.now() + (3 * 3600 + 27 * 60 + 45) * 1000;
    MaysaraDB.Storage.set('flash_end', flashEnd);
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
          <button class="prod-add-btn add-cart-btn" data-id="${product.id}" aria-label="أضف للسلة">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
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
        <button class="prod-add-btn add-cart-btn" data-id="${product.id}" aria-label="أضف للسلة">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

function attachCardEvents(container) {
  container.querySelectorAll('.add-cart-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = MaysaraDB.getProductById(btn.dataset.id);
      if (p) { Cart.add(p); animateAddBtn(btn); }
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

  const sorted = [...MaysaraDB.PRODUCTS]
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
   CATEGORY MOSAIC
══════════════════════════════════════ */
function initCategoryMosaic() {
  const grid = document.getElementById('cat-mosaic');
  if (!grid) return;

  const cats = MaysaraDB.enrichCategoriesWithCount();
  grid.innerHTML = cats.map((cat, i) => `
    <div class="cat-tile fade-up fade-up-${(i % 4) + 1}" data-cat="${cat.id}" role="button" tabindex="0" aria-label="${cat.name}">
      <span class="cat-icon">${cat.icon}</span>
      <div class="cat-name" data-i18n="cat_${cat.id}">${typeof i18n !== 'undefined' ? i18n[currentLang]['cat_'+cat.id] : cat.name}</div>
      <div class="cat-count">${cat.count} <span data-i18n="product_items">${typeof i18n !== 'undefined' ? i18n[currentLang]['product_items'] : 'منتج'}</span></div>
    </div>
  `).join('');

  grid.querySelectorAll('.cat-tile').forEach(tile => {
    const go = () => {
      filterAllProducts(tile.dataset.cat);
      document.getElementById('all-products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    tile.addEventListener('click', go);
    tile.addEventListener('keydown', e => e.key === 'Enter' && go());
  });
}

/* ══════════════════════════════════════
   CURATED SECTIONS
══════════════════════════════════════ */
function initCuratedSection(categoryId, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const products = MaysaraDB.getProductsByCategory(categoryId).slice(0, 4);
  if (!products.length) { el.closest('section')?.remove(); return; }
  el.innerHTML = products.map(p => buildProdCard(p, 'grid')).join('');
  attachCardEvents(el);
}

/* ══════════════════════════════════════
   FLASH DEALS
══════════════════════════════════════ */
const FLASH_PRODUCTS = ['prod_005', 'prod_006', 'prod_003', 'prod_008'];
const FLASH_STOCKS   = { prod_005: 72, prod_006: 45, prod_003: 88, prod_008: 30 };

function initFlashDeals() {
  const grid = document.getElementById('flash-grid');
  if (!grid) return;

  const products = FLASH_PRODUCTS.map(id => MaysaraDB.getProductById(id)).filter(Boolean);
  grid.innerHTML = products.map(p => {
    const stockPct = FLASH_STOCKS[p.id] || 60;
    return `
    <article class="flash-card" data-id="${p.id}">
      <div class="flash-card-img">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/220x200/0e0b1e/ffffff?text=📦'" />
        ${p.discount ? `<span class="flash-discount-badge">${p.discount}% خصم</span>` : ''}
      </div>
      <div class="flash-card-body">
        <div class="flash-card-name">${p.name}</div>
        <div class="flash-card-prices">
          <span class="flash-card-new">${p.price.toLocaleString('ar-EG')} ج.م</span>
          ${p.priceOriginal ? `<span class="flash-card-old">${p.priceOriginal.toLocaleString('ar-EG')} ج.م</span>` : ''}
        </div>
        <div class="flash-progress"><div class="flash-progress-bar" style="width:${stockPct}%"></div></div>
        <div class="flash-stock-text">تم بيع ${stockPct}% من الكمية</div>
        <button class="btn btn-gold w-full add-cart-btn" data-id="${p.id}" style="margin-top:.75rem;font-size:.85rem;padding:10px">
          أضيفي للسلة
        </button>
      </div>
    </article>`;
  }).join('');

  grid.querySelectorAll('.add-cart-btn[data-id]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const p = MaysaraDB.getProductById(btn.dataset.id);
      if (p) { Cart.add(p); animateAddBtn(btn); }
    });
  });
  grid.querySelectorAll('.flash-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      openQuickView(card.dataset.id);
    });
  });
}

/* ══════════════════════════════════════
   ALL PRODUCTS
══════════════════════════════════════ */
let allFilter   = 'all';
let allVisible  = 8;
const PAGE_SIZE = 4;

function initAllProducts() {
  const bar = document.getElementById('filter-bar');
  if (bar) {
    const cats = MaysaraDB.enrichCategoriesWithCount().filter(c => c.count > 0);
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
  allVisible = 8;
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

  const all   = MaysaraDB.getProductsByCategory(allFilter);
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
  const product = MaysaraDB.getProductById(productId);
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
    <p class="qv-desc">${product.description}</p>
    <div class="qv-price-block">
      <span class="qv-price-now">${product.price.toLocaleString('ar-EG')} ج.م</span>
      ${product.priceOriginal ? `
        <span class="qv-price-was">${product.priceOriginal.toLocaleString('ar-EG')} ج.م</span>
        <span class="qv-discount">${product.discount}% خصم</span>
      ` : ''}
    </div>
    ${variantsHTML}
    <div class="qv-actions">
      <div class="qv-qty">
        <button class="qv-qty-btn" id="qv-decrease">−</button>
        <input type="number" class="qv-qty-num" id="qv-qty" value="1" min="1" max="${product.stock}" readonly />
        <button class="qv-qty-btn" id="qv-increase">+</button>
      </div>
      <button class="btn btn-gold qv-add-btn" id="qv-add-cart">أضيفي للسلة 🛒</button>
    </div>
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

  // Variants
  body.querySelectorAll('.qv-variant-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      body.querySelectorAll(`.qv-variant-btn[data-key="${btn.dataset.key}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // Add to cart
  document.getElementById('qv-add-cart')?.addEventListener('click', () => {
    const variant = {};
    body.querySelectorAll('.qv-variant-btn.active').forEach(b => { variant[b.dataset.key] = b.dataset.val; });
    Cart.add(product, qty, variant);
    const addBtn = document.getElementById('qv-add-cart');
    if (addBtn) { addBtn.textContent = '✅ أُضيف للسلة!'; setTimeout(() => { addBtn.textContent = 'أضيفي للسلة 🛒'; }, 2000); }
  });

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
   CART DRAWER
══════════════════════════════════════ */
function initCartDrawer() {
  const overlay = document.getElementById('cart-overlay');
  const drawer  = document.getElementById('cart-drawer');
  const closeBtn = document.getElementById('cart-close');
  const toggle   = document.getElementById('cart-toggle');
  const emptyShop = document.getElementById('cart-empty-shop');

  const open  = () => { drawer?.classList.add('open'); overlay?.classList.add('open'); document.body.style.overflow='hidden'; };
  const close = () => { drawer?.classList.remove('open'); overlay?.classList.remove('open'); document.body.style.overflow=''; };

  toggle?.addEventListener('click', () => drawer?.classList.contains('open') ? close() : open());
  overlay?.addEventListener('click', close);
  closeBtn?.addEventListener('click', close);
  emptyShop?.addEventListener('click', close);
  document.getElementById('clear-cart')?.addEventListener('click', () => { Cart.clear(); showToast('🗑️ تم إفراغ السلة', 'info', 2000); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer?.classList.contains('open')) close(); });
}

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
        <div class="cart-item-price">${MaysaraDB.formatPrice(item.price * item.qty)}</div>
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
      el.style.opacity = '0';el.style.transform='translateX(-20px)';el.style.transition='.25s ease';
      setTimeout(() => Cart.remove(item.productId, item.variantKey), 240);
    });
    itemsEl.appendChild(el);
  });

  const { subtotal, shipping, total } = Cart.getTotal();
  if (totalEl)  totalEl.textContent  = MaysaraDB.formatPrice(subtotal);
  if (shipEl)   shipEl.textContent   = shipping === 0 ? '🎉 مجاني' : MaysaraDB.formatPrice(shipping);
  if (grandEl)  grandEl.textContent  = MaysaraDB.formatPrice(total);
}

// Patch Cart.updateUI
const _origSave = Cart.updateUI;
document.addEventListener('cart:updated', () => {
  // Update badge
  const count = Cart.getCount();
  const badge = document.getElementById('cart-count');
  if (badge) {
    badge.textContent = count;
    if (count > 0) { badge.removeAttribute('data-hidden'); } else { badge.setAttribute('data-hidden',''); }
  }
  renderCartDrawerNew();
});

// Init cart drawer
document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  Cart.updateUI();
});

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
    const subs = MaysaraDB.Storage.get('newsletter', []);
    if (!subs.includes(email)) { subs.push(email); MaysaraDB.Storage.set('newsletter', subs); }
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
  return MaysaraDB.CATEGORIES.find(c => c.id === id)?.name || id;
}
function getCatIcon(id) {
  return MaysaraDB.CATEGORIES.find(c => c.id === id)?.icon || '📦';
}

/* ══════════════════════════════════════
   FARAH STORE 2026/2027 OVERRIDES JS
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Bottom Nav Cart Toggle
  const cartToggleBottom = document.getElementById('cart-toggle-bottom');
  if (cartToggleBottom) {
    cartToggleBottom.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById('cart-drawer')?.classList.add('open');
      document.getElementById('cart-overlay')?.classList.add('open');
    });
  }

  // 2. Advanced IntersectionObserver for Smooth Reveals
  const revealElements = document.querySelectorAll('section, .bento-card, .prod-grid-card, .product-card');
  const revealOptions = {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // observer.unobserve(entry.target); // keep observing for dynamic scrolling or unobserve for performance
      }
    });
  }, revealOptions);

  revealElements.forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
});
document.addEventListener('DOMContentLoaded', () => {
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
});

/* ?? Theme Switcher ?? */
document.addEventListener('DOMContentLoaded', () => {
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  
  // 1. Check local storage or default to dark (since site is built for dark primarily)
  let currentTheme = localStorage.getItem('theme') || 'dark';
  
  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      themeToggles.forEach(btn => btn.textContent = '??'); // Show sun to switch to light
    } else {
      document.documentElement.removeAttribute('data-theme');
      themeToggles.forEach(btn => btn.textContent = '??'); // Show moon to switch to dark
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
});

/* ═══════════════════════════════════════════════
   DS HERO LOGIC & CLICK SOUND
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
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

  // Global click sound & ripple effect
  // A tiny, soft 'pop' sound as base64 (very lightweight, 10ms)
  const clickAudio = new Audio('data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'); 
  // Above is a silent placeholder. I'll use a valid tiny blip data URI or a simple oscillator.
});

// Using a lightweight oscillator for the click sound so we don't need external files!
let audioCtx;
window.playClickSound = function() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    // Frequency sweep for a nice 'blip' sound
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime); // Volume
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.1);
  } catch(e) {}
};

// Add ripple effect and sound to all buttons and links globally
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
    if(origPos === 'static') target.style.position = 'relative';
    const origOverflow = window.getComputedStyle(target).overflow;
    if(origOverflow !== 'hidden' && !target.classList.contains('ds-cta')) {
      // Don't clip glowing buttons
      target.style.overflow = 'hidden'; 
    }
    
    target.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }
});
