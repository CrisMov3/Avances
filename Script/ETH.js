(function() {
    document.addEventListener('DOMContentLoaded', function() {
        
        // --- LÓGICA PARA "POR QUÉ USAR ZEITPLAN" ---
        const featureCardsWrapper = document.querySelector('.feature-cards-wrapper');
        const desktopImagePanel = document.querySelector('.why-image-panel');
        if (featureCardsWrapper && desktopImagePanel) {
            const featureCards = featureCardsWrapper.querySelectorAll('.feature-card');
            const desktopDisplayImage = document.getElementById('zeitplan-display-image');
            const desktopImageCaption = document.getElementById('zeitplan-image-caption');
            const mobileMediaQuery = window.matchMedia('(max-width: 1200px)');

            function updateDesktopDisplay(cardElement) {
                if (!cardElement) return;
                const newImageSrc = cardElement.dataset.image;
                const newImageAlt = cardElement.dataset.alt;
                const cardTitle = cardElement.querySelector('.card-text h3').textContent;
                const cardDescription = cardElement.querySelector('.card-text p').textContent;
                desktopDisplayImage.style.opacity = 0;
                setTimeout(() => {
                    desktopDisplayImage.src = newImageSrc;
                    desktopDisplayImage.alt = newImageAlt;
                    desktopImageCaption.textContent = `${cardTitle}: ${cardDescription}`;
                    desktopDisplayImage.style.opacity = 1;
                }, 250);
            }
            
            function handleMobileDisplay(cardElement) {
                const currentlyOpenImage = document.querySelector('.mobile-image-display');
                const wasActive = cardElement.classList.contains('active');
                if (currentlyOpenImage) { currentlyOpenImage.remove(); }
                featureCards.forEach(c => c.classList.remove('active'));
                if (!wasActive) {
                    cardElement.classList.add('active');
                    const newImageSrc = cardElement.dataset.image;
                    const newImageAlt = cardElement.dataset.alt;
                    const imageContainer = document.createElement('div');
                    imageContainer.className = 'mobile-image-display';
                    imageContainer.innerHTML = `<img src="${newImageSrc}" alt="${newImageAlt}">`;
                    cardElement.after(imageContainer);
                }
            }
            
            featureCardsWrapper.addEventListener('click', function(event) {
                const clickedCard = event.target.closest('.feature-card');
                if (!clickedCard) return;
                if (mobileMediaQuery.matches) { handleMobileDisplay(clickedCard); } 
                else {
                    featureCards.forEach(c => c.classList.remove('active'));
                    clickedCard.classList.add('active');
                    updateDesktopDisplay(clickedCard);
                }
            });

            function setInitialStateWhyZeitplan() {
                const openImage = document.querySelector('.mobile-image-display');
                if (openImage) openImage.remove();
                if (mobileMediaQuery.matches) {
                    featureCards.forEach(c => c.classList.remove('active'));
                } else {
                    if (featureCards.length > 0) {
                        if (!document.querySelector('.feature-card.active')) {
                            featureCards[0].classList.add('active');
                        }
                        updateDesktopDisplay(document.querySelector('.feature-card.active') || featureCards[0]);
                    }
                }
            }
            setInitialStateWhyZeitplan();
            mobileMediaQuery.addEventListener('change', setInitialStateWhyZeitplan);
        }

        // --- LÓGICA PARA "SERVICIOS ADICIONALES" ---
        const servicesContainer = document.getElementById('additional-services');
        if (servicesContainer) {
            const serviceCards = servicesContainer.querySelectorAll('.service-card');
            const defaultContent = document.getElementById('default-service-content');
            const dynamicContent = document.getElementById('dynamic-service-content');
            const mobileMediaQuery = window.matchMedia('(max-width: 1200px)'); // Reutilizamos la media query
            const detailsWrapper = document.getElementById('service-details-wrapper');

            const servicesData = {
                mantenimiento: {
                    title: "Mantenimiento de equipos",
                    description: "Soluciones preventivas y correctivas para tus equipos.",
                    subServices: [
                        { icon: "mdi-speedometer", text: "Optimización de sistemas" },
                        { icon: "mdi-brush-outline", text: "Limpieza física y lógica" },
                        { icon: "mdi-swap-horizontal", text: "Reemplazo de piezas dañadas" },
                        { icon: "mdi-update", text: "Actualización de software" }
                    ]
                },
                redes: {
                    title: "Redes",
                    description: "Administración de redes con seguridad y rendimiento.",
                    subServices: [
                        { icon: "mdi-ethernet-cable", text: "Cableado estructurado" },
                        { icon: "mdi-router-wireless-settings", text: "Configuración de routers" },
                        { icon: "mdi-wifi-strength-3", text: "Redes Wi-Fi seguras" },
                        { icon: "mdi-lan-check", text: "Monitoreo de red" }
                    ]
                },
                instalacion: {
                    title: "Instalación",
                    description: "Implementación de hardware, software y servidores.",
                    subServices: [
                        { icon: "mdi-application-braces-outline", text: "Software académico" },
                        { icon: "mdi-harddisk", text: "Montaje de hardware" },
                        { icon: "mdi-server-network", text: "Configuración de servidores" },
                        { icon: "mdi-puzzle-outline", text: "Infraestructura completa" }
                    ]
                },
                soporte: {
                    title: "Soporte Técnico",
                    description: "Acompañamiento en el uso de la plataforma y equipos.",
                    subServices: [
                        { icon: "mdi-remote-desktop", text: "Atención remota" },
                        { icon: "mdi-account-hard-hat-outline", text: "Soporte en sitio" },
                        { icon: "mdi-account-group-outline", text: "Capacitación al personal" },
                        { icon: "mdi-check-circle-outline", text: "Resolución rápida" }
                    ]
                }
            };

            serviceCards.forEach(card => {
                card.addEventListener('click', function() {
                    const targetKey = this.dataset.target;
                    const wasActive = this.classList.contains('active');
                    serviceCards.forEach(c => c.classList.remove('active'));
                    
                    if (wasActive) {
                        defaultContent.classList.remove('hidden');
                        dynamicContent.classList.add('hidden');
                    } else {
                        this.classList.add('active');
                        const serviceData = servicesData[targetKey];
                        let subServicesHTML = serviceData.subServices.map(sub => `
                            <div class="sub-service-card">
                                <i class="mdi ${sub.icon}"></i>
                                <h4>${sub.text}</h4>
                            </div>
                        `).join('');
                        dynamicContent.innerHTML = `
                            <h3>${serviceData.title}</h3>
                            <p>${serviceData.description}</p>
                            <div class="sub-service-grid">${subServicesHTML}</div>
                        `;
                        defaultContent.classList.add('hidden');
                        dynamicContent.classList.remove('hidden');

                        // *** NUEVA FUNCIONALIDAD: SCROLL EN MÓVIL ***
                        if (mobileMediaQuery.matches) {
                            setTimeout(() => {
                                detailsWrapper.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'center'
                                });
                            }, 100); // Pequeño delay para dar tiempo a que se renderice
                        }
                    }
                });
            });
        }
    });
})();
