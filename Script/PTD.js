// ===== CONFIGURACIÓN =====
// Para la página de inicio (Menu.html), ponlo en "true". Para las demás, en "false".
const modalEnabled = false; 

// ===== LÓGICA DE NAVBAR Y MODAL =====
document.addEventListener("DOMContentLoaded", () => {
  
  // --- Efecto de Scroll en Navbar ---
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

  // --- Lógica del Menú Responsive ---
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

  // --- Lógica del Modal de Bienvenida ---
  const modal = document.getElementById("welcomeModal");
  if (modalEnabled && modal) {
    const closeBtn = modal.querySelector('.close');

    setTimeout(() => {
      modal.style.display = "flex";
      modal.classList.add('open');
    }, 100);

    function closeModal() {
      modal.classList.remove('open');
      modal.classList.add('closing');
      setTimeout(() => {
        modal.classList.remove('closing');
        modal.style.display = "none";
      }, 400);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    window.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }
});
