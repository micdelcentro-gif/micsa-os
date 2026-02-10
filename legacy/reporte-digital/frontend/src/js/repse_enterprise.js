/**
 * MICSA OS - REPSE Enterprise Logic
 * "El sistema manda. La gente no decide si cumple."
 */

let globalStatus = 'VERDE';

document.addEventListener('DOMContentLoaded', async () => {
    await refreshDashboard();
    initSelectors();
});

async function refreshDashboard() {
    try {
        const response = await fetch('/api/repse/estatus-general');
        const data = await response.json();
        globalStatus = data.status || 'VERDE';

        updateSemaforoUI(globalStatus);
        await loadDashboardStats();
        await loadFiscalMatrix();

        document.getElementById('lastUpdate').textContent = `Actualizado: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error('Error refreshing dashboard:', err);
    }
}

async function loadFiscalMatrix() {
    const tbody = document.getElementById('fiscalMatrixBody');
    if (!tbody) return;

    const obligations = [
        { label: 'ISR Sueldos y Salarios', key: 'ISR sueldos', type: 'MENSUAL' },
        { label: 'IVA Retenciones', key: 'IVA', type: 'MENSUAL' },
        { label: 'Cuotas Patronales IMSS', key: 'IMSS', type: 'MENSUAL' },
        { label: 'RCV e Infonavit', key: 'RCV', type: 'BIMESTRAL' },
        { label: 'Opinión de Cumplimiento SAT', key: 'Opinión SAT', type: 'MENSUAL' },
        { label: 'CFDI de Nómina (Timbrado)', key: 'CFDI nómina', type: 'MENSUAL' }
    ];

    try {
        const year = new Date().getFullYear();
        const response = await fetch(`/api/repse/periodos?anio=${year}`);
        const periodos = await response.json();

        tbody.innerHTML = '';

        obligations.forEach(ob => {
            const doc = periodos.find(p => p.tipo_documento === ob.key);
            const status = doc ? doc.estatus : 'ROJO';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${ob.label}</strong><br><small style="color:var(--text-muted)">${ob.type}</small></td>
                <td style="text-align: center;">
                    <span class="status-pill pill-${status.toLowerCase()}">${status}</span>
                </td>
                <td>${doc ? (doc.created_at || 'Reciente') : 'Pendiente'}</td>
                <td>${doc ? (doc.observaciones || 'Validado por sistema') : '<span style="color:var(--rojo-micsa)">Documentación incompleta</span>'}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error('Error loading matrix:', err);
    }
}

function updateSemaforoUI(status) {
    const semaforo = document.getElementById('mainSemaforo');
    const semaforoText = document.getElementById('semaforoText');
    const blockingNotice = document.getElementById('blockingNotice');

    semaforo.className = 'semaforo';

    if (status === 'VERDE') {
        semaforo.classList.add('semaforo-verde');
        semaforo.innerHTML = '🟢';
        semaforoText.textContent = 'OPERABLE';
        semaforoText.style.color = 'var(--verde-micsa)';
        blockingNotice.classList.add('hidden');
    } else if (status === 'AMARILLO') {
        semaforo.classList.add('semaforo-amarillo');
        semaforo.innerHTML = '🟡';
        semaforoText.textContent = 'RIESGO';
        semaforoText.style.color = 'var(--amarillo-micsa)';
        blockingNotice.classList.add('hidden');
    } else {
        semaforo.classList.add('semaforo-rojo');
        semaforo.innerHTML = '🔴';
        semaforoText.textContent = 'BLOQUEADO';
        semaforoText.style.color = 'var(--rojo-micsa)';
        blockingNotice.classList.remove('hidden');
    }
}

async function loadDashboardStats() {
    // Aquí cargarías counts reales de la BD
    document.getElementById('percentCompliance').textContent = '25%';
    document.getElementById('blockedCount').textContent = globalStatus === 'ROJO' ? '1' : '0';
}

function showSubmodule(viewId) {
    // Hide all
    document.querySelectorAll('.submodule-view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.repse-menu-item').forEach(m => m.classList.remove('active'));

    // Show one
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    // Find menu item and set active
    const menuItems = document.querySelectorAll('.repse-menu-item');
    menuItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(viewId.replace('-', ' '))) {
            item.classList.add('active');
        }
    });

    if (viewId === 'base-legal') loadBaseLegal();
    if (viewId === 'cumplimiento') loadCumplimiento();
}

async function loadBaseLegal() {
    const list = document.getElementById('baseLegalList');
    list.innerHTML = '<p>Cargando documentos...</p>';

    try {
        const response = await fetch('/api/repse/legal');
        const docs = await response.json();

        if (docs.length === 0) {
            list.innerHTML = '<p style="text-align:center; padding: 40px; color: var(--text-muted);">No hay documentos registrados aún.</p>';
            return;
        }

        list.innerHTML = '';
        docs.forEach(doc => {
            const card = document.createElement('div');
            card.className = 'legal-doc-card';
            card.innerHTML = `
                <div>
                    <h4 style="margin-bottom: 5px;">${doc.documento}</h4>
                    <small style="color: var(--text-muted);">Vence: ${doc.fecha_vencimiento || 'N/A'}</small>
                </div>
                <div>
                    <span class="status-pill pill-${doc.estatus.toLowerCase()}">${doc.estatus}</span>
                </div>
                <div style="display: flex; gap: 10px;">
                    <a href="${doc.archivo_url}" target="_blank" class="btn btn-secondary" style="padding: 8px 15px;">Ver PDF</a>
                    <button class="btn btn-secondary" style="padding: 8px 15px;" onclick="editLegal(${doc.id})">Editar</button>
                </div>
            `;
            list.appendChild(card);
        });
    } catch (err) {
        list.innerHTML = '<p>Error al cargar documentos.</p>';
    }
}

function openLegalModal() {
    document.getElementById('legalModal').style.display = 'block';
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

document.getElementById('legalForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Añadir campos manuales que no están por defecto
    formData.append('documento', document.getElementById('legalDocType').value);
    formData.append('fecha_emision', document.getElementById('legalFechaEmision').value);
    formData.append('fecha_vencimiento', document.getElementById('legalFechaVencimiento').value);
    formData.append('file', document.getElementById('legalFile').files[0]);

    try {
        const response = await fetch('/api/repse/legal', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            closeModal();
            loadBaseLegal();
            refreshDashboard();
        } else {
            alert('Error al guardar documento');
        }
    } catch (err) {
        console.error('Error saving legal:', err);
    }
};

async function loadCumplimiento() {
    const list = document.getElementById('periodosList');
    if (!list) return;
    list.innerHTML = '<p>Cargando periodos...</p>';

    try {
        const year = document.getElementById('periodYear').value;
        const response = await fetch(`/api/repse/periodos?anio=${year}`);
        const periodos = await response.json();

        const docsNeeded = ['IMSS', 'RCV', 'INFONAVIT', 'ISR sueldos', 'IVA', 'Opinión SAT', 'CFDI nómina', 'Lista asistencia'];

        list.innerHTML = '';
        const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

        for (let m = 0; m < 12; m++) {
            const monthCard = document.createElement('div');
            monthCard.className = 'repse-kpi-card';
            monthCard.style.textAlign = 'left';
            monthCard.style.marginBottom = '20px';

            const monthDocs = periodos.filter(p => p.mes === (m + 1));
            const completedCount = monthDocs.length;
            const statusColor = completedCount === docsNeeded.length ? 'var(--verde-micsa)' : (completedCount > 0 ? 'var(--amarillo-micsa)' : 'var(--text-muted)');

            monthCard.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <h3 style="color: ${statusColor};">${months[m]} ${year}</h3>
                    <span class="status-pill ${completedCount === docsNeeded.length ? 'pill-verde' : 'pill-amarillo'}">${completedCount}/${docsNeeded.length} Docs</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    ${docsNeeded.map(doc => {
                const d = monthDocs.find(md => md.tipo_documento === doc);
                return `
                            <div style="padding: 10px; border: 1px solid var(--card-border); border-radius: 8px; font-size: 0.75rem; background: ${d ? 'rgba(16,185,129,0.1)' : 'transparent'}; opacity: ${d ? 1 : 0.5};">
                                ${doc} ${d ? '✅' : '❌'}
                            </div>
                        `;
            }).join('')}
                </div>
            `;
            list.appendChild(monthCard);
        }
    } catch (err) {
        list.innerHTML = '<p>Error al cargar periodos.</p>';
    }
}

function initSelectors() {
    const yearSel = document.getElementById('periodYear');

    if (yearSel) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 2024; i--) {
            const opt = document.createElement('option');
            opt.value = i; opt.textContent = i;
            yearSel.appendChild(opt);
        }
        yearSel.addEventListener('change', loadCumplimiento);
    }
}

async function syncWithContalink() {
    try {
        const response = await fetch('/api/repse/sync-xmls', { method: 'POST' });
        const result = await response.json();
        alert(result.message || 'Sincronización completada');
        await refreshDashboard();
        if (document.getElementById('view-cumplimiento').classList.contains('hidden') === false) {
            loadCumplimiento();
        }
    } catch (err) {
        console.error('Error en sincronización:', err);
        alert('Error al sincronizar con el motor Contalink');
    }
}

window.onclick = (e) => {
    if (e.target.className === 'modal') closeModal();
};
