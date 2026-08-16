/**
 * FARAH STORE — Checkout Controller
 */

'use strict';

// ─── CONFIGURATION ────────────────────────────────
// ضع هنا الرابط (URL) الذي ستحصل عليه بعد نشر كود Google Apps Script
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx5jcrNpzC1oiMSQA3geOI8d883UezPlp1CElgDwdZCuWbJSBj84AnDewhgtfYhDHIh/exec';

document.addEventListener('DOMContentLoaded', () => {
  // Dynamic City Dropdown Logic
  const govSelect = document.getElementById('field-gov');
  const citySelect = document.getElementById('field-city');
  const cityOtherInput = document.getElementById('field-city-other');
  
  if (govSelect && citySelect && window.EGYPT_LOCATIONS) {
    govSelect.addEventListener('change', () => {
      const selectedGov = govSelect.value;
      const cities = window.EGYPT_LOCATIONS[selectedGov];
      
      citySelect.innerHTML = '';
      cityOtherInput.style.display = 'none';
      cityOtherInput.value = '';
      cityOtherInput.removeAttribute('required');
      
      if (cities && cities.length > 0) {
        citySelect.removeAttribute('disabled');
        
        let defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.textContent = 'اختر المدينة / المركز';
        citySelect.appendChild(defaultOption);
        
        cities.forEach(city => {
          let option = document.createElement('option');
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });
        
        let otherOption = document.createElement('option');
        otherOption.value = 'other';
        otherOption.textContent = 'مدينة أخرى (اكتبها يدوياً)';
        citySelect.appendChild(otherOption);
      } else {
        citySelect.setAttribute('disabled', 'disabled');
        let option = document.createElement('option');
        option.value = '';
        option.textContent = 'اختر المحافظة أولاً';
        citySelect.appendChild(option);
      }
    });
    
    citySelect.addEventListener('change', () => {
      if (citySelect.value === 'other') {
        cityOtherInput.style.display = 'block';
        cityOtherInput.setAttribute('required', 'required');
      } else {
        cityOtherInput.style.display = 'none';
        cityOtherInput.removeAttribute('required');
      }
    });
  }

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
    let el = document.getElementById(field.id);
    if (!el) continue;
    let val = el.value.trim();
    
    // Custom logic for city
    if (field.id === 'field-city' && val === 'other') {
      el = document.getElementById('field-city-other');
      val = el ? el.value.trim() : '';
    }
    
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

    // ── 1. Lock button immediately ──
    btn.disabled    = true;
    btn.textContent = '⏳ جاري تأكيد الطلب...';

    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash_on_delivery';
    const gov           = document.getElementById('field-gov')?.value;

    const customerData = {
      name:   document.getElementById('field-name')?.value?.trim(),
      phone:  document.getElementById('field-phone')?.value?.trim(),
      address: {
        governorate: gov,
        city:   (document.getElementById('field-city')?.value === 'other' ? document.getElementById('field-city-other')?.value?.trim() : document.getElementById('field-city')?.value?.trim()),
        street: document.getElementById('field-street')?.value?.trim(),
      },
      notes:         document.getElementById('field-notes')?.value?.trim(),
      paymentMethod,
      governorate:   gov,
    };

    // ── 2. Build order payload ──
    const order = Cart.prepareOrderPayload(customerData);

    // ── 3. Save to localStorage first (instant fallback) ──
    const orders = FarahDB.Storage.get('orders', []);
    orders.unshift(order);
    FarahDB.Storage.set('orders', orders);

    // ── 4. Write to Firestore ──
    if (window.db && window.db.collection) {
      try {
        await window.db.collection('orders').doc(order.id).set(order);
        console.log('[Farah] ✅ Order saved to Firestore:', order.id);

        // Also save customer record (upsert by phone)
        if (order.customerPhone) {
          window.db.collection('customers').doc(order.customerPhone).set({
            name:      order.customerName,
            phone:     order.customerPhone,
            lastOrder: order.id,
            lastSeen:  order.createdAt,
          }, { merge: true }).catch(e => console.warn('[Farah] Customer record update failed:', e));
        }
      } catch (e) {
        console.error('[Farah] ❌ Firestore write failed:', e);
        showToast('⚠️ تعذّر حفظ الطلب في قاعدة البيانات — سيظهر في السجل المحلي فقط.', 'warning', 5000);
      }
    } else {
      console.warn('[Farah] window.db not available — Firestore not initialized on this page.');
    }

    // ── 5. Send to Google Sheets backup ──
    try {
      if (GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'ضع_رابط_جوجل_سكربت_هنا') {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create_order', data: order })
        });
      } else {
        await new Promise(r => setTimeout(r, 800));
      }
    } catch (error) {
      console.error('[Farah] Google Sheets error:', error);
    }

    // ── 6. Show success modal & clear cart ──
    showSuccessModal(order, btn);
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
function showSuccessModal(order, btn) {
  const modal          = document.getElementById('success-modal');
  const idDisplay      = document.getElementById('order-id-display');
  const detailsDisplay = document.getElementById('order-details-display');
  const btnWhatsApp    = document.getElementById('btn-success-whatsapp');
  if (!modal) return;

  // ── Normalize: support both old schema (customer.x) and new (customerName/customerAddress) ──
  const customerName    = order.customerName    || order.customer?.name    || '—';
  const customerPhone   = order.customerPhone   || order.customer?.phone   || '—';
  const customerNotes   = order.notes           || order.customer?.notes   || '';
  const addr = order.customerAddress || order.customer?.address || {};
  const addrGov    = addr.governorate || '';
  const addrCity   = addr.city        || '';
  const addrStreet = addr.street      || '';

  if (idDisplay) idDisplay.textContent = `رقم الطلب: ${order.id}`;

  if (detailsDisplay) {
    let itemsHTML = '';
    (order.items || []).forEach(item => {
      // support both variantSelected (new) and variant (old)
      const variantObj  = item.variantSelected || item.variant || {};
      const variantVals = Object.values(variantObj).filter(Boolean);
      const variantText = variantVals.length ? ` (${variantVals.join(' / ')})` : '';
      itemsHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:8px; gap:10px; padding-bottom:6px; border-bottom:1px solid #f0f0f0;">
        <span style="color:var(--text-mid); text-align:right; flex:1;">🔹 ${item.name}${variantText} &times;${item.qty}</span>
        <span style="font-weight:700; white-space:nowrap;">${FarahDB.formatPrice((item.lineTotal || item.price * item.qty) || 0)}</span>
      </div>`;
    });

    const payLabel = getPaymentMethodArabicName(order.paymentMethod || 'cash_on_delivery');
    const govLabel = getGovArabicName(addrGov);

    detailsDisplay.innerHTML = `
      <div style="font-weight:800; margin-bottom:12px; border-bottom:2px solid var(--primary); padding-bottom:8px; color:var(--navy);">🧾 تفاصيل الفاتورة</div>
      ${itemsHTML}
      <div style="border-top:2px solid #eee; margin-top:10px; padding-top:10px;">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--text-mid);">المجموع الفرعي:</span>
          <span>${FarahDB.formatPrice(order.subtotal || 0)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span style="color:var(--text-mid);">تكلفة الشحن:</span>
          <span>${(order.shipping === 0 || order.shipping === '0') ? '🎉 مجاني' : FarahDB.formatPrice(order.shipping || 0)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:800; font-size:1.1rem; margin-top:8px; color:var(--primary); padding-top:8px; border-top:1px solid #eee;">
          <span>💰 الإجمالي الكلي:</span>
          <span>${FarahDB.formatPrice(order.total || 0)}</span>
        </div>
      </div>
      <div style="margin-top:12px; font-size:0.85rem; background:#f8f8f8; border-radius:8px; padding:10px;">
        <div style="margin-bottom:4px;">💳 طريقة الدفع: <strong style="color:var(--navy);">${payLabel}</strong></div>
        <div style="margin-bottom:2px;">👤 الاسم: ${customerName}</div>
        <div style="margin-bottom:2px;">📱 الهاتف: ${customerPhone}</div>
        <div>📍 ${addrCity}، ${addrStreet} (${govLabel})</div>
        ${customerNotes ? `<div style="margin-top:4px;">📝 ملاحظات: ${customerNotes}</div>` : ''}
      </div>
    `;
  }

  // ── WhatsApp link ──
  if (btnWhatsApp) {
    let productsText = '';
    (order.items || []).forEach((item, idx) => {
      const variantObj  = item.variantSelected || item.variant || {};
      const variantVals = Object.values(variantObj).filter(Boolean);
      const variantText = variantVals.length ? ` (${variantVals.join(' / ')})` : '';
      productsText += `${idx + 1}- ${item.name}${variantText} [عدد: ${item.qty}] (${item.price} ج.م)\n`;
    });

    const govText      = getGovArabicName(addrGov);
    const payMethodText = getPaymentMethodArabicName(order.paymentMethod || 'cash_on_delivery');

    const message = `السلام عليكم يا فرح استور،\nأود تأكيد طلبي بمتجركم 🛍️\n\n📌 تفاصيل الطلب رقم: ${order.id}\n----------------------------------\n${productsText}----------------------------------\n🔹 المجموع الفرعي: ${order.subtotal} ج.م\n🚚 الشحن: ${order.shipping === 0 ? 'مجاني' : (order.shipping || 0) + ' ج.م'}\n💳 طريقة الدفع: ${payMethodText}\n💰 الإجمالي الكلي: ${order.total} ج.م\n\n📌 عنوان التوصيل:\n👤 الاسم: ${customerName}\n📱 الهاتف: ${customerPhone}\n📍 المحافظة: ${govText}\n🏙️ المدينة/المركز: ${addrCity}\n🏠 العنوان بالتفصيل: ${addrStreet}\n${customerNotes ? '📝 ملاحظات: ' + customerNotes : ''}\n\nيرجى تأكيد الطلب للشحن في أسرع وقت. شكراً لكم!`;

    btnWhatsApp.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Auto-open WhatsApp on submission
    try {
      window.open(btnWhatsApp.href, '_blank');
    } catch(e) {
      console.warn('Auto-open WhatsApp blocked by popup blocker:', e);
    }
  }

  // ── Show modal ──
  modal.style.display = 'flex';

  // ── Reset the order button ──
  if (btn) {
    btn.disabled    = false;
    btn.textContent = '✅ تأكيد الطلب';
  }

  // ── Close on backdrop click ──
  modal.onclick = e => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

