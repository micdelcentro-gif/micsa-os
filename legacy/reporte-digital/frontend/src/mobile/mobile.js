/**
 * MICSA - Lógica de Aplicación Móvil
 * 
 * Este archivo maneja interacciones específicas para teléfonos,
 * principalmente el Menú Flotante (FAB).
 */

function toggleFab() {
    document.getElementById('fabMenu').classList.toggle('active');
}

// Cerrar FAB al hacer click fuera
document.addEventListener('click', function(e) {
    const fab = document.getElementById('fabMenu');
    // Verifica si el click fue fuera del contenedor del FAB y si está abierto
    if (fab && !fab.contains(e.target) && fab.classList.contains('active')) {
        fab.classList.remove('active');
    }
});

console.log('📱 App Móvil cargada');
