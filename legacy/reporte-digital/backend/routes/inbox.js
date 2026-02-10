const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const INBOX_DIR = path.join(__dirname, '../../../../inbox_documentos');

router.get('/files', (req, res) => {
    try {
        if (!fs.existsSync(INBOX_DIR)) {
            return res.json([]);
        }
        const files = fs.readdirSync(INBOX_DIR);
        const fileList = files.map(file => {
            const stats = fs.statSync(path.join(INBOX_DIR, file));
            return {
                name: file,
                size: stats.size,
                isDir: stats.isDirectory(),
                mtime: stats.mtime
            };
        }).filter(f => !f.name.startsWith('.'));

        res.json(fileList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
