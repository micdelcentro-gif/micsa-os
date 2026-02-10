const express = require('express');
const router = express.Router();
const db = require('../database');

router.get('/', (req, res) => {
    const { type } = req.query;
    let query = "SELECT * FROM fiscal_entities";
    let params = [];

    if (type) {
        query += " WHERE type = ?";
        params.push(type.toUpperCase());
    }

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    const { type, rfc, name, tax_regimen, email, phone, address } = req.body;
    db.run(
        "INSERT INTO fiscal_entities (type, rfc, name, tax_regimen, email, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [type.toUpperCase(), rfc, name, tax_regimen, email, phone, address],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ id: this.lastID });
        }
    );
});

router.get('/:id', (req, res) => {
    db.get("SELECT * FROM fiscal_entities WHERE id = ?", [req.params.id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Entidad no encontrada' });
        res.json(row);
    });
});

router.put('/:id', (req, res) => {
    const { name, tax_regimen, email, phone, address } = req.body;
    db.run(
        "UPDATE fiscal_entities SET name = ?, tax_regimen = ?, email = ?, phone = ?, address = ? WHERE id = ?",
        [name, tax_regimen, email, phone, address, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Actualizado correctamente' });
        }
    );
});

module.exports = router;
