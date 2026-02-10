/**
 * CATÁLOGOS DE PRODUCTOS MICSA
 * Base de datos de EPP, Equipos y Materiales con precios actualizados 2025
 */

// ============================================
// CATÁLOGO DE EPP (Equipo de Protección Personal)
// ============================================
const EPP_CATALOG = [
    // EPP Básico Obligatorio
    {
        id: 'epp_casco',
        nombre: 'Casco de Seguridad Certificado',
        categoria: 'Protección Cabeza',
        precio: 350,
        unidad: 'pieza',
        obligatorio: true,
        descripcion: 'Casco tipo I con barboquejo, certificación ANSI Z89.1'
    },
    {
        id: 'epp_botas',
        nombre: 'Botas Punta de Acero',
        categoria: 'Protección Pies',
        precio: 850,
        unidad: 'par',
        obligatorio: true,
        descripcion: 'Botas industriales punta metálica, normativa ASTM F2413'
    },
    {
        id: 'epp_guantes_carnaza',
        nombre: 'Guantes de Carnaza Reforzados',
        categoria: 'Protección Manos',
        precio: 120,
        unidad: 'par',
        obligatorio: true,
        descripcion: 'Guantes tipo carnaza para trabajo pesado'
    },
    {
        id: 'epp_lentes',
        nombre: 'Lentes de Seguridad',
        categoria: 'Protección Visual',
        precio: 85,
        unidad: 'pieza',
        obligatorio: true,
        descripcion: 'Goggles transparentes anti-impacto ANSI Z87.1'
    },
    {
        id: 'epp_chaleco',
        nombre: 'Chaleco Reflejante Alta Visibilidad',
        categoria: 'Señalización',
        precio: 180,
        unidad: 'pieza',
        obligatorio: true,
        descripcion: 'Chaleco clase 2 ANSI/ISEA 107'
    },

    // EPP Especializado
    {
        id: 'epp_careta_soldar',
        nombre: 'Careta para Soldadura Automática',
        categoria: 'Soldadura',
        precio: 1850,
        unidad: 'pieza',
        obligatorio: false,
        descripcion: 'Careta con oscurecimiento automático DIN 9-13'
    },
    {
        id: 'epp_respirador',
        nombre: 'Respirador Media Cara',
        categoria: 'Protección Respiratoria',
        precio: 650,
        unidad: 'pieza',
        obligatorio: false,
        descripcion: 'Respirador reutilizable con filtros P100'
    },
    {
        id: 'epp_arnes',
        nombre: 'Arnés de Cuerpo Completo',
        categoria: 'Protección Caídas',
        precio: 2500,
        unidad: 'pieza',
        obligatorio: false,
        descripcion: 'Arnés 5 puntos con amortiguador, certificación ANSI Z359'
    },
    {
        id: 'epp_mangas',
        nombre: 'Mangas de Carnaza para Soldador',
        categoria: 'Soldadura',
        precio: 280,
        unidad: 'par',
        obligatorio: false,
        descripcion: 'Mangas hasta codo, resistentes al calor'
    },
    {
        id: 'epp_overol',
        nombre: 'Overol Industrial',
        categoria: 'Ropa Trabajo',
        precio: 550,
        unidad: 'pieza',
        obligatorio: false,
        descripcion: 'Overol mezclilla reforzado con reflejantes'
    }
];

// ============================================
// CATÁLOGO DE EQUIPOS DE RENTA
// ============================================
const EQUIPMENT_CATALOG = [
    // Maquinaria Pesada
    {
        id: 'eq_grua_5ton',
        nombre: 'Grúa Hidráulica 5 Toneladas',
        categoria: 'Grúas',
        precioMensual: 45000,
        precioDiario: 2500,
        descripcion: 'Grúa móvil con operador incluido'
    },
    {
        id: 'eq_montacargas',
        nombre: 'Montacargas 3 Toneladas',
        categoria: 'Montacargas',
        precioMensual: 28000,
        precioDiario: 1800,
        descripcion: 'Montacargas diésel con operador'
    },
    {
        id: 'eq_plataforma',
        nombre: 'Plataforma Elevadora (Boom Lift)',
        categoria: 'Elevación',
        precioMensual: 35000,
        precioDiario: 2200,
        descripcion: 'Plataforma articulada 15m altura'
    },

    // Equipos de Soldadura
    {
        id: 'eq_soldadora_mig',
        nombre: 'Soldadora MIG/MAG Industrial',
        categoria: 'Soldadura',
        precioMensual: 8500,
        precioDiario: 480,
        descripcion: 'Soldadora 350A trifásica con accesorios'
    },
    {
        id: 'eq_soldadora_tig',
        nombre: 'Soldadora TIG AC/DC',
        categoria: 'Soldadura',
        precioMensual: 12000,
        precioDiario: 650,
        descripcion: 'Equipo TIG 300A con sistema de enfriamiento'
    },
    {
        id: 'eq_plasma',
        nombre: 'Cortadora de Plasma CNC',
        categoria: 'Corte',
        precioMensual: 18500,
        precioDiario: 1200,
        descripcion: 'Sistema CNC de corte por plasma'
    },

    // Herramientas Eléctricas
    {
        id: 'eq_compresor',
        nombre: 'Compresor Industrial 175 PSI',
        categoria: 'Aire Comprimido',
        precioMensual: 6500,
        precioDiario: 380,
        descripcion: 'Compresor portátil diésel 175CFM'
    },
    {
        id: 'eq_generador',
        nombre: 'Generador Eléctrico 45 KVA',
        categoria: 'Energía',
        precioMensual: 15000,
        precioDiario: 950,
        descripcion: 'Generador trifásico silencioso'
    },
    {
        id: 'eq_esmeril',
        nombre: 'Esmeril de Banco Industrial',
        categoria: 'Herramientas',
        precioMensual: 2800,
        precioDiario: 180,
        descripcion: 'Esmeril 1HP con discos de corte'
    }
];

