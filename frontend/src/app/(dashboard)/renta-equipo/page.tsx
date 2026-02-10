'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ═══════════════════════════════════════════════════════════
   MÓDULO RENTA DE EQUIPO MÓVIL — MICSA OS
   Datos extraídos de: Renta_de_Equipo_Móvil_Genspark_AI_Sheets.xlsx
   21 hojas: Parámetros, Personal, Nómina, Presupuesto,
   Utilidad, Herramientas, DC3, EPP, Renta, Proveedores, etc.
   ═══════════════════════════════════════════════════════════ */

type TabId = 'flota' | 'personal' | 'financiero' | 'herramientas' | 'dc3' | 'proveedores'

/* ─── Equipment Fleet Data ─── */
interface Equipment {
    id: string
    name: string
    type: 'grua' | 'montacargas' | 'plataforma' | 'camion' | 'compresor' | 'soldadora'
    provider: string
    dailyRate: number
    currency: 'MXN' | 'USD'
    status: 'en-uso' | 'disponible' | 'mantenimiento' | 'devuelto'
    project: string
    assignedTo: string
    inspectionDate: string
    nextInspection: string
    hoursUsed: number
    notes?: string
}

const FLEET: Equipment[] = [
    { id: 'EQ-001', name: 'Grúa Articulada 15T', type: 'grua', provider: 'Grúas y Maniobras del Norte', dailyRate: 8500, currency: 'MXN', status: 'en-uso', project: 'Iron Cast', assignedTo: 'SOTERO GAONA SANTIAGO', inspectionDate: '2026-01-20', nextInspection: '2026-02-20', hoursUsed: 312 },
    { id: 'EQ-002', name: 'Montacargas 5T Yale', type: 'montacargas', provider: 'Equipos Industriales MTY', dailyRate: 3200, currency: 'MXN', status: 'en-uso', project: 'Iron Cast', assignedTo: 'LUIS SILVERIO LUCIDO LOPEZ', inspectionDate: '2026-01-15', nextInspection: '2026-02-15', hoursUsed: 480 },
    { id: 'EQ-003', name: 'Plataforma Elevadora JLG', type: 'plataforma', provider: 'Hertz Equipo', dailyRate: 450, currency: 'USD', status: 'en-uso', project: 'Iron Cast', assignedTo: 'ALFREDO DE LA ROCHA CORDOVA', inspectionDate: '2026-01-22', nextInspection: '2026-02-22', hoursUsed: 256 },
    { id: 'EQ-004', name: 'Compresor Atlas Copco 375', type: 'compresor', provider: 'Air Solutions MX', dailyRate: 4100, currency: 'MXN', status: 'mantenimiento', project: 'Iron Cast', assignedTo: 'EMMANUEL HERNANDEZ HERNANDEZ', inspectionDate: '2026-01-25', nextInspection: '2026-01-28', hoursUsed: 520, notes: 'Mantenimiento preventivo programado' },
    { id: 'EQ-005', name: 'Soldadora Lincoln 500', type: 'soldadora', provider: 'Soldarec MTY', dailyRate: 1800, currency: 'MXN', status: 'en-uso', project: 'Iron Cast', assignedTo: 'Luis Fernando Cruz Lugo', inspectionDate: '2026-01-18', nextInspection: '2026-02-18', hoursUsed: 392 },
    { id: 'EQ-006', name: 'Camión 3.5T Redilas', type: 'camion', provider: 'Transportes MICSA', dailyRate: 2500, currency: 'MXN', status: 'disponible', project: 'Iron Cast', assignedTo: '-', inspectionDate: '2026-01-10', nextInspection: '2026-02-10', hoursUsed: 88 },
]

/* ─── Personnel from Nómina Consolidada ─── */
interface Worker {
    id: number
    name: string
    role: string
    weeklySalary: number
    weeks: number
    totalSalary: number
    efficiency: number
    dc3Count: number
    dc3Status: 'vigente' | 'por-vencer' | 'vencido'
    assignedEquipment: string[]
}

