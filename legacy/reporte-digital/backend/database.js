const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database', 'micsa.db');

// Asegurar que la carpeta database existe
if (!fs.existsSync(path.join(__dirname, 'database'))) {
    fs.mkdirSync(path.join(__dirname, 'database'));
}

// Mover definición de dbHelpers arriba para evitar ReferenceError
const dbHelpers = {
    // Métodos genéricos para compatibilidad (se llenarán después de crear db)
};

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('📦 Conectado a la base de datos SQLite');
        initDb();
    }
});

// Asignar métodos después de que db exista
dbHelpers.get = (...args) => db.get(...args);
dbHelpers.all = (...args) => db.all(...args);
dbHelpers.run = (...args) => db.run(...args);
dbHelpers.db = db;

function initDb() {
    db.serialize(() => {
        // Tabla de Reportes - Actualizada con document_type
        db.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            internal_id TEXT UNIQUE,
            report_no TEXT,
            document_type TEXT DEFAULT 'DAILY_REPORT',
            data TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Asegurar que la columna existe si la tabla ya estaba creada
            db.run(`ALTER TABLE reports ADD COLUMN document_type TEXT DEFAULT 'DAILY_REPORT'`, (err) => {
                // Ignorar error si la columna ya existe
            });
        });

        // Tabla de Progreso ISO
        db.run(`CREATE TABLE IF NOT EXISTS iso_progress (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            percentage INTEGER DEFAULT 0,
            checklist_data TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Inicializar progreso si no existe
        db.run(`INSERT OR IGNORE INTO iso_progress (id, percentage, checklist_data) VALUES (1, 0, '[]')`);

        // Tabla de Usuarios
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            assigned_project TEXT,
            permissions TEXT DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            // Crear usuario admin por defecto si no existe
            const bcrypt = require('bcryptjs');
            const defaultPassword = bcrypt.hashSync('admin123', 10);
            const { ROLES_PRESETS } = require('./config/permissions');

            db.run(`INSERT OR IGNORE INTO users (username, password, role, permissions) VALUES (?, ?, ?, ?)`,
                ['admin', defaultPassword, 'super_admin', JSON.stringify(ROLES_PRESETS.SUPER_ADMIN.permissions)],
                (err) => {
                    if (err) {
                        console.error('Error creando usuario admin:', err);
                    } else {
                        console.log('✅ Usuario admin por defecto creado (admin/admin123)');
                    }
                }
            );
        });

        // Tabla de Proyectos
        db.run(`CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            client TEXT,
            status TEXT DEFAULT 'active',
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabla de Cotizaciones
        db.run(`CREATE TABLE IF NOT EXISTS quotes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quote_number TEXT UNIQUE NOT NULL,
            client_name TEXT NOT NULL,
            project_name TEXT NOT NULL,
            data TEXT,
            total_amount REAL,
            created_by TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabla de Empleados
        db.run(`CREATE TABLE IF NOT EXISTS employees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            position TEXT,
            rfc TEXT,
            nss TEXT,
            curp TEXT,
            phone TEXT,
            email TEXT,
            emergency_contact TEXT,
            active INTEGER DEFAULT 1,
            project_id INTEGER,
            salary REAL,
            bank TEXT,
            account_info TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(project_id) REFERENCES projects(id)
        )`);

        // Tabla de Documentos de Empleados
        db.run(`CREATE TABLE IF NOT EXISTS employee_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            employee_id INTEGER NOT NULL,
            document_type TEXT NOT NULL,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            file_path TEXT NOT NULL,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(employee_id) REFERENCES employees(id) ON DELETE CASCADE
        )`);

        // Tabla de Configuración de Nómina / Empresa
        db.run(`CREATE TABLE IF NOT EXISTS payroll_config (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            rfc TEXT,
            business_name TEXT,
            regimen_fiscal TEXT,
            registro_patronal TEXT,
            cp TEXT,
            pac_username TEXT,
            pac_password TEXT,
            csd_cer_name TEXT,
            csd_key_name TEXT,
            csd_password TEXT,
            csf_path TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabla de Periodos de Nómina
        db.run(`CREATE TABLE IF NOT EXISTS payroll_periods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            payment_date DATE NOT NULL,
            type TEXT NOT NULL DEFAULT 'O', -- O: Ordinaria, E: Extraordinaria
            periodicidad TEXT DEFAULT '02', -- 02: Semanal, 04: Quincenal
            status TEXT DEFAULT 'open', -- open, processed, stamped, closed
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Tabla de Recibos de Nómina
        db.run(`CREATE TABLE IF NOT EXISTS payroll_receipts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            period_id INTEGER NOT NULL,
            employee_id INTEGER NOT NULL,
            uuid TEXT, -- UUID del SAT una vez timbrado
            xml_path TEXT,
            pdf_path TEXT,
            total_percepciones REAL,
            total_deducciones REAL,
            total_neto REAL,
            status TEXT DEFAULT 'draft', -- draft, stamped, cancelled
            stamped_at DATETIME,
            data_json TEXT, -- Detalle de percepciones/deducciones
            FOREIGN KEY(period_id) REFERENCES payroll_periods(id),
            FOREIGN KEY(employee_id) REFERENCES employees(id)
        )`);

        // Inicializar config si no existe
        db.run(`INSERT OR IGNORE INTO payroll_config (id) VALUES (1)`);

        // ===== MÓDULO DE CONTABILIDAD (REPLICA CONTALINK) =====

        // Catálogo de Cuentas
        db.run(`CREATE TABLE IF NOT EXISTS chart_of_accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            code TEXT UNIQUE NOT NULL, -- Código contable (ej. 101.01)
            name TEXT NOT NULL,
            type TEXT NOT NULL, -- ACTIVO, PASIVO, CAPITAL, INGRESO, EGRESO
            level INTEGER DEFAULT 1,
            parent_id INTEGER,
            nature TEXT, -- DEUDORA, ACREEDORA
            FOREIGN KEY(parent_id) REFERENCES chart_of_accounts(id)
        )`);

        // Tabla de Pólizas Contables (Libro Diario)
        db.run(`CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date DATE NOT NULL,
            type TEXT NOT NULL, -- INGRESO, EGRESO, DIARIO
            concept TEXT NOT NULL,
            number TEXT, -- Folio de la póliza
            uuid TEXT UNIQUE, -- UUID del XML relacionado (para Auditoría)
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, () => {
            db.run(`ALTER TABLE journal_entries ADD COLUMN uuid TEXT`, (err) => { });
        });

        // Partidas de Póliza (Journal Entry Lines)
        db.run(`CREATE TABLE IF NOT EXISTS journal_entry_lines (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            account_id INTEGER NOT NULL,
            description TEXT,
            debit REAL DEFAULT 0,
            credit REAL DEFAULT 0,
            FOREIGN KEY(entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
            FOREIGN KEY(account_id) REFERENCES chart_of_accounts(id)
        )`);

        // ===== MÓDULO CRM / FISCAL (CLIENTES Y PROVEEDORES) =====
        db.run(`CREATE TABLE IF NOT EXISTS fiscal_entities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL, -- CLIENTE, PROVEEDOR
            rfc TEXT UNIQUE,
            name TEXT NOT NULL,
            tax_regimen TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // ===== MÓDULO REPSE (CUMPLIMIENTO ENTERPRISE) =====

        // A) Base legal (documentos de la empresa)
        db.run(`CREATE TABLE IF NOT EXISTS repse_base_legal (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            documento TEXT NOT NULL, -- Constancia REPSE, Acta, etc.
            archivo_url TEXT,
            fecha_emision DATE,
            fecha_vencimiento DATE,
            estatus TEXT DEFAULT 'VERDE', -- VERDE, AMARILLO, ROJO
            responsable_id INTEGER,
            observaciones TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // B) Periodos REPSE (cumplimiento mensual/bimestral)
        db.run(`CREATE TABLE IF NOT EXISTS repse_periodos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            anio INTEGER NOT NULL,
            periodo TEXT NOT NULL, -- MENSUAL, BIMESTRAL
            mes INTEGER,
            tipo_documento TEXT NOT NULL, -- IMSS, RCV, etc.
            archivo_url TEXT,
            comprobante_pago_url TEXT,
            monto REAL,
            fecha_pago DATE,
            estatus TEXT DEFAULT 'VERDE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // C) Alertas y Bloqueos
        db.run(`CREATE TABLE IF NOT EXISTS repse_alertas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tipo TEXT NOT NULL, -- VENCIMIENTO, FALTA_PAGO, etc.
            nivel TEXT NOT NULL, -- VERDE, AMARILLO, ROJO
            fecha DATE NOT NULL,
            accion TEXT NOT NULL, -- AVISO, BLOQUEO
            referencia_id INTEGER, -- ID del documento o periodo
            tabla_referencia TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Modificar tabla de empleados para incluir campos REPSE si no existen
        db.run(`ALTER TABLE employees ADD COLUMN imss_activo INTEGER DEFAULT 1`, (err) => { });
        db.run(`ALTER TABLE employees ADD COLUMN estatus_repse TEXT DEFAULT 'VERDE'`, (err) => { });

        // Modificar tabla de proyectos para incluir campos REPSE
        db.run(`ALTER TABLE projects ADD COLUMN requiere_repse INTEGER DEFAULT 0`, (err) => { });
        db.run(`ALTER TABLE projects ADD COLUMN orden_compra TEXT`, (err) => { });
        db.run(`ALTER TABLE projects ADD COLUMN actividad_repse TEXT`, (err) => { });
        db.run(`ALTER TABLE projects ADD COLUMN estatus_repse TEXT DEFAULT 'VERDE'`, (err) => { });

        // SEED: Catálogo de Cuentas Básico
        const seedAccounts = [
            ['101', 'Caja y Efectivo', 'ACTIVO', 'DEUDORA'],
            ['102', 'Bancos', 'ACTIVO', 'DEUDORA'],
            ['105', 'Clientes', 'ACTIVO', 'DEUDORA'],
            ['201', 'Proveedores', 'PASIVO', 'ACREEDORA'],
            ['401', 'Ingresos por Ventas', 'INGRESO', 'ACREEDORA'],
            ['501', 'Gastos Generales', 'EGRESO', 'DEUDORA'],
            ['502', 'Gastos de Nómina', 'EGRESO', 'DEUDORA']
        ];

        seedAccounts.forEach(acc => {
            db.run("INSERT OR IGNORE INTO chart_of_accounts (code, name, type, nature) VALUES (?, ?, ?, ?)", acc);
        });
    });
}

