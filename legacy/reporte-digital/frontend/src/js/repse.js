/**
 * MICSA - Gestión de Cumplimiento REPSE
 */

const DOC_TYPES = {
    'REGISTRO_REPSE': { name: 'Registro REPSE', desc: 'Aviso de registro ante la STPS vigente.' },
    'OPINION_SAT': { name: 'Opinión Positiva SAT', desc: 'Opinión del cumplimiento de obligaciones fiscales.' },
    'OPINION_IMSS': { name: 'Opinión Positiva IMSS', desc: 'Opinión del cumplimiento en materia de seguridad social.' },
    'OPINION_INFONAVIT': { name: 'Opinión INFONAVIT', desc: 'Constancia de situación fiscal de INFONAVIT.' },
    'PAGO_IMSS': { name: 'Cédula de Pago IMSS', desc: 'Comprobante de pago de cuotas obrero-patronales.' },
    'PAGO_ISN': { name: 'Pago ISN', desc: 'Impuesto Sobre Nómina del estado correspondiente.' },
    'SUA': { name: 'Archivo SUA', desc: 'Resumen de autodeterminación del Sistema Único de Autodeterminación.' }
};

let currentProjectId = null;
let currentPeriod = new Date().toISOString().substring(0, 7); // YYYY-MM
let projects = [];
let complianceData = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Establecer periodo actual
    document.getElementById('compliancePeriod').value = currentPeriod;

    // Escuchar cambios de periodo
    document.getElementById('compliancePeriod').addEventListener('change', (e) => {
        currentPeriod = e.target.value;
        loadCompliance();
    });

    // Cargar proyectos y cumplimiento
    await loadProjects();
    await loadCompliance();
});

async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        projects = await response.json();
        renderProjectTabs();
    } catch (err) {
        console.error('Error cargando proyectos:', err);
    }
}

function renderProjectTabs() {
    const tabsContainer = document.getElementById('projectTabs');
    tabsContainer.innerHTML = `<button class="tab-btn ${currentProjectId === null ? 'active' : ''}" onclick="switchProject(null)">Empresa (General)</button>`;

    projects.forEach(p => {
        tabsContainer.innerHTML += `
            <button class="tab-btn ${currentProjectId == p.id ? 'active' : ''}" onclick="switchProject(${p.id})">
                ${p.name}
            </button>
        `;
    });
}

function switchProject(id) {
    currentProjectId = id;
    renderProjectTabs();
    loadCompliance();
}

async function loadCompliance() {
    try {
        const url = `/api/repse/compliance?period=${currentPeriod}${currentProjectId ? `&project_id=${currentProjectId}` : ''}`;
        const response = await fetch(url);
        complianceData = await response.json();
        renderComplianceGrid();
    } catch (err) {
        console.error('Error cargando cumplimiento:', err);
    }
}

function renderComplianceGrid() {
    const grid = document.getElementById('complianceGrid');
    grid.innerHTML = '';

    let validCount = 0;
    const totalDocs = Object.keys(DOC_TYPES).length;

    Object.entries(DOC_TYPES).forEach(([type, info]) => {
        const doc = complianceData.find(d => d.document_type === type);
        const status = doc ? (doc.status || 'valid') : 'missing';
        if (status === 'valid') validCount++;

        const card = document.createElement('div');
        card.className = 'compliance-card';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <h3>
                    <span>${status === 'valid' ? '✅' : status === 'expired' ? '⚠️' : '❌'}</span>
                    ${info.name}
                </h3>
                <span class="compliance-status status-${status}">${status === 'valid' ? 'Válido' : status === 'expired' ? 'Vencido' : 'Pendiente'}</span>
            </div>
            <p class="file-info">${info.desc}</p>
            ${doc ? `
                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px; font-size: 0.85rem;">
                    <div>📄 ${doc.filename}</div>
                    <div style="color: var(--text-muted); margin-top: 4px;">Subido el: ${new Date(doc.uploaded_at).toLocaleDateString()}</div>
                    ${doc.expiry_date ? `<div style="color: ${new Date(doc.expiry_date) < new Date() ? '#ef4444' : 'var(--text-muted)'}">Vence: ${new Date(doc.expiry_date).toLocaleDateString()}</div>` : ''}
                </div>
                <div style="display: flex; gap: 10px; margin-top: auto;">
                    <a href="/uploads/repse/${doc.filename}" target="_blank" class="btn btn-secondary" style="flex: 1; text-align: center; text-decoration: none; padding: 8px;">Ver</a>
                    <button class="btn btn-secondary" style="padding: 8px;" onclick="openUploadModal('${type}')">🔄</button>
                </div>
            ` : `
                <button class="btn btn-primary" style="margin-top: auto;" onclick="openUploadModal('${type}')">Subir Documento</button>
            `}
        `;
        grid.appendChild(card);
    });

    // Actualizar porcentaje
    const percent = Math.round((validCount / totalDocs) * 100);
    document.getElementById('validDocsPercent').textContent = `${percent}%`;
}

// Modal logic
let activeDocType = null;

function openUploadModal(type) {
    activeDocType = type;
    document.getElementById('docLabel').textContent = DOC_TYPES[type].name;
    document.getElementById('docDescription').textContent = DOC_TYPES[type].desc;
    document.getElementById('uploadModal').style.display = 'block';
    document.getElementById('fileNameDisplay').textContent = '';
    document.getElementById('fileInput').value = '';
}

function closeModal() {
    document.getElementById('uploadModal').style.display = 'none';
}

document.getElementById('fileInput').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        document.getElementById('fileNameDisplay').textContent = e.target.files[0].name;
    }
});

document.getElementById('saveDocBtn').onclick = async () => {
    const file = document.getElementById('fileInput').files[0];
    if (!file) {
        alert('Selecciona un archivo primero');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', activeDocType);
    formData.append('period', currentPeriod);
    if (currentProjectId) formData.append('project_id', currentProjectId);

    const expiryDate = document.getElementById('expiryDate').value;
    if (expiryDate) formData.append('expiry_date', expiryDate);

    try {
        const response = await fetch('/api/repse/upload', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            closeModal();
            loadCompliance();
        } else {
            const data = await response.json();
            alert('Error: ' + (data.error || 'No se pudo subir el archivo'));
        }
    } catch (err) {
        console.error('Error subiendo archivo:', err);
    }
};

window.onclick = (event) => {
    if (event.target == document.getElementById('uploadModal')) closeModal();
};
