'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════
   MÓDULO CUMPLIMIENTO REGULATORIO — MICSA OS
   Sistema Electrónico de Información Laboral (SEIL)
   REPSE, SIROC, IMSS, STPS, SAT
   ═══════════════════════════════════════════════════════════ */

type TabId = 'repse' | 'siroc' | 'imss' | 'stps' | 'sat' | 'calendario'

interface ComplianceItem {
    id: string
    name: string
    entity: string
    status: 'vigente' | 'por-vencer' | 'vencido' | 'en-tramite' | 'pendiente'
    expiryDate: string
    registrationNumber?: string
    responsible: string
    priority: 'alta' | 'media' | 'baja'
    notes?: string
    documentUrl?: string
}

const REPSE_ITEMS: ComplianceItem[] = [
    { id: 'REPSE-001', name: 'Registro REPSE MICSA', entity: 'STPS', status: 'vigente', expiryDate: '2026-12-31', registrationNumber: 'REPSE-MICSA-2024-001', responsible: 'RH', priority: 'alta', notes: 'Renovación anual obligatoria' },
    { id: 'REPSE-002', name: 'Constancia No Adeudo IMSS', entity: 'IMSS', status: 'vigente', expiryDate: '2026-03-15', responsible: 'Contabilidad', priority: 'alta' },
    { id: 'REPSE-003', name: 'Constancia No Adeudo SAT', entity: 'SAT', status: 'vigente', expiryDate: '2026-04-20', responsible: 'Contabilidad', priority: 'alta' },
    { id: 'REPSE-004', name: 'Opinión Cumplimiento 32-D', entity: 'SAT', status: 'vigente', expiryDate: '2026-02-28', responsible: 'Contabilidad', priority: 'alta', notes: 'Validar mensualmente' },
    { id: 'REPSE-005', name: 'Acta Constitutiva Actualizada', entity: 'STPS', status: 'vigente', expiryDate: '2027-01-01', responsible: 'Legal', priority: 'media' },
]

const SIROC_ITEMS: ComplianceItem[] = [
    { id: 'SIROC-001', name: 'Registro SIROC Obra Iron Cast', entity: 'STPS', status: 'vigente', expiryDate: '2026-06-30', registrationNumber: 'SIROC-2024-MTY-0123', responsible: 'Seguridad', priority: 'alta' },
    { id: 'SIROC-002', name: 'Programa de Seguridad Iron Cast', entity: 'STPS', status: 'vigente', expiryDate: '2026-06-30', responsible: 'Seguridad', priority: 'alta', notes: 'Vinculado a SIROC-001' },
    { id: 'SIROC-003', name: 'Comisión Mixta Seguridad e Higiene', entity: 'STPS', status: 'vigente', expiryDate: '2026-12-31', responsible: 'Seguridad', priority: 'media', notes: 'Acta constitutiva firmada' },
    { id: 'SIROC-004', name: 'Capacitación Seguridad (DC3)', entity: 'STPS', status: 'en-tramite', expiryDate: '2026-03-31', responsible: 'RH', priority: 'alta', notes: '32 DC3 pendientes de registro' },
]

const IMSS_ITEMS: ComplianceItem[] = [
    { id: 'IMSS-001', name: 'Afiliación Patronal', entity: 'IMSS', status: 'vigente', expiryDate: '2027-12-31', registrationNumber: 'A1234567890', responsible: 'RH', priority: 'alta' },
    { id: 'IMSS-002', name: 'Altas Trabajadores Enero', entity: 'IMSS', status: 'vigente', expiryDate: '2026-02-05', responsible: 'RH', priority: 'alta', notes: '9 trabajadores dados de alta' },
    { id: 'IMSS-003', name: 'Pago Cuotas Enero 2026', entity: 'IMSS', status: 'vigente', expiryDate: '2026-02-17', responsible: 'Contabilidad', priority: 'alta', notes: '$87,911 MXN' },
    { id: 'IMSS-004', name: 'Dictamen Riesgos de Trabajo', entity: 'IMSS', status: 'por-vencer', expiryDate: '2026-03-01', responsible: 'Seguridad', priority: 'media' },
    { id: 'IMSS-005', name: 'Certificado Digital IMSS', entity: 'IMSS', status: 'vigente', expiryDate: '2026-08-15', responsible: 'Contabilidad', priority: 'media' },
]

