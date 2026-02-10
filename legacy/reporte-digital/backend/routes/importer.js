const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const xmlParser = require('../services/xmlParser');
const db = require('../database');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/xmls');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// Procesar ZIP de facturas
router.post('/upload-batch', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

    const results = { imported: 0, errors: 0, skipped: 0, entitiesCreated: 0 };
    const tempDir = path.join(__dirname, '../uploads/temp_' + Date.now());

    try {
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const zip = new AdmZip(req.file.path);
        zip.extractAllTo(tempDir, true);

        const files = fs.readdirSync(tempDir);
        const config = await db.getPayrollConfig(); // Para conocer el RFC de la empresa
        const myRFC = config?.rfc;

        for (const file of files) {
            if (!file.toLowerCase().endsWith('.xml')) continue;

            const fullPath = path.join(tempDir, file);
            const data = await xmlParser.parseCFDI(fullPath);

            if (!data || !data.uuid) {
                results.errors++;
                continue;
            }

            // 1. Identificar si es Factura Emitida (Ingreso), Recibida (Egreso/Gasto) o Nómina (N)
            if (data.tipo === 'N') {
                // PROCESAR NÓMINA
                const curp = data.nomina?.['nom12:Receptor']?.Curp || data.nomina?.Receptor?.Curp;
                const rfcEmpleado = data.rfcReceptor;
                const fechaPago = data.nomina?.FechaPago || data.fecha;

                // Buscar empleado por RFC o CURP
                const emp = await new Promise(r => db.get("SELECT id FROM employees WHERE rfc = ? OR curp = ?", [rfcEmpleado, curp], (err, row) => r(row)));

                if (emp) {
                    // Buscar un periodo que coincida con el mes o crear uno genérico "Importados"
                    let periodId = await new Promise(r => db.get("SELECT id FROM payroll_periods WHERE ? BETWEEN start_date AND end_date", [data.fecha.split('T')[0]], (err, row) => r(row?.id)));

                    if (!periodId) {
                        periodId = await db.createPayrollPeriod({
                            name: `Importados ${data.fecha.substring(0, 7)}`,
                            start_date: data.fecha.split('T')[0],
                            end_date: data.fecha.split('T')[0],
                            payment_date: data.fecha.split('T')[0],
                            type: 'O'
                        });
                    }

                    await db.savePayrollReceipt({
                        period_id: periodId,
                        employee_id: emp.id,
                        total_percepciones: data.subtotal,
                        total_deducciones: data.total < data.subtotal ? (data.subtotal - data.total) : 0,
                        total_neto: data.total,
                        data_json: { xml_data: data },
                        status: 'stamped',
                        uuid: data.uuid
                    });
                    results.imported++;
                } else {
                    results.skipped++; // Empleado no encontrado
                }
                continue;
            }

            const isEmitida = data.rfcEmisor === myRFC;
            const targetRFC = isEmitida ? data.rfcReceptor : data.rfcEmisor;
            const targetName = isEmitida ? data.nombreReceptor : data.nombreEmisor;
            const typeEntity = isEmitida ? 'CLIENTE' : 'PROVEEDOR';

            // 2. Asegurar que existe la entidad (Cliente/Proveedor)
            await new Promise((resolve) => {
                db.run(
                    "INSERT OR IGNORE INTO fiscal_entities (type, rfc, name) VALUES (?, ?, ?)",
                    [typeEntity, targetRFC, targetName],
                    function (err) {
                        if (this.changes > 0) results.entitiesCreated++;
                        resolve();
                    }
                );
            });

            // 3. Crear póliza automática (Contalink Style)
            try {
                const date = data.fecha.split('T')[0];
                const concept = `${data.tipo === 'N' ? 'Nómina' : (isEmitida ? 'Ingreso' : 'Egreso')} - ${targetName} - ${data.folio || ''}`;
                const entryType = isEmitida ? 'INGRESO' : (data.tipo === 'N' ? 'EGRESO' : 'EGRESO');

                const lines = [];
                if (data.tipo === 'N') {
                    const accGasto = await db.getAccountIdByCode('502');
                    const accBanco = await db.getAccountIdByCode('102');
                    lines.push({ account_id: accGasto, description: `Gasto Nómina ${targetName}`, debit: data.total, credit: 0 });
                    lines.push({ account_id: accBanco, description: `Pago Nómina ${targetName}`, debit: 0, credit: data.total });
                } else if (isEmitida) {
                    const accCliente = await db.getAccountIdByCode('105');
                    const accIngreso = await db.getAccountIdByCode('401');
                    lines.push({ account_id: accCliente, description: `Venta a ${targetName}`, debit: data.total, credit: 0 });
                    lines.push({ account_id: accIngreso, description: `Ingreso por Ventas`, debit: 0, credit: data.total });
                } else {
                    const accGasto = await db.getAccountIdByCode('501');
                    const accProv = await db.getAccountIdByCode('201');
                    lines.push({ account_id: accGasto, description: `Gasto de ${targetName}`, debit: data.total, credit: 0 });
                    lines.push({ account_id: accProv, description: `Pasivo Proveedor ${targetName}`, debit: 0, credit: data.total });
                }

                if (lines.every(l => l.account_id)) {
                    await db.createJournalEntryWithLines({
                        date,
                        type: entryType,
                        concept,
                        uuid: data.uuid // Crucial para Auditoría
                    }, lines);
                }
            } catch (err) {
                console.error('Error creando póliza automática:', err);
            }

            results.imported++;
        }

        // Limpiar
        fs.rmSync(tempDir, { recursive: true, force: true });
        res.json({ message: 'Procesamiento completado', results });

    } catch (err) {
        console.error('Error procesando ZIP:', err);
        res.status(500).json({ error: err.message });
    }
});

