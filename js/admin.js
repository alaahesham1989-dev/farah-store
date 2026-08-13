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
  const searchQuery = document.getElementById('products-search')?.value || '';
  const categoryFilter = document.getElementById('products-category-filter')?.value || 'all';
  let filteredProducts = FarahDB.PRODUCTS;

  if (categoryFilter !== 'all') {
    filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
  }
  if (searchQuery.trim()) {
    const query = searchQuery.trim().toLowerCase();
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.nameEn?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query)
    );
  }

  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = filteredProducts.map(product => {
    const badgeClass = product.stock > 0 ? 'badge badge-success' : 'badge badge-danger';
    const badgeText = product.stock > 0 ? 'نشط' : 'غير متوفر';
    let thumb = product.images?.[0] || 'https://via.placeholder.com/48x48?text=No';
    // admin page sits in /pages/, product image paths in data are relative to root
    if (thumb && !thumb.startsWith('http') && !thumb.startsWith('/')) {
      thumb = '../' + thumb.replace(/^\.\//, '');
    }
    return `
      <tr>
        <td><img src="${thumb}" alt="${product.name}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;" onerror="this.src='https://via.placeholder.com/48x48?text=No'"/></td>
        <td>${product.name}</td>
        <td>${getCategoryLabel(product.category)}</td>
        <td style="color:var(--admin-warning);">${(product.priceWholesale || 0).toLocaleString('ar-EG')} ج.م</td>
        <td style="font-weight:bold;">${product.price.toLocaleString('ar-EG')} ج.م</td>
        <td style="color:var(--admin-success); font-weight:bold;">${((product.price || 0) - (product.priceWholesale || 0)).toLocaleString('ar-EG')} ج.م</td>
        <td>${product.stock}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>
          <button class="btn-icon" data-product-id="${product.id}" data-action="edit">✏️</button>
          <button class="btn-icon" data-product-id="${product.id}" data-action="delete" style="color: var(--admin-danger)">🗑️</button>
        </td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="7" style="text-align:center;">لا توجد منتجات لعرضها</td></tr>';

  tbody.querySelectorAll('button[data-product-id]').forEach(button => {
    button.addEventListener('click', () => {
      const productId = button.getAttribute('data-product-id');
      const action = button.getAttribute('data-action');
      if (action === 'edit') {
        openProductEditor(productId);
      } else if (action === 'delete') {
        deleteProduct(productId);
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
      images,
    };
  } else {
    FarahDB.PRODUCTS.unshift({
      id: currentProductEditId,
      sku: currentProductEditId,
      name,
      category,
      description: '',
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
    });
  }

  closeProductEditor();
  renderProductsTable();
  renderDashboardStats();

  // write the product only to Firestore; the local array remains for current UI state
  try {
    if (window.db && window.db.collection) {
      const prod = FarahDB.PRODUCTS.find(p => p.id === currentProductEditId);
      if (prod) {
        window.db.collection('products').doc(prod.id).set(prod).catch(err => console.warn('Firestore write failed (client):', err));
      }
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

  const nextStatus = {
    new: 'processing',
    processing: 'shipped',
    shipped: 'delivered',
    delivered: 'delivered',
    cancelled: 'cancelled',
  }[order.orderStatus] || 'processing';

  // Update in Firestore
  if (window.db && window.db.collection) {
    window.db.collection('orders').doc(orderId).update({ 
      orderStatus: nextStatus,
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
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(order => order.orderStatus === statusFilter);

  const tbody = document.getElementById('orders-table-body');
  tbody.innerHTML = filteredOrders.map(order => {
    const badgeClass = getStatusBadgeClass(order.orderStatus);
    const badgeText = formatOrderStatus(order.orderStatus);
    const createdAt = new Date(order.createdAt || order.updatedAt || Date.now()).toLocaleDateString('ar-EG');
    return `
      <tr>
        <td>${order.id || 'بدون رقم'}</td>
        <td>${order.customerName || '-'}</td>
        <td>${order.customerPhone || '-'}</td>
        <td>${FarahDB.formatPrice(order.total || 0)}</td>
        <td>${order.paymentMethod === 'paymob_card' ? 'بطاقة مصرفية' : order.paymentMethod === 'paymob_wallet' ? 'محفظة إلكترونية' : 'الدفع عند الاستلام'}</td>
        <td><span class="${badgeClass}">${badgeText}</span></td>
        <td>${createdAt}</td>
        <td><button class="btn-icon" data-order-id="${order.id}">➡️</button></td>
      </tr>
    `;
  }).join('') || '<tr><td colspan="8" style="text-align:center;">لا توجد طلبات محفوظة</td></tr>';

  tbody.querySelectorAll('button[data-order-id]').forEach(button => {
    button.addEventListener('click', () => {
      const orderId = button.getAttribute('data-order-id');
      changeOrderStatus(orderId);
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
    
    products.push({
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
    });
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
  const select = document.getElementById('daily-deal-product-select');
  const tbody = document.getElementById('daily-deals-table-body');
  const btnAdd = document.getElementById('btn-add-daily-deal');
  const btnSave = document.getElementById('btn-save-daily-deals');
  if (!select || !tbody) return;
  
  let currentDeals = window.FarahDB && window.FarahDB.Storage ? FarahDB.Storage.get('daily_deals_queue', []) : [];
  
  const priceInput = document.getElementById('daily-deal-price');
  
  function renderSelect() {
    if (!window.FarahDB || !FarahDB.PRODUCTS) return;
    select.innerHTML = '<option value="">-- اختر منتج لإضافته لطابور العروض --</option>' +
      FarahDB.PRODUCTS.map(p => `<option value="${p.id}">${p.name} - ${p.price} ج.م</option>`).join('');
  }
  
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
          <td>${index + 1}</td>
          <td>
            <div style="display:flex; align-items:center; gap:10px;">
              ${imgPath ? `<img src="${imgPath}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;" />` : ''}
              <span>${p.name}</span>
            </div>
          </td>
          <td>${p.priceWholesale || 'N/A'} / ${priceOriginal}</td>
          <td><strong style="color:var(--admin-gold)">${deal.offerPrice} ج.م</strong></td>
          <td><span style="background:var(--admin-gold); color:#000; padding:2px 8px; border-radius:4px; font-weight:bold;">${disc}% خصم</span></td>
          <td>
            <button class="btn btn-icon btn-remove-deal" data-index="${index}" style="color: var(--admin-danger);">🗑️</button>
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
  });
  
  btnSave.addEventListener('click', () => {
    if (window.FarahDB && FarahDB.Storage) {
      FarahDB.Storage.set('daily_deals_queue', currentDeals);
      // Reset the tracking so the queue starts fresh today if wanted, or just keep it
      // but let's reset to index 0 today for predictable behavior on save
      FarahDB.Storage.set('current_deal_index', 0);
      FarahDB.Storage.set('last_deal_date', new Date().toDateString());
      alert('تم حفظ قائمة العروض بنجاح!');
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
});
