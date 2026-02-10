/**
 * Definición centralizada de Categorías
 * Compartido entre Sistema de Etiquetado y Packing List
 */

const CATEGORIAS_DATA = {
    "Equipo Principal": {
        prefijo: "EQ",
        descripcion: "Celdas, maquinaria principal",
        formato: "EQ-XXX",
        ejemplo: "EQ-001",
        colorClase: "tag-blue",
        colorNombre: "Azul",
        colorHex: "#3b82f6",
        ubicacion: "Sobre equipo visible",
        responsable: "Supervisor"
    },
    "Cableado": {
        prefijo: "CB",
        descripcion: "Cables de potencia y control",
        formato: "CB-EQ-XXX-YY",
        ejemplo: "CB-EQ-001-01",
        colorClase: "tag-yellow",
        colorNombre: "Amarillo",
        colorHex: "#eab308",
        ubicacion: "Ambos extremos",
        responsable: "Electricista"
    },
    "Tubería": {
        prefijo: "TB",
        descripcion: "Líneas de proceso y servicios",
        formato: "TB-XXX-DIA-MAT",
        ejemplo: "TB-001-2IN-CS",
        colorClase: "tag-green",
        colorNombre: "Verde",
        colorHex: "#22c55e",
        ubicacion: "Cada 3 metros",
        responsable: "Mecánico"
    },
    "Válvula": {
        prefijo: "VL",
        descripcion: "Válvulas de aislamiento",
        formato: "VL-TB-XXX",
        ejemplo: "VL-TB-001",
        colorClase: "tag-red",
        colorNombre: "Rojo",
        colorHex: "#ef4444",
        ubicacion: "Cuerpo de válvula",
        responsable: "Mecánico"
    },
    "Soporte": {
        prefijo: "SP",
        descripcion: "Sopteria estructural",
        formato: "SP-XXX-TIPO",
        ejemplo: "SP-001-BRK",
        colorClase: "tag-gray",
        colorNombre: "Gris",
        colorHex: "#9ca3af",
        ubicacion: "En soporte",
        responsable: "Ayudante"
    },
    "Conexión": {
        prefijo: "CN",
        descripcion: "Puntos de conexión",
        formato: "CN-XXX-TIPO",
        ejemplo: "CN-001-FLG",
        colorClase: "tag-orange",
        colorNombre: "Naranja",
        colorHex: "#f97316",
        ubicacion: "En conexión",
        responsable: "Técnico"
    },
    "Accesorio": {
        prefijo: "AC",
        descripcion: "Componentes menores",
        formato: "AC-EQ-XXX-YY",
        ejemplo: "AC-EQ-001-01",
        colorClase: "tag-white",
        colorNombre: "Blanco",
        colorHex: "#ffffff",
        ubicacion: "En componente",
        responsable: "Ayudante"
    }
};

// Función auxiliar para agregar estilos de color si no existen
// (Se ejecuta al cargar este script)
(function injectCategoryStyles() {
    if (document.getElementById('micsa-category-styles')) return;

    const style = document.createElement('style');
    style.id = 'micsa-category-styles';
    style.textContent = `
        .tag-blue { background-color: #3b82f6 !important; }
        .tag-yellow { background-color: #eab308 !important; }
        .tag-green { background-color: #22c55e !important; }
        .tag-red { background-color: #ef4444 !important; }
        .tag-gray { background-color: #9ca3af !important; }
        .tag-orange { background-color: #f97316 !important; }
        .tag-white { background-color: #ffffff !important; border: 1px solid #ccc !important; }
        
        .color-dot {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 6px;
            border: 1px solid rgba(0,0,0,0.1);
        }
    `;
    document.head.appendChild(style);
})();
