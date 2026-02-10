/**
 * MICSA - Rutas de Autenticación
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../database');
const { generateToken, authMiddleware } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Autenticación de usuario
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
        }
        
        // Buscar usuario
        const user = await db.getUserByUsername(username);
        
        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Verificar contraseña
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Generar token
        const token = generateToken(user);
        
        // Retornar usuario (sin password) y token
        const { password: _, ...userWithoutPassword } = user;
        
        res.json({
            message: 'Login exitoso',
            token,
            user: userWithoutPassword
        });
        
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * GET /api/auth/me
 * Obtener información del usuario actual
 */
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await db.getUserByUsername(req.user.username);
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
        
    } catch (err) {
        console.error('Error obteniendo usuario:', err);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

/**
 * POST /api/auth/logout
 * Cerrar sesión (en el cliente se elimina el token)
 */
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout exitoso' });
});

module.exports = router;
