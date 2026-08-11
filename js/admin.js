// Mock authentication
const loginBtn = document.getElementById('login-btn');
const passwordInput = document.getElementById('login-password');
const loginError = document.getElementById('login-error');
const loginModal = document.getElementById('login-modal');
const dashboard = document.getElementById('dashboard');

function attemptLogin() {
  const pwd = passwordInput.value;
  if (pwd === '1234') {
    loginBtn.innerHTML = '<span class="spinner" style="display:inline-block; width:20px; height:20px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></span> جاري الدخول...';
    setTimeout(() => {
      sessionStorage.setItem('adminLoggedIn', 'true');
      loginModal.style.opacity = '0';
      setTimeout(() => {
        loginModal.style.display = 'none';
        dashboard.style.display = 'grid';
        initDashboard();
      }, 500);
    }, 1000);
  } else {
    loginError.style.display = 'block';
  }
}

loginBtn.addEventListener('click', attemptLogin);
passwordInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') attemptLogin();
});

// Check session
if (sessionStorage.getItem('adminLoggedIn') === 'true') {
  loginModal.style.display = 'none';
  dashboard.style.display = 'grid';
  initDashboard();
}

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
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
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
