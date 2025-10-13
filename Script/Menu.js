// ===== CONFIGURACIÓN =====
const modalEnabled = true; // CAMBIADO A 'true' PARA QUE EL MODAL SE MUESTRE

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
      if (isActive) { closeMenu(); } else { openMenu(); }
    }
    hamburgerBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', closeMenu);
    navLinks.forEach(link => { link.addEventListener('click', closeMenu); });
  }

  // --- Lógica del Modal de Bienvenida ---
  if (modalEnabled) {
    const modal = document.getElementById("welcomeModal");
    if (modal) {
        const closeBtn = modal.querySelector('.close');
        
        // Muestra el modal al cargar la página
        setTimeout(() => {
          modal.classList.add('open');
        }, 500); // Pequeño retraso para que la carga de la página se sienta suave

        // Función para cerrar el modal CON ANIMACIÓN
        function closeModal() {
          modal.classList.add('closing'); // <-- AÑADE LA CLASE PARA LA ANIMACIÓN DE CIERRE
          
          setTimeout(() => {
            modal.classList.remove('open');
            modal.classList.remove('closing'); // Limpia las clases después de la animación
          }, 400); // La duración debe coincidir con la animación CSS
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
  }
  
  // --- Lógica para Pausar Carrusel de Logos ---
  const logoSlider = document.querySelector('.logo-slider');
  if (logoSlider) {
    const logoTrack = logoSlider.querySelector('.logo-track');
    logoSlider.addEventListener('mouseenter', () => {
      logoTrack.style.animationPlayState = 'paused';
    });
    logoSlider.addEventListener('mouseleave', () => {
      logoTrack.style.animationPlayState = 'running';
    });
  }
});
