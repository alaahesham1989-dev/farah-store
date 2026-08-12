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
  initDashboard();
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
  if (!window.auth) {
    console.error('Firebase Auth is not initialized.');
    showLoginError('Firebase Auth غير متاحة. تحقق من الإعدادات.');
    return;
  }

  window.auth.onAuthStateChanged(user => {
    if (user) {
      showDashboard();
    } else {
      showLogin();
    }
  });
});

// Add CSS keyframe for spinner dynamically
const style = document.createElement('style');
style.innerHTML = `@keyframes spin { 100% { transform: rotate(360deg); } }`;
document.head.appendChild(style);

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

  // Chart.js Initialization
  const ctx = document.getElementById('salesChart');
  if (ctx) {
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو'],
        datasets: [{
          label: 'المبيعات (ج.م)',
          data: [65000, 59000, 80000, 81000, 56000, 95000, 125400],
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

  // Counter Animation
  const counters = document.querySelectorAll('.counter');
  counters.forEach(counter => {
    const target = +counter.getAttribute('data-target');
    const updateCount = () => {
      const count = +counter.innerText.replace(/,/g, '').replace(' ج.م', '');
      const speed = 200;
      const inc = target / speed;
      if (count < target) {
        let val = Math.ceil(count + inc);
        if(counter.innerText.includes('ج.م')) {
          counter.innerText = val.toLocaleString() + ' ج.م';
        } else {
          counter.innerText = val.toLocaleString();
        }
        setTimeout(updateCount, 10);
      } else {
        if(counter.innerText.includes('ج.م')) {
          counter.innerText = target.toLocaleString() + ' ج.م';
        } else {
          counter.innerText = target.toLocaleString();
        }
      }
    };
    updateCount();
  });

  // Mock Firebase load
  console.log("Attempting to connect to Firebase...");
  setTimeout(() => {
    console.log("Firebase not configured. Falling back to mock data.");
  }, 1000);
}
