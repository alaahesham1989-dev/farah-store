// Firebase authentication
const loginBtn = document.getElementById('login-btn');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const loginModal = document.getElementById('login-modal');
const dashboard = document.getElementById('dashboard');

function showLoginError(message = 'البريد الإلكتروني أو كلمة المرور غير صحيحة') {
  loginError.textContent = message;
  loginError.style.display = 'block';
}

function hideLoginError() {
  loginError.style.display = 'none';
}

function showDashboard() {
  loginModal.style.display = 'none';
  loginModal.style.opacity = '0';
  dashboard.style.display = 'grid';
  const init = () => initDashboard();
  if (window.FarahDB && window.FarahDB.productsReady) {
    window.FarahDB.productsReady.then(init).catch(init);
  } else {
    init();
  }
}

function showLogin() {
  loginModal.style.display = 'flex';
  loginModal.style.opacity = '1';
  dashboard.style.display = 'none';
}

async function serverAuthLogin(email, password) {
  try {
    const response = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      return true;
    }

    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      showLoginError(data.message || 'كلمة المرور غير صحيحة.');
    } else if (response.status === 403) {
      showLoginError(data.message || 'غير مصرح بالدخول لهذا المستخدم.');
    } else {
      showLoginError(data.message || 'حدث خطأ من الخادم. حاول مرة أخرى.');
    }
    return false;
  } catch (err) {
    console.error('Server auth failed:', err);
    showLoginError('حدث خطأ أثناء محاولة تسجيل الدخول. حاول لاحقاً.');
    return false;
  }
}

async function attemptLogin() {
  hideLoginError();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    showLoginError('الرجاء إدخال البريد الإلكتروني وكلمة المرور');
    return;
  }

  if (window.auth && window.auth.signInWithEmailAndPassword) {
    try {
      await window.auth.signInWithEmailAndPassword(email, password);
      showDashboard();
      return;
    } catch (error) {
      console.warn('Firebase login failed, falling back to env auth:', error);
      if (error.code !== 'auth/configuration-not-found' && error.code !== 'auth/operation-not-allowed' && error.code !== 'auth/internal-error') {
        if (error.code === 'auth/user-not-found') {
          showLoginError('المستخدم غير موجود. تأكد من البريد الإلكتروني.');
        } else if (error.code === 'auth/wrong-password') {
          showLoginError('كلمة المرور غير صحيحة.');
        } else if (error.code === 'auth/invalid-email') {
          showLoginError('البريد الإلكتروني غير صالح.');
        } else {
          showLoginError('حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.');
        }
        return;
      }
    }
  }

  const ok = await serverAuthLogin(email, password);
  if (ok) {
    showDashboard();
  }
}

loginBtn.addEventListener('click', attemptLogin);
emailInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') attemptLogin();
});
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') attemptLogin();
});

// Check auth state
window.addEventListener('DOMContentLoaded', () => {
  if (window.auth) {
    window.auth.onAuthStateChanged(user => {
      if (user) {
        showDashboard();
      } else {
        showLogin();
      }
    });
  } else {
    // Allow login via server fallback even if Firebase is not configured.
    showLogin();
  }
});

// Add CSS keyframe for spinner dynamically
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

let currentProductEditId = null;

function renderImageInputs(images = []) {
  const container = document.getElementById('edit-product-images');
  if (!container) return;
  container.innerHTML = '';
  images = images || [];
  if (images.length === 0) {
    addImageInput('');
    return;
  }
  images.forEach((img, idx) => addImageInput(img, idx === 0));
}

function addImageInput(value = '', markAsPrimary = false) {
  const container = document.getElementById('edit-product-images');
  if (!container) return;
  const idx = container.children.length;
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.alignItems = 'center';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'رابط صورة (https://...)';
  input.className = 'form-control edit-image-url';
  input.value = value || '';
  input.style.flex = '1';

  const upBtn = document.createElement('button');
  upBtn.type = 'button';
  upBtn.className = 'btn btn-icon';
  upBtn.textContent = '↑';
  upBtn.title = 'نقل للأعلى';
  upBtn.addEventListener('click', () => {
    const prev = row.previousElementSibling;
    if (prev) container.insertBefore(row, prev);
    updatePrimaryBadge();
  });

  const downBtn = document.createElement('button');
  downBtn.type = 'button';
  downBtn.className = 'btn btn-icon';
  downBtn.textContent = '↓';
  downBtn.title = 'نقل للأسفل';
  downBtn.addEventListener('click', () => {
    const next = row.nextElementSibling;
    if (next) container.insertBefore(next, row);
    updatePrimaryBadge();
  });

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-icon';
  removeBtn.textContent = '×';
  removeBtn.title = 'حذف الصورة';
  removeBtn.style.color = 'var(--admin-danger)';
  removeBtn.addEventListener('click', () => { row.remove(); updatePrimaryBadge(); });

  const badge = document.createElement('span');
  badge.className = 'image-primary-badge';
  badge.style.background = 'var(--admin-gold)';
  badge.style.color = '#111';
  badge.style.padding = '2px 6px';
  badge.style.borderRadius = '12px';
  badge.style.fontSize = '0.75rem';
  badge.style.display = markAsPrimary ? 'inline-block' : 'none';
  badge.textContent = 'الصورة الرئيسية';

  row.appendChild(input);
  row.appendChild(upBtn);
  row.appendChild(downBtn);
  row.appendChild(removeBtn);
  row.appendChild(badge);
  container.appendChild(row);
  updatePrimaryBadge();
}

function updatePrimaryBadge() {
  const container = document.getElementById('edit-product-images');
  if (!container) return;
  Array.from(container.children).forEach((row, idx) => {
    const badge = row.querySelector('.image-primary-badge');
    if (badge) badge.style.display = idx === 0 ? 'inline-block' : 'none';
  });
}

function getCategoryLabel(categoryId) {
  const category = FarahDB.CATEGORIES.find(cat => cat.id === categoryId);
  return category ? category.name : categoryId || 'غير محدد';
}

function formatOrderStatus(status) {
  switch (status) {
    case 'new': return 'جديد';
    case 'processing': return 'قيد التجهيز';
    case 'shipped': return 'تم الشحن';
    case 'delivered': return 'مكتمل';
    case 'cancelled': return 'ملغي';
    default: return status;
  }
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'new': return 'badge badge-warning';
    case 'processing': return 'badge badge-warning';
    case 'shipped': return 'badge badge-info';
    case 'delivered': return 'badge badge-success';
    case 'cancelled': return 'badge badge-danger';
    default: return 'badge badge-secondary';
  }
}

