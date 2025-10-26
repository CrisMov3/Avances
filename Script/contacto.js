document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitButton = contactForm ? contactForm.querySelector('button[type="submit"]') : null;

    if (!contactForm || !formStatus || !submitButton) {
        console.warn('Formulario de contacto, mensaje de estado o botón de envío no encontrado.');
        return;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevenir recarga de página

        // Mostrar estado de envío y deshabilitar botón
        formStatus.textContent = 'Enviando mensaje...';
        formStatus.className = 'form-status-message'; // Reset classes
        formStatus.style.display = 'block';
        submitButton.disabled = true;
        submitButton.style.opacity = '0.7';

        // Crear FormData a partir del formulario
        const formData = new FormData(contactForm);

        try {
            // Enviar datos al script PHP
            const response = await fetch('api/enviar_correo.php', { // Asegúrate que la ruta sea correcta
                method: 'POST',
                body: formData
            });

            // Obtener la respuesta JSON del servidor
            const result = await response.json();

            // Mostrar mensaje de éxito o error
            formStatus.textContent = result.message;
            if (result.success) {
                formStatus.classList.add('success');
                contactForm.reset(); // Limpiar formulario si fue exitoso
                // Opcional: Ocultar mensaje después de unos segundos
                // setTimeout(() => {
                //     formStatus.style.display = 'none';
                // }, 5000);
            } else {
                formStatus.classList.add('error');
            }

        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            formStatus.textContent = 'Hubo un error al conectar con el servidor. Intente de nuevo.';
            formStatus.classList.add('error');
        } finally {
            // Siempre re-habilitar el botón
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
        }
    });
});