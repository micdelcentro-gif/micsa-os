// =============================================
// SECCIÓN 0: CONFIGURACIÓN Y GLOBALES
// =============================================

const API_URL = '/api';
const SUPERVISORES_MICSA = [
    "ROBERTO ULISES FRAIRE",
    "ANGEL RODRIGUEZ",
    "ARMANDO RIVAS",
    "JORDAN GONZALEZ"
];

// Exponer funciones críticas globalmente de inmediato
window.loadProjects = loadProjects;

/**
 * ============================================
 * MICSA - REPORTE DIARIO DE OBRA DIGITAL
 * Script Principal de Funcionalidad
 * ============================================

// =============================================
// SECCIÓN 1: FUNCIONES PARA AGREGAR FILAS
// =============================================

/**
 * Agrega una nueva fila a la tabla de Personal en Sitio (Sección 2)
 * Crea inputs para: Nombre, Puesto, Hora Entrada, Hora Salida
 */
function addPersonalRow() {
    const table = document.getElementById('personalTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="[NOMBRE APELLIDO]"></td>
        <td><input type="text" placeholder="[PUESTO]"></td>
        <td><input type="time"></td>
        <td><input type="time"></td>
        <td><button type="button" class="btn-delete" onclick="removeRow(this)" title="Eliminar fila">×</button></td>
    `;
    animateRow(newRow);
}

function addActividadRow() {
    const table = document.getElementById('actividadesTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="[FASE]"></td>
        <td><input type="text" placeholder="[DESCRIPCIÓN TÉCNICA DETALLADA DE LA ACTIVIDAD]" class="wide-input"></td>
        <td><input type="text" placeholder="[SEM]"></td>
        <td><input type="number" placeholder="%" min="0" max="100"></td>
        <td><button type="button" class="btn-delete" onclick="removeRow(this)" title="Eliminar fila">×</button></td>
    `;
    animateRow(newRow);
}

function addMaterialRow() {
    const table = document.getElementById('materialesTable').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.innerHTML = `
        <td><input type="text" placeholder="[NOMBRE DEL MATERIAL]"></td>
        <td><input type="number" placeholder="[CANT]"></td>
        <td><input type="text" placeholder="[U]"></td>
        <td><input type="text" placeholder="[OBSERVACIONES]"></td>
        <td><button type="button" class="btn-delete" onclick="removeRow(this)" title="Eliminar fila">×</button></td>
    `;
    animateRow(newRow);
}

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    row.style.transition = 'all 0.3s ease';

    setTimeout(() => {
        row.remove();
        // Guardar cambios después de eliminar
        guardarBorrador();
    }, 300);
}

function animateRow(row) {
    row.style.opacity = '0';
    row.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
    }, 10);
}

// ===== Preview de imágenes =====

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ===== Utilidades Generales =====

/**
 * Genera un identificador único (UUID v4)
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

document.getElementById('fechaReporte').addEventListener('change', function () {
    const fecha = new Date(this.value);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fechaFotografica').textContent = fecha.toLocaleDateString('es-MX', options);
});

// ===== Identificación de Reporte (Multi-Borrador) =====

const API_URL = '/api';

/**
 * Obtiene solo el número base del reporte (sin sufijos de especificación)
 */
function getBaseReportNo() {
    const input = document.getElementById('reporteNo');
    let repoNo = input ? input.value : '0001';

    if (!repoNo || repoNo === 'AUTO') {
        repoNo = localStorage.getItem('MICSA_Ultimo_Reporte_No_Actual') || '0001';
    }

    // Si el número ya trae un guión bajo (ID compuesto), tratamos de extraer solo la primera parte
    // Asumiendo que el formato es NUMERO_ESPECIFICACION
    if (repoNo.includes('_')) {
        return repoNo.split('_')[0];
    }

    return repoNo;
}

/**
 * Obtiene la clave única para el borrador actual (Número de reporte + Especificación)
 */
function getDraftKey() {
    const baseNo = getBaseReportNo();
    const especInput = document.getElementById('especificacionNo');
    const especNo = especInput ? especInput.value : '';

    // Devolvemos la combinación limpia para evitar duplicados como 5555_BETA_BETA
    return especNo ? `${baseNo}_${especNo}` : baseNo;
}

// ===== Guardar Borrador en LocalStorage =====