// ============================================
// CATÁLOGO DE MATERIALES Y CONSUMIBLES
// ============================================
const MATERIALS_CATALOG = [
    // Soldadura
    {
        id: 'mat_electrodo_6011',
        nombre: 'Electrodo 6011 3/32"',
        categoria: 'Soldadura',
        precio: 850,
        unidad: 'paquete 5kg',
        descripcion: 'Electrodo revestido para soldadura'
    },
    {
        id: 'mat_alambre_mig',
        nombre: 'Alambre MIG ER70S-6 0.035"',
        categoria: 'Soldadura',
        precio: 1200,
        unidad: 'rollo 15kg',
        descripcion: 'Alambre sólido para MIG/MAG'
    },
    {
        id: 'mat_gas_argon',
        nombre: 'Gas Argón Industrial',
        categoria: 'Gases',
        precio: 3500,
        unidad: 'cilindro',
        descripcion: 'Cilindro argón 99.99% pureza'
    },
    {
        id: 'mat_co2',
        nombre: 'Gas CO2 Industrial',
        categoria: 'Gases',
        precio: 1800,
        unidad: 'cilindro',
        descripcion: 'Cilindro CO2 para soldadura MIG'
    },

    // Abrasivos y Discos
    {
        id: 'mat_disco_corte',
        nombre: 'Disco de Corte 9" x 1/8"',
        categoria: 'Abrasivos',
        precio: 45,
        unidad: 'pieza',
        descripcion: 'Disco corte para acero'
    },
    {
        id: 'mat_disco_desbaste',
        nombre: 'Disco de Desbaste 7"',
        categoria: 'Abrasivos',
        precio: 38,
        unidad: 'pieza',
        descripcion: 'Disco desbaste grano 24'
    },
    {
        id: 'mat_lija',
        nombre: 'Lija de Banda 4" x 24"',
        categoria: 'Abrasivos',
        precio: 65,
        unidad: 'pieza',
        descripcion: 'Lija banda grano 80'
    },

    // Químicos
    {
        id: 'mat_pintura',
        nombre: 'Pintura Industrial Esmalte',
        categoria: 'Recubrimientos',
        precio: 850,
        unidad: 'galón',
        descripcion: 'Esmalte sintético anti-corrosivo'
    },
    {
        id: 'mat_thinner',
        nombre: 'Thinner Industrial',
        categoria: 'Solventes',
        precio: 280,
        unidad: 'litro',
        descripcion: 'Thinner estándar para limpieza'
    },
    {
        id: 'mat_primario',
        nombre: 'Primario Anticorrosivo',
        categoria: 'Recubrimientos',
        precio: 950,
        unidad: 'galón',
        descripcion: 'Primario epóxico antioxidante'
    }
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

/**
 * Obtiene items del catálogo por categoría
 */
function getItemsByCategory(catalog, category) {
    return catalog.filter(item => item.categoria === category);
}

/**
 * Obtiene un item específico por ID
 */
function getItemById(catalog, id) {
    return catalog.find(item => item.id === id);
}

/**
 * Obtiene todos los items obligatorios de EPP
 */
function getMandatoryEPP() {
    return EPP_CATALOG.filter(item => item.obligatorio);
}

/**
 * Calcula el costo total de EPP para un número de personas
 */
function calculateEPPCost(selectedItems, personnel) {
    return selectedItems.reduce((total, itemId) => {
        const item = getItemById(EPP_CATALOG, itemId);
        return total + (item ? item.precio * personnel : 0);
    }, 0);
}

/**
 * Calcula costo de equipos rentados
 */
function calculateEquipmentCost(selectedEquipment, months) {
    return selectedEquipment.reduce((total, eq) => {
        const item = getItemById(EQUIPMENT_CATALOG, eq.id);
        if (!item) return total;

        const monthlyCost = item.precioMensual * eq.quantity * months;
        return total + monthlyCost;
    }, 0);
}

/**
 * Obtiene categorías únicas de un catálogo
 */
function getCategories(catalog) {
    return [...new Set(catalog.map(item => item.categoria))];
}
