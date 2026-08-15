/**
 * FARAH STORE — Cart Manager
 * يعمل عبر localStorage، متزامن مع كل صفحة
 */

'use strict';

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

    if (!itemsEl) return;

    if (isEmpty()) {
      if (emptyEl)  emptyEl.style.display  = 'flex';
      if (footerEl) footerEl.style.display = 'none';
      // Clear product cards
      Array.from(itemsEl.querySelectorAll('.cart-item')).forEach(el => el.remove());
      return;
    }

    if (emptyEl)  emptyEl.style.display  = 'none';
    if (footerEl) footerEl.style.display = 'flex';

    // Re-render items
    Array.from(itemsEl.querySelectorAll('.cart-item')).forEach(el => el.remove());
    items.forEach(item => {
      const el = createCartItemElement(item);
      itemsEl.appendChild(el);
    });

    // Update totals
    const { subtotal, shipping, total } = getTotal();
    if (totalEl)   totalEl.textContent   = FarahDB.formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? '🎉 مجاني' : FarahDB.formatPrice(shipping);
  }

  function createCartItemElement(item) {
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.dataset.productId  = item.productId;
    el.dataset.variantKey = item.variantKey;

    const variantLabel = item.variant && Object.values(item.variant).length
      ? `<span style="font-size:0.75rem;color:var(--text-muted)">${Object.values(item.variant).join(' / ')}</span>`
      : '';

    el.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" loading="lazy" onerror="this.src='https://via.placeholder.com/70x70/f3f0ea/0d1b2a?text=📦'" />
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${variantLabel}
        <div class="cart-item-price">${FarahDB.formatPrice(item.price * item.qty)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" data-action="decrease" aria-label="تقليل الكمية">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" data-action="increase" aria-label="زيادة الكمية">+</button>
          <button class="cart-item-remove" data-action="remove">حذف</button>
        </div>
      </div>
    `;

    // Events
    el.querySelector('[data-action="decrease"]').addEventListener('click', () =>
      updateQty(item.productId, item.variantKey, item.qty - 1));
    el.querySelector('[data-action="increase"]').addEventListener('click', () =>
      updateQty(item.productId, item.variantKey, item.qty + 1));
    el.querySelector('[data-action="remove"]').addEventListener('click', () => {
      el.style.animation = 'toastOut 0.25s ease forwards';
      setTimeout(() => remove(item.productId, item.variantKey), 240);
    });

    return el;
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

  toggles.forEach(btn => btn?.addEventListener('click', () => drawer?.classList.contains('open') ? close() : open()));
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
