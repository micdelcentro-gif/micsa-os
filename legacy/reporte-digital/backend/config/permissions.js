/**
 * MICSA - Sistema de Permisos
 * 
 * Este archivo centraliza TODOS los permisos disponibles en la aplicación.
 * Para agregar un nuevo permiso, simplemente añádelo a la categoría correspondiente.
 */

const PERMISSIONS = {
    // ===== GESTIÓN DE USUARIOS =====
    USER_MANAGEMENT: {
        MANAGE_USERS: 'manage_users',           // Crear, editar, eliminar usuarios
        MANAGE_PERMISSIONS: 'manage_permissions', // Modificar permisos de usuarios
        VIEW_USERS: 'view_users'                 // Ver lista de usuarios
    },

    // ===== GESTIÓN DE PROYECTOS =====
    PROJECT_MANAGEMENT: {
        CREATE_PROJECTS: 'create_projects',      // Crear nuevos proyectos
        ASSIGN_PROJECTS: 'assign_projects',      // Asignar usuarios a proyectos
        EDIT_PROJECTS: 'edit_projects',          // Editar información de proyectos
        DELETE_PROJECTS: 'delete_projects',      // Eliminar proyectos
        VIEW_ALL_PROJECTS: 'view_all_projects'   // Ver reportes de todos los proyectos
    },

    // ===== MÓDULOS DEL DASHBOARD =====
    MODULES: {
        VIEW_DAILY_REPORT: 'view_daily_report',  // Ver módulo Reporte Diario
        VIEW_PACKING_LIST: 'view_packing_list',  // Ver módulo Packing List
        VIEW_ISO_MATRIX: 'view_iso_matrix',      // Ver Matriz ISO
        VIEW_ISO_GUIDE: 'view_iso_guide',        // Ver Guía ISO
        CREATE_DAILY_REPORT: 'create_daily_report', // Crear reportes diarios
        CREATE_PACKING_LIST: 'create_packing_list'  // Crear packing lists
    },

    // ===== ACCIONES SOBRE REPORTES =====
    REPORTS: {
        EDIT_OWN_REPORTS: 'edit_own_reports',    // Editar sus propios reportes
        EDIT_ALL_REPORTS: 'edit_all_reports',    // Editar cualquier reporte
        DELETE_OWN_REPORTS: 'delete_own_reports', // Eliminar sus propios reportes
        DELETE_ALL_REPORTS: 'delete_all_reports', // Eliminar cualquier reporte
        EXPORT_REPORTS: 'export_reports'         // Exportar reportes a Excel/PDF
    },

    // ===== ADMINISTRACIÓN DEL SISTEMA =====
    SYSTEM: {
        VIEW_ANALYTICS: 'view_analytics',        // Ver estadísticas y métricas
        MANAGE_ISO_PROGRESS: 'manage_iso_progress', // Actualizar progreso ISO
        SYSTEM_SETTINGS: 'system_settings'       // Configuración del sistema
    }

    // NOTA: Para agregar nuevos permisos en el futuro:
    // 1. Crea una nueva categoría o agrégalo a una existente
    // 2. Usa el formato SCREAMING_SNAKE_CASE para la clave
    // 3. El valor debe ser snake_case
    // 4. Actualiza ROLES_PRESETS si es necesario
};

/**
 * Roles Predefinidos con sus permisos
 * Estos son plantillas que facilitan la asignación de permisos comunes
 */
