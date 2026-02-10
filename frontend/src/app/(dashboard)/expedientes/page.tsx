'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════
   DOCUMENT CHECKLIST TEMPLATES
   Based on MICSA Plant Access Dossier (Expediente) Flowchart
   ═══════════════════════════════════════════════════════════ */

type DocStatus = 'ok' | 'pending' | 'expired' | 'missing'
type ExpStatus = 'aprobado' | 'en_revision' | 'pendiente' | 'rechazado'

interface DocumentItem {
    id: string
    name: string
    required: boolean
    status: DocStatus
    expiry?: string
    notes?: string
}

interface DocumentSection {
    title: string
    icon: string
    color: string
    docs: DocumentItem[]
}

interface Expediente {
    id: string
    tipo: 'acceso_planta' | 'proyecto' | 'empleado' | 'proveedor' | 'mensual' | 'legal' | 'poliza' | 'proceso'
    nombre: string
    trabajador?: string
    nss?: string
    proyecto?: string
    responsable: string
    estado: ExpStatus
    fechaCreacion: string
    fechaActualizacion: string
    fechaVigencia?: string
    sections: DocumentSection[]
    permisos?: string[]
    alertas: string[]
    linkedProcess?: { code: string; name: string; href: string }
}

/* ─── Document Templates per Dossier Type ─── */
const TEMPLATE_ACCESO_PLANTA = (name: string, nss: string): DocumentSection[] => [
    {
        title: 'PROYECTO / DOCUMENTOS_PROYECTO',
        icon: '📂',
        color: 'emerald',
        docs: [
            { id: 'dp1', name: 'Comprobante de Pago (IMSS)', required: true, status: 'ok' },
            { id: 'dp2', name: 'IMSS PAM (Plataforma)', required: true, status: 'ok' },
            { id: 'dp3', name: 'IMSS Cuota Obrero-Patronal (SUA)', required: true, status: 'ok' },
            { id: 'dp4', name: 'Registro Patronal', required: true, status: 'ok' },
            { id: 'dp5', name: 'F-SGI-054 (Formato Seguridad)', required: true, status: 'pending' },
        ]
    },
    {
        title: `PERSONAL / ${name.toUpperCase()}`,
        icon: '👤',
        color: 'blue',
        docs: [
            { id: 'pe1', name: `Certificado NSS (IDSE) — ${nss}`, required: true, status: 'ok' },
            { id: 'pe2', name: 'INE (Credencial de Elector)', required: true, status: 'ok' },
            { id: 'pe3', name: 'CURP', required: true, status: 'ok' },
            { id: 'pe4', name: 'Comprobante de Domicilio', required: true, status: 'ok' },
            { id: 'pe5', name: 'Examen Médico', required: true, status: 'ok', expiry: '2026-11-28' },
            { id: 'pe6', name: 'Capacitación Seguridad (DC3)', required: true, status: 'ok', expiry: '2026-11-28' },
            { id: 'pe7', name: 'Licencia de Conducir', required: false, status: 'ok', expiry: '2027-06-15' },
            { id: 'pe8', name: 'Contrato Laboral', required: true, status: 'ok' },
        ]
    },
]

