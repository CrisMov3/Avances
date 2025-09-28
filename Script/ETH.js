(function(){
            const buttons = document.querySelectorAll('.why-item');
            const img = document.getElementById('mockup-image');
            const caption = document.getElementById('mockup-caption');

            function activate(btn){
                buttons.forEach(b => {
                    b.classList.toggle('active', b === btn);
                    b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
                });
            }

            buttons.forEach((btn, i) => {
                // set initial aria-pressed
                btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
                if(i === 0) btn.classList.add('active');

                btn.addEventListener('click', () => {
                    const src = btn.dataset.img;
                    const text = btn.dataset.caption || '';
                    if (src) img.src = src;
                    if (text) caption.textContent = text;
                    activate(btn);
                });
            });
        })();

function showDetail(service) {
        document.querySelectorAll('.service-detail').forEach(d => d.classList.remove('active'));
        document.getElementById(service).classList.add('active');
    }

// ===== SCROLL EFFECT =====
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
    <!-- OPTIONAL JS: animación al entrar en viewport -->
  (function(){
    const items = document.querySelectorAll('.why-item');
    if ('IntersectionObserver' in window){
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.style.transform = 'translateY(0)';
            e.target.style.opacity = '1';
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
      items.forEach(it => {
        it.style.transform = 'translateY(18px)';
        it.style.opacity = '0';
        obs.observe(it);
      });
    }
  })();