function renderDashboardStats() {
  const orders = window.AdminOrders || [];
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const newOrders = orders.filter(order => order.orderStatus === 'new').length;
  const productsCount = FarahDB.PRODUCTS.length;
  const customerCount = [...new Set(orders.map(order => order.customerPhone))].length;

  const overviewStats = [
    { selector: '.stat-value.counter[data-target="125400"]', value: totalSales, suffix: ' ج.م' },
    { selector: '.stat-value.counter[data-target="84"]', value: newOrders, suffix: '' },
    { selector: '.stat-value.counter[data-target="320"]', value: productsCount, suffix: '' },
    { selector: '.stat-value.counter[data-target="1250"]', value: customerCount, suffix: '' },
  ];

  overviewStats.forEach(({ selector, value, suffix }) => {
    const element = document.querySelector(selector);
    if (element) {
      element.setAttribute('data-target', value);
      element.textContent = suffix ? `0${suffix}` : '0';
    }
  });
}

function renderProductsTable() {
  const searchQuery = document.getElementById('products-search')?.value.toLowerCase() || '';
  const categoryFilter = document.getElementById('products-category-filter')?.value || 'all';
  const sortFilter = document.getElementById('products-sort')?.value || 'default';
  
  let filteredProducts = FarahDB.PRODUCTS;

  if (categoryFilter !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.category === categoryFilter);
  }
  
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(searchQuery) ||
      (product.nameEn && product.nameEn.toLowerCase().includes(searchQuery)) ||
      (product.id && product.id.toLowerCase().includes(searchQuery))
    );
  }
  
  if (sortFilter === 'top-selling') {
    filteredProducts.sort((a, b) => (b.sold || 0) - (a.sold || 0));
  } else if (sortFilter === 'low-stock') {
    filteredProducts.sort((a, b) => (a.stock || 0) - (b.stock || 0));
  } else if (sortFilter === 'high-profit') {
    filteredProducts.sort((a, b) => {
      const profitA = (a.price || 0) - (a.priceWholesale || 0);
      const profitB = (b.price || 0) - (b.priceWholesale || 0);
      return profitB - profitA;
    });
  }

  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = filteredProducts.map(product => {
    const isLowStock = product.stock < 10;
    const stockStyle = isLowStock ? 'color: var(--admin-danger); font-weight: bold;' : '';
    const stockWarning = isLowStock ? ' ⚠️' : '';
    
    let thumb = product.images?.[0] || 'https://via.placeholder.com/48x48?text=No';
    if (thumb && !thumb.startsWith('http') && !thumb.startsWith('/')) {
      thumb = '../' + thumb.replace(/^\.\//, '');
    }
    
    const isActive = product.isActive !== false; // Default true
    
    return `
      <tr>
        <td><img src="${thumb}" alt="${product.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/48x48?text=No'"/></td>
        <td style="font-family: monospace; color: var(--admin-text-soft);">${product.id || '-'}</td>
        <td>${product.name}</td>
        <td>${getCategoryLabel(product.category)}</td>
        <td style="color:var(--admin-warning);">${(product.priceWholesale || 0).toLocaleString('ar-EG')} ج.م</td>
        <td style="font-weight:bold;">${product.price.toLocaleString('ar-EG')} ج.م</td>
        <td style="color:var(--admin-success); font-weight:bold;">${((product.price || 0) - (product.priceWholesale || 0)).toLocaleString('ar-EG')} ج.م</td>
        <td style="${stockStyle}">${product.stock}${stockWarning}</td>
        <td>${product.sold || 0}</td>
        <td>
          <label class="toggle-switch">
            <input type="checkbox" class="product-active-toggle" data-product-id="${product.id}" ${isActive ? 'checked' : ''}>
            <span class="slider"></span>
          </label>
        </td>
        <td style="display: flex; gap: 8px; justify-content: center;">
          <button class="btn-icon" data-product-id="${product.id}" data-action="marketing" title="المحتوى التسويقي">📝</button>
          <button class="btn-icon" data-product-id="${product.id}" data-action="edit" title="تعديل">✏️</button>
          <button class="btn-icon" data-product-id="${product.id}" data-action="delete" style="color: var(--admin-danger)" title="حذف">🗑️</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="11" style="text-align:center;">لا توجد منتجات لعرضها</td></tr>';

  tbody.querySelectorAll('button[data-product-id]').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-product-id');
      const action = button.getAttribute('data-action');
      if (action === 'edit') {
        openProductEditor(productId);
      } else if (action === 'marketing') {
        openMarketingModal(productId);
      } else if (action === 'delete') {
        deleteProduct(productId);
      }
    });
  });
  
  tbody.querySelectorAll('.product-active-toggle').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const productId = e.target.getAttribute('data-product-id');
      const isActive = e.target.checked;
      try {
        if (window.db && window.db.collection) {
          await window.db.collection('products').doc(productId).update({ isActive });
          const p = FarahDB.PRODUCTS.find(p => p.id === productId);
          if (p) p.isActive = isActive;
        }
      } catch (err) {
        console.warn('Failed to update product status', err);
        e.target.checked = !isActive;
        alert('حدث خطأ أثناء التحديث.');
      }
    });
  });
}


function openProductEditor(productId = null) {
  const modal = document.getElementById('product-editor-modal');
  if (!modal) return;

  const product = productId ? FarahDB.PRODUCTS.find(p => p.id === productId) : {
    id: `code${String(Date.now()).slice(-8)}`,
    name: '',
    category: 'other',
    price: 0,
    stock: 0,
    badge: '',
  };

  currentProductEditId = product.id;

  document.getElementById('edit-product-name').value = product.name || '';
  document.getElementById('edit-product-category').value = product.category || 'other';
  
  const priceInput = document.getElementById('edit-product-price');
  const wholesaleInput = document.getElementById('edit-product-price-wholesale');
  const originalInput = document.getElementById('edit-product-price-original');
  const profitInput = document.getElementById('edit-product-profit');
  
  priceInput.value = product.price || 0;
  wholesaleInput.value = product.priceWholesale || product.price || 0;
  originalInput.value = product.priceOriginal || product.price || 0;
  
  const updateProfit = () => {
    const p = Number(priceInput.value || 0);
    const w = Number(wholesaleInput.value || 0);
    profitInput.value = (p - w) + ' ج.م';
  };
  
  updateProfit();
  priceInput.addEventListener('input', updateProfit);
  wholesaleInput.addEventListener('input', updateProfit);

  document.getElementById('edit-product-stock').value = product.stock || 0;
  document.getElementById('edit-product-badge').value = product.badge || '';

  const desc = product.description || {};
  document.getElementById('edit-product-desc-overview').value = typeof desc === 'object' ? (desc.overview || '') : desc;
  document.getElementById('edit-product-desc-indications').value = typeof desc === 'object' ? (desc.indications || '') : '';
  document.getElementById('edit-product-desc-how-to-use').value = typeof desc === 'object' ? (desc.howToUse || '') : '';
  document.getElementById('edit-product-desc-problems-solved').value = typeof desc === 'object' ? (desc.problemsSolved || '') : '';

  // images
  renderImageInputs(Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []));

  modal.style.display = 'flex';
}

function closeProductEditor() {
  const modal = document.getElementById('product-editor-modal');
  if (!modal) return;
  modal.style.display = 'none';
  currentProductEditId = null;
}

function saveProductEdit() {
  const name = document.getElementById('edit-product-name')?.value.trim();
  const category = document.getElementById('edit-product-category')?.value.trim() || 'other';
  const price = Number(document.getElementById('edit-product-price')?.value || 0);
  const priceWholesale = Number(document.getElementById('edit-product-price-wholesale')?.value || 0);
  const priceOriginal = Number(document.getElementById('edit-product-price-original')?.value || 0);
  const stock = Number(document.getElementById('edit-product-stock')?.value || 0);
  const badge = document.getElementById('edit-product-badge')?.value.trim();

  const description = {
    overview: document.getElementById('edit-product-desc-overview')?.value.trim() || '',
    indications: document.getElementById('edit-product-desc-indications')?.value.trim() || '',
    howToUse: document.getElementById('edit-product-desc-how-to-use')?.value.trim() || '',
    problemsSolved: document.getElementById('edit-product-desc-problems-solved')?.value.trim() || ''
  };

  // calculate discount if applicable
  let discount = 0;
  if (priceOriginal > price && priceOriginal > 0) {
    discount = Math.floor(((priceOriginal - price) / priceOriginal) * 100);
  }

  // collect images in order
  const imageInputs = Array.from(document.querySelectorAll('.edit-image-url'));
  const images = imageInputs.map(i => (i.value || '').trim()).filter(Boolean);

  if (!name) {
    alert('يرجى إدخال اسم المنتج.');
    return;
  }

  // Get the product reference to save to Firestore BEFORE closing the editor
  let prodToSave = null;
  const existingIndex = FarahDB.PRODUCTS.findIndex(p => p.id === currentProductEditId);
  if (existingIndex >= 0) {
    FarahDB.PRODUCTS[existingIndex] = {
      ...FarahDB.PRODUCTS[existingIndex],
      name,
      category,
      price,
      priceWholesale,
      priceOriginal,
      discount,
      stock,
      badge,
      description,
      images,
    };
    prodToSave = FarahDB.PRODUCTS[existingIndex];
  } else {
    prodToSave = {
      id: currentProductEditId,
      sku: currentProductEditId,
      name,
      category,
      description,
      price,
      priceWholesale,
      priceOriginal,
      discount,
      stock,
      images,
      variants: {},
      rating: 0,
      reviews: 0,
      sold: 0,
      badge,
      badgeType: badge ? 'new' : '',
      featured: false,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    FarahDB.PRODUCTS.unshift(prodToSave);
  }

  closeProductEditor();
  renderProductsTable();
  renderDashboardStats();

  // write the product only to Firestore; the local array remains for current UI state
  try {
    if (window.db && window.db.collection && prodToSave) {
      window.db.collection('products').doc(prodToSave.id).set(prodToSave)
        .then(() => console.log('Successfully saved to Firestore:', prodToSave.id))
        .catch(err => console.warn('Firestore write failed (client):', err));
    }
  } catch (e) {
    console.warn('Firestore update skipped:', e);
  }
}

function deleteProduct(productId) {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
  const index = FarahDB.PRODUCTS.findIndex(p => p.id === productId);
  if (index >= 0) {
    FarahDB.PRODUCTS.splice(index, 1);
    renderProductsTable();
    renderDashboardStats();
  }

  try {
    if (window.db && window.db.collection) {
      window.db.collection('products').doc(productId).delete().catch(err => console.warn('Firestore delete failed:', err));
    }
  } catch (e) {
    console.warn('Firestore delete skipped:', e);
  }
}

function changeOrderStatus(orderId) {
  const orders = window.AdminOrders || [];
  const order = orders.find(item => item.id === orderId);
  if (!order) return;

  const currentStatus = order.status || order.orderStatus;
  const nextStatus = {
    new: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }[currentStatus] || 'processing';

  // Update in Firestore
  if (window.db && window.db.collection) {
    window.db.collection('orders').doc(orderId).update({ 
      status: nextStatus,
      updatedAt: new Date().toISOString()
    }).catch(err => {
      console.error('Error updating order status in Firestore:', err);
      alert('حدث خطأ أثناء تحديث حالة الطلب. تأكد من اتصالك بالإنترنت.');
    });
  } else {
    alert('قاعدة البيانات غير متصلة.');
  }
  
  // The UI will automatically update via the onSnapshot listener.
}

function renderOrdersTable() {
  const orders = window.AdminOrders || [];
  const statusFilter = document.getElementById('orders-status-filter')?.value || 'all';
  const searchQuery = document.getElementById('orders-search')?.value.toLowerCase() || '';
  const dateFrom = document.getElementById('orders-date-from')?.value;
  const dateTo = document.getElementById('orders-date-to')?.value;
  
  let filteredOrders = orders;
  
  if (statusFilter !== 'all') {
    filteredOrders = filteredOrders.filter(order => (order.status || order.orderStatus) === statusFilter);
  }
  
  if (searchQuery) {
    filteredOrders = filteredOrders.filter(order => 
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery)) ||
      (order.customerPhone && order.customerPhone.includes(searchQuery)) ||
      (order.id && order.id.toLowerCase().includes(searchQuery))
    );
  }
  
  if (dateFrom) {
    const fromTime = new Date(dateFrom).setHours(0, 0, 0, 0);
    filteredOrders = filteredOrders.filter(order => new Date(order.createdAt || order.updatedAt || Date.now()).getTime() >= fromTime);
  }
  
  if (dateTo) {
    const toTime = new Date(dateTo).setHours(23, 59, 59, 999);
    filteredOrders = filteredOrders.filter(order => new Date(order.createdAt || order.updatedAt || Date.now()).getTime() <= toTime);
  }

  const tbody = document.getElementById('orders-table-body');
  
  let html = '';
  if (filteredOrders.length === 0) {
    html = '<tr><td colspan="8" style="text-align:center;">لا توجد طلبات لعرضها</td></tr>';
  } else {
    filteredOrders.forEach(order => {
      const currentStatus = order.status || order.orderStatus;
      const createdAt = new Date(order.createdAt || order.updatedAt || Date.now()).toLocaleString('ar-EG');
      const address = order.address ? `${order.address.governorate || ''}, ${order.address.city || ''}, ${order.address.street || ''} ${order.address.details || ''}` : '-';
      
      let itemsHtml = '';
      if (order.items && order.items.length > 0) {
        itemsHtml = `
          <table style="width:100%; margin-top: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;">
            <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th></tr></thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <div style="display:flex; gap:10px; align-items:center;">
                      <img src="${item.image || 'https://via.placeholder.com/40'}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;">
                      <span>${item.name} ${item.variant ? Object.values(item.variant).join('-') : ''}</span>
                    </div>
                  </td>
                  <td>${item.qty}</td>
                  <td>${FarahDB.formatPrice(item.price)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      
      html += `
        <tr>
          <td>
            <button class="btn-icon expand-order-btn" data-order-id="${order.id}" style="font-size: 1.2rem;">➕</button>
          </td>
          <td>${order.id || 'بدون رقم'}</td>
          <td>${order.customerName || '-'}</td>
          <td>${order.customerPhone || '-'}</td>
          <td>${FarahDB.formatPrice(order.total || 0)}</td>
          <td>${order.paymentMethod === 'paymob_card' ? 'بطاقة مصرفية' : order.paymentMethod === 'paymob_wallet' ? 'محفظة إلكترونية' : 'الدفع عند الاستلام'}</td>
          <td>${createdAt}</td>
          <td>
            <select class="form-control status-dropdown" data-order-id="${order.id}" style="width:120px; padding: 4px 8px; font-size: 0.9rem;">
              <option value="new" ${currentStatus==='new'?'selected':''}>جديد</option>
              <option value="processing" ${currentStatus==='processing'?'selected':''}>قيد التجهيز</option>
              <option value="shipped" ${currentStatus==='shipped'?'selected':''}>تم الشحن</option>
              <option value="delivered" ${currentStatus==='delivered'?'selected':''}>مكتمل</option>
              <option value="cancelled" ${currentStatus==='cancelled'?'selected':''}>ملغي</option>
              <option value="returned" ${currentStatus==='returned'?'selected':''}>مرتجع</option>
            </select>
          </td>
        </tr>
        <tr class="order-details-row" id="details-${order.id}" style="display:none; background: rgba(255,255,255,0.02);">
          <td colspan="8" style="padding: 15px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <h4 style="color: var(--admin-gold); margin-bottom: 10px;">عناصر الطلب</h4>
                ${itemsHtml}
              </div>
              <div>
                <h4 style="color: var(--admin-gold); margin-bottom: 10px;">تفاصيل إضافية</h4>
                <p><strong>العنوان:</strong> ${address}</p>
                <p><strong>ملاحظات العميل:</strong> ${order.notes || 'لا يوجد'}</p>
                
                <div style="margin-top: 15px; display: flex; gap: 10px; align-items: center;">
                  <input type="text" class="form-control tracking-input" id="tracking-${order.id}" placeholder="رقم التتبع (Tracking Number)" value="${order.trackingNumber || ''}" style="max-width: 200px;">
                  <button class="btn btn-secondary save-tracking-btn" data-order-id="${order.id}">حفظ رقم التتبع</button>
                </div>
                
                <div style="margin-top: 15px;">
                  <button class="btn btn-gold print-invoice-btn" data-order-id="${order.id}">🖨️ طباعة بوليصة الشحن</button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      `;
    });
  }
  tbody.innerHTML = html;

  // Add event listeners for new buttons
  tbody.querySelectorAll('.expand-order-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.target.getAttribute('data-order-id');
      const row = document.getElementById(`details-${orderId}`);
      if (row.style.display === 'none') {
        row.style.display = 'table-row';
        e.target.textContent = '➖';
      } else {
        row.style.display = 'none';
        e.target.textContent = '➕';
      }
    });
  });
  
  tbody.querySelectorAll('.status-dropdown').forEach(dropdown => {
    dropdown.addEventListener('change', async (e) => {
      const orderId = e.target.getAttribute('data-order-id');
      const newStatus = e.target.value;
      try {
        if (window.db && window.db.collection) {
          await window.db.collection('orders').doc(orderId).update({ 
            status: newStatus,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn('Failed to update order status', err);
        alert('حدث خطأ أثناء تحديث حالة الطلب.');
      }
    });
  });
  
  tbody.querySelectorAll('.save-tracking-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const orderId = e.target.getAttribute('data-order-id');
      const trackingNumber = document.getElementById(`tracking-${orderId}`).value;
      try {
        if (window.db && window.db.collection) {
          await window.db.collection('orders').doc(orderId).update({ 
            trackingNumber: trackingNumber,
            updatedAt: new Date().toISOString()
          });
          alert('تم حفظ رقم التتبع بنجاح.');
        }
      } catch (err) {
        console.warn('Failed to update tracking', err);
        alert('حدث خطأ أثناء حفظ رقم التتبع.');
      }
    });
  });
  
  tbody.querySelectorAll('.print-invoice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const orderId = e.target.getAttribute('data-order-id');
      printOrderInvoice(orderId);
    });
  });
}