async function guardarBorrador() {
    const form = document.getElementById('reporteForm');
    if (!form) return;

    // Obtener ID interno o generar uno nuevo si no existe
    let reportId = document.getElementById('reportId').value;
    if (!reportId) {
        reportId = generateUUID();
        document.getElementById('reportId').value = reportId;
    }

    const reporteNoVal = document.getElementById('reporteNo')?.value || '0001';
    const especNo = document.getElementById('especificacionNo')?.value || '';

    const data = {};

    // Recolectar todos los inputs
    form.querySelectorAll('input, select, textarea').forEach(element => {
        const id = element.id || element.name;
        if (!id) return;

        if (element.type === 'checkbox') {
            data[id] = element.checked;
        } else if (element.type === 'radio') {
            if (element.checked) {
                data[element.name] = element.value;
            }
        } else if (element.type !== 'file') {
            data[id] = element.value;
        }
    });

    // Guardar tablas
    data.personalRows = getTableData('personalTable');
    data.actividadesRows = getActividadesTableData(); // Usar versión mejorada si existe, o getTableData
    data.materialesRows = getTableData('materialesTable');

    try {
        const response = await fetch(`${API_URL}/reports`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: reportId,
                generalData: { reporteNo: reporteNoVal, especNo: especNo },
                ...data
            })
        });

        if (!response.ok) throw new Error('Error al guardar en el servidor');

        // Guardar localmente cuál es el ID activo para la siguiente carga
        localStorage.setItem('MICSA_Ultimo_ID_Actual', reportId);

        showNotification('✅ Reporte sincronizado con el servidor', 'success');
    } catch (error) {
        console.error('Error:', error);
        showNotification('⚠️ Error al conectar con el servidor', 'error');
        // Fallback a localStorage
        localStorage.setItem(`MICSA_Reporte_Borrador_${reportId}`, JSON.stringify(data));
    }
}

function getActividadesTableData() {
    const table = document.getElementById('actividadesTable');
    if (!table) return [];
    const rows = [];
    const tbody = table.getElementsByTagName('tbody')[0];
    for (let row of tbody.rows) {
        const rowData = [];
        row.querySelectorAll('input').forEach(input => rowData.push(input.value));
        rows.push(rowData);
    }
    return rows;
}

function getTableData(tableId) {
    const table = document.getElementById(tableId);
    const rows = [];
    const tbody = table.getElementsByTagName('tbody')[0];

    for (let row of tbody.rows) {
        const rowData = [];
        for (let cell of row.cells) {
            const input = cell.querySelector('input');
            if (input) {
                rowData.push(input.value);
            }
        }
        rows.push(rowData);
    }

    return rows;
}

// ===== Cargar Borrador desde LocalStorage =====