const TEMPLATE_EMPLEADO = (name: string): DocumentSection[] => [
    {
        title: 'DOCUMENTOS DE IDENTIDAD',
        icon: '🪪',
        color: 'violet',
        docs: [
            { id: 'id1', name: 'INE (ambos lados)', required: true, status: 'ok' },
            { id: 'id2', name: 'CURP', required: true, status: 'ok' },
            { id: 'id3', name: 'Acta de Nacimiento', required: true, status: 'pending' },
            { id: 'id4', name: 'Comprobante de Domicilio (≤3 meses)', required: true, status: 'ok' },
            { id: 'id5', name: 'RFC (Constancia SAT)', required: true, status: 'missing' },
        ]
    },
    {
        title: 'DOCUMENTOS LABORALES',
        icon: '📋',
        color: 'amber',
        docs: [
            { id: 'lb1', name: 'Contrato de Trabajo Firmado', required: true, status: 'ok' },
            { id: 'lb2', name: 'NDA / Confidencialidad', required: true, status: 'ok' },
            { id: 'lb3', name: 'Alta IMSS (movimiento afiliatorio)', required: true, status: 'pending' },
            { id: 'lb4', name: 'Número de Seguridad Social (NSS)', required: true, status: 'ok' },
            { id: 'lb5', name: 'FONACOT (si aplica)', required: false, status: 'missing' },
            { id: 'lb6', name: 'INFONAVIT (aviso retención)', required: false, status: 'missing' },
        ]
    },
    {
        title: 'SEGURIDAD Y SALUD',
        icon: '🛡️',
        color: 'red',
        docs: [
            { id: 'ss1', name: 'Examen Médico de Ingreso', required: true, status: 'ok' },
            { id: 'ss2', name: 'DC3 - Capacitación Seguridad', required: true, status: 'pending', notes: 'Programar antes de envío a planta' },
            { id: 'ss3', name: 'Antidoping', required: true, status: 'missing' },
            { id: 'ss4', name: 'Constancia de Habilidades (STyPS)', required: false, status: 'missing' },
        ]
    },
    {
        title: 'DOCUMENTOS FINANCIEROS',
        icon: '🏦',
        color: 'cyan',
        docs: [
            { id: 'fn1', name: 'Cuenta Bancaria (CLABE)', required: true, status: 'ok' },
            { id: 'fn2', name: 'Estado de Cuenta (carátula)', required: true, status: 'ok' },
        ]
    },
]

