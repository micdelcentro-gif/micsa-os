'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════
   MÓDULO DE SEGURIDAD INDUSTRIAL — MICSA OS
   Extraído del inbox: carpeta de seguridad iron cast,
   CSC-01 a CSC-15, Guía EHS, Programa Preventivo,
   Hojas de Instrucción, Inspecciones, LOTO
   ═══════════════════════════════════════════════════════════ */

type DocStatus = 'completo' | 'pendiente' | 'vencido' | 'faltante'
type TabId = 'carpeta' | 'checklists' | 'inspecciones' | 'hojas'

/* ─── CSC Documents (Carpeta de Seguridad) ─── */
interface CSCDoc {
    code: string
    name: string
    description: string
    status: DocStatus
    file?: string
    responsible: string
    category: 'admin' | 'riesgos' | 'personal' | 'ambiental' | 'cierre'
    notes?: string
}

const CSC_DOCS: CSCDoc[] = [
    { code: 'CSC-01', name: 'Especificación Técnica', description: 'Especificación técnica del proyecto/cliente (ej. 43766)', status: 'completo', responsible: 'Proyectos', category: 'admin', file: 'CSC-01 Ejemplo de Especifica Tecnica (1).pdf' },
    { code: 'CSC-02', name: 'Organigrama', description: 'Organigrama de proyecto y seguridad industrial de MICSA', status: 'completo', responsible: 'RH', category: 'admin', file: 'CSC-02 Organigrama (2).docx' },
    { code: 'CSC-03', name: 'Designación de Supervisores', description: 'Designación de Supervisor de Obra y Supervisor de Seguridad con DC3', status: 'pendiente', responsible: 'RH + Gerente HSE', category: 'personal', notes: 'Pendiente: Nombres, firmas y DC3 vigente', file: 'CSC-03 Designacion de Sup. de Obra y Seguridad (1).docx' },
    { code: 'CSC-04', name: 'Acta Constitutiva CSHI', description: 'Acta de la Comisión de Seguridad e Higiene Industrial (5 firmas)', status: 'pendiente', responsible: 'Gerente HSE + Comisión', category: 'admin', notes: 'Requiere reunión constitutiva con 5 firmantes', file: 'CSC-04 Acta Constitutiva de CSHI (1).docx' },
    { code: 'CSC-05', name: 'Análisis de Riesgos ISO 45001', description: 'Análisis de actividades no rutinarias — 67 riesgos identificados en 12 actividades', status: 'completo', responsible: 'Supervisor Seguridad', category: 'riesgos', file: 'CSC-05 Actividades No Rutinarios Rev00 (2).xlsx' },
    { code: 'CSC-06', name: 'Cuadro Básico EPP', description: 'Equipo de protección personal requerido por actividad y puesto', status: 'completo', responsible: 'Supervisor Seguridad', category: 'riesgos', file: 'CSC-06 Cuadro Basico. EPP (1).xls' },
    { code: 'CSC-07', name: 'Programa Preventivo y Checklist', description: 'Programa preventivo de seguridad con checklists de inspección de equipos', status: 'completo', responsible: 'Supervisor Seguridad', category: 'riesgos', file: 'CSC-07 Programa Preventivo de Seguridad y Check list (1).xlsx' },
    { code: 'CSC-08', name: 'Personal Maquinaria y Equipo', description: 'Listado nominal de personal que operará maquinaria y equipo móvil (RFC/NSS/DC3)', status: 'pendiente', responsible: 'RH', category: 'personal', notes: 'Completar tabla con 10+ trabajadores', file: 'CSC-08 Personal que operara maquinaria y equipo movil (1).docx' },
    { code: 'CSC-09', name: 'Aspectos Ambientales ISO 14001', description: 'Identificación de aspectos e impactos ambientales del proyecto', status: 'completo', responsible: 'Supervisor Seguridad', category: 'ambiental', file: 'CSC-09 Identificacion de aspectos ambientales (1).xlsx' },
    { code: 'CSC-10', name: 'Listado Sustancias Químicas', description: 'Inventario de sustancias químicas utilizadas en obra', status: 'pendiente', responsible: 'Supervisor Seguridad', category: 'ambiental', notes: 'Validar con almacén y solicitar HDS', file: 'CSC-10 Listado de sustancias quimicas (2).docx' },
    { code: 'CSC-10.1', name: 'HDS Fichas Técnicas', description: 'Hojas de Datos de Seguridad (SDS/HDS) de cada sustancia química', status: 'pendiente', responsible: 'Supervisor Seguridad', category: 'ambiental', notes: 'Solicitar 8 HDS a proveedores', file: 'CSC-10.1 Ejemplo ficha tecnica Teksid (1).xlsx' },
    { code: 'CSC-11', name: 'Cruz de Seguridad', description: 'Registro visual de días con/sin accidentes — actualización diaria', status: 'completo', responsible: 'Supervisor Seguridad', category: 'riesgos', file: 'CSC-11 Cruz de seguridad (2).pptx' },
    { code: 'CSC-12', name: 'Permisos de Trabajo', description: 'Formato para permisos de trabajo de alto riesgo (altura, confinados, caliente)', status: 'completo', responsible: 'Supervisor Obra', category: 'riesgos', file: 'CSC-12 Permiso de Trabajo 2020 (1).pdf' },
    { code: 'CSC-13', name: 'Listado Pláticas de Seguridad', description: 'Cronograma de pláticas diarias de 5 min y capacitaciones semanales', status: 'pendiente', responsible: 'Supervisor Seguridad', category: 'personal', notes: 'Validar cronograma con planeación', file: 'CSC-13 Listado de platicas de seguridad (1).doc' },
    { code: 'CSC-14', name: 'Registro de Capacitación', description: 'Registro DC3 y evidencia de capacitaciones impartidas al personal', status: 'pendiente', responsible: 'RH', category: 'personal', notes: 'Requiere programar capacitaciones', file: 'CSC-14 Registro de capacitacion (1).xls' },
    { code: 'CSC-15', name: 'Conclusión de Trabajos', description: 'Acta de cierre de actividades en planta — entrega limpia de área', status: 'completo', responsible: 'Supervisor Obra', category: 'cierre', file: 'CSC-15 Conclusion de los trabajos (1).docx' },
]

