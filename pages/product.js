/**
 * FARAH STORE — Product Page Controller
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { redirectHome(); return; }

  const product = MaysaraDB.getProductById(id);
  if (!product) { redirectHome(); return; }

  renderProduct(product);
  renderRelated(product);
  initProductActions(product);
  initScrollBehavior();
});

// ─── Redirect ─────────────────────────────────────
function redirectHome() {
  window.location.href = '../index.html';
}

// ─── Render ───────────────────────────────────────
function renderProduct(product) {
  // Page title
  document.title = `${product.name} | فرح استور`;
  document.querySelector('meta[name="description"]').content = product.description;

  // Breadcrumb
  document.getElementById('breadcrumb-name').textContent = product.name;

  // Gallery
  const mainImg = document.getElementById('gallery-main-img');
  const thumbsEl = document.getElementById('gallery-thumbs');
  if (mainImg) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
  }
  if (thumbsEl && product.images.length > 1) {
    thumbsEl.innerHTML = product.images.map((src, i) => `
      <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${src}" alt="${product.name} - صورة ${i+1}" loading="lazy" />
      </div>
    `).join('');

    thumbsEl.querySelectorAll('.gallery-thumb').forEach(thumb => {
      thumb.addEventListener('click', () => {
        const idx = +thumb.dataset.index;
        mainImg.src = product.images[idx];
        thumbsEl.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      });
    });
  }

  // Category
  const cat = MaysaraDB.CATEGORIES.find(c => c.id === product.category);
  document.getElementById('info-category').textContent = cat ? `${cat.icon} ${cat.name}` : product.category;

  // Name
  document.getElementById('info-name').textContent = product.name;

  // Rating
  document.getElementById('info-stars').textContent = renderStars(product.rating);
  document.getElementById('info-reviews').textContent = `(${product.reviews.toLocaleString('ar-EG')} تقييم)`;
  document.getElementById('info-sold').textContent    = `${product.sold.toLocaleString('ar-EG')} مبيع`;

  // Description
  document.getElementById('info-desc').textContent = product.description;

  // Price
  document.getElementById('info-price').innerHTML =
    `${product.price.toLocaleString('ar-EG')} <span style="font-size:1rem">ج.م</span>`;
  if (product.discount > 0 && product.priceOriginal) {
    const badge = document.getElementById('info-discount-badge');
    badge.textContent    = `خصم ${product.discount}%`;
    badge.style.display  = 'inline-block';
    const origEl = document.getElementById('info-original-price');
    origEl.textContent   = `${product.priceOriginal.toLocaleString('ar-EG')} ج.م`;
  }

  // Variants
  const variantsSection = document.getElementById('variants-section');
  if (product.variants && Object.keys(product.variants).length > 0) {
    variantsSection.style.display = 'block';
    const [key, values] = Object.entries(product.variants)[0];
    const labelMap = { colors: 'اختار اللون', sizes: 'اختار المقاس' };
    document.getElementById('variant-label').textContent = labelMap[key] || key;

    const optionsEl = document.getElementById('variant-options');
    optionsEl.innerHTML = values.map((v, i) => `
      <button class="variant-btn ${i === 0 ? 'active' : ''}" data-variant-key="${key}" data-variant-val="${v}">${v}</button>
    `).join('');

    optionsEl.querySelectorAll('.variant-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        optionsEl.querySelectorAll('.variant-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  // SKU & Stock
  document.getElementById('meta-sku').textContent = product.sku;
  const stockEl = document.getElementById('meta-stock');
  if (product.stock > 10) {
    stockEl.innerHTML = `<span style="color:var(--success)">✅ متاح (${product.stock} قطعة)</span>`;
  } else if (product.stock > 0) {
    stockEl.innerHTML = `<span style="color:var(--warning)">⚠️ آخر ${product.stock} قطع</span>`;
  } else {
    stockEl.innerHTML = `<span style="color:var(--danger)">❌ نفذت الكمية</span>`;
    document.getElementById('btn-add-cart').disabled = true;
    document.getElementById('btn-buy-now').disabled  = true;
  }
}

// ─── Render Stars ─────────────────────────────────
function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

// ─── Related Products ─────────────────────────────
function renderRelated(product) {
  const grid = document.getElementById('related-grid');
  if (!grid) return;

  const related = MaysaraDB.PRODUCTS
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  if (related.length === 0) {
    grid.closest('section').style.display = 'none';
    return;
  }

  grid.innerHTML = related.map((p, i) => {
    const hasDiscount = p.discount > 0 && p.priceOriginal;
    return `
      <article class="product-card animate-in" data-id="${p.id}" style="animation-delay:${i*0.08}s" role="button" tabindex="0" aria-label="${p.name}">
        <div class="product-img-wrap">
          <img src="${p.images[0]}" alt="${p.name}" class="product-img" loading="lazy" onerror="this.src='https://via.placeholder.com/400x400/f3f0ea/0d1b2a?text=📦'" />
          ${p.badge ? `<span class="product-badge badge-${p.badgeType||'sale'}">${p.badge}</span>` : ''}
        </div>
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-price-row">
            <div class="price-current">${p.price.toLocaleString('ar-EG')} ج.م</div>
            <button class="btn-add-cart" data-id="${p.id}" aria-label="أضف للسلة">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  grid.querySelectorAll('[data-id]').forEach(el => {
    el.querySelector('.btn-add-cart')?.addEventListener('click', e => {
      e.stopPropagation();
      const p = MaysaraDB.getProductById(el.dataset.id);
      if (p) Cart.add(p);
    });
    el.addEventListener('click', () => {
      window.location.href = `product.html?id=${el.dataset.id}`;
    });
  });
}

// ─── Product Actions ──────────────────────────────
function initProductActions(product) {
  const qtyNum      = document.getElementById('qty-num');
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');
  const btnAdd      = document.getElementById('btn-add-cart');
  const btnBuy      = document.getElementById('btn-buy-now');
  const btnWhatsApp = document.getElementById('btn-share-whatsapp');
  const btnCopyLink = document.getElementById('btn-copy-link');

  let qty = 1;

  function updateQtyDisplay() {
    if (qtyNum) qtyNum.value = qty;
  }

  qtyDecrease?.addEventListener('click', () => { qty = Math.max(1, qty - 1); updateQtyDisplay(); });
  qtyIncrease?.addEventListener('click', () => { qty = Math.min(product.stock, qty + 1); updateQtyDisplay(); });

  function getSelectedVariant() {
    const active = document.querySelector('.variant-btn.active');
    if (!active) return {};
    return { [active.dataset.variantKey]: active.dataset.variantVal };
  }

  btnAdd?.addEventListener('click', () => {
    Cart.add(product, qty, getSelectedVariant());
    // Animate button
    btnAdd.textContent = '✅ أُضيف للسلة!';
    btnAdd.style.background = 'var(--success)';
    setTimeout(() => {
      btnAdd.textContent = '🛒 أضف للسلة';
      btnAdd.style.background = '';
    }, 2000);
  });

  btnBuy?.addEventListener('click', () => {
    Cart.add(product, qty, getSelectedVariant());
    window.location.href = 'checkout.html';
  });

  // Messenger Inquiry
  const btnMessenger = document.getElementById('btn-messenger-inquire');
  if (btnMessenger) {
    btnMessenger.href = `https://m.me/61565914903592?ref=${product.sku}`;
  }

  // Share WhatsApp
  btnWhatsApp?.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    const msg = encodeURIComponent(`🛍️ شوف المنتج ده على فرح استور:\n${product.name}\nبـ ${product.price} ج.م\n${window.location.href}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  });

  // Copy link
  btnCopyLink?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('✅ تم نسخ الرابط', 'success', 2000);
    } catch {
      showToast('⚠️ تعذّر نسخ الرابط', 'warning', 2000);
    }
  });

  // Header nav
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks?.classList.toggle('open');
  });
}

// ─── Scroll ───────────────────────────────────────
function initScrollBehavior() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