// Ya definido arriba, solo extendemos
Object.assign(dbHelpers, {
    getAllReports: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM reports ORDER BY created_at DESC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => ({ ...row, data: JSON.parse(row.data) })));
            });
        });
    },

    saveReport: (reportData) => {
        return new Promise((resolve, reject) => {
            const dataStr = JSON.stringify(reportData);
            const reportNo = reportData.generalData?.reporteNo || 'N/A';
            const internalId = reportData.reportId || `ID-${Date.now()}`;
            const documentType = reportData.documentType || 'DAILY_REPORT';

            db.run(
                `INSERT INTO reports (internal_id, report_no, document_type, data) VALUES (?, ?, ?, ?) 
                 ON CONFLICT(internal_id) DO UPDATE SET report_no = ?, document_type = ?, data = ?, updated_at = CURRENT_TIMESTAMP`,
                [internalId, reportNo, documentType, dataStr, reportNo, documentType, dataStr],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    deleteReport: (internalId) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM reports WHERE internal_id = ?", [internalId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    getISOProgress: () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM iso_progress WHERE id = 1", [], (err, row) => {
                if (err) reject(err);
                if (row) row.checklist_data = JSON.parse(row.checklist_data);
                resolve(row);
            });
        });
    },

    saveISOProgress: (progressData) => {
        return new Promise((resolve, reject) => {
            const checklistStr = JSON.stringify(progressData.checklist || []);
            db.run(
                `UPDATE iso_progress SET percentage = ?, checklist_data = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1`,
                [progressData.percentage, checklistStr],
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    },

    // ===== GESTIÓN DE USUARIOS =====
    getAllUsers: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT id, username, role, assigned_project, permissions, created_at FROM users", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => ({ ...row, permissions: JSON.parse(row.permissions) })));
            });
        });
    },

    getUserByUsername: (username) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
                if (err) reject(err);
                if (row) row.permissions = JSON.parse(row.permissions);
                resolve(row);
            });
        });
    },

    createUser: (userData) => {
        return new Promise((resolve, reject) => {
            const { username, password, role, assigned_project, permissions } = userData;
            const permissionsStr = JSON.stringify(permissions || []);

            db.run(
                `INSERT INTO users (username, password, role, assigned_project, permissions) VALUES (?, ?, ?, ?, ?)`,
                [username, password, role, assigned_project || null, permissionsStr],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    updateUser: (userId, updates) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            if (updates.role !== undefined) {
                fields.push('role = ?');
                values.push(updates.role);
            }
            if (updates.assigned_project !== undefined) {
                fields.push('assigned_project = ?');
                values.push(updates.assigned_project);
            }
            if (updates.permissions !== undefined) {
                fields.push('permissions = ?');
                values.push(JSON.stringify(updates.permissions));
            }
            if (updates.password !== undefined) {
                fields.push('password = ?');
                values.push(updates.password);
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(userId);

            db.run(
                `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    },

    deleteUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM users WHERE id = ?", [userId], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    // ===== GESTIÓN DE PROYECTOS =====
    getAllProjects: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM projects ORDER BY name ASC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getProjectById: (id) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM projects WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    createProject: (projectData) => {
        return new Promise((resolve, reject) => {
            const { name, client, status, description } = projectData;
            db.run(
                `INSERT INTO projects (name, client, status, description) VALUES (?, ?, ?, ?)`,
                [name, client, status || 'active', description || null],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    updateProject: (id, updates) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            if (updates.name !== undefined) {
                fields.push('name = ?');
                values.push(updates.name);
            }
            if (updates.client !== undefined) {
                fields.push('client = ?');
                values.push(updates.client);
            }
            if (updates.status !== undefined) {
                fields.push('status = ?');
                values.push(updates.status);
            }
            if (updates.description !== undefined) {
                fields.push('description = ?');
                values.push(updates.description);
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            db.run(
                `UPDATE projects SET ${fields.join(', ')} WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    },

    deleteProject: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM projects WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    // ===== GESTIÓN DE COTIZACIONES =====
    getAllQuotes: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM quotes ORDER BY created_at DESC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows.map(row => ({ ...row, data: JSON.parse(row.data) })));
            });
        });
    },

    getQuoteById: (id) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM quotes WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                if (row) row.data = JSON.parse(row.data);
                resolve(row);
            });
        });
    },

    createQuote: (quoteData) => {
        return new Promise((resolve, reject) => {
            const { quote_number, client_name, project_name, data, total_amount, created_by } = quoteData;
            const dataStr = JSON.stringify(data);

            db.run(
                `INSERT INTO quotes (quote_number, client_name, project_name, data, total_amount, created_by) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [quote_number, client_name, project_name, dataStr, total_amount, created_by || null],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    updateQuote: (id, updates) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            if (updates.client_name !== undefined) {
                fields.push('client_name = ?');
                values.push(updates.client_name);
            }
            if (updates.project_name !== undefined) {
                fields.push('project_name = ?');
                values.push(updates.project_name);
            }
            if (updates.data !== undefined) {
                fields.push('data = ?');
                values.push(JSON.stringify(updates.data));
            }
            if (updates.total_amount !== undefined) {
                fields.push('total_amount = ?');
                values.push(updates.total_amount);
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            db.run(
                `UPDATE quotes SET ${fields.join(', ')} WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    },

    deleteQuote: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM quotes WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    // ===== GESTIÓN DE EMPLEADOS =====
    getAllEmployees: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM employees ORDER BY name ASC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getEmployeesByProject: (projectId) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM employees WHERE project_id = ? ORDER BY name ASC", [projectId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getEmployeeById: (id) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM employees WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    createEmployee: (employeeData) => {
        return new Promise((resolve, reject) => {
            const { name, position, rfc, nss, curp, phone, email, emergency_contact } = employeeData;
            db.run(
                `INSERT INTO employees (name, position, rfc, nss, curp, phone, email, emergency_contact) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [name, position, rfc, nss, curp, phone, email, emergency_contact],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    updateEmployee: (id, updates) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            const allowedUpdates = ['name', 'position', 'rfc', 'nss', 'curp', 'phone', 'email', 'emergency_contact', 'active', 'project_id', 'salary', 'bank', 'account_info'];

            allowedUpdates.forEach(field => {
                if (updates[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(updates[field]);
                }
            });

            if (fields.length === 0) return resolve();

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            db.run(
                `UPDATE employees SET ${fields.join(', ')} WHERE id = ?`,
                values,
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    },

    deleteEmployee: (id) => {
        return new Promise((resolve, reject) => {
            db.run("DELETE FROM employees WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    // ===== GESTIÓN DE DOCUMENTOS DE EMPLEADOS =====
    getEmployeeDocuments: (employeeId) => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM employee_documents WHERE employee_id = ? ORDER BY upload_date DESC", [employeeId], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    addEmployeeDocument: (docData) => {
        return new Promise((resolve, reject) => {
            const { employee_id, document_type, filename, original_name, file_path } = docData;
            db.run(
                `INSERT INTO employee_documents (employee_id, document_type, filename, original_name, file_path) 
                 VALUES (?, ?, ?, ?, ?)`,
                [employee_id, document_type, filename, original_name, file_path],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    deleteEmployeeDocument: (id) => {
        return new Promise((resolve, reject) => {
            // Primero obtenemos el archivo para saber qué borrar del disco (manejado en la ruta)
            db.run("DELETE FROM employee_documents WHERE id = ?", [id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    getDocumentById: (id) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM employee_documents WHERE id = ?", [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    // ===== GESTIÓN DE NÓMINA =====
    getPayrollConfig: () => {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM payroll_config WHERE id = 1", [], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    },

    updatePayrollConfig: (updates) => {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];
            const allowed = [
                'rfc', 'business_name', 'regimen_fiscal', 'registro_patronal',
                'cp', 'pac_username', 'pac_password', 'csd_cer_name',
                'csd_key_name', 'csd_password', 'csf_path'
            ];

            allowed.forEach(f => {
                if (updates[f] !== undefined) {
                    fields.push(`${f} = ?`);
                    values.push(updates[f]);
                }
            });

            fields.push('updated_at = CURRENT_TIMESTAMP');

            db.run(`UPDATE payroll_config SET ${fields.join(', ')} WHERE id = 1`, values, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    getPayrollPeriods: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM payroll_periods ORDER BY start_date DESC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    createPayrollPeriod: (data) => {
        return new Promise((resolve, reject) => {
            const { name, start_date, end_date, payment_date, type, periodicidad } = data;
            db.run(
                `INSERT INTO payroll_periods (name, start_date, end_date, payment_date, type, periodicidad) VALUES (?, ?, ?, ?, ?, ?)`,
                [name, start_date, end_date, payment_date, type || 'O', periodicidad || '02'],
                function (err) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    },

    getPayrollReceipts: (periodId) => {
        return new Promise((resolve, reject) => {
            db.all(
                `SELECT r.*, e.name as employee_name, e.position 
                 FROM payroll_receipts r 
                 JOIN employees e ON r.employee_id = e.id 
                 WHERE r.period_id = ?`,
                [periodId],
                (err, rows) => {
                    if (err) reject(err);
                    resolve(rows.map(row => ({ ...row, data_json: JSON.parse(row.data_json || '{}') })));
                }
            );
        });
    },

    savePayrollReceipt: (receipt) => {
        return new Promise((resolve, reject) => {
            const { period_id, employee_id, total_percepciones, total_deducciones, total_neto, data_json, status, uuid } = receipt;
            db.run(
                `INSERT OR REPLACE INTO payroll_receipts (period_id, employee_id, total_percepciones, total_deducciones, total_neto, data_json, status, uuid)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [period_id, employee_id, total_percepciones, total_deducciones, total_neto, JSON.stringify(data_json), status || 'draft', uuid || null],
                function (err) {
                    if (err) reject(err);
                    resolve(this ? this.lastID : null);
                }
            );
        });
    },

    updatePeriodStatus: (id, status) => {
        return new Promise((resolve, reject) => {
            db.run("UPDATE payroll_periods SET status = ? WHERE id = ?", [status, id], (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    },

    // ===== GESTIÓN DE REPSE ENTERPRISE =====

    // Base Legal
    getREPSEBaseLegal: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM repse_base_legal ORDER BY documento ASC", [], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    saveREPSEBaseLegal: (data) => {
        return new Promise((resolve, reject) => {
            const { id, documento, archivo_url, fecha_emision, fecha_vencimiento, estatus, observaciones } = data;
            if (id) {
                db.run(
                    `UPDATE repse_base_legal SET archivo_url=?, fecha_emision=?, fecha_vencimiento=?, estatus=?, observaciones=? WHERE id=?`,
                    [archivo_url, fecha_emision, fecha_vencimiento, estatus, observaciones, id],
                    (err) => err ? reject(err) : resolve(id)
                );
            } else {
                db.run(
                    `INSERT INTO repse_base_legal (documento, archivo_url, fecha_emision, fecha_vencimiento, estatus, observaciones) VALUES (?, ?, ?, ?, ?, ?)`,
                    [documento, archivo_url, fecha_emision, fecha_vencimiento, estatus || 'VERDE', observaciones],
                    function (err) { err ? reject(err) : resolve(this.lastID); }
                );
            }
        });
    },

    // Periodos
    getREPSEPeriodos: (anio, periodo) => {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM repse_periodos WHERE 1=1";
            const params = [];
            if (anio) { query += " AND anio = ?"; params.push(anio); }
            if (periodo) { query += " AND periodo = ?"; params.push(periodo); }
            db.all(query, params, (err, rows) => err ? reject(err) : resolve(rows));
        });
    },

    saveREPSEPeriodo: (data) => {
        return new Promise((resolve, reject) => {
            const { anio, periodo, mes, tipo_documento, archivo_url, comprobante_pago_url, monto, fecha_pago, estatus } = data;
            db.run(
                `INSERT INTO repse_periodos (anio, periodo, mes, tipo_documento, archivo_url, comprobante_pago_url, monto, fecha_pago, estatus)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [anio, periodo, mes, tipo_documento, archivo_url, comprobante_pago_url, monto, fecha_pago, estatus || 'VERDE'],
                function (err) { err ? reject(err) : resolve(this.lastID); }
            );
        });
    },

    // Alertas
    getREPSEAlertas: () => {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM repse_alertas ORDER BY fecha DESC", [], (err, rows) => err ? reject(err) : resolve(rows));
        });
    },

    // Estatus General
    getREPSEGeneralStatus: async () => {
        // Lógica de cálculo de semáforo general
        const baseLegal = await new Promise(r => db.all("SELECT estatus FROM repse_base_legal", (err, rows) => r(rows || [])));
        const periodos = await new Promise(r => db.all("SELECT estatus FROM repse_periodos WHERE created_at > date('now', '-30 days')", (err, rows) => r(rows || [])));

        const hasRojo = baseLegal.some(b => b.estatus === 'ROJO') || periodos.some(p => p.estatus === 'ROJO');
        const hasAmarillo = baseLegal.some(b => b.estatus === 'AMARILLO') || periodos.some(p => p.estatus === 'AMARILLO');

        if (hasRojo) return 'ROJO';
        if (hasAmarillo) return 'AMARILLO';
        return 'VERDE';
    },

    // ===== CONTALINK AUTOMATION =====
    createJournalEntryWithLines: (entry, lines) => {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");
                const { date, type, concept, number, uuid } = entry;

                db.run(
                    "INSERT INTO journal_entries (date, type, concept, number, uuid) VALUES (?, ?, ?, ?, ?)",
                    [date, type, concept, number || null, uuid || null],
                    function (err) {
                        if (err) { db.run("ROLLBACK"); return reject(err); }

                        const entryId = this.lastID;
                        const stmt = db.prepare("INSERT INTO journal_entry_lines (entry_id, account_id, description, debit, credit) VALUES (?, ?, ?, ?, ?)");

                        let completed = 0;
                        lines.forEach(line => {
                            stmt.run([entryId, line.account_id, line.description, line.debit, line.credit], (err) => {
                                if (err) { db.run("ROLLBACK"); return reject(err); }
                                completed++;
                                if (completed === lines.length) {
                                    stmt.finalize();
                                    db.run("COMMIT");
                                    resolve(entryId);
                                }
                            });
                        });
                    }
                );
            });
        });
    },

    getAccountIdByCode: (code) => {
        return new Promise((resolve, reject) => {
            db.get("SELECT id FROM chart_of_accounts WHERE code = ?", [code], (err, row) => {
                if (err) reject(err);
                resolve(row?.id);
            });
        });
    },

    syncREPSEFromPayroll: async () => {
        // Buscar rfc de la empresa
        const config = await dbHelpers.getPayrollConfig();
        if (!config || !config.rfc) return;

        // Buscar recibos de nómina (XML importados)
        const receipts = await dbHelpers.all("SELECT * FROM payroll_receipts WHERE status = 'stamped'");

        for (const r of receipts) {
            const date = new Date(r.stamped_at || Date.now());
            const anio = date.getFullYear();
            const mes = date.getMonth() + 1;

            // Marcar como cumplido el CFDI de Nómina en repse_periodos
            await dbHelpers.saveREPSEPeriodo({
                anio,
                periodo: 'MENSUAL',
                mes,
                tipo_documento: 'CFDI nómina',
                estatus: 'VERDE',
                observaciones: 'Validado automáticamente por XML de nómina'
            });
        }
    },

    // ===== INFORMES FINANCIEROS (P&L / BALANCE) =====
    getIncomeStatement: (startDate, endDate) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.code, a.name, a.type,
                    SUM(l.debit) as total_debit, 
                    SUM(l.credit) as total_credit,
                    (SUM(l.credit) - SUM(l.debit)) as balance -- Para Ingresos es Acreedora
                FROM journal_entry_lines l
                JOIN journal_entries e ON l.entry_id = e.id
                JOIN chart_of_accounts a ON l.account_id = a.id
                WHERE e.date BETWEEN ? AND ? AND (a.type = 'INGRESO' OR a.type = 'EGRESO')
                GROUP BY a.id ORDER BY a.code ASC
            `;
            db.all(query, [startDate, endDate], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getBalanceSheet: (date) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.code, a.name, a.type, a.nature,
                    SUM(l.debit) as total_debit, 
                    SUM(l.credit) as total_credit,
                    CASE 
                        WHEN a.nature = 'DEUDORA' THEN (SUM(l.debit) - SUM(l.credit))
                        ELSE (SUM(l.credit) - SUM(l.debit))
                    END as balance
                FROM journal_entry_lines l
                JOIN journal_entries e ON l.entry_id = e.id
                JOIN chart_of_accounts a ON l.account_id = a.id
                WHERE e.date <= ? AND (a.type = 'ACTIVO' OR a.type = 'PASIVO' OR a.type = 'CAPITAL')
                GROUP BY a.id ORDER BY a.code ASC
            `;
            db.all(query, [date], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getTrialBalance: (startDate, endDate) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    a.code, a.name, a.type, a.nature,
                    SUM(CASE WHEN l.debit > 0 THEN l.debit ELSE 0 END) as total_debit,
                    SUM(CASE WHEN l.credit > 0 THEN l.credit ELSE 0 END) as total_credit,
                    CASE 
                        WHEN a.nature = 'DEUDORA' THEN (SUM(l.debit) - SUM(l.credit))
                        ELSE (SUM(l.credit) - SUM(l.debit))
                    END as final_balance
                FROM chart_of_accounts a
                LEFT JOIN journal_entry_lines l ON a.id = l.account_id
                LEFT JOIN journal_entries e ON l.entry_id = e.id AND e.date BETWEEN ? AND ?
                GROUP BY a.id ORDER BY a.code ASC
            `;
            db.all(query, [startDate, endDate], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getAccountAuxiliary: (accountId, startDate, endDate) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    e.date, e.concept, e.number,
                    l.description, l.debit, l.credit
                FROM journal_entry_lines l
                JOIN journal_entries e ON l.entry_id = e.id
                WHERE l.account_id = ? AND e.date BETWEEN ? AND ?
                ORDER BY e.date ASC, e.id ASC
            `;
            db.all(query, [accountId, startDate, endDate], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    },

    getJournalEntries: (startDate, endDate) => {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    e.*,
                    l.id as line_id, l.description as line_description, l.debit, l.credit,
                    a.code as account_code, a.name as account_name
                FROM journal_entries e
                JOIN journal_entry_lines l ON e.id = l.entry_id
                JOIN chart_of_accounts a ON l.account_id = a.id
                WHERE e.date BETWEEN ? AND ?
                ORDER BY e.date DESC, e.id DESC
            `;
            db.all(query, [startDate, endDate], (err, rows) => {
                if (err) reject(err);

                // Group by entry
                const entries = [];
                rows.forEach(row => {
                    let entry = entries.find(e => e.id === row.id);
                    if (!entry) {
                        entry = {
                            id: row.id,
                            date: row.date,
                            type: row.type,
                            concept: row.concept,
                            number: row.number,
                            lines: []
                        };
                        entries.push(entry);
                    }
                    entry.lines.push({
                        id: row.line_id,
                        account_code: row.account_code,
                        account_name: row.account_name,
                        description: row.line_description,
                        debit: row.debit,
                        credit: row.credit
                    });
                });
                resolve(entries);
            });
        });
    },

    getTaxSummary: (startDate, endDate) => {
        return new Promise((resolve, reject) => {
            // Buscamos cuentas que tengan "IVA" en el nombre o códigos específicos
            const query = `
                SELECT 
                    a.name,
                    SUM(l.debit) as total_debit,
                    SUM(l.credit) as total_credit
                FROM journal_entry_lines l
                JOIN journal_entries e ON l.entry_id = e.id
                JOIN chart_of_accounts a ON l.account_id = a.id
                WHERE e.date BETWEEN ? AND ? AND (a.name LIKE '%IVA%' OR a.code LIKE '208%' OR a.code LIKE '118%')
                GROUP BY a.id
            `;
            db.all(query, [startDate, endDate], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }
});

module.exports = dbHelpers;