/* ─── Safety Checklists (from CSC-07 and inspection forms) ─── */
interface ChecklistItem {
    id: string
    item: string
    checked: boolean
    critical: boolean
}

interface SafetyChecklist {
    id: string
    name: string
    icon: string
    category: string
    frequency: string
    items: ChecklistItem[]
    linkedCSC: string
    linkedProcess: string
}

const CHECKLISTS: SafetyChecklist[] = [
    {
        id: 'CL-001', name: 'Inspección Arnés de Seguridad', icon: '🪢', category: 'EPP', frequency: 'Antes de cada uso',
        linkedCSC: 'CSC-07', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'a1', item: 'Revisar costuras y cintas — sin deshilachado', checked: false, critical: true },
            { id: 'a2', item: 'Hebillas y conectores funcionan correctamente', checked: false, critical: true },
            { id: 'a3', item: 'Anillos D sin deformación ni corrosión', checked: false, critical: true },
            { id: 'a4', item: 'Línea de vida sin cortes o daño visible', checked: false, critical: true },
            { id: 'a5', item: 'Amortiguador de impacto sin activación previa', checked: false, critical: true },
            { id: 'a6', item: 'Etiqueta de inspección vigente', checked: false, critical: false },
            { id: 'a7', item: 'Fecha de fabricación < 5 años', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-002', name: 'Inspección de Extintores', icon: '🧯', category: 'Emergencias', frequency: 'Mensual',
        linkedCSC: 'CSC-07', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'e1', item: 'Ubicación visible y accesible', checked: false, critical: true },
            { id: 'e2', item: 'Manómetro en zona verde (presión adecuada)', checked: false, critical: true },
            { id: 'e3', item: 'Sello de seguridad intacto', checked: false, critical: false },
            { id: 'e4', item: 'Manguera sin grietas ni obstrucciones', checked: false, critical: true },
            { id: 'e5', item: 'Etiqueta de recarga vigente', checked: false, critical: true },
            { id: 'e6', item: 'Señalización visible a 15m', checked: false, critical: false },
        ]
    },
    {
        id: 'CL-003', name: 'Inspección Equipo de Izaje', icon: '🏗️', category: 'Equipos', frequency: 'Antes de cada uso',
        linkedCSC: 'CSC-07', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'i1', item: 'Eslingas sin cortes, nudos o deformaciones', checked: false, critical: true },
            { id: 'i2', item: 'Grilletes sin grietas ni desgaste excesivo', checked: false, critical: true },
            { id: 'i3', item: 'Gancho con seguro de cierre funcional', checked: false, critical: true },
            { id: 'i4', item: 'Capacidad nominal visible y legible', checked: false, critical: true },
            { id: 'i5', item: 'Área de maniobra delimitada y libre', checked: false, critical: true },
            { id: 'i6', item: 'Personal capacitado (DC3 vigente)', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-004', name: 'Inspección Escaleras', icon: '🪜', category: 'Equipos', frequency: 'Antes de cada uso',
        linkedCSC: 'CSC-07', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'es1', item: 'Peldaños sin daño, grietas o faltantes', checked: false, critical: true },
            { id: 'es2', item: 'Zapatas antideslizantes en buen estado', checked: false, critical: true },
            { id: 'es3', item: 'Extensión correcta (1m sobre punto de apoyo)', checked: false, critical: true },
            { id: 'es4', item: 'Ángulo de inclinación 75° (relación 4:1)', checked: false, critical: false },
            { id: 'es5', item: 'Asegurada en punto superior', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-005', name: 'Inspección Máquina de Soldar', icon: '⚡', category: 'Equipos', frequency: 'Diaria',
        linkedCSC: 'CSC-07', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 's1', item: 'Cables sin daño, cortes o empalmes improvisados', checked: false, critical: true },
            { id: 's2', item: 'Conexiones firmes y aisladas (porta-electrodo y tierra)', checked: false, critical: true },
            { id: 's3', item: 'Ventilación adecuada en área de trabajo', checked: false, critical: true },
            { id: 's4', item: 'Pantalla anti-radiación / mamparas colocadas', checked: false, critical: false },
            { id: 's5', item: 'Extintor a menos de 5m', checked: false, critical: true },
            { id: 's6', item: 'EPP completo (careta, guantes, mandil, polainas)', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-006', name: 'Inspección Equipo de Corte (Oxicorte)', icon: '🔥', category: 'Equipos', frequency: 'Antes de cada uso',
        linkedCSC: 'CSC-07', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'c1', item: 'Manómetros en rango operativo', checked: false, critical: true },
            { id: 'c2', item: 'Mangueras sin fugas (prueba jabón)', checked: false, critical: true },
            { id: 'c3', item: 'Arrestallamas instalados en ambos tanques', checked: false, critical: true },
            { id: 'c4', item: 'Tanques asegurados verticalmente', checked: false, critical: true },
            { id: 'c5', item: 'Distancia mínima entre tanques O₂ y C₂H₂: 6m', checked: false, critical: true },
            { id: 'c6', item: 'Área libre de materiales combustibles (11m)', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-007', name: 'Inspección Espacios Confinados', icon: '🕳️', category: 'Alto Riesgo', frequency: 'Antes de cada entrada',
        linkedCSC: 'CSC-12', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'ec1', item: 'Permiso de trabajo firmado y vigente', checked: false, critical: true },
            { id: 'ec2', item: 'Monitoreo de atmósfera (O₂, LEL, CO, H₂S)', checked: false, critical: true },
            { id: 'ec3', item: 'Ventilación forzada instalada y operando', checked: false, critical: true },
            { id: 'ec4', item: 'Vigía externo asignado y capacitado', checked: false, critical: true },
            { id: 'ec5', item: 'Equipo de rescate disponible', checked: false, critical: true },
            { id: 'ec6', item: 'LOTO aplicado en todas las fuentes de energía', checked: false, critical: true },
            { id: 'ec7', item: 'Comunicación establecida (radio/señales)', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-008', name: 'Permiso de Trabajo en Altura', icon: '🧗', category: 'Alto Riesgo', frequency: 'Cada actividad',
        linkedCSC: 'CSC-12', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'ta1', item: 'Permiso de trabajo en altura firmado', checked: false, critical: true },
            { id: 'ta2', item: 'Arnés inspeccionado (ver CL-001)', checked: false, critical: true },
            { id: 'ta3', item: 'Punto de anclaje certificado (5,000 lbs)', checked: false, critical: true },
            { id: 'ta4', item: 'Área inferior delimitada y señalizada', checked: false, critical: true },
            { id: 'ta5', item: 'Condiciones climáticas favorables (sin viento >40km/h)', checked: false, critical: true },
            { id: 'ta6', item: 'Trabajador capacitado (DC3 altura vigente)', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-009', name: 'Bloqueo y Etiquetado (LOTO)', icon: '🔒', category: 'Alto Riesgo', frequency: 'Cada intervención',
        linkedCSC: 'CSC-12', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'l1', item: 'Identificar TODAS las fuentes de energía', checked: false, critical: true },
            { id: 'l2', item: 'Notificar al personal afectado', checked: false, critical: true },
            { id: 'l3', item: 'Apagar equipo con procedimiento normal', checked: false, critical: true },
            { id: 'l4', item: 'Aplicar candado y etiqueta personal', checked: false, critical: true },
            { id: 'l5', item: 'Verificar energía cero (intento de arranque)', checked: false, critical: true },
            { id: 'l6', item: 'Liberar energía residual (capacitores, presión, gravedad)', checked: false, critical: true },
        ]
    },
    {
        id: 'CL-010', name: 'Equipo Móvil (Montacargas/Grúa)', icon: '🚜', category: 'Equipos', frequency: 'Antes de cada turno',
        linkedCSC: 'CSC-08', linkedProcess: 'MICSA-SEG-002',
        items: [
            { id: 'em1', item: 'Operador con licencia interna vigente y DC3', checked: false, critical: true },
            { id: 'em2', item: 'Frenos de servicio y estacionamiento funcionan', checked: false, critical: true },
            { id: 'em3', item: 'Claxon, alarma de reversa y luces operativos', checked: false, critical: true },
            { id: 'em4', item: 'Niveles de aceite, combustible y refrigerante OK', checked: false, critical: false },
            { id: 'em5', item: 'Cinturón de seguridad funcional', checked: false, critical: true },
            { id: 'em6', item: 'Extintor montado y cargado', checked: false, critical: true },
        ]
    },
]

