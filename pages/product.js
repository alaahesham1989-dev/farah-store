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

  // Automatically update product UI when products update from Firestore
  window.addEventListener('FarahDBProductsUpdated', render);
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
  if (metaDesc) {
    metaDesc.content = typeof product.description === 'object' && product.description !== null
      ? (product.description.overview || '')
      : (product.description || '');
  }

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

  // Description and Marketing Content
  const infoDesc = document.getElementById('info-desc');
  const btnShowMore = document.getElementById('btn-show-more');
  const descOverlay = document.getElementById('desc-overlay');
  const descContainer = infoDesc ? infoDesc.closest('.product-desc-box') : null;
  
  if (infoDesc) {
    // If we have rich marketing content (Landing Page design from Admin)
    if (product.marketing) {
      if (btnShowMore) btnShowMore.style.display = 'none';
      if (descOverlay) descOverlay.style.display = 'none';
      
      infoDesc.style.maxHeight = 'none';
      infoDesc.style.overflow = 'visible';
      
      // Inject full-width marketing content
      infoDesc.innerHTML = `<div class="marketing-content" style="width: 100%;">${product.marketing}</div>`;
      
    } else {
      // Fallback: Display whatever description is available as a simple text block
      if (btnShowMore) btnShowMore.style.display = 'none';
      if (descOverlay) descOverlay.style.display = 'none';
      infoDesc.style.maxHeight = 'none';
      infoDesc.style.overflow = 'visible';
      
      let finalDesc = '';
      if (typeof product.description === 'object' && product.description !== null) {
          finalDesc = `
            <div style="font-family:'Cairo',sans-serif; line-height:1.8; font-size:1.05rem; color:var(--text-dark);">
              ${product.description.overview ? `<p>${product.description.overview}</p>` : ''}
              ${product.description.howToUse ? `<h4>كيفية الاستخدام:</h4><p>${product.description.howToUse}</p>` : ''}
              ${product.description.indications ? `<h4>دواعي الاستخدام:</h4><p>${product.description.indications}</p>` : ''}
              ${product.description.problemsSolved ? `<h4>المشاكل التي يحلها:</h4><p>${product.description.problemsSolved}</p>` : ''}
            </div>
          `;
      } else {
          finalDesc = `<div style="font-family:'Cairo',sans-serif; line-height:1.8; font-size:1.05rem; color:var(--text-dark);">${product.description || 'لا يوجد وصف متاح.'}</div>`;
      }
      
      infoDesc.innerHTML = `<div class="marketing-content" style="width: 100%; padding: 1rem 0;">${finalDesc}</div>`;
    } // End of marketing else branch
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


  // ─── Landing Page Sections ────────────────────────
  const heroHookBlock = document.getElementById('hero-hook-block');
  const infoHeroScript = document.getElementById('info-hero-script');
  if (product.landingPageScript && heroHookBlock && infoHeroScript) {
    infoHeroScript.innerHTML = product.landingPageScript.replace(/\n/g, '<br>');
    heroHookBlock.style.display = 'block';
  }

  const lpBenefitsSection = document.getElementById('lp-benefits-section');
  const infoUses = document.getElementById('info-uses');
  const infoProblems = document.getElementById('info-problems');
  const lpUsesCard = document.getElementById('lp-uses-card');
  const lpProblemsCard = document.getElementById('lp-problems-card');
  
  let hasBenefits = false;
  if (product.uses && infoUses) {
    infoUses.innerHTML = product.uses.replace(/\n/g, '<br>');
    if(lpUsesCard) lpUsesCard.style.display = 'block';
    hasBenefits = true;
  }
  if (product.problemsSolved && infoProblems) {
    infoProblems.innerHTML = product.problemsSolved.replace(/\n/g, '<br>');
    if(lpProblemsCard) lpProblemsCard.style.display = 'block';
    hasBenefits = true;
  }
  if (hasBenefits && lpBenefitsSection) {
    lpBenefitsSection.style.display = 'block';
  }

  const lpHowItWorksSection = document.getElementById('lp-how-it-works-section');
  const infoHowWorks = document.getElementById('info-how-works');
  if (product.howItWorks && infoHowWorks && lpHowItWorksSection) {
    infoHowWorks.innerHTML = product.howItWorks.replace(/\n/g, '<br>');
    lpHowItWorksSection.style.display = 'block';
  }

  const lpHowToUseSection = document.getElementById('lp-how-to-use-section');
  const infoSteps = document.getElementById('info-steps');
  if (product.howToUse && infoSteps && lpHowToUseSection) {
    const stepsText = product.howToUse;
    // split by numbers like "1. ", "2. ", etc.
    const stepsArray = stepsText.split(/(?=\d+\.\s)/).filter(s => s.trim().length > 0);
    if (stepsArray.length > 1) {
       infoSteps.innerHTML = stepsArray.map(step => {
         let stepMatch = step.match(/^(\d+)\.\s*(.*)/);
         if(stepMatch) {
            return `<div class="lp-step-item"><div class="lp-step-number">${stepMatch[1]}</div><div class="lp-step-text">${stepMatch[2]}</div></div>`;
         } else {
            return `<div class="lp-step-item"><div class="lp-step-number">✨</div><div class="lp-step-text">${step}</div></div>`;
         }
       }).join('');
    } else {
       infoSteps.innerHTML = `<div class="lp-step-item"><div class="lp-step-number">📌</div><div class="lp-step-text">${product.howToUse}</div></div>`;
    }
    lpHowToUseSection.style.display = 'block';
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
  const addToCartBlock = document.getElementById('add-to-cart-block');
  const buyNowWrap = document.getElementById('buy-now-wrap');
  const notifyMeBlock = document.getElementById('notify-me-block');

  if (product.stock > 10) {
    if(stockEl) stockEl.innerHTML = `<span style="color:var(--success)">✅ متاح (${product.stock} قطعة)</span>`;
    if(addToCartBlock) addToCartBlock.style.display = 'flex';
    if(buyNowWrap) buyNowWrap.style.display = 'flex';
    if(notifyMeBlock) notifyMeBlock.style.display = 'none';
  } else if (product.stock > 0) {
    if(stockEl) stockEl.innerHTML = `<span style="color:var(--warning)">⚠️ آخر ${product.stock} قطع</span>`;
    if(addToCartBlock) addToCartBlock.style.display = 'flex';
    if(buyNowWrap) buyNowWrap.style.display = 'flex';
    if(notifyMeBlock) notifyMeBlock.style.display = 'none';
  } else {
    if(stockEl) stockEl.innerHTML = `<span style="color:var(--danger)">❌ نفذت الكمية</span>`;
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

  // Helper for rendering stars locally since main.js isn't available
  const getStars = (rating) => {
    const full = Math.floor(rating || 0), half = (rating || 0) % 1 >= 0.5, empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '★' : '') + '☆'.repeat(empty);
  };
  
  const getCatName = (id) => FarahDB.CATEGORIES.find(c => c.id === id)?.name || id;

  grid.innerHTML = related.map((p, i) => {
    const hasDiscount = p.priceOriginal && p.discount > 0;
    const badge = p.badge ? `<span class="prod-card-badge badge-${p.badgeType||'sale'}">${p.badge}</span>` : '';
    const stars = getStars(p.rating);
    const catName = getCatName(p.category);
    const isOutOfStock = p.stock <= 0;
    
    const cartBtnHtml = isOutOfStock
      ? `<button class="prod-add-btn notify-btn" data-id="${p.id}" aria-label="أعلمني عند التوفر" style="width: auto; padding: 0 12px; font-size: 0.8rem; border-radius: 4px; background: #666; color: #fff; font-family: var(--font);">أعلمني متى</button>`
      : `<button class="prod-add-btn add-cart-btn" data-id="${p.id}" aria-label="أضف للسلة">
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
         </button>`;
         
    return `
    <article class="prod-grid-card fade-up active" data-id="${p.id}" style="animation-delay:${i*0.08}s; opacity:1; transform:none; margin:0 auto; cursor:pointer;" onclick="window.location.href='product.html?id=${p.id}'">
      <div class="prod-card-img">
        <img src="${(p.images && p.images.length > 0) ? getImageUrl(p.images[0]) : \'https://via.placeholder.com/260x260/f3efe7/0b1929?text=No+Image\'}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/260x260/f3efe7/0b1929?text=لا+توجد+صورة'" />
        ${badge}
      </div>
      <div class="prod-card-body">
        <div class="prod-card-cat">${catName}</div>
        <div class="prod-card-name">${p.name}</div>
        <div class="prod-card-stars">${stars} <span>(${p.reviews || 0})</span></div>
        <div class="prod-card-footer">
          <div class="prod-card-price">
            <span class="prod-price-now">${p.price.toLocaleString('ar-EG')} <span>ج.م</span></span>
            ${hasDiscount ? `<span class="prod-price-was">${p.priceOriginal.toLocaleString('ar-EG')} <span>ج.م</span></span>` : ''}
          </div>
          ${cartBtnHtml}
        </div>
      </div>
    </article>
    `;
  }).join('');

  grid.querySelectorAll('.add-cart-btn, .notify-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent card click
      const p = FarahDB.getProductById(btn.dataset.id);
      if (p && !btn.classList.contains('notify-btn')) {
        Cart.add(p);
        // Animate button
        btn.classList.add('added');
        setTimeout(() => btn.classList.remove('added'), 2000);
      }
    });
  });
}

