/**
 * MICSA - Middleware de Autenticación JWT
 */

const jwt = require('jsonwebtoken');
const { hasPermission } = require('../config/permissions');

// Clave secreta para JWT (en producción debe estar en variables de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'MICSA_SECRET_KEY_2026_CHANGE_IN_PRODUCTION';

/**
 * Middleware para verificar token JWT
 */
function authMiddleware(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Adjuntar usuario al request
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido o expirado' });
    }
}

/**
 * Middleware para verificar permisos específicos
 * Uso: requirePermission('manage_users')
 */
function requirePermission(permission) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado' });
        }
        
        if (!hasPermission(req.user.permissions, permission)) {
            return res.status(403).json({ error: 'Sin permisos suficientes' });
        }
        
        next();
    };
}

/**
 * Middleware para verificar rol de super admin
 */
function requireSuperAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'Requiere privilegios de Super Admin' });
    }
    next();
}

/**
 * Genera un token JWT para un usuario
 */
function generateToken(user) {
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        assigned_project: user.assigned_project,
        permissions: user.permissions
    };
    
    // Token válido por 24 horas
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

module.exports = {
    authMiddleware,
    requirePermission,
    requireSuperAdmin,
    generateToken,
    JWT_SECRET
};