function initDashboard() {
  // Tab Switching
  const navItems = document.querySelectorAll('.nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));
      
      item.classList.add('active');
      const targetId = item.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');

      // Load shipping settings when the settings tab is opened
      if (targetId === 'tab-settings') initShippingSettings();
    });
  });

  // Sidebar Collapse
  const toggleBtn = document.getElementById('toggle-sidebar');
  const dashboardContainer = document.getElementById('dashboard');
  
  toggleBtn.addEventListener('click', () => {
    dashboardContainer.classList.toggle('sidebar-collapsed');
    const isCollapsed = dashboardContainer.classList.contains('sidebar-collapsed');
    toggleBtn.innerHTML = isCollapsed ? '<span>⏵</span>' : '<span>⏴</span>';
  });

  // Dropdowns
  const notifToggle = document.getElementById('notif-toggle');
  const notifDropdown = document.getElementById('notif-dropdown');
  const userToggle = document.getElementById('user-toggle');
  const userDropdown = document.getElementById('user-dropdown');

  notifToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('show');
    userDropdown.classList.remove('show');
  });

  userToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    userDropdown.classList.toggle('show');
    notifDropdown.classList.remove('show');
  });

  document.addEventListener('click', () => {
    notifDropdown.classList.remove('show');
    userDropdown.classList.remove('show');
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', async () => {
    if (window.auth) {
      await window.auth.signOut();
    }
    location.reload();
  });

  // Listen to Orders from Firestore
  window.AdminOrders = [];
  if (window.db && window.db.collection) {
    window.db.collection('orders').onSnapshot(snapshot => {
      const orders = [];
      snapshot.forEach(doc => {
        orders.push({ id: doc.id, ...doc.data() });
      });
      // Sort orders by date descending
      orders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      window.AdminOrders = orders;
      renderOrdersTable();
      renderDashboardStats();
      updateSalesChart();
    }, err => {
      console.error('Error fetching orders from Firestore:', err);
    });
  } else {
    console.warn("Firestore not initialized for Orders listener.");
  }

  document.getElementById('products-search')?.addEventListener('input', renderProductsTable);
  document.getElementById('products-category-filter')?.addEventListener('change', renderProductsTable);
  document.getElementById('orders-status-filter')?.addEventListener('change', renderOrdersTable);
  document.getElementById('btn-add-product')?.addEventListener('click', () => openProductEditor());
  
  // Excel Import Bindings
  document.getElementById('btn-import-excel')?.addEventListener('click', () => {
    document.getElementById('excel-file-input').click();
  });
  document.getElementById('excel-file-input')?.addEventListener('change', handleExcelUpload);
  document.getElementById('close-excel-preview')?.addEventListener('click', closeExcelPreview);
  document.getElementById('cancel-excel-import')?.addEventListener('click', closeExcelPreview);
  document.getElementById('confirm-excel-import')?.addEventListener('click', confirmExcelImport);

  document.getElementById('close-product-editor')?.addEventListener('click', closeProductEditor);
  document.getElementById('cancel-product-edit')?.addEventListener('click', closeProductEditor);
  document.getElementById('save-product-edit')?.addEventListener('click', saveProductEdit);

  window.addEventListener('FarahDBProductsUpdated', () => {
    renderProductsTable();
    renderDashboardStats();
  });

  const modal = document.getElementById('product-editor-modal');
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeProductEditor();
  });

  // Initial renders
  renderDashboardStats();
  renderProductsTable();
  renderOrdersTable();

  // Chart.js Initialization
  window.salesChartInstance = null;
  const ctx = document.getElementById('salesChart');
  if (ctx) {
    window.salesChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
        datasets: [{
          label: 'المبيعات (ج.م)',
          data: [0, 0, 0, 0, 0, 0, 0], // Will be updated dynamically
          borderColor: '#D4A853',
          backgroundColor: 'rgba(212, 168, 83, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#E8E6E3', font: { family: 'Cairo' } }
          }
        },
        scales: {
          y: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#E8E6E3', font: { family: 'Cairo' } }
          },
          x: {
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#E8E6E3', font: { family: 'Cairo' } }
          }
        }
      }
    });
  }

  // Counter Animation Initializer
  initCounters();
}