/* ─── Mock Data ─── */
const EXPEDIENTES: Expediente[] = [
    {
        id: 'EXP-2026-001',
        tipo: 'acceso_planta',
        nombre: 'Acceso Planta Ironcast - P1',
        trabajador: 'Guzman Alvarado Sergio',
        nss: '41169702127',
        proyecto: 'Fabricación Estructura Metálica',
        responsable: 'Seguridad Industrial',
        estado: 'aprobado',
        fechaCreacion: '2025-11-01',
        fechaActualizacion: '2025-11-28',
        fechaVigencia: '2026-11-28',
        sections: TEMPLATE_ACCESO_PLANTA('Sergio Guzman', '41169702127'),
        permisos: ['Entrada Principal', 'Área de Producción', 'Almacén General', 'Comedor', 'Estacionamiento'],
        alertas: [],
        linkedProcess: { code: 'MICSA-SEG-EXP-001', name: 'Expediente para Envío a Planta', href: '/procesos' },
    },
    {
        id: 'EXP-2026-002',
        tipo: 'acceso_planta',
        nombre: 'Acceso Planta PEMEX - Refinería',
        trabajador: 'López Martínez Carlos',
        nss: '52281903238',
        proyecto: 'Mantenimiento Industrial T-4',
        responsable: 'Seguridad Industrial',
        estado: 'pendiente',
        fechaCreacion: '2026-02-05',
        fechaActualizacion: '2026-02-07',
        sections: [
            {
                title: 'PROYECTO / DOCUMENTOS_PROYECTO',
                icon: '📂',
                color: 'emerald',
                docs: [
                    { id: 'dp1', name: 'Comprobante de Pago (IMSS)', required: true, status: 'ok' },
                    { id: 'dp2', name: 'IMSS PAM', required: true, status: 'pending' },
                    { id: 'dp3', name: 'IMSS Cuota SUA', required: true, status: 'missing' },
                    { id: 'dp4', name: 'Registro Patronal', required: true, status: 'ok' },
                    { id: 'dp5', name: 'F-SGI-054', required: true, status: 'missing' },
                    { id: 'dp6', name: 'Análisis de Seguridad (AST)', required: true, status: 'missing' },
                    { id: 'dp7', name: 'Plan de Trabajo', required: true, status: 'pending' },
                ]
            },
            {
                title: 'PERSONAL / LÓPEZ MARTÍNEZ CARLOS',
                icon: '👤',
                color: 'blue',
                docs: [
                    { id: 'pe1', name: 'Certificado NSS (IDSE)', required: true, status: 'ok' },
                    { id: 'pe2', name: 'INE', required: true, status: 'ok' },
                    { id: 'pe3', name: 'CURP', required: true, status: 'ok' },
                    { id: 'pe4', name: 'Comprobante de Domicilio', required: true, status: 'expired', expiry: '2025-11-01' },
                    { id: 'pe5', name: 'Examen Médico', required: true, status: 'missing' },
                    { id: 'pe6', name: 'DC3 Seguridad', required: true, status: 'missing' },
                    { id: 'pe7', name: 'Antidoping', required: true, status: 'missing' },
                    { id: 'pe8', name: 'Contrato Laboral', required: true, status: 'ok' },
                    { id: 'pe9', name: 'Licencia de Conducir', required: false, status: 'pending' },
                ]
            },
        ],
        permisos: [],
        alertas: ['Comprobante de domicilio vencido', 'Faltan 5 documentos obligatorios', 'DC3 no vigente - programar capacitación'],
        linkedProcess: { code: 'MICSA-SEG-EXP-001', name: 'Expediente para Envío a Planta', href: '/procesos' },
    },
    {
        id: 'EXP-2026-003',
        tipo: 'empleado',
        nombre: 'Alta Personal - Juan Pérez',
        trabajador: 'Juan Pérez García',
        responsable: 'Recursos Humanos',
        estado: 'en_revision',
        fechaCreacion: '2026-01-10',
        fechaActualizacion: '2026-02-05',
        sections: TEMPLATE_EMPLEADO('Juan Pérez García'),
        alertas: ['RFC faltante - solicitar al empleado', 'DC3 pendiente de programar'],
        linkedProcess: { code: 'MICSA-RH-001', name: 'Alta de Personal', href: '/procesos' },
    },
    {
        id: 'EXP-2026-004',
        tipo: 'proyecto',
        nombre: 'Carpeta Técnica - Ironcast Fase 2',
        proyecto: 'Fabricación Estructura Metálica F2',
        responsable: 'Proyectos',
        estado: 'en_revision',
        fechaCreacion: '2026-01-20',
        fechaActualizacion: '2026-02-06',
        sections: [
            {
                title: 'DOCUMENTACIÓN TÉCNICA',
                icon: '📐',
                color: 'emerald',
                docs: [
                    { id: 'tc1', name: 'Orden de Compra (OC)', required: true, status: 'ok' },
                    { id: 'tc2', name: 'Cotización Aprobada', required: true, status: 'ok' },
                    { id: 'tc3', name: 'Planos de Ingeniería (DWG/PDF)', required: true, status: 'ok' },
                    { id: 'tc4', name: 'Programa de Obra', required: true, status: 'pending' },
                    { id: 'tc5', name: 'Análisis de Riesgos (AST)', required: true, status: 'ok' },
                    { id: 'tc6', name: 'Procedimientos de Soldadura (WPS)', required: true, status: 'ok' },
                ]
            },
            {
                title: 'CALIDAD Y CERTIFICACIONES',
                icon: '✅',
                color: 'blue',
                docs: [
                    { id: 'qa1', name: 'Plan de Calidad del Proyecto', required: true, status: 'pending' },
                    { id: 'qa2', name: 'Certificados de Material (MTR)', required: true, status: 'ok' },
                    { id: 'qa3', name: 'Registros de Inspección Visual', required: true, status: 'missing' },
                    { id: 'qa4', name: 'Reportes de END (PT/UT)', required: false, status: 'missing' },
                    { id: 'qa5', name: 'Dossier de Calidad Final', required: true, status: 'missing' },
                ]
            },
            {
                title: 'ENTREGABLES FINALES',
                icon: '📦',
                color: 'amber',
                docs: [
                    { id: 'ef1', name: 'Acta de Terminación F6', required: true, status: 'missing' },
                    { id: 'ef2', name: 'Registro Fotográfico (F12)', required: true, status: 'pending' },
                    { id: 'ef3', name: 'Packing List de Embarque', required: true, status: 'missing' },
                    { id: 'ef4', name: 'Factura (CFDI)', required: true, status: 'missing' },
                ]
            },
        ],
        alertas: ['Programa de obra pendiente', 'Dossier de calidad sin iniciar'],
        linkedProcess: { code: 'MICSA-SUP-004', name: 'Cierre Técnico', href: '/procesos' },
    },
    {
        id: 'EXP-2026-005',
        tipo: 'proveedor',
        nombre: 'Aceros del Norte SA de CV',
        responsable: 'Administración',
        estado: 'aprobado',
        fechaCreacion: '2026-01-05',
        fechaActualizacion: '2026-02-01',
        sections: [
            {
                title: 'DOCUMENTOS FISCALES',
                icon: '🧾',
                color: 'amber',
                docs: [
                    { id: 'pv1', name: 'Constancia de Situación Fiscal (CSF)', required: true, status: 'ok' },
                    { id: 'pv2', name: 'Opinión de Cumplimiento SAT', required: true, status: 'ok', expiry: '2026-03-01' },
                    { id: 'pv3', name: 'Opinión de Cumplimiento IMSS', required: true, status: 'ok', expiry: '2026-03-01' },
                    { id: 'pv4', name: 'Acta Constitutiva', required: true, status: 'ok' },
                    { id: 'pv5', name: 'Poder del Representante Legal', required: true, status: 'ok' },
                    { id: 'pv6', name: 'INE del Representante', required: true, status: 'ok' },
                    { id: 'pv7', name: 'Carátula Bancaria (CLABE)', required: true, status: 'ok' },
                    { id: 'pv8', name: 'Registro REPSE (si aplica)', required: false, status: 'ok' },
                ]
            },
        ],
        alertas: [],
        linkedProcess: { code: 'MICSA-ADM-002', name: 'Alta Cliente y OC', href: '/procesos' },
    },
    {
        id: 'EXP-2026-006',
        tipo: 'mensual',
        nombre: 'Febrero 2026 - Pagos y Nómina',
        responsable: 'Contabilidad',
        estado: 'pendiente',
        fechaCreacion: '2026-02-01',
        fechaActualizacion: '2026-02-07',
        sections: [
            {
                title: 'NÓMINA Y PAGOS',
                icon: '💰',
                color: 'violet',
                docs: [
                    { id: 'nm1', name: 'Recibos de Nómina Timbrados (Q1)', required: true, status: 'ok' },
                    { id: 'nm2', name: 'Recibos de Nómina Timbrados (Q2)', required: true, status: 'missing' },
                    { id: 'nm3', name: 'Pago IMSS Mensual', required: true, status: 'pending' },
                    { id: 'nm4', name: 'Pago INFONAVIT', required: true, status: 'missing' },
                    { id: 'nm5', name: 'Declaración ISR Retenciones', required: true, status: 'missing' },
                    { id: 'nm6', name: 'REPSE - Reporte Mensual', required: true, status: 'missing' },
                ]
            },
        ],
        alertas: ['IMSS pago vence el 17 de febrero'],
        linkedProcess: { code: 'MICSA-ADM-001', name: 'Facturación', href: '/procesos' },
    },
]

