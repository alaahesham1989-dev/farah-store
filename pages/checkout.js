/**
 * FARAH STORE — Checkout Controller
 */

'use strict';

// ─── CONFIGURATION ────────────────────────────────
// ضع هنا الرابط (URL) الذي ستحصل عليه بعد نشر كود Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5jcrNpzC1oiMSQA3geOI8d883UezPlp1CElgDwdZCuWbJSBj84AnDewhgtfYhDHIh/exec';

document.addEventListener('DOMContentLoaded', () => {
  if (Cart.isEmpty()) {
    document.getElementById('empty-cart-msg').style.display   = 'block';
    document.getElementById('checkout-content').style.display = 'none';
    return;
  }

  renderOrderSummary();
  initPaymentToggle();
  initPlaceOrder();
});

// ─── Order Summary ────────────────────────────────
function renderOrderSummary(governorate = 'cairo') {
  const items      = Cart.getItems();
  const { subtotal, shipping, total } = Cart.getTotal(governorate);

  const summaryItems = document.getElementById('summary-items');
  if (summaryItems) {
    summaryItems.innerHTML = items.map(item => `
      <div class="summary-product">
        <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/52x52/f3f0ea/0d1b2a?text=📦'" />
        <div class="summary-product-info">
          <div class="summary-product-name">${item.name}</div>
          <div class="summary-product-price">${item.qty} × ${FarahDB.formatPrice(item.price)}</div>
          ${item.variant && Object.values(item.variant).length ? `<div style="font-size:0.75rem;color:var(--text-muted)">${Object.values(item.variant).join(' / ')}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  const subEl  = document.getElementById('sum-subtotal');
  const shipEl = document.getElementById('sum-shipping');
  const totEl  = document.getElementById('sum-total');

  if (subEl)  subEl.textContent  = FarahDB.formatPrice(subtotal);
  if (shipEl) shipEl.textContent = shipping === 0
    ? '🎉 مجاني'
    : FarahDB.formatPrice(shipping);
  if (totEl) {
    totEl.textContent = FarahDB.formatPrice(total);
    totEl.style.color = 'var(--navy)';
  }
}

// ─── Payment Method Toggle ────────────────────────
function initPaymentToggle() {
  const cards    = document.querySelectorAll('.payment-method-card');
  const paymobNote = document.getElementById('paymob-note');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      // Show Paymob note
      const isPaymob = radio?.value === 'paymob_card' || radio?.value === 'paymob_wallet';
      if (paymobNote) paymobNote.style.display = isPaymob ? 'block' : 'none';
    });
  });

  // Update shipping when governorate changes
  const govSelect = document.getElementById('field-gov');
  govSelect?.addEventListener('change', () => {
    renderOrderSummary(govSelect.value);
  });
}

// ─── Validation ───────────────────────────────────
function validate() {
  const fields = [
    { id: 'field-name',   label: 'الاسم الكامل' },
    { id: 'field-phone',  label: 'رقم الهاتف',   pattern: /^01[0-9]{9}$/ },
    { id: 'field-gov',    label: 'المحافظة' },
    { id: 'field-city',   label: 'المدينة' },
    { id: 'field-street', label: 'العنوان' },
  ];

  for (const field of fields) {
    const el = document.getElementById(field.id);
    if (!el) continue;
    const val = el.value.trim();
    if (!val) {
      el.style.borderColor = 'var(--danger)';
      el.focus();
      showToast(`⚠️ من فضلك أدخل ${field.label}`, 'warning');
      return false;
    }
    if (field.pattern && !field.pattern.test(val)) {
      el.style.borderColor = 'var(--danger)';
      el.focus();
      showToast(`⚠️ رقم الهاتف غير صحيح — يجب أن يبدأ بـ 01 ويتكون من 11 رقم`, 'warning', 4000);
      return false;
    }
    el.style.borderColor = '';
  }
  return true;
}

// ─── Place Order ──────────────────────────────────
function initPlaceOrder() {
  const btn = document.getElementById('btn-place-order');
  btn?.addEventListener('click', async () => {
    if (!validate()) return;

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash_on_delivery';
    const gov           = document.getElementById('field-gov')?.value;

    const customerData = {
      name:   document.getElementById('field-name')?.value?.trim(),
      phone:  document.getElementById('field-phone')?.value?.trim(),
      address: {
        governorate: gov,
        city:   document.getElementById('field-city')?.value?.trim(),
        street: document.getElementById('field-street')?.value?.trim(),
      },
      notes:         document.getElementById('field-notes')?.value?.trim(),
      paymentMethod,
      governorate:   gov,
    };

    // Build order payload
    const order = Cart.prepareOrderPayload(customerData);

    // ── Save order locally (until backend is ready) ──
    const orders = FarahDB.Storage.get('orders', []);
    orders.unshift(order);
    FarahDB.Storage.set('orders', orders);

    // ── Loading state ──
    btn.disabled     = true;
    btn.textContent  = '⏳ جاري تأكيد الطلب...';

    try {
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'ضع_رابط_جوجل_سكربت_هنا') {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors', // لتفادي مشاكل CORS مع جوجل سكربت
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create_order',
            data: order
          })
        });
        // لا يمكن قراءة response.json() عند استخدام no-cors ولكن الطلب سيصل
      } else {
        // Simulate API call if URL not set
        await new Promise(r => setTimeout(r, 1200));
        console.warn("Google Script URL is not configured. Order saved locally only.");
      }
    } catch (error) {
      console.error("Error sending order to Google Sheets:", error);
      showToast('⚠️ حدث خطأ أثناء إرسال الطلب، لكن تم حفظه في جهازك.', 'error');
    }

    if (paymentMethod === 'paymob_card' || paymentMethod === 'paymob_wallet') {
      // TODO: هنا هيتم استدعاء Paymob API بعد ربط الـ API key
      // في الوقت الحالي بنعرض رسالة تأكيد
      showSuccessModal(order.id);
    } else {
      showSuccessModal(order.id);
    }

    Cart.clear();
  });
}

// ─── Success Modal ────────────────────────────────
function showSuccessModal(orderId) {
  const modal   = document.getElementById('success-modal');
  const idDisplay = document.getElementById('order-id-display');
  if (!modal) return;

  if (idDisplay) idDisplay.textContent = `رقم الطلب: ${orderId}`;
  modal.style.display = 'flex';

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });
}
