/**
 * Sistema de Identificación y Etiquetado - Lógica Principal
 * Maneja el autocompletado de categorías y la gestión de la tabla.
 */

// ==========================================
// DEFINICIÓN DE CATEGORÍAS (Base de Conocimiento)
// ==========================================
// ==========================================
// DEFINICIÓN DE CATEGORÍAS (Base de Conocimiento)
// ==========================================
// NOTA: CATEGORIAS_DATA se carga desde src/js/categories-data.js

// ==========================================
// FUNCIONES UI
// ==========================================

// ==========================================
// CARGA DE DATOS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Intentar cargar datos existentes
    cargarSistemaEtiquetado();
});

// La función cargarSistemaEtiquetado ha sido movida abajo para centralizar el GLOBAL_ID


function loadFromLocal(id) {
    const localData = localStorage.getItem(id) || localStorage.getItem('MICSA_TAG_' + id); // Intentar varios patrones
    if (localData) {
        console.log('Datos encontrados en LocalStorage');
        llenarFormulario(JSON.parse(localData));
    }
}

function llenarFormulario(data) {
    if (!data) return;

    // Llenar cabecera
    if (data.proyecto) document.getElementById('nombreProyecto').value = data.proyecto;
    if (data.ubicacion) document.getElementById('ubicacion').value = data.ubicacion;
    if (data.fecha) document.getElementById('fechaCreacion').value = data.fecha;

    // Llenar Tabla
    const tbody = document.querySelector('#etiquetasTable tbody');
    tbody.innerHTML = ''; // Limpiar iniciales

    if (data.etiquetas && Array.isArray(data.etiquetas)) {
        data.etiquetas.forEach(tag => {
            // Reutilizar addEtiquetaRow pero poblando valores
            addEtiquetaRow(tag);
        });
    }
}

// Modificar addEtiquetaRow para aceptar valores opcionales
function addEtiquetaRow(data = null) {
    const tbody = document.querySelector('#etiquetasTable tbody');
    const newRow = tbody.insertRow();

    // Ahora es un formulario de DEFINICIÓN, no de selección.
    // Categoría es un input libre.

    newRow.innerHTML = `
        <td><input type="text" class="input-prefijo" placeholder="XX" style="text-align: center; text-transform: uppercase;"></td>
        <td><input type="text" class="input-categoria" placeholder="Nombre Categoría"></td>
        <td><input type="text" class="input-descripcion" placeholder="Descripción breve"></td>
        <td><input type="text" class="input-formato" placeholder="XX-000"></td>
        <td>
            <input type="color" class="input-color-hex" value="#cccccc" style="width: 100%; height: 30px; cursor: pointer;">
        </td>
        <td><input type="number" class="input-peso" placeholder="0.00" step="0.01" style="text-align: center;"></td>
        <td><input type="text" class="input-dims" placeholder="L x A x H" style="text-align: center;"></td>
        <td><input type="text" class="input-ubicacion" placeholder="Ubicación"></td>
        <td><input type="text" class="input-responsable" placeholder="Responsable"></td>
        <td style="text-align: center;">
            <button type="button" class="btn-delete" onclick="eliminarFila(this)" title="Eliminar">×</button>
        </td>
    `;

    // Si hay datos, poblar
    if (data) {
        newRow.querySelector('.input-prefijo').value = data.prefijo || '';
        newRow.querySelector('.input-categoria').value = data.categoria || '';
        newRow.querySelector('.input-descripcion').value = data.descripcion || '';
        newRow.querySelector('.input-formato').value = data.formato || '';
        newRow.querySelector('.input-color-hex').value = data.colorHex || '#cccccc';
        newRow.querySelector('.input-peso').value = data.peso || '';
        newRow.querySelector('.input-dims').value = data.dims || '';
        newRow.querySelector('.input-ubicacion').value = data.ubicacion || '';
        newRow.querySelector('.input-responsable').value = data.responsable || '';
    }

    // Animación de entrada
    newRow.style.opacity = '0';
    newRow.style.transform = 'translateY(-10px)';
    setTimeout(() => {
        newRow.style.transition = 'all 0.3s ease';
        newRow.style.opacity = '1';
        newRow.style.transform = 'translateY(0)';
    }, 10);

    // Actualizar contador si existe la función
    if (typeof updateCounter === 'function') updateCounter();
}

