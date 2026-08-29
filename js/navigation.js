/**
 * KHOJI NEPAL — Navigation & Drawer Handlers (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  const hamburgerBtn = document.getElementById('mobile-hamburger');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const langDropdown = document.getElementById('lang-dropdown');
  const notifBtn = document.getElementById('notif-btn');
  const notifDrawer = document.getElementById('notif-drawer');

  // Mobile sidebar toggle
  if (hamburgerBtn && sidebar) {
    hamburgerBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop && sidebar) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
    });
  }

  // Language Dropdown Toggle
  if (langToggleBtn && langDropdown) {
    langToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('show');
      if (notifDrawer) notifDrawer.classList.remove('show');
    });
  }

  // Notification Drawer Toggle
  if (notifBtn && notifDrawer) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDrawer.classList.toggle('show');
      if (langDropdown) langDropdown.classList.remove('show');
    });
  }

  // Close menus on outside click or Escape key
  document.addEventListener('click', (e) => {
    if (langDropdown && !langDropdown.contains(e.target) && e.target !== langToggleBtn) {
      langDropdown.classList.remove('show');
    }
    if (notifDrawer && !notifDrawer.contains(e.target) && e.target !== notifBtn) {
      notifDrawer.classList.remove('show');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (sidebar) sidebar.classList.remove('open');
      if (backdrop) backdrop.classList.remove('show');
      if (langDropdown) langDropdown.classList.remove('show');
      if (notifDrawer) notifDrawer.classList.remove('show');
      window.closeAllModals();
    }
  });

  // Highlight active sidebar navigation item based on current pathname
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile Bottom Nav Active Link
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
  mobileNavItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      item.classList.add('active');
    }
  });
});
