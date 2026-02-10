const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');
const { authMiddleware, requirePermission } = require('./middleware/auth');
const { PERMISSIONS } = require('./config/permissions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
// Serve static files from the frontend/public directory as root
app.use(express.static(path.join(__dirname, '../frontend/public'), {
    extensions: ['html']
}));

// Serve source files from frontend/src directory under /src path
app.use('/src', express.static(path.join(__dirname, '../frontend/src'), {
    extensions: ['html']
}));

// Servir archivos subidos (certificados, CSF)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const projectsRoutes = require('./routes/projects');
const employeesRoutes = require('./routes/employees');
const payrollRoutes = require('./routes/payroll');
const accountingRoutes = require('./routes/accounting');
const entitiesRoutes = require('./routes/entities');
const importerRoutes = require('./routes/importer');
const inboxRoutes = require('./routes/inbox');
const repseRoutes = require('./routes/repse');

// API Routes - Authentication
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/accounting', accountingRoutes);
app.use('/api/entities', entitiesRoutes);
app.use('/api/importer', importerRoutes);
app.use('/api/inbox', inboxRoutes);
app.use('/api/repse', repseRoutes);

// API Routes
app.get('/api/reports', authMiddleware, async (req, res) => {
    try {
        const reports = await db.getAllReports();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reports', authMiddleware, async (req, res) => {
    try {
        console.log('--- Intentando guardar reporte ---');
        console.log('Data recibida:', JSON.stringify(req.body).substring(0, 100) + '...');
        const id = await db.saveReport(req.body);
        console.log('✅ Guardado exitoso. ID:', id);
        res.status(201).json({ id, message: 'Reporte guardado exitosamente' });
    } catch (err) {
        console.error('❌ Error fatal al guardar:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/check/:internalId', authMiddleware, async (req, res) => {
    try {
        const { internalId } = req.params;
        const reports = await db.getAllReports();
        const exists = reports.some(r => r.internal_id === internalId);
        res.json({ exists });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/reports/:internalId', authMiddleware, requirePermission(PERMISSIONS.REPORTS.DELETE_OWN_REPORTS), async (req, res) => {
    try {
        await db.deleteReport(req.params.internalId);
        res.json({ message: 'Reporte eliminado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/iso-progress', authMiddleware, async (req, res) => {
    try {
        const progress = await db.getISOProgress();
        res.json(progress);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/iso-progress', authMiddleware, requirePermission(PERMISSIONS.SYSTEM.MANAGE_ISO_PROGRESS), async (req, res) => {
    try {
        await db.saveISOProgress(req.body);
        res.json({ message: 'Progreso ISO actualizado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Routes - Quotes/Cotizaciones
app.get('/api/quotes', authMiddleware, async (req, res) => {
    try {
        const quotes = await db.getAllQuotes();
        res.json(quotes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/quotes/:id', authMiddleware, async (req, res) => {
    try {
        const quote = await db.getQuoteById(req.params.id);
        if (!quote) {
            return res.status(404).json({ error: 'Cotización no encontrada' });
        }
        res.json(quote);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/quotes', authMiddleware, async (req, res) => {
    try {
        const id = await db.createQuote(req.body);
        res.status(201).json({ id, message: 'Cotización creada exitosamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/quotes/:id', authMiddleware, async (req, res) => {
    try {
        await db.updateQuote(req.params.id, req.body);
        res.json({ message: 'Cotización actualizada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/quotes/:id', authMiddleware, async (req, res) => {
    try {
        await db.deleteQuote(req.params.id);
        res.json({ message: 'Cotización eliminada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Fallback para SPA: Servir index.html para cualquier ruta no manejada anteriormente
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor MICSA corriendo en http://localhost:${PORT}`);
});