// ... eliminarFila ...

function eliminarFila(btn) {
    const row = btn.parentNode.parentNode;
    row.style.opacity = '0';
    setTimeout(() => {
        row.remove();
        if (typeof updateCounter === 'function') updateCounter();
    }, 300);
}

// eliminamos autocompletarFila ya que ahora es manual

function limpiarFormulario() {
    if (confirm('¿Borrar todo el formulario?')) {
        document.getElementById('etiquetadoForm').reset();
        document.querySelector('#etiquetasTable tbody').innerHTML = '';
        addEtiquetaRow();
    }
}

// ==========================================
// PERSISTENCIA (LocalStorage / API Mock)
// ==========================================

const GLOBAL_ID = 'MICSA_GLOBAL_LABELING_SYSTEM';

async function guardarSistemaEtiquetado() {
    // Ya no requerimos proyecto
    const rows = [];
    document.querySelectorAll('#etiquetasTable tbody tr').forEach(tr => {
        const cat = tr.querySelector('.input-categoria').value;
        if (cat) {
            rows.push({
                prefijo: tr.querySelector('.input-prefijo').value,
                categoria: cat,
                descripcion: tr.querySelector('.input-descripcion').value,
                formato: tr.querySelector('.input-formato').value,
                colorHex: tr.querySelector('.input-color-hex').value,
                peso: tr.querySelector('.input-peso').value,
                dims: tr.querySelector('.input-dims').value,
                ubicacion: tr.querySelector('.input-ubicacion').value,
                responsable: tr.querySelector('.input-responsable').value
            });
        }
    });

    const data = {
        etiquetas: rows,
        tipo: 'SISTEMA_ETIQUETADO_GLOBAL',
        updatedAt: new Date().toISOString()
    };

    try {
        // Guardar en API (Simulada por index.js backend general)
        // Usamos un ID fijo para que siempre se sobrescriba el global
        const response = await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId: GLOBAL_ID,
                documentType: 'LABELING_SYSTEM',
                generalData: { reporteNo: 'GLOBAL', nombreProyecto: 'General' },
                data: data
            })
        });

        if (response.ok) {
            alert('✅ Sistema de Etiquetado Global actualizado');
        } else {
            throw new Error('Error en el servidor');
        }
    } catch (e) {
        console.error(e);
        // Fallback LocalStorage
        localStorage.setItem(GLOBAL_ID, JSON.stringify(data));
        alert('✅ Guardado en local (General)');
    }
}

// ==========================================
// CARGA DE DATOS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // Intentar cargar datos existentes
    cargarSistemaEtiquetado();
});

async function cargarSistemaEtiquetado() {
    // Siempre cargamos el GLOBAL
    const reportId = GLOBAL_ID;

    try {
        // Intentar cargar del API
        const response = await fetch('/api/reports');
        const reports = await response.json();
        const found = reports.find(r => r.internal_id === reportId || r.reportId === reportId);

        if (found && found.data) {
            console.log('Datos Globales encontrados en servidor');
            llenarFormulario(found.data);
        } else {
            // Intentar LocalStorage
            loadFromLocal(reportId);
        }
    } catch (e) {
        console.error('Error cargando del servidor:', e);
        loadFromLocal(reportId);
    }
}

function loadFromLocal(id) {
    const localData = localStorage.getItem(id);
    if (localData) {
        console.log('Datos Globales encontrados en LocalStorage');
        llenarFormulario(JSON.parse(localData));
    } else {
        // FALLBACK: Cargar defaults de categories-data.js si no hay nada guardado
        console.log('Iniciando con datos por defecto');
        cargarDefaults();
    }
}

