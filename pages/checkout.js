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
  const noteEl   = document.getElementById('payment-instructions-note');

  cards.forEach(card => {
    card.addEventListener('click', () => {
      cards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const radio = card.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;

      // Show payment notes depending on selected method
      const val = radio?.value;
      if (noteEl) {
        if (val === 'vodafone_cash') {
          noteEl.style.display = 'block';
          noteEl.style.background = 'rgba(231,76,60,0.08)';
          noteEl.style.border = '1px solid rgba(231,76,60,0.2)';
          noteEl.style.color = '#c0392b';
          noteEl.innerHTML = `💸 يرجى تحويل إجمالي الفاتورة إلى رقم محفظة فودافون كاش: <strong style="font-size:1.05rem;">01000000000</strong> (رقم المتجر)، وإرفاق لقطة شاشة للتحويل عند تأكيد الطلب عبر واتساب.`;
        } else if (val === 'instapay') {
          noteEl.style.display = 'block';
          noteEl.style.background = 'rgba(46,204,113,0.08)';
          noteEl.style.border = '1px solid rgba(46,204,113,0.2)';
          noteEl.style.color = '#27ae60';
          noteEl.innerHTML = `⚡ يرجى تحويل إجمالي الفاتورة عبر تطبيق InstaPay إلى العنوان التالي: <strong style="font-size:1.05rem;">farah@instapay</strong>، وإرفاق لقطة الشاشة للتحويل عند تأكيد الطلب عبر واتساب.`;
        } else {
          // Cash on delivery
          noteEl.style.display = 'none';
        }
      }
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
    { id: 'field-phone',  label: 'رقم الهاتف',   pattern: /^\+?[0-9]{9,15}$/ },
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
      showToast(`⚠️ رقم الهاتف غير صحيح — يرجى إدخال رقم هاتف واتساب صحيح`, 'warning', 4000);
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

    // ── Save order to Firestore & Local (Fallback/History) ──
    const orders = FarahDB.Storage.get('orders', []);
    orders.unshift(order);
    FarahDB.Storage.set('orders', orders);

    try {
      if (window.db && window.db.collection) {
        await window.db.collection('orders').doc(order.id).set(order);
      }
    } catch (e) {
      console.warn('Firestore write failed:', e);
    }

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

    showSuccessModal(order);

    Cart.clear();
  });
}

// TODO: استبدل هذا الرقم برقم الواتساب الخاص بالمتجر لتلقي الطلبات
const STORE_WHATSAPP_NUMBER = '201000000000'; 

function getPaymentMethodArabicName(method) {
  const mapping = {
    'cash_on_delivery': 'الدفع عند الاستلام 💵',
    'vodafone_cash': 'فودافون كاش 🔴',
    'instapay': 'انستاباي ⚡'
  };
  return mapping[method] || method;
}

function getGovArabicName(gov) {
  const mapping = {
    'cairo': 'القاهرة',
    'giza': 'الجيزة',
    'alexandria': 'الإسكندرية',
    'qalubia': 'القليوبية',
    'gharbia': 'الغربية',
    'monufia': 'المنوفية',
    'dakahlia': 'الدقهلية',
    'sharqia': 'الشرقية',
    'beheira': 'البحيرة',
    'damietta': 'دمياط',
    'port-said': 'بورسعيد',
    'ismailia': 'الإسماعيلية',
    'suez': 'السويس',
    'fayoum': 'الفيوم',
    'beni-suef': 'بني سويف',
    'minya': 'المنيا',
    'assiut': 'أسيوط',
    'sohag': 'سوهاج',
    'qena': 'قنا',
    'luxor': 'الأقصر',
    'aswan': 'أسوان',
    'red-sea': 'البحر الأحمر',
    'new-valley': 'الوادي الجديد',
    'matrouh': 'مطروح',
    'north-sinai': 'شمال سيناء',
    'south-sinai': 'جنوب سيناء'
  };
  return mapping[gov] || gov;
}

// ─── Success Modal ────────────────────────────────
function showSuccessModal(order) {
  const modal   = document.getElementById('success-modal');
  const idDisplay = document.getElementById('order-id-display');
  const detailsDisplay = document.getElementById('order-details-display');
  const btnWhatsApp = document.getElementById('btn-success-whatsapp');
  if (!modal) return;

  if (idDisplay) idDisplay.textContent = `رقم الطلب: ${order.id}`;

  if (detailsDisplay) {
    let itemsHTML = '';
    order.items.forEach(item => {
      const variantText = item.variant && Object.values(item.variant).length 
        ? ` (${Object.values(item.variant).join(' / ')})` : '';
      itemsHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; gap: 10px;">
        <span style="color: var(--text-mid); text-align:right;">🔹 ${item.name}${variantText} (عدد ${item.qty})</span>
        <span style="font-weight:700; text-align:left;">${FarahDB.formatPrice(item.price * item.qty)}</span>
      </div>`;
    });

    detailsDisplay.innerHTML = `
      <div style="font-weight:800; margin-bottom:12px; border-bottom:1px solid #eee; padding-bottom:8px; color: var(--navy);">تفاصيل الفاتورة:</div>
      ${itemsHTML}
      <div style="border-top:1px solid #eee; margin-top:10px; padding-top:8px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color: var(--text-mid);">المجموع الفرعي:</span>
          <span>${FarahDB.formatPrice(order.subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
          <span style="color: var(--text-mid);">تكلفة الشحن:</span>
          <span>${order.shipping === 0 ? '🎉 مجاني' : FarahDB.formatPrice(order.shipping)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.05rem; margin-top:6px; color:var(--primary-color);">
          <span>الإجمالي الكلي:</span>
          <span>${FarahDB.formatPrice(order.total)}</span>
        </div>
      </div>
      <div style="margin-top:12px; font-size:0.85rem; color:var(--text-soft); border-top: 1px dashed #eee; padding-top: 8px;">
        💳 طريقة الدفع: <span style="font-weight:700; color:var(--navy);">${getPaymentMethodArabicName(order.paymentMethod)}</span>
      </div>
      <div style="margin-top:4px; font-size:0.85rem; color:var(--text-soft);">
        📍 العنوان: ${order.customer.address.city}، ${order.customer.address.street} (${getGovArabicName(order.customer.address.governorate)})
      </div>
    `;
  }

  // Set up WhatsApp Confirmation Link
  if (btnWhatsApp) {
    let productsText = '';
    order.items.forEach((item, idx) => {
      const variantText = item.variant && Object.values(item.variant).length 
        ? ` (${Object.values(item.variant).join(' / ')})` : '';
      productsText += `${idx + 1}- ${item.name}${variantText} [عدد: ${item.qty}] (${item.price} ج.م)\n`;
    });

    const govText = getGovArabicName(order.customer.address.governorate);
    const payMethodText = getPaymentMethodArabicName(order.paymentMethod);

    const message = `السلام عليكم يا فرح استور،\nأود تأكيد طلبي بمتجركم 🛍️\n\n📌 تفاصيل الطلب رقم: ${order.id}\n----------------------------------\n${productsText}----------------------------------\n🔹 المجموع الفرعي: ${order.subtotal} ج.م\n🚚 الشحن: ${order.shipping === 0 ? 'مجاني' : order.shipping + ' ج.م'}\n💳 طريقة الدفع: ${payMethodText}\n💰 الإجمالي الكلي: ${order.total} ج.م\n\n📌 عنوان التوصيل:\n👤 الاسم: ${order.customer.name}\n📱 الهاتف: ${order.customer.phone}\n📍 المحافظة: ${govText}\n🏙️ المدينة/المركز: ${order.customer.address.city}\n🏠 العنوان بالتفصيل: ${order.customer.address.street}\n${order.customer.notes ? '📝 ملاحظات: ' + order.customer.notes : ''}\n\nيرجى تأكيد الطلب للشحن في أسرع وقت. شكراً لكم!`;
    
    btnWhatsApp.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Auto-open WhatsApp on submission
    try {
      window.open(btnWhatsApp.href, '_blank');
    } catch(e) {
      console.warn("Auto-open WhatsApp blocked by popup blocker:", e);
    }
  }

  modal.style.display = 'flex';

  // Close on backdrop click
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.style.display = 'none';
  });
}
