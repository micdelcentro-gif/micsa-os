const express = require('express');
const router = express.Router();
const db = require('../database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');
const payrollCalculator = require('../services/payrollCalculator');
const stampingService = require('../services/stampingService');

// Configuración de Multer para certificados (.cer, .key)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads/certificates');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// ===== CONFIGURACIÓN DE EMPRESA =====

router.get('/config', async (req, res) => {
    try {
        const config = await db.getPayrollConfig();
        res.json(config);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config', async (req, res) => {
    try {
        await db.updatePayrollConfig(req.body);
        res.json({ message: 'Configuración actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config/certificates', upload.fields([
    { name: 'cer', maxCount: 1 },
    { name: 'key', maxCount: 1 }
]), async (req, res) => {
    try {
        const updates = {};
        if (req.files.cer) updates.csd_cer_name = req.files.cer[0].filename;
        if (req.files.key) updates.csd_key_name = req.files.key[0].filename;
        if (req.body.password) updates.csd_password = req.body.password;

        await db.updatePayrollConfig(updates);
        res.json({ message: 'Certificados cargados correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/config/csf', upload.single('csf'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

        const updates = { csf_path: req.file.filename };
        await db.updatePayrollConfig(updates);

        res.json({ message: 'Constancia de Situación Fiscal cargada', filename: req.file.filename });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== PERIODOS DE NÓMINA =====

router.get('/periods', async (req, res) => {
    try {
        const periods = await db.getPayrollPeriods();
        res.json(periods);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/periods', async (req, res) => {
    try {
        const id = await db.createPayrollPeriod(req.body);
        res.status(201).json({ id, message: 'Periodo creado exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===== RECIBOS / PROCESAMIENTO =====

router.get('/periods/:id/receipts', async (req, res) => {
    try {
        const receipts = await db.getPayrollReceipts(req.params.id);
        res.json(receipts);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generar borradores de recibos para un periodo
router.post('/periods/:id/generate', async (req, res) => {
    try {
        const periodId = req.params.id;

        // Obtener detalles del periodo
        const periods = await db.getPayrollPeriods();
        const period = periods.find(p => p.id == periodId);

        if (!period) return res.status(404).json({ error: 'Periodo no encontrado' });

        const employees = await db.getAllEmployees();

        // Calcular días (por ahora fijo 7 para semanal, 15 quincenal)
        const days = period.periodicidad === '02' ? 7 : 15;

        for (const emp of employees) {
            if (!emp.active || !emp.salary) continue;

            const results = payrollCalculator.processReceipt(emp, { days, periodicidad: period.periodicidad });

            await db.savePayrollReceipt({
                period_id: periodId,
                employee_id: emp.id,
                total_percepciones: results.totalPerceptions,
                total_deducciones: results.totalDeductions,
                total_neto: results.netPay,
                data_json: {
                    perceptions: results.perceptions,
                    deductions: results.deductions
                }
            });
        }

        // Actualizar estatus del periodo
        await db.updatePeriodStatus(periodId, 'processed');

        res.json({ message: 'Recibos generados con cálculos de ISR e IMSS' });
    } catch (err) {
        console.error('Error generando nómina:', err);
        res.status(500).json({ error: err.message });
    }
});

// TIMBRADO MASIVO (CONTALINK STYLE)
router.post('/periods/:id/stamp', async (req, res) => {
    try {
        const periodId = req.params.id;
        const config = await db.getPayrollConfig();
        const receipts = await db.getPayrollReceipts(periodId);

        const stamped = [];
        const errors = [];

        for (const r of receipts) {
            if (r.status === 'stamped') continue;

            try {
                // 1. Llamar al servicio de timbrado (PAC)
                const stampingService = require('../services/stampingService');
                const stampResult = await stampingService.stampPayroll(r, config);

                // 2. Guardar resultados en BD
                await db.savePayrollReceipt({
                    ...r,
                    id: r.id,
                    status: 'stamped',
                    uuid: stampResult.uuid,
                    stamped_at: stampResult.fechaTimbrado,
                    data_json: { ...r.data_json, stamp_details: stampResult }
                });

                stamped.push(r.employee_name);
            } catch (err) {
                errors.push(`${r.employee_name}: ${err.message}`);
            }
        }

        if (stamped.length > 0) {
            await db.updatePeriodStatus(periodId, 'stamped');
            await db.syncREPSEFromPayroll();
        }

        res.json({
            message: 'Proceso de timbrado finalizado',
            stampedCount: stamped.length,
            errors: errors
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// TEST REAL STAMPING WITH SICOFI (ONLY FOR TEST)
router.post('/test-sicofi-stamp', async (req, res) => {
    try {
        const sicofi = require('../services/sicofiService');
        const token = await sicofi.getToken();

        if (!token) {
            return res.status(401).json({ success: false, message: 'No se pudo obtener token de Sicofi.' });
        }

        // Mock data para una nómina 4.0 básica
        const mockPayroll = {
            TipoComprobante: 'N',
            Fecha: new Date().toISOString(),
            SubTotal: 1000.00,
            Total: 900.00,
            Receptor: {
                Rfc: 'XAXX010101000', // RFC genérico
                Nombre: 'PUBLICO EN GENERAL',
                UsoCFDI: 'CP01',
                RegimenFiscalReceptor: '616',
                DomicilioFiscalReceptor: '06600'
            },
            Nomina: {
                TipoNomina: 'O',
                FechaPago: new Date().toISOString().split('T')[0],
                FechaInicialPago: new Date().toISOString().split('T')[0],
                FechaFinalPago: new Date().toISOString().split('T')[0],
                NumDiasPagados: 1,
                TotalPercepciones: 1000.00,
                TotalDeducciones: 100.00,
                TotalOtrosPagos: 0
            }
        };

        try {
            // Intentar timbrar (esto fallará en producción sin CSD reales, pero el token validará la conexión)
            // Usamos un endpoint de "Validación" si Sicofi lo tiene, o simplemente intentamos y vemos el error de "Certificados"
            const result = await sicofi.stampPayroll(mockPayroll);
            res.json({ success: true, message: '¡Timbrado exitoso!', data: result });
        } catch (err) {
            // Si el error es sobre CSDs, significa que la API REACCIONÓ y el token funciona
            if (err.response?.data?.mensaje?.includes('Certificado') || err.response?.data?.mensaje?.includes('CSD')) {
                res.json({
                    success: true,
                    message: 'Conexión con Sicofi validada (Token OK)',
                    details: 'La API respondió correctamente pero requiere CSDs reales para sellar el XML final.',
                    api_response: err.response.data
                });
            } else {
                res.status(500).json({ success: false, message: 'Error en la respuesta de Sicofi', error: err.response?.data || err.message });
            }
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
