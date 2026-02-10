/**
 * MICSA OS - PACKING LIST v2.0 (NIVEL INTEGRADO)
 * Fusión: Legacy ERP + Next.js Module
 * Features: Multi-select, Category Sync, Color TAG, Photos, Live Summary
 */

const API_URL = '/api';

// ========== SISTEMA DE CATEGORÍAS (Legacy + Next.js) ==========
let activeCategoriesData = {};
if (typeof CATEGORIAS_DATA !== 'undefined') {
    activeCategoriesData = { ...CATEGORIAS_DATA };
}

let CATEGORIES = Object.keys(activeCategoriesData);
if (CATEGORIES.length === 0) {
    CATEGORIES = ['Equipo Principal', 'Cableado', 'Tubería', 'Válvula', 'Soporte', 'Conexión', 'Accesorio'];
}

const CONDITIONS = ['Nuevo', 'Operativo', 'Bueno', 'Regular'];

// ========== SELECTION MODE ==========
let selectionMode = false;
let selectedRows = new Set();

function toggleSelectionMode() {
    selectionMode = !selectionMode;
    const selectCol = document.getElementById('selectColHeader');
    const bulkBar = document.getElementById('bulkBar');

    selectCol.style.display = selectionMode ? '' : 'none';
    if (!selectionMode) {
        bulkBar.classList.remove('active');
        selectedRows.clear();
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.checked = false;
            cb.closest('td').style.display = 'none';
            cb.closest('tr').classList.remove('selected');
        });
    } else {
        document.querySelectorAll('.row-checkbox').forEach(cb => {
            cb.closest('td').style.display = '';
        });
    }
    updateBulkBar();
}

function toggleSelectAll(master) {
    const cbs = document.querySelectorAll('.row-checkbox');
    cbs.forEach(cb => {
        cb.checked = master.checked;
        if (master.checked) {
            selectedRows.add(cb.closest('tr'));
            cb.closest('tr').classList.add('selected');
        } else {
            selectedRows.delete(cb.closest('tr'));
            cb.closest('tr').classList.remove('selected');
        }
    });
    updateBulkBar();
}

function toggleRow(cb) {
    const row = cb.closest('tr');
    if (cb.checked) {
        selectedRows.add(row);
        row.classList.add('selected');
    } else {
        selectedRows.delete(row);
        row.classList.remove('selected');
    }
    updateBulkBar();
}

function updateBulkBar() {
    const bulkBar = document.getElementById('bulkBar');
    const count = document.getElementById('selectedCount');
    count.textContent = selectedRows.size;
    bulkBar.classList.toggle('active', selectedRows.size > 0);
}

function bulkDelete() {
    if (!confirm(`¿Eliminar ${selectedRows.size} ítems seleccionados?`)) return;
    const rows = [...selectedRows];
    rows.forEach(row => {
        const idx = row.rowIndex - 1; // Account for header
        removeItemRowByIndex(idx);
    });
    selectedRows.clear();
    updateBulkBar();
    syncDetailRows();
    updateSummary();
    plToast('success', `${rows.length} ítems eliminados`);
}

// ========== CARGA DE CATEGORÍAS GLOBAL ==========
async function loadGlobalCategories() {
    try {
        const localData = localStorage.getItem('MICSA_GLOBAL_LABELING_SYSTEM');
        let configData = null;

        if (localData) {
            const parsed = JSON.parse(localData);
            configData = parsed.etiquetas || (parsed.data && parsed.data.etiquetas);
            console.log('✅ Etiquetas cargadas de LocalStorage');
        }

        if (!configData) {
            try {
                const res = await fetch('/api/reports');
                if (res.ok) {
                    const reports = await res.json();
                    const config = reports.find(r => r.internal_id === 'MICSA_GLOBAL_LABELING_SYSTEM' ||
                        (r.data && r.data.tipo === 'SISTEMA_ETIQUETADO_GLOBAL'));
                    if (config && config.data) {
                        configData = config.data.etiquetas || (config.data.data && config.data.data.etiquetas);
                        console.log('✅ Etiquetas cargadas de API');
                    }
                }
            } catch (apiErr) {
                console.warn('⚠️ API no disponible, usando defaults');
            }
        }

        if (configData && Array.isArray(configData)) {
            const newMap = {};
            configData.forEach(item => {
                newMap[item.categoria] = {
                    prefijo: item.prefijo,
                    descripcion: item.descripcion,
                    formato: item.formato,
                    colorHex: item.colorHex || '#cccccc',
                    peso: item.peso || '',
                    dims: item.dims || '',
                    nombreReal: item.categoria
                };
            });
            activeCategoriesData = { ...activeCategoriesData, ...newMap };
        }
    } catch (e) {
        console.warn('⚠️ Error cargando etiquetas:', e);
    }

    CATEGORIES = Object.keys(activeCategoriesData);
    refreshCategoryDropdowns();
    updateDescriptionDatalist();
}