const WORKERS: Worker[] = [
    { id: 1, name: 'ALFREDO DE LA ROCHA CORDOVA', role: 'Supervisor', weeklySalary: 7000, weeks: 8, totalSalary: 56000, efficiency: 92.4, dc3Count: 8, dc3Status: 'vigente', assignedEquipment: ['EQ-003'] },
    { id: 2, name: 'EMMANUEL HERNANDEZ HERNANDEZ', role: 'Seguridad', weeklySalary: 5000, weeks: 8, totalSalary: 40000, efficiency: 0, dc3Count: 5, dc3Status: 'vigente', assignedEquipment: ['EQ-004'] },
    { id: 3, name: 'SOTERO GAONA SANTIAGO', role: 'Maniobrista', weeklySalary: 7000, weeks: 8, totalSalary: 56000, efficiency: 92.6, dc3Count: 5, dc3Status: 'vigente', assignedEquipment: ['EQ-001'] },
    { id: 4, name: 'FERNANDO GAONA SANTIAGO', role: 'Maniobrista', weeklySalary: 7000, weeks: 8, totalSalary: 56000, efficiency: 88.9, dc3Count: 5, dc3Status: 'por-vencer', assignedEquipment: [] },
    { id: 5, name: 'JOSE ANGEL JIMENEZ SANTIAGO', role: 'Mecánico', weeklySalary: 5000, weeks: 8, totalSalary: 40000, efficiency: 100, dc3Count: 6, dc3Status: 'vigente', assignedEquipment: ['EQ-005'] },
    { id: 6, name: 'AGUSTIN ALVIZO PUENTE', role: 'Mecánico', weeklySalary: 5000, weeks: 8, totalSalary: 40000, efficiency: 100, dc3Count: 6, dc3Status: 'vigente', assignedEquipment: [] },
    { id: 7, name: 'ANTONIO GAONA SANTIAGO', role: 'Mecánico', weeklySalary: 5000, weeks: 8, totalSalary: 40000, efficiency: 74.1, dc3Count: 4, dc3Status: 'vigente', assignedEquipment: [] },
    { id: 8, name: 'LUIS SILVERIO LUCIDO LOPEZ', role: 'Mecánico', weeklySalary: 4000, weeks: 8, totalSalary: 32000, efficiency: 92.6, dc3Count: 4, dc3Status: 'vigente', assignedEquipment: ['EQ-002'] },
    { id: 9, name: 'Luis Fernando Cruz Lugo', role: 'Mecánico', weeklySalary: 4000, weeks: 8, totalSalary: 32000, efficiency: 0, dc3Count: 6, dc3Status: 'por-vencer', assignedEquipment: ['EQ-005'] },
]

/* ─── Financial Summary from Presupuesto Completo ─── */
interface BudgetLine {
    concept: string
    budgeted: number
    actual: number
    difference: number
    icon: string
}

const BUDGET: BudgetLine[] = [
    { concept: 'Nómina (8 semanas)', icon: '💸', budgeted: 472000, actual: 472000, difference: 0 },
    { concept: 'IMSS + Cargas Patronales', icon: '🏥', budgeted: 87911, actual: 87911, difference: 0 },
    { concept: 'Hospedaje', icon: '🏨', budgeted: 316800, actual: 156000, difference: 160800 },
    { concept: 'Traslados', icon: '🚐', budgeted: 55000, actual: 40000, difference: 15000 },
    { concept: 'Viáticos', icon: '🍽️', budgeted: 100800, actual: 96000, difference: 4800 },
    { concept: 'DC3 / Documentación', icon: '📜', budgeted: 14000, actual: 10300, difference: 3700 },
    { concept: 'Herramientas', icon: '🔧', budgeted: 40000, actual: 20000, difference: 20000 },
    { concept: 'Consumibles', icon: '🔩', budgeted: 18000, actual: 15000, difference: 3000 },
    { concept: 'Equipos (Renta)', icon: '🚛', budgeted: 576404, actual: 576404, difference: 0 },
    { concept: 'EPP', icon: '🦺', budgeted: 7030, actual: 7030, difference: 0 },
    { concept: 'RC (Responsabilidad Civil)', icon: '📋', budgeted: 15860, actual: 15860, difference: 0 },
]

/* ─── Tools Inventory from Herramientas sheet ─── */
interface Tool {
    category: string
    name: string
    qty: number
    unitPrice: number
    total: number
}