async function cargarBorrador() {
    const reportIdInput = document.getElementById('reportId');
    if (!reportIdInput) return;
    const reportId = reportIdInput.value;
    if (!reportId) return;

    try {
        const response = await fetch(`${API_URL}/reports`);
        if (!response.ok) throw new Error('Error fetching reports from server');
        const reports = await response.json();

        // Buscar el reporte que coincida con el ID interno
        const remoteData = reports.find(r => r.internal_id === reportId);

        if (remoteData) {
            const data = remoteData.data;
            const form = document.getElementById('reporteForm');
            if (!form) return;

            // Restaurar inputs
            for (let key in data) {
                if (!key || key === 'personalRows' || key === 'actividadesRows' || key === 'materialesRows') {
                    continue;
                }

                const element = form.querySelector(`#${key}`) || form.querySelector(`[name="${key}"]`);
                if (element) {
                    if (element.type === 'checkbox') {
                        element.checked = data[key];
                    } else if (element.type === 'radio') {
                        if (element.value === data[key]) {
                            element.checked = true;
                        }
                    } else if (element.type !== 'file') {
                        element.value = data[key];
                    }
                }
            }

            // Restaurar tablas
            if (data.personalRows) restoreTableData('personalTable', data.personalRows);
            if (data.actividadesRows) restoreTableData('actividadesTable', data.actividadesRows);
            if (data.materialesRows) restoreTableData('materialesTable', data.materialesRows);

            // Asegurar que el input de reporteNo solo muestre el base
            const repoNoInput = document.getElementById('reporteNo');
            if (repoNoInput) repoNoInput.value = getBaseReportNo();

            // Actualizar visualizaciones de especificación técnica
            const especNo = document.getElementById('especificacionNo');
            if (especNo) updateSpecDisplays(especNo.value);

            console.log('Datos cargados desde el servidor');
        } else {
            // Si no está en el servidor, intentar localStorage (fallback)
            const localData = localStorage.getItem(`MICSA_Reporte_Borrador_${reportId}`);
            if (localData) {
                try {
                    const data = JSON.parse(localData);
                    // Lógica mínima de restauración local si es necesario
                    console.log('Cargando desde almacenamiento local');
                } catch (e) {
                    console.error('Error parseando borrador local:', e);
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// ===== Utilidades de Visualización =====

/**
 * Actualiza los textos de especificación técnica en el cierre y footer
 */
function updateSpecDisplays(value) {
    const display = document.getElementById('displayEspecificacion');
    const displayFooter = document.getElementById('displayEspecificacionFooter');
    if (display) display.textContent = value || '45766';
    if (displayFooter) displayFooter.textContent = value || '45766';
}

function restoreTableData(tableId, rowsData) {
    const table = document.getElementById(tableId);
    const tbody = table.getElementsByTagName('tbody')[0];
    const existingRows = tbody.rows.length;

    rowsData.forEach((rowData, index) => {
        let row;
        if (index < existingRows) {
            row = tbody.rows[index];
        } else {
            // Necesitamos agregar una nueva fila
            if (tableId === 'personalTable') addPersonalRow();
            else if (tableId === 'actividadesTable') addActividadRow();
            else if (tableId === 'materialesTable') addMaterialRow();
            row = tbody.rows[tbody.rows.length - 1];
        }

        const inputs = row.querySelectorAll('input');
        rowData.forEach((value, cellIndex) => {
            if (inputs[cellIndex]) {
                inputs[cellIndex].value = value;
            }
        });
    });
}

// ===== Utilidades Dinámicas de Cliente =====

/**
 * Actualiza etiquetas dinámicas que dependen del nombre del cliente
 */
function updateClientLabels(val) {
    const label = document.getElementById('labelFirmaCliente');
    if (label) {
        label.textContent = val ? `SUPERVISOR DE ${val.toUpperCase()}` : 'SUPERVISOR DEL CLIENTE';
    }
}

// ===== Generación y Envío =====

// La función generarPDF ha sido movida a pdf-logic.js para modularizar el código.

// ===== Enviar Reporte =====

function enviarReporte() {
    // Validar campos requeridos
    const fechaReporte = document.getElementById('fechaReporte').value;
    const supervisorMicsa = document.getElementById('supervisorMicsa').value;

    if (!fechaReporte) {
        showNotification('⚠️ Por favor, ingresa la fecha del reporte', 'warning');
        document.getElementById('fechaReporte').focus();
        return;
    }

    if (!supervisorMicsa) {
        showNotification('⚠️ Por favor, ingresa el nombre del supervisor MICSA', 'warning');
        document.getElementById('supervisorMicsa').focus();
        return;
    }

    // Verificar checklist
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    let allChecked = true;
    checkboxes.forEach(cb => {
        if (!cb.checked) allChecked = false;
    });

    if (!allChecked) {
        showNotification('⚠️ Por favor, completa el checklist de calidad antes de enviar', 'warning');
        return;
    }

    // Simular envío
    showNotification('📧 Enviando reporte...', 'info');

    setTimeout(() => {
        showNotification('✅ Reporte enviado exitosamente', 'success');

        // Actualizar el número del último reporte finalizado
        const reporteNo = document.getElementById('reporteNo').value;
        localStorage.setItem('MICSA_Ultimo_Reporte_No', reporteNo);
        // Ya no es el reporte "activo" para edición
        localStorage.removeItem('MICSA_Ultimo_ID_Actual');

        // Guardar automáticamente para registrar los cambios finales
        guardarBorrador();
    }, 2000);
}

// ===== Limpiar Formulario Completo =====

function limpiarFormulario() {
    if (confirm('¿Estás seguro de que deseas borrar todo el formulario? Esta acción no se puede deshacer.')) {
        const form = document.getElementById('reporteForm');

        // 1. Resetear inputs estándar
        form.reset();

        // 2. Limpiar previsualizaciones de fotos
        document.querySelectorAll('.photo-preview').forEach(preview => {
            preview.innerHTML = `
                <span class="camera-icon">📷</span>
                <span>Clic para subir</span>
            `;
        });

        // 3. Limpiar tablas dinámicas (dejar solo las filas iniciales)
        // Personal
        const personalBody = document.querySelector('#personalTable tbody');
        while (personalBody.rows.length > 4) personalBody.deleteRow(4);

        // Actividades
        const actividadesBody = document.querySelector('#actividadesTable tbody');
        while (actividadesBody.rows.length > 2) actividadesBody.deleteRow(2);

        // Materiales
        const materialesBody = document.querySelector('#materialesTable tbody');
        while (materialesBody.rows.length > 2) materialesBody.deleteRow(2);

        // 4. Borrar de LocalStorage el ID actual y generar uno nuevo
        const currentId = document.getElementById('reportId').value;
        localStorage.removeItem(`MICSA_Reporte_Borrador_${currentId}`);
        localStorage.removeItem('MICSA_Ultimo_ID_Actual');
        document.getElementById('reportId').value = generateUUID();

        // 5. Reiniciar fecha fotográfica
        const fechaInput = document.getElementById('fechaReporte');
        const today = new Date().toISOString().split('T')[0];
        fechaInput.value = today;
        fechaInput.dispatchEvent(new Event('change'));

        showNotification('🗑️ Formulario y borrador eliminados', 'warning');
        console.log('🧹 Limpieza completa realizada');
    }
}

/**
 * Limpia el formulario sin confirmación ni borrar de LocalStorage.
 * Se usa internamente al cambiar entre reportes.
 */
function resetFormOnly() {
    const form = document.getElementById('reporteForm');
    if (!form) return;

    form.reset();
    document.getElementById('reportId').value = ''; // Limpiar ID para que se genere uno nuevo o se cargue del dashboard

    // Limpiar fotos
    document.querySelectorAll('.photo-preview').forEach(preview => {
        preview.innerHTML = `<span class="camera-icon">📷</span><span>Clic para subir</span>`;
    });

    // Resetear tablas (Personal: 4 filas, Actividades: 2, Materiales: 2)
    const personalBody = document.querySelector('#personalTable tbody');
    while (personalBody.rows.length > 4) personalBody.deleteRow(4);

    const actividadesBody = document.querySelector('#actividadesTable tbody');
    while (actividadesBody.rows.length > 2) actividadesBody.deleteRow(2);

    const materialesBody = document.querySelector('#materialesTable tbody');
    while (materialesBody.rows.length > 2) materialesBody.deleteRow(2);
}

// ===== Sistema de Notificaciones =====

function showNotification(message, type = 'info') {
    // Remover notificación existente
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;

    // Estilos de la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 10px;
        font-size: 0.95rem;
        font-weight: 500;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
    `;

    // Colores según tipo
    switch (type) {
        case 'success':
            notification.style.background = 'linear-gradient(135deg, #059669, #10b981)';
            notification.style.color = 'white';
            break;
        case 'warning':
            notification.style.background = 'linear-gradient(135deg, #d97706, #f59e0b)';
            notification.style.color = 'white';
            break;
        case 'error':
            notification.style.background = 'linear-gradient(135deg, #dc2626, #ef4444)';
            notification.style.color = 'white';
            break;
        default:
            notification.style.background = 'linear-gradient(135deg, #1e40af, #3b82f6)';
            notification.style.color = 'white';
    }

    document.body.appendChild(notification);

    // Agregar animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== Sistema de Importación desde PDF =====

async function handlePdfUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    showNotification('📂 Procesando PDF...', 'info');

    try {
        const text = await extractTextFromPdf(file);
        console.log('Texto extraído del PDF:', text);

        // Mapear el texto extraído al formulario
        mapearTextoAFormulario(text);

        showNotification('✅ Datos importados desde el PDF', 'success');

        // Guardar borrador automáticamente después de importar
        setTimeout(() => guardarBorrador(), 1000);
    } catch (error) {
        console.error('Error al importar PDF:', error);
        showNotification('❌ Error al leer el PDF. Asegúrate de que sea un reporte digital de MICSA.', 'error');
    }
}

async function extractTextFromPdf(file) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

function mapearTextoAFormulario(text) {
    // 1. Extraer Datos Generales

    // Proyecto (Busca texto después de "Proyecto:")
    const proyectoMatch = text.match(/Proyecto:\s*(.*?)(?=\s*Espec\.|\s*Reporte|$)/i);
    if (proyectoMatch) document.getElementById('nombreProyecto').value = proyectoMatch[1].trim();

    // Fecha (Busca patrones DD/MM/AAAA)
    const fechaMatch = text.match(/(\d{2}\/\d{2}\/\d{4})/);
    if (fechaMatch) {
        const [day, month, year] = fechaMatch[1].split('/');
        document.getElementById('fechaReporte').value = `${year}-${month}-${day}`;
        document.getElementById('fechaReporte').dispatchEvent(new Event('change'));
    }

    // Supervisor MICSA
    const supervisorMatch = text.match(/Supervisor MICSA:\s*(.*?)(?=\s*Ubicación|$)/i);
    if (supervisorMatch) document.getElementById('supervisorMicsa').value = supervisorMatch[1].trim();

    // Ubicación / Cliente
    const ubicacionMatch = text.match(/Ubicación\s*\/\s*Cliente:\s*(.*?)(?=\s*Supervisor|$)/i);
    if (ubicacionMatch) {
        const val = ubicacionMatch[1].trim();
        document.getElementById('ubicacionPlanta').value = val; // Assuming 'ubicacion' is now 'ubicacionPlanta'
        // We need to extract client name from 'val' if 'nombreCliente' is a separate field
        // For now, let's assume 'ubicacionPlanta' is the source for client labels
        updateClientLabels(val);
    }

    // Semana de Proyecto
    const semanaMatch = text.match(/Semana de Proyecto:\s*(\d+)/i);
    if (semanaMatch) document.getElementById('semanaProyecto').value = semanaMatch[1];

    // Turno
    const turnoMatch = text.match(/Turno:\s*(PRIMERO|SEGUNDO|TERCERO)/i);
    if (turnoMatch) document.getElementById('turno').value = turnoMatch[1];

    // 2. Intentar reconstruir tablas (Lógica simplificada basada en palabras clave)
    // Nota: La reconstrucción de tablas desde texto plano es compleja. 
    // Aquí implementamos una búsqueda de los datos más comunes si el formato es estándar.

    showNotification('ℹ️ Revisa las tablas importadas; algunos campos complejos podrían requerir ajuste manual.', 'info');
}

async function loadProjects() {
    console.log('[DEBUG] loadProjects execution started');
    try {
        const response = await fetch('/api/projects');
        console.log('[DEBUG] fetch /api/projects status:', response.status);
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
                option.dataset.id = p.id; // Guardamos el ID real
                option.dataset.client = p.client || '';
                if (p.name === currentValue) option.selected = true;
                select.appendChild(option);
            }
        });

        // Configurar listener si no existe
        if (!select.dataset.listenerSet) {
            select.addEventListener('change', async function () {
                const selectedOption = this.options[this.selectedIndex];
                const client = selectedOption ? selectedOption.dataset.client : '';
                if (client) {
                    const clienteInput = document.getElementById('nombreCliente');
                    if (clienteInput) {
                        clienteInput.value = client;
                        if (typeof updateClientLabels === 'function') {
                            updateClientLabels(client);
                        }
                    }
                }

                // AUTO-LLENAR PERSONAL DEL PROYECTO
                const projectId = selectedOption ? selectedOption.dataset.id : null;
                if (projectId) {
                    await autoFillPersonnel(projectId);
                }
            });
            select.dataset.listenerSet = "true";
        }

        // Disparar cambio si ya hay un valor (ej: cargado de borrador)
        if (select.value) {
            select.dispatchEvent(new Event('change'));
        }
    } catch (err) {
        console.error('Error cargando proyectos:', err);
    }
}

/**
 * Busca empleados asignados al proyecto y los agrega a la tabla
 */
async function autoFillPersonnel(projectId) {
    try {
        const response = await fetch(`/api/employees?project_id=${projectId}`);
        if (!response.ok) return;

        const employees = await response.json();
        const assigned = employees.filter(e => e.active);

        if (assigned.length > 0) {
            // Limpiar tabla de personal (pero mantener el header)
            const tbody = document.getElementById('personalTable').querySelector('tbody');
            tbody.innerHTML = '';

            assigned.forEach(emp => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td><input type="text" value="${emp.name}"></td>
                    <td><input type="text" value="${emp.position || ''}"></td>
                    <td><input type="time" value="08:00"></td>
                    <td><input type="time" value="18:00"></td>
                    <td><button type="button" class="btn-delete" onclick="removeRow(this)" title="Eliminar fila">×</button></td>
                `;
                animateRow(row);
            });

            showNotification(`✅ Se cargaron ${assigned.length} trabajadores del proyecto`, 'success');
        }
    } catch (err) {
        console.error('Error auto-llenando personal:', err);
    }
}

// Terminamos las funciones antes de las definiciones de constantes globales que movimos al inicio

async function init() {
    console.log('[DEBUG] MICSA Initialization started');
    try {
        // Cargar proyectos primero
        await loadProjects();
        console.log('[DEBUG] loadProjects finished');
    } catch (e) {
        console.error('[CRITICAL] Error initializing projects:', e);
    }

    // Initialize supervisor datalist
    const supervisorInput = document.getElementById('supervisorMicsa');
    if (supervisorInput) {
        let datalist = document.getElementById('supervisoresList');
        if (!datalist) {
            datalist = document.createElement('datalist');
            datalist.id = 'supervisoresList';
            SUPERVISORES_MICSA.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                datalist.appendChild(option);
            });
            document.body.appendChild(datalist);
        }
        supervisorInput.setAttribute('list', 'supervisoresList');
    }

    // 0. Verificar si venimos en "Modo Nuevo" desde el dashboard
    const urlParams = new URLSearchParams(window.location.search);
    const isNewMode = urlParams.get('mode') === 'new';

    // 1. Recuperar el número de reporte activo o el siguiente disponible
    const reporteNo = document.getElementById('reporteNo');
    const reportIdInput = document.getElementById('reportId');
    const lastActiveId = localStorage.getItem('MICSA_Ultimo_ID_Actual');
    const lastFinishedNo = localStorage.getItem('MICSA_Ultimo_Reporte_No');

    if (reporteNo) {
        if (isNewMode) {
            // Modo Nuevo: Generar nuevo ID interno y proponer el siguiente número secuencial
            const newId = generateUUID();
            if (reportIdInput) reportIdInput.value = newId;
            localStorage.setItem('MICSA_Ultimo_ID_Actual', newId);

            let nextNo = '0001';
            if (lastFinishedNo) {
                nextNo = String(parseInt(lastFinishedNo) + 1).padStart(4, '0');
            }
            reporteNo.value = nextNo;

            // Asegurarse de que el formulario esté limpio
            resetFormOnly();
            reporteNo.value = nextNo;
            if (reportIdInput) reportIdInput.value = newId;

            // Limpiar el parámetro de la URL
            const nextUrl = window.location.pathname;
            window.history.replaceState({}, document.title, nextUrl);
        } else {
            // Modo Normal/Carga: Usar el último ID activo si existe
            if (lastActiveId) {
                if (reportIdInput) reportIdInput.value = lastActiveId;
            } else {
                // Si no hay ID activo, crear uno nuevo
                if (reportIdInput) reportIdInput.value = generateUUID();
            }

            // Cargar el borrador
            cargarBorrador();
        }
    }

    // 2. Inicializar etiquetas de cliente basadas en lo que se haya cargado
    const clienteInput = document.getElementById('nombreCliente');
    if (clienteInput) {
        updateClientLabels(clienteInput.value);
    }

    // 3. Escuchar cambios en el Número de Reporte para cambiar de borrador (Multi-reporte)
    if (reporteNo) {
        reporteNo.addEventListener('change', function () {
            const nuevoNo = this.value;
            if (!nuevoNo) return;

            console.log(`Cambiando al reporte: ${nuevoNo}`);
            resetFormOnly();
            this.value = nuevoNo;
            cargarBorrador();
        });
    }

    // 6. Escuchar cambios en la Especificación Técnica
    const especNoInput = document.getElementById('especificacionNo');
    if (especNoInput) {
        especNoInput.addEventListener('input', function () {
            updateSpecDisplays(this.value);
            cargarBorrador();
        });
        updateSpecDisplays(especNoInput.value);
    }

    console.log('🏗️ MICSA - Reporte Diario de Obra Digital v1.5.0 listo');
}

// Ejecutar inicialización inmediatamente si el DOM ya está listo, o esperar al evento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ===== Autoguardado cada 2 minutos =====

setInterval(() => {
    const fechaReporte = document.getElementById('fechaReporte').value;
    if (fechaReporte) {
        guardarBorrador();
        console.log('💾 Autoguardado realizado');
    }
}, 120000);

// ===== Confirmación antes de salir =====

window.addEventListener('beforeunload', function (e) {
    const fechaReporte = document.getElementById('fechaReporte').value;
    if (fechaReporte) {
        e.preventDefault();
        e.returnValue = '¿Seguro que deseas salir? Los cambios no guardados se perderán.';
    }
});
