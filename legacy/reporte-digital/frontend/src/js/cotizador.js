/**
 * COTIZADOR AUTOMATIZADO COMPLETO - MICSA
 * Sistema de cotización multi-paso con catálogos integrados
 */

// ============================================
// STATE MANAGEMENT
// ============================================
let currentStep = 1;
const totalSteps = 6;

// Selected items storage
const quoteData = {
    selectedEPP: [],
    selectedEquipment: [],
    selectedMaterials: [],
    equipmentQuantities: {},
    materialQuantities: {}
};

// Constantes de cálculo
const CONSTANTS = {
    WEEKS_PER_MONTH: 4.33,
    COSTS: {
        WEEKLY_LABOR: 6489.25,
        MONTHLY_IMSS: 1489.25,
        DAILY_VIATICO: 166.60,
        HOTEL_NIGHT: 1200.00,
        TRANSPORT_REMOTE: 6342.00,
        OVERTIME_RATE: 378.00,
        MEDICAL_CHECK: 500.00,
        DC3_TRAINING: 250.00
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeWizard();
    renderEPPCatalog();
    renderEquipmentCatalog();
    renderMaterialsCatalog();
    setCurrentDate();
    calculateSummary();
});

function initializeWizard() {
    // Auto-select mandatory EPP
    const mandatoryEPP = getMandatoryEPP();
    quoteData.selectedEPP = mandatoryEPP.map(item => item.id);
}

function setCurrentDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quoteDate').value = today;
}