/* ─── Hojas de Instrucción (Safety Instruction Sheets) ─── */
interface HojaInstruccion {
    code: string
    name: string
    revision: string
    status: DocStatus
    file?: string
}

const HOJAS_INSTRUCCION: HojaInstruccion[] = [
    { code: 'HI COR-08', name: 'Manejo de Materiales Químicos', revision: 'Rev.03', status: 'completo', file: 'Hoja de Instruccion COR-08 Manejo de Materiales Quimicos Rev.03 (1).pdf' },
    { code: 'HI COR-15', name: 'Trabajos en Altura', revision: 'Rev.04', status: 'completo', file: 'Hoja de instruccion Trabajos en altura Rev.04 (1).pdf' },
    { code: 'HI COR-16', name: 'Trabajos de Soldadura', revision: 'Rev.04', status: 'completo', file: 'Hoja de Instruccion Trabajos de Soldadura Rev.04 (1).pdf' },
    { code: 'HI COR-19', name: 'Trabajos en Espacios Confinados', revision: 'Rev.03', status: 'completo', file: 'Hoja de Instruccion Trabajos en espacios confinados Rev.03 (1).pdf' },
    { code: 'HI COR-20', name: 'Etiquetado y Candadeo (LOTO)', revision: 'Rev.00', status: 'completo', file: 'Hoja de Instruccion Etiquetado y candadeo Rev 00 (1).pdf' },
    { code: 'HI COM-00', name: 'Peatones', revision: 'Rev.00', status: 'completo', file: 'Hoja de Instruccion Peatones Rev00 (1).pdf' },
]

