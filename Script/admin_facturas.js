document.addEventListener('DOMContentLoaded', () => {
    // IDs que debe tener el HTML
    const identificacionInput = document.getElementById('identificacion_cliente');
    const tipoClienteSelect = document.getElementById('tipo_cliente');
    const nombreClienteInput = document.getElementById('nombre_cliente');
    const clienteStatus = document.getElementById('cliente-status');
    const facturaForm = document.getElementById('factura-form'); // <-- Obtener el formulario

    // --- Validación inicial de elementos ---
    if (!identificacionInput || !tipoClienteSelect || !nombreClienteInput || !clienteStatus) {
         console.warn('Faltan elementos del formulario: identificacion_cliente, tipo_cliente, nombre_cliente, o cliente-status.');
         return; // Detener si faltan elementos básicos
    }
     if (!facturaForm) {
         console.warn('El formulario principal con id="factura-form" no fue encontrado.');
         // No detenemos, pero el re-enable no funcionará
     }
    // --- Fin Validación ---

    identificacionInput.addEventListener('blur', async () => {
        const identificacion = identificacionInput.value.trim();

        // Reset fields and status before search
        nombreClienteInput.readOnly = false;
        tipoClienteSelect.disabled = false;
        clienteStatus.textContent = '';
        clienteStatus.style.display = 'none';
        clienteStatus.style.color = 'inherit';
        clienteStatus.style.backgroundColor = 'transparent';
        clienteStatus.style.border = 'none';

        if (identificacion === '') {
            nombreClienteInput.value = '';
            tipoClienteSelect.value = '';
            return;
        }

        clienteStatus.textContent = 'Buscando cliente...';
        clienteStatus.style.display = 'inline';
        clienteStatus.style.color = '#666';

        try {
            const response = await fetch(`api/buscar_cliente_simple.php?id=${encodeURIComponent(identificacion)}`);

            if (!response.ok) {
                let errorMsg = 'Error en la respuesta del servidor.';
                try { const errorData = await response.json(); if (errorData && errorData.message) errorMsg = errorData.message; } catch(e) {}
                throw new Error(errorMsg);
            }

            const data = await response.json();

            if (data.success && data.cliente) {
                // Client found
                nombreClienteInput.value = data.cliente.nombre_completo; // Viene del PHP (clave 'nombre_completo')
                tipoClienteSelect.value = data.cliente.tipo_cliente; // Viene del PHP (clave 'tipo_cliente')

                nombreClienteInput.readOnly = true;
                tipoClienteSelect.disabled = true; // <-- Se deshabilita aquí

                clienteStatus.textContent = 'Cliente encontrado.';
                clienteStatus.style.color = '#065f46'; // Dark Green
                clienteStatus.style.backgroundColor = '#d1fae5'; // Light Green
                clienteStatus.style.border = '1px solid #a7f3d0';

            } else {
                // Client not found
                nombreClienteInput.value = '';
                tipoClienteSelect.value = '';
                nombreClienteInput.readOnly = false;
                tipoClienteSelect.disabled = false;

                clienteStatus.textContent = 'Cliente no registrado. Puede ingresar los datos.';
                clienteStatus.style.color = '#ca8a04'; // Orange/Yellow
                clienteStatus.style.backgroundColor = '#fef9c3'; // Light Yellow
                clienteStatus.style.border = '1px solid #fde68a';
            }

        } catch (error) {
            console.error('Error al buscar cliente:', error);
            clienteStatus.textContent = `Error al buscar: ${error.message}. Intente de nuevo.`;
            clienteStatus.style.color = '#991b1b'; // Dark Red
            clienteStatus.style.backgroundColor = '#fee2e2'; // Light Red
            clienteStatus.style.border = '1px solid #fecaca';
            nombreClienteInput.readOnly = false;
            tipoClienteSelect.disabled = false;
        } finally {
            clienteStatus.style.display = 'inline';
        }
    });

    // --- Event Listener para el SUBMIT del formulario ---
    if (facturaForm) {
        facturaForm.addEventListener('submit', (event) => {
            // Re-habilita temporalmente el select ANTES de enviar
            if (tipoClienteSelect.disabled) {
                tipoClienteSelect.disabled = false;
            }
            // El campo readOnly SÍ envía su valor, no es necesario cambiarlo
            // if (nombreClienteInput.readOnly) {
            //     nombreClienteInput.readOnly = false;
            // }

            // Opcional: Podrías volver a deshabilitarlos después de un pequeño delay
            // setTimeout(() => {
            //    if (!tipoClienteSelect.disabled && nombreClienteInput.readOnly) { // Solo si estaban bloqueados
            //         tipoClienteSelect.disabled = true;
            //    }
            // }, 100); // 100ms delay might be enough for submission to start

            // No llamamos a event.preventDefault() para que el formulario se envíe normalmente
        });
    }
    // --- FIN ---

});