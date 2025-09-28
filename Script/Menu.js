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
  const modal = document.getElementById("welcomeModal");
  if (!modal) return; // si no existe, salimos

  // mostrar modal cada carga
  // usamos clase 'open' para evitar conflictos con estilos inline
  // añade una pequeña demora si prefieres (opcional)
  setTimeout(() => modal.classList.add('open'), 50);

  const closeBtn = modal.querySelector('.close');

  // cerrar con botón
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  // cerrar haciendo clic fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
    }
  });

  // cerrar con tecla Esc
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      modal.classList.remove('open');
    }
  });
});