/* ─── Inspection PDFs from inbox ─── */
interface InspectionDoc {
    name: string
    icon: string
    status: DocStatus
    file: string
}

const INSPECTION_DOCS: InspectionDoc[] = [
    { name: 'Arnés de Seguridad', icon: '🪢', status: 'completo', file: 'ARNES MICSA.pdf' },
    { name: 'Accesorios de Izaje', icon: '⛓️', status: 'completo', file: 'ACCESORIOS DE IZAJE.pdf' },
    { name: 'Elementos de Izaje', icon: '🏗️', status: 'completo', file: 'ELEMENTOS DE IZAJE MICSA.pdf' },
    { name: 'Equipo de Corte (Oxicorte)', icon: '🔥', status: 'completo', file: 'EQUIPO DE CORTE MICSA.pdf' },
    { name: 'Equipo Móvil', icon: '🚜', status: 'completo', file: 'EQUIPO MOVIL MICSA.pdf' },
    { name: 'Escalera Fija', icon: '🪜', status: 'completo', file: 'ESCALERA 1 MICSA.pdf' },
    { name: 'Escalera Móvil', icon: '🪜', status: 'completo', file: 'ESCALERA MOVIL MICSA.pdf' },
    { name: 'Espacios Confinados', icon: '🕳️', status: 'completo', file: 'ESPACIOS CONFINADOS MICSA.pdf' },
    { name: 'Extintores', icon: '🧯', status: 'completo', file: 'EXTINTORES MICSA.pdf' },
    { name: 'Grúa', icon: '🏗️', status: 'completo', file: 'GRUA MICSA 1.pdf' },
    { name: 'Herramientas Manuales', icon: '🔧', status: 'completo', file: 'HERRAMIENTAS MANUALES MICSA.pdf' },
    { name: 'Instalación Eléctrica', icon: '⚡', status: 'completo', file: 'INSTALACION ELECTRICA.pdf' },
    { name: 'Máquina de Soldar', icon: '🔧', status: 'completo', file: 'MAQUINA DE SOLDAR MICSA.pdf' },
    { name: 'Montacargas (Mantlif)', icon: '🚜', status: 'completo', file: 'MANTLIF MICSA.pdf' },
    { name: 'OLY (Plataforma Elevada)', icon: '🏗️', status: 'completo', file: 'OLY MICSA.pdf' },
    { name: 'Programa Preventivo', icon: '📋', status: 'completo', file: 'PROGRAMA PREVENTIVO MICSA.pdf' },
    { name: 'Soldadura en Espacios Confinados', icon: '🔥', status: 'completo', file: 'SOLDADURA EN ESPACIOS CONFINADOS .pdf' },
    { name: 'Tarjeta de Bloqueo (LOTO)', icon: '🔒', status: 'completo', file: 'TARJETA DE BLOQUEO MICSA.pdf' },
    { name: 'Reporte de Horas Seguridad', icon: '⏱️', status: 'completo', file: 'REPORTE MICSA HORAS.pdf' },
]

