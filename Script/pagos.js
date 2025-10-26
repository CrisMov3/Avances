(function() {
    document.addEventListener('DOMContentLoaded', () => {
        const paymentSection = document.getElementById('pagos-en-linea');
        if (paymentSection) {
            // --- Elementos UI ---
            const step1 = document.getElementById('payment-step-1');
            const step2 = document.getElementById('payment-step-2');
            const step3 = document.getElementById('payment-step-3');
            const step4_rejected = document.getElementById('payment-step-4-rejected');
            const btnNextStep1 = document.getElementById('btn-next-step-1');
            const docInput = document.getElementById('document-number');
            const idError = document.getElementById('id-error');
            const continuePaymentButton = document.getElementById('btn-continue-to-payment');
            const cancelPaymentLink = document.getElementById('cancel-payment');
            const btnFinishPayment = document.getElementById('btn-finish-payment');
            const btnRetryPayment = document.getElementById('btn-retry-payment');
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
            const penaltyDetailsSummaryItems = document.querySelectorAll('.penalty-details-summary');
            const interestRateDetailsEl = document.getElementById('interest-rate-details');
            const downloadInvoiceBtn = document.getElementById('download-invoice-btn');
            const downloadReceiptBtn = document.getElementById('download-receipt-btn');
            const lateFeeNotice = document.getElementById('late-fee-notice');
            const noPendingPaymentsContainer = document.getElementById('no-pending-payments-container');

            // --- Constantes y Datos ---
            const RATE_NATURAL = 0.075; // 7.5% diario
            const RATE_JURIDICA = 0.15; // 15% diario

            let currentUser = null;
            let processedInvoices = [];
            let currentReceiptData = {};
            let isProcessingPayment = false; // Flag para evitar doble click

            // --- Funciones Auxiliares ---
            const formatCurrency = (value) => `$ ${Math.round(value).toLocaleString('es-CO')}`;
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

            const formatLocaleDate = (dateString) => {
                 const date = new Date(dateString + "T00:00:00");
                 return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric'});
            };

            const addMonths = (dateStr, months) => {
                const date = new Date(dateStr + "T00:00:00");
                date.setMonth(date.getMonth() + months);
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            };

            // --- FUNCIÓN CORREGIDA ---
             const processInvoicesToInstallments = (invoices, userType) => {
                let allInstallments = [];
                const dailyRate = userType === 'natural' ? RATE_NATURAL : RATE_JURIDICA;

                for (const invoice of invoices) {
                    // Asegurarse de que paidInstallments sea un número entero.
                    // Si es null, undefined, o no se puede convertir, se asume 0.
                    const paidCount = parseInt(invoice.paidInstallments, 10) || 0;

                    // Validar que totalInstallments también sea un número
                    const totalCount = parseInt(invoice.totalInstallments, 10) || 1; // Default a 1 si no es válido

                    // Evitar división por cero o por un número inválido
                    if (totalCount <= 0) continue; // Saltar esta factura si el número total de cuotas no es válido

                    const installmentBaseAmount = invoice.amount / totalCount; // Usar totalCount

                    // Usar paidCount en lugar de invoice.paidInstallments directamente
                    for (let i = paidCount + 1; i <= totalCount; i++) { // Usar paidCount y totalCount
                        const installmentNum = i;
                        // Ajustar cálculo de fecha de vencimiento
                        const monthsToAdd = i - 1; // Siempre sumar i-1 meses a la fecha base de la factura
                        const installmentDueDate = addMonths(invoice.dueDate, monthsToAdd);

                        const daysOverdue = getDaysOverdue(installmentDueDate);
                        let penalty = 0;
                        const status = daysOverdue > 0 ? "EN MORA" : "PENDIENTE";

                        if (daysOverdue > 0) {
                            penalty = installmentBaseAmount * dailyRate * daysOverdue;
                        }
                        const totalAmount = installmentBaseAmount + penalty;

                        allInstallments.push({
                            invoiceId: invoice.id,
                            concept: invoice.concept,
                            installmentNum: installmentNum,
                            totalInstallments: totalCount, // Usar totalCount
                            baseAmount: installmentBaseAmount,
                            dueDate: installmentDueDate,
                            formattedDueDate: formatLocaleDate(installmentDueDate),
                            daysOverdue: daysOverdue,
                            penalty: penalty,
                            totalAmount: totalAmount,
                            status: status,
                            isOverdue: daysOverdue > 0,
                            uid: `${invoice.id}-${installmentNum}`
                        });
                    }
                }
                return allInstallments;
            };
            // --- FIN FUNCIÓN CORREGIDA ---

            const showStep = (stepToShow) => {
                [step1, step2, step3, step4_rejected].forEach(step => {
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
                } else if (stepToShow === step3 || stepToShow === step4_rejected) {
                    stepIndicators.forEach(indicator => indicator.classList.add('active'));
                }
            };

            const checkWompiResponse = () => {
                const urlParams = new URLSearchParams(window.location.search);

                if (urlParams.get('wompi_return') === 'true') {
                    const wompiId = urlParams.get('id');
                    const wompiStatus = urlParams.get('status');
                    localStorage.setItem('wompiResult', JSON.stringify({ id: wompiId, status: wompiStatus }));
                    window.close();
                    return;
                }

                showStep(step1);
                sessionStorage.removeItem('wompiPaymentIntent');
            };

            function handleStorageChange(event) {
                if (event.key === 'wompiResult' && event.newValue) {
                    window.removeEventListener('storage', handleStorageChange);
                    const result = JSON.parse(event.newValue);
                    localStorage.removeItem('wompiResult');
                    processWompiVerification(result.id, result.status);
                }
            }

            function processWompiVerification(wompiId, wompiStatus) {
                const intent = JSON.parse(sessionStorage.getItem('wompiPaymentIntent'));

                if (intent && intent.currentUserData) {
                    currentUser = intent.currentUserData;
                }

                if (!intent) {
                    idError.textContent = `Referencia de pago no encontrada. Si tu pago fue exitoso, contacta a soporte.`;
                    idError.style.display = 'block';
                    showStep(step1);
                    isProcessingPayment = false;
                    return;
                }

                showStep(step3);
                document.getElementById('receipt-invoices').textContent = 'Confirmando pago...';
                document.getElementById('receipt-amount').textContent = '...';
                document.getElementById('receipt-method').textContent = '...';
                document.getElementById('receipt-date').textContent = '...';
                document.getElementById('receipt-ref').textContent = intent.paymentData.reference;
                downloadReceiptBtn.classList.add('hidden');
                btnFinishPayment.style.display = 'none';

                if (wompiId) {
                    intent.paymentData.wompiId = wompiId;
                }

                fetch('api/registrar_pago.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(intent.paymentData)
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        currentReceiptData = intent.receiptData;
                        document.getElementById('receipt-invoices').textContent = currentReceiptData.invoicesText;
                        document.getElementById('receipt-amount').textContent = currentReceiptData.amount;
                        document.getElementById('receipt-method').textContent = currentReceiptData.method;
                        document.getElementById('receipt-date').textContent = currentReceiptData.date;
                        document.getElementById('receipt-ref').textContent = currentReceiptData.reference;
                        downloadReceiptBtn.classList.remove('hidden');
                        btnFinishPayment.style.display = 'block';
                        setTimeout(() => { step3.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
                    } else {
                        document.getElementById('rejected-ref').textContent = intent.paymentData.reference;
                        document.getElementById('rejected-status').textContent = data.wompi_status || wompiStatus || 'RECHAZADO';
                        document.getElementById('rejected-message').textContent = data.message || 'Error en la transacción o pago cancelado.';
                        showStep(step4_rejected);
                        setTimeout(() => { step4_rejected.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
                    }
                })
                .catch(error => {
                    console.error('Error en el fetch de registro:', error);
                    document.getElementById('rejected-ref').textContent = intent.paymentData.reference;
                    document.getElementById('rejected-status').textContent = 'ERROR DE CONEXIÓN';
                    document.getElementById('rejected-message').textContent = 'Hubo un problema al verificar tu pago. Por favor, contacta a soporte.';
                    showStep(step4_rejected);
                })
                .finally(() => {
                    sessionStorage.removeItem('wompiPaymentIntent');
                    isProcessingPayment = false;
                    continuePaymentButton.disabled = false;
                    continuePaymentButton.innerHTML = '<i class="mdi mdi-credit-card-scan-outline"></i> Continuar con tu pago';
                });
            }

            btnNextStep1.addEventListener('click', () => {
                const enteredValue = docInput.value.trim().toUpperCase();
                processedInvoices = [];
                invoiceOptionsList.innerHTML = '';
                paymentSummaryContainer.classList.add('hidden');
                selectAllCheckbox.checked = false;
                currentUser = null;
                noPendingPaymentsContainer.classList.add('hidden');

                if (enteredValue === '') {
                    idError.textContent = 'Por favor, ingresa un número de identificación o referencia.';
                    idError.style.display = 'block';
                    return;
                }

                btnNextStep1.disabled = true;
                btnNextStep1.innerHTML = 'Buscando... <i class="mdi mdi-loading mdi-spin"></i>';

                fetch(`api/buscar_cliente.php?id=${encodeURIComponent(enteredValue)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Error de red o servidor no encontrado.');
                        }
                        return response.json();
                    })
                    .then(data => {
                        if (data.success) {
                            idError.style.display = 'none';
                            currentUser = data.user;
                            processedInvoices = processInvoicesToInstallments(currentUser.invoices, currentUser.type);

                            greetingElement.textContent = `Hola ${currentUser.name},`;
                            const showLateFeeNotice = processedInvoices.some(inst => inst.isOverdue);
                            lateFeeNotice.style.display = showLateFeeNotice ? 'flex' : 'none';

                            if (processedInvoices.length > 0) {
                                invoiceSelectorContainer.style.display = 'block';
                                noPendingPaymentsContainer.classList.add('hidden');
                                const invoicesGrouped = processedInvoices.reduce((acc, installment) => {
                                    (acc[installment.invoiceId] = acc[installment.invoiceId] || []).push(installment);
                                    return acc;
                                }, {});

                                document.querySelector('.select-all-container').style.display = processedInvoices.length > 1 ? 'flex' : 'none';

                                Object.keys(invoicesGrouped).forEach(invoiceId => {
                                    const installments = invoicesGrouped[invoiceId];
                                    const firstInstallment = installments[0];
                                    const hasOverdue = installments.some(inst => inst.isOverdue);
                                    let statusText = '';
                                    if (firstInstallment.totalInstallments > 1) {
                                        const pendingCount = installments.length;
                                        const overdueText = hasOverdue ? ' - 1 o más vencidas' : '';
                                        const cuotaString = pendingCount === 1 ? 'cuota pendiente' : 'cuotas pendientes';
                                        statusText = `<span class="invoice-group-status ${hasOverdue ? 'en-mora' : ''}">(${pendingCount} ${cuotaString}${overdueText})</span>`;
                                    }
                                    const groupContainer = document.createElement('div');
                                    groupContainer.className = 'invoice-group';
                                    groupContainer.innerHTML = `
                                        <div class="invoice-group-header" data-target="#installments-${invoiceId}">
                                            <span>Factura ${invoiceId} - ${firstInstallment.concept}</span>
                                            ${statusText}
                                            <i class="mdi mdi-chevron-down"></i>
                                        </div>
                                        <div class="installment-list" id="installments-${invoiceId}">
                                            ${installments.map(installment => `
                                                <div class="invoice-option">
                                                    <input type="checkbox" id="inst-${installment.uid}" name="installment-selection" value="${installment.uid}"
                                                           data-base-amount="${installment.baseAmount}" data-penalty="${installment.penalty}" data-total="${installment.totalAmount}" data-is-overdue="${installment.isOverdue}">
                                                    <label for="inst-${installment.uid}">
                                                        <span class="invoice-details-summary">
                                                            Cuota ${installment.installmentNum} de ${installment.totalInstallments} (<span class="status-${installment.status.toLowerCase().replace(' ', '-')}">${installment.status}</span>)
                                                            <br><span class="invoice-installment-info">Vence: ${installment.formattedDueDate} ${installment.isOverdue ? `(${installment.daysOverdue} días)` : ''}</span>
                                                        </span>
                                                        <span class="invoice-amount">${formatCurrency(installment.totalAmount)} ${installment.isOverdue ? '<i class="mdi mdi-alert-circle" style="color:var(--error-color); font-size: 1.1em;" title="Incluye mora"></i>' : ''}</span>
                                                    </label>
                                                </div>`).join('')}
                                        </div>`;
                                    invoiceOptionsList.appendChild(groupContainer);
                                });

                                invoiceOptionsList.querySelectorAll('.invoice-group-header').forEach(header => {
                                    header.addEventListener('click', () => {
                                        const targetId = header.dataset.target;
                                        const targetList = document.querySelector(targetId);
                                        header.classList.toggle('open');
                                        targetList.classList.toggle('open');
                                    });
                                });

                                if (currentUser.invoices.length === 1) {
                                    const firstHeader = invoiceOptionsList.querySelector('.invoice-group-header');
                                    if (firstHeader) firstHeader.click();
                                    if (processedInvoices.length === 1) {
                                        const checkboxToSelect = invoiceOptionsList.querySelector('input[name="installment-selection"]');
                                        if (checkboxToSelect) {
                                            checkboxToSelect.checked = true;
                                            checkboxToSelect.closest('.invoice-option').classList.add('selected');
                                            updatePaymentSummary();
                                        }
                                    }
                                }

                                invoiceOptionsList.removeEventListener('change', updatePaymentSummary);
                                invoiceOptionsList.addEventListener('change', updatePaymentSummary);
                                selectAllCheckbox.removeEventListener('change', handleSelectAll);
                                selectAllCheckbox.addEventListener('change', handleSelectAll);
                            } else {
                                invoiceSelectorContainer.style.display = 'none';
                                document.querySelector('.select-all-container').style.display = 'none';
                                noPendingPaymentsContainer.classList.remove('hidden');
                            }
                            showStep(step2);
                        } else {
                            idError.textContent = data.message || 'Número de identificación o referencia inválido';
                            idError.style.display = 'block';
                        }
                    })
                    .catch(error => {
                        console.error('Error al buscar datos:', error);
                        idError.textContent = 'Error al conectar con el servidor. Asegúrate de que XAMPP esté corriendo y la URL sea correcta.';
                        idError.style.display = 'block';
                    })
                    .finally(() => {
                        btnNextStep1.disabled = false;
                        btnNextStep1.innerHTML = 'Siguiente <i class="mdi mdi-check"></i>';
                    });
            });

            function handleSelectAll() {
                const isChecked = selectAllCheckbox.checked;
                const installmentCheckboxes = invoiceOptionsList.querySelectorAll('input[name="installment-selection"]');
                installmentCheckboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                    checkbox.closest('.invoice-option').classList.toggle('selected', isChecked);
                });
                updatePaymentSummary();
            }

            function updatePaymentSummary() {
                const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="installment-selection"]:checked');
                let subtotalBase = 0, totalPenalty = 0, totalSelectedAmount = 0, selectedCount = 0, hasOverdueSelected = false;

                invoiceOptionsList.querySelectorAll('.invoice-option').forEach(opt => {
                     const checkbox = opt.querySelector('input[type="checkbox"]');
                     opt.classList.toggle('selected', checkbox.checked);
                });

                selectedCheckboxes.forEach(checkbox => {
                    subtotalBase += parseFloat(checkbox.dataset.baseAmount);
                    totalPenalty += parseFloat(checkbox.dataset.penalty);
                    totalSelectedAmount += parseFloat(checkbox.dataset.total);
                    selectedCount++;
                    if (checkbox.dataset.isOverdue === 'true') hasOverdueSelected = true;
                });

                if (selectedCount > 0) {
                    selectedBaseAmountEl.textContent = formatCurrency(subtotalBase);
                    selectedPenaltyAmountEl.textContent = formatCurrency(totalPenalty);
                    selectedTotalAmountEl.textContent = formatCurrency(totalSelectedAmount);
                    selectedInvoicesCountEl.textContent = selectedCount;
                    totalSelectedAmountLabelEl.textContent = formatCurrency(totalSelectedAmount);
                    if (hasOverdueSelected && currentUser) {
                        const rate = currentUser.type === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                        interestRateDetailsEl.textContent = formatPercentage(rate);
                        penaltyDetailsSummaryItems.forEach(el => el.classList.remove('hidden'));
                    } else {
                        penaltyDetailsSummaryItems.forEach(el => el.classList.add('hidden'));
                    }
                    paymentSummaryContainer.classList.remove('hidden');
                    downloadInvoiceBtn.classList.remove('hidden');
                    const allCheckboxes = invoiceOptionsList.querySelectorAll('input[name="installment-selection"]');
                    if (allCheckboxes.length > 1) selectAllCheckbox.checked = selectedCount === allCheckboxes.length;
                } else {
                    paymentSummaryContainer.classList.add('hidden');
                    downloadInvoiceBtn.classList.add('hidden');
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

            continuePaymentButton.addEventListener('click', function() {
                if (isProcessingPayment) return;
                const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="installment-selection"]:checked');
                if (selectedCheckboxes.length === 0 || !currentUser) {
                    alert("Por favor, selecciona al menos una cuota para pagar.");
                    return;
                }
                isProcessingPayment = true;
                let totalToPay = 0, selectedInstallmentDetails = [], selectedInstallmentUIDs = [];
                selectedCheckboxes.forEach(checkbox => {
                     const installment = processedInvoices.find(inst => inst.uid === checkbox.value);
                     if (installment) {
                         totalToPay += installment.totalAmount;
                         selectedInstallmentUIDs.push(installment.uid);
                         const installmentText = `(Cuota ${installment.installmentNum}/${installment.totalInstallments})`;
                         selectedInstallmentDetails.push(`${installment.invoiceId} ${installmentText}${installment.isOverdue ? ' (Mora)' : ''}`);
                     }
                 });
                let amountValue = totalToPay;
                if (document.getElementById('pago-parcial').checked && partialAmountInput.value) {
                    amountValue = parseFloat(partialAmountInput.value.replace(/[^0-9]/g, '')) || 0;
                    if (amountValue > totalToPay || amountValue <= 0) {
                        alert(`El valor ingresado (${amountValue > 0 ? formatCurrency(amountValue) : '0'}) debe ser mayor a cero y no puede ser mayor al total seleccionado (${formatCurrency(totalToPay)}).`);
                        isProcessingPayment = false;
                        return;
                    }
                }
                const amountPaidFormatted = `COP ${amountValue.toLocaleString('es-CO')}`;
                const paymentDate = new Date();
                const reference = `SB-PAY-${currentUser.identificacion}-${Date.now()}`;
                const paymentData = { identificacion: currentUser.identificacion, uids_cuotas: selectedInstallmentUIDs, amountPaid: amountValue, method: 'Wompi', reference: reference, invoicesText: selectedInstallmentDetails.join(', ') };
                const receiptData = { invoicesText: selectedInstallmentDetails.join(', '), amount: amountPaidFormatted, method: 'Wompi', date: paymentDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric'}), reference: reference };
                sessionStorage.setItem('wompiPaymentIntent', JSON.stringify({paymentData, receiptData, currentUserData: currentUser}));
                const wompiLinkData = { amount: amountValue, reference: reference, customerName: currentUser.name, description: `Pago Cuota(s): ${selectedInstallmentDetails.join(', ')}`, redirectUrl: window.location.href.split('?')[0] };
                continuePaymentButton.disabled = true;
                continuePaymentButton.innerHTML = '<i class="mdi mdi-loading mdi-spin"></i> Conectando...';
                localStorage.removeItem('wompiResult');
                window.addEventListener('storage', handleStorageChange);
                fetch('api/crear_link_wompi.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(wompiLinkData) })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.linkId) {
                        window.open(`https://checkout.wompi.co/l/${data.linkId}`, '_blank');
                        continuePaymentButton.disabled = false;
                        continuePaymentButton.innerHTML = '<i class="mdi mdi-credit-card-scan-outline"></i> Continuar con tu pago';
                    } else {
                        alert(`Error al crear el link de pago: ${data.message || 'Error desconocido'}`);
                        continuePaymentButton.disabled = false;
                        continuePaymentButton.innerHTML = '<i class="mdi mdi-credit-card-scan-outline"></i> Continuar con tu pago';
                        isProcessingPayment = false;
                        window.removeEventListener('storage', handleStorageChange);
                    }
                })
                .catch(error => {
                    console.error('Error en el fetch de crear link:', error);
                    alert('Error de conexión al iniciar el pago. Inténtalo de nuevo.');
                    continuePaymentButton.disabled = false;
                    continuePaymentButton.innerHTML = '<i class="mdi mdi-credit-card-scan-outline"></i> Continuar con tu pago';
                    isProcessingPayment = false;
                    window.removeEventListener('storage', handleStorageChange);
                });
            });

            const resetPaymentFlow = () => {
                showStep(step1);
                docInput.value = '';
                currentUser = null;
                processedInvoices = [];
                invoiceOptionsList.innerHTML = '';
                paymentSummaryContainer.classList.add('hidden');
                invoiceSelectorContainer.style.display = 'none';
                selectAllCheckbox.checked = false;
                downloadInvoiceBtn.classList.add('hidden');
                noPendingPaymentsContainer.classList.add('hidden');
                currentReceiptData = {};
                isProcessingPayment = false;
                sessionStorage.removeItem('wompiPaymentIntent');
                localStorage.removeItem('wompiResult');
                window.removeEventListener('storage', handleStorageChange);
            };

            cancelPaymentLink.addEventListener('click', (e) => { e.preventDefault(); resetPaymentFlow(); });
            btnFinishPayment.addEventListener('click', () => { resetPaymentFlow(); setTimeout(() => { step1.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); });
            btnRetryPayment.addEventListener('click', () => { resetPaymentFlow(); setTimeout(() => { step1.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 50); });

            if (downloadInvoiceBtn) downloadInvoiceBtn.addEventListener('click', generateInvoicePDF);
            if (downloadReceiptBtn) downloadReceiptBtn.addEventListener('click', generateReceiptPDF);

            function generateInvoicePDF() {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const logoImg = document.getElementById('logo-for-pdf');
                const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="installment-selection"]:checked');
                if (selectedCheckboxes.length === 0) { alert("Por favor, selecciona al menos una cuota para descargar."); return; }
                if (!currentUser) return;
                let tableBody = [], subtotalBase = 0, totalPenalty = 0, grandTotal = 0, hasOverdue = false;
                selectedCheckboxes.forEach(checkbox => {
                    const installment = processedInvoices.find(inst => inst.uid === checkbox.value);
                    if (installment) {
                        const installmentText = installment.totalInstallments > 1 ? ` (Cuota ${installment.installmentNum}/${installment.totalInstallments})` : '';
                        tableBody.push([installment.invoiceId, installment.concept + installmentText, installment.formattedDueDate, formatCurrency(installment.baseAmount), installment.isOverdue ? `${installment.daysOverdue} días` : 'N/A', installment.isOverdue ? formatCurrency(installment.penalty) : '$ 0', formatCurrency(installment.totalAmount)]);
                        subtotalBase += installment.baseAmount; totalPenalty += installment.penalty; grandTotal += installment.totalAmount; if (installment.isOverdue) hasOverdue = true;
                    }
                });
                try { doc.addImage(logoImg, 'PNG', 15, 10, 50, 15); } catch (e) { console.error("Error logo PDF:", e); doc.setFontSize(10); doc.text("Strokbig S.A.S", 15, 20); }
                doc.setFontSize(18); doc.text("Resumen de Cuotas", 105, 20, null, null, 'center');
                doc.setFontSize(10); doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 195, 25, null, null, 'right');
                doc.setFontSize(12); doc.text("Datos del Cliente:", 15, 40);
                doc.setFontSize(10); doc.text(`Nombre: ${currentUser.name}`, 15, 46); doc.text(`Identificación: ${currentUser.identificacion}`, 15, 52); doc.text(`Tipo: ${currentUser.type === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}`, 15, 58);
                doc.autoTable({ startY: 65, head: [['Factura ID', 'Concepto / Cuota', 'Vencimiento', 'Valor Base', 'Días Mora', 'Valor Mora', 'Total Cuota']], body: tableBody, theme: 'grid', headStyles: { fillColor: [4, 42, 99] }, styles: { fontSize: 8 }, columnStyles: { 3: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right', fontStyle: 'bold' } } });
                let finalY = doc.lastAutoTable.finalY + 10;
                doc.setFontSize(10); doc.text("Resumen Total:", 15, finalY); doc.text(`Subtotal Base: ${formatCurrency(subtotalBase)}`, 195, finalY, null, null, 'right'); finalY += 6;
                if (hasOverdue) { const rate = currentUser.type === 'natural' ? RATE_NATURAL : RATE_JURIDICA; doc.setTextColor(190, 0, 0); doc.text(`Tasa Interés (Diaria): ${formatPercentage(rate)}`, 15, finalY); doc.text(`Total Mora: ${formatCurrency(totalPenalty)}`, 195, finalY, null, null, 'right'); doc.setTextColor(0); finalY += 6; }
                doc.setFontSize(12); doc.setFont(undefined, 'bold'); doc.text(`Total Seleccionado: ${formatCurrency(grandTotal)}`, 195, finalY, null, null, 'right'); doc.setFont(undefined, 'normal');
                doc.save(`Detalle_Pago_Strokbig_${currentUser.name.replace(' ', '_')}_${Date.now()}.pdf`);
            }

            function generateReceiptPDF() {
                 if (!currentReceiptData.reference || !currentUser) { alert("No hay información de pago reciente para generar el recibo."); return; }
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const logoImg = document.getElementById('logo-for-pdf');
                const margin = 15, lineHeight = 7, smallFontSize = 10, normalFontSize = 12, largeFontSize = 18, headerColor = [4, 42, 99];
                let currentY = 20;
                try { doc.addImage(logoImg, 'PNG', margin, currentY, 50, 15); } catch (e) { console.error("Error logo PDF:", e); doc.setFontSize(smallFontSize); doc.text("Strokbig S.A.S", margin, currentY + 5); }
                currentY += 10;
                doc.setFontSize(largeFontSize); doc.setFont(undefined, 'bold'); doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]); doc.text("Comprobante de Pago", 105, currentY, null, null, 'center'); doc.setFont(undefined, 'normal'); currentY += lineHeight * 2;
                doc.setFontSize(smallFontSize); doc.setTextColor(50, 50, 50); doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 195, margin + 5, null, null, 'right');
                doc.setDrawColor(headerColor[0], headerColor[1], headerColor[2]); doc.setLineWidth(0.5); doc.line(margin, currentY, 210 - margin, currentY); currentY += lineHeight;
                doc.setFontSize(normalFontSize); doc.setFont(undefined, 'bold'); doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]); doc.text("Pagado por:", margin, currentY); currentY += lineHeight;
                doc.setFontSize(smallFontSize); doc.setFont(undefined, 'normal'); doc.setTextColor(50, 50, 50); doc.text(`Nombre: ${currentUser.name}`, margin, currentY); currentY += lineHeight; doc.text(`Identificación: ${currentUser.identificacion}`, margin, currentY); currentY += lineHeight * 2;
                doc.setDrawColor(headerColor[0], headerColor[1], headerColor[2]); doc.line(margin, currentY, 210 - margin, currentY); currentY += lineHeight;
                doc.setFontSize(normalFontSize); doc.setFont(undefined, 'bold'); doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]); doc.text("Detalles de la Transacción:", margin, currentY); currentY += lineHeight;
                doc.setFontSize(smallFontSize); doc.setFont(undefined, 'normal'); doc.setTextColor(50, 50, 50);
                const details = [ { label: "Referencia de Pago:", value: currentReceiptData.reference || 'N/A' }, { label: "Fecha de Pago:", value: currentReceiptData.date || 'N/A' }, { label: "Método de Pago:", value: currentReceiptData.method || 'N/A' }, { label: "Factura(s)/Cuota(s) Pagada(s):", value: currentReceiptData.invoicesText || 'N/A' }];
                details.forEach(detail => { const label = detail.label, value = detail.value; doc.text(label, margin, currentY); const labelWidth = doc.getTextWidth(label) + 2; const valueX = Math.max(margin + labelWidth, 80); const finalAvailableWidth = 210 - margin - valueX; const wrappedText = doc.splitTextToSize(value, finalAvailableWidth); doc.text(wrappedText, valueX, currentY); currentY += (wrappedText.length * (lineHeight - 2)); currentY += lineHeight - 1; }); currentY += lineHeight;
                doc.setDrawColor(headerColor[0], headerColor[1], headerColor[2]); doc.line(margin, currentY, 210 - margin, currentY); currentY += lineHeight;
                doc.setFontSize(normalFontSize); doc.setFont(undefined, 'bold'); doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]); doc.text("Valor Pagado:", margin, currentY);
                doc.setFontSize(largeFontSize); doc.setTextColor(34, 139, 34); doc.text(currentReceiptData.amount || '$ 0', 210 - margin, currentY, null, null, 'right'); currentY += lineHeight * 2;
                doc.setFontSize(smallFontSize); doc.setFont(undefined, 'normal'); doc.setTextColor(50, 50, 50); doc.text("Gracias por su pago.", 105, currentY + 10, null, null, 'center');
                doc.save(`Recibo_Strokbig_${currentReceiptData.reference}.pdf`);
            }

            checkWompiResponse();
        }
    });
})();