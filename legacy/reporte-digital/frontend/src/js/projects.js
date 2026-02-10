/**
 * MICSA - Gestión de Proyectos
 * Lógica para administración de obras y servicios centralizados.
 */

let allProjects = [];
let allEmployees = [];

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario tiene permiso para estar aquí
    // Usamos manage_users como proxy para administración general por ahora,
    // o podríamos usar view_all_projects si existiera en permissions.js
    if (!requireAuth()) return;

    init();
});

async function init() {
    await loadProjects();
    await loadEmployees();

    // Filtro de búsqueda de empleados en el modal
    const empSearch = document.getElementById('employeeSearch');
    if (empSearch) {
        empSearch.addEventListener('input', () => renderPersonnelList(empSearch.value));
    }

    // Escuchar el submit del formulario
    const form = document.getElementById('projectForm');
    if (form) {
        form.addEventListener('submit', saveProject);
    }
}

/**
 * Carga la lista de proyectos desde el backend
 */
async function loadProjects() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Error al cargar proyectos');

        allProjects = await response.json();
        renderTable(allProjects);
    } catch (err) {
        console.error(err);
        showNotification('❌ No se pudo cargar la lista de proyectos', 'error');
    }
}

/**
 * Carga todos los empleados para asignación
 */
async function loadEmployees() {
    try {
        const response = await fetch('/api/employees');
        if (response.ok) allEmployees = await response.json();
    } catch (err) {
        console.error('Error cargando empleados:', err);
    }
}

/**
 * Renderiza la lista de empleados en el modal
 */
function renderPersonnelList(query = '') {
    const container = document.getElementById('personnelList');
    if (!container) return;

    const currentProjectId = document.getElementById('editProjectId').value;
    const q = query.toLowerCase();

    const filtered = allEmployees.filter(e =>
        e.name.toLowerCase().includes(q) ||
        (e.position && e.position.toLowerCase().includes(q))
    );

    container.innerHTML = filtered.map(e => {
        // Marcamos como checked si YA pertenece a este proyecto
        const isAssigned = currentProjectId && e.project_id == currentProjectId;
        return `
            <div class="personnel-item">
                <input type="checkbox" id="emp_${e.id}" value="${e.id}" ${isAssigned ? 'checked' : ''}>
                <label for="emp_${e.id}">
                    <span>${e.name}</span>
                    <span style="color: var(--text-muted); font-size: 0.75rem;">${e.position || ''}</span>
                </label>
            </div>
        `;
    }).join('');
}

/**
 * Renderiza la tabla de proyectos
 */
function renderTable(projects) {
    const tbody = document.getElementById('projectsBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    projects.forEach(project => {
        const row = tbody.insertRow();
        const date = project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A';

        row.innerHTML = `
            <td style="font-weight: 500;">${project.name}</td>
            <td>${project.client || '<span style="color:var(--text-muted)">N/A</span>'}</td>
            <td><span class="status-badge status-${project.status}">${project.status.toUpperCase()}</span></td>
            <td>${date}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openModal(${project.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteProject(${project.id})" style="margin-left: 5px;">Eliminar</button>
            </td>
        `;
    });
}

/**
 * Abre el modal para crear o editar
 */
async function openModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('modalTitle');

    if (!modal || !form) return;

    form.reset();
    document.getElementById('editProjectId').value = projectId || '';

    if (projectId) {
        title.textContent = 'Editar Proyecto';
        const project = allProjects.find(p => p.id === projectId);
        if (project) {
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectClient').value = project.client || '';
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectDescription').value = project.description || '';
        }
    } else {
        title.textContent = 'Nuevo Proyecto';
    }

    renderPersonnelList();
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('projectModal');
    if (modal) modal.style.display = 'none';
}

/**
 * Guarda o actualiza un proyecto
 */
async function saveProject(e) {
    e.preventDefault();

    const projectId = document.getElementById('editProjectId').value;
    const name = document.getElementById('projectName').value;
    const client = document.getElementById('projectClient').value;
    const status = document.getElementById('projectStatus').value;
    const description = document.getElementById('projectDescription').value;

    const projectData = {
        name,
        client,
        status,
        description
    };

    try {
        const url = projectId ? `/api/projects/${projectId}` : '/api/projects';
        const method = projectId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(projectData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar');
        }

        const result = await response.json();
        const savedProjectId = projectId || result.id;

        // Guardar asignación de personal
        await savePersonnelAssignments(savedProjectId);

        showNotification(`✅ Proyecto ${projectId ? 'actualizado' : 'creado'} con éxito`, 'success');
        closeModal();
        await loadProjects();
        await loadEmployees(); // Recargar empleados para ver sus nuevos project_ids
    } catch (err) {
        console.error(err);
        showNotification(`❌ Error: ${err.message}`, 'error');
    }
}

/**
 * Asigna los empleados seleccionados al proyecto
 */
async function savePersonnelAssignments(projectId) {
    const container = document.getElementById('personnelList');
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    // Identificar quiénes deben estar asignados
    for (const cb of checkboxes) {
        const empId = cb.value;
        const employee = allEmployees.find(e => e.id == empId);

        // Si estaba asignado a este proyecto y ahora no -> quitarle el project_id
        // Si no estaba y ahora sí -> ponerle el project_id
        // (Para simplificar, mandaremos un PUT por cada cambio o uno general si el backend lo soporta)

        const currentlyAssigned = employee.project_id == projectId;
        const shouldBeAssigned = cb.checked;

        if (shouldBeAssigned && !currentlyAssigned) {
            await fetch(`/api/employees/${empId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: projectId })
            });
        } else if (!shouldBeAssigned && currentlyAssigned) {
            await fetch(`/api/employees/${empId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ project_id: null })
            });
        }
    }
}

/**
 * Elimina un proyecto
 */
async function deleteProject(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto? Los reportes asociados podrían quedar huérfanos.')) return;

    try {
        const response = await fetch(`/api/projects/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');

        showNotification('✅ Proyecto eliminado', 'success');
        await loadProjects();
    } catch (err) {
        console.error(err);
        showNotification('❌ No se pudo eliminar el proyecto', 'error');
    }
}

/**
 * Filtra los proyectos en la tabla
 */
function filterProjects() {
    const query = document.getElementById('projectSearch').value.toLowerCase();
    const status = document.getElementById('statusFilter').value;

    const filtered = allProjects.filter(p => {
        const matchQuery = p.name.toLowerCase().includes(query) ||
            (p.client && p.client.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query));
        const matchStatus = status === 'all' || p.status === status;

        return matchQuery && matchStatus;
    });

    renderTable(filtered);
}

// Cerrar modal si se hace clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('projectModal');
    if (event.target == modal) {
        closeModal();
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 16px 24px; border-radius: 10px;
        font-size: 0.95rem; font-weight: 500; z-index: 10000; animation: slideIn 0.3s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5); color: white;
        background: ${type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#3b82f6')};
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
