(function() {
    document.addEventListener('DOMContentLoaded', function() {
        
        const featureCardsWrapper = document.querySelector('.feature-cards-wrapper');
        const desktopImagePanel = document.querySelector('.why-image-panel');
        
        if (!featureCardsWrapper || !desktopImagePanel) {
            return;
        }
        
        const featureCards = featureCardsWrapper.querySelectorAll('.feature-card');
        const desktopDisplayImage = document.getElementById('zeitplan-display-image');
        const desktopImageCaption = document.getElementById('zeitplan-image-caption');

        const mobileMediaQuery = window.matchMedia('(max-width: 1200px)');

        function updateDesktopDisplay(cardElement) {
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

            if (currentlyOpenImage) {
                currentlyOpenImage.remove();
            }

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

            if (mobileMediaQuery.matches) {
                handleMobileDisplay(clickedCard);
            } else {
                featureCards.forEach(c => c.classList.remove('active'));
                clickedCard.classList.add('active');
                updateDesktopDisplay(clickedCard);
            }
        });

        function setInitialState() {
            const openImage = document.querySelector('.mobile-image-display');
            if (openImage) openImage.remove();
            
            if (mobileMediaQuery.matches) {
                featureCards.forEach(c => c.classList.remove('active'));
            } else {
                if (featureCards.length > 0) {
                    let isActiveFound = false;
                    featureCards.forEach(card => {
                        if(card.classList.contains('active')) isActiveFound = true;
                    });
                    if (!isActiveFound) {
                        featureCards[0].classList.add('active');
                    }
                    updateDesktopDisplay(document.querySelector('.feature-card.active'));
                }
            }
        }

        setInitialState();
        mobileMediaQuery.addEventListener('change', setInitialState);
    });
})();