function refreshCategoryDropdowns() {
    document.querySelectorAll('.category-select').forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '<option value="">Seleccionar...</option>' +
            CATEGORIES.map(c => `<option value="${c}" ${currentVal === c ? 'selected' : ''}>${c}</option>`).join('');
    });
}

function updateDescriptionDatalist() {
    let datalist = document.getElementById('categoriesList');
    if (!datalist) {
        datalist = document.createElement('datalist');
        datalist.id = 'categoriesList';
        document.body.appendChild(datalist);
    }
    datalist.innerHTML = Object.entries(activeCategoriesData).map(([cat, data]) =>
        `<option value="${data.nombreReal || cat}">${data.descripcion || ''}</option>`
    ).join('');
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', loadGlobalCategories);

window.loadProjects = async function () {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Error al cargar proyectos');
        const projects = await response.json();
        const select = document.getElementById('nombreProyecto');
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = '<option value="">Seleccionar proyecto...</option>';
        projects.forEach(p => {
            if (p.status === 'active') {
                const option = document.createElement('option');
                option.value = p.name;
                option.textContent = p.name;
                option.dataset.client = p.client || '';
                if (p.name === currentValue) option.selected = true;
                select.appendChild(option);
            }
        });

        select.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            const client = selectedOption.dataset.client;
            if (client) {
                const clienteInput = document.getElementById('nombreCliente');
                if (clienteInput) clienteInput.value = client;
            }
        });

        if (select.value) select.dispatchEvent(new Event('change'));
    } catch (err) {
        console.warn('⚠️ Error cargando proyectos:', err);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try { await window.loadProjects(); } catch (e) { console.warn(e); }

    const fechaInput = document.getElementById('fecha');
    if (!fechaInput.value) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }

    const lastActiveId = localStorage.getItem('MICSA_Ultimo_ID_Actual');
    if (lastActiveId) {
        document.getElementById('reportId').value = lastActiveId;
        loadDraft(lastActiveId);
    } else {
        for (let i = 0; i < 3; i++) addItemRow();
    }
});

// ========== AGREGAR / ELIMINAR FILAS ==========
let rowCounter = 0;