/* ─── Status Styles ─── */
const STATUS: Record<DocStatus, { icon: string; label: string; bg: string; text: string }> = {
    completo: { icon: '✅', label: 'Completo', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    pendiente: { icon: '⏳', label: 'Pendiente', bg: 'bg-amber-500/15', text: 'text-amber-400' },
    vencido: { icon: '🔴', label: 'Vencido', bg: 'bg-red-500/15', text: 'text-red-400' },
    faltante: { icon: '❌', label: 'Faltante', bg: 'bg-slate-500/15', text: 'text-slate-500' },
}

const CATEGORY_LABELS: Record<string, { icon: string; label: string; color: string }> = {
    admin: { icon: '📋', label: 'Administrativo', color: 'blue' },
    riesgos: { icon: '⚠️', label: 'Riesgos y EPP', color: 'amber' },
    personal: { icon: '👷', label: 'Personal y Capacitación', color: 'violet' },
    ambiental: { icon: '🌿', label: 'Ambiental y Químicos', color: 'emerald' },
    cierre: { icon: '✅', label: 'Cierre', color: 'rose' },
}

/* ─── Component ─── */
export default function SeguridadPage() {
    const [activeTab, setActiveTab] = useState<TabId>('carpeta')
    const [checklistStates, setChecklistStates] = useState<Record<string, boolean[]>>({})
    const [expandedChecklist, setExpandedChecklist] = useState<string | null>(null)
    const [filterCategory, setFilterCategory] = useState('todos')

    const toggleCheck = (clId: string, itemIdx: number) => {
        setChecklistStates(prev => {
            const cl = CHECKLISTS.find(c => c.id === clId)
            if (!cl) return prev
            const current = prev[clId] || cl.items.map(() => false)
            const updated = [...current]
            updated[itemIdx] = !updated[itemIdx]
            return { ...prev, [clId]: updated }
        })
    }

    const getChecklistProgress = (clId: string) => {
        const cl = CHECKLISTS.find(c => c.id === clId)
        if (!cl) return { checked: 0, total: 0, pct: 0 }
        const states = checklistStates[clId] || cl.items.map(() => false)
        const checked = states.filter(Boolean).length
        return { checked, total: cl.items.length, pct: Math.round((checked / cl.items.length) * 100) }
    }

    // Global stats
    const cscComplete = CSC_DOCS.filter(d => d.status === 'completo').length
    const cscTotal = CSC_DOCS.length
    const cscPct = Math.round((cscComplete / cscTotal) * 100)

    const tabs: { id: TabId; label: string; icon: string; count: number }[] = [
        { id: 'carpeta', label: 'Carpeta de Seguridad', icon: '📂', count: cscTotal },
        { id: 'checklists', label: 'Checklists de Inspección', icon: '☑️', count: CHECKLISTS.length },
        { id: 'inspecciones', label: 'Formatos de Inspección', icon: '📋', count: INSPECTION_DOCS.length },
        { id: 'hojas', label: 'Hojas de Instrucción', icon: '📄', count: HOJAS_INSTRUCCION.length },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">🛡️ Seguridad Industrial</h1>
                    <p className="text-slate-400 mt-1">
                        Carpeta EHS • Checklists • Inspecciones • ISO 45001 — Enlazado con{' '}
                        <Link href="/procesos" className="text-blue-400 hover:text-blue-300">Procesos</Link>{' '}y{' '}
                        <Link href="/expedientes" className="text-blue-400 hover:text-blue-300">Expedientes</Link>
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                    { label: 'Carpeta CSC', value: `${cscComplete}/${cscTotal}`, icon: '📂', pct: cscPct, gradient: 'from-blue-600/20 to-blue-800/20', border: 'border-blue-500/30' },
                    { label: 'Inspecciones', value: `${INSPECTION_DOCS.length}`, icon: '📋', pct: 100, gradient: 'from-emerald-600/20 to-emerald-800/20', border: 'border-emerald-500/30' },
                    { label: 'Checklists', value: `${CHECKLISTS.length}`, icon: '☑️', pct: null, gradient: 'from-amber-600/20 to-amber-800/20', border: 'border-amber-500/30' },
                    { label: 'Hojas Instrucción', value: `${HOJAS_INSTRUCCION.length}`, icon: '📄', pct: 100, gradient: 'from-violet-600/20 to-violet-800/20', border: 'border-violet-500/30' },
                    { label: 'Cumplimiento', value: '88%', icon: '🎯', pct: 88, gradient: 'from-rose-600/20 to-rose-800/20', border: 'border-rose-500/30' },
                ].map(s => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-xl p-4`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">{s.icon}</span>
                            {s.pct !== null && (
                                <span className={`text-xs font-bold ${s.pct === 100 ? 'text-emerald-400' : s.pct >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>{s.pct}%</span>
                            )}
                        </div>
                        <p className="text-lg font-bold text-white">{s.value}</p>
                        <p className="text-[11px] text-slate-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap border-b border-slate-700/50 pb-3">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? 'bg-blue-600/20 text-blue-400 border-b-2 border-blue-500'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                        <span>{tab.icon}</span> {tab.label}
                        <span className="text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded-full">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* ═══ TAB: CARPETA DE SEGURIDAD (CSC-01 to CSC-15) ═══ */}
            {activeTab === 'carpeta' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-white">📂 Documentos CSC — Carpeta EHS por Proyecto</h2>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full" style={{ width: `${cscPct}%` }} />
                            </div>
                            <span className="text-sm font-bold text-white">{cscPct}%</span>
                        </div>
                    </div>

                    {/* Category Filter */}
                    <div className="flex gap-2 flex-wrap">
                        <button onClick={() => setFilterCategory('todos')}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterCategory === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                            Todos ({CSC_DOCS.length})
                        </button>
                        {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                            <button key={key} onClick={() => setFilterCategory(key)}
                                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${filterCategory === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                                {val.icon} {val.label} ({CSC_DOCS.filter(d => d.category === key).length})
                            </button>
                        ))}
                    </div>

                    {/* CSC Document List */}
                    <div className="space-y-2">
                        {CSC_DOCS.filter(d => filterCategory === 'todos' || d.category === filterCategory).map(doc => {
                            const st = STATUS[doc.status]
                            const cat = CATEGORY_LABELS[doc.category]
                            return (
                                <div key={doc.code} className={`${st.bg} border border-transparent hover:border-slate-600 rounded-xl p-4 transition-all`}>
                                    <div className="flex items-start gap-3">
                                        <span className="text-lg">{st.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">{doc.code}</span>
                                                <h3 className="font-bold text-white text-sm">{doc.name}</h3>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${st.bg} ${st.text}`}>{st.label}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">{doc.description}</p>
                                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                                                <span>{cat.icon} {cat.label}</span>
                                                <span>👤 {doc.responsible}</span>
                                                {doc.file && <span className="text-blue-400/60">📎 {doc.file.substring(0, 40)}...</span>}
                                            </div>
                                            {doc.notes && (
                                                <p className="text-[11px] text-amber-400 mt-1">💡 {doc.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Compliance Matrix */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 mt-4">
                        <h3 className="font-bold text-white text-sm mb-3">📊 Matriz de Cumplimiento</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { standard: 'ISO 45001:2018', req: 22, complete: 19, pct: 86 },
                                { standard: 'NOM-STPS', req: 18, complete: 15, pct: 83 },
                                { standard: 'Requisitos Cliente', req: 12, complete: 12, pct: 100 },
                                { standard: 'Esp. Técnica', req: 16, complete: 14, pct: 87 },
                            ].map(m => (
                                <div key={m.standard} className="bg-slate-700/30 rounded-lg p-3">
                                    <p className="text-xs text-slate-400">{m.standard}</p>
                                    <p className="text-lg font-bold text-white">{m.complete}/{m.req}</p>
                                    <div className="h-1.5 bg-slate-600 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full rounded-full ${m.pct === 100 ? 'bg-emerald-500' : m.pct >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${m.pct}%` }} />
                                    </div>
                                    <p className={`text-[10px] mt-1 font-bold ${m.pct === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>{m.pct}%</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB: CHECKLISTS DE INSPECCIÓN ═══ */}
            {activeTab === 'checklists' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">☑️ Checklists de Inspección de Seguridad</h2>
                    <p className="text-xs text-slate-500">Basados en CSC-07 Programa Preventivo, CSC-12 Permisos de Trabajo, y los formatos de inspección del inbox</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CHECKLISTS.map(cl => {
                            const prog = getChecklistProgress(cl.id)
                            const isExpanded = expandedChecklist === cl.id
                            return (
                                <div key={cl.id} className={`bg-slate-800/40 border rounded-xl overflow-hidden transition-all ${isExpanded ? 'border-blue-500 shadow-lg shadow-blue-500/10 col-span-1 md:col-span-2' : 'border-slate-700/50 hover:border-slate-600'}`}>
                                    <button onClick={() => setExpandedChecklist(isExpanded ? null : cl.id)}
                                        className="w-full text-left p-4 flex items-center gap-3">
                                        <span className="text-2xl">{cl.icon}</span>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <h3 className="font-bold text-white text-sm">{cl.name}</h3>
                                                <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded">{cl.category}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500">🔄 {cl.frequency} • 🔗 {cl.linkedCSC}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-bold ${prog.pct === 100 ? 'text-emerald-400' : prog.pct > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                                                {prog.checked}/{prog.total}
                                            </p>
                                            <div className="h-1.5 w-16 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all ${prog.pct === 100 ? 'bg-emerald-500' : prog.pct > 0 ? 'bg-amber-500' : 'bg-slate-600'}`} style={{ width: `${prog.pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-slate-500 text-sm">{isExpanded ? '▲' : '▼'}</span>
                                    </button>

                                    {isExpanded && (
                                        <div className="px-4 pb-4 space-y-1.5 border-t border-slate-700/50 pt-3">
                                            {cl.items.map((item, idx) => {
                                                const states = checklistStates[cl.id] || cl.items.map(() => false)
                                                const isChecked = states[idx]
                                                return (
                                                    <button key={item.id} onClick={() => toggleCheck(cl.id, idx)}
                                                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isChecked ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-700/20 border border-transparent hover:border-slate-600'}`}>
                                                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 ${isChecked ? 'bg-emerald-500 text-white' : 'bg-slate-700 border border-slate-600'}`}>
                                                            {isChecked ? '✓' : ''}
                                                        </span>
                                                        <span className={`text-sm flex-1 ${isChecked ? 'text-emerald-300 line-through opacity-70' : 'text-slate-300'}`}>{item.item}</span>
                                                        {item.critical && (
                                                            <span className="text-[9px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-bold">CRÍTICO</span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                            {prog.pct === 100 && (
                                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3 text-center mt-2">
                                                    <p className="text-emerald-400 font-bold text-sm">✅ Inspección completa — Equipo aprobado para uso</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* ═══ TAB: FORMATOS DE INSPECCIÓN ═══ */}
            {activeTab === 'inspecciones' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">📋 Formatos de Inspección (Documentos del Inbox)</h2>
                    <p className="text-xs text-slate-500">Todos los PDFs de inspección extraídos de la carpeta inbox_documentos — {INSPECTION_DOCS.length} formatos disponibles</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {INSPECTION_DOCS.map(doc => (
                            <div key={doc.file} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-all group">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{doc.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">{doc.name}</h3>
                                        <p className="text-[10px] text-slate-500 truncate mt-0.5">📎 {doc.file}</p>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS[doc.status].bg} ${STATUS[doc.status].text}`}>
                                        {STATUS[doc.status].icon} {STATUS[doc.status].label}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ═══ TAB: HOJAS DE INSTRUCCIÓN ═══ */}
            {activeTab === 'hojas' && (
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">📄 Hojas de Instrucción (HI)</h2>
                    <p className="text-xs text-slate-500">Procedimientos operativos estándar para actividades de alto riesgo — Vinculados a CSC-12 Permisos de Trabajo</p>

                    <div className="space-y-2">
                        {HOJAS_INSTRUCCION.map(hi => (
                            <div key={hi.code} className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                                <span className="text-lg">📄</span>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">{hi.code}</span>
                                        <h3 className="font-bold text-white text-sm">{hi.name}</h3>
                                        <span className="text-[10px] text-slate-500">{hi.revision}</span>
                                    </div>
                                    {hi.file && <p className="text-[10px] text-slate-500 mt-0.5">📎 {hi.file}</p>}
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${STATUS[hi.status].bg} ${STATUS[hi.status].text}`}>
                                    {STATUS[hi.status].icon} {STATUS[hi.status].label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Link to process map */}
                    <Link href="/procesos" className="block bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 hover:border-blue-500/40 transition-all group">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl group-hover:scale-110 transition-transform">🔗</span>
                            <div>
                                <p className="font-bold text-blue-400 text-sm">Ver Procesos de Seguridad Relacionados</p>
                                <p className="text-xs text-slate-500">MICSA-SEG-001 Alta con EHS • MICSA-SEG-002 Inspección de Equipos • MICSA-SEG-EXP-001 Expediente Planta</p>
                            </div>
                        </div>
                    </Link>
                </div>
            )}
        </div>
    )
}
