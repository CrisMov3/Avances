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
            const penaltyDetailsSummaryItems = document.querySelectorAll('.penalty-details-summary');
            const interestRateDetailsEl = document.getElementById('interest-rate-details');
            const downloadInvoiceBtn = document.getElementById('download-invoice-btn');
            const downloadReceiptBtn = document.getElementById('download-receipt-btn');

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
            let currentReceiptData = {};

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

            const processInvoices = (invoices, userType) => {
                return invoices.map(invoice => {
                    const daysOverdue = getDaysOverdue(invoice.dueDate);
                    let penalty = 0;
                    const status = daysOverdue > 0 ? "EN MORA" : "PENDIENTE";
                    if (daysOverdue > 0) {
                        const dailyRate = userType === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                        penalty = invoice.amount * dailyRate * daysOverdue;
                    }
                    const totalAmount = invoice.amount + penalty;
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
                const enteredValue = docInput.value.trim().toUpperCase();
                processedInvoices = [];
                invoiceOptionsList.innerHTML = '';
                paymentSummaryContainer.classList.add('hidden');
                selectAllCheckbox.checked = false;
                currentUser = null;
                let foundInvoice = null;
                let foundUserKey = null;

                if (enteredValue === '') {
                    idError.textContent = 'Por favor, ingresa un número de identificación o referencia.';
                    idError.style.display = 'block';
                    return;
                }

                if (userData[enteredValue]) {
                    currentUser = userData[enteredValue];
                    processedInvoices = processInvoices(currentUser.invoices, currentUser.type);
                } else {
                    for (const userId in userData) {
                        const user = userData[userId];
                        const invoiceMatch = user.invoices.find(inv => inv.id.toUpperCase() === enteredValue);
                        if (invoiceMatch) {
                            foundInvoice = invoiceMatch;
                            currentUser = user;
                            foundUserKey = userId;
                            break;
                        }
                    }
                }

                if (currentUser) {
                    idError.style.display = 'none';
                    greetingElement.textContent = `Hola ${currentUser.name},`;

                    if (foundInvoice) {
                        processedInvoices = processInvoices([foundInvoice], currentUser.type);
                        invoiceSelectorContainer.style.display = 'none';
                        document.querySelector('.select-all-container').style.display = 'none';
                        updatePaymentSummaryForSingleInvoice(processedInvoices[0]);
                        paymentSummaryContainer.classList.remove('hidden');
                    } else if (processedInvoices.length > 0) {
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
                        invoiceOptionsList.removeEventListener('change', updatePaymentSummary);
                        invoiceOptionsList.addEventListener('change', updatePaymentSummary);
                        selectAllCheckbox.removeEventListener('change', handleSelectAll);
                        selectAllCheckbox.addEventListener('change', handleSelectAll);
                    } else {
                        invoiceSelectorContainer.style.display = 'block';
                        document.querySelector('.select-all-container').style.display = 'none';
                        invoiceOptionsList.innerHTML = '<p>No tienes facturas pendientes de pago.</p>';
                    }
                    showStep(step2);

                } else {
                    idError.textContent = 'Número de identificación o referencia inválido';
                    idError.style.display = 'block';
                }
            });

            function updatePaymentSummaryForSingleInvoice(invoice) {
                 selectedBaseAmountEl.textContent = formatCurrency(invoice.amount);
                 selectedPenaltyAmountEl.textContent = formatCurrency(invoice.penalty);
                 selectedTotalAmountEl.textContent = formatCurrency(invoice.totalAmount);
                 selectedInvoicesCountEl.textContent = 1;
                 totalSelectedAmountLabelEl.textContent = formatCurrency(invoice.totalAmount);

                 if (invoice.isOverdue && currentUser) {
                     const rate = currentUser.type === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                     interestRateDetailsEl.textContent = formatPercentage(rate);
                     penaltyDetailsSummaryItems.forEach(el => el.classList.remove('hidden'));
                 } else {
                     penaltyDetailsSummaryItems.forEach(el => el.classList.add('hidden'));
                 }
                 downloadInvoiceBtn.classList.remove('hidden');
                 document.getElementById('pago-total-seleccionado').checked = true;
                 partialAmountInput.disabled = true;
                 partialAmountInput.value = '';
            }


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

                    if (hasOverdueSelected && currentUser) {
                        const rate = currentUser.type === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                        interestRateDetailsEl.textContent = formatPercentage(rate);
                        penaltyDetailsSummaryItems.forEach(el => el.classList.remove('hidden'));
                    } else {
                        penaltyDetailsSummaryItems.forEach(el => el.classList.add('hidden'));
                    }

                    paymentSummaryContainer.classList.remove('hidden');
                    downloadInvoiceBtn.classList.remove('hidden');

                     const allCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]');
                     if (allCheckboxes.length > 1) {
                         selectAllCheckbox.checked = selectedCount === allCheckboxes.length;
                     }

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

            paymentButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]:checked');
                    const singleInvoiceSelected = processedInvoices.length === 1 && selectedCheckboxes.length === 0 && !paymentSummaryContainer.classList.contains('hidden');

                    if (selectedCheckboxes.length === 0 && !singleInvoiceSelected) {
                         alert("Por favor, selecciona al menos una factura para pagar.");
                         return;
                    }
                    if (!currentUser) return;

                    const method = this.dataset.method;
                    let totalToPay = 0;
                    let selectedInvoiceDetails = [];

                    if (singleInvoiceSelected) {
                        totalToPay = processedInvoices[0].totalAmount;
                        selectedInvoiceDetails.push({id: processedInvoices[0].id, concept: processedInvoices[0].concept, isOverdue: processedInvoices[0].isOverdue});
                    } else {
                         selectedCheckboxes.forEach(checkbox => {
                             const index = parseInt(checkbox.value);
                             const invoice = processedInvoices[index];
                             totalToPay += invoice.totalAmount;
                             selectedInvoiceDetails.push({id: invoice.id, concept: invoice.concept, isOverdue: invoice.isOverdue});
                         });
                    }

                    let amountValue = totalToPay;

                    if (document.getElementById('pago-parcial').checked && partialAmountInput.value) {
                        amountValue = parseFloat(partialAmountInput.value.replace(/[^0-9]/g, '')) || 0;
                        if (amountValue > totalToPay || amountValue <= 0) {
                            alert(`El valor ingresado (${amountValue > 0 ? formatCurrency(amountValue) : '0'}) debe ser mayor a cero y no puede ser mayor al total seleccionado (${formatCurrency(totalToPay)}).`);
                            return;
                        }
                    }
                    const amountPaidFormatted = `COP ${amountValue.toLocaleString('es-CO')}`;
                    const paymentDate = new Date();
                    const reference = `#${Math.floor(Math.random() * 9000000) + 1000000}`;

                    currentReceiptData = {
                        invoicesText: selectedInvoiceDetails.map(inv => `${inv.id}${inv.isOverdue ? ' (Mora)' : ''}`).join(', '),
                        amount: amountPaidFormatted,
                        method: method,
                        date: paymentDate.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric'}),
                        reference: reference
                    };

                    showStep(step3);

                    document.getElementById('receipt-invoices').textContent = currentReceiptData.invoicesText;
                    document.getElementById('receipt-amount').textContent = currentReceiptData.amount;
                    document.getElementById('receipt-method').textContent = currentReceiptData.method;
                    document.getElementById('receipt-date').textContent = currentReceiptData.date;
                    document.getElementById('receipt-ref').textContent = currentReceiptData.reference;

                    // Scroll al recibo
                    setTimeout(() => {
                        step3.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);

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
                downloadInvoiceBtn.classList.add('hidden');
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
                downloadInvoiceBtn.classList.add('hidden');
                currentReceiptData = {};
                
                // *** NUEVO: SCROLL AL INICIO ***
                setTimeout(() => {
                    step1.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 50); // Pequeño delay
            });

             // --- LÓGICA PARA DESCARGAR PDF DE FACTURA ---
            if (downloadInvoiceBtn) {
                downloadInvoiceBtn.addEventListener('click', generateInvoicePDF);
            }

            function generateInvoicePDF() {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const logoImg = document.getElementById('logo-for-pdf');

                const selectedCheckboxes = invoiceOptionsList.querySelectorAll('input[name="invoice-selection"]:checked');
                const singleInvoiceSelected = processedInvoices.length === 1 && selectedCheckboxes.length === 0 && !paymentSummaryContainer.classList.contains('hidden');

                if (selectedCheckboxes.length === 0 && !singleInvoiceSelected) {
                    alert("Por favor, selecciona al menos una factura para descargar.");
                    return;
                }
                 if (!currentUser) return;


                let tableBody = [];
                let subtotalBase = 0;
                let totalPenalty = 0;
                let grandTotal = 0;
                let hasOverdue = false;

                if(singleInvoiceSelected) {
                    const invoice = processedInvoices[0];
                     tableBody.push([
                        invoice.id, invoice.concept, invoice.dueDate,
                        formatCurrency(invoice.amount), invoice.isOverdue ? `${invoice.daysOverdue} días` : 'N/A',
                        invoice.isOverdue ? formatCurrency(invoice.penalty) : '$ 0', formatCurrency(invoice.totalAmount)
                    ]);
                    subtotalBase += invoice.amount; totalPenalty += invoice.penalty; grandTotal += invoice.totalAmount;
                    if(invoice.isOverdue) hasOverdue = true;
                } else {
                     selectedCheckboxes.forEach(checkbox => {
                        const index = parseInt(checkbox.value);
                        const invoice = processedInvoices[index];
                         tableBody.push([
                            invoice.id, invoice.concept, invoice.dueDate,
                            formatCurrency(invoice.amount), invoice.isOverdue ? `${invoice.daysOverdue} días` : 'N/A',
                            invoice.isOverdue ? formatCurrency(invoice.penalty) : '$ 0', formatCurrency(invoice.totalAmount)
                        ]);
                        subtotalBase += invoice.amount; totalPenalty += invoice.penalty; grandTotal += invoice.totalAmount;
                        if(invoice.isOverdue) hasOverdue = true;
                    });
                }


                 try {
                     doc.addImage(logoImg, 'PNG', 15, 10, 50, 15);
                 } catch (e) {
                     console.error("Error al añadir logo al PDF:", e);
                     doc.setFontSize(10);
                     doc.text("Strokbig S.A.S", 15, 20);
                 }

                doc.setFontSize(18);
                doc.text("Resumen de Factura(s)", 105, 20, null, null, 'center');
                doc.setFontSize(10);
                doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 195, 25, null, null, 'right');

                doc.setFontSize(12);
                doc.text("Datos del Cliente:", 15, 40);
                doc.setFontSize(10);
                doc.text(`Nombre: ${currentUser.name}`, 15, 46);
                doc.text(`Identificación: ${docInput.value.trim()}`, 15, 52);
                doc.text(`Tipo: ${currentUser.type === 'natural' ? 'Persona Natural' : 'Persona Jurídica'}`, 15, 58);

                doc.autoTable({
                    startY: 65,
                    head: [['Factura ID', 'Concepto', 'Vencimiento', 'Valor Base', 'Días Mora', 'Valor Mora', 'Total']],
                    body: tableBody,
                    theme: 'grid',
                    headStyles: { fillColor: [4, 42, 99] },
                    styles: { fontSize: 8 },
                    columnStyles: {
                       3: { halign: 'right' },
                       5: { halign: 'right' },
                       6: { halign: 'right', fontStyle: 'bold' }
                    }
                });

                let finalY = doc.lastAutoTable.finalY + 10;
                doc.setFontSize(10);
                doc.text("Resumen:", 15, finalY);
                doc.text(`Subtotal Base: ${formatCurrency(subtotalBase)}`, 195, finalY, null, null, 'right');
                finalY += 6;
                if (hasOverdue) {
                     const rate = currentUser.type === 'natural' ? RATE_NATURAL : RATE_JURIDICA;
                     doc.setTextColor(190, 0, 0);
                     doc.text(`Tasa Interés (Diaria): ${formatPercentage(rate)}`, 15, finalY);
                     doc.text(`Total Mora: ${formatCurrency(totalPenalty)}`, 195, finalY, null, null, 'right');
                     doc.setTextColor(0);
                     finalY += 6;
                }
                doc.setFontSize(12);
                doc.setFont(undefined, 'bold');
                doc.text(`Total a Pagar: ${formatCurrency(grandTotal)}`, 195, finalY, null, null, 'right');
                doc.setFont(undefined, 'normal');

                doc.save(`Factura_Strokbig_${currentUser.name.replace(' ', '_')}_${Date.now()}.pdf`);
            }

            // --- LÓGICA PARA DESCARGAR PDF DE RECIBO ---
            if (downloadReceiptBtn) {
                downloadReceiptBtn.addEventListener('click', generateReceiptPDF);
            }

            function generateReceiptPDF() {
                 if (!currentReceiptData.reference || !currentUser) {
                     alert("No hay información de pago reciente para generar el recibo.");
                     return;
                 }

                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                const logoImg = document.getElementById('logo-for-pdf');

                 try {
                     doc.addImage(logoImg, 'PNG', 15, 10, 50, 15);
                 } catch (e) {
                     console.error("Error al añadir logo al PDF:", e);
                     doc.setFontSize(10);
                     doc.text("Strokbig S.A.S", 15, 20);
                 }

                doc.setFontSize(18);
                doc.text("Comprobante de Pago", 105, 20, null, null, 'center');
                doc.setFontSize(10);
                doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-CO')}`, 195, 25, null, null, 'right');

                doc.setFontSize(12);
                doc.text("Pagado por:", 15, 40);
                doc.setFontSize(10);
                doc.text(`Nombre: ${currentUser.name}`, 15, 46);
                doc.text(`Identificación: ${docInput.value.trim()}`, 15, 52);

                doc.setFontSize(12);
                doc.text("Detalles de la Transacción:", 15, 65);
                doc.setFontSize(10);
                let currentY = 71;
                const addDetail = (label, value) => {
                    doc.text(`${label}:`, 15, currentY);
                    doc.text(value, 80, currentY, { maxWidth: 110 });
                    const lines = doc.splitTextToSize(value, 110);
                    currentY += (lines.length * 4) + 2;
                };

                addDetail("Referencia de Pago", currentReceiptData.reference || 'N/A');
                addDetail("Fecha de Pago", currentReceiptData.date || 'N/A');
                addDetail("Método de Pago", currentReceiptData.method || 'N/A');
                addDetail("Valor Pagado", currentReceiptData.amount || '$ 0');
                addDetail("Factura(s) Pagada(s)", currentReceiptData.invoicesText || 'N/A');

                doc.setFontSize(10);
                doc.text("Gracias por su pago.", 105, currentY + 10, null, null, 'center');

                doc.save(`Recibo_Strokbig_${currentReceiptData.reference}.pdf`);
            }

            showStep(step1);
        }
    });
})();
