/**
 * MICSA - Rutas de Gestión de Usuarios
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database');
const { authMiddleware, requirePermission, requireSuperAdmin } = require('../middleware/auth');
const { PERMISSIONS, isValidPermission } = require('../config/permissions');

/**
 * GET /api/users
 * Listar todos los usuarios (requiere permiso)
 */
router.get('/', authMiddleware, requirePermission(PERMISSIONS.USER_MANAGEMENT.VIEW_USERS), async (req, res) => {
    try {
        const users = await db.getAllUsers();
        res.json(users);
    } catch (err) {
        console.error('Error listando usuarios:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * POST /api/users
 * Crear nuevo usuario (solo Super Admin)
 */
router.post('/', authMiddleware, requirePermission(PERMISSIONS.USER_MANAGEMENT.MANAGE_USERS), async (req, res) => {
    try {
        const { username, password, role, assigned_project, permissions } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }
        
        // Validar permisos
        if (permissions && !Array.isArray(permissions)) {
            return res.status(400).json({ error: 'Permisos deben ser un array' });
        }
        
        // Hash de contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const userId = await db.createUser({
            username,
            password: hashedPassword,
            role: role || 'user',
            assigned_project,
            permissions: permissions || []
        });
        
        res.status(201).json({ 
            message: 'Usuario creado exitosamente',
            userId 
        });
        
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'El usuario ya existe' });
        }
        console.error('Error creando usuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * PUT /api/users/:id
 * Actualizar usuario (requiere permiso)
 */
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.USER_MANAGEMENT.MANAGE_USERS), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const updates = {};
        
        if (req.body.role) updates.role = req.body.role;
        if (req.body.assigned_project !== undefined) updates.assigned_project = req.body.assigned_project;
        if (req.body.permissions) updates.permissions = req.body.permissions;
        if (req.body.password) {
            updates.password = await bcrypt.hash(req.body.password, 10);
        }
        
        await db.updateUser(userId, updates);
        
        res.json({ message: 'Usuario actualizado exitosamente' });
        
    } catch (err) {
        console.error('Error actualizando usuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * PUT /api/users/:id/assign-project
 * Asignar/Desasignar proyecto a un usuario
 */
router.put('/:id/assign-project', authMiddleware, requirePermission(PERMISSIONS.PROJECT_MANAGEMENT.ASSIGN_PROJECTS), async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        const { project } = req.body;
        
        await db.updateUser(userId, { assigned_project: project || null });
        
        res.json({ 
            message: project ? 'Proyecto asignado exitosamente' : 'Proyecto desasignado exitosamente'
        });
        
    } catch (err) {
        console.error('Error asignando proyecto:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * DELETE /api/users/:id
 * Eliminar usuario (solo Super Admin)
 */
router.delete('/:id', authMiddleware, requireSuperAdmin, async (req, res) => {
    try {
        const userId = parseInt(req.params.id);
        
        // No permitir eliminar el usuario admin principal
        if (userId === 1) {
            return res.status(403).json({ error: 'No se puede eliminar el usuario admin principal' });
        }
        
        await db.deleteUser(userId);
        
        res.json({ message: 'Usuario eliminado exitosamente' });
        
    } catch (err) {
        console.error('Error eliminando usuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;