/* ─── Helpers ─── */
const STATUS_CONFIG: Record<DocStatus, { icon: string; label: string; bg: string; text: string }> = {
    ok: { icon: '✅', label: 'Completo', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
    pending: { icon: '⏳', label: 'Pendiente', bg: 'bg-amber-500/15', text: 'text-amber-400' },
    expired: { icon: '🔴', label: 'Vencido', bg: 'bg-red-500/15', text: 'text-red-400' },
    missing: { icon: '❌', label: 'Faltante', bg: 'bg-slate-500/15', text: 'text-slate-500' },
}

const EXP_STATUS: Record<ExpStatus, { label: string; bg: string; text: string; ring: string }> = {
    aprobado: { label: '✅ APROBADO', bg: 'bg-emerald-500/20', text: 'text-emerald-400', ring: 'ring-emerald-500/30' },
    en_revision: { label: '🔄 EN REVISIÓN', bg: 'bg-blue-500/20', text: 'text-blue-400', ring: 'ring-blue-500/30' },
    pendiente: { label: '⏳ PENDIENTE', bg: 'bg-amber-500/20', text: 'text-amber-400', ring: 'ring-amber-500/30' },
    rechazado: { label: '❌ RECHAZADO', bg: 'bg-red-500/20', text: 'text-red-400', ring: 'ring-red-500/30' },
}

const TIPO_ICONS: Record<string, { icon: string; label: string }> = {
    acceso_planta: { icon: '🏭', label: 'Acceso a Planta' },
    proyecto: { icon: '🏗️', label: 'Proyecto' },
    empleado: { icon: '👤', label: 'Empleado' },
    proveedor: { icon: '🤝', label: 'Proveedor' },
    mensual: { icon: '📅', label: 'Mensual' },
    legal: { icon: '⚖️', label: 'Legal' },
    poliza: { icon: '🛡️', label: 'Póliza' },
    proceso: { icon: '⚙️', label: 'Proceso' },
}

function calcProgress(sections: DocumentSection[]): { total: number; ok: number; pct: number } {
    const allDocs = sections.flatMap(s => s.docs).filter(d => d.required)
    const ok = allDocs.filter(d => d.status === 'ok').length
    return { total: allDocs.length, ok, pct: allDocs.length > 0 ? Math.round((ok / allDocs.length) * 100) : 0 }
}

export default function ExpedientesPage() {
    const [selected, setSelected] = useState<Expediente | null>(null)
    const [filtroTipo, setFiltroTipo] = useState('todos')
    const [busqueda, setBusqueda] = useState('')

    const filtered = EXPEDIENTES.filter(e => {
        if (filtroTipo !== 'todos' && e.tipo !== filtroTipo) return false
        if (busqueda && !e.nombre.toLowerCase().includes(busqueda.toLowerCase()) && !e.id.toLowerCase().includes(busqueda.toLowerCase())) return false
        return true
    })

    const globalStats = {
        total: EXPEDIENTES.length,
        aprobados: EXPEDIENTES.filter(e => e.estado === 'aprobado').length,
        pendientes: EXPEDIENTES.filter(e => e.estado === 'pendiente' || e.estado === 'en_revision').length,
        alertas: EXPEDIENTES.reduce((s, e) => s + e.alertas.length, 0),
        docsTotal: EXPEDIENTES.reduce((s, e) => s + calcProgress(e.sections).total, 0),
        docsOk: EXPEDIENTES.reduce((s, e) => s + calcProgress(e.sections).ok, 0),
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">📁 Centro de Expedientes</h1>
                    <p className="text-slate-400 mt-1">
                        Todo documento vive dentro de un expediente. Nada suelto. — Integrado con{' '}
                        <Link href="/procesos" className="text-blue-400 hover:text-blue-300 transition-colors">Mapa de Procesos</Link>
                    </p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Expedientes', value: globalStats.total, icon: '📁', gradient: 'from-blue-600/20 to-blue-800/20', border: 'border-blue-500/30' },
                    { label: 'Aprobados', value: globalStats.aprobados, icon: '✅', gradient: 'from-emerald-600/20 to-emerald-800/20', border: 'border-emerald-500/30' },
                    { label: 'En Proceso', value: globalStats.pendientes, icon: '⏳', gradient: 'from-amber-600/20 to-amber-800/20', border: 'border-amber-500/30' },
                    { label: 'Documentos', value: `${globalStats.docsOk}/${globalStats.docsTotal}`, icon: '📄', gradient: 'from-violet-600/20 to-violet-800/20', border: 'border-violet-500/30' },
                ].map(s => (
                    <div key={s.label} className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-xl p-5`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">{s.label}</p>
                                <p className="text-2xl font-bold text-white mt-1">{s.value}</p>
                            </div>
                            <span className="text-3xl">{s.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap items-center">
                <div className="flex gap-2 flex-wrap flex-1">
                    <button onClick={() => setFiltroTipo('todos')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filtroTipo === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                        Todos ({EXPEDIENTES.length})
                    </button>
                    {Object.entries(TIPO_ICONS).filter(([k]) => EXPEDIENTES.some(e => e.tipo === k)).map(([key, val]) => (
                        <button key={key} onClick={() => setFiltroTipo(key)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${filtroTipo === key ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                            {val.icon} {val.label}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
                    <input type="text" placeholder="Buscar..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-56" />
                </div>
            </div>

            {/* Expediente List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map(exp => {
                    const prog = calcProgress(exp.sections)
                    const st = EXP_STATUS[exp.estado]
                    const tipo = TIPO_ICONS[exp.tipo]
                    const isSelected = selected?.id === exp.id
                    return (
                        <button key={exp.id} onClick={() => setSelected(isSelected ? null : exp)}
                            className={`text-left p-5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 ${isSelected ? 'bg-blue-600/15 border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'}`}>
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">{tipo.icon}</span>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{exp.id}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ring-1 ${st.bg} ${st.text} ${st.ring}`}>{st.label}</span>
                                    </div>
                                    <h3 className="font-bold text-white text-sm truncate">{exp.nombre}</h3>
                                    {exp.trabajador && <p className="text-xs text-slate-500 mt-0.5">👤 {exp.trabajador} {exp.nss && `• NSS: ${exp.nss}`}</p>}
                                    {exp.proyecto && <p className="text-xs text-slate-500">🏗️ {exp.proyecto}</p>}
                                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                                        <span>📋 {exp.responsable}</span>
                                        <span>📅 {exp.fechaActualizacion}</span>
                                    </div>
                                </div>
                                <div className="w-20 text-right flex-shrink-0">
                                    <p className={`text-lg font-bold ${prog.pct === 100 ? 'text-emerald-400' : prog.pct >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>{prog.pct}%</p>
                                    <p className="text-[10px] text-slate-500">{prog.ok}/{prog.total} docs</p>
                                    <div className="h-1.5 bg-slate-700 rounded-full mt-1 overflow-hidden">
                                        <div className={`h-full rounded-full ${prog.pct === 100 ? 'bg-emerald-500' : prog.pct >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${prog.pct}%` }} />
                                    </div>
                                </div>
                            </div>
                            {exp.alertas.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-slate-700/50">
                                    <p className="text-[10px] text-red-400 animate-pulse">⚠️ {exp.alertas.length} alerta{exp.alertas.length > 1 ? 's' : ''}: {exp.alertas[0]}</p>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* ─── DETAIL VIEW ─── */}
            {selected && (
                <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden">
                    {/* Detail Header */}
                    <div className="p-6 border-b border-slate-700 flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-3xl">{TIPO_ICONS[selected.tipo].icon}</span>
                                <div>
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-xs font-mono text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">{selected.id}</span>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ring-1 ${EXP_STATUS[selected.estado].bg} ${EXP_STATUS[selected.estado].text} ${EXP_STATUS[selected.estado].ring}`}>
                                            {EXP_STATUS[selected.estado].label}
                                        </span>
                                    </div>
                                    <h2 className="text-xl font-bold text-white">{selected.nombre}</h2>
                                    {selected.trabajador && <p className="text-sm text-slate-400">👤 {selected.trabajador} {selected.nss && `| NSS: ${selected.nss}`}</p>}
                                </div>
                            </div>
                            {selected.linkedProcess && (
                                <Link href={selected.linkedProcess.href} className="inline-flex items-center gap-1.5 mt-2 text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition-colors">
                                    🔗 Proceso: {selected.linkedProcess.code} — {selected.linkedProcess.name}
                                </Link>
                            )}
                        </div>
                        <button onClick={() => setSelected(null)} className="text-slate-500 hover:text-white text-xl p-2">✕</button>
                    </div>

                    {/* Alerts */}
                    {selected.alertas.length > 0 && (
                        <div className="px-6 py-3 bg-red-500/5 border-b border-red-500/20">
                            <p className="text-xs font-bold text-red-400 mb-1">⚠️ ALERTAS ({selected.alertas.length})</p>
                            {selected.alertas.map((a, i) => (
                                <p key={i} className="text-xs text-red-300/70 ml-4">• {a}</p>
                            ))}
                        </div>
                    )}

                    {/* Document Sections - The Document Checklist */}
                    <div className="p-6 space-y-6">
                        {selected.sections.map((section, si) => {
                            const sectionDocs = section.docs.filter(d => d.required)
                            const sectionOk = sectionDocs.filter(d => d.status === 'ok').length
                            const sectionPct = sectionDocs.length > 0 ? Math.round((sectionOk / sectionDocs.length) * 100) : 100
                            return (
                                <div key={si}>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                            <span>{section.icon}</span> {section.title}
                                            <span className="text-[10px] text-slate-500 font-normal">{section.docs.length} documentos</span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold ${sectionPct === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{sectionPct}%</span>
                                            <div className="h-1.5 w-20 bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${sectionPct === 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${sectionPct}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {section.docs.map(doc => {
                                            const cfg = STATUS_CONFIG[doc.status]
                                            return (
                                                <div key={doc.id} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${cfg.bg} border border-transparent hover:border-slate-600 transition-all`}>
                                                    <span className="text-sm">{cfg.icon}</span>
                                                    <span className={`flex-1 text-sm ${doc.status === 'ok' ? 'text-slate-300' : cfg.text}`}>{doc.name}</span>
                                                    {doc.required && <span className="text-[9px] text-slate-600">REQUERIDO</span>}
                                                    {doc.expiry && (
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${new Date(doc.expiry) < new Date() ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-400'}`}>
                                                            ⏱️ {doc.expiry}
                                                        </span>
                                                    )}
                                                    {doc.notes && <span className="text-[10px] text-amber-400 italic">💡 {doc.notes}</span>}
                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Access Permissions (for Plant Access) */}
                    {selected.permisos && selected.permisos.length > 0 && (
                        <div className="px-6 pb-6">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                <h3 className="font-bold text-emerald-400 text-sm mb-2">🏭 ACCESO PLANTA / CREDENCIAL</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {selected.permisos.map((p, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-emerald-300/80">
                                            <span>✅</span> {p}
                                        </div>
                                    ))}
                                </div>
                                {selected.fechaVigencia && (
                                    <p className="text-xs text-emerald-400/60 mt-2">Vigencia: {selected.fechaCreacion} — {selected.fechaVigencia}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Validation Summary */}
                    <div className="px-6 pb-6">
                        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4">
                            <h3 className="font-bold text-white text-sm mb-3">📋 REVISIÓN Y VALIDACIÓN</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {(() => {
                                    const allDocs = selected.sections.flatMap(s => s.docs).filter(d => d.required)
                                    const checks = [
                                        { label: 'Documentos presentes', ok: allDocs.filter(d => d.status === 'ok').length === allDocs.length },
                                        { label: 'Vigencia válida', ok: !allDocs.some(d => d.status === 'expired') },
                                        { label: 'Datos coincidentes', ok: selected.estado !== 'rechazado' },
                                        { label: 'Formatos correctos', ok: !allDocs.some(d => d.status === 'missing') },
                                    ]
                                    return checks.map((c, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className={c.ok ? 'text-emerald-400' : 'text-red-400'}>{c.ok ? '✅' : '❌'}</span>
                                            <span className={c.ok ? 'text-slate-300' : 'text-red-300'}>{c.label}</span>
                                        </div>
                                    ))
                                })()}
                            </div>
                            {/* Progress bar */}
                            <div className="mt-3 flex items-center gap-3">
                                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all ${calcProgress(selected.sections).pct === 100 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-amber-500 to-amber-400'}`}
                                        style={{ width: `${calcProgress(selected.sections).pct}%` }} />
                                </div>
                                <span className="text-sm font-bold text-white">{calcProgress(selected.sections).pct}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