const TOOLS: Tool[] = [
    { category: 'Corte', name: 'Arco segueta', qty: 1, unitPrice: 318.96, total: 318.96 },
    { category: 'Llaves', name: 'Llave Stillson', qty: 1, unitPrice: 412.06, total: 412.06 },
    { category: 'Llaves', name: 'Llave ajust 10"', qty: 1, unitPrice: 370.68, total: 370.68 },
    { category: 'Llaves', name: 'Llave ajust 12"', qty: 1, unitPrice: 491.38, total: 491.38 },
    { category: 'Golpe', name: 'Martillo bola', qty: 1, unitPrice: 318.96, total: 318.96 },
    { category: 'Golpe', name: 'Marro', qty: 1, unitPrice: 325.86, total: 325.86 },
    { category: 'Pinzas', name: 'Pinza presión', qty: 1, unitPrice: 291.38, total: 291.38 },
    { category: 'Pinzas', name: 'Pinza chofer', qty: 1, unitPrice: 184.48, total: 184.48 },
    { category: 'Pinzas', name: 'Pinza bicolor', qty: 1, unitPrice: 308.62, total: 308.62 },
    { category: 'Desarmadores', name: 'Desarmador Phillips', qty: 1, unitPrice: 98.28, total: 98.28 },
    { category: 'Desarmadores', name: 'Desarmador 3/16x4', qty: 1, unitPrice: 106.90, total: 106.90 },
    { category: 'Desarmadores', name: 'Desarmador 5/16x6', qty: 1, unitPrice: 177.58, total: 177.58 },
    { category: 'Desarmadores', name: 'Desarmador 3/8x8', qty: 1, unitPrice: 203.44, total: 203.44 },
    { category: 'Llaves combinadas', name: 'Llave combinada 6mm', qty: 1, unitPrice: 112.06, total: 112.06 },
    { category: 'Llaves combinadas', name: 'Llave combinada 7mm', qty: 1, unitPrice: 112.06, total: 112.06 },
    { category: 'Llaves combinadas', name: 'Llave combinada 8mm', qty: 1, unitPrice: 112.06, total: 112.06 },
    { category: 'Llaves combinadas', name: 'Llave combinada 10mm', qty: 1, unitPrice: 118.96, total: 118.96 },
    { category: 'Llaves combinadas', name: 'Llave combinada 12mm', qty: 1, unitPrice: 146.56, total: 146.56 },
    { category: 'Llaves combinadas', name: 'Llave combinada 13mm', qty: 1, unitPrice: 160.34, total: 160.34 },
    { category: 'Llaves combinadas', name: 'Llave combinada 14mm', qty: 1, unitPrice: 168.96, total: 168.96 },
    { category: 'Llaves combinadas', name: 'Llave combinada 15mm', qty: 1, unitPrice: 206.90, total: 206.90 },
    { category: 'Llaves combinadas', name: 'Llave combinada 17mm', qty: 1, unitPrice: 232.76, total: 232.76 },
    { category: 'Llaves combinadas', name: 'Llave combinada 19mm', qty: 1, unitPrice: 256.90, total: 256.90 },
]

/* ─── DC3 Training Matrix ─── */
interface DC3Course {
    name: string
    supervisor: boolean
    seguridad: boolean
    armadores: boolean
    soldadores: boolean
    ayudantes: boolean
    almacenistas: boolean
}

const DC3_MATRIX: DC3Course[] = [
    { name: 'Trabajos en Alturas', supervisor: true, seguridad: true, armadores: true, soldadores: true, ayudantes: true, almacenistas: true },
    { name: 'Uso de Herramientas Eléctricas', supervisor: true, seguridad: false, armadores: true, soldadores: true, ayudantes: true, almacenistas: true },
    { name: 'Espacios Confinados', supervisor: true, seguridad: true, armadores: true, soldadores: false, ayudantes: false, almacenistas: false },
    { name: 'Manejo de Cargas', supervisor: true, seguridad: false, armadores: true, soldadores: true, ayudantes: true, almacenistas: true },
    { name: 'Primeros Auxilios', supervisor: true, seguridad: true, armadores: false, soldadores: false, ayudantes: true, almacenistas: false },
    { name: 'Prevención de Riesgos', supervisor: true, seguridad: true, armadores: true, soldadores: true, ayudantes: true, almacenistas: true },
    { name: 'Soldadura Básica', supervisor: false, seguridad: false, armadores: true, soldadores: true, ayudantes: false, almacenistas: false },
    { name: 'Armado de Estructuras', supervisor: true, seguridad: false, armadores: true, soldadores: false, ayudantes: false, almacenistas: false },
    { name: 'EPP y Seguridad Personal', supervisor: true, seguridad: true, armadores: true, soldadores: true, ayudantes: true, almacenistas: true },
]