function updateSalesChart() {
  if (!window.salesChartInstance) return;
  const orders = window.AdminOrders || [];
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  
  // Just a simple demo visualization update based on total sales
  const data = [totalSales * 0.1, totalSales * 0.2, totalSales * 0.4, totalSales * 0.6, totalSales * 0.7, totalSales * 0.9, totalSales];
  window.salesChartInstance.data.datasets[0].data = data;
  window.salesChartInstance.update();
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    // Only init if not already animated to avoid loops
    if (counter.dataset.animated) return;
    counter.dataset.animated = 'true';
    
    const updateCount = () => {
      const target = +counter.getAttribute('data-target') || 0;
      const currentText = counter.innerText.replace(/,/g, '').replace(' ج.م', '');
      const count = +currentText || 0;
      const speed = 200;
      const inc = target / speed;
      
      if (count < target) {
        let val = Math.ceil(count + inc);
        if(counter.innerText.includes('ج.م')) {
          counter.innerText = val.toLocaleString('ar-EG') + ' ج.م';
        } else {
          counter.innerText = val.toLocaleString('ar-EG');
        }
        setTimeout(updateCount, 10);
      } else {
        if(counter.innerText.includes('ج.م') || counter.classList.contains('currency')) {
          counter.innerText = target.toLocaleString('ar-EG') + ' ج.م';
        } else {
          counter.innerText = target.toLocaleString('ar-EG');
        }
      }
    };
    updateCount();
  });
}


