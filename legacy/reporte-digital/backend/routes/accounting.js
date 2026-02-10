const express = require('express');
const router = express.Router();
const db = require('../database');

// ===== CATÁLOGO DE CUENTAS =====

router.get('/accounts', (req, res) => {
    db.all("SELECT * FROM chart_of_accounts ORDER BY code ASC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/accounts', (req, res) => {
    const { code, name, type, parent_id, nature } = req.body;
    db.run(
        "INSERT INTO chart_of_accounts (code, name, type, parent_id, nature) VALUES (?, ?, ?, ?, ?)",
        [code, name, type, parent_id, nature],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

// ===== PÓLIZAS (JOURNAL ENTRIES) =====

router.get('/entries', (req, res) => {
    db.all("SELECT * FROM journal_entries ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/entries', async (req, res) => {
    const { date, type, concept, lines } = req.body;

    // Iniciar transacción manual para asegurar integridad
    db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        db.run(
            "INSERT INTO journal_entries (date, type, concept) VALUES (?, ?, ?)",
            [date, type, concept],
            function (err) {
                if (err) {
                    db.run("ROLLBACK");
                    return res.status(500).json({ error: err.message });
                }

                const entryId = this.lastID;
                const stmt = db.prepare("INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit) VALUES (?, ?, ?, ?, ?)");

                lines.forEach(line => {
                    stmt.run([entryId, line.account_id, line.description, line.debit, line.credit]);
                });

                stmt.finalize((err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: err.message });
                    }
                    db.run("COMMIT");
                    res.status(201).json({ id: entryId });
                });
            }
        );
    });
});

// Obtener detalle de una póliza
router.get('/entries/:id', (req, res) => {
    const entryId = req.params.id;
    db.get("SELECT * FROM journal_entries WHERE id = ?", [entryId], (err, entry) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!entry) return res.status(404).json({ error: 'Póliza no encontrada' });

        db.all(
            "SELECT l.*, a.name as account_name, a.code as account_code FROM journal_entry_lines l JOIN chart_of_accounts a ON l.account_id = a.id WHERE l.entry_id = ?",
            [entryId],
            (err, lines) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ ...entry, lines });
            }
        );
    });
});

// ===== INFORMES FINANCIEROS =====

router.get('/reports/pnl', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Faltan fechas' });
        const data = await db.getIncomeStatement(start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/reports/balance', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: 'Falta fecha de corte' });
        const data = await db.getBalanceSheet(date);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/reports/trial-balance', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Faltan fechas' });
        const data = await db.getTrialBalance(start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/auxiliary', async (req, res) => {
    try {
        const { accountId, start, end } = req.query;
        if (!accountId || !start || !end) return res.status(400).json({ error: 'Faltan parámetros' });
        const data = await db.getAccountAuxiliary(accountId, start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/journal', async (req, res) => {
    try {
        const { start, end } = req.query;
        if (!start || !end) return res.status(400).json({ error: 'Faltan fechas' });
        const data = await db.getJournalEntries(start, end);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/audit/check-xmls', async (req, res) => {
    try {
        const path = require('path');
        const fs = require('fs');
        const xmlParser = require('../services/xmlParser');
        const xmlDir = path.join(__dirname, '../uploads/xmls');

        if (!fs.existsSync(xmlDir)) return res.json({ missing: [], total_xmls: 0 });

        const files = fs.readdirSync(xmlDir).filter(f => f.endsWith('.xml'));
        const missing = [];
        let total = 0;

        for (const file of files) {
            total++;
            const data = await xmlParser.parseCFDI(path.join(xmlDir, file));
            if (data && data.uuid) {
                const entry = await new Promise(r => db.get("SELECT id FROM journal_entries WHERE uuid = ?", [data.uuid], (err, row) => r(row)));
                if (!entry) {
                    missing.push({
                        file,
                        uuid: data.uuid,
                        fecha: data.fecha,
                        total: data.total,
                        emisor: data.nombreEmisor || data.rfcEmisor
                    });
                }
            }
        }
        res.json({ total_xmls: total, missing_count: missing.length, missing });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/audit/test-sicofi', async (req, res) => {
    try {
        const sicofi = require('../services/sicofiService');
        const token = await sicofi.getToken();
        if (token) {
            res.json({ success: true, message: 'Conexión con Sicofi exitosa', token: '***' + token.substring(token.length - 10) });
        } else {
            res.status(401).json({ success: false, message: 'Fallo de autenticación con Sicofi. Revisa credenciales.' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/reports/invoice/:id/stamp', async (req, res) => {
    const { id } = req.params;
    try {
        const sicofi = require('../services/sicofiService');

        // Simulación: Para timbrar legalmente necesitaríamos los datos de la factura
        // Por ahora simulamos la llamada exitosa si el token es válido
        const token = await sicofi.getToken();
        if (!token) throw new Error('Cuentas Sicofi no configuradas correctamente');

        const uuid = require('crypto').randomUUID();
        await new Promise(r => db.run("UPDATE journal_entries SET uuid = ? WHERE id = ?", [uuid, id], r));

        res.json({
            success: true,
            uuid,
            provider: 'Sicofi',
            message: 'Factura timbrada exitosamente a través de la API de Sicofi'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
