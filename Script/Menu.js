// ===== CONFIGURACIÓN =====
const modalEnabled = true; // Cambia a false para desactivar el modal

// ===== SCROLL EFFECT (navbar) =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== MODAL =====
document.addEventListener("DOMContentLoaded", () => {
  if (!modalEnabled) return; // Si está en false, no se ejecuta

  const modal = document.getElementById("welcomeModal");
  if (!modal) return;

  const closeBtn = modal.querySelector('.close');

  // Mostrar modal al cargar
  setTimeout(() => {
    modal.classList.add('open');
    modal.style.display = "flex";
  }, 100);

  // Función para cerrar con animación
  function closeModal() {
    modal.classList.remove('open');
    modal.classList.add('closing');
    setTimeout(() => {
      modal.classList.remove('closing');
      modal.style.display = "none";
    }, 400); // mismo tiempo que la animación en CSS
  }

  // Cerrar con botón
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  // Cerrar haciendo clic fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  // Cerrar con tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
});