function addItemRow(data = {}) {
    rowCounter++;
    const tableBody = document.getElementById('itemsTable').querySelector('tbody');
    const row = tableBody.insertRow();
    const idx = tableBody.rows.length;

    const catData = data.category ? activeCategoriesData[data.category] : null;
    const defaultColor = catData ? catData.colorHex : '#3b82f6';

    row.innerHTML = `
        <td style="display:${selectionMode ? '' : 'none'}; text-align:center;">
            <input type="checkbox" class="row-checkbox" onchange="toggleRow(this)">
        </td>
        <td class="idx-cell">${idx}</td>
        <td><input type="number" class="qty" value="${data.qty || 1}" min="1" style="text-align:center; width:50px;" oninput="updateSummary()"></td>
        <td>
            <select class="category-select" onchange="onCategoryChange(this)">
                <option value="">Seleccionar...</option>
                ${CATEGORIES.map(c => `<option value="${c}" ${data.category === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </td>
        <td><input type="text" class="tag-input tag" value="${data.tag || ''}" placeholder="TAG" oninput="this.value = this.value.toUpperCase()"></td>
        <td><input type="text" class="desc" list="categoriesList" value="${data.desc || ''}" placeholder="Descripción..." oninput="detectCategoryAndTag(this)" onchange="detectCategoryAndTag(this)"></td>
        <td><input type="text" class="ubicacion" value="${data.ubicacion || data.location || ''}" placeholder="Sitio"></td>
        <td style="text-align:center;"><input type="color" class="color-input" value="${data.color || defaultColor}"></td>
        <td><input type="number" class="weight-input weight" value="${data.weight || ''}" step="0.01" placeholder="0" oninput="updateSummary()"></td>
        <td class="no-print" style="text-align:center;">
            <button type="button" class="btn-delete-row" onclick="removeItemRowBtn(this)">ELIMINAR</button>
        </td>
    `;

    // Add detail row
    addDetailRow(data, idx);
    updateSummary();
}

function addDetailRow(data = {}, idx) {
    const detailBody = document.getElementById('detailsTable').querySelector('tbody');
    const row = detailBody.insertRow();

    row.innerHTML = `
        <td class="idx-cell">${idx}</td>
        <td><input type="text" class="serial-number" value="${data.serialNumber || ''}" placeholder="S/N"></td>
        <td><input type="text" class="dims" value="${data.dims || ''}" placeholder="L x A x H"></td>
        <td>
            <select class="condition">
                ${CONDITIONS.map(c => `<option value="${c}" ${(data.condition || 'Nuevo') === c ? 'selected' : ''}>${c}</option>`).join('')}
            </select>
        </td>
        <td><input type="text" class="connections" value="${data.connections || ''}" placeholder="Detalles de conexión..."></td>
        <td class="photo-cell" style="text-align:center;">
            <label class="photo-btn">📷
                <input type="file" class="photo-file" accept="image/*" style="display:none;" onchange="previewImage(this)">
            </label>
            <img class="photo-preview" src="${data.photo || ''}">
            <input type="hidden" class="photo-data" value="${data.photo || ''}">
        </td>
        <td><textarea class="obs" placeholder="Notas adicionales..." oninput="autoResizeTextarea(this)">${data.obs || ''}</textarea></td>
    `;

    // Show photo if exists
    if (data.photo) {
        const img = row.querySelector('.photo-preview');
        img.style.display = 'block';
    }
}

function removeItemRowBtn(btn) {
    const row = btn.closest('tr');
    const tbody = row.closest('tbody');
    const rowIdx = [...tbody.rows].indexOf(row);

    row.remove();

    // Remove matching detail row
    const detailBody = document.getElementById('detailsTable').querySelector('tbody');
    if (detailBody.rows[rowIdx]) {
        detailBody.rows[rowIdx].remove();
    }

    reindexRows();
    updateSummary();
}

function removeItemRowByIndex(idx) {
    const itemBody = document.getElementById('itemsTable').querySelector('tbody');
    const detailBody = document.getElementById('detailsTable').querySelector('tbody');

    // idx is 0-based from tbody
    const adjustedIdx = idx - 1;
    if (adjustedIdx >= 0 && adjustedIdx < itemBody.rows.length) {
        itemBody.rows[adjustedIdx].remove();
    }
    if (adjustedIdx >= 0 && adjustedIdx < detailBody.rows.length) {
        detailBody.rows[adjustedIdx].remove();
    }
    reindexRows();
}

function reindexRows() {
    document.querySelectorAll('#itemsTable tbody tr').forEach((row, i) => {
        const idxCell = row.querySelector('.idx-cell');
        if (idxCell) idxCell.textContent = i + 1;
    });
    document.querySelectorAll('#detailsTable tbody tr').forEach((row, i) => {
        const idxCell = row.querySelector('.idx-cell');
        if (idxCell) idxCell.textContent = i + 1;
    });
}

function syncDetailRows() {
    const itemBody = document.getElementById('itemsTable').querySelector('tbody');
    const detailBody = document.getElementById('detailsTable').querySelector('tbody');
    const diff = itemBody.rows.length - detailBody.rows.length;
    if (diff > 0) {
        for (let i = 0; i < diff; i++) addDetailRow({}, detailBody.rows.length + 1);
    } else if (diff < 0) {
        for (let i = 0; i < Math.abs(diff); i++) {
            if (detailBody.lastElementChild) detailBody.lastElementChild.remove();
        }
    }
    reindexRows();
}

// ========== CATEGORY SYNC (from Next.js) ==========
function onCategoryChange(select) {
    const row = select.closest('tr');
    const tagInput = row.querySelector('.tag');
    const colorInput = row.querySelector('.color-input');
    const category = select.value;
    const catData = activeCategoriesData[category];

    if (catData) {
        // Auto-fill TAG format
        if (!tagInput.value || tagInput.value === '' || tagInput.value === 'TAG') {
            tagInput.value = catData.formato || `${catData.prefijo}-000`;
        }
        // Auto-fill color
        if (catData.colorHex) {
            colorInput.value = catData.colorHex;
        }
    }
    updateSummary();
}

function detectCategoryAndTag(descInput) {
    const text = descInput.value.toUpperCase();
    const row = descInput.closest('tr');
    const tagInput = row.querySelector('.tag');
    const catSelect = row.querySelector('.category-select');
    const colorInput = row.querySelector('.color-input');
    const weightInput = row.querySelector('.weight');

    if (!text || !tagInput) return;

    for (const [catName, data] of Object.entries(activeCategoriesData)) {
        const upperCat = catName.toUpperCase();
        if (text.includes(upperCat) || (data.descripcion && text.includes(data.descripcion.toUpperCase()))) {
            // Auto-select category
            if (catSelect && !catSelect.value) {
                catSelect.value = catName;
            }
            // Auto-fill TAG
            if (!tagInput.value || tagInput.value === '') {
                tagInput.value = data.formato || `${data.prefijo}-000`;
                tagInput.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                setTimeout(() => tagInput.style.backgroundColor = '', 1200);
            }
            // Auto-fill color
            if (data.colorHex && colorInput) {
                colorInput.value = data.colorHex;
            }
            // Auto-fill weight
            if (weightInput && (!weightInput.value || weightInput.value === '0' || weightInput.value === '') && data.peso) {
                weightInput.value = data.peso;
                weightInput.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                setTimeout(() => weightInput.style.backgroundColor = '', 1200);
            }
            updateSummary();
            break;
        }
    }
}

// ========== IMAGE PREVIEW ==========
function previewImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const container = input.closest('.photo-cell');
            const img = container.querySelector('.photo-preview');
            const hidden = container.querySelector('.photo-data');
            img.src = e.target.result;
            img.style.display = 'block';
            hidden.value = e.target.result;
        }
        reader.readAsDataURL(input.files[0]);
    }
}

function autoResizeTextarea(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

// ========== SUMMARY (from Next.js) ==========
function updateSummary() {
    let totalWeight = 0;
    const categoryCounts = {};
    const categoryWeights = {};
    const itemRows = document.querySelectorAll('#itemsTable tbody tr');

    itemRows.forEach(row => {
        const unitWeight = parseFloat(row.querySelector('.weight')?.value) || 0;
        const qty = parseFloat(row.querySelector('.qty')?.value) || 1;
        const cat = row.querySelector('.category-select')?.value || 'Sin Categoría';
        const rowWeight = unitWeight * qty;

        totalWeight += rowWeight;
        categoryCounts[cat] = (categoryCounts[cat] || 0) + parseInt(qty);
        categoryWeights[cat] = (categoryWeights[cat] || 0) + rowWeight;
    });

    // Update total
    const totalEl = document.getElementById('totalPeso');
    if (totalEl) totalEl.textContent = totalWeight.toFixed(2) + ' kg';

    // Update summary grid
    const grid = document.getElementById('summaryGrid');
    if (!grid) return;

    grid.innerHTML = '';
    const maxWeight = Math.max(...Object.values(categoryWeights), 1);

    for (const [cat, count] of Object.entries(categoryCounts)) {
        const weight = categoryWeights[cat] || 0;
        const pct = totalWeight > 0 ? ((weight / totalWeight) * 100) : 0;
        const catData = activeCategoriesData[cat];
        const colorHex = catData ? catData.colorHex : '#64748b';

        grid.innerHTML += `
            <div class="pl-summary-item">
                <h4>${cat}</h4>
                <div class="stats">
                    <span class="count">${count} <small>items</small></span>
                    <span class="weight">${weight.toFixed(1)} kg</span>
                </div>
                <div class="bar">
                    <div class="bar-fill" style="width:${pct}%; background:${colorHex};"></div>
                </div>
            </div>
        `;
    }
}

// ========== SAVE / LOAD ==========
async function savePackingList() {
    let reportId = document.getElementById('reportId').value || `PL-${Date.now()}`;
    document.getElementById('reportId').value = reportId;

    const items = [];
    const itemRows = document.querySelectorAll('#itemsTable tbody tr');
    const detailRows = document.querySelectorAll('#detailsTable tbody tr');

    itemRows.forEach((row, i) => {
        const detail = detailRows[i];
        items.push({
            tag: row.querySelector('.tag')?.value || '',
            desc: row.querySelector('.desc')?.value || '',
            qty: row.querySelector('.qty')?.value || 1,
            category: row.querySelector('.category-select')?.value || '',
            color: row.querySelector('.color-input')?.value || '',
            ubicacion: row.querySelector('.ubicacion')?.value || '',
            weight: row.querySelector('.weight')?.value || '',
            serialNumber: detail?.querySelector('.serial-number')?.value || '',
            dims: detail?.querySelector('.dims')?.value || '',
            condition: detail?.querySelector('.condition')?.value || 'Nuevo',
            connections: detail?.querySelector('.connections')?.value || '',
            photo: detail?.querySelector('.photo-data')?.value || '',
            obs: detail?.querySelector('.obs')?.value || ''
        });
    });

    const payload = {
        reportId: reportId,
        documentType: 'PACKING_LIST',
        generalData: {
            empresaEjecutora: 'MICSA',
            cliente: document.getElementById('nombreCliente').value,
            origen: document.getElementById('origen').value,
            destino: document.getElementById('destino').value,
            proyecto: document.getElementById('nombreProyecto').value,
            ordenTrabajo: document.getElementById('ordenTrabajo').value,
            folio: document.getElementById('folio').value,
            transporte: document.getElementById('transporte').value,
            operador: document.getElementById('operador').value,
            fecha: document.getElementById('fecha').value,
            elaboro: document.getElementById('elaboro').value,
            autorizo: document.getElementById('autorizo').value,
            recibio: document.getElementById('recibio').value,
            totalPeso: document.getElementById('totalPeso').textContent
        },
        items: items
    };

    try {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            localStorage.setItem('MICSA_Ultimo_ID_Actual', reportId);
            plToast('success', 'Packing List guardado exitosamente en servidor');
        } else {
            throw new Error('Response not OK');
        }
    } catch (err) {
        console.warn('⚠️ Backend no accesible, guardando localmente:', err);
        // Fallback: localStorage
        localStorage.setItem(`MICSA_PL_${reportId}`, JSON.stringify(payload));
        localStorage.setItem('MICSA_Ultimo_ID_Actual', reportId);
        plToast('success', 'Guardado localmente (backend offline)');
    }
}

async function loadDraft(id) {
    try {
        // Try API first
        try {
            const response = await fetch(`${API_URL}/reports`);
            if (response.ok) {
                const reports = await response.json();
                const pl = reports.find(r => r.internal_id === id);
                if (pl) {
                    restoreFromData(pl.data);
                    return;
                }
            }
        } catch (e) { /* fallthrough */ }

        // Try localStorage
        const localPL = localStorage.getItem(`MICSA_PL_${id}`);
        if (localPL) {
            const parsed = JSON.parse(localPL);
            restoreFromData(parsed);
        } else {
            for (let i = 0; i < 3; i++) addItemRow();
        }
    } catch (err) {
        console.error('Error cargando borrador:', err);
        for (let i = 0; i < 3; i++) addItemRow();
    }
}

function restoreFromData(data) {
    const g = data.generalData || {};
    const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

    setVal('nombreCliente', g.cliente);
    setVal('origen', g.origen);
    setVal('destino', g.destino);
    setVal('nombreProyecto', g.proyecto);
    setVal('ordenTrabajo', g.ordenTrabajo);
    setVal('folio', g.folio || 'N.001');
    setVal('transporte', g.transporte);
    setVal('operador', g.operador);
    setVal('fecha', g.fecha);
    setVal('elaboro', g.elaboro || 'Emmanuel Alejandro Moreno de León');
    setVal('autorizo', g.autorizo);
    setVal('recibio', g.recibio);

    // Clear tables
    document.getElementById('itemsTable').querySelector('tbody').innerHTML = '';
    document.getElementById('detailsTable').querySelector('tbody').innerHTML = '';

    if (data.items) {
        data.items.forEach(item => addItemRow(item));
    }
}

// ========== IMPORT / EXPORT ==========
function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    parseExcelPackingList(file)
        .then(items => {
            document.getElementById('itemsTable').querySelector('tbody').innerHTML = '';
            document.getElementById('detailsTable').querySelector('tbody').innerHTML = '';
            items.forEach(item => addItemRow(item));
            plToast('success', `${items.length} ítems importados correctamente`);
        })
        .catch(err => {
            console.error(err);
            plToast('error', 'Error al procesar el archivo Excel');
        });

    // Reset file input
    event.target.value = '';
}

function exportToExcel() {
    try {
        const meta = {
            empresaEjecutora: 'MICSA',
            cliente: document.getElementById('nombreCliente').value,
            origen: document.getElementById('origen').value,
            destino: document.getElementById('destino').value,
            proyecto: document.getElementById('nombreProyecto').value,
            ordenTrabajo: document.getElementById('ordenTrabajo').value,
            folio: document.getElementById('folio').value,
            transporte: document.getElementById('transporte').value,
            operador: document.getElementById('operador').value,
            fecha: document.getElementById('fecha').value,
            totalPeso: document.getElementById('totalPeso').textContent.replace(' kg', '')
        };

        const items = [];
        const itemRows = document.querySelectorAll('#itemsTable tbody tr');
        const detailRows = document.querySelectorAll('#detailsTable tbody tr');

        itemRows.forEach((row, i) => {
            const detail = detailRows[i];
            items.push({
                tag: row.querySelector('.tag')?.value || '',
                desc: row.querySelector('.desc')?.value || '',
                qty: row.querySelector('.qty')?.value || 1,
                category: row.querySelector('.category-select')?.value || '',
                serialNumber: detail?.querySelector('.serial-number')?.value || '',
                weight: row.querySelector('.weight')?.value || '',
                dims: detail?.querySelector('.dims')?.value || '',
                condition: detail?.querySelector('.condition')?.value || 'Nuevo',
                obs: detail?.querySelector('.obs')?.value || ''
            });
        });

        generateExcelPackingList(meta, items, []);
        plToast('success', 'Excel generado correctamente');
    } catch (err) {
        console.error(err);
        plToast('error', 'Error al generar archivo Excel');
    }
}

function clearForm() {
    if (confirm('¿Limpiar todo el formulario?')) {
        localStorage.removeItem('MICSA_Ultimo_ID_Actual');
        location.reload();
    }
}

// ========== TOAST NOTIFICATION ==========
function plToast(type, msg) {
    const toast = document.getElementById('plToast');
    toast.className = `pl-toast ${type}`;
    toast.innerHTML = `${type === 'success' ? '✅' : '❌'} ${msg}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);

    // Also notify parent frame
    if (window.parent && window.parent !== window && window.parent.showNotification) {
        window.parent.showNotification(msg, type);
    }
}

// Legacy compat
function showNotification(msg, type) {
    plToast(type, msg);
}
