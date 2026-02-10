'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ─── Process Definitions from Inbox Manuals ─── */
type ProcessStep = {
    id: string
    label: string
    type: 'start' | 'action' | 'decision' | 'input' | 'output' | 'end'
    responsible?: string
    linkedModule?: string
    linkedHref?: string
    yesLabel?: string
    noLabel?: string
    sla?: string
}

type Process = {
    id: string
    code: string
    name: string
    nameEn: string
    area: string
    areaColor: string
    areaIcon: string
    icon: string
    description: string
    steps: ProcessStep[]
    goldenRule?: string
    linkedModules: { name: string; href: string; icon: string }[]
}

const PROCESSES: Process[] = [
    {
        id: 'cotizacion',
        code: 'MICSA-PRO-001',
        name: 'Cotización Técnica',
        nameEn: 'Technical Quotation',
        area: 'Proyectos',
        areaColor: 'emerald',
        areaIcon: '🏗️',
        icon: '📝',
        description: 'Desde la solicitud del cliente hasta la emisión de cotización con folio (24-48h)',
        steps: [
            { id: 's1', label: 'Solicitud Cotización', type: 'start' },
            { id: 's2', label: 'Cliente Envía Requerimientos', type: 'input' },
            { id: 's3', label: 'Análisis Técnico (Gerencia Proyectos)', type: 'action', responsible: 'Gerencia Proyectos' },
            { id: 's4', label: 'Cálculo de Costos y Márgenes', type: 'action', responsible: 'Finanzas', linkedModule: 'Cotizador', linkedHref: '/legacy/cotizador' },
            { id: 's5', label: '¿Aprobación Previa DG Requerida?', type: 'decision', yesLabel: 'Enviar a DG', noLabel: 'Continuar' },
            { id: 's6', label: 'Emisión de Cotización con Folio', type: 'action', linkedModule: 'Cotizador', linkedHref: '/legacy/cotizador' },
            { id: 's7', label: 'Envío a Cliente (24-48h)', type: 'output', sla: '24-48 hrs' },
            { id: 's8', label: 'Cotización Enviada', type: 'end' },
        ],
        linkedModules: [
            { name: 'Cotizador Rápido', href: '/legacy/cotizador', icon: '⚡' },
            { name: 'Clientes/Proveedores', href: '/legacy/clientes-proveedores', icon: '🤝' },
            { name: 'Control de Ventas', href: '/legacy/ventas', icon: '💰' },
        ],
    },
    {
        id: 'alta-cliente',
        code: 'MICSA-ADM-002',
        name: 'Alta Cliente y OC',
        nameEn: 'Client Onboarding & Purchase Order',
        area: 'Administración',
        areaColor: 'amber',
        areaIcon: '🏢',
        icon: '🤝',
        description: 'Registro de cliente nuevo con validación fiscal RFC/CFDI y registro de OC',
        steps: [
            { id: 's1', label: 'Alta Cliente', type: 'start' },
            { id: 's2', label: 'Recepción Datos Cliente y OC', type: 'input' },
            { id: 's3', label: 'Validación Fiscal (RFC, CFDI)', type: 'action', responsible: 'Administración' },
            { id: 's4', label: '¿Datos Fiscales Válidos?', type: 'decision', yesLabel: 'Registrar', noLabel: 'Solicitar Corrección' },
            { id: 's5', label: 'Registro en Sistema', type: 'action', linkedModule: 'Clientes/Proveedores', linkedHref: '/legacy/clientes-proveedores' },
            { id: 's6', label: 'Validación OC (Monto, Alcance, Condiciones)', type: 'action' },
            { id: 's7', label: '¿OC Completa y Aceptable?', type: 'decision', yesLabel: 'Activar', noLabel: 'Negociar' },
            { id: 's8', label: 'Activación de Cliente en Sistema', type: 'action' },
            { id: 's9', label: 'Cliente Activo / OC Registrada', type: 'end' },
        ],
        linkedModules: [
            { name: 'Clientes/Proveedores', href: '/legacy/clientes-proveedores', icon: '🤝' },
            { name: 'Sicofi (Timbrado)', href: '/legacy/sicofi-config', icon: '🔐' },
        ],
    },
    {
        id: 'planificacion',
        code: 'MICSA-PRO-003',
        name: 'Planificación de Proyecto',
        nameEn: 'Project Planning',
        area: 'Proyectos',
        areaColor: 'emerald',
        areaIcon: '🏗️',
        icon: '📐',
        description: 'Análisis de alcance, programa de obra, asignación de recursos y validación con cliente',
        steps: [
            { id: 's1', label: 'Planificación', type: 'start' },
            { id: 's2', label: 'Análisis de Alcance y Requerimientos', type: 'action', responsible: 'Gerencia Proyectos' },
            { id: 's3', label: 'Elaboración de Programa de Obra', type: 'action' },
            { id: 's4', label: 'Asignación de Recursos (Personal/Equipo)', type: 'action', linkedModule: 'Proyectos', linkedHref: '/legacy/projects' },
            { id: 's5', label: '¿Requiere Subcontratación?', type: 'decision', yesLabel: 'Gestión Logística F2', noLabel: 'Continuar' },
            { id: 's6', label: 'Validación de Programa con Cliente', type: 'action' },
            { id: 's7', label: '¿Cliente Aprueba?', type: 'decision', yesLabel: 'Aprobar', noLabel: 'Ajustar Programa' },
            { id: 's8', label: 'Programa Aprobado y Comunicado', type: 'output' },
            { id: 's9', label: 'Planificación Lista', type: 'end' },
        ],
        linkedModules: [
            { name: 'Gestión de Proyectos', href: '/legacy/projects', icon: '🏗️' },
            { name: 'Trabajadores', href: '/trabajadores', icon: '👷' },
        ],
    },
    {
        id: 'alta-personal',
        code: 'MICSA-RH-001',
        name: 'Alta de Personal',
        nameEn: 'Personnel Onboarding',
        area: 'Recursos Humanos',
        areaColor: 'violet',
        areaIcon: '👥',
        icon: '👷',
        description: 'Recepción de documentos, contrato, alta IMSS (≤5 días), apertura expediente',
        steps: [
            { id: 's1', label: 'Alta Personal', type: 'start' },
            { id: 's2', label: 'Recepción Documentación Personal', type: 'input' },
            { id: 's3', label: 'Validación Documentos (Checklist)', type: 'action', responsible: 'RH', linkedModule: 'Expedientes', linkedHref: '/expedientes' },
            { id: 's4', label: '¿Documentos Completos?', type: 'decision', yesLabel: 'Continuar', noLabel: 'Solicitar Faltantes' },
            { id: 's5', label: 'Elaboración Contrato', type: 'action' },
            { id: 's6', label: 'Firma Contrato (Empleado y MICSA)', type: 'action' },
            { id: 's7', label: 'Alta IMSS (≤5 días hábiles)', type: 'action', sla: '≤5 días hábiles' },
            { id: 's8', label: '¿Alta IMSS Exitosa?', type: 'decision', yesLabel: 'Continuar', noLabel: 'Corregir Inconsistencias' },
            { id: 's9', label: 'Apertura Expediente y Registro Sistema', type: 'action', linkedModule: 'Empleados', linkedHref: '/legacy/employees' },
            { id: 's10', label: 'Inducción y Capacitación Inicial', type: 'action', linkedModule: 'Capacitaciones', linkedHref: '/capacitaciones' },
        ],
        linkedModules: [
            { name: 'Empleados', href: '/legacy/employees', icon: '👥' },
            { name: 'Expedientes', href: '/expedientes', icon: '📁' },
            { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
            { name: 'Capacitaciones', href: '/capacitaciones', icon: '🎓' },
            { name: 'Config RH', href: '/legacy/config-rh', icon: '⚙️' },
        ],
    },
    {
        id: 'expediente',
        code: 'MICSA-SEG-EXP-001',
        name: 'Expediente para Envío a Planta',
        nameEn: 'Plant Access Dossier',
        area: 'Seguridad',
        areaColor: 'red',
        areaIcon: '🛡️',
        icon: '📁',
        description: 'Compilación docs proyecto + persona, checklist interno, autorización para acceso a planta',
        steps: [
            { id: 's1', label: 'Preparación Expediente', type: 'start' },
            { id: 's2', label: 'Compilar Docs PROYECTO (OC, Plan, AST)', type: 'action', responsible: 'Seguridad' },
            { id: 's3', label: 'Compilar Docs PERSONA (IMSS, DC3, Médico, Antidoping, INE)', type: 'action', linkedModule: 'Expedientes', linkedHref: '/expedientes' },
            { id: 's4', label: 'Listar Herramientas/Unidades y Fotos', type: 'action' },
            { id: 's5', label: 'Checklist de Control Interno', type: 'action' },
            { id: 's6', label: '¿Expediente Completo?', type: 'decision', yesLabel: 'Comprimir y enviar', noLabel: 'Completar Faltantes' },
            { id: 's7', label: 'Comprimir y Nombrar Expediente (EXP_...)', type: 'action' },
            { id: 's8', label: 'Enviar a proyectos@ + seguridad@', type: 'output' },
            { id: 's9', label: 'Espera Revisión Seguridad MICSA / DG', type: 'action' },
            { id: 's10', label: '¿Autoriza?', type: 'decision', yesLabel: 'Proceder', noLabel: 'Recibir Correcciones' },
            { id: 's11', label: 'Recibir Autorización y Proceder', type: 'action' },
            { id: 's12', label: 'Proceso Completo', type: 'end' },
        ],
        linkedModules: [
            { name: 'Expedientes', href: '/expedientes', icon: '📁' },
            { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
            { name: 'Generador Docs', href: '/generador-documentos', icon: '📄' },
            { name: 'Trabajadores', href: '/trabajadores', icon: '👷' },
        ],
    },
    {
        id: 'control-accesos',
        code: 'MICSA-SEG-001',
        name: 'Control de Accesos',
        nameEn: 'Plant Access Control',
        area: 'Seguridad',
        areaColor: 'red',
        areaIcon: '🛡️',
        icon: '🚪',
        description: 'Validación IMSS, DC3, examen médico, EPP, emisión gafete de acceso',
        steps: [
            { id: 's1', label: 'Control Accesos', type: 'start' },
            { id: 's2', label: 'Solicitud Acceso Personal (Lista)', type: 'input' },
            { id: 's3', label: 'Validación Alta IMSS Vigente (NSS)', type: 'action', responsible: 'Seguridad' },
            { id: 's4', label: '¿IMSS Vigente?', type: 'decision', yesLabel: 'Continuar', noLabel: 'Rechazar - Gestionar Alta' },
            { id: 's5', label: 'Validación DC3 (Capacitación)', type: 'action' },
            { id: 's6', label: '¿DC3 Vigente?', type: 'decision', yesLabel: 'Continuar', noLabel: 'Programar Capacitación' },
            { id: 's7', label: 'Verificación Examen Médico', type: 'action' },
            { id: 's8', label: 'Asignación EPP (Equipo Protección)', type: 'action' },
            { id: 's9', label: 'Registro en Formato 9', type: 'action' },
            { id: 's10', label: 'Emisión Gafete Acceso', type: 'output' },
            { id: 's11', label: 'Acceso Permitido', type: 'end' },
        ],
        linkedModules: [
            { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
            { name: 'Expedientes', href: '/expedientes', icon: '📁' },
            { name: 'Capacitaciones', href: '/capacitaciones', icon: '🎓' },
        ],
    },
    {
        id: 'supervision',
        code: 'MICSA-SUP-001',
        name: 'Supervisión en Campo',
        nameEn: 'Field Supervision',
        area: 'Supervisión',
        areaColor: 'orange',
        areaIcon: '🔧',
        icon: '👁️',
        description: 'Bitácora F1, inspección visual, registro fotográfico, reporte diario a PM/Gerencia',
        steps: [
            { id: 's1', label: 'Supervisión Diaria', type: 'start' },
            { id: 's2', label: 'Llegada a Obra y Firma Acceso (Formato 9)', type: 'action', responsible: 'Supervisor' },
            { id: 's3', label: 'Registro Inicio Jornada Bitácora F1', type: 'action' },
            { id: 's4', label: 'Inspección Visual de Avances', type: 'action' },
            { id: 's5', label: 'Registro Fotográfico (Formato F12)', type: 'action' },
            { id: 's6', label: '¿Incidencias o Desviaciones?', type: 'decision', yesLabel: 'Documentar en Bitácora F1', noLabel: 'Continuar' },
            { id: 's7', label: 'Validación Cumplimiento Normas Seguridad', type: 'action' },
            { id: 's8', label: 'Cierre Jornada y Reporte Diario', type: 'action', linkedModule: 'Reporte Diario', linkedHref: '/reporte-diario' },
            { id: 's9', label: 'Envío Reporte a PM y Gerencia', type: 'output' },
            { id: 's10', label: 'Supervisión Completa', type: 'end' },
        ],
        linkedModules: [
            { name: 'Reporte Diario', href: '/reporte-diario', icon: '📋' },
            { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
            { name: 'Proyectos', href: '/legacy/projects', icon: '🏗️' },
        ],
    },
    {
        id: 'compras',
        code: 'MICSA-LOG-001',
        name: 'Compras y Logística',
        nameEn: 'Purchasing & Logistics',
        area: 'Logística',
        areaColor: 'blue',
        areaIcon: '📦',
        icon: '🛒',
        description: 'Requisición F2, solicitud 3 cotizaciones mín, comparativo, OC, recepción e inventario',
        steps: [
            { id: 's1', label: 'Proceso Compras', type: 'start' },
            { id: 's2', label: 'Recepción Requisición F2', type: 'input' },
            { id: 's3', label: 'Validación Especificaciones Técnicas', type: 'action', responsible: 'Logística' },
            { id: 's4', label: 'Solicitud Cotizaciones (3 Proveedores Mín)', type: 'action' },
            { id: 's5', label: 'Recepción Cotizaciones', type: 'input' },
            { id: 's6', label: 'Comparativo de Proveedores (Formato F3)', type: 'action' },
            { id: 's7', label: 'Selección Proveedor (Mejor Precio/Calidad)', type: 'action' },
            { id: 's8', label: '¿Requiere Autorización DG?', type: 'decision', yesLabel: 'Solicitar Aprobación DG', noLabel: 'Continuar' },
            { id: 's9', label: 'Emisión Orden de Compra', type: 'action' },
            { id: 's10', label: 'Recepción y Verificación Calidad', type: 'action' },
            { id: 's11', label: 'Registro Inventario Sistema', type: 'action', linkedModule: 'Packing List', linkedHref: '/packing-list' },
        ],
        linkedModules: [
            { name: 'Packing List', href: '/packing-list', icon: '📦' },
            { name: 'Egresos', href: '/legacy/egresos', icon: '💸' },
            { name: 'Clientes/Proveedores', href: '/legacy/clientes-proveedores', icon: '🤝' },
        ],
    },
    {
        id: 'facturacion',
        code: 'MICSA-ADM-001',
        name: 'Facturación',
        nameEn: 'Invoicing',
        area: 'Administración',
        areaColor: 'amber',
        areaIcon: '🏢',
        icon: '🧾',
        description: 'Validación OC + F6, elaboración CFDI, timbrado SAT, envío 24h post-F6',
        goldenRule: 'Sin OC válida y Acta F6 firmada NO se factura',
        steps: [
            { id: 's1', label: 'Facturación', type: 'start' },
            { id: 's2', label: '¿OC Válida y F6 Firmada?', type: 'decision', yesLabel: 'Continuar', noLabel: 'RECHAZAR - No Facturar' },
            { id: 's3', label: 'Validación de Datos Cliente', type: 'action', responsible: 'Administración' },
            { id: 's4', label: 'Elaboración de CFDI', type: 'action', linkedModule: 'Sicofi', linkedHref: '/legacy/sicofi-config' },
            { id: 's5', label: 'Timbrado Fiscal (SAT)', type: 'action' },
            { id: 's6', label: '¿Timbrado Exitoso?', type: 'decision', yesLabel: 'Enviar', noLabel: 'Corregir Errores' },
            { id: 's7', label: 'Envío CFDI a Cliente (24h post-F6)', type: 'output', sla: '24h post-F6' },
            { id: 's8', label: 'Registro en Sistema Contable', type: 'action', linkedModule: 'Contabilidad', linkedHref: '/legacy/polizas' },
            { id: 's9', label: 'Facturación Completa', type: 'end' },
        ],
        linkedModules: [
            { name: 'Sicofi (Timbrado)', href: '/legacy/sicofi-config', icon: '🔐' },
            { name: 'Pólizas', href: '/legacy/polizas', icon: '📑' },
            { name: 'Tesorería', href: '/legacy/tesoreria', icon: '🏦' },
        ],
    },
    {
        id: 'cobranza',
        code: 'MICSA-ADM-003',
        name: 'Cobranza',
        nameEn: 'Collections',
        area: 'Administración',
        areaColor: 'amber',
        areaIcon: '🏢',
        icon: '💵',
        description: 'Monitoreo CxC, recordatorios, escalamiento gerencia, conciliación de pagos',
        steps: [
            { id: 's1', label: 'Gestión Cobranza', type: 'start' },
            { id: 's2', label: 'Monitoreo de Cuentas por Cobrar', type: 'action', responsible: 'Administración' },
            { id: 's3', label: '¿Factura Vencida?', type: 'decision', yesLabel: 'Enviar Recordatorio', noLabel: 'Seguimiento Preventivo' },
            { id: 's4', label: 'Envío 1er Recordatorio (Email/Llamada)', type: 'action' },
            { id: 's5', label: '¿Cliente Responde y Compromete Pago?', type: 'decision', yesLabel: 'Registrar Compromiso', noLabel: 'Escalar' },
            { id: 's6', label: 'Escalamiento a Gerencia', type: 'action' },
            { id: 's7', label: '¿Requiere Acción Legal?', type: 'decision', yesLabel: 'Derivar a Legal', noLabel: 'Continuar' },
            { id: 's8', label: 'Recepción de Pago', type: 'input' },
            { id: 's9', label: 'Aplicación en Sistema y Conciliación', type: 'action', linkedModule: 'Tesorería', linkedHref: '/legacy/tesoreria' },
            { id: 's10', label: 'Gestión Cobranza Completa', type: 'end' },
        ],
        linkedModules: [
            { name: 'Tesorería', href: '/legacy/tesoreria', icon: '🏦' },
            { name: 'Estados Financieros', href: '/legacy/estados-financieros', icon: '📊' },
            { name: 'Legal', href: '/legal', icon: '⚖️' },
        ],
    },
    {
        id: 'viaticos',
        code: 'MICSA-ADM-004',
        name: 'Anticipos y Viáticos',
        nameEn: 'Advances & Per Diems',
        area: 'Administración',
        areaColor: 'amber',
        areaIcon: '🏢',
        icon: '✈️',
        description: 'Solicitud de anticipo, aprobación gerencia, dispersión, comprobación fiscal',
        steps: [
            { id: 's1', label: 'Solicitud Anticipo', type: 'start' },
            { id: 's2', label: 'Empleado Solicita Anticipo/Viático', type: 'input' },
            { id: 's3', label: 'Validación de Solicitud (Monto, Justificación)', type: 'action', responsible: 'Administración' },
            { id: 's4', label: '¿Aprobado por Gerencia?', type: 'decision', yesLabel: 'Autorizar', noLabel: 'Rechazar / Solicitar Ajustes' },
            { id: 's5', label: 'Autorización Finanzas', type: 'action' },
            { id: 's6', label: 'Registro en Sistema y Dispersión', type: 'action', linkedModule: 'Egresos', linkedHref: '/legacy/egresos' },
            { id: 's7', label: 'Entrega de Anticipo a Empleado', type: 'output' },
            { id: 's8', label: 'Empleado Ejecuta Gastos', type: 'action' },
            { id: 's9', label: 'Recepción Comprobantes', type: 'input' },
            { id: 's10', label: 'Validación de Comprobantes Fiscales', type: 'action' },
        ],
        linkedModules: [
            { name: 'Egresos', href: '/legacy/egresos', icon: '💸' },
            { name: 'Nómina', href: '/legacy/nomina', icon: '💰' },
        ],
    },
    {
        id: 'cierre',
        code: 'MICSA-SUP-004',
        name: 'Cierre Técnico',
        nameEn: 'Technical Closure',
        area: 'Supervisión',
        areaColor: 'orange',
        areaIcon: '🔧',
        icon: '✅',
        description: 'Revisión entregables, inspección con cliente, firma Acta F6, cierre administrativo',
        steps: [
            { id: 's1', label: 'Cierre Técnico', type: 'start' },
            { id: 's2', label: 'Revisión Final de Entregables', type: 'action', responsible: 'Supervisor' },
            { id: 's3', label: 'Inspección Conjunta con Cliente', type: 'action' },
            { id: 's4', label: '¿Cliente Conforme?', type: 'decision', yesLabel: 'Preparar Acta', noLabel: 'Ejecutar Correcciones Finales' },
            { id: 's5', label: 'Preparación Acta Terminación F6', type: 'action' },
            { id: 's6', label: 'Firma Acta F6 (Cliente y MICSA)', type: 'action' },
            { id: 's7', label: 'Integración Carpeta Técnica Final', type: 'action', linkedModule: 'Generador Docs', linkedHref: '/generador-documentos' },
            { id: 's8', label: 'Entrega Documentación Completa', type: 'output' },
            { id: 's9', label: 'Notificar ADM para Facturación', type: 'action' },
            { id: 's10', label: 'Cierre Administrativo Proyecto', type: 'action' },
            { id: 's11', label: 'Proyecto Cerrado', type: 'end' },
        ],
        linkedModules: [
            { name: 'Generador Docs', href: '/generador-documentos', icon: '📄' },
            { name: 'Proyectos', href: '/legacy/projects', icon: '🏗️' },
        ],
    },
    {
        id: 'autorizacion',
        code: 'MICSA-DG-001',
        name: 'Autorización de Proyectos y Gastos Mayores',
        nameEn: 'Project & Major Expense Authorization',
        area: 'Dirección General',
        areaColor: 'rose',
        areaIcon: '👔',
        icon: '🔏',
        description: 'Formato DG-01, revisión DG (2-3 días), análisis técnico/financiero, firma DG-01',
        steps: [
            { id: 's1', label: 'Solicitud Autorización (Formato DG-01)', type: 'start' },
            { id: 's2', label: 'Revisión Dirección General (2-3 días)', type: 'action', responsible: 'DG', sla: '2-3 días' },
            { id: 's3', label: 'Análisis Técnico y Financiero', type: 'action', responsible: 'Gerencia + Finanzas' },
            { id: 's4', label: '¿Cumple criterios técnicos y financieros?', type: 'decision', yesLabel: 'Aprobar - Firma DG-01', noLabel: 'Solicitar Ajustes o Rechazar' },
            { id: 's5', label: 'Archivo en Expediente', type: 'end' },
        ],
        linkedModules: [
            { name: 'Admin Interna', href: '/admin-interna', icon: '🏢' },
        ],
    },
    {
        id: 'validacion',
        code: 'MICSA-PRO-004',
        name: 'Validación Cliente',
        nameEn: 'Client Validation',
        area: 'Proyectos',
        areaColor: 'emerald',
        areaIcon: '🏗️',
        icon: '🔍',
        description: 'Inspección final en sitio, presentación a cliente, firma Acta F6, cierre administrativo',
        steps: [
            { id: 's1', label: 'Validación Final', type: 'start' },
            { id: 's2', label: 'Inspección Final en Sitio', type: 'action', responsible: 'Supervisor' },
            { id: 's3', label: 'Preparación de Documentación Técnica', type: 'action' },
            { id: 's4', label: 'Presentación a Cliente (Revisión Conjunta)', type: 'action' },
            { id: 's5', label: '¿Cliente Conforme?', type: 'decision', yesLabel: 'Firma Acta F6', noLabel: 'Ejecutar Correcciones' },
            { id: 's6', label: 'Firma de Acta F6 (Terminación)', type: 'action' },
            { id: 's7', label: 'Entrega de Proyecto Completo', type: 'output' },
            { id: 's8', label: 'Cierre Administrativo (Notificar ADM/SUP)', type: 'action' },
            { id: 's9', label: 'Validación Completa', type: 'end' },
        ],
        linkedModules: [
            { name: 'Proyectos', href: '/legacy/projects', icon: '🏗️' },
            { name: 'Generador Docs', href: '/generador-documentos', icon: '📄' },
        ],
    },
    {
        id: 'equipo-movil',
        code: 'MICSA-OPS-004',
        name: 'Gestión Equipo Móvil y Herramientas',
        nameEn: 'Mobile Equipment & Tools Management',
        area: 'Operaciones',
        areaColor: 'blue',
        areaIcon: '⚙️',
        icon: '🚛',
        description: 'Renta, asignación, inspección y devolución de equipo móvil — Datos de Renta_de_Equipo_Móvil.xlsx',
        steps: [
            { id: 's1', label: 'Solicitud de Equipo/Herramientas', type: 'start' },
            { id: 's2', label: 'Cotización Proveedores (≥3 Opciones)', type: 'action', responsible: 'Administración' },
            { id: 's3', label: 'Aprobación de Renta/Compra', type: 'decision', yesLabel: 'Aprobar OC', noLabel: 'Buscar Alternativa' },
            { id: 's4', label: 'Emisión OC y Contrato de Renta', type: 'action', linkedModule: 'Egresos', linkedHref: '/legacy/egresos' },
            { id: 's5', label: 'Recepción en Sitio + Inventario', type: 'action', linkedModule: 'Packing List', linkedHref: '/packing-list' },
            { id: 's6', label: 'Inspección Pre-Uso (Seguridad)', type: 'action', linkedModule: 'Seguridad EHS', linkedHref: '/seguridad' },
            { id: 's7', label: '¿Equipo en Condiciones?', type: 'decision', yesLabel: 'Autorizar Uso', noLabel: 'Reportar Proveedor' },
            { id: 's8', label: 'Asignación a Personal (DC3 Vigente)', type: 'action' },
            { id: 's9', label: 'Uso en Proyecto + Bitácora Diaria', type: 'action', linkedModule: 'Reporte Diario', linkedHref: '/reporte-diario' },
            { id: 's10', label: 'Devolución + Inventario Final', type: 'action' },
            { id: 's11', label: 'Cierre Contrato Renta', type: 'end' },
        ],
        linkedModules: [
            { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
            { name: 'Packing List', href: '/packing-list', icon: '📦' },
            { name: 'Egresos', href: '/legacy/egresos', icon: '💸' },
            { name: 'Reporte Diario', href: '/reporte-diario', icon: '📋' },
        ],
    },
    {
        id: 'capacitacion-dc3',
        code: 'MICSA-RH-002',
        name: 'Capacitación y Certificación DC3',
        nameEn: 'DC3 Training & Certification',
        area: 'Recursos Humanos',
        areaColor: 'purple',
        areaIcon: '👥',
        icon: '🎓',
        description: 'Matriz de capacitación por puesto, programación de cursos, emisión DC3, registro STPS — 32 DC3 requeridos',
        steps: [
            { id: 's1', label: 'Identificar Necesidades (Matriz DC3)', type: 'start' },
            { id: 's2', label: 'Programar Cursos por Puesto/Proyecto', type: 'action', responsible: 'RH + Seguridad' },
            { id: 's3', label: 'Contratar Capacitador Externo/Interno', type: 'action' },
            { id: 's4', label: 'Impartir Capacitación (Registro Asistencia)', type: 'action', linkedModule: 'Seguridad EHS', linkedHref: '/seguridad' },
            { id: 's5', label: '¿Evaluación Aprobada?', type: 'decision', yesLabel: 'Emitir DC3', noLabel: 'Re-Capacitar' },
            { id: 's6', label: 'Emisión Constancia DC3', type: 'action' },
            { id: 's7', label: 'Registro ante STPS', type: 'action' },
            { id: 's8', label: 'Archivar en Expediente', type: 'action', linkedModule: 'Expedientes', linkedHref: '/expedientes' },
            { id: 's9', label: '¿DC3 Vigente > 1 Año?', type: 'decision', yesLabel: 'Actualizar', noLabel: 'Programar Renovación' },
            { id: 's10', label: 'Capacitación Completa', type: 'end' },
        ],
        linkedModules: [
            { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
            { name: 'Expedientes', href: '/expedientes', icon: '📁' },
            { name: 'Trabajadores', href: '/trabajadores', icon: '👷' },
        ],
    },
]

/* ─── Lifecycle Order for the Master Process Flow ─── */
const LIFECYCLE_ORDER = [
    { phase: '1. Comercial', icon: '💼', ids: ['cotizacion', 'alta-cliente'], color: 'from-blue-500 to-cyan-500' },
    { phase: '2. Planeación', icon: '📐', ids: ['planificacion', 'autorizacion'], color: 'from-emerald-500 to-teal-500' },
    { phase: '3. RH & Seguridad', icon: '👷', ids: ['alta-personal', 'expediente', 'control-accesos', 'inspeccion-equipos', 'capacitacion-dc3'], color: 'from-violet-500 to-purple-500' },
    { phase: '4. Ejecución', icon: '⚡', ids: ['supervision', 'compras', 'viaticos', 'equipo-movil'], color: 'from-orange-500 to-amber-500' },
    { phase: '5. Cierre', icon: '✅', ids: ['validacion', 'cierre', 'facturacion', 'cobranza'], color: 'from-rose-500 to-pink-500' },
]

/* ─── Step Style Helpers ─── */
const stepStyles: Record<ProcessStep['type'], { bg: string; border: string; shape: string }> = {
    start: { bg: 'bg-pink-500/20', border: 'border-pink-500/50', shape: 'rounded-full' },
    end: { bg: 'bg-red-500/20', border: 'border-red-500/50', shape: 'rounded-full' },
    action: { bg: 'bg-green-500/15', border: 'border-green-500/40', shape: 'rounded-lg' },
    decision: { bg: 'bg-yellow-500/15', border: 'border-yellow-500/40', shape: 'rounded-lg rotate-0' },
    input: { bg: 'bg-blue-500/15', border: 'border-blue-500/40', shape: 'rounded-lg' },
    output: { bg: 'bg-slate-500/15', border: 'border-slate-400/40', shape: 'rounded-lg' },
}

export default function ProcesosPage() {
    const [selectedProcess, setSelectedProcess] = useState<Process | null>(null)
    const [filterArea, setFilterArea] = useState<string>('all')

    const areas = [...new Set(PROCESSES.map(p => p.area))]
    const filtered = filterArea === 'all' ? PROCESSES : PROCESSES.filter(p => p.area === filterArea)

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                    🔄 Mapa de Procesos MICSA OS
                </h1>
                <p className="text-slate-400">
                    {PROCESSES.length} procesos documentados según manuales operativos — conectados a {new Set(PROCESSES.flatMap(p => p.linkedModules.map(m => m.href))).size} módulos del sistema
                </p>
            </div>

            {/* ─── Lifecycle Timeline ─── */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">📋 Ciclo de Vida del Proyecto</h2>
                <div className="flex flex-col lg:flex-row gap-3">
                    {LIFECYCLE_ORDER.map((phase, i) => (
                        <div key={phase.phase} className="flex-1 relative">
                            <div className={`bg-gradient-to-r ${phase.color} rounded-xl p-4 h-full`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">{phase.icon}</span>
                                    <h3 className="font-bold text-white text-sm">{phase.phase}</h3>
                                </div>
                                <div className="space-y-1">
                                    {phase.ids.map(id => {
                                        const proc = PROCESSES.find(p => p.id === id)!
                                        return (
                                            <button
                                                key={id}
                                                onClick={() => setSelectedProcess(proc)}
                                                className="w-full text-left text-xs text-white/80 hover:text-white hover:bg-white/10 rounded px-2 py-1 transition-all flex items-center gap-1.5"
                                            >
                                                <span>{proc.icon}</span>
                                                <span className="truncate">{proc.code}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                            {i < LIFECYCLE_ORDER.length - 1 && (
                                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-500 text-xl">→</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Area Filter */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setFilterArea('all')}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterArea === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    Todos ({PROCESSES.length})
                </button>
                {areas.map(area => (
                    <button
                        key={area}
                        onClick={() => setFilterArea(area)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${filterArea === area ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                    >
                        {area} ({PROCESSES.filter(p => p.area === area).length})
                    </button>
                ))}
            </div>

            {/* Process Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map(proc => (
                    <button
                        key={proc.id}
                        onClick={() => setSelectedProcess(proc)}
                        className={`text-left group p-5 rounded-xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedProcess?.id === proc.id
                            ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/10'
                            : 'bg-slate-800/40 border-slate-700 hover:border-blue-500/50'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-3xl">{proc.icon}</span>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{proc.code}</span>
                                    <span className="text-[10px] text-slate-500">{proc.areaIcon} {proc.area}</span>
                                </div>
                                <h3 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">{proc.name}</h3>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{proc.description}</p>
                                <div className="flex items-center gap-1 mt-2 flex-wrap">
                                    {proc.linkedModules.slice(0, 3).map(m => (
                                        <span key={m.href} className="text-[10px] bg-slate-700/50 text-slate-400 px-1.5 py-0.5 rounded">
                                            {m.icon} {m.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-700/50">
                            <span className="text-[10px] text-slate-500">{proc.steps.length} pasos</span>
                            <span className="text-slate-700">•</span>
                            <span className="text-[10px] text-slate-500">{proc.steps.filter(s => s.type === 'decision').length} decisiones</span>
                            {proc.goldenRule && (
                                <>
                                    <span className="text-slate-700">•</span>
                                    <span className="text-[10px] text-amber-500">⚠️ Golden Rule</span>
                                </>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* ─── Process Detail View ─── */}
            {selectedProcess && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 space-y-6" id="process-detail">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl">{selectedProcess.icon}</span>
                                <div>
                                    <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">{selectedProcess.code}</span>
                                    <h2 className="text-xl font-bold text-white mt-1">{selectedProcess.name}</h2>
                                    <p className="text-sm text-slate-400">{selectedProcess.nameEn}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 mt-2">{selectedProcess.description}</p>
                        </div>
                        <button onClick={() => setSelectedProcess(null)} className="text-slate-500 hover:text-white text-xl p-2">✕</button>
                    </div>

                    {/* Golden Rule */}
                    {selectedProcess.goldenRule && (
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="font-bold text-amber-400 text-sm">GOLDEN RULE</p>
                                <p className="text-amber-300/80 text-sm">{selectedProcess.goldenRule}</p>
                            </div>
                        </div>
                    )}

                    {/* Steps Flow */}
                    <div>
                        <h3 className="font-bold text-white mb-4">Flujo del Proceso</h3>
                        <div className="space-y-2">
                            {selectedProcess.steps.map((step, i) => {
                                const style = stepStyles[step.type]
                                return (
                                    <div key={step.id} className="flex items-stretch gap-3">
                                        {/* Connector Line */}
                                        <div className="flex flex-col items-center w-8 flex-shrink-0">
                                            <div className={`w-8 h-8 ${style.bg} ${style.shape} border ${style.border} flex items-center justify-center text-xs font-bold text-white/70`}>
                                                {i + 1}
                                            </div>
                                            {i < selectedProcess.steps.length - 1 && (
                                                <div className="w-0.5 flex-1 bg-slate-700 min-h-[8px]" />
                                            )}
                                        </div>

                                        {/* Step Content */}
                                        <div className={`flex-1 ${style.bg} border ${style.border} rounded-lg p-3 mb-1`}>
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-white text-sm">{step.label}</p>
                                                {step.type === 'decision' && (
                                                    <div className="flex gap-2 text-[10px]">
                                                        {step.yesLabel && <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">✓ {step.yesLabel}</span>}
                                                        {step.noLabel && <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">✗ {step.noLabel}</span>}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {step.responsible && <span className="text-[10px] text-slate-500">👤 {step.responsible}</span>}
                                                {step.sla && <span className="text-[10px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">⏱️ {step.sla}</span>}
                                                {step.linkedModule && step.linkedHref && (
                                                    <Link href={step.linkedHref} className="text-[10px] text-blue-400 hover:text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded transition-colors">
                                                        🔗 {step.linkedModule}
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Linked Modules */}
                    <div>
                        <h3 className="font-bold text-white mb-3">Módulos Conectados</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {selectedProcess.linkedModules.map(m => (
                                <Link
                                    key={m.href}
                                    href={m.href}
                                    className="flex items-center gap-2 p-3 rounded-xl bg-slate-700/30 border border-slate-600/30 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all group"
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">{m.icon}</span>
                                    <span className="text-sm text-slate-300 group-hover:text-blue-300 transition-colors">{m.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}