// ===== CONFIGURACIÓN =====
const modalEnabled = false; // El modal está desactivado en esta página

// ===== LÓGICA DE NAVBAR Y MODAL =====
document.addEventListener("DOMContentLoaded", () => {
  
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  const header = document.getElementById('header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');
  const overlay = document.getElementById('overlay');
  
  if (header && hamburgerBtn && navMenu && overlay) {
    const navLinks = navMenu.querySelectorAll('a');

    function openMenu() {
      header.classList.add('header-menu-open');
      hamburgerBtn.classList.add('active');
      navMenu.classList.add('active');
      overlay.classList.add('active');
      document.body.classList.add('no-scroll');
    }

    function closeMenu() {
      header.classList.remove('header-menu-open');
      hamburgerBtn.classList.remove('active');
      navMenu.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('no-scroll');
    }

    function toggleMenu() {
      const isActive = hamburgerBtn.classList.contains('active');
      if (isActive) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    hamburgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  const modal = document.getElementById("welcomeModal");
  if (modalEnabled && modal) {
    // La lógica del modal no se ejecutará aquí
  }
});
