const express = require('express');
const router = express.Router();
const db = require('../database');
const { authMiddleware, requirePermission } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

// Obtener todos los proyectos
router.get('/', authMiddleware, async (req, res) => {
    try {
        const projects = await db.getAllProjects();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener un proyecto por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const project = await db.getProjectById(req.params.id);
        if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Crear un proyecto
router.post('/', authMiddleware, requirePermission(PERMISSIONS.PROJECT_MANAGEMENT.CREATE_PROJECTS), async (req, res) => {
    try {
        const { name, client, status, description } = req.body;
        if (!name) return res.status(400).json({ error: 'El nombre es obligatorio' });

        // REGLA REPSE: Bloqueo de nuevos proyectos si el estatus general es ROJO
        const repseStatus = await db.getREPSEGeneralStatus();
        if (repseStatus === 'ROJO') {
            return res.status(403).json({
                error: 'BLOQUEO OPERATIVO: No se pueden crear proyectos nuevos hasta que el cumplimiento REPSE esté al día.'
            });
        }

        const id = await db.createProject({ name, client, status, description });
        res.status(201).json({ id, message: 'Proyecto creado exitosamente' });
    } catch (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Ya existe un proyecto con ese nombre' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Actualizar un proyecto
router.put('/:id', authMiddleware, requirePermission(PERMISSIONS.PROJECT_MANAGEMENT.EDIT_PROJECTS), async (req, res) => {
    try {
        await db.updateProject(req.params.id, req.body);
        res.json({ message: 'Proyecto actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un proyecto
router.delete('/:id', authMiddleware, requirePermission(PERMISSIONS.PROJECT_MANAGEMENT.DELETE_PROJECTS), async (req, res) => {
    try {
        await db.deleteProject(req.params.id);
        res.json({ message: 'Proyecto eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
