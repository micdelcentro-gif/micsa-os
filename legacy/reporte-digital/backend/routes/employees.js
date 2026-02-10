const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/documents');
        // Asegurar que el directorio existe
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Nombre único: timestamp-nombreOriginal
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos (opcional, por ahora permitimos todo)
const fileFilter = (req, file, cb) => {
    // Aceptar cualquier archivo por ahora
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Límite de 10MB
    },
    fileFilter: fileFilter
});

// ===== RUTAS DE EMPLEADOS =====

// Obtener todos los empleados (con soporte para filtrado por proyecto)
router.get('/', async (req, res) => {
    try {
        const { project_id } = req.query;
        let employees;

        if (project_id) {
            employees = await db.getEmployeesByProject(project_id);
        } else {
            employees = await db.getAllEmployees();
        }

        res.json(employees);
    } catch (err) {
        console.error('Error al obtener empleados:', err);
        res.status(500).json({ error: 'Error al obtener la lista de empleados' });
    }
});

// Obtener un empleado por ID
router.get('/:id', async (req, res) => {
    try {
        const employee = await db.getEmployeeById(req.params.id);
        if (!employee) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.json(employee);
    } catch (err) {
        console.error('Error al obtener empleado:', err);
        res.status(500).json({ error: 'Error al obtener detalles del empleado' });
    }
});

// Crear un nuevo empleado
router.post('/', async (req, res) => {
    try {
        const id = await db.createEmployee(req.body);
        res.status(201).json({ id, message: 'Empleado registrado exitosamente' });
    } catch (err) {
        console.error('Error al crear empleado:', err);
        res.status(500).json({ error: 'Error al registrar el empleado' });
    }
});

// Actualizar un empleado
router.put('/:id', async (req, res) => {
    try {
        await db.updateEmployee(req.params.id, req.body);
        res.json({ message: 'Empleado actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar empleado:', err);
        res.status(500).json({ error: 'Error al actualizar información del empleado' });
    }
});

// Eliminar un empleado (soft delete o físico, aquí físico según db helper)
router.delete('/:id', async (req, res) => {
    try {
        await db.deleteEmployee(req.params.id);
        res.json({ message: 'Empleado eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar empleado:', err);
        res.status(500).json({ error: 'Error al eliminar el empleado' });
    }
});

// ===== RUTAS DE DOCUMENTOS =====

// Listar documentos de un empleado
router.get('/:id/documents', async (req, res) => {
    try {
        const documents = await db.getEmployeeDocuments(req.params.id);
        res.json(documents);
    } catch (err) {
        console.error('Error al obtener documentos:', err);
        res.status(500).json({ error: 'Error al obtener documentos del empleado' });
    }
});

// Subir un documento para un empleado
router.post('/:id/documents', upload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se ha seleccionado ningún archivo' });
        }

        const employeeId = req.params.id;
        const documentType = req.body.documentType || 'OTROS';

        const docData = {
            employee_id: employeeId,
            document_type: documentType,
            filename: req.file.filename,
            original_name: req.file.originalname,
            file_path: req.file.path
        };

        const docId = await db.addEmployeeDocument(docData);

        res.status(201).json({
            id: docId,
            message: 'Documento subido exitosamente',
            file: {
                filename: req.file.filename,
                original_name: req.file.originalname
            }
        });

    } catch (err) {
        console.error('Error al subir documento:', err);
        res.status(500).json({ error: 'Error al procesar la subida del documento' });
    }
});

// Descargar/Ver un documento
router.get('/documents/:id/download', async (req, res) => {
    try {
        const doc = await db.getDocumentById(req.params.id);

        if (!doc) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        const filePath = path.join(__dirname, '../uploads/documents', doc.filename);

        if (fs.existsSync(filePath)) {
            res.download(filePath, doc.original_name);
        } else {
            res.status(404).json({ error: 'El archivo físico no existe' });
        }

    } catch (err) {
        console.error('Error al descargar documento:', err);
        res.status(500).json({ error: 'Error al intentar descargar el documento' });
    }
});

// Eliminar un documento
router.delete('/documents/:id', async (req, res) => {
    try {
        const doc = await db.getDocumentById(req.params.id);

        if (!doc) {
            return res.status(404).json({ error: 'Documento no encontrado' });
        }

        // Eliminar archivo físico
        const filePath = path.join(__dirname, '../uploads/documents', doc.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Eliminar registro en BD
        await db.deleteEmployeeDocument(req.params.id);

        res.json({ message: 'Documento eliminado correctamente' });

    } catch (err) {
        console.error('Error al eliminar documento:', err);
        res.status(500).json({ error: 'Error al eliminar el documento' });
    }
});

module.exports = router;
