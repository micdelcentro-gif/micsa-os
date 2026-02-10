/**
 * ============================================
 * MICSA - LÓGICA DE GENERACIÓN DE PDF
 * ============================================
 * 
 * Este archivo gestiona la preparación y exportación del 
 * Reporte Diario a formato PDF, optimizando el diseño
 * para impresión profesional y ahorro de tinta.
 */

/**
 * Prepara el documento para impresión y abre el diálogo del sistema.
 * Oculta elementos de navegación y aplica estilos específicos.
 */
function generarPDF() {
    // 1. Mostrar notificación informativa
    if (typeof showNotification === 'function') {
        showNotification('📄 Preparando PDF para imprimir...', 'info');
    }
    
    // 2. Ocultar explícitamente elementos que no deben salir en el PDF
    // (Aseguramos que botones de navegación y dashboard no se cuelen)
    const elementsToHide = document.querySelectorAll('.action-buttons, .btn-secondary, .nav-breadcrumb, .no-print');
    elementsToHide.forEach(el => {
        el.setAttribute('data-prev-display', el.style.display);
        // Nota: El CSS @media print ya hace gran parte de este trabajo,
        // pero esto previene errores visuales en algunos navegadores.
    });

    // 3. Agregar clase de impresión al body
    document.body.classList.add('printing');
    
    // 4. Pequeña demora para que el navegador procese los cambios visuales
    setTimeout(() => {
        window.print();
        
        // 5. Limpieza post-impresión
        document.body.classList.remove('printing');
        
        console.log('✅ Proceso de impresión finalizado');
    }, 500);
}