const STPS_ITEMS: ComplianceItem[] = [
    { id: 'STPS-001', name: 'NOM-035 Factores Psicosociales', entity: 'STPS', status: 'vigente', expiryDate: '2026-12-31', responsible: 'RH', priority: 'media', notes: 'Evaluación anual' },
    { id: 'STPS-002', name: 'NOM-030 Servicios Preventivos', entity: 'STPS', status: 'vigente', expiryDate: '2026-12-31', responsible: 'Seguridad', priority: 'media' },
    { id: 'STPS-003', name: 'Reglamento Interior de Trabajo', entity: 'STPS', status: 'vigente', expiryDate: '2027-06-30', responsible: 'RH', priority: 'baja' },
    { id: 'STPS-004', name: 'Tabla de Enfermedades de Trabajo', entity: 'STPS', status: 'vigente', expiryDate: '2027-12-31', responsible: 'Seguridad', priority: 'baja' },
]

const SAT_ITEMS: ComplianceItem[] = [
    { id: 'SAT-001', name: 'Certificado de Sello Digital (CSD)', entity: 'SAT', status: 'vigente', expiryDate: '2026-11-30', responsible: 'Contabilidad', priority: 'alta', notes: 'Renovar 30 días antes' },
    { id: 'SAT-002', name: 'Declaración Anual 2025', entity: 'SAT', status: 'pendiente', expiryDate: '2026-03-31', responsible: 'Contabilidad', priority: 'alta' },
    { id: 'SAT-003', name: 'Declaración Mensual Enero 2026', entity: 'SAT', status: 'vigente', expiryDate: '2026-02-17', responsible: 'Contabilidad', priority: 'alta' },
    { id: 'SAT-004', name: 'DIOT Enero 2026', entity: 'SAT', status: 'vigente', expiryDate: '2026-02-28', responsible: 'Contabilidad', priority: 'media' },
    { id: 'SAT-005', name: 'Constancia Situación Fiscal', entity: 'SAT', status: 'vigente', expiryDate: '2027-01-01', responsible: 'Contabilidad', priority: 'media' },
]

interface CalendarEvent {
    date: string
    items: ComplianceItem[]
    type: 'vencimiento' | 'renovacion' | 'declaracion'
}

const CALENDAR_EVENTS: CalendarEvent[] = [
    { date: '2026-02-17', items: [IMSS_ITEMS[2], SAT_ITEMS[2]], type: 'declaracion' },
    { date: '2026-02-28', items: [REPSE_ITEMS[3], SAT_ITEMS[3]], type: 'vencimiento' },
    { date: '2026-03-01', items: [IMSS_ITEMS[3]], type: 'vencimiento' },
    { date: '2026-03-15', items: [REPSE_ITEMS[1]], type: 'renovacion' },
    { date: '2026-03-31', items: [SIROC_ITEMS[3], SAT_ITEMS[1]], type: 'vencimiento' },
]

const TABS: { id: TabId; label: string; icon: string; count: number }[] = [
    { id: 'repse', label: 'REPSE', icon: '📋', count: REPSE_ITEMS.length },
    { id: 'siroc', label: 'SIROC', icon: '🏗️', count: SIROC_ITEMS.length },
    { id: 'imss', label: 'IMSS', icon: '🏥', count: IMSS_ITEMS.length },
    { id: 'stps', label: 'STPS', icon: '⚖️', count: STPS_ITEMS.length },
    { id: 'sat', label: 'SAT', icon: '💰', count: SAT_ITEMS.length },
    { id: 'calendario', label: 'Calendario', icon: '📅', count: CALENDAR_EVENTS.length },
]