function cargarDefaults() {
    const tbody = document.querySelector('#etiquetasTable tbody');
    tbody.innerHTML = '';

    if (typeof CATEGORIAS_DATA !== 'undefined') {
        Object.entries(CATEGORIAS_DATA).forEach(([nombre, data]) => {
            // Adaptar estructura de categories-data.js a la estructura de la fila
            addEtiquetaRow({
                categoria: nombre,
                prefijo: data.prefijo,
                descripcion: data.descripcion,
                formato: data.formato,
                ejemplo: data.ejemplo,
                colorHex: data.colorHex,
                ubicacion: data.ubicacion,
                responsable: data.responsable
            });
        });
    } else {
        addEtiquetaRow(); // Si no hay defaults, fila vacía
    }
    updateCounter();
}

function llenarFormulario(data) {
    if (!data) return;

    // Llenar Tabla
    const tbody = document.querySelector('#etiquetasTable tbody');
    tbody.innerHTML = ''; // Limpiar iniciales

    if (data.etiquetas && Array.isArray(data.etiquetas) && data.etiquetas.length > 0) {
        data.etiquetas.forEach(tag => {
            addEtiquetaRow(tag);
        });
    } else {
        cargarDefaults();
    }
    updateCounter();
}

// ==========================================
// UTILIDADES
// ==========================================

function updateCounter() {
    const count = document.querySelectorAll('#etiquetasTable tbody tr').length;
    let badge = document.getElementById('totalEtiquetasBadge');
    if (!badge) {
        // Crear badge si no existe
        const header = document.querySelector('.section-title');
        if (header) {
            badge = document.createElement('span');
            badge.id = 'totalEtiquetasBadge';
            badge.className = 'badge';
            badge.style.marginLeft = '10px';
            badge.style.fontSize = '0.8rem';
            badge.style.background = 'rgba(0,0,0,0.15)';
            badge.style.color = '#000';
            badge.style.padding = '4px 12px';
            badge.style.borderRadius = '20px';
            badge.style.fontWeight = 'bold';
            header.appendChild(badge);
        }
    }
    if (badge) badge.textContent = `${count} Categorías`;
}

// ==========================================
// IMPORTACIÓN / EXPORTACIÓN EXCEL
// ==========================================