const DC3_COUNTS: Record<string, number> = {
    'Supervisor de Obra': 8,
    'Supervisor de Seguridad': 5,
    'Armadores': 5,
    'Soldadores': 6,
    'Ayudantes Generales': 4,
    'Almacenistas': 4,
}

/* ─── Providers ─── */
interface Provider {
    name: string
    service: string
    contact: string
    city: string
    status: 'activo' | 'por-evaluar' | 'inactivo'
}

const PROVIDERS: Provider[] = [
    { name: 'Grúas y Maniobras del Norte', service: 'Grúas articuladas y telescópicas', contact: 'Tel. 81-XXXX-XXXX', city: 'Monterrey, NL', status: 'activo' },
    { name: 'Equipos Industriales MTY', service: 'Montacargas, Plataformas', contact: 'Tel. 81-XXXX-XXXX', city: 'San Nicolás, NL', status: 'activo' },
    { name: 'Hertz Equipo', service: 'Plataformas JLG, Genie', contact: 'Tel. 81-XXXX-XXXX', city: 'Monterrey, NL', status: 'activo' },
    { name: 'Air Solutions MX', service: 'Compresores industriales', contact: 'Tel. 81-XXXX-XXXX', city: 'Apodaca, NL', status: 'activo' },
    { name: 'Soldarec MTY', service: 'Soldadoras Lincoln, Miller', contact: 'Tel. 81-XXXX-XXXX', city: 'Monterrey, NL', status: 'activo' },
    { name: 'Transportes MICSA', service: 'Camiones redilas y plataformas', contact: 'Interno', city: 'Monterrey, NL', status: 'activo' },
    { name: 'Ferretería Industrial Delta', service: 'Herramientas manuales', contact: 'Tel. 81-XXXX-XXXX', city: 'Monterrey, NL', status: 'por-evaluar' },
]

/* ─── Project Parameters ─── */
const PROJECT_PARAMS = {
    name: 'IRON CAST',
    duration: 8,
    durationUnit: 'semanas',
    daysPerWeek: 6,
    exchangeRate: 17.5,
    iva: 0.16,
    imssBase: 915.74,
    orderValue: 2164441.35,
    totalBudget: 1143894,
    totalExpense: 936594,
    netProfit: 372700,
    profitMargin: 0.3404,
    toolsBudget: 40000,
    toolsActual: 20000,
    toolsSavings: 20000,
}

/* ─── Formatting helpers ─── */
const fmt = (n: number) => n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0, maximumFractionDigits: 0 })
const fmtPct = (n: number) => `${(n * 100).toFixed(1)}%`

const TABS: { id: TabId; label: string; icon: string; count: number }[] = [
    { id: 'flota', label: 'Flota y Equipo', icon: '🚛', count: FLEET.length },
    { id: 'personal', label: 'Personal Asignado', icon: '👷', count: WORKERS.length },
    { id: 'financiero', label: 'Presupuesto', icon: '💰', count: BUDGET.length },
    { id: 'herramientas', label: 'Herramientas', icon: '🔧', count: TOOLS.length },
    { id: 'dc3', label: 'Capacitación DC3', icon: '🎓', count: DC3_MATRIX.length },
    { id: 'proveedores', label: 'Proveedores', icon: '🤝', count: PROVIDERS.length },
]