// ==========================================
// Excel Import Features
// ==========================================

let parsedExcelProducts = [];

function closeExcelPreview() {
  const modal = document.getElementById('excel-preview-modal');
  if (modal) modal.style.display = 'none';
  const fileInput = document.getElementById('excel-file-input');
  if (fileInput) fileInput.value = '';
  parsedExcelProducts = [];
}

function handleExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = evt.target.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);

      parsedExcelProducts = processExcelData(json);
      showExcelPreview(parsedExcelProducts);
    } catch (err) {
      console.error('Error parsing Excel:', err);
      alert('حدث خطأ أثناء قراءة ملف الإكسل. تأكد من أن الملف صالح.');
    }
  };
  reader.readAsBinaryString(file);
}

function cleanNum(val, defaultVal = 0) {
  if (val === undefined || val === null || val === '') return defaultVal;
  const num = parseFloat(String(val).replace(/,/g, '').trim());
  return isNaN(num) ? defaultVal : num;
}

function processExcelData(rows) {
  const products = [];
  
  rows.forEach(row => {
    let sku = String(row['كود المنتج (SKU)'] || row['كود المنتج'] || '').trim();
    if (!sku || sku === 'nan' || sku === 'غير متوفر') return;

    let pid = sku.toLowerCase();
    let name = String(row['اسم المنتج بالمتجر'] || row['اسم المنتج التجاري'] || '').trim();
    let nameEn = String(row['اسم المنتج التجاري'] || '').trim();
    
    let price = cleanNum(row['سعر البيع'] || row['السعر']);
    let priceOriginal = cleanNum(row['السعر قبل الخصم']);
    let priceWholesale = cleanNum(row['سعر الجملة']);
    
    let discount = 0;
    if (priceOriginal > price && priceOriginal > 0) {
      discount = Math.floor(((priceOriginal - price) / priceOriginal) * 100);
    }
    
    let stock = cleanNum(row['الكمية المتاحة'] || row['المخزون'], 100);
    let category = String(row['الفئة'] || '').trim();
    if (!category || category === 'nan') category = 'beauty';
    
    let description = String(row['الوصف التفصيلي'] || '').trim();
    if (description === 'nan' || !description) {
      description = String(row['الوصف القصير'] || '').trim();
      if (description === 'nan') description = '';
    }
    
    let images = [];
    let mainImg = String(row['رابط الصورة الرئيسية'] || '').trim();
    if (mainImg && mainImg !== 'nan') {
      // Clean file:/// from manual paths if any
      if (mainImg.startsWith('file:///')) {
        const parts = mainImg.split('/');
        const filename = parts[parts.length - 1];
        images.push('images/products/' + decodeURIComponent(filename));
      } else {
        images.push(mainImg);
      }
    }
    
    // Parse marketing columns if present
    let marketing = null;
    const uses = String(row['استخدامات المنتج'] || '').trim();
    const problemsSolved = String(row['المشاكل التي يحلها المنتج'] || '').trim();
    const howItWorks = String(row['كيف يعمل المنتج'] || '').trim();
    const howToUse = String(row['إزاي استخدمه'] || '').trim();
    const landingPageScript = String(row['سكريبت احترافي لصفحة الهبوط'] || '').trim();

    if (uses || problemsSolved || howItWorks || howToUse || landingPageScript) {
      marketing = {
        uses: uses === 'nan' ? '' : uses,
        problemsSolved: problemsSolved === 'nan' ? '' : problemsSolved,
        howItWorks: howItWorks === 'nan' ? '' : howItWorks,
        howToUse: howToUse === 'nan' ? '' : howToUse,
        landingPageScript: landingPageScript === 'nan' ? '' : landingPageScript
      };
    }

    const prodObj = {
      id: pid,
      sku: sku,
      name: name && name !== 'nan' ? name : nameEn,
      nameEn: nameEn !== 'nan' ? nameEn : '',
      category: category,
      description: description,
      price: price,
      priceWholesale: priceWholesale,
      priceOriginal: priceOriginal,
      discount: discount,
      stock: stock,
      images: images,
      variants: {},
      rating: 4.5,
      reviews: 120,
      sold: 300,
      badge: "جديد",
      badgeType: "new",
      featured: true,
      createdAt: new Date().toISOString().split('T')[0]
    };

    if (marketing) {
      prodObj.marketing = marketing;
    }

    products.push(prodObj);
  });
  
  return products;
}

