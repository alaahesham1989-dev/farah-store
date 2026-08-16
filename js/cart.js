/**
 * FARAH STORE — Cart Manager
 * يعمل عبر localStorage، متزامن مع كل صفحة
 */

'use strict';

/* ══════════════════════════════════════
   CRO CART VARS & PROGRESS
══════════════════════════════════════ */
function getFreeShippingThreshold() {
  let threshold = 600;
  if(window.FarahDB && window.FarahDB.adminSettings && window.FarahDB.adminSettings.shipping_threshold) {
    threshold = parseInt(window.FarahDB.adminSettings.shipping_threshold, 10);
  }
  return threshold || 600;
}

function updateShippingProgress() {
  const threshold = getFreeShippingThreshold();
  const barFill = document.getElementById('shipping-bar-fill');
  const msgEl = document.getElementById('shipping-msg');
  const progContainer = document.getElementById('cart-shipping-progress');
  if(!progContainer) return;

  const { subtotal } = Cart.getTotal();
  progContainer.style.display = 'block';

  if (subtotal >= threshold) {
    if(barFill) { barFill.style.width = '100%'; barFill.style.background = 'var(--success)'; }
    if(msgEl) msgEl.innerHTML = `🎉 مبروك! لقد حصلت على <strong>شحن مجاني</strong>`;
  } else {
    const diff = threshold - subtotal;
    const pct = Math.min(100, (subtotal / threshold) * 100);
    if(barFill) { barFill.style.width = pct + '%'; barFill.style.background = 'var(--admin-gold)'; }
    if(msgEl) msgEl.innerHTML = `أضف منتجات بقيمة <strong>${window.FarahDB ? window.FarahDB.formatPrice(diff) : diff + ' ج.م'}</strong> للحصول على شحن مجاني 🚚`;
  }
}