// ─── Notify Me Logic ──────────────────────────────
function initNotifyMe(product) {
  const btnNotifySubmit = document.getElementById('btn-notify-submit');
  if (btnNotifySubmit) {
    const clone = btnNotifySubmit.cloneNode(true);
    btnNotifySubmit.parentNode.replaceChild(clone, btnNotifySubmit);
  }

  const newBtnNotifySubmit = document.getElementById('btn-notify-submit');
  const notifyName = document.getElementById('notify-name');
  const notifyPhone = document.getElementById('notify-phone');
  const notifyBlock = document.getElementById('notify-me-block');
  
  if (!newBtnNotifySubmit) return;
  
  newBtnNotifySubmit.addEventListener('click', () => {
    const name = notifyName.value.trim();
    const phone = notifyPhone.value.trim();
    
    if (!name || !phone) {
      alert('يرجى إدخال الاسم ورقم الهاتف للتواصل معك عند التوفر.');
      return;
    }
    
    const notificationData = {
      sku: product.sku || '',
      customerName: name,
      phone: phone,
      status: 'pending',
      createdAt: new Date()
    };

    // Save to Firestore if available
    if (window.db) {
      window.db.collection('stock_notifications').add(notificationData)
        .then(() => console.log('Successfully saved notification to Firestore'))
        .catch(err => console.error('Failed to save notification to Firestore:', err));
    }

    // Save to FarahDB.Storage as fallback/cache
    let notifications = [];
    if (window.FarahDB && FarahDB.Storage) {
      notifications = FarahDB.Storage.get('stock_notifications', []);
    }
    notifications.push({
      productId: product.id,
      ...notificationData,
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
  // Re-bind elements to clear previous listeners by replacing them with clones!
  const qtyDecrease = document.getElementById('qty-decrease');
  const qtyIncrease = document.getElementById('qty-increase');
  const btnAdd      = document.getElementById('btn-add-cart');
  const btnBuy      = document.getElementById('btn-buy-now');
  const btnWhatsApp = document.getElementById('btn-share-whatsapp');
  const btnCopyLink = document.getElementById('btn-copy-link');

  if (qtyDecrease) {
    const clone = qtyDecrease.cloneNode(true);
    qtyDecrease.parentNode.replaceChild(clone, qtyDecrease);
  }
  if (qtyIncrease) {
    const clone = qtyIncrease.cloneNode(true);
    qtyIncrease.parentNode.replaceChild(clone, qtyIncrease);
  }
  if (btnAdd) {
    const clone = btnAdd.cloneNode(true);
    btnAdd.parentNode.replaceChild(clone, btnAdd);
  }
  if (btnBuy) {
    const clone = btnBuy.cloneNode(true);
    btnBuy.parentNode.replaceChild(clone, btnBuy);
  }
  if (btnWhatsApp) {
    const clone = btnWhatsApp.cloneNode(true);
    btnWhatsApp.parentNode.replaceChild(clone, btnWhatsApp);
  }
  if (btnCopyLink) {
    const clone = btnCopyLink.cloneNode(true);
    btnCopyLink.parentNode.replaceChild(clone, btnCopyLink);
  }

  // Query fresh cloned elements
  const qtyNum         = document.getElementById('qty-num');
  const newQtyDecrease = document.getElementById('qty-decrease');
  const newQtyIncrease = document.getElementById('qty-increase');
  const newBtnAdd      = document.getElementById('btn-add-cart');
  const newBtnBuy      = document.getElementById('btn-buy-now');
  const newBtnWhatsApp = document.getElementById('btn-share-whatsapp');
  const newBtnCopyLink = document.getElementById('btn-copy-link');

  let qty = 1;

  function updateQtyDisplay() {
    if (qtyNum) qtyNum.value = qty;
  }

  newQtyDecrease?.addEventListener('click', () => { qty = Math.max(1, qty - 1); updateQtyDisplay(); });
  newQtyIncrease?.addEventListener('click', () => { qty = Math.min(product.stock, qty + 1); updateQtyDisplay(); });

  function getSelectedVariant() {
    const active = document.querySelector('.variant-btn.active');
    if (!active) return {};
    return { [active.dataset.variantKey]: active.dataset.variantVal };
  }

  const handleAdd = () => {
    Cart.add(product, qty, getSelectedVariant());
    if (newBtnAdd) {
      newBtnAdd.textContent = '⬅️ متابعة التسوق';
      newBtnAdd.style.background = 'var(--success)';
      newBtnAdd.style.borderColor = 'var(--success)';
      newBtnAdd.removeEventListener('click', handleAdd);
      newBtnAdd.addEventListener('click', () => {
        window.location.href = '../index.html#all-products';
      });
    }
  };
  newBtnAdd?.addEventListener('click', handleAdd);

  newBtnBuy?.addEventListener('click', () => {
    Cart.add(product, qty, getSelectedVariant());
    if (window.openCartDrawer) {
      window.openCartDrawer();
    } else {
      window.location.href = 'checkout.html'; // Fallback
    }
  });

  // Messenger Inquiry
  const btnMessenger = document.getElementById('btn-messenger-inquire');
  if (btnMessenger) {
    btnMessenger.href = `https://m.me/61565914903592?ref=${product.sku}`;
  }

  // Share WhatsApp
  newBtnWhatsApp?.addEventListener('click', () => {
    const url = encodeURIComponent(window.location.href);
    const msg = encodeURIComponent(`🛍️ شوف المنتج ده على فرح استور:\n${product.name}\nبـ ${product.price} ج.م\n${window.location.href}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  });

  // Copy link
  newBtnCopyLink?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('✅ تم نسخ الرابط', 'success', 2000);
    } catch {
      showToast('⚠️ تعذّر نسخ الرابط', 'warning', 2000);
    }
  });

  // Header nav
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');
  const navOverlay = document.getElementById('mobile-nav-overlay');
  const closeBtn  = document.getElementById('mobile-nav-close');

  const openNav  = () => { mobileNav?.classList.add('open'); navOverlay?.classList.add('open'); hamburger?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const closeNav = () => { mobileNav?.classList.remove('open'); navOverlay?.classList.remove('open'); hamburger?.classList.remove('open'); document.body.style.overflow = ''; };

  hamburger?.addEventListener('click', () => mobileNav?.classList.contains('open') ? closeNav() : openNav());
  closeBtn?.addEventListener('click', closeNav);
  navOverlay?.addEventListener('click', closeNav);
  
  const bottomCartToggle = document.getElementById('cart-toggle-bottom');
  if(bottomCartToggle && window.openCartDrawer) {
     bottomCartToggle.addEventListener('click', (e) => {
         e.preventDefault();
         window.openCartDrawer();
     });
  }
}

// ─── Scroll ───────────────────────────────────────
function initScrollBehavior() {
  const btn = document.getElementById('back-to-top');
  window.addEventListener('scroll', () => {
    btn?.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
 