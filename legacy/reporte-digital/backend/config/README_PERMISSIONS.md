# 📋 Sistema de Permisos - MICSA

## 📁 Estructura de Archivos

```
backend/config/
  └── permissions.js       # Configuración central de permisos (Backend)

frontend/src/js/
  └── permissions.js       # Helper de permisos (Frontend)
```

## 🔐 ¿Cómo Funciona?

El sistema de permisos es **granular** y **escalable**. Cada usuario tiene un array de permisos que determina qué puede hacer en la aplicación.

### Ejemplo de Usuario:
```json
{
  "id": 5,
  "username": "jose",
  "role": "supervisor",
  "assigned_project": "Proyecto XXX",
  "permissions": [
    "view_daily_report",
    "view_packing_list",
    "create_daily_report"
  ]
}
```

## ➕ Cómo Agregar un Nuevo Permiso

### 1. Backend (`backend/config/permissions.js`)

Agrega el permiso en la categoría correspondiente:

```javascript
const PERMISSIONS = {
    MODULES: {
        VIEW_DAILY_REPORT: 'view_daily_report',
        VIEW_PACKING_LIST: 'view_packing_list',
        // ⬇️ NUEVO PERMISO
        VIEW_INVENTORY: 'view_inventory'
    }
};
```

### 2. Frontend (`frontend/src/js/permissions.js`)

**Copia exactamente** el mismo permiso:

```javascript
const PERMISSIONS = {
    MODULES: {
        VIEW_DAILY_REPORT: 'view_daily_report',
        VIEW_PACKING_LIST: 'view_packing_list',
        // ⬇️ NUEVO PERMISO
        VIEW_INVENTORY: 'view_inventory'
    }
};
```

### 3. Usar el Permiso en el Frontend

#### Opción A: Ocultar elementos HTML
```html
<!-- Solo visible si tiene el permiso -->
<a href="/inventory.html" data-permission="view_inventory">
    Ver Inventario
</a>
```

#### Opción B: Validar en JavaScript
```javascript
if (hasPermission(PERMISSIONS.MODULES.VIEW_INVENTORY)) {
    // Mostrar módulo de inventario
}
```

### 4. Proteger Rutas en el Backend

```javascript
// En tu endpoint
app.get('/api/inventory', authMiddleware, (req, res) => {
    if (!hasPermission(req.user.permissions, PERMISSIONS.MODULES.VIEW_INVENTORY)) {
        return res.status(403).json({ error: 'Sin permisos' });
    }
    // ... lógica del endpoint
});
```

## 🎭 Roles Predefinidos

Los roles son **plantillas** que facilitan asignar permisos comunes:

| Rol | Descripción | Permisos Típicos |
|-----|-------------|------------------|
| `SUPER_ADMIN` | Acceso total | Todos los permisos |
| `ADMINISTRATIVO` | Gestión de proyectos | Crear proyectos, ver todo |
| `SUPERVISOR` | Acceso limitado | Ver/crear reportes de su proyecto |
| `VIEWER` | Solo lectura | Ver reportes |

### Usar un Rol Predefinido:
```javascript
const { ROLES_PRESETS } = require('./config/permissions');

// Crear usuario con rol predefinido
const newUser = {
    username: 'daniel',
    role: 'administrativo',
    permissions: ROLES_PRESETS.ADMINISTRATIVO.permissions
};
```

## 🛡️ Validación de Permisos

### Backend:
```javascript
const { hasPermission, hasAllPermissions } = require('./config/permissions');

// Verificar UN permiso
if (hasPermission(user.permissions, 'create_projects')) {
    // Permitir crear proyecto
}

// Verificar VARIOS permisos
if (hasAllPermissions(user.permissions, ['create_projects', 'assign_projects'])) {
    // Permitir acción compleja
}
```

### Frontend:
```javascript
// Verificar permiso
if (hasPermission('view_packing_list')) {
    // Mostrar módulo
}

// Verificar si es admin
if (isSuperAdmin()) {
    // Mostrar panel de administración
}
```

## 📝 Categorías de Permisos

| Categoría | Propósito |
|-----------|-----------|
| `USER_MANAGEMENT` | Gestión de usuarios |
| `PROJECT_MANAGEMENT` | Gestión de proyectos |
| `MODULES` | Acceso a módulos del dashboard |
| `REPORTS` | Acciones sobre reportes |
| `SYSTEM` | Configuración del sistema |

## ⚠️ Importante

1. **Sincronización**: Los permisos en `backend/config/permissions.js` y `frontend/src/js/permissions.js` **DEBEN** estar sincronizados.
2. **Seguridad**: La validación en el frontend es solo UX. **SIEMPRE** valida permisos en el backend.
3. **Naming**: Usa `snake_case` para los valores de permisos (`view_daily_report`).

## 🚀 Ejemplo Completo

### 1. Agregar permiso "Exportar a CSV"
```javascript
// backend/config/permissions.js
REPORTS: {
    EXPORT_CSV: 'export_csv'  // ⬅️ Nuevo
}
```

### 2. Proteger el endpoint
```javascript
app.get('/api/reports/export-csv', authMiddleware, (req, res) => {
    if (!hasPermission(req.user.permissions, PERMISSIONS.REPORTS.EXPORT_CSV)) {
        return res.status(403).json({ error: 'Sin permisos para exportar CSV' });
    }
    // ... generar CSV
});
```

### 3. Ocultar botón en el frontend
```html
<button data-permission="export_csv" onclick="exportCSV()">
    📊 Exportar CSV
</button>
```

¡Listo! El sistema es escalable y fácil de mantener. 🎉