function showExcelPreview(products) {
  const tbody = document.getElementById('excel-preview-body');
  const statsDiv = document.getElementById('excel-import-stats');
  const modal = document.getElementById('excel-preview-modal');
  
  tbody.innerHTML = '';
  let newCount = 0;
  let updateCount = 0;

  products.forEach(p => {
    // Check if product exists in global PRODUCTS array
    const exists = PRODUCTS.some(existing => existing.id === p.id || existing.sku === p.sku);
    const status = exists ? 'تحديث' : 'جديد';
    const statusColor = exists ? 'var(--admin-warning)' : 'var(--admin-success)';
    
    if (exists) updateCount++;
    else newCount++;

    const imgPreview = p.images.length > 0 
      ? `<img src="../${p.images[0]}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;background:#fff;">` 
      : '<span style="font-size:12px;color:#888;">بدون صورة</span>';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);color:${statusColor};font-weight:bold;">${status}</td>
      <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">${imgPreview}</td>
      <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);font-family:monospace;">${p.sku}</td>
      <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">${p.name}</td>
      <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">${p.price} ج.م</td>
      <td style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.05);">${p.stock}</td>
    `;
    tbody.appendChild(tr);
  });

  statsDiv.textContent = `إجمالي: ${products.length} منتج (${newCount} جديد، ${updateCount} تحديث)`;
  modal.style.display = 'flex';
}

async function confirmExcelImport() {
  const btn = document.getElementById('confirm-excel-import');
  const originalText = btn.textContent;
  
  if (!window.db) {
    alert('قاعدة البيانات غير متصلة.');
    return;
  }

  btn.textContent = 'جاري الرفع...';
  btn.disabled = true;

  try {
    const batchSize = 10;
    let completed = 0;
    
    // We upload sequentially or in small batches to avoid overwhelming
    for (let i = 0; i < parsedExcelProducts.length; i++) {
      const p = parsedExcelProducts[i];
      await window.db.collection('products').doc(p.id).set(p, { merge: true });
      completed++;
      btn.textContent = `جاري الرفع (${completed}/${parsedExcelProducts.length})...`;
    }

    alert('تم استيراد/تحديث المنتجات بنجاح في قاعدة البيانات!');
    closeExcelPreview();
  } catch (err) {
    console.error('Error importing to Firestore:', err);
    alert('حدث خطأ أثناء رفع المنتجات. يرجى مراجعة الـ Console.');
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}

/* ══════════════════════════════════════
   DAILY DEALS MANAGEMENT
══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  let currentDeals = window.FarahDB && window.FarahDB.Storage ? FarahDB.Storage.get('daily_deals_queue', []) : [];
  
  const select = document.getElementById('daily-deal-product-select');
  const priceInput = document.getElementById('daily-deal-price');
  const infoBox = document.getElementById('daily-deal-product-info');
  const tbody = document.getElementById('daily-deals-table-body');
  const btnAdd = document.getElementById('btn-add-daily-deal');
  const btnSave = document.getElementById('btn-save-daily-deals');
  
  if (!select || !tbody) return;
  
  function renderSelect() {
    if (!window.FarahDB || !FarahDB.PRODUCTS) return;
    select.innerHTML = '<option value="">-- اختر منتج لإضافته لطابور العروض --</option>' +
      FarahDB.PRODUCTS.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  }
  
  select.addEventListener('change', () => {
    const val = select.value;
    if (!val) {
      infoBox.style.display = 'none';
      priceInput.value = '';
      return;
    }
    const p = FarahDB.getProductById(val);
    if (p) {
      infoBox.style.display = 'block';
      infoBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
          <div><strong>كود المنتج:</strong> <span style="font-family: monospace; color: var(--admin-gold);">${p.id}</span></div>
          <div><strong>سعر الجملة:</strong> ${p.priceWholesale ? p.priceWholesale + ' ج.م' : '<span style="color:#888;">غير محدد</span>'}</div>
          <div><strong>سعر البيع:</strong> ${p.price} ج.م</div>
          <div><strong>السعر قبل الخصم:</strong> ${p.priceOriginal ? p.priceOriginal + ' ج.م' : '<span style="color:#888;">غير محدد</span>'}</div>
        </div>
      `;
      // Pre-fill with a suggested discount or just leave empty
      // priceInput.value = p.price;
    }
  });
  
  function renderTable() {
    if (!window.FarahDB) return;
    tbody.innerHTML = currentDeals.map((deal, index) => {
      const p = FarahDB.getProductById(deal.productId);
      if (!p) return '';
      const imgPath = (p.images && p.images[0]) ? (p.images[0].startsWith('http') ? p.images[0] : '../' + p.images[0].replace(/^\.\//, '')) : '';
      
      const priceOriginal = p.priceOriginal || p.price;
      const disc = priceOriginal > deal.offerPrice ? Math.round((1 - deal.offerPrice / priceOriginal) * 100) : 0;
      
      return `
        <tr>
          <td style="font-family: monospace; font-size: 0.85rem; color: var(--admin-gold);">${p.id}</td>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              ${imgPath ? `<img src="${imgPath}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" />` : ''}
              <span>${p.name}</span>
            </div>
          </td>
          <td>${p.priceWholesale ? p.priceWholesale + ' ج.م' : 'N/A'}</td>
          <td>${p.price} ج.م</td>
          <td style="text-decoration: line-through; color: #888;">${p.priceOriginal ? p.priceOriginal + ' ج.م' : 'N/A'}</td>
          <td><strong style="color:var(--admin-gold)">${deal.offerPrice} ج.م</strong></td>
          <td><span style="background:var(--admin-gold); color:#000; padding:2px 8px; border-radius:4px; font-weight:bold;">${disc}%</span></td>
          <td>
            <button class="btn btn-icon btn-remove-deal" data-index="${index}" style="color: var(--admin-danger);" title="حذف">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
    
    tbody.querySelectorAll('.btn-remove-deal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.dataset.index);
        currentDeals.splice(idx, 1);
        renderTable();
      });
    });
  }
  
  btnAdd.addEventListener('click', () => {
    const val = select.value;
    const offerPrice = parseFloat(priceInput.value);
    
    if (!val || isNaN(offerPrice)) {
      alert('يرجى اختيار المنتج وتحديد سعر العرض!');
      return;
    }
    
    if (currentDeals.find(d => d.productId === val)) {
      alert('هذا المنتج موجود بالفعل في قائمة العروض!');
      return;
    }
    
    currentDeals.push({
      productId: val,
      offerPrice: offerPrice
    });
    
    renderTable();
    
    // Reset inputs
    select.value = '';
    priceInput.value = '';
    infoBox.style.display = 'none';
    
    // Auto save the list to storage on add
    if (window.FarahDB && FarahDB.Storage) {
      FarahDB.Storage.set('daily_deals_queue', currentDeals);
    }
  });
  
  btnSave.addEventListener('click', () => {
    if (window.FarahDB && FarahDB.Storage) {
      FarahDB.Storage.set('daily_deals_queue', currentDeals);
      // Reset the tracking so the queue starts fresh today if wanted, or just keep it
      // but let's reset to index 0 today for predictable behavior on save
      FarahDB.Storage.set('current_deal_index', 0);
      FarahDB.Storage.set('last_deal_date', new Date().toDateString());
      alert('تم حفظ قائمة العروض وإعادة تعيين ترتيبها للبدء من أول منتج اليوم بنجاح!');
    }
  });
  
  const initInterval = setInterval(() => {
    if (window.FarahDB && FarahDB.PRODUCTS && FarahDB.PRODUCTS.length > 0) {
      clearInterval(initInterval);
      if (currentDeals.length === 0 && FarahDB.Storage) {
        const loaded = FarahDB.Storage.get('daily_deals_queue', []);
        if (loaded.length > 0 && typeof loaded[0] !== 'string') {
          currentDeals = loaded;
        }
      }
      renderSelect();
      renderTable();
    }
  }, 500);

  // (shipping settings are now managed via initShippingSettings() called when tab opens)

});

/* ══════════════════════════════════════
   ADMIN — SHIPPING SETTINGS (Firestore)
══════════════════════════════════════ */
function initShippingSettings() {
  const zone1El     = document.getElementById('ship-zone1');
  const zone2El     = document.getElementById('ship-zone2');
  const zone3El     = document.getElementById('ship-zone3');
  const thresholdEl = document.getElementById('ship-free-threshold');
  const btnSave     = document.getElementById('btn-save-shipping');
  const msgEl       = document.getElementById('ship-settings-msg');
  const lastSavedEl = document.getElementById('ship-last-saved');

  if (!btnSave) return;

  function showMsg(text, ok = true) {
    if (!msgEl) return;
    msgEl.style.display = 'block';
    msgEl.style.background = ok ? 'rgba(46,204,113,0.12)' : 'rgba(231,76,60,0.12)';
    msgEl.style.border     = `1px solid ${ok ? 'rgba(46,204,113,0.3)' : 'rgba(231,76,60,0.3)'}`;
    msgEl.style.color      = ok ? '#2ecc71' : '#e74c3c';
    msgEl.textContent      = text;
    setTimeout(() => { msgEl.style.display = 'none'; }, 4000);
  }

  // ── Load current values from Firestore (live) ──
  function populateForm(data) {
    if (!data) return;
    if (thresholdEl) thresholdEl.value = data.freeShippingThreshold ?? 600;
    if (data.rates) {
      if (zone1El) zone1El.value = data.rates.zone1 ?? 85;
      if (zone2El) zone2El.value = data.rates.zone2 ?? 95;
      if (zone3El) zone3El.value = data.rates.zone3 ?? 110;
    }
    if (lastSavedEl && data.updatedAt) {
      const d = new Date(data.updatedAt);
      lastSavedEl.textContent = `آخر حفظ: ${d.toLocaleDateString('ar-EG')} ${d.toLocaleTimeString('ar-EG')}`;
    }
  }

  // Try Firestore first, then Storage fallback
  if (window.db) {
    window.db.collection('settings').doc('shipping').get()
      .then(snap => {
        if (snap.exists) {
          populateForm(snap.data());
        } else {
          // fallback to storage
          const saved = window.FarahDB?.Storage?.get('shipping_settings');
          if (saved) populateForm(saved);
          else populateForm({ freeShippingThreshold: 600, rates: { zone1: 85, zone2: 95, zone3: 110 } });
        }
      })
      .catch(() => {
        const saved = window.FarahDB?.Storage?.get('shipping_settings');
        if (saved) populateForm(saved);
      });
  } else {
    const saved = window.FarahDB?.Storage?.get('shipping_settings');
    populateForm(saved || { freeShippingThreshold: 600, rates: { zone1: 85, zone2: 95, zone3: 110 } });
  }

  // ── Save to Firestore on button click ──
  btnSave.onclick = async () => {
    const settings = {
      freeShippingThreshold: parseFloat(thresholdEl?.value) || 600,
      rates: {
        zone1: parseFloat(zone1El?.value) || 85,
        zone2: parseFloat(zone2El?.value) || 95,
        zone3: parseFloat(zone3El?.value) || 110,
      },
      updatedAt: Date.now()
    };

    // Cache in Storage immediately
    if (window.FarahDB?.Storage) {
      window.FarahDB.Storage.set('shipping_settings', settings);
    }

    if (window.db) {
      try {
        await window.db.collection('settings').doc('shipping').set(settings);
        showMsg('✅ تم حفظ إعدادات الشحن في Firestore بنجاح!');
        if (lastSavedEl) lastSavedEl.textContent = `آخر حفظ: ${new Date().toLocaleString('ar-EG')}`;
      } catch (err) {
        console.error('Shipping settings save error:', err);
        showMsg('⚠️ تم الحفظ محلياً فقط — تحقق من اتصال Firestore', false);
      }
    } else {
      showMsg('⚠️ تم الحفظ محلياً فقط (Firestore غير متاح)', false);
    }
  };
}



// ==========================================
// Print Invoice
// ==========================================
function printOrderInvoice(orderId) {
  const orders = window.AdminOrders || [];
  const order = orders.find(o => o.id === orderId);
  if (!order) return;
  
  const address = order.address ? `${order.address.governorate || ''}, ${order.address.city || ''}, ${order.address.street || ''} ${order.address.details || ''}` : '-';
  const createdAt = new Date(order.createdAt || order.updatedAt || Date.now()).toLocaleString('ar-EG');
  
  let itemsHtml = order.items ? order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name} ${item.variant ? Object.values(item.variant).join('-') : ''}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.price} ج.م</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.price * item.qty} ج.م</td>
    </tr>
  `).join('') : '';

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html dir="rtl" lang="ar">
    <head>
      <title>فاتورة شحن - ${order.id}</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #333; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FFB400; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #FFB400; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
        .box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { background: #f9f9f9; padding: 10px; text-align: right; border-bottom: 2px solid #ddd; }
        .total { text-align: left; font-size: 1.2rem; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">فرح ستور - Farah Store</div>
        <div>
          <h2>فاتورة طلب / بوليصة شحن</h2>
          <p>رقم الطلب: <strong>${order.id}</strong></p>
          <p>التاريخ: ${createdAt}</p>
        </div>
      </div>
      
      <div class="details-grid">
        <div class="box">
          <h3>بيانات العميل</h3>
          <p><strong>الاسم:</strong> ${order.customerName}</p>
          <p><strong>الهاتف:</strong> ${order.customerPhone}</p>
          <p><strong>العنوان:</strong> ${address}</p>
          <p><strong>الملاحظات:</strong> ${order.notes || 'لا يوجد'}</p>
        </div>
        <div class="box">
          <h3>معلومات الشحن</h3>
          <p><strong>رقم التتبع:</strong> ${order.trackingNumber || 'غير محدد'}</p>
          <p><strong>طريقة الدفع:</strong> ${order.paymentMethod === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 'دفع مسبق'}</p>
          <p><strong>حالة الطلب:</strong> ${order.status || order.orderStatus}</p>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>المنتج</th>
            <th style="text-align: center;">الكمية</th>
            <th style="text-align: center;">سعر الوحدة</th>
            <th style="text-align: center;">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="total">
        <p>إجمالي الطلب: <span style="color: #FFB400;">${order.total || 0} ج.م</span></p>
      </div>
      
      <div style="text-align: center; margin-top: 50px; font-size: 0.9rem; color: #777;">
        <p>شكراً لتسوقكم من فرح ستور</p>
      </div>
      
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ==========================================
// Marketing Editor Modal
// ==========================================
function openMarketingModal(productId) {
  const product = FarahDB.PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  const m = product.marketing || {};
  document.getElementById('edit-market-uses').value = m.uses || '';
  document.getElementById('edit-market-problems').value = m.problemsSolved || '';
  document.getElementById('edit-market-howitworks').value = m.howItWorks || '';
  document.getElementById('edit-market-howtouse').value = m.howToUse || '';
  document.getElementById('edit-market-script').value = m.landingPageScript || '';
  
  document.getElementById('marketing-modal-title').textContent = `(${product.name})`;
  document.getElementById('save-marketing-edit').setAttribute('data-product-id', productId);
  
  document.getElementById('marketing-editor-modal').style.display = 'flex';
}

document.getElementById('close-marketing-editor')?.addEventListener('click', () => {
  document.getElementById('marketing-editor-modal').style.display = 'none';
});
document.getElementById('cancel-marketing-edit')?.addEventListener('click', () => {
  document.getElementById('marketing-editor-modal').style.display = 'none';
});
document.getElementById('save-marketing-edit')?.addEventListener('click', async (e) => {
  const productId = e.target.getAttribute('data-product-id');
  
  const marketingData = {
    uses: document.getElementById('edit-market-uses').value.trim(),
    problemsSolved: document.getElementById('edit-market-problems').value.trim(),
    howItWorks: document.getElementById('edit-market-howitworks').value.trim(),
    howToUse: document.getElementById('edit-market-howtouse').value.trim(),
    landingPageScript: document.getElementById('edit-market-script').value.trim()
  };
  
  try {
    if (window.db && window.db.collection) {
      await window.db.collection('products').doc(productId).update({ marketing: marketingData });
      
      // Update local array
      const product = FarahDB.PRODUCTS.find(p => p.id === productId);
      if (product) {
        product.marketing = marketingData;
      }
      
      document.getElementById('marketing-editor-modal').style.display = 'none';
      alert('تم حفظ المحتوى التسويقي بنجاح!');
    }
  } catch (err) {
    console.warn('Failed to save marketing data', err);
    alert('حدث خطأ أثناء حفظ المحتوى التسويقي.');
  }
});

// Event listeners for filters
document.getElementById('products-sort')?.addEventListener('change', renderProductsTable);
document.getElementById('orders-search')?.addEventListener('input', renderOrdersTable);
document.getElementById('orders-date-from')?.addEventListener('change', renderOrdersTable);
document.getElementById('orders-date-to')?.addEventListener('change', renderOrdersTable);

document.getElementById('btn-export-orders')?.addEventListener('click', () => {
  const orders = window.AdminOrders || [];
  if (orders.length === 0) return alert('لا توجد طلبات للتصدير');
  
  const exportData = orders.map(o => ({
    'رقم الطلب': o.id,
    'اسم العميل': o.customerName,
    'الهاتف': o.customerPhone,
    'المبلغ': o.total,
    'الحالة': o.status || o.orderStatus,
    'التاريخ': new Date(o.createdAt || o.updatedAt || Date.now()).toLocaleString('ar-EG'),
    'طريقة الدفع': o.paymentMethod,
    'العنوان': o.address ? `${o.address.governorate || ''}, ${o.address.city || ''}, ${o.address.street || ''} ${o.address.details || ''}` : '',
    'الملاحظات': o.notes || '',
    'رقم التتبع': o.trackingNumber || ''
  }));
  
  const ws = window.XLSX.utils.json_to_sheet(exportData);
  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, "الطلبات");
  window.XLSX.writeFile(wb, `orders_${new Date().getTime()}.xlsx`);
});
