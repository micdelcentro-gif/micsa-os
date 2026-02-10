const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/repse');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const fileName = `${req.body.tipo || 'REPSE'}-${Date.now()}${ext}`;
        cb(null, fileName);
    }
});

const upload = multer({ storage });

// Base Legal
router.get('/legal', authMiddleware, async (req, res) => {
    try {
        const legal = await db.getREPSEBaseLegal();
        res.json(legal);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/legal', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        const { id, documento, fecha_emision, fecha_vencimiento, observaciones } = req.body;
        const data = {
            id: id || null,
            documento,
            fecha_emision,
            fecha_vencimiento,
            observaciones,
            archivo_url: req.file ? `/uploads/repse/${req.file.filename}` : req.body.archivo_url,
            estatus: 'VERDE' // Lógica de validación de fecha aquí
        };

        if (data.fecha_vencimiento && new Date(data.fecha_vencimiento) < new Date()) {
            data.estatus = 'ROJO';
        }

        const newId = await db.saveREPSEBaseLegal(data);
        res.json({ id: newId, estatus: data.estatus });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Periodos
router.get('/periodos', authMiddleware, async (req, res) => {
    try {
        const { anio, periodo } = req.query;
        const periodos = await db.getREPSEPeriodos(anio, periodo);
        res.json(periodos);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/periodos', authMiddleware, upload.fields([{ name: 'archivo' }, { name: 'comprobante' }]), async (req, res) => {
    try {
        const data = {
            ...req.body,
            archivo_url: req.files['archivo'] ? `/uploads/repse/${req.files['archivo'][0].filename}` : null,
            comprobante_pago_url: req.files['comprobante'] ? `/uploads/repse/${req.files['comprobante'][0].filename}` : null,
        };
        const id = await db.saveREPSEPeriodo(data);
        res.json({ id });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Alertas
router.get('/alertas', authMiddleware, async (req, res) => {
    try {
        const alertas = await db.getREPSEAlertas();
        res.json(alertas);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Estatus General (Semáforo)
router.get('/estatus-general', authMiddleware, async (req, res) => {
    try {
        const status = await db.getREPSEGeneralStatus();
        res.json({ status });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Sincronizar desde XMLs (Contalink Automation)
router.post('/sync-xmls', authMiddleware, async (req, res) => {
    try {
        await db.syncREPSEFromPayroll();
        res.json({ message: 'Sincronización de cumplimiento completada' });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