async function importFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Mostrar estado de carga - Selector corregido
    const btn = document.querySelector('button.btn-success') || event.target.previousElementSibling;
    const originalText = btn.innerHTML;
    btn.innerHTML = '⌛ Procesando...';
    btn.disabled = true;

    if (typeof parseExcelPackingList !== 'function') {
        alert('Error: Motor de importación no cargado. Revisa las dependencias en el HTML.');
        btn.innerHTML = originalText;
        btn.disabled = false;
        return;
    }

    try {
        const items = await parseExcelPackingList(file);

        if (items && items.length > 0) {
            // Agrupar por categoría para no saturar el sistema de identificación
            const categoryMap = {};

            items.forEach(item => {
                const descUpper = item.desc ? item.desc.toUpperCase() : '';
                // Intentar extraer una categoría limpia (Primera palabra de la descripción)
                let catName = item.desc ? item.desc.split(' ')[0].toUpperCase() : 'GENERAL';

                // Si el item tiene un tag tipo EQ-001, el prefijo es EQ
                let prefijo = '';
                if (item.tag && item.tag.includes('-')) {
                    prefijo = item.tag.split('-')[0].toUpperCase();
                }

                // REGLAS INTELIGENTES DE COLOR SEGÚN PALABRAS CLAVE
                let colorHex = '#3b82f6'; // Azul por defecto (Equipo)

                if (descUpper.includes('VALVULA') || descUpper.includes('VÁLVULA')) colorHex = '#ef4444'; // Rojo (Seguridad/Control)
                else if (descUpper.includes('TUBERIA') || descUpper.includes('TUBERÍA') || descUpper.includes('TUBO')) colorHex = '#22c55e'; // Verde (Fluido)
                else if (descUpper.includes('MOTOR') || descUpper.includes('BOMBA')) colorHex = '#3b82f6'; // Azul (Potencia)
                else if (descUpper.includes('CABLE') || descUpper.includes('ELECTRICO')) colorHex = '#eab308'; // Amarillo (Eléctrico)
                else if (descUpper.includes('SOPORTE') || descUpper.includes('ESTRUCTURA')) colorHex = '#9ca3af'; // Gris (Estructural)
                else if (descUpper.includes('SENSOR') || descUpper.includes('INSTRUMENTO')) colorHex = '#f97316'; // Naranja (Control)

                if (!categoryMap[catName]) {
                    categoryMap[catName] = {
                        prefijo: prefijo || 'TAG',
                        descripcion: `Categoría inteligente: ${catName}`,
                        formato: prefijo ? `${prefijo}-XXX` : 'TAG-XXX',
                        ejemplo: item.tag || `${prefijo}-001`,
                        colorHex: colorHex,
                        peso: item.weight || '',
                        dims: item.dims || '',
                        ubicacion: 'General',
                        responsable: 'Operativo'
                    };
                }
            });

            const uniqueCategories = Object.keys(categoryMap);

            if (confirm(`Se detectaron ${items.length} ítems agrupados en ${uniqueCategories.length} categorías únicas. ¿Deseas IMPORTAR e IMPLEMENTAR este sistema ahora mismo?`)) {
                const tbody = document.querySelector('#etiquetasTable tbody');
                tbody.innerHTML = '';

                uniqueCategories.forEach(catName => {
                    const data = categoryMap[catName];
                    addEtiquetaRow({
                        prefijo: data.prefijo,
                        categoria: catName,
                        descripcion: data.descripcion,
                        formato: data.formato,
                        colorHex: data.colorHex,
                        peso: data.peso,
                        dims: data.dims,
                        ubicacion: data.ubicacion,
                        responsable: data.responsable
                    });
                });

                // IMPLEMENTACIÓN AUTOMÁTICA: Guardar en el servidor inmediatamente
                await guardarSistemaEtiquetado();

                alert(`✅ SISTEMA IMPLEMENTADO: Se han generado y activado ${uniqueCategories.length} categorías de etiquetado.`);
            }
        } else {
            alert('⚠️ No se encontraron datos válidos en el archivo. Asegúrate de que el Excel tenga columnas como "CODIGO" y "DESCRIPCION".');
        }
    } catch (err) {
        console.error('Error en Importación:', err);
        alert('❌ Error al procesar el archivo Excel. Revisa el formato.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        event.target.value = ''; // Resetear input
    }
}

function exportToExcel() {
    try {
        const rows = [];
        document.querySelectorAll('#etiquetasTable tbody tr').forEach(tr => {
            rows.push({
                tag: tr.querySelector('.input-formato').value || tr.querySelector('.input-prefijo').value,
                desc: tr.querySelector('.input-descripcion').value || tr.querySelector('.input-categoria').value,
                qty: 1,
                serialNumber: '-',
                weight: 0,
                dims: '-',
                condition: 'Nuevo',
                obs: tr.querySelector('.input-ubicacion').value
            });
        });

        const meta = {
            proyecto: 'Sistema de Etiquetado Global',
            cliente: 'MICSA',
            fecha: new Date().toLocaleDateString(),
            totalPeso: 0
        };

        if (typeof generateExcelPackingList === 'function') {
            generateExcelPackingList(meta, rows, []);
        } else {
            alert('Error: Motor de exportación no cargado');
        }
    } catch (e) {
        console.error(e);
        alert('❌ Error al exportar');
    }
}
