/**
 * MICSA - Gestión de Usuarios
 * Lógica para administración de cuentas y permisos.
 */

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    // Verificar si el usuario tiene permiso para estar aquí
    if (!requirePermission('manage_users')) return;

    init();
});

async function init() {
    renderPermissionsList();
    await loadProjectsDropdown();
    await loadUsers();

    // Escuchar el submit del formulario
    const form = document.getElementById('userForm');
    if (form) {
        form.addEventListener('submit', saveUser);
    }
}

/**
 * Carga los proyectos para el selector
 */
async function loadProjectsDropdown() {
    try {
        const response = await fetch('/api/projects');
        if (!response.ok) throw new Error('Error al cargar proyectos');

        const projects = await response.json();
        const select = document.getElementById('assigned_project');
        if (!select) return;

        // Limpiar opciones previas manteniendo el default
        select.innerHTML = '<option value="">Sin proyecto asignado</option>';

        projects.forEach(p => {
            if (p.status === 'active') {
                const option = document.createElement('option');
                option.value = p.name; // Usamos el nombre como valor para compatibilidad con la tabla users existente
                option.textContent = p.name;
                select.appendChild(option);
            }
        });
    } catch (err) {
        console.error(err);
    }
}

/**
 * Carga la lista de usuarios desde el backend
 */
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Error al cargar usuarios');

        allUsers = await response.json();
        renderTable(allUsers);
    } catch (err) {
        console.error(err);
        showNotification('❌ No se pudo cargar la lista de usuarios', 'error');
    }
}

/**
 * Renderiza la tabla de usuarios
 */
function renderTable(users) {
    const tbody = document.getElementById('usersBody');
    tbody.innerHTML = '';

    users.forEach(user => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${user.id}</td>
            <td style="font-weight: 500;">${user.username}</td>
            <td><span class="role-badge">${user.role.toUpperCase()}</span></td>
            <td>${user.assigned_project || '<span style="color:var(--text-muted)">N/A</span>'}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="openModal(${user.id})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="deleteUser(${user.id})" style="margin-left: 5px;">Eliminar</button>
            </td>
        `;
    });
}

/**
 * Genera los checkboxes de permisos dinámicamente
 */
function renderPermissionsList() {
    const list = document.getElementById('permissionsList');
    list.innerHTML = '';

    // Iterar por categorías de permisos definidas en permissions.js
    for (const category in PERMISSIONS) {
        const categoryHeader = document.createElement('div');
        categoryHeader.style.cssText = 'grid-column: 1 / -1; margin-top: 10px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 5px; color: var(--accent-color); font-weight: 600; font-size: 0.75rem; text-transform: uppercase;';
        categoryHeader.textContent = category.replace(/_/g, ' ');
        list.appendChild(categoryHeader);

        for (const key in PERMISSIONS[category]) {
            const permValue = PERMISSIONS[category][key];
            const div = document.createElement('div');
            div.className = 'permission-item';
            div.innerHTML = `
                <input type="checkbox" id="perm_${permValue}" value="${permValue}" class="perm-checkbox">
                <label for="perm_${permValue}">${permValue.replace(/_/g, ' ')}</label>
            `;
            list.appendChild(div);
        }
    }
}

/**
 * Abre el modal para crear o editar
 */
async function openModal(userId = null) {
    const modal = document.getElementById('userModal');
    const form = document.getElementById('userForm');
    const title = document.getElementById('modalTitle');
    const passwordNote = document.getElementById('passwordNote');

    form.reset();
    document.getElementById('editUserId').value = userId || '';
    selectAllPermissions(false);

    if (userId) {
        title.textContent = 'Editar Usuario';
        passwordNote.style.display = 'block';
        document.getElementById('password').required = false;

        const user = allUsers.find(u => u.id === userId);
        if (user) {
            document.getElementById('username').value = user.username;
            document.getElementById('role').value = user.role;
            document.getElementById('assigned_project').value = user.assigned_project || '';

            // Marcar permisos del usuario
            if (user.permissions) {
                user.permissions.forEach(perm => {
                    const cb = document.getElementById(`perm_${perm}`);
                    if (cb) cb.checked = true;
                });
            }
        }
    } else {
        title.textContent = 'Nuevo Usuario';
        passwordNote.style.display = 'none';
        document.getElementById('password').required = true;
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('userModal').style.display = 'none';
}

/**
 * Aplica el preset de permisos según el rol seleccionado
 */
function applyRolePreset() {
    const roleValue = document.getElementById('role').value;
    if (!roleValue) return;

    const roleKey = roleValue.toUpperCase();
    const preset = ROLES_PRESETS[roleKey];

    if (preset) {
        selectAllPermissions(false);
        preset.permissions.forEach(perm => {
            const cb = document.getElementById(`perm_${perm}`);
            if (cb) cb.checked = true;
        });
    }
}

function selectAllPermissions(checked) {
    document.querySelectorAll('.perm-checkbox').forEach(cb => cb.checked = checked);
}

/**
 * Guarda o actualiza un usuario
 */
async function saveUser(e) {
    e.preventDefault();

    const userId = document.getElementById('editUserId').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const assigned_project = document.getElementById('assigned_project').value;

    // Obtener permisos seleccionados
    const permissions = Array.from(document.querySelectorAll('.perm-checkbox:checked')).map(cb => cb.value);

    const userData = {
        username,
        role,
        assigned_project,
        permissions
    };

    if (password) userData.password = password;

    try {
        const url = userId ? `/api/users/${userId}` : '/api/users';
        const method = userId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar');
        }

        showNotification(`✅ Usuario ${userId ? 'actualizado' : 'creado'} con éxito`, 'success');
        closeModal();
        await loadUsers();
    } catch (err) {
        console.error(err);
        showNotification(`❌ Error: ${err.message}`, 'error');
    }
}

/**
 * Elimina un usuario
 */
async function deleteUser(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar este usuario permanentemente?')) return;

    try {
        const response = await fetch(`/api/users/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Error al eliminar');

        showNotification('✅ Usuario eliminado', 'success');
        await loadUsers();
    } catch (err) {
        console.error(err);
        showNotification('❌ No se pudo eliminar el usuario', 'error');
    }
}

/**
 * Filtra los usuarios en la tabla
 */
function filterUsers() {
    const query = document.getElementById('userSearch').value.toLowerCase();
    const role = document.getElementById('roleFilter').value;

    const filtered = allUsers.filter(u => {
        const matchQuery = u.username.toLowerCase().includes(query) ||
            (u.assigned_project && u.assigned_project.toLowerCase().includes(query));
        const matchRole = role === 'all' || u.role === role;

        return matchQuery && matchRole;
    });

    renderTable(filtered);
}

// Cerrar modal si se hace clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('userModal');
    if (event.target == modal) {
        closeModal();
    }
}

/**
 * Re-using common notification system (from script.js if available)
 */
function showNotification(message, type = 'info') {
    // Si existe la función global expuesta en algún otro script, usarla.
    if (window.showNotification && window.showNotification !== showNotification) {
        window.showNotification(message, type);
        return;
    }

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
