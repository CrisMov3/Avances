(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const paymentSection = document.getElementById('pagos-en-linea');
        if (paymentSection) {
            // Elementos de la UI
            const step1 = document.getElementById('payment-step-1');
            const step2 = document.getElementById('payment-step-2');
            const step3 = document.getElementById('payment-step-3');
            const btnNextStep1 = document.getElementById('btn-next-step-1');
            const docInput = document.getElementById('document-number');
            const idError = document.getElementById('id-error');
            const paymentButtons = document.querySelectorAll('.btn-pay');
            const cancelPaymentLink = document.getElementById('cancel-payment');
            const btnFinishPayment = document.getElementById('btn-finish-payment');
            const paymentAmountRadios = document.querySelectorAll('input[name="payment-amount"]');
            const partialAmountInput = document.getElementById('partial-amount-input');
            const stepIndicators = document.querySelectorAll('.step-item');
            const greetingElement = document.getElementById('payment-step-2-greeting');
            const invoiceSelectorContainer = document.getElementById('invoice-selector-container');
            const paymentDetailsContainer = document.getElementById('payment-details-container');
            const invoiceStatusElement = document.querySelector('.invoice-header .status');
            const penaltyDetailsElement = document.getElementById('penalty-details'); 
            const penaltyAmountElement = document.getElementById('penalty-amount'); 
            const baseAmountElement = document.getElementById('base-amount'); 

            // --- Constantes ---
            const PENALTY_AMOUNT = 50000;

            // --- Datos simulados de usuarios con fechas ---
            const userData = {
                "1001": {
                    name: "StrokBig",
                    invoices: [
                        { id: "SB-MA01", concept: "Mantenimiento Preventivo Q3", amount: 1500000, dueDate: "05 Oct 2025" },
                        { id: "SB-MA02", concept: "Licencia Software X", amount: 2000000, dueDate: "10 Nov 2025" },
                        { id: "SB-MA03", concept: "Soporte Técnico Octubre", amount: 500000, dueDate: "15 Nov 2025" },
                        { id: "SB-MA04", concept: "Desarrollo Módulo Y", amount: 1000000, dueDate: "01 Sep 2025" }
                    ]
                },
                "2002": {
                    name: "Cristian Lopez",
                    invoices: [
                        { id: "SB-CL02", concept: "Consultoría Inicial", amount: 2000000, dueDate: "25 Nov 2025" }
                    ]
                }
            };
            let currentUser = null;
            let selectedInvoiceData = null;

            // --- Funciones Auxiliares ---
            const formatCurrency = (value) => `$ ${value.toLocaleString('es-CO')}`;

            const isOverdue = (dueDateString) => {
                const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
                const parts = dueDateString.split(" ");
                if (parts.length !== 3) return false; 
                const day = parseInt(parts[0], 10);
                const monthIndex = months.findIndex(m => parts[1].toLowerCase().startsWith(m));
                const year = parseInt(parts[2], 10);
                if (isNaN(day) || monthIndex === -1 || isNaN(year)) return false;
                const dueDate = new Date(year, monthIndex, day);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0,0,0,0);
                return dueDate < today;
            };

            const processInvoices = (invoices) => {
                return invoices.map(invoice => {
                    const overdue = isOverdue(invoice.dueDate);
                    const totalAmount = overdue ? invoice.amount + PENALTY_AMOUNT : invoice.amount;
                    const status = overdue ? "EN MORA" : "PENDIENTE";
                    return { ...invoice, totalAmount, status, isOverdue: overdue };
                });
            };

            const showStep = (stepToShow) => {
                [step1, step2, step3].forEach(step => {
                    step.classList.add('hidden');
                    step.classList.remove('active');
                });
                stepToShow.classList.remove('hidden');
                stepToShow.classList.add('active');

                stepIndicators.forEach(indicator => indicator.classList.remove('active'));
                if (stepToShow === step1) {
                    document.getElementById('step-indicator-1').classList.add('active');
                } else if (stepToShow === step2) {
                    document.getElementById('step-indicator-1').classList.add('active');
                    document.getElementById('step-indicator-2').classList.add('active');
                } else if (stepToShow === step3) {
                    stepIndicators.forEach(indicator => indicator.classList.add('active'));
                }
            };

            // --- Lógica Principal ---
            btnNextStep1.addEventListener('click', () => {
                const enteredId = docInput.value.trim();
                selectedInvoiceData = null;
                invoiceSelectorContainer.innerHTML = '<p>Selecciona la factura que deseas pagar:</p>';
                paymentDetailsContainer.classList.add('hidden');
                invoiceSelectorContainer.style.display = 'none';

                if (enteredId === '') {
                    idError.textContent = 'Por favor, ingresa un número de identificación.';
                    idError.style.display = 'block';
                    currentUser = null;
                } else if (userData[enteredId]) {
                    idError.style.display = 'none';
                    currentUser = {
                        ...userData[enteredId],
                        processedInvoices: processInvoices(userData[enteredId].invoices)
                    };
                    greetingElement.textContent = `Hola ${currentUser.name},`;

                    if (currentUser.processedInvoices.length > 1) {
                        invoiceSelectorContainer.style.display = 'block';
                        paymentDetailsContainer.classList.add('hidden');
                        currentUser.processedInvoices.forEach((invoice, index) => {
                            const optionDiv = document.createElement('div');
                            optionDiv.className = 'invoice-option';
                            optionDiv.innerHTML = `
                                <input type="radio" id="invoice-${index}" name="invoice-selection" value="${index}">
                                <label for="invoice-${index}">
                                    <span class="invoice-details-summary">
                                        Factura ${invoice.id} - ${invoice.concept} 
                                        (<span class="status-${invoice.status.toLowerCase().replace(' ', '-')}">${invoice.status}</span>)
                                    </span>
                                    <span class="invoice-amount">${formatCurrency(invoice.totalAmount)}</span>
                                </label>
                            `;
                            invoiceSelectorContainer.appendChild(optionDiv);
                        });
                        invoiceSelectorContainer.removeEventListener('change', handleInvoiceSelection);
                        invoiceSelectorContainer.addEventListener('change', handleInvoiceSelection);
                    } else if (currentUser.processedInvoices.length === 1) {
                        invoiceSelectorContainer.style.display = 'none';
                        selectedInvoiceData = currentUser.processedInvoices[0];
                        populatePaymentDetails();
                        paymentDetailsContainer.classList.remove('hidden');
                    } else {
                        invoiceSelectorContainer.style.display = 'block';
                        invoiceSelectorContainer.innerHTML = '<p>No tienes facturas pendientes de pago.</p>';
                        paymentDetailsContainer.classList.add('hidden');
                    }
                    showStep(step2);

                } else {
                    idError.textContent = 'Numero de identificación invalido';
                    idError.style.display = 'block';
                    currentUser = null;
                }
            });
            
            function handleInvoiceSelection(event) {
                if (event.target.name === 'invoice-selection') {
                    const selectedIndex = parseInt(event.target.value);
                    selectedInvoiceData = currentUser.processedInvoices[selectedIndex];
                    populatePaymentDetails();
                    paymentDetailsContainer.classList.remove('hidden');
                }
            }

            // *** FUNCIÓN ACTUALIZADA PARA POBLAR DETALLES ***
            function populatePaymentDetails() {
                 if (!selectedInvoiceData) return;
                 document.getElementById('invoice-number-display').textContent = selectedInvoiceData.id;
                 document.getElementById('invoice-concept').textContent = selectedInvoiceData.concept;
                 
                 // Mostrar valor base
                 baseAmountElement.textContent = formatCurrency(selectedInvoiceData.amount);

                 // Mostrar/Ocultar y llenar detalles de mora
                 if (selectedInvoiceData.isOverdue) {
                     penaltyAmountElement.textContent = formatCurrency(PENALTY_AMOUNT);
                     penaltyDetailsElement.style.display = 'flex'; // Usar flex para que se alinee
                 } else {
                     penaltyDetailsElement.style.display = 'none'; // Ocultar si no hay mora
                 }
                 
                 // Mostrar valor total
                 const formattedTotal = formatCurrency(selectedInvoiceData.totalAmount);
                 document.getElementById('total-due').textContent = formattedTotal;
                 document.getElementById('total-amount-label').textContent = formattedTotal;
                 document.getElementById('due-date').textContent = selectedInvoiceData.dueDate;

                 // Actualizar estado visualmente
                 invoiceStatusElement.textContent = selectedInvoiceData.status;
                 invoiceStatusElement.className = `status status-${selectedInvoiceData.status.toLowerCase().replace(' ', '-')}`;

                 document.getElementById('pago-total').checked = true;
                 partialAmountInput.disabled = true;
                 partialAmountInput.value = '';
            }


            paymentAmountRadios.forEach(radio => {
                radio.addEventListener('change', () => {
                    partialAmountInput.disabled = !document.getElementById('pago-parcial').checked;
                    if (partialAmountInput.disabled) partialAmountInput.value = '';
                    else partialAmountInput.focus();
                });
            });

            paymentButtons.forEach(button => {
                button.addEventListener('click', function() {
                    if (!currentUser || !selectedInvoiceData) return;

                    const method = this.dataset.method;
                    let amountPaid = '';
                    let amountValue = selectedInvoiceData.totalAmount; 

                    if (document.getElementById('pago-parcial').checked && partialAmountInput.value) {
                        amountValue = parseFloat(partialAmountInput.value.replace(/[^0-9]/g, '')) || 0;
                        if (amountValue > selectedInvoiceData.totalAmount || amountValue <= 0) {
                            alert(`El valor ingresado (${amountValue > 0 ? formatCurrency(amountValue) : '0'}) debe ser mayor a cero y no puede ser mayor al total pendiente (${formatCurrency(selectedInvoiceData.totalAmount)}).`);
                            return;
                        }
                    }
                    amountPaid = `COP ${amountValue.toLocaleString('es-CO')}`;

                    showStep(step3);
                    
                    document.getElementById('receipt-invoice').textContent = selectedInvoiceData.id;
                    document.getElementById('receipt-concept').textContent = selectedInvoiceData.concept + (selectedInvoiceData.isOverdue ? ' (+ Cargo por Mora)' : ''); 
                    document.getElementById('receipt-amount').textContent = amountPaid;
                    document.getElementById('receipt-method').textContent = method;
                    document.getElementById('receipt-date').textContent = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric'});
                    document.getElementById('receipt-ref').textContent = `#${Math.floor(Math.random() * 9000000) + 1000000}`;
                });
            });

            cancelPaymentLink.addEventListener('click', (e) => {
                e.preventDefault();
                showStep(step1);
                docInput.value = '';
                currentUser = null;
                selectedInvoiceData = null;
                invoiceSelectorContainer.innerHTML = '<p>Selecciona la factura que deseas pagar:</p>';
                paymentDetailsContainer.classList.add('hidden');
                invoiceSelectorContainer.style.display = 'none';
            });

            btnFinishPayment.addEventListener('click', () => {
                showStep(step1);
                docInput.value = '';
                currentUser = null;
                selectedInvoiceData = null;
                invoiceSelectorContainer.innerHTML = '<p>Selecciona la factura que deseas pagar:</p>';
                paymentDetailsContainer.classList.add('hidden');
                invoiceSelectorContainer.style.display = 'none';
            });
            
            showStep(step1);
        }
    });
})();