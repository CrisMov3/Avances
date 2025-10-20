(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const paymentSection = document.getElementById('pagos-en-linea');
        if (paymentSection) {
            // --- Elementos UI ---
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
            const invoiceOptionsList = document.getElementById('invoice-options-list'); 
            const paymentSummaryContainer = document.getElementById('payment-summary-container'); 
            const selectAllCheckbox = document.getElementById('select-all-invoices');
            const selectedBaseAmountEl = document.getElementById('selected-base-amount');
            const selectedPenaltyAmountEl = document.getElementById('selected-penalty-amount');
            const selectedTotalAmountEl = document.getElementById('selected-total-amount');
            const selectedInvoicesCountEl = document.getElementById('selected-invoices-count');
            const totalSelectedAmountLabelEl = document.getElementById('total-selected-amount-label');
            const penaltyDetailsSummaryItems = document.querySelectorAll('.penalty-details-summary'); // Nodos para detalles de mora
            const interestRateDetailsEl = document.getElementById('interest-rate-details');

            // --- Constantes y Datos ---
            const RATE_NATURAL = 0.075; // 7.5% diario
            const RATE_JURIDICA = 0.15; // 15% diario

            const userData = {
                "1001": { 
                    name: "StrokBig", 
                    type: "juridica", 
                    invoices: [
                        { id: "SB-MA01", concept: "Mantenimiento Preventivo Q3", amount: 1500000, dueDate: "2025-10-05" }, 
                        { id: "SB-MA02", concept: "Licencia Software X", amount: 2000000, dueDate: "2025-11-10" }, 
                        { id: "SB-MA03", concept: "Soporte Técnico Octubre", amount: 500000, dueDate: "2025-11-15" }, 
                        { id: "SB-MA04", concept: "Desarrollo Módulo Y", amount: 1000000, dueDate: "2025-09-01" } 
                    ] 
                },
                "2002": { 
                    name: "Cristian Lopez", 
                    type: "natural", 
                    invoices: [
                        { id: "SB-CL02", concept: "Consultoría Inicial", amount: 2000000, dueDate: "2025-11-25" } 
                    ] 
                }
            };
            let currentUser = null; 
            let processedInvoices = []; 

            // --- Funciones Auxiliares ---
            const formatCurrency = (value) => `$ ${Math.round(value).toLocaleString('es-CO')}`; // Redondea para evitar decimales extraños por interés
            const formatPercentage = (rate) => `${(rate * 100).toFixed(1)}%`;

            const getDaysOverdue = (dueDateString) => {
                const dueDate = new Date(dueDateString + "T00:00:00"); 
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0,0,0,0);
                if (dueDate >= today) return 0;
                const diffTime = today - dueDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays;
            };

            const processInvoices = (invoices, userType) => {
                return invoices.map(invoice => {
                    const daysOverdue = getDaysOverdue(invoice.dueDate);
                    let penalty = 0;
                    const status = daysOverdue > 0 ? "EN MORA" : "PENDIENTE";
                    
                    if (daysOverdue > 0) {
                        const dailyRate = userType === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                        penalty = invoice.amount * dailyRate * daysOverdue; 
                    }
                    const totalAmount = invoice.amount + penalty; // Suma base + penalidad calculada
                    
                    return { ...invoice, totalAmount, status, isOverdue: daysOverdue > 0, penalty, daysOverdue };
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
                processedInvoices = []; 
                invoiceOptionsList.innerHTML = ''; 
                paymentSummaryContainer.classList.add('hidden'); 
                selectAllCheckbox.checked = false; 

                if (enteredId === '') {
                    idError.textContent = 'Por favor, ingresa un número de identificación.';
                    idError.style.display = 'block';
                    currentUser = null;
                } else if (userData[enteredId]) {
                    idError.style.display = 'none';
                    currentUser = userData[enteredId];
                    processedInvoices = processInvoices(currentUser.invoices, currentUser.type); 
                    
                    greetingElement.textContent = `Hola ${currentUser.name},`;

                    if (processedInvoices.length > 0) {
                        invoiceSelectorContainer.style.display = 'block'; 
                        document.querySelector('.select-all-container').style.display = processedInvoices.length > 1 ? 'flex' : 'none';

                        processedInvoices.forEach((invoice, index) => {
                            const optionDiv = document.createElement('div');
                            optionDiv.className = 'invoice-option';
                            optionDiv.innerHTML = `
                                <input type="checkbox" id="invoice-${index}" name="invoice-selection" value="${index}" data-amount="${invoice.amount}" data-penalty="${invoice.penalty}" data-total="${invoice.totalAmount}" data-is-overdue="${invoice.isOverdue}">
                                <label for="invoice-${index}">
                                    <span class="invoice-details-summary">
                                        Factura ${invoice.id} - ${invoice.concept} 
                                        (<span class="status-${invoice.status.toLowerCase().replace(' ', '-')}">${invoice.status}</span> ${invoice.isOverdue ? ` - ${invoice.daysOverdue} días` : ''})
                                    </span>
                                    <span class="invoice-amount">${formatCurrency(invoice.totalAmount)} ${invoice.isOverdue ? '<i class="mdi mdi-alert-circle" style="color:var(--error-color); font-size: 1.1em;" title="Incluye mora"></i>' : ''}</span>
                                </label>
                            `;
                            invoiceOptionsList.appendChild(optionDiv);
                        });
                        invoiceOptionsList.removeEventListener('change', updatePaymentSummary); // Limpiar listener
                        invoiceOptionsList.addEventListener('change', updatePaymentSummary);
                        selectAllCheckbox.removeEventListener('change', handleSelectAll); // Limpiar listener
                        selectAllCheckbox.addEventListener('change', handleSelectAll);
                    } else {
                        invoiceSelectorContainer.style.display = 'block';
                        document.querySelector('.select-all-container').style.display = 'none';
                        invoiceOptionsList.innerHTML = '<p>No tienes facturas pendientes de pago.</p>';
                    }
                    showStep(step2);

                } else {
                    idError.textContent = 'Numero de identificación invalido'; 
                    idError.style.display = 'block';
                    currentUser = null;
                }
            });

            function handleSelectAll() {
                const isChecked = selectAllCheckbox.checked;
                const invoiceCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]');
                invoiceCheckboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                    checkbox.closest('.invoice-option').classList.toggle('selected', isChecked);
                });
                updatePaymentSummary(); 
            }

            function updatePaymentSummary() {
                const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]:checked');
                let subtotalBase = 0;
                let totalPenalty = 0;
                let totalSelectedAmount = 0;
                let selectedCount = 0;
                let hasOverdueSelected = false;

                invoiceOptionsList.querySelectorAll('.invoice-option').forEach(opt => {
                     const checkbox = opt.querySelector('input[type="checkbox"]');
                     opt.classList.toggle('selected', checkbox.checked);
                });

                selectedCheckboxes.forEach(checkbox => {
                    subtotalBase += parseFloat(checkbox.dataset.amount);
                    totalPenalty += parseFloat(checkbox.dataset.penalty);
                    totalSelectedAmount += parseFloat(checkbox.dataset.total);
                    selectedCount++;
                    if (checkbox.dataset.isOverdue === 'true') {
                        hasOverdueSelected = true;
                    }
                });

                if (selectedCount > 0) {
                    selectedBaseAmountEl.textContent = formatCurrency(subtotalBase);
                    selectedPenaltyAmountEl.textContent = formatCurrency(totalPenalty);
                    selectedTotalAmountEl.textContent = formatCurrency(totalSelectedAmount);
                    selectedInvoicesCountEl.textContent = selectedCount;
                    totalSelectedAmountLabelEl.textContent = formatCurrency(totalSelectedAmount);

                    // Mostrar/ocultar detalles de mora
                    if (hasOverdueSelected) {
                        const rate = currentUser.type === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                        interestRateDetailsEl.textContent = formatPercentage(rate);
                        penaltyDetailsSummaryItems.forEach(el => el.classList.remove('hidden'));
                    } else {
                        penaltyDetailsSummaryItems.forEach(el => el.classList.add('hidden'));
                    }
                    
                    paymentSummaryContainer.classList.remove('hidden');

                     const allCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]');
                     selectAllCheckbox.checked = selectedCount === allCheckboxes.length && allCheckboxes.length > 0;

                } else {
                    paymentSummaryContainer.classList.add('hidden'); 
                    selectAllCheckbox.checked = false; 
                }
                
                document.getElementById('pago-total-seleccionado').checked = true;
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
                    const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]:checked');
                    if (selectedCheckboxes.length === 0 || !currentUser) {
                        alert("Por favor, selecciona al menos una factura para pagar.");
                        return;
                    }

                    const method = this.dataset.method;
                    let totalToPay = 0;
                    let selectedInvoiceIds = [];
                    
                    selectedCheckboxes.forEach(checkbox => {
                         const index = parseInt(checkbox.value);
                         const invoice = processedInvoices[index];
                         totalToPay += invoice.totalAmount;
                         selectedInvoiceIds.push(`${invoice.id}${invoice.isOverdue ? ' (Mora)' : ''}`); // Añadir (Mora) al ID en el recibo
                    });

                    let amountValue = totalToPay; 

                    if (document.getElementById('pago-parcial').checked && partialAmountInput.value) {
                        amountValue = parseFloat(partialAmountInput.value.replace(/[^0-9]/g, '')) || 0;
                        if (amountValue > totalToPay || amountValue <= 0) {
                            alert(`El valor ingresado (${amountValue > 0 ? formatCurrency(amountValue) : '0'}) debe ser mayor a cero y no puede ser mayor al total seleccionado (${formatCurrency(totalToPay)}).`);
                            return;
                        }
                    }
                    const amountPaidFormatted = `COP ${amountValue.toLocaleString('es-CO')}`;

                    showStep(step3);
                    
                    document.getElementById('receipt-invoices').textContent = selectedInvoiceIds.join(', '); 
                    document.getElementById('receipt-amount').textContent = amountPaidFormatted;
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
                processedInvoices = [];
                invoiceOptionsList.innerHTML = '';
                paymentSummaryContainer.classList.add('hidden');
                invoiceSelectorContainer.style.display = 'none';
                selectAllCheckbox.checked = false;
            });

            btnFinishPayment.addEventListener('click', () => {
                showStep(step1);
                docInput.value = '';
                currentUser = null;
                processedInvoices = [];
                invoiceOptionsList.innerHTML = '';
                paymentSummaryContainer.classList.add('hidden');
                invoiceSelectorContainer.style.display = 'none';
                selectAllCheckbox.checked = false;
            });
            
            showStep(step1);
        }
    });
})();