// Procesar desde la carpeta INBOX directamente
router.post('/import-from-inbox', async (req, res) => {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Falta nombre de archivo' });

    const INBOX_DIR = path.join(__dirname, '../../../../inbox_documentos');
    const filePath = path.join(INBOX_DIR, filename);

    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Archivo no encontrado en Inbox' });

    const results = { imported: 0, errors: 0, skipped: 0, entitiesCreated: 0 };
    const tempDir = path.join(__dirname, '../uploads/temp_inbox_' + Date.now());

    try {
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

        const zip = new AdmZip(filePath);
        zip.extractAllTo(tempDir, true);

        const files = [];
        const walk = (d) => {
            fs.readdirSync(d).forEach(f => {
                const p = path.join(d, f);
                if (fs.statSync(p).isDirectory()) walk(p);
                else if (f.toLowerCase().endsWith('.xml')) files.push(p);
            });
        };
        walk(tempDir);

        const config = await db.getPayrollConfig();
        const myRFC = config?.rfc;

        for (const fullPath of files) {
            const data = await xmlParser.parseCFDI(fullPath);
            if (!data || !data.uuid) { results.errors++; continue; }

            if (data.tipo === 'N') {
                const curp = data.nomina?.['nom12:Receptor']?.Curp || data.nomina?.Receptor?.Curp;
                const rfcEmpleado = data.rfcReceptor;
                const emp = await new Promise(r => db.get("SELECT id FROM employees WHERE rfc = ? OR curp = ?", [rfcEmpleado, curp], (err, row) => r(row)));

                if (emp) {
                    let periodId = await new Promise(r => db.get("SELECT id FROM payroll_periods WHERE ? BETWEEN start_date AND end_date", [data.fecha.split('T')[0]], (err, row) => r(row?.id)));
                    if (!periodId) {
                        periodId = await db.createPayrollPeriod({
                            name: `Importados ${data.fecha.substring(0, 7)}`,
                            start_date: data.fecha.split('T')[0],
                            end_date: data.fecha.split('T')[0],
                            payment_date: data.fecha.split('T')[0],
                            type: 'O'
                        });
                    }
                    await db.savePayrollReceipt({
                        period_id: periodId, employee_id: emp.id,
                        total_percepciones: data.subtotal,
                        total_deducciones: data.total < data.subtotal ? (data.subtotal - data.total) : 0,
                        total_neto: data.total,
                        data_json: { xml_data: data }, status: 'stamped', uuid: data.uuid
                    });
                    results.imported++;
                } else { results.skipped++; }
            } else {
                const isEmitida = data.rfcEmisor === myRFC;
                const targetRFC = isEmitida ? data.rfcReceptor : data.rfcEmisor;
                const typeEntity = isEmitida ? 'CLIENTE' : 'PROVEEDOR';
                await new Promise((resolve) => {
                    db.run("INSERT OR IGNORE INTO fiscal_entities (type, rfc, name) VALUES (?, ?, ?)",
                        [typeEntity, targetRFC, isEmitida ? data.nombreReceptor : data.nombreEmisor],
                        function (err) { if (this.changes > 0) results.entitiesCreated++; resolve(); }
                    );
                });
                // 3. Crear póliza automática (Contalink Style)
                try {
                    const date = data.fecha.split('T')[0];
                    const concept = `${isEmitida ? 'Ingreso' : 'Egreso'} - ${isEmitida ? data.nombreReceptor : data.nombreEmisor} - ${data.folio || ''}`;
                    const entryType = isEmitida ? 'INGRESO' : 'EGRESO';

                    const accMain = await db.getAccountIdByCode(isEmitida ? '105' : '501');
                    const accCounter = await db.getAccountIdByCode(isEmitida ? '401' : '201');

                    if (accMain && accCounter) {
                        await db.createJournalEntryWithLines({
                            date,
                            type: entryType,
                            concept,
                            uuid: data.uuid // Crucial para Auditoría
                        }, [
                            { account_id: accMain, description: concept, debit: data.total, credit: 0 },
                            { account_id: accCounter, description: concept, debit: 0, credit: data.total }
                        ]);
                    }
                } catch (err) { console.error('Error en póliza:', err); }

                results.imported++;
            }
        }
        fs.rmSync(tempDir, { recursive: true, force: true });
        res.json({ message: 'Procesamiento de Buzón completado', results });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

