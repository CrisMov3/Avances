// Envolvemos todo en una función para evitar conflictos con otras variables
(function() {
    // ===== CONFIGURACIÓN =====
    const modalEnabled = true; // El modal no está en esta página, lo dejamos en false

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
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Si es un enlace de anclaje, solo cierra el menú.
                if (link.getAttribute('href').startsWith('#')) {
                    closeMenu();
                }
                // Si es un enlace a otra página, el comportamiento por defecto de navegar continuará.
            });
        });
      }

      // --- Lógica del Modal de Bienvenida (si existe) ---
      if (modalEnabled) {
        const modal = document.getElementById("welcomeModal");
        if (modal) {
            const closeBtn = modal.querySelector('.close');
            setTimeout(() => {
              modal.classList.add('open');
            }, 500);

            function closeModal() {
              modal.classList.add('closing');
              setTimeout(() => {
                modal.classList.remove('open');
                modal.classList.remove('closing');
              }, 400);
            }

            if (closeBtn) closeBtn.addEventListener('click', closeModal);
            window.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
            window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
        }
      }
    });
})();

// ===============================================
      // ===== NUEVO: LÓGICA MODAL "PRÓXIMAMENTE" =====
      // ===============================================
      const navMenuLinks = document.querySelectorAll('#nav-menu a'); // Todos los links del menú
      const modalProximamente = document.getElementById('modal-proximamente');
      const modalCloseBtn = document.getElementById('modal-close-btn');

      if (modalProximamente && modalCloseBtn) {
          const openModal = (e) => {
              e.preventDefault(); // Evita que la página salte al '#'
              modalProximamente.classList.remove('hidden');
          };
          const closeModal = () => {
              modalProximamente.classList.add('hidden');
          };

          navMenuLinks.forEach(link => {
              const linkText = link.textContent.trim().toUpperCase();
              // Aplica el modal solo a estos enlaces
              if (linkText === 'CLIENTES') {
                  link.addEventListener('click', openModal);
              }
          });

          modalCloseBtn.addEventListener('click', closeModal);
          modalProximamente.addEventListener('click', (e) => {
              // Cierra si se hace clic en el fondo oscuro (el overlay)
              if (e.target === modalProximamente) closeModal();
          });
      }

      // ===================================================
      // ===== NUEVO: LÓGICA BOTÓN VOLVER ARRIBA       =====
      // ===================================================
      const scrollTopBtn = document.getElementById('scroll-to-top');
      
      if (scrollTopBtn) {
          // 1. Mostrar/Ocultar el botón al hacer scroll
          window.addEventListener('scroll', () => {
              if (window.scrollY > 300) { // Muestra el botón después de 300px
                  scrollTopBtn.classList.add('visible');
              } else {
                  scrollTopBtn.classList.remove('visible');
              }
          });

          // 2. Acción de clic para subir
          scrollTopBtn.addEventListener('click', (e) => {
              e.preventDefault();
              window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
              });
          });
      }