const statusColors: Record<string, string> = {
    'en-uso': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'disponible': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'mantenimiento': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'devuelto': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const typeIcons: Record<string, string> = {
    grua: '🏗️',
    montacargas: '🏋️',
    plataforma: '📐',
    camion: '🚚',
    compresor: '💨',
    soldadora: '⚡',
}

export default function RentaEquipoPage() {
    const [activeTab, setActiveTab] = useState<TabId>('flota')
    const [expandedEq, setExpandedEq] = useState<string | null>(null)
    const [toolFilter, setToolFilter] = useState<string>('all')

    const totalBudgeted = BUDGET.reduce((s, b) => s + b.budgeted, 0)
    const totalActual = BUDGET.reduce((s, b) => s + b.actual, 0)
    const totalDiff = BUDGET.reduce((s, b) => s + b.difference, 0)

    const equipInUse = FLEET.filter(e => e.status === 'en-uso').length
    const equipMaint = FLEET.filter(e => e.status === 'mantenimiento').length

    const toolCategories = ['all', ...Array.from(new Set(TOOLS.map(t => t.category)))]

    return (
        <div className="space-y-6">
            {/* ─── Header ─── */}
            <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-indigo-900/40 rounded-2xl p-6 border border-blue-500/20">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            🚛 Gestión de Equipo Móvil y Herramientas
                        </h1>
                        <p className="text-blue-300/80 mt-1">
                            Proyecto <span className="text-cyan-400 font-semibold">{PROJECT_PARAMS.name}</span> — {PROJECT_PARAMS.duration} {PROJECT_PARAMS.durationUnit} — OC {fmt(PROJECT_PARAMS.orderValue)}
                            {' · '}
                            <Link href="/procesos" className="underline hover:text-white transition-colors">Mapa de Procesos</Link>
                            {' · '}
                            <Link href="/seguridad" className="underline hover:text-white transition-colors">Seguridad EHS</Link>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-emerald-400">{equipInUse}/{FLEET.length}</div>
                            <div className="text-[10px] text-emerald-300/70 uppercase tracking-wider">En Uso</div>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-amber-400">{equipMaint}</div>
                            <div className="text-[10px] text-amber-300/70 uppercase tracking-wider">Mtto</div>
                        </div>
                        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl px-4 py-2 text-center">
                            <div className="text-xl font-bold text-cyan-400">{fmtPct(PROJECT_PARAMS.profitMargin)}</div>
                            <div className="text-[10px] text-cyan-300/70 uppercase tracking-wider">Margen</div>
                        </div>
                    </div>
                </div>

                {/* Quick Metrics */}
                <div className="grid grid-cols-5 gap-3 mt-4">
                    {[
                        { label: 'Presupuesto Total', value: fmt(PROJECT_PARAMS.totalBudget), color: 'text-blue-400' },
                        { label: 'Gasto Real', value: fmt(PROJECT_PARAMS.totalExpense), color: 'text-orange-400' },
                        { label: 'Ahorro', value: fmt(PROJECT_PARAMS.totalBudget - PROJECT_PARAMS.totalExpense), color: 'text-emerald-400' },
                        { label: 'Utilidad Neta', value: fmt(PROJECT_PARAMS.netProfit), color: 'text-cyan-400' },
                        { label: 'Equipo Renta', value: fmt(576404), color: 'text-purple-400' },
                    ].map(m => (
                        <div key={m.label} className="bg-white/5 rounded-lg px-3 py-2 text-center">
                            <div className={`text-lg font-bold ${m.color}`}>{m.value}</div>
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── Tab Navigation ─── */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-500/10'
                                : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <span>{tab.icon}</span>
                        {tab.label}
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-blue-500/30' : 'bg-white/10'}`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* ═══ TAB: FLOTA ═══ */}
            {activeTab === 'flota' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {FLEET.map(eq => (
                        <div key={eq.id}
                            className={`bg-slate-800/60 border rounded-xl overflow-hidden transition-all cursor-pointer hover:border-blue-500/50 ${expandedEq === eq.id ? 'border-blue-500/50 ring-1 ring-blue-500/20' : 'border-white/10'
                                }`}
                            onClick={() => setExpandedEq(expandedEq === eq.id ? null : eq.id)}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{typeIcons[eq.type]}</span>
                                        <div>
                                            <span className="text-xs text-blue-400 font-mono">{eq.id}</span>
                                            <div className="font-semibold text-white">{eq.name}</div>
                                            <div className="text-xs text-slate-400">{eq.provider}</div>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[eq.status]}`}>
                                        {eq.status === 'en-uso' ? '● En Uso' : eq.status === 'disponible' ? '○ Disponible' : eq.status === 'mantenimiento' ? '⚠ Mtto' : '↩ Devuelto'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                    <span>💵 {eq.currency === 'USD' ? `$${eq.dailyRate} USD` : fmt(eq.dailyRate)}/día</span>
                                    <span>👤 {eq.assignedTo}</span>
                                    <span>⏱ {eq.hoursUsed}h</span>
                                </div>
                            </div>

                            {expandedEq === eq.id && (
                                <div className="border-t border-white/10 p-4 bg-slate-900/50 space-y-2">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-slate-500">Proyecto:</span>
                                            <span className="text-white ml-2">{eq.project}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Tipo:</span>
                                            <span className="text-white ml-2 capitalize">{eq.type}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Última Inspección:</span>
                                            <span className="text-white ml-2">{eq.inspectionDate}</span>
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Próxima Inspección:</span>
                                            <span className={`ml-2 ${new Date(eq.nextInspection) < new Date() ? 'text-red-400' : 'text-emerald-400'}`}>
                                                {eq.nextInspection}
                                            </span>
                                        </div>
                                        {eq.currency === 'USD' && (
                                            <div>
                                                <span className="text-slate-500">Equiv. MXN:</span>
                                                <span className="text-cyan-400 ml-2">{fmt(eq.dailyRate * PROJECT_PARAMS.exchangeRate)}/día</span>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-slate-500">Costo Acumulado:</span>
                                            <span className="text-orange-400 ml-2 font-semibold">
                                                {fmt(eq.dailyRate * (eq.currency === 'USD' ? PROJECT_PARAMS.exchangeRate : 1) * (PROJECT_PARAMS.duration * PROJECT_PARAMS.daysPerWeek))}
                                            </span>
                                        </div>
                                    </div>
                                    {eq.notes && (
                                        <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
                                            ⚠ {eq.notes}
                                        </div>
                                    )}
                                    <div className="flex gap-2 mt-3">
                                        <Link href="/seguridad" className="text-xs bg-red-500/10 text-red-400 border border-red-500/30 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                                            🛡️ Inspección Seguridad
                                        </Link>
                                        <Link href="/procesos" className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors">
                                            🔄 Ver en Procesos
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* ═══ TAB: PERSONAL ═══ */}
            {activeTab === 'personal' && (
                <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                        <h2 className="font-semibold text-white">👷 Nómina Consolidada — Proyecto {PROJECT_PARAMS.name}</h2>
                        <div className="text-sm text-slate-400">
                            Total Nómina ({PROJECT_PARAMS.duration} sem): <span className="text-cyan-400 font-bold">{fmt(WORKERS.reduce((s, w) => s + w.totalSalary, 0))}</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                                    <th className="text-left p-3">#</th>
                                    <th className="text-left p-3">Nombre</th>
                                    <th className="text-left p-3">Puesto</th>
                                    <th className="text-right p-3">$/Sem</th>
                                    <th className="text-right p-3">Sem</th>
                                    <th className="text-right p-3">Total</th>
                                    <th className="text-center p-3">Eficiencia</th>
                                    <th className="text-center p-3">DC3</th>
                                    <th className="text-left p-3">Equipo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {WORKERS.map(w => (
                                    <tr key={w.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="p-3 text-slate-500 font-mono">{w.id}</td>
                                        <td className="p-3 text-white font-medium">{w.name}</td>
                                        <td className="p-3">
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${w.role === 'Supervisor' ? 'bg-purple-500/20 text-purple-400' :
                                                    w.role === 'Seguridad' ? 'bg-red-500/20 text-red-400' :
                                                        w.role === 'Maniobrista' ? 'bg-blue-500/20 text-blue-400' :
                                                            'bg-slate-500/20 text-slate-300'
                                                }`}>{w.role}</span>
                                        </td>
                                        <td className="p-3 text-right text-slate-300 font-mono">{fmt(w.weeklySalary)}</td>
                                        <td className="p-3 text-right text-slate-400">{w.weeks}</td>
                                        <td className="p-3 text-right text-cyan-400 font-mono font-semibold">{fmt(w.totalSalary)}</td>
                                        <td className="p-3 text-center">
                                            {w.efficiency > 0 ? (
                                                <span className={`text-xs font-mono ${w.efficiency >= 90 ? 'text-emerald-400' : w.efficiency >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                                                    {w.efficiency.toFixed(1)}%
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${w.dc3Status === 'vigente' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    w.dc3Status === 'por-vencer' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-red-500/20 text-red-400'
                                                }`}>{w.dc3Count} DC3</span>
                                        </td>
                                        <td className="p-3 text-xs text-slate-400">
                                            {w.assignedEquipment.length > 0
                                                ? w.assignedEquipment.map(eqId => {
                                                    const eq = FLEET.find(e => e.id === eqId)
                                                    return eq ? `${typeIcons[eq.type]} ${eq.id}` : eqId
                                                }).join(', ')
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ TAB: FINANCIRO ═══ */}
            {activeTab === 'financiero' && (
                <div className="space-y-4">
                    {/* Budget table */}
                    <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-semibold text-white">💰 Presupuesto vs Gasto Real — Proyecto {PROJECT_PARAMS.name}</h2>
                            <div className="flex gap-4 text-sm">
                                <span className="text-slate-400">OC: <span className="text-white font-bold">{fmt(PROJECT_PARAMS.orderValue)}</span></span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                                        <th className="text-left p-3">Concepto</th>
                                        <th className="text-right p-3">Presupuesto</th>
                                        <th className="text-right p-3">Real</th>
                                        <th className="text-right p-3">Diferencia</th>
                                        <th className="p-3 text-right">% Gasto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {BUDGET.map(b => {
                                        const pct = b.budgeted > 0 ? b.actual / b.budgeted : 0
                                        return (
                                            <tr key={b.concept} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                <td className="p-3 text-white">{b.icon} {b.concept}</td>
                                                <td className="p-3 text-right text-slate-300 font-mono">{fmt(b.budgeted)}</td>
                                                <td className="p-3 text-right text-orange-400 font-mono">{fmt(b.actual)}</td>
                                                <td className={`p-3 text-right font-mono font-semibold ${b.difference > 0 ? 'text-emerald-400' : b.difference < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                                    {b.difference > 0 ? '+' : ''}{fmt(b.difference)}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full ${pct > 1 ? 'bg-red-500' : pct > 0.9 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                                style={{ width: `${Math.min(pct * 100, 100)}%` }} />
                                                        </div>
                                                        <span className="text-xs text-slate-400 font-mono w-10 text-right">{(pct * 100).toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t-2 border-white/20 bg-white/5">
                                        <td className="p-3 text-white font-bold">TOTAL</td>
                                        <td className="p-3 text-right text-white font-mono font-bold">{fmt(totalBudgeted)}</td>
                                        <td className="p-3 text-right text-orange-400 font-mono font-bold">{fmt(totalActual)}</td>
                                        <td className="p-3 text-right text-emerald-400 font-mono font-bold">+{fmt(totalDiff)}</td>
                                        <td className="p-3 text-right text-sm text-emerald-400 font-semibold">{(totalActual / totalBudgeted * 100).toFixed(0)}%</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Profit Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/20 rounded-xl p-5">
                            <div className="text-sm text-emerald-300/70">Utilidad Neta</div>
                            <div className="text-3xl font-bold text-emerald-400 mt-1">{fmt(PROJECT_PARAMS.netProfit)}</div>
                            <div className="text-xs text-emerald-300/50 mt-1">Margen: {fmtPct(PROJECT_PARAMS.profitMargin)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/20 border border-blue-500/20 rounded-xl p-5">
                            <div className="text-sm text-blue-300/70">Ahorro Herramientas</div>
                            <div className="text-3xl font-bold text-blue-400 mt-1">{fmt(PROJECT_PARAMS.toolsSavings)}</div>
                            <div className="text-xs text-blue-300/50 mt-1">Presupuesto: {fmt(PROJECT_PARAMS.toolsBudget)} → Real: {fmt(PROJECT_PARAMS.toolsActual)}</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/20 rounded-xl p-5">
                            <div className="text-sm text-purple-300/70">Gesión Proyecto (JG)</div>
                            <div className="text-3xl font-bold text-purple-400 mt-1">{fmt(25000)}</div>
                            <div className="text-xs text-purple-300/50 mt-1">1% sobre OC — Ingreso por gestión</div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB: HERRAMIENTAS ═══ */}
            {activeTab === 'herramientas' && (
                <div className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                        {toolCategories.map(cat => (
                            <button key={cat} onClick={() => setToolFilter(cat)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${toolFilter === cat
                                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                        : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {cat === 'all' ? '🔧 Todas' : cat}
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-semibold text-white">🔧 Inventario de Herramientas — Proyecto {PROJECT_PARAMS.name}</h2>
                            <div className="text-sm text-slate-400">
                                Total: <span className="text-cyan-400 font-bold">{fmt(TOOLS.reduce((s, t) => s + t.total, 0))}</span>
                                {' · '}Ahorro vs presupuesto: <span className="text-emerald-400 font-bold">{fmt(PROJECT_PARAMS.toolsSavings)}</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                                        <th className="text-left p-3">Categoría</th>
                                        <th className="text-left p-3">Descripción</th>
                                        <th className="text-center p-3">Cant</th>
                                        <th className="text-right p-3">P. Unitario</th>
                                        <th className="text-right p-3">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TOOLS.filter(t => toolFilter === 'all' || t.category === toolFilter).map((t, i) => (
                                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-300">{t.category}</span>
                                            </td>
                                            <td className="p-3 text-white">{t.name}</td>
                                            <td className="p-3 text-center text-slate-300">{t.qty}</td>
                                            <td className="p-3 text-right text-slate-400 font-mono">{fmt(t.unitPrice)}</td>
                                            <td className="p-3 text-right text-cyan-400 font-mono">{fmt(t.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB: DC3 ═══ */}
            {activeTab === 'dc3' && (
                <div className="space-y-4">
                    {/* DC3 Count Summary */}
                    <div className="grid grid-cols-6 gap-3">
                        {Object.entries(DC3_COUNTS).map(([role, count]) => (
                            <div key={role} className="bg-slate-800/60 border border-white/10 rounded-xl p-3 text-center">
                                <div className="text-2xl font-bold text-purple-400">{count}</div>
                                <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">{role}</div>
                            </div>
                        ))}
                    </div>

                    {/* Training Matrix */}
                    <div className="bg-slate-800/60 border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h2 className="font-semibold text-white">🎓 Matriz de Capacitación DC3</h2>
                            <Link href="/seguridad" className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                🛡️ Ver en Seguridad EHS →
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-white/5">
                                        <th className="text-left p-3">Curso</th>
                                        <th className="text-center p-3">Sup. Obra</th>
                                        <th className="text-center p-3">Sup. Seg.</th>
                                        <th className="text-center p-3">Armadores</th>
                                        <th className="text-center p-3">Soldadores</th>
                                        <th className="text-center p-3">Ayudantes</th>
                                        <th className="text-center p-3">Almacen.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {DC3_MATRIX.map(course => (
                                        <tr key={course.name} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-white font-medium">{course.name}</td>
                                            {['supervisor', 'seguridad', 'armadores', 'soldadores', 'ayudantes', 'almacenistas'].map(role => (
                                                <td key={role} className="p-3 text-center">
                                                    {course[role as keyof DC3Course] ? (
                                                        <span className="text-emerald-400">✓</span>
                                                    ) : (
                                                        <span className="text-slate-600">—</span>
                                                    )}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-white/10 bg-purple-500/5 flex items-center justify-between">
                            <span className="text-sm text-purple-300">Total DC3 Requeridos: <strong>32</strong></span>
                            <Link href="/expedientes" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                📁 Archivar en Expedientes →
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ TAB: PROVEEDORES ═══ */}
            {activeTab === 'proveedores' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {PROVIDERS.map(p => (
                        <div key={p.name} className="bg-slate-800/60 border border-white/10 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-semibold text-white">{p.name}</div>
                                    <div className="text-sm text-slate-400 mt-0.5">{p.service}</div>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full border ${p.status === 'activo' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                        p.status === 'por-evaluar' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                                            'bg-red-500/20 text-red-400 border-red-500/30'
                                    }`}>
                                    {p.status === 'activo' ? '● Activo' : p.status === 'por-evaluar' ? '◐ Por Evaluar' : '○ Inactivo'}
                                </span>
                            </div>
                            <div className="flex gap-4 mt-3 text-xs text-slate-400">
                                <span>📞 {p.contact}</span>
                                <span>📍 {p.city}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ─── Footer Links ─── */}
            <div className="bg-slate-800/30 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                <div className="flex gap-4">
                    <Link href="/procesos" className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                        🔄 Mapa de Procesos → MICSA-OPS-004
                    </Link>
                    <Link href="/seguridad" className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
                        🛡️ Seguridad EHS → Inspecciones
                    </Link>
                    <Link href="/expedientes" className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
                        📁 Expedientes → DC3 Archivados
                    </Link>
                </div>
                <div className="text-[10px] text-slate-500">
                    Fuente: Renta_de_Equipo_Móvil_Genspark_AI_Sheets.xlsx — 21 hojas procesadas
                </div>
            </div>
        </div>
    )
}
