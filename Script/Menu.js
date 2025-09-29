// ===== CONFIGURACIÓN =====
const modalEnabled = true;

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
  const navLinks = navMenu.querySelectorAll('a');

  function toggleMenu() {
    // Revisa si el menú ya está activo para decidir si abrir o cerrar
    const isActive = hamburgerBtn.classList.contains('active');
    if (isActive) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  function openMenu() {
    if (header) header.classList.add('header-menu-open');
    hamburgerBtn.classList.add('active');
    navMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.classList.add('no-scroll');
  }

  function closeMenu() {
    if (header) header.classList.remove('header-menu-open');
    hamburgerBtn.classList.remove('active');
    navMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
  }

  if (header && hamburgerBtn && navMenu && overlay) {
    hamburgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    
    // Cierra el menú si se hace clic en un enlace dentro de él
    navLinks.forEach(link => {
      link.addEventListener('click', closeMenu);
    });
  }

  // --- Lógica del Modal de Bienvenida ---
  if (modalEnabled) {
    const modal = document.getElementById("welcomeModal");
    if (!modal) return; // Si el modal no existe, no continúa
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