const statusColors: Record<string, string> = {
    'vigente': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'por-vencer': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'vencido': 'bg-red-500/20 text-red-400 border-red-500/30',
    'en-tramite': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'pendiente': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const priorityColors: Record<string, string> = {
    'alta': 'text-red-400',
    'media': 'text-amber-400',
    'baja': 'text-slate-400',
}

const isExpiringSoon = (date: string) => {
    const expiry = new Date(date)
    const today = new Date()
    const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
}

const isExpired = (date: string) => {
    const expiry = new Date(date)
    const today = new Date()
    return expiry < today
}

export default function CumplimientoRegulatorioPage() {
    const [activeTab, setActiveTab] = useState<TabId>('repse')
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    const allItems = [...REPSE_ITEMS, ...SIROC_ITEMS, ...IMSS_ITEMS, ...STPS_ITEMS, ...SAT_ITEMS]
    const vigentes = allItems.filter(i => i.status === 'vigente').length
    const porVencer = allItems.filter(i => isExpiringSoon(i.expiryDate)).length
    const vencidos = allItems.filter(i => isExpired(i.expiryDate)).length
    const enTramite = allItems.filter(i => i.status === 'en-tramite').length

    const getCurrentItems = (): ComplianceItem[] => {
        switch (activeTab) {
            case 'repse': return REPSE_ITEMS
            case 'siroc': return SIROC_ITEMS
            case 'imss': return IMSS_ITEMS
            case 'stps': return STPS_ITEMS
            case 'sat': return SAT_ITEMS
            default: return []
        }
    }

    return (
        <div className="space-y-6">
            {/* ─── Header ─── */}
            <div className="bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-blue-900/40 rounded-2xl p-6 border border-purple-500/20">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            📊 Cumplimiento SEIL — Sistema Electrónico de Información Laboral
                        </h1>
                        <p className="text-purple-300/80 mt-1">
                            REPSE · SIROC · IMSS · STPS · SAT
                            {' · '}
                            <Link href="/procesos" className="underline hover:text-white transition-colors">Mapa de Procesos</Link>
                            {' · '}
                            <Link href="/seguridad" className="underline hover:text-white transition-colors">Seguridad EHS</Link>
                            {' · '}
                            <Link href="/legacy/repse" className="underline hover:text-white transition-colors">REPSE Legacy</Link>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-emerald-400">{vigentes}</div>
                            <div className="text-[10px] text-emerald-300/70 uppercase tracking-wider">Vigentes</div>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-amber-400">{porVencer}</div>
                            <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">Por Vencer</div>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-red-400">{vencidos}</div>
                            <div className="text-[10px] text-red-300/70 uppercase tracking-wider">Vencidos</div>
                        </div>
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-blue-400">{enTramite}</div>
                            <div className="text-[10px] text-blue-300/70 uppercase tracking-wider">En Trámite</div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-5 gap-3 mt-4">
                    {[
                        { label: 'REPSE', value: REPSE_ITEMS.length, color: 'text-purple-400' },
                        { label: 'SIROC', value: SIROC_ITEMS.length, color: 'text-blue-400' },
                        { label: 'IMSS', value: IMSS_ITEMS.length, color: 'text-emerald-400' },
                        { label: 'STPS', value: STPS_ITEMS.length, color: 'text-amber-400' },
                        { label: 'SAT', value: SAT_ITEMS.length, color: 'text-cyan-400' },
                    ].map(s => (
                        <div key={s.label} className="bg-white/5 rounded-lg px-3 py-2 text-center">
                            <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Tab Navigation ─── */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-purple-500/30' : 'bg-white/10'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ═══ COMPLIANCE ITEMS TABLE ═══ */}
            {activeTab !== 'calendario' && (
                <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold text-white">
                            {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label} — Requisitos de Cumplimiento
                        </h2>
                        <Link href="/legacy/repse" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                            🔗 Ir a módulo legacy REPSE →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                                    <th className="text-left p-3">ID</th>
                                    <th className="text-left p-3">Requisito</th>
                                    <th className="text-left p-3">Entidad</th>
                                    <th className="text-center p-3">Estado</th>
                                    <th className="text-center p-3">Vencimiento</th>
                                    <th className="text-left p-3">Responsable</th>
                                    <th className="text-center p-3">Prioridad</th>
                                    <th className="text-center p-3">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {getCurrentItems().map(item => {
                                    const expiring = isExpiringSoon(item.expiryDate)
                                    const expired = isExpired(item.expiryDate)
                                    return (
                                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-purple-400 font-mono text-xs">{item.id}</td>
                                            <td className="p-3">
                                                <div className="text-white font-medium">{item.name}</div>
                                                {item.registrationNumber && (
                                                    <div className="text-xs text-slate-500 mt-0.5">Folio: {item.registrationNumber}</div>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300">{item.entity}</span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[item.status]}`}>
                                                    {item.status === 'vigente' ? '✓ Vigente' :
                                                        item.status === 'por-vencer' ? '⚠ Por Vencer' :
                                                            item.status === 'vencido' ? '✗ Vencido' :
                                                                item.status === 'en-tramite' ? '◐ En Trámite' :
                                                                    '○ Pendiente'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className={`text-sm font-mono ${expired ? 'text-red-400' : expiring ? 'text-amber-400' : 'text-slate-300'}`}>
                                                    {item.expiryDate}
                                                </div>
                                                {expiring && !expired && (
                                                    <div className="text-[10px] text-amber-400 mt-0.5">
                                                        ⚠ Vence en {Math.ceil((new Date(item.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días
                                                    </div>
                                                )}
                                                {expired && (
                                                    <div className="text-[10px] text-red-400 mt-0.5">✗ VENCIDO</div>
                                                )}
                                            </td>
                                            <td className="p-3 text-slate-300">{item.responsible}</td>
                                            <td className="p-3 text-center">
                                                <span className={`text-xs font-semibold ${priorityColors[item.priority]}`}>
                                                    {item.priority === 'alta' ? '🔴 Alta' : item.priority === 'media' ? '🟡 Media' : '🟢 Baja'}
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button
                                                    onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                >
                                                    {expandedItem === item.id ? '▼ Ocultar' : '▶ Ver'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {expandedItem && getCurrentItems().find(i => i.id === expandedItem) && (
                        <div className="border-t border-white/10 p-4 bg-slate-900/50">
                            <div className="space-y-2">
                                <div className="text-sm text-white font-semibold">
                                    Detalles: {getCurrentItems().find(i => i.id === expandedItem)?.name}
                                </div>
                                {getCurrentItems().find(i => i.id === expandedItem)?.notes && (
                                    <div className="text-xs text-slate-400">
                                        📝 {getCurrentItems().find(i => i.id === expandedItem)?.notes}
                                    </div>
                                )}
                                <div className="flex gap-2 mt-3">
                                    <button className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
                                        📄 Ver Documento
                                    </button>
                                    <button className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors">
                                        🔄 Renovar
                                    </button>
                                    <button className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/20 transition-colors">
                                        📧 Notificar Responsable
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══ CALENDAR VIEW ═══ */}
            {activeTab === 'calendario' && (
                <div className="space-y-4">
                    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4">
                        <h2 className="font-semibold text-white mb-4">📅 Próximos Vencimientos y Declaraciones</h2>
                        <div className="space-y-3">
                            {CALENDAR_EVENTS.map((event, idx) => (
                                <div key={idx} className="bg-slate-900/50 border border-white/5 rounded-lg p-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="text-sm font-semibold text-white">
                                                {new Date(event.date).toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                            <div className="text-xs text-slate-400 mt-1">
                                                {event.type === 'vencimiento' ? '⏰ Vencimiento' :
                                                    event.type === 'renovacion' ? '🔄 Renovación' :
                                                        '📊 Declaración'}
                                            </div>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${event.type === 'vencimiento' ? 'bg-red-500/20 text-red-400' :
                                                event.type === 'renovacion' ? 'bg-amber-500/20 text-amber-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {event.items.length} requisito{event.items.length > 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        {event.items.map(item => (
                                            <div key={item.id} className="flex items-center gap-2 text-xs">
                                                <span className="text-purple-400 font-mono">{item.id}</span>
                                                <span className="text-slate-300">{item.name}</span>
                                                <span className="text-slate-500">—</span>
                                                <span className="text-slate-400">{item.entity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ─── Footer Links ─── */}
            <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex gap-4">
                    <Link href="/procesos" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        🔄 Mapa de Procesos
                    </Link>
                    <Link href="/seguridad" className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        🛡️ Seguridad EHS
                    </Link>
                    <Link href="/expedientes" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                        📁 Expedientes
                    </Link>
                    <Link href="/legacy/repse" className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
                        📋 REPSE Legacy
                    </Link>
                </div>
                <div className="text-[10px] text-slate-500">
                    Sistema Electrónico de Información Laboral — STPS
                </div>
            </div>
        </div>
    )
}
