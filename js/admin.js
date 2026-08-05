document.addEventListener('DOMContentLoaded', () => {
  // Simple Mock Login
  const loginBtn = document.getElementById('admin-login-btn');
  const passwordInput = document.getElementById('admin-password');
  const loginModal = document.getElementById('admin-login-modal');
  const dashboard = document.getElementById('admin-dashboard');
  const errorMsg = document.getElementById('admin-login-error');

  loginBtn.addEventListener('click', () => {
    if (passwordInput.value === '1234') { // Mock password
      loginModal.classList.remove('active');
      dashboard.style.display = 'flex';
      initDashboard();
    } else {
      errorMsg.style.display = 'block';
    }
  });

  // Tab Switching
  const tabs = document.querySelectorAll('.admin-menu li[data-tab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active from all tabs
      document.querySelectorAll('.admin-menu li').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.admin-tab').forEach(c => c.classList.remove('active'));
      
      // Add active to clicked
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById(target).classList.add('active');
    });
  });

    function initDashboard() {
    loadProductsFromDB();
    // Orders logic later
  }

  async function loadProductsFromDB() {
    const tbody = document.getElementById('admin-products-tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">جاري تحميل المنتجات...</td></tr>';
    
    try {
      const snapshot = await db.collection('products').get();
      if (snapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد منتجات في القاعدة. اضغط على زر النقل لجلب المنتجات المؤقتة.</td></tr>';
        return;
      }
      
      let html = '';
      snapshot.forEach(doc => {
        const p = doc.data();
        html += 
          <tr>
            <td><img src="../ + (p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg') + " alt="Product"></td>
            <td> + p.name + </td>
            <td> + p.price +  ج.م</td>
            <td> + (p.stock || 100) + </td>
            <td>
              <button class="btn-sm btn-edit">تعديل</button>
              <button class="btn-sm btn-delete">حذف</button>
            </td>
          </tr>
        ;
      });
      tbody.innerHTML = html;
    } catch (e) {
      console.error(e);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">خطأ في الاتصال بقاعدة البيانات</td></tr>';
    }
  }

  // Sync DB Button Logic
  const syncBtn = document.getElementById('sync-db-btn');
  if(syncBtn) {
    syncBtn.addEventListener('click', async () => {
      syncBtn.disabled = true;
      syncBtn.textContent = 'جاري النقل...';
      try {
        const batch = db.batch();
        PRODUCTS.forEach(p => {
          const docRef = db.collection('products').doc(p.id);
          batch.set(docRef, p);
        });
        await batch.commit();
        alert('تم نقل المنتجات إلى قاعدة البيانات بنجاح!');
        loadProductsFromDB();
      } catch (error) {
        console.error('Sync Error:', error);
        alert('حدث خطأ أثناء النقل.');
      }
      syncBtn.disabled = false;
      syncBtn.textContent = 'نقل المنتجات المؤقتة للقاعدة';
    });
  }

  function renderProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    tbody.innerHTML = '';
    PRODUCTS.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = 
        <td><img src="../ + (p.images && p.images[0] ? p.images[0] : 'images/placeholder.jpg') + " alt="Product"></td>
        <td> + p.name + </td>
        <td> + p.price +  ج.م</td>
        <td> + (p.stock || 100) + </td>
        <td>
          <button class="btn-sm btn-edit">تعديل</button>
          <button class="btn-sm btn-delete">حذف</button>
        </td>
      ;
      tbody.appendChild(tr);
    });
  }
});

