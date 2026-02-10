/**
 * MICSA - Auth Helper (Frontend)
 * Funciones de autenticación del lado del cliente
 */

// Detect iframe mode: hide redundant nav when embedded in Next.js shell
if (sessionStorage.getItem('MICSA_IFRAME_MODE') === 'true' || window.self !== window.top) {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.classList.add('iframe-mode');
    });
}

const API_URL = '/api';

/**
 * Obtiene el token almacenado
 */
function getToken() {
    return localStorage.getItem('MICSA_AUTH_TOKEN');
}

/**
 * Obtiene el usuario actual desde localStorage
 */
function getCurrentUser() {
    const userStr = localStorage.getItem('MICSA_USER');
    if (!userStr) return null;

    try {
        return JSON.parse(userStr);
    } catch (err) {
        console.error('Error parseando usuario:', err);
        return null;
    }
}

/**
 * Verifica si hay una sesión activa
 */
function isAuthenticated() {
    return !!getToken();
}

/**
 * Cierra sesión
 */
async function logout() {
    try {
        await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });
    } catch (err) {
        console.error('Error en logout:', err);
    } finally {
        localStorage.removeItem('MICSA_AUTH_TOKEN');
        localStorage.removeItem('MICSA_USER');
        window.location.href = '/src/pages/login.html';
    }
}

/**
 * Redirige al login si no hay sesión
 */
function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/src/pages/login.html';
        return false;
    }
    return true;
}

/**
 * Hace una petición autenticada a la API
 */
async function authenticatedFetch(url, options = {}) {
    const token = getToken();

    if (!token) {
        throw new Error('No hay token de autenticación');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Si el token expiró, redirigir al login
    if (response.status === 401) {
        localStorage.removeItem('MICSA_AUTH_TOKEN');
        localStorage.removeItem('MICSA_USER');
        window.location.href = '/src/pages/login.html';
        throw new Error('Sesión expirada');
    }

    return response;
}

/**
 * Muestra información del usuario en el header
 */
function displayUserInfo() {
    const user = getCurrentUser();
    if (!user) return;

    // Buscar o crear elemento de info de usuario
    let userInfo = document.getElementById('userInfo');
    if (!userInfo) {
        userInfo = document.createElement('div');
        userInfo.id = 'userInfo';
        userInfo.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--card-bg); padding: 10px 20px; border-radius: 10px; border: 1px solid var(--card-border); display: flex; align-items: center; gap: 15px; z-index: 1000;';
        document.body.appendChild(userInfo);
    }

    userInfo.innerHTML = `
        <div style="text-align: right;">
            <div style="font-weight: 600; color: var(--text-primary);">${user.username}</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${user.role}</div>
        </div>
        <button onclick="logout()" style="padding: 8px 16px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
            Cerrar Sesión
        </button>
    `;
}

// Interceptor de Fetch para inyectar token automáticamente
const originalFetch = window.fetch;
window.fetch = async function (url, options = {}) {
    // Si es una ruta de nuestra API y no es login
    if (url.toString().includes('/api/') && !url.toString().includes('/api/auth/login')) {
        const token = localStorage.getItem('MICSA_AUTH_TOKEN');
        if (token) {
            // Asegurarnos de que headers sea un objeto
            options.headers = options.headers || {};

            // Si es un objeto simple de headers
            if (!(options.headers instanceof Headers)) {
                options.headers['Authorization'] = `Bearer ${token}`;
                if (!options.headers['Content-Type'] && options.body && !(options.body instanceof FormData)) {
                    options.headers['Content-Type'] = 'application/json';
                }
            } else {
                // Si es una instancia de Headers
                options.headers.set('Authorization', `Bearer ${token}`);
            }
        }
    }

    const response = await originalFetch(url, options);

    // Si el token es inválido o expiró (excluyendo el intento de login)
    if (response.status === 401 && !url.toString().includes('/api/auth/login')) {
        console.warn('Sesión expirada o no autorizada');
        localStorage.removeItem('MICSA_AUTH_TOKEN');
        localStorage.removeItem('MICSA_USER');

        // Solo redirigir si no estamos ya en la página de login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/src/pages/login.html';
        }
    }

    return response;
};

// Auto-verificar autenticación al cargar páginas protegidas
document.addEventListener('DOMContentLoaded', () => {
    // No verificar en la página de login
    if (window.location.pathname.includes('login.html')) {
        // Si ya está autenticado, redirigir al dashboard
        if (isAuthenticated()) {
            window.location.href = '/index.html';
        }
        return;
    }

    // En cualquier otra página, verificar autenticación
    if (requireAuth()) {
        displayUserInfo();
    }
});

// Compatibilidad global para módulos nuevos
window.auth = {
    checkAuth: requireAuth,
    getAuthHeader: () => ({
        'Authorization': `Bearer ${getToken()}`
    }),
    logout: logout,
    getToken: getToken,
    getCurrentUser: getCurrentUser
};