const ROLES_PRESETS = {
    SUPER_ADMIN: {
        name: 'Super Administrador',
        description: 'Acceso total al sistema',
        permissions: [
            // Usuarios
            PERMISSIONS.USER_MANAGEMENT.MANAGE_USERS,
            PERMISSIONS.USER_MANAGEMENT.MANAGE_PERMISSIONS,
            PERMISSIONS.USER_MANAGEMENT.VIEW_USERS,
            
            // Proyectos
            PERMISSIONS.PROJECT_MANAGEMENT.CREATE_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.ASSIGN_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.EDIT_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.DELETE_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.VIEW_ALL_PROJECTS,
            
            // Módulos
            PERMISSIONS.MODULES.VIEW_DAILY_REPORT,
            PERMISSIONS.MODULES.VIEW_PACKING_LIST,
            PERMISSIONS.MODULES.VIEW_ISO_MATRIX,
            PERMISSIONS.MODULES.VIEW_ISO_GUIDE,
            PERMISSIONS.MODULES.CREATE_DAILY_REPORT,
            PERMISSIONS.MODULES.CREATE_PACKING_LIST,
            
            // Reportes
            PERMISSIONS.REPORTS.EDIT_ALL_REPORTS,
            PERMISSIONS.REPORTS.DELETE_ALL_REPORTS,
            PERMISSIONS.REPORTS.EXPORT_REPORTS,
            
            // Sistema
            PERMISSIONS.SYSTEM.VIEW_ANALYTICS,
            PERMISSIONS.SYSTEM.MANAGE_ISO_PROGRESS,
            PERMISSIONS.SYSTEM.SYSTEM_SETTINGS
        ]
    },

    ADMINISTRATIVO: {
        name: 'Administrativo',
        description: 'Gestión de proyectos y visualización completa',
        permissions: [
            // Proyectos
            PERMISSIONS.PROJECT_MANAGEMENT.CREATE_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.ASSIGN_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.EDIT_PROJECTS,
            PERMISSIONS.PROJECT_MANAGEMENT.VIEW_ALL_PROJECTS,
            
            // Módulos
            PERMISSIONS.MODULES.VIEW_DAILY_REPORT,
            PERMISSIONS.MODULES.VIEW_PACKING_LIST,
            PERMISSIONS.MODULES.VIEW_ISO_MATRIX,
            PERMISSIONS.MODULES.VIEW_ISO_GUIDE,
            PERMISSIONS.MODULES.CREATE_DAILY_REPORT,
            PERMISSIONS.MODULES.CREATE_PACKING_LIST,
            
            // Reportes
            PERMISSIONS.REPORTS.EDIT_OWN_REPORTS,
            PERMISSIONS.REPORTS.DELETE_OWN_REPORTS,
            PERMISSIONS.REPORTS.EXPORT_REPORTS,
            
            // Sistema
            PERMISSIONS.SYSTEM.VIEW_ANALYTICS
        ]
    },

    SUPERVISOR: {
        name: 'Supervisor',
        description: 'Acceso limitado a módulos específicos',
        permissions: [
            // Módulos (solo algunos)
            PERMISSIONS.MODULES.VIEW_DAILY_REPORT,
            PERMISSIONS.MODULES.VIEW_PACKING_LIST,
            PERMISSIONS.MODULES.CREATE_DAILY_REPORT,
            PERMISSIONS.MODULES.CREATE_PACKING_LIST,
            
            // Reportes
            PERMISSIONS.REPORTS.EDIT_OWN_REPORTS,
            PERMISSIONS.REPORTS.EXPORT_REPORTS
        ]
    },

    VIEWER: {
        name: 'Visualizador',
        description: 'Solo lectura',
        permissions: [
            PERMISSIONS.MODULES.VIEW_DAILY_REPORT,
            PERMISSIONS.MODULES.VIEW_PACKING_LIST,
            PERMISSIONS.REPORTS.EXPORT_REPORTS
        ]
    }
};

/**
 * Obtiene todos los permisos como un array plano
 */
function getAllPermissions() {
    const allPerms = [];
    Object.values(PERMISSIONS).forEach(category => {
        Object.values(category).forEach(perm => {
            allPerms.push(perm);
        });
    });
    return allPerms;
}

/**
 * Valida si un permiso existe
 */
function isValidPermission(permission) {
    return getAllPermissions().includes(permission);
}

/**
 * Valida si un usuario tiene un permiso específico
 */
function hasPermission(userPermissions, requiredPermission) {
    if (!Array.isArray(userPermissions)) return false;
    return userPermissions.includes(requiredPermission);
}

/**
 * Valida si un usuario tiene TODOS los permisos requeridos
 */
function hasAllPermissions(userPermissions, requiredPermissions) {
    if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.every(perm => userPermissions.includes(perm));
}

/**
 * Valida si un usuario tiene AL MENOS UNO de los permisos requeridos
 */
function hasAnyPermission(userPermissions, requiredPermissions) {
    if (!Array.isArray(userPermissions) || !Array.isArray(requiredPermissions)) return false;
    return requiredPermissions.some(perm => userPermissions.includes(perm));
}

module.exports = {
    PERMISSIONS,
    ROLES_PRESETS,
    getAllPermissions,
    isValidPermission,
    hasPermission,
    hasAllPermissions,
    hasAnyPermission
};