const Cart = (() => {
  const CART_KEY = 'cart';

  // ─── State ──────────────────────────────────────
  let items = FarahDB.Storage.get(CART_KEY, []);

  // ─── Persistence ────────────────────────────────
  function save() {
    FarahDB.Storage.set(CART_KEY, items);
    updateUI();
    document.dispatchEvent(new CustomEvent('cart:updated', { detail: { items, total: getTotal() } }));
  }

  // ─── Core Methods ────────────────────────────────
  function add(product, qty = 1, variant = {}) {
    const variantKey = JSON.stringify(variant);
    const existingIdx = items.findIndex(i => i.productId === product.id && i.variantKey === variantKey);

    if (existingIdx > -1) {
      items[existingIdx].qty = Math.min(items[existingIdx].qty + qty, product.stock);
    } else {
      items.push({
        productId:  product.id,
        sku:        product.sku,
        name:       product.name,
        price:      product.price,
        image:      product.images[0] || '',
        category:   product.category,
        qty,
        variantKey,
        variant,
        stock:      product.stock,
      });
    }
    save();
    showToast(`✅ أُضيف "${product.name}" للسلة`);
  }

  function remove(productId, variantKey = '{}') {
    items = items.filter(i => !(i.productId === productId && i.variantKey === variantKey));
    save();
  }

  function updateQty(productId, variantKey = '{}', newQty) {
    const idx = items.findIndex(i => i.productId === productId && i.variantKey === variantKey);
    if (idx === -1) return;
    if (newQty <= 0) { remove(productId, variantKey); return; }
    items[idx].qty = Math.min(newQty, items[idx].stock);
    save();
  }

  function clear() {
    items = [];
    save();
  }

  // ─── Getters ─────────────────────────────────────
  function getItems()  { return [...items]; }
  function getCount()  { return items.reduce((sum, i) => sum + i.qty, 0); }
  function getSubtotal() { return items.reduce((sum, i) => sum + i.price * i.qty, 0); }
  function getTotal(governorate = 'cairo') {
    const sub      = getSubtotal();
    const shipping = FarahDB.calculateShipping(sub, governorate);
    return { subtotal: sub, shipping, total: sub + shipping };
  }
  function isEmpty()   { return items.length === 0; }

  // ─── UI Updates ──────────────────────────────────
  function updateUI() {
    // Badge count
    const count    = getCount();
    const badgeEl  = document.getElementById('cart-count');
    const bottomEl = document.getElementById('cart-count-bottom');
    
    if (badgeEl) {
      badgeEl.textContent = count;
      badgeEl.style.opacity    = count > 0 ? '1' : '0';
      badgeEl.style.transform  = count > 0 ? 'scale(1)' : 'scale(0)';
    }

    if (bottomEl) {
      bottomEl.textContent = count;
    }

    // Drawer items
    renderCartDrawer();
  }

  function renderCartDrawer() {
    const itemsEl   = document.getElementById('cart-items');
    const emptyEl   = document.getElementById('cart-empty');
    const footerEl  = document.getElementById('cart-footer');
    const totalEl   = document.getElementById('cart-total');
    const shippingEl= document.getElementById('cart-shipping');
    const countLbl  = document.getElementById('cart-items-count');
    const grandEl   = document.getElementById('cart-grand-total');

    if (!itemsEl) return;

    const count = getCount();
    if (countLbl) countLbl.textContent = `${count} ${count === 1 ? 'منتج' : 'منتجات'}`;

    if (isEmpty()) {
      if (emptyEl)  emptyEl.style.display  = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      Array.from(itemsEl.querySelectorAll('.cart-item-card')).forEach(el => el.remove());
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
    if (footerEl) footerEl.style.display = 'flex';

    Array.from(itemsEl.querySelectorAll('.cart-item-card')).forEach(el => el.remove());
    
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'cart-item-card';
      el.dataset.productId  = item.productId;
      el.dataset.variantKey = item.variantKey;
      const variantLabel = item.variant && Object.values(item.variant).length
        ? `<div class="cart-item-variant">${Object.values(item.variant).join(' / ')}</div>` : '';
      el.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://via.placeholder.com/72x72/f3efe7/0b1929?text=صورة'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          ${variantLabel}
          <div class="cart-item-price">${window.FarahDB ? FarahDB.formatPrice(item.price * item.qty) : item.price * item.qty + ' ج.م'}</div>
          <div class="cart-item-row">
            <div class="qty-control">
              <button class="qty-btn" data-action="decrease">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" data-action="increase">+</button>
            </div>
            <button class="cart-item-remove" data-action="remove">حذف</button>
          </div>
        </div>
      `;
      el.querySelector('[data-action="decrease"]').addEventListener('click', () => updateQty(item.productId, item.variantKey, item.qty - 1));
      el.querySelector('[data-action="increase"]').addEventListener('click', () => updateQty(item.productId, item.variantKey, item.qty + 1));
      el.querySelector('[data-action="remove"]').addEventListener('click', () => {
        el.style.opacity = '0';
        setTimeout(() => remove(item.productId, item.variantKey), 240);
      });
      itemsEl.appendChild(el);
    });

    const { subtotal, shipping, total } = getTotal();
    const formatFn = window.FarahDB ? FarahDB.formatPrice : (p) => p + ' ج.م';
    if (totalEl) totalEl.textContent = formatFn(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? '🎉 مجاني' : formatFn(shipping);
    if (grandEl) grandEl.textContent = formatFn(total);
    
    updateShippingProgress();
    
    // Dynamic One-Click Upsell Logic (Requirement #1)
    const upsellContainer = document.getElementById('cart-upsell-card');
    if (upsellContainer) {
      const firstItem = items[0];
      let targetUpsellSku = 'code0004'; // Default fallback
      if (firstItem && window.FarahDB && FarahDB.PRODUCTS) {
        const prodData = FarahDB.PRODUCTS.find(p => p.id === firstItem.productId || p.sku === firstItem.sku);
        if (prodData && prodData.upsellSku) {
          targetUpsellSku = prodData.upsellSku;
        }
      }
      
      const isUpsellInCart = items.some(i => i.sku === targetUpsellSku || i.productId === targetUpsellSku.toLowerCase());
      const upsellProduct = window.FarahDB && FarahDB.PRODUCTS ? FarahDB.PRODUCTS.find(p => p.sku === targetUpsellSku || p.id === targetUpsellSku.toLowerCase()) : null;
      
      const threshold = getFreeShippingThreshold();
      const nearThreshold = threshold - 150; // default 450 EGP
      const showUpsell = !isEmpty() && subtotal >= nearThreshold && subtotal < threshold && !isUpsellInCart && upsellProduct && upsellProduct.stock > 0;
      
      if (showUpsell) {
        const imgSrc = (upsellProduct.images && upsellProduct.images.length > 0) ? upsellProduct.images[0] : 'https://via.placeholder.com/80?text=📦';
        upsellContainer.innerHTML = `
          <div style="display: flex; gap: 10px; align-items: center; justify-content: space-between;">
            <img src="${imgSrc}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" alt="${upsellProduct.name}">
            <div style="flex: 1; padding: 0 5px;">
              <div style="font-size: 0.82rem; font-weight: 700; color: var(--navy); line-height: 1.2;">${upsellProduct.name}</div>
              <div style="font-size: 0.75rem; color: var(--gold-dark); font-weight: 700; margin-top: 2px;">أضفه ووفر الشحن 🎁</div>
              <div style="font-size: 0.85rem; font-weight: 800; color: var(--primary); margin-top: 2px;">${formatFn(upsellProduct.price)}</div>
            </div>
            <button id="btn-upsell-add" class="btn btn-gold btn-upsell-pulse" style="padding: 6px 10px; font-size: 0.78rem; border-radius: 4px; white-space: nowrap;">➕ أضف ووفر</button>
          </div>
        `;
        upsellContainer.style.display = 'block';
        setTimeout(() => upsellContainer.classList.remove('hidden-fade'), 10);
        
        const btnAddUpsell = document.getElementById('btn-upsell-add');
        if (btnAddUpsell) {
          btnAddUpsell.onclick = () => {
            add(upsellProduct);
          };
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

  function createCartItemElement(item) {
    return document.createElement('div');
  }

  // ─── Checkout Data (للإرسال مع الطلب) ───────────
  function prepareOrderPayload(customerData) {
    const { subtotal, shipping, total } = getTotal(customerData.governorate);
    return {
      id:              FarahDB.generateOrderId(),
      customerName:    customerData.name,
      customerPhone:   customerData.phone,
      address:         customerData.address,
      items:           items.map(i => ({
        productId:       i.productId,
        sku:             i.sku,
        name:            i.name,
        price:           i.price,
        qty:             i.qty,
        variantSelected: i.variant,
        lineTotal:       i.price * i.qty,
      })),
      subtotal,
      shipping,
      discount:        0,
      total,
      paymentMethod:   customerData.paymentMethod || 'cash_on_delivery',
      paymentStatus:   'pending',
      status:          'new',
      notes:           customerData.notes || '',
      createdAt:       new Date().toISOString(),
      updatedAt:       new Date().toISOString(),
    };
  }

  // ─── Sync across tabs ─────────────────────────────
  window.addEventListener('storage', (e) => {
    if (e.key === 'farah_cart') {
      items = JSON.parse(e.newValue || '[]');
      updateUI();
    }
  });

  // ─── Public API ──────────────────────────────────
  return { add, remove, updateQty, clear, getItems, getCount, getSubtotal, getTotal, isEmpty, updateUI, prepareOrderPayload };
})();

// ─── Toast Notification ──────────────────────────
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const iconMap = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast   = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${iconMap[type] || '✅'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('fadeOut');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Cart Drawer Toggle ───────────────────────────
function initCartDrawer() {
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');
  const toggles = document.querySelectorAll('#cart-toggle, #cart-close');

  function open()  { drawer?.classList.add('open'); overlay?.classList.add('active'); document.body.style.overflow = 'hidden'; }
  function close() { drawer?.classList.remove('open'); overlay?.classList.remove('active'); document.body.style.overflow = ''; }

  window.openCartDrawer = open;
  window.closeCartDrawer = close;

  toggles.forEach(btn => btn?.addEventListener('click', (e) => {
    e.preventDefault();
    drawer?.classList.contains('open') ? close() : open();
  }));
  overlay?.addEventListener('click', close);

  document.getElementById('cart-empty-shop')?.addEventListener('click', close);
  document.getElementById('clear-cart')?.addEventListener('click', () => { Cart.clear(); showToast('🗑️ تم إفراغ السلة', 'info'); });

  // Keyboard
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && drawer?.classList.contains('open')) close(); });
}

// ─── Init ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Cart.updateUI();
  initCartDrawer();
});

// Expose globally
window.Cart     = Cart;
window.showToast = showToast;
