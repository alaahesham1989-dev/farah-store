/**
 * FARAH STORE — Product Page Controller
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id     = params.get('id');

  if (!id) { redirectHome(); return; }

  const render = () => {
    const product = FarahDB.getProductById(id);
    if (!product) { redirectHome(); return; }

    renderProduct(product);
    renderRelated(product);
    initProductActions(product);
    initNotifyMe(product);
    initScrollBehavior();
  };

  if (window.FarahDB && window.FarahDB.productsReady) {
    window.FarahDB.productsReady.then(render).catch(render);
  } else {
    render();
  }
});

// ─── Redirect ─────────────────────────────────────
function redirectHome() {
  window.location.href = '../index.html';
}

// ─── Render ───────────────────────────────────────
function getImageUrl(src) {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('../')) return src;
  if (src.startsWith('/')) return `..${src}`;
  return `../${src}`;
}

function renderProduct(product) {
  // Page title
  document.title = `${product.name} | فرح استور`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.description;

  // Breadcrumb
  const breadcrumbName = document.getElementById('breadcrumb-name');
  if (breadcrumbName) breadcrumbName.textContent = product.name;

  // Gallery
  const mainImg = document.getElementById('gallery-main-img');
  const thumbsEl = document.getElementById('gallery-thumbs');
  if (mainImg && product.images && product.images.length > 0) {
    mainImg.src = getImageUrl(product.images[0]);
    mainImg.alt = product.name;
  }
  if (thumbsEl && product.images && product.images.length > 1) {
    thumbsEl.innerHTML = product.images.map((src, i) => `
      <div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}">
        <img src="${getImageUrl(src)}" alt="${product.name} - صورة ${i+1}" loading="lazy" />
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
  const cat = FarahDB.CATEGORIES.find(c => c.id === product.category);
  const infoCat = document.getElementById('info-category');
  if(infoCat) infoCat.textContent = cat ? `${cat.icon} ${cat.name}` : product.category;

  // Name
  const infoName = document.getElementById('info-name');
  if (infoName) infoName.textContent = product.name;
  
  const infoNameEn = document.getElementById('info-name-en');
  if (infoNameEn) infoNameEn.textContent = product.nameEn || '';

  // Rating
  const infoStars = document.getElementById('info-stars');
  if(infoStars) infoStars.textContent = renderStars(product.rating);
  const infoReviews = document.getElementById('info-reviews');
  if(infoReviews) infoReviews.textContent = `(${product.reviews.toLocaleString('ar-EG')} تقييم)`;
  const infoSold = document.getElementById('info-sold');
  if(infoSold) infoSold.textContent    = `${product.sold.toLocaleString('ar-EG')} مبيع`;

  // Description
  const infoDesc = document.getElementById('info-desc');
  if (infoDesc) {
    infoDesc.innerHTML = product.description;
  }
  
  const btnShowMore = document.getElementById('btn-show-more');
  const descOverlay = document.getElementById('desc-overlay');
  if (btnShowMore && infoDesc) {
    btnShowMore.addEventListener('click', () => {
      if (infoDesc.style.maxHeight === '100px') {
        infoDesc.style.maxHeight = '1000px';
        if (descOverlay) descOverlay.style.display = 'none';
        btnShowMore.textContent = 'عرض أقل';
      } else {
        infoDesc.style.maxHeight = '100px';
        if (descOverlay) descOverlay.style.display = 'block';
        btnShowMore.textContent = 'عرض المزيد';
      }
    });
  }

  // Price
  const priceCurrent = document.getElementById('info-price');
  const priceOriginal = document.getElementById('info-original-price');
  const discountBadge = document.getElementById('info-discount-badge');

  if (priceCurrent) priceCurrent.innerHTML = `${product.price.toLocaleString('ar-EG')} <span style="font-size:1.2rem">ج.م</span>`;
  
  if (product.priceOriginal && product.priceOriginal > product.price) {
    if (priceOriginal) {
      priceOriginal.textContent = `${product.priceOriginal.toLocaleString('ar-EG')} ج.م`;
      priceOriginal.style.display = 'inline';
    }
    if (discountBadge) {
      const savedAmount = product.priceOriginal - product.price;
      discountBadge.textContent = `وفر ${savedAmount.toLocaleString('ar-EG')} ج.م`;
      discountBadge.style.display = 'inline-block';
    }
  } else {
    if (priceOriginal) priceOriginal.style.display = 'none';
    if (discountBadge) discountBadge.style.display = 'none';
  }

  // Variants
  const variantsSection = document.getElementById('variants-section');
  if (product.variants && Object.keys(product.variants).length > 0) {
    variantsSection.style.display = 'block';
    const [key, values] = Object.entries(product.variants)[0];
    const labelMap = { colors: 'اختار اللون', sizes: 'اختار المقاس' };
    const vLabel = document.getElementById('variant-label');
    if(vLabel) vLabel.textContent = labelMap[key] || key;

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
  const metaSku = document.getElementById('meta-sku');
  if (metaSku) metaSku.textContent = product.sku;
  
  const btnCopySku = document.getElementById('btn-copy-sku');
  if (btnCopySku && product.sku) {
    btnCopySku.addEventListener('click', () => {
      navigator.clipboard.writeText(product.sku).then(() => {
        const originalHtml = btnCopySku.innerHTML;
        btnCopySku.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        setTimeout(() => { btnCopySku.innerHTML = originalHtml; }, 2000);
      });
    });
  }

  const stockEl = document.getElementById('meta-stock');
  if (product.stock > 10) {
    if(stockEl) stockEl.innerHTML = `<span style="color:var(--success)">✅ متاح (${product.stock} قطعة)</span>`;
  } else if (product.stock > 0) {
    if(stockEl) stockEl.innerHTML = `<span style="color:var(--warning)">⚠️ آخر ${product.stock} قطع</span>`;
  } else {
    if(stockEl) stockEl.innerHTML = `<span style="color:var(--danger)">❌ نفذت الكمية</span>`;
    const addToCartBlock = document.getElementById('add-to-cart-block');
    const buyNowWrap = document.getElementById('buy-now-wrap');
    const notifyMeBlock = document.getElementById('notify-me-block');
    
    if(addToCartBlock) addToCartBlock.style.display = 'none';
    if(buyNowWrap) buyNowWrap.style.display = 'none';
    if(notifyMeBlock) notifyMeBlock.style.display = 'block';
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

  const related = FarahDB.PRODUCTS
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
      const p = FarahDB.getProductById(el.dataset.id);
      if (p) Cart.add(p);
    });
    el.addEventListener('click', () => {
      window.location.href = `product.html?id=${el.dataset.id}`;
    });
  });
}

// ─── Notify Me Logic ──────────────────────────────
function initNotifyMe(product) {
  const btnNotifySubmit = document.getElementById('btn-notify-submit');
  const notifyName = document.getElementById('notify-name');
  const notifyPhone = document.getElementById('notify-phone');
  const notifyBlock = document.getElementById('notify-me-block');
  
  if (!btnNotifySubmit) return;
  
  btnNotifySubmit.addEventListener('click', () => {
    const name = notifyName.value.trim();
    const phone = notifyPhone.value.trim();
    
    if (!name || !phone) {
      alert('يرجى إدخال الاسم ورقم الهاتف للتواصل معك عند التوفر.');
      return;
    }
    
    // Save to FarahDB.Storage
    let notifications = [];
    if (window.FarahDB && FarahDB.Storage) {
      notifications = FarahDB.Storage.get('stock_notifications', []);
    }
    
    notifications.push({
      productId: product.id,
      sku: product.sku || '',
      name: name,
      phone: phone,
      createdAt: Date.now()
    });
    
    if (window.FarahDB && FarahDB.Storage) {
      FarahDB.Storage.set('stock_notifications', notifications);
    }
    
    notifyBlock.innerHTML = `
      <div style="text-align: center; color: var(--success); padding: 10px;">
        <div style="font-size: 2.5rem; margin-bottom: 10px;">✅</div>
        <h4>تم تسجيل طلبك بنجاح!</h4>
        <p style="font-size:0.9rem;">سنقوم بإبلاغك فور توفر المنتج مرة أخرى.</p>
      </div>
    `;
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
 