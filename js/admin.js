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
    renderProducts();
    // In Phase 1, orders are currently handled via Telegram, so this is just a placeholder
    // When Firebase is integrated, we will fetch orders here
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
