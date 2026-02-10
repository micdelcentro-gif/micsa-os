/**
 * MICSA - Sistema de Permisos (Frontend)
 * 
 * Versión del cliente del sistema de permisos.
 * Debe mantenerse sincronizado con backend/config/permissions.js
 */

const PERMISSIONS = {
    // ===== GESTIÓN DE USUARIOS =====
    USER_MANAGEMENT: {
        MANAGE_USERS: 'manage_users',
        MANAGE_PERMISSIONS: 'manage_permissions',
        VIEW_USERS: 'view_users'
    },

    // ===== GESTIÓN DE PROYECTOS =====
    PROJECT_MANAGEMENT: {
        CREATE_PROJECTS: 'create_projects',
        ASSIGN_PROJECTS: 'assign_projects',
        EDIT_PROJECTS: 'edit_projects',
        DELETE_PROJECTS: 'delete_projects',
        VIEW_ALL_PROJECTS: 'view_all_projects'
    },

    // ===== MÓDULOS DEL DASHBOARD =====
    MODULES: {
        VIEW_DAILY_REPORT: 'view_daily_report',
        VIEW_PACKING_LIST: 'view_packing_list',
        VIEW_ISO_MATRIX: 'view_iso_matrix',
        VIEW_ISO_GUIDE: 'view_iso_guide',
        CREATE_DAILY_REPORT: 'create_daily_report',
        CREATE_PACKING_LIST: 'create_packing_list'
    },

    // ===== ACCIONES SOBRE REPORTES =====
    REPORTS: {
        EDIT_OWN_REPORTS: 'edit_own_reports',
        EDIT_ALL_REPORTS: 'edit_all_reports',
        DELETE_OWN_REPORTS: 'delete_own_reports',
        DELETE_ALL_REPORTS: 'delete_all_reports',
        EXPORT_REPORTS: 'export_reports'
    },

    // ===== ADMINISTRACIÓN DEL SISTEMA =====
    SYSTEM: {
        VIEW_ANALYTICS: 'view_analytics',
        MANAGE_ISO_PROGRESS: 'manage_iso_progress',
        SYSTEM_SETTINGS: 'system_settings'
    }
};

const ROLES_PRESETS = {
    SUPER_ADMIN: {
        permissions: [
            'manage_users', 'manage_permissions', 'view_users',
            'create_projects', 'assign_projects', 'edit_projects', 'delete_projects', 'view_all_projects',
            'view_daily_report', 'view_packing_list', 'view_iso_matrix', 'view_iso_guide', 'create_daily_report', 'create_packing_list',
            'edit_all_reports', 'delete_all_reports', 'export_reports',
            'view_analytics', 'manage_iso_progress', 'system_settings'
        ]
    },
    ADMINISTRATIVO: {
        permissions: [
            'create_projects', 'assign_projects', 'edit_projects', 'view_all_projects',
            'view_daily_report', 'view_packing_list', 'view_iso_matrix', 'view_iso_guide', 'create_daily_report', 'create_packing_list',
            'edit_own_reports', 'delete_own_reports', 'export_reports',
            'view_analytics'
        ]
    },
    SUPERVISOR: {
        permissions: [
            'view_daily_report', 'view_packing_list', 'create_daily_report', 'create_packing_list',
            'edit_own_reports', 'export_reports'
        ]
    },
    VIEWER: {
        permissions: [
            'view_daily_report', 'view_packing_list', 'export_reports'
        ]
    }
};

/**
 * Obtiene el usuario actual desde el token JWT almacenado
 */
function getCurrentUser() {
    const token = localStorage.getItem('MICSA_AUTH_TOKEN');
    if (!token) return null;

    try {
        // Decodificar JWT (sin verificar, solo para leer el payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    } catch (err) {
        console.error('Error decodificando token:', err);
        return null;
    }
}

/**
 * Verifica si el usuario actual tiene un permiso específico
 */
function hasPermission(requiredPermission) {
    const user = getCurrentUser();
    if (!user || !user.permissions) return false;
    return user.permissions.includes(requiredPermission);
}

/**
 * Verifica si el usuario tiene TODOS los permisos requeridos
 */
function hasAllPermissions(requiredPermissions) {
    const user = getCurrentUser();
    if (!user || !user.permissions) return false;
    return requiredPermissions.every(perm => user.permissions.includes(perm));
}

/**
 * Verifica si el usuario tiene AL MENOS UNO de los permisos
 */
function hasAnyPermission(requiredPermissions) {
    const user = getCurrentUser();
    if (!user || !user.permissions) return false;
    return requiredPermissions.some(perm => user.permissions.includes(perm));
}

/**
 * Verifica si el usuario es Super Admin
 */
function isSuperAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'super_admin';
}

/**
 * Oculta/Muestra elementos del DOM según permisos
 * Uso: <div data-permission="view_packing_list">...</div>
 */
function applyPermissionsToDOM() {
    const user = getCurrentUser();
    if (!user) return;

    // Ocultar elementos que requieren permisos específicos
    document.querySelectorAll('[data-permission]').forEach(element => {
        const requiredPerm = element.getAttribute('data-permission');
        if (!hasPermission(requiredPerm)) {
            element.style.display = 'none';
        }
    });

    // Ocultar elementos que requieren TODOS los permisos listados
    document.querySelectorAll('[data-permissions-all]').forEach(element => {
        const requiredPerms = element.getAttribute('data-permissions-all').split(',');
        if (!hasAllPermissions(requiredPerms)) {
            element.style.display = 'none';
        }
    });

    // Ocultar elementos que requieren AL MENOS UNO de los permisos
    document.querySelectorAll('[data-permissions-any]').forEach(element => {
        const requiredPerms = element.getAttribute('data-permissions-any').split(',');
        if (!hasAnyPermission(requiredPerms)) {
            element.style.display = 'none';
        }
    });
}

/**
 * Redirige al login si no hay sesión activa
 */
function requireAuth() {
    const user = getCurrentUser();
    if (!user) {
        window.location.href = '/src/pages/login.html';
        return false;
    }
    return true;
}

/**
 * Redirige si el usuario NO tiene el permiso requerido
 */
function requirePermission(permission) {
    if (!requireAuth()) return false;

    if (!hasPermission(permission)) {
        alert('No tienes permisos para acceder a esta sección');
        window.location.href = '/index.html';
        return false;
    }
    return true;
}

// Auto-aplicar permisos al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    applyPermissionsToDOM();
});