// ============================================
// WIZARD NAVIGATION
// ============================================
function nextStep() {
    if (currentStep < totalSteps) {
        // Validate current step
        if (!validateStep(currentStep)) {
            return;
        }

        // Hide current step
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('completed');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show next step
        currentStep++;
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.add('active');

        // Update summary if on final step
        if (currentStep === 6) {
            updateFinalSummary();
        }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function previousStep() {
    if (currentStep > 1) {
        // Hide current step
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('active');

        // Show previous step
        currentStep--;
        document.querySelector(`.wizard-step[data-step="${currentStep}"]`).classList.add('active');
        document.querySelector(`.progress-step[data-step="${currentStep}"]`).classList.remove('completed');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function validateStep(step) {
    switch (step) {
        case 1:
            const projectName = document.getElementById('projectName').value.trim();
            const clientName = document.getElementById('clientName').value.trim();
            if (!projectName || !clientName) {
                alert('Por favor completa los campos obligatorios (Proyecto y Cliente)');
                return false;
            }
            break;
        case 2:
            const personnel = parseFloat(document.getElementById('personnel').value);
            const months = parseFloat(document.getElementById('months').value);
            if (!personnel || personnel < 1 || !months || months < 0.1) {
                alert('Por favor ingresa valores válidos para Personal y Duración');
                return false;
            }
            break;
    }
    return true;
}

// ============================================
// CATALOG RENDERING
// ============================================
function renderEPPCatalog() {
    const container = document.getElementById('eppCatalog');
    container.innerHTML = '';

    EPP_CATALOG.forEach(item => {
        const div = document.createElement('div');
        div.className = 'catalog-item';
        if (item.obligatorio) {
            div.classList.add('mandatory', 'selected');
        } else if (quoteData.selectedEPP.includes(item.id)) {
            div.classList.add('selected');
        }

        div.innerHTML = `
            <div class="catalog-item-header">
                <div class="catalog-item-name">${item.nombre}</div>
                <div class="catalog-item-price">${formatCurrency(item.precio)}</div>
            </div>
            <div class="catalog-item-description">${item.descripcion}</div>
            <div class="catalog-item-category" style="font-size: 0.8rem; color: var(--text-muted);">${item.categoria}</div>
            ${item.obligatorio ? '<div class="catalog-item-badge">Obligatorio</div>' : ''}
        `;

        if (!item.obligatorio) {
            div.onclick = () => toggleEPPSelection(item.id, div);
        }

        container.appendChild(div);
    });
}

function renderEquipmentCatalog() {
    const container = document.getElementById('equipmentCatalog');
    container.innerHTML = '';

    EQUIPMENT_CATALOG.forEach(item => {
        const div = document.createElement('div');
        div.className = 'catalog-item';
        if (quoteData.selectedEquipment.includes(item.id)) {
            div.classList.add('selected');
        }

        div.innerHTML = `
            <div class="catalog-item-header">
                <div class="catalog-item-name">${item.nombre}</div>
                <div class="catalog-item-price">${formatCurrency(item.precioMensual)}/mes</div>
            </div>
            <div class="catalog-item-description">${item.descripcion}</div>
            <div class="catalog-item-category" style="font-size: 0.8rem; color: var(--text-muted);">${item.categoria}</div>
            <div class="equipment-quantity" style="display: ${quoteData.selectedEquipment.includes(item.id) ? 'flex' : 'none'};">
                <label style="font-size: 0.85rem; color: var(--text-secondary);">Cantidad:</label>
                <input type="number" min="1" value="${quoteData.equipmentQuantities[item.id] || 1}" 
                    onchange="updateEquipmentQuantity('${item.id}', this.value)" 
                    onclick="event.stopPropagation()">
            </div>
        `;

        div.onclick = () => toggleEquipmentSelection(item.id, div);
        container.appendChild(div);
    });
}

function renderMaterialsCatalog() {
    const container = document.getElementById('materialsCatalog');
    container.innerHTML = '';

    MATERIALS_CATALOG.forEach(item => {
        const div = document.createElement('div');
        div.className = 'catalog-item';
        if (quoteData.selectedMaterials.includes(item.id)) {
            div.classList.add('selected');
        }

        div.innerHTML = `
            <div class="catalog-item-header">
                <div class="catalog-item-name">${item.nombre}</div>
                <div class="catalog-item-price">${formatCurrency(item.precio)}/${item.unidad}</div>
            </div>
            <div class="catalog-item-description">${item.descripcion}</div>
            <div class="catalog-item-category" style="font-size: 0.8rem; color: var(--text-muted);">${item.categoria}</div>
            <div class="equipment-quantity" style="display: ${quoteData.selectedMaterials.includes(item.id) ? 'flex' : 'none'};">
                <label style="font-size: 0.85rem; color: var(--text-secondary);">Cantidad:</label>
                <input type="number" min="1" value="${quoteData.materialQuantities[item.id] || 1}" 
                    onchange="updateMaterialQuantity('${item.id}', this.value)" 
                    onclick="event.stopPropagation()">
            </div>
        `;

        div.onclick = () => toggleMaterialSelection(item.id, div);
        container.appendChild(div);
    });
}

// ============================================
// SELECTION HANDLERS
// ============================================
function toggleEPPSelection(id, element) {
    const index = quoteData.selectedEPP.indexOf(id);
    if (index > -1) {
        quoteData.selectedEPP.splice(index, 1);
        element.classList.remove('selected');
    } else {
        quoteData.selectedEPP.push(id);
        element.classList.add('selected');
    }
    calculateSummary();
}

function toggleEquipmentSelection(id, element) {
    const index = quoteData.selectedEquipment.indexOf(id);
    if (index > -1) {
        quoteData.selectedEquipment.splice(index, 1);
        delete quoteData.equipmentQuantities[id];
        element.classList.remove('selected');
    } else {
        quoteData.selectedEquipment.push(id);
        quoteData.equipmentQuantities[id] = 1;
        element.classList.add('selected');
    }
    renderEquipmentCatalog();
    calculateSummary();
}

function toggleMaterialSelection(id, element) {
    const index = quoteData.selectedMaterials.indexOf(id);
    if (index > -1) {
        quoteData.selectedMaterials.splice(index, 1);
        delete quoteData.materialQuantities[id];
        element.classList.remove('selected');
    } else {
        quoteData.selectedMaterials.push(id);
        quoteData.materialQuantities[id] = 1;
        element.classList.add('selected');
    }
    renderMaterialsCatalog();
    calculateSummary();
}

function updateEquipmentQuantity(id, quantity) {
    quoteData.equipmentQuantities[id] = parseInt(quantity) || 1;
    calculateSummary();
}

function updateMaterialQuantity(id, quantity) {
    quoteData.materialQuantities[id] = parseInt(quantity) || 1;
    calculateSummary();
}

// ============================================
// CALCULATIONS
// ============================================
function calculateSummary() {
    const personnel = parseFloat(document.getElementById('personnel')?.value) || 0;
    const months = parseFloat(document.getElementById('months')?.value) || 0;
    const location = document.getElementById('location')?.value || 'LOCAL';
    const overtime = parseFloat(document.getElementById('overtime')?.value) || 0;
    const weeks = months * CONSTANTS.WEEKS_PER_MONTH;

    // Labor costs
    const laborCost = CONSTANTS.COSTS.WEEKLY_LABOR * personnel * weeks;
    const onboardingCost = (CONSTANTS.COSTS.MEDICAL_CHECK + CONSTANTS.COSTS.DC3_TRAINING) * personnel;
    const overtimeCost = overtime * CONSTANTS.COSTS.OVERTIME_RATE * personnel * months;
    const totalLabor = laborCost + onboardingCost + overtimeCost;

    // IMSS
    const imssCost = CONSTANTS.COSTS.MONTHLY_IMSS * personnel * months;

    // EPP
    const eppCost = quoteData.selectedEPP.reduce((total, id) => {
        const item = getItemById(EPP_CATALOG, id);
        return total + (item ? item.precio * personnel : 0);
    }, 0);

    // Equipment
    const equipmentCost = quoteData.selectedEquipment.reduce((total, id) => {
        const item = getItemById(EQUIPMENT_CATALOG, id);
        const quantity = quoteData.equipmentQuantities[id] || 1;
        return total + (item ? item.precioMensual * quantity * months : 0);
    }, 0);

    // Materials
    const materialsCost = quoteData.selectedMaterials.reduce((total, id) => {
        const item = getItemById(MATERIALS_CATALOG, id);
        const quantity = quoteData.materialQuantities[id] || 1;
        return total + (item ? item.precio * quantity : 0);
    }, 0);

    const additionalMaterials = parseFloat(document.getElementById('additionalMaterials')?.value) || 0;
    const toolsCost = parseFloat(document.getElementById('toolsCost')?.value) || 0;
    const shippingCost = parseFloat(document.getElementById('shippingCost')?.value) || 0;
    const totalMaterials = materialsCost + additionalMaterials + toolsCost + shippingCost;

    // Logistics (only if FORANEO)
    let logisticsCost = 0;
    if (location === 'FORANEO') {
        const days = weeks * 7;
        const viaticos = CONSTANTS.COSTS.DAILY_VIATICO * personnel * days;
        const hotel = (CONSTANTS.COSTS.HOTEL_NIGHT * personnel * days) / 2;
        const transport = CONSTANTS.COSTS.TRANSPORT_REMOTE * personnel;
        logisticsCost = viaticos + hotel + transport;
    }

    // Direct cost (company cost)
    const directCost = totalLabor + imssCost + eppCost + equipmentCost + totalMaterials + logisticsCost;

    // Margins
    const adminMargin = parseFloat(document.getElementById('adminMargin')?.value) || 5;
    const profitMargin = parseFloat(document.getElementById('profitMargin')?.value) || 15;

    const adminCost = directCost * (adminMargin / 100);
    const profitCost = directCost * (profitMargin / 100);

    // Final price
    const basePrice = directCost + adminCost + profitCost;
    const ivaCost = basePrice * 0.16;
    const totalPrice = basePrice + ivaCost;

    // Update profit analysis (if unlocked)
    updateProfitAnalysis(directCost, basePrice, adminCost, profitCost);

    // Store in global for PDF
    window.calculatedQuote = {
        laborCost: totalLabor,
        imssCost,
        eppCost,
        equipmentCost,
        materialsCost: totalMaterials,
        shippingCost,
        logisticsCost,
        directCost,
        adminCost,
        profitCost,
        basePrice,
        ivaCost,
        totalPrice
    };

    return window.calculatedQuote;
}

function updateFinalSummary() {
    const calc = calculateSummary();

    // Update project details
    document.getElementById('summaryProject').textContent = document.getElementById('projectName').value || '-';
    document.getElementById('summaryClient').textContent = document.getElementById('clientName').value || '-';
    document.getElementById('summaryLocation').textContent = document.getElementById('location').value === 'LOCAL' ? 'Local (Monclova)' : 'Foráneo (Con Viáticos)';
    document.getElementById('summaryDuration').textContent = document.getElementById('months').value + ' meses';
    document.getElementById('summaryPersonnel').textContent = document.getElementById('personnel').value + ' personas';

    // Update financial summary
    document.getElementById('summaryLabor').textContent = formatCurrency(calc.laborCost);
    document.getElementById('summaryIMSS').textContent = formatCurrency(calc.imssCost);
    document.getElementById('summaryEPP').textContent = formatCurrency(calc.eppCost);
    document.getElementById('summaryLogistics').textContent = formatCurrency(calc.logisticsCost);
    document.getElementById('summaryEquipment').textContent = formatCurrency(calc.equipmentCost);
    document.getElementById('summaryMaterials').textContent = formatCurrency(calc.materialsCost);
    document.getElementById('summaryDirectCost').textContent = formatCurrency(calc.directCost);
    document.getElementById('summaryAdmin').textContent = formatCurrency(calc.adminCost);
    document.getElementById('summaryProfit').textContent = formatCurrency(calc.profitCost);
    document.getElementById('summaryFinalPrice').textContent = formatCurrency(calc.basePrice);
    document.getElementById('summaryIVA').textContent = formatCurrency(calc.ivaCost);
    document.getElementById('summaryTotal').textContent = formatCurrency(calc.totalPrice);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// ============================================
// PDF GENERATION
// ============================================
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const calc = calculateSummary();
    const projectName = document.getElementById('projectName').value;
    const clientName = document.getElementById('clientName').value;
    const location = document.getElementById('location').value;
    const personnel = document.getElementById('personnel').value;
    const months = document.getElementById('months').value;
    const quoteDate = document.getElementById('quoteDate').value;
    const validityDays = document.getElementById('validityDays').value;
    const contactName = document.getElementById('contactName').value || 'N/A';

    // Colors
    const primaryColor = [37, 99, 235]; // Blue
    const secondaryColor = [71, 85, 105]; // Gray
    const accentColor = [16, 185, 129]; // Green
    const lightGray = [241, 245, 249];

    // ===== HEADER SECTION =====
    // Blue header bar
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 35, 'F');

    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MICSA', 20, 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Soluciones Industriales', 20, 22);
    doc.text('ISO 9001:2015 Certified', 20, 28);

    // Quote number and date (right side)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('COTIZACIÓN', 190, 15, { align: 'right' });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const quoteNumber = `COT-${Date.now().toString().slice(-6)}`;
    doc.text(`No. ${quoteNumber}`, 190, 21, { align: 'right' });
    doc.text(`Fecha: ${new Date(quoteDate).toLocaleDateString('es-MX')}`, 190, 27, { align: 'right' });

    // ===== CLIENT INFORMATION =====
    let yPos = 45;

    doc.setFillColor(...lightGray);
    doc.rect(15, yPos - 5, 180, 8, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMACIÓN DEL CLIENTE', 20, yPos);

    yPos += 10;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.setFont('helvetica', 'bold');
    doc.text('Cliente:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(clientName, 45, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Contacto:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(contactName, 45, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Proyecto:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(projectName, 45, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Ubicación:', 20, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(location === 'LOCAL' ? 'Local (Monclova)' : 'Foráneo (Con Viáticos)', 45, yPos);

    // Project parameters (right column)
    yPos = 65;
    doc.setFont('helvetica', 'bold');
    doc.text('Personal:', 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${personnel} personas`, 145, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Duración:', 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${months} meses`, 145, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('Vigencia:', 120, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(`${validityDays} días`, 145, yPos);

    // ===== COST BREAKDOWN TABLE =====
    yPos += 15;

    doc.setFillColor(...lightGray);
    doc.rect(15, yPos - 5, 180, 8, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('DESGLOSE DE COSTOS', 20, yPos);

    yPos += 10;

    // Table data
    const tableData = [
        ['CONCEPTO', 'MONTO'],
        // Direct costs
        ['Mano de Obra', formatCurrency(calc.laborCost)],
        ['Cargas Sociales (IMSS)', formatCurrency(calc.imssCost)],
        ['EPP y Seguridad', formatCurrency(calc.eppCost)],
        ['Equipos y Maquinaria', formatCurrency(calc.equipmentCost)],
        ['Materiales y Consumibles', formatCurrency(calc.materialsCost)],
        ['Costo de Envío', formatCurrency(calc.shippingCost)],
        ['Logística y Viáticos', formatCurrency(calc.logisticsCost)]
    ];

    doc.autoTable({
        startY: yPos,
        head: [tableData[0]],
        body: tableData.slice(1),
        theme: 'striped',
        headStyles: {
            fillColor: primaryColor,
            fontSize: 10,
            fontStyle: 'bold',
            halign: 'center'
        },
        bodyStyles: {
            fontSize: 9
        },
        columnStyles: {
            0: { cellWidth: 130 },
            1: { halign: 'right', cellWidth: 50 }
        },
        margin: { left: 15, right: 15 }
    });

    // Subtotal section
    yPos = doc.lastAutoTable.finalY + 10;

    // Subtotal box
    doc.setFillColor(250, 250, 250);
    doc.rect(130, yPos, 65, 50, 'F');
    doc.setDrawColor(...secondaryColor);
    doc.rect(130, yPos, 65, 50, 'S');

    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);

    // Direct cost
    doc.setFont('helvetica', 'bold');
    doc.text('COSTO DIRECTO:', 135, yPos + 7);
    doc.text(formatCurrency(calc.directCost), 190, yPos + 7, { align: 'right' });

    // Admin
    doc.setFont('helvetica', 'normal');
    doc.text('+ Administrativos:', 135, yPos + 15);
    doc.text(formatCurrency(calc.adminCost), 190, yPos + 15, { align: 'right' });

    // Profit
    doc.text('+ Utilidad:', 135, yPos + 23);
    doc.text(formatCurrency(calc.profitCost), 190, yPos + 23, { align: 'right' });

    // Line separator
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(135, yPos + 28, 190, yPos + 28);

    // Subtotal
    doc.setFont('helvetica', 'bold');
    doc.text('SUBTOTAL:', 135, yPos + 35);
    doc.text(formatCurrency(calc.basePrice), 190, yPos + 35, { align: 'right' });

    // IVA
    doc.setFont('helvetica', 'normal');
    doc.text('+ IVA (16%):', 135, yPos + 43);
    doc.text(formatCurrency(calc.ivaCost), 190, yPos + 43, { align: 'right' });

    // ===== TOTAL BOX =====
    yPos += 55;

    doc.setFillColor(...accentColor);
    doc.rect(130, yPos, 65, 12, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', 135, yPos + 8);
    doc.text(formatCurrency(calc.totalPrice), 190, yPos + 8, { align: 'right' });

    // ===== TERMS AND CONDITIONS =====
    yPos += 20;

    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFillColor(...lightGray);
    doc.rect(15, yPos - 5, 180, 8, 'F');

    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TÉRMINOS Y CONDICIONES', 20, yPos);

    yPos += 8;
    doc.setFontSize(8);
    doc.setTextColor(60, 60, 60);
    doc.setFont('helvetica', 'normal');

    const terms = [
        '• Forma de Pago: 50% anticipo, 50% contra entrega',
        '• Tiempo de Entrega: A convenir según alcance del proyecto',
        '• Garantía: 12 meses contra defectos de fabricación',
        '• Los precios incluyen IVA y pueden variar según disponibilidad de materiales',
        '• Esta cotización tiene una vigencia de ' + validityDays + ' días naturales'
    ];

    terms.forEach(term => {
        doc.text(term, 20, yPos);
        yPos += 5;
    });

    // ===== FOOTER =====
    const pageCount = doc.internal.getNumberOfPages();
    const pageHeight = doc.internal.pageSize.height;

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Footer bar
        doc.setFillColor(...primaryColor);
        doc.rect(0, pageHeight - 20, 210, 20, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text('MICSA Soluciones Industriales | contacto@micsa.com | Tel: (866) 123-4567', 105, pageHeight - 12, { align: 'center' });
        doc.text('Monclova, Coahuila, México | www.micsa.com', 105, pageHeight - 7, { align: 'center' });

        // Page number
        doc.setFontSize(7);
        doc.text(`Página ${i} de ${pageCount}`, 190, pageHeight - 7, { align: 'right' });
    }

    // Save
    const filename = `MICSA_Cotizacion_${clientName.replace(/\s+/g, '_')}_${quoteNumber}.pdf`;
    doc.save(filename);

    // Show success message
    alert(`✅ PDF generado exitosamente: ${filename}`);
}

// ============================================
// SAVE QUOTE
// ============================================
async function saveQuote() {
    const calc = calculateSummary();

    const quotePayload = {
        quote_number: `COT-${Date.now()}`,
        client_name: document.getElementById('clientName').value,
        project_name: document.getElementById('projectName').value,
        data: {
            ...quoteData,
            formData: {
                projectName: document.getElementById('projectName').value,
                clientName: document.getElementById('clientName').value,
                location: document.getElementById('location').value,
                personnel: document.getElementById('personnel').value,
                months: document.getElementById('months').value,
                overtime: document.getElementById('overtime').value,
                quoteDate: document.getElementById('quoteDate').value,
                validityDays: document.getElementById('validityDays').value
            }
        },
        total_amount: calc.totalPrice,
        created_at: new Date().toISOString()
    };

    try {
        const response = await fetch('/api/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(quotePayload)
        });

        if (response.ok) {
            alert('✅ Cotización guardada exitosamente');
        } else {
            throw new Error('Error al guardar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error al guardar la cotización');
    }
}

// ============================================
// PASSWORD PROTECTION FOR MARGINS
// ============================================
function unlockMargins() {
    const password = document.getElementById('marginPassword').value;
    const correctPassword = 'admin123'; // You can change this to a more secure password
    
    if (password === correctPassword) {
        document.getElementById('marginPasswordSection').style.display = 'none';
        document.getElementById('marginConfigSection').style.display = 'block';
        calculateSummary(); // Refresh to show profit analysis
        alert('✅ Márgenes desbloqueados correctamente');
    } else {
        alert('❌ Contraseña incorrecta');
        document.getElementById('marginPassword').value = '';
        document.getElementById('marginPassword').focus();
    }
}

// ============================================
// PROFIT ANALYSIS
// ============================================
function updateProfitAnalysis(companyCost, sellingPrice, adminCost, profitCost) {
    // Only update if margins are unlocked
    const marginSection = document.getElementById('marginConfigSection');
    if (!marginSection || marginSection.style.display === 'none') {
        return;
    }

    const realProfit = sellingPrice - companyCost;
    const profitPercentage = companyCost > 0 ? ((realProfit / companyCost) * 100).toFixed(2) : 0;

    // Update display elements
    document.getElementById('companyCost').textContent = formatCurrency(companyCost);
    document.getElementById('sellingPrice').textContent = formatCurrency(sellingPrice);
    document.getElementById('realProfit').textContent = formatCurrency(realProfit);
    document.getElementById('profitPercentage').textContent = profitPercentage + '%';
    
    // Update progress bar
    const profitBar = document.getElementById('profitBar');
    const barWidth = Math.min(profitPercentage, 100); // Cap at 100%
    profitBar.style.width = barWidth + '%';
    
    // Change color based on profit margin
    if (profitPercentage < 10) {
        profitBar.style.background = 'linear-gradient(90deg, #ef4444, #f97316)'; // Red to orange
    } else if (profitPercentage < 20) {
        profitBar.style.background = 'linear-gradient(90deg, #f97316, #fbbf24)'; // Orange to yellow
    } else {
        profitBar.style.background = 'linear-gradient(90deg, #3b82f6, #10b981)'; // Blue to green
    }
}
