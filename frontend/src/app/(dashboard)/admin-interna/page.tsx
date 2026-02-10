'use client'

import { useState } from 'react'

// Datos reales extraídos de administracion_interna_limpio.xlsx
const CAJA = {
    total: 485367,
    bancoNu: 94503,
    bancoAfirme: 333800,
    efectivo: 57064,
    totalPorPagar: 100600,
    totalPorCobrar: 145617.20,
    arranqueIroncast: 304295,
    nominaOficina5sem: 106000,
    efectivoSoportar5sem: 410295,
    dineroLibre: 120089.20,
}

const KPIS = [
    { label: 'Liquidez Total (Caja)', value: '$485,367', color: 'emerald', icon: '💰' },
    { label: 'Caja Libre Real', value: '$120,089', color: 'blue', icon: '🏦' },
    { label: 'Burn Rate Semanal', value: '$21,200', color: 'amber', icon: '🔥' },
    { label: '% Caja Comprometida', value: '54.8%', color: 'rose', icon: '📊' },
    { label: 'Colchón de Seguridad', value: '5.6 sem', color: 'cyan', icon: '🛡️' },
    { label: 'Capacidad Retiro', value: '$100,089', color: 'violet', icon: '💵' },
]

const DEUDAS_COBROS = {
    totalDeudas: 100600,
    totalPorCobrar: 145617.20,
    ratioCobrosDeudas: 1.45,
    dependenciaCobros: '30%',
    riesgoCashGap: 'BAJO',
}

interface Obligacion {
    categoria: string
    concepto: string
    vencimiento: string
    monto: number
    estado: 'pagado' | 'pendiente' | 'abonado'
    abonado: number
    saldo: number
}

const OBLIGACIONES: Obligacion[] = [
    { categoria: 'Tarjeta', concepto: 'Stori - Franciss', vencimiento: 'Mensual', monto: 4636, estado: 'pagado', abonado: 4636, saldo: 0 },
    { categoria: 'Vehículo', concepto: 'Motor F150', vencimiento: '—', monto: 8000, estado: 'pagado', abonado: 8000, saldo: 0 },
    { categoria: 'Renta', concepto: 'Oficina', vencimiento: '—', monto: 8120, estado: 'pagado', abonado: 8120, saldo: 0 },
    { categoria: 'Seguro', concepto: 'Póliza Suburban', vencimiento: '9 enero', monto: 1105.19, estado: 'pendiente', abonado: 0, saldo: 1105.19 },
    { categoria: 'Seguro', concepto: 'Póliza F150', vencimiento: '13 enero', monto: 541.78, estado: 'pendiente', abonado: 0, saldo: 541.78 },
    { categoria: 'Proveedor', concepto: 'Bordatech', vencimiento: '—', monto: 500, estado: 'pendiente', abonado: 0, saldo: 500 },
    { categoria: 'Equipo', concepto: 'Máquina de Soldar', vencimiento: '—', monto: 25000, estado: 'pendiente', abonado: 0, saldo: 25000 },
    { categoria: 'Nómina', concepto: 'Nómina Oficina', vencimiento: 'Hoy', monto: 15700, estado: 'pendiente', abonado: 0, saldo: 15700 },
]

interface Empleado {
    nombre: string
    puesto: string
    pagoSemanal: number
    pagoQuincenal: number
    pagoMensual: number
    pagoAnual: number
    estatus: 'Activo' | 'Inactivo'
}

const NOMINA: Empleado[] = [
    { nombre: 'Armando', puesto: 'Administración', pagoSemanal: 3000, pagoQuincenal: 6000, pagoMensual: 12000, pagoAnual: 144000, estatus: 'Activo' },
    { nombre: 'Mayte', puesto: 'Administración', pagoSemanal: 3000, pagoQuincenal: 6000, pagoMensual: 12000, pagoAnual: 144000, estatus: 'Activo' },
    { nombre: 'Fer', puesto: 'Asistente', pagoSemanal: 1200, pagoQuincenal: 2400, pagoMensual: 4800, pagoAnual: 57600, estatus: 'Activo' },
    { nombre: 'Arturo', puesto: 'Técnico', pagoSemanal: 2500, pagoQuincenal: 5000, pagoMensual: 10000, pagoAnual: 120000, estatus: 'Activo' },
    { nombre: 'Hugo', puesto: 'Soporte', pagoSemanal: 3000, pagoQuincenal: 6000, pagoMensual: 12000, pagoAnual: 144000, estatus: 'Activo' },
    { nombre: 'Daniel', puesto: 'Administración', pagoSemanal: 3000, pagoQuincenal: 6000, pagoMensual: 12000, pagoAnual: 144000, estatus: 'Inactivo' },
]

const COSTOS_ANUALES = [
    { categoria: 'Nóminas', costo: 1648310.40, porcentaje: 54.4, color: 'bg-blue-500' },
    { categoria: 'Gastos Fijos', costo: 781274, porcentaje: 25.8, color: 'bg-emerald-500' },
    { categoria: 'Gastos Variables', costo: 340600, porcentaje: 11.2, color: 'bg-amber-500' },
    { categoria: 'Financiamiento', costo: 213200, porcentaje: 7.0, color: 'bg-rose-500' },
    { categoria: 'Mantenimiento', costo: 46800, porcentaje: 1.5, color: 'bg-slate-500' },
]

const IRONCAST = {
    ordenCompra: 1301706,
    costosProyectados: 946105,
    utilidad: 355601,
    nominaSemanal: 24844,
    imss: 8935.60,
    viaticos: 2000,
    bonos: 1500,
}

const formatMXN = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n)

export default function AdminInternaPage() {
    const [tabActiva, setTabActiva] = useState<'dashboard' | 'caja' | 'obligaciones' | 'nomina' | 'costos' | 'proyecto'>('dashboard')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">🏢 Administración Interna</h1>
                <p className="text-slate-400 mt-1">Control financiero, nómina, costos y proyecciones — datos en tiempo real</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl overflow-x-auto">
                {[
                    { id: 'dashboard', label: '📊 Dashboard', },
                    { id: 'caja', label: '💰 Desglose Caja' },
                    { id: 'obligaciones', label: '📋 Obligaciones' },
                    { id: 'nomina', label: '👥 Nómina' },
                    { id: 'costos', label: '📈 Costos Anuales' },
                    { id: 'proyecto', label: '🏗️ Proyecto IronCast' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setTabActiva(tab.id as typeof tabActiva)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${tabActiva === tab.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* DASHBOARD */}
            {tabActiva === 'dashboard' && (
                <div className="space-y-6">
                    {/* KPIs Grid */}
                    <div className="grid grid-cols-3 gap-4">
                        {KPIS.map((kpi) => (
                            <div key={kpi.label} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-400 text-sm">{kpi.label}</p>
                                        <p className="text-2xl font-bold text-white mt-1">{kpi.value}</p>
                                    </div>
                                    <span className="text-3xl">{kpi.icon}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Deudas vs Cobros */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-red-600/10 to-red-800/10 border border-red-500/30 rounded-xl p-6">
                            <h3 className="text-red-400 font-semibold text-sm mb-3">💳 TOTAL DEUDAS</h3>
                            <p className="text-3xl font-bold text-white">{formatMXN(DEUDAS_COBROS.totalDeudas)}</p>
                            <p className="text-sm text-slate-500 mt-2">Riesgo Cash Gap: <span className="text-emerald-400 font-bold">{DEUDAS_COBROS.riesgoCashGap}</span></p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-800/10 border border-emerald-500/30 rounded-xl p-6">
                            <h3 className="text-emerald-400 font-semibold text-sm mb-3">📥 TOTAL POR COBRAR</h3>
                            <p className="text-3xl font-bold text-white">{formatMXN(DEUDAS_COBROS.totalPorCobrar)}</p>
                            <p className="text-sm text-slate-500 mt-2">Ratio cobros/deudas: <span className="text-blue-400 font-bold">{DEUDAS_COBROS.ratioCobrosDeudas}x</span></p>
                        </div>
                    </div>

                    {/* Costos Desglose Visual */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-white font-bold mb-4">📊 Desglose de Costos Anuales — Total: {formatMXN(3030184.40)}</h3>
                        <div className="space-y-3">
                            {COSTOS_ANUALES.map((c) => (
                                <div key={c.categoria} className="flex items-center gap-4">
                                    <span className="text-sm text-slate-400 w-36">{c.categoria}</span>
                                    <div className="flex-1 h-6 bg-slate-700 rounded-full overflow-hidden">
                                        <div className={`h-full ${c.color} rounded-full flex items-center justify-end pr-3 transition-all`} style={{ width: `${c.porcentaje}%` }}>
                                            <span className="text-xs font-bold text-white">{c.porcentaje}%</span>
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-white w-32 text-right">{formatMXN(c.costo)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Alertas */}
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5">
                        <h3 className="text-amber-400 font-bold mb-3">⚠️ Alertas y Recomendaciones</h3>
                        <ul className="space-y-2 text-sm text-slate-300">
                            <li>• Revisar gastos que excedan el 80% del presupuesto</li>
                            <li>• Monitorear flujo de caja semanal</li>
                            <li>• Evaluar rentabilidad por proyecto mensualmente</li>
                            <li>• Actualizar proyecciones trimestralmente</li>
                            <li>• Verificar cumplimiento de metas KPI</li>
                        </ul>
                    </div>
                </div>
            )}

            {/* DESGLOSE CAJA */}
            {tabActiva === 'caja' && (
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-500/30 rounded-xl p-6">
                        <h3 className="text-blue-400 font-semibold text-sm mb-4">💰 ¿DÓNDE ESTÁ EL DINERO?</h3>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Banco Nu', value: CAJA.bancoNu, icon: '🟣', pct: Math.round((CAJA.bancoNu / CAJA.total) * 100) },
                                { label: 'Banco Afirme', value: CAJA.bancoAfirme, icon: '🔵', pct: Math.round((CAJA.bancoAfirme / CAJA.total) * 100) },
                                { label: 'Efectivo', value: CAJA.efectivo, icon: '💵', pct: Math.round((CAJA.efectivo / CAJA.total) * 100) },
                            ].map((b) => (
                                <div key={b.label} className="bg-slate-800/60 rounded-xl p-5 text-center">
                                    <span className="text-3xl">{b.icon}</span>
                                    <p className="text-white font-bold text-xl mt-2">{formatMXN(b.value)}</p>
                                    <p className="text-slate-400 text-sm mt-1">{b.label} ({b.pct}%)</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 bg-slate-800/60 rounded-xl p-4 text-center">
                            <p className="text-slate-400 text-sm">TOTAL EN CAJA</p>
                            <p className="text-white font-bold text-3xl">{formatMXN(CAJA.total)}</p>
                        </div>
                    </div>

                    {/* Flujo de 5 semanas */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-white font-bold mb-4">📅 Proyección 5 Semanas (Arranque IronCast)</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Arranque Proyecto IronCast', value: CAJA.arranqueIroncast, type: 'gasto' },
                                { label: 'Nómina Oficina (5 semanas)', value: CAJA.nominaOficina5sem, type: 'gasto' },
                                { label: 'Efectivo Total a Soportar', value: CAJA.efectivoSoportar5sem, type: 'total' },
                                { label: 'Dinero Libre Disponible', value: CAJA.dineroLibre, type: 'libre' },
                            ].map((item) => (
                                <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl ${item.type === 'libre' ? 'bg-emerald-500/10 border border-emerald-500/30' : item.type === 'total' ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-slate-800/60'}`}>
                                    <span className={`text-sm ${item.type === 'libre' ? 'text-emerald-400 font-bold' : item.type === 'total' ? 'text-amber-400 font-bold' : 'text-slate-400'}`}>{item.label}</span>
                                    <span className={`font-bold text-lg ${item.type === 'libre' ? 'text-emerald-400' : item.type === 'total' ? 'text-amber-400' : 'text-white'}`}>{formatMXN(item.value)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* OBLIGACIONES */}
            {tabActiva === 'obligaciones' && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-lg">📋 Obligaciones por Pagar</h3>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-all">
                            + Registrar Pago
                        </button>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Categoría</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Concepto</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Vencimiento</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Monto</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {OBLIGACIONES.map((ob, i) => (
                                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                        <td className="px-4 py-3 text-sm text-slate-300">{ob.categoria}</td>
                                        <td className="px-4 py-3 text-sm text-white font-medium">{ob.concepto}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{ob.vencimiento}</td>
                                        <td className="px-4 py-3 text-sm text-white text-right font-mono">{formatMXN(ob.monto)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ob.estado === 'pagado' ? 'bg-emerald-500/20 text-emerald-400' : ob.estado === 'abonado' ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {ob.estado === 'pagado' ? '✅' : ob.estado === 'abonado' ? '🔄' : '⏳'} {ob.estado}
                                            </span>
                                        </td>
                                        <td className={`px-4 py-3 text-sm text-right font-mono font-bold ${ob.saldo === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {formatMXN(ob.saldo)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-800/60">
                                    <td colSpan={3} className="px-4 py-3 text-sm font-bold text-white">TOTAL</td>
                                    <td className="px-4 py-3 text-sm text-white text-right font-mono font-bold">{formatMXN(OBLIGACIONES.reduce((s, o) => s + o.monto, 0))}</td>
                                    <td></td>
                                    <td className="px-4 py-3 text-sm text-red-400 text-right font-mono font-bold">{formatMXN(OBLIGACIONES.reduce((s, o) => s + o.saldo, 0))}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* NÓMINA */}
            {tabActiva === 'nomina' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 text-center">
                            <p className="text-slate-400 text-sm">Empleados Activos</p>
                            <p className="text-3xl font-bold text-white mt-1">{NOMINA.filter(e => e.estatus === 'Activo').length}</p>
                        </div>
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5 text-center">
                            <p className="text-slate-400 text-sm">Nómina Semanal</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatMXN(NOMINA.filter(e => e.estatus === 'Activo').reduce((s, e) => s + e.pagoSemanal, 0))}</p>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 text-center">
                            <p className="text-slate-400 text-sm">Nómina Anual</p>
                            <p className="text-3xl font-bold text-white mt-1">{formatMXN(NOMINA.filter(e => e.estatus === 'Activo').reduce((s, e) => s + e.pagoAnual, 0))}</p>
                        </div>
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Nombre</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Puesto</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Semanal</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Quincenal</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Mensual</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Anual</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Estatus</th>
                                </tr>
                            </thead>
                            <tbody>
                                {NOMINA.map((emp, i) => (
                                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                        <td className="px-4 py-3 text-sm text-white font-medium">{emp.nombre}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{emp.puesto}</td>
                                        <td className="px-4 py-3 text-sm text-white text-right font-mono">{formatMXN(emp.pagoSemanal)}</td>
                                        <td className="px-4 py-3 text-sm text-white text-right font-mono">{formatMXN(emp.pagoQuincenal)}</td>
                                        <td className="px-4 py-3 text-sm text-white text-right font-mono">{formatMXN(emp.pagoMensual)}</td>
                                        <td className="px-4 py-3 text-sm text-white text-right font-mono">{formatMXN(emp.pagoAnual)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${emp.estatus === 'Activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                {emp.estatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* COSTOS ANUALES — DESGLOSE DETALLADO */}
            {tabActiva === 'costos' && (() => {
                const GRAN_TOTAL = 3030184.40
                const pct = (v: number) => ((v / GRAN_TOTAL) * 100).toFixed(1)
                const sections = [
                    {
                        title: '👥 A) NÓMINAS', color: 'blue', subtotal: 1648310.40, pctTotal: '54.4%', groups: [
                            {
                                subtitle: 'Nómina Oficina', items: [
                                    { concepto: 'Armando — Administración', sem: 3000, mens: 12000, anual: 144000 },
                                    { concepto: 'Mayte — Administración', sem: 3000, mens: 12000, anual: 144000 },
                                    { concepto: 'Fer — Asistente', sem: 1200, mens: 4800, anual: 57600 },
                                    { concepto: 'Arturo — Técnico', sem: 2500, mens: 10000, anual: 120000 },
                                    { concepto: 'Hugo — Soporte', sem: 3000, mens: 12000, anual: 144000 },
                                    { concepto: 'Daniel — Administración', sem: 3000, mens: 12000, anual: 144000 },
                                ], subtotal: 753600
                            },
                            {
                                subtitle: 'Nómina Proyecto IronCast (24 sem)', items: [
                                    { concepto: 'Personal de campo', sem: 24844, mens: 99376, anual: 596256 },
                                    { concepto: 'IMSS y cargas sociales', sem: 8935.60, mens: 35742.40, anual: 214454.40 },
                                    { concepto: 'Viáticos y traslados', sem: 2000, mens: 8000, anual: 48000 },
                                    { concepto: 'Bonos productividad', sem: 1500, mens: 6000, anual: 36000 },
                                ], subtotal: 894710.40
                            },
                        ]
                    },
                    {
                        title: '🏢 B) GASTOS FIJOS OPERATIVOS', color: 'emerald', subtotal: 781274, pctTotal: '25.8%', groups: [
                            {
                                subtitle: '', items: [
                                    { concepto: 'Renta Oficina', sem: 2030, mens: 8120, anual: 105560 },
                                    { concepto: 'Internet', sem: 200, mens: 800, anual: 10400 },
                                    { concepto: 'Pólizas / Seguros', sem: 500, mens: 2000, anual: 26000 },
                                    { concepto: 'IMSS / Impuestos', sem: 11169.50, mens: 44678, anual: 580814 },
                                    { concepto: 'Software / Licencias', sem: 375, mens: 1500, anual: 19500 },
                                    { concepto: 'Mantenimiento Oficina', sem: 500, mens: 2000, anual: 26000 },
                                    { concepto: 'Servicios Varios', sem: 250, mens: 1000, anual: 13000 },
                                ], subtotal: 781274
                            },
                        ]
                    },
                    {
                        title: '📊 C) GASTOS VARIABLES', color: 'amber', subtotal: 340600, pctTotal: '11.2%', groups: [
                            {
                                subtitle: '', items: [
                                    { concepto: 'Proveedores / Materiales', sem: 3500, mens: 14000, anual: 182000 },
                                    { concepto: 'Capacitación', sem: 500, mens: 2000, anual: 26000 },
                                    { concepto: 'Combustible Vehículo', sem: 800, mens: 3200, anual: 41600 },
                                    { concepto: 'Herramientas', sem: 400, mens: 1600, anual: 20800 },
                                    { concepto: 'Marketing / Publicidad', sem: 300, mens: 1200, anual: 15600 },
                                    { concepto: 'Viajes / Representación', sem: 600, mens: 2400, anual: 31200 },
                                    { concepto: 'Eventos Corporativos', sem: 250, mens: 1000, anual: 13000 },
                                    { concepto: 'Otros Variables', sem: 200, mens: 800, anual: 10400 },
                                ], subtotal: 340600
                            },
                        ]
                    },
                    {
                        title: '💳 D) FINANCIAMIENTO Y TARJETAS', color: 'rose', subtotal: 213200, pctTotal: '7.0%', groups: [
                            {
                                subtitle: '', items: [
                                    { concepto: 'Tarjeta Crédito Principal', sem: 1200, mens: 4800, anual: 62400 },
                                    { concepto: 'Tarjeta Empresarial', sem: 800, mens: 3200, anual: 41600 },
                                    { concepto: 'Préstamo Vehicular', sem: 1500, mens: 6000, anual: 78000 },
                                    { concepto: 'Línea de Crédito', sem: 600, mens: 2400, anual: 31200 },
                                ], subtotal: 213200
                            },
                        ]
                    },
                    {
                        title: '🔧 E) MANTENIMIENTO VEHÍCULOS', color: 'slate', subtotal: 46800, pctTotal: '1.5%', groups: [
                            {
                                subtitle: '', items: [
                                    { concepto: 'Mantenimiento Preventivo', sem: 400, mens: 1600, anual: 20800 },
                                    { concepto: 'Reparaciones', sem: 300, mens: 1200, anual: 15600 },
                                    { concepto: 'Llantas / Refacciones', sem: 200, mens: 800, anual: 10400 },
                                ], subtotal: 46800
                            },
                        ]
                    },
                ]
                const colorMap: Record<string, string> = { blue: 'bg-blue-500', emerald: 'bg-emerald-500', amber: 'bg-amber-500', rose: 'bg-rose-500', slate: 'bg-slate-500' }
                const borderMap: Record<string, string> = { blue: 'border-blue-500/30', emerald: 'border-emerald-500/30', amber: 'border-amber-500/30', rose: 'border-rose-500/30', slate: 'border-slate-500/30' }
                const textMap: Record<string, string> = { blue: 'text-blue-400', emerald: 'text-emerald-400', amber: 'text-amber-400', rose: 'text-rose-400', slate: 'text-slate-400' }
                return (
                    <div className="space-y-6">
                        {/* Gran Total */}
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-white font-bold text-lg mb-1">📊 GRAN TOTAL COSTO ANUAL</h3>
                                    <p className="text-4xl font-bold text-white">{formatMXN(GRAN_TOTAL)}</p>
                                    <p className="text-slate-400 text-sm mt-1">Burn rate mensual: {formatMXN(252515.37)} | Semanal: {formatMXN(58274)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-slate-500 text-xs mb-2">DISTRIBUCIÓN</p>
                                    <div className="flex h-4 w-48 rounded-full overflow-hidden">
                                        {sections.map(s => <div key={s.title} className={`${colorMap[s.color]}`} style={{ width: s.pctTotal }} />)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Summary cards */}
                        <div className="grid grid-cols-5 gap-3">
                            {sections.map(s => (
                                <div key={s.title} className={`bg-slate-800/40 border ${borderMap[s.color]} rounded-xl p-4`}>
                                    <div className={`w-3 h-3 rounded-full ${colorMap[s.color]} mb-2`} />
                                    <p className="text-slate-400 text-xs">{s.title.split(') ')[1]}</p>
                                    <p className="text-white font-bold text-lg mt-1">{formatMXN(s.subtotal)}</p>
                                    <p className={`${textMap[s.color]} text-sm font-bold`}>{s.pctTotal}</p>
                                </div>
                            ))}
                        </div>

                        {/* Detailed sections */}
                        {sections.map(s => (
                            <div key={s.title} className={`bg-slate-800/40 border ${borderMap[s.color]} rounded-xl overflow-hidden`}>
                                <div className="px-5 py-4 border-b border-slate-700/50 flex items-center justify-between">
                                    <h3 className={`${textMap[s.color]} font-bold`}>{s.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-bold">{formatMXN(s.subtotal)}</span>
                                        <span className={`${textMap[s.color]} text-sm font-bold px-2 py-0.5 rounded-full ${colorMap[s.color].replace('bg-', 'bg-')}/20`}>{s.pctTotal}</span>
                                    </div>
                                </div>
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">Concepto</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Semanal</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Mensual</th>
                                            <th className="text-right px-4 py-2.5 text-xs font-semibold text-slate-500 uppercase">Anual</th>
                                            <th className="text-right px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase">% Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {s.groups.map((g, gi) => (
                                            <>{g.subtitle && <tr key={`sub-${gi}`}><td colSpan={5} className="px-5 py-2 text-xs font-bold text-slate-400 bg-slate-800/40 uppercase tracking-wider">{g.subtitle} — Subtotal: {formatMXN(g.subtotal)}</td></tr>}
                                                {g.items.map((item, ii) => (
                                                    <tr key={`${gi}-${ii}`} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                                                        <td className="px-5 py-2.5 text-sm text-slate-300">{item.concepto}</td>
                                                        <td className="px-4 py-2.5 text-sm text-white text-right font-mono">{formatMXN(item.sem)}</td>
                                                        <td className="px-4 py-2.5 text-sm text-white text-right font-mono">{formatMXN(item.mens)}</td>
                                                        <td className="px-4 py-2.5 text-sm text-white text-right font-mono font-medium">{formatMXN(item.anual)}</td>
                                                        <td className={`px-5 py-2.5 text-sm text-right font-mono font-bold ${textMap[s.color]}`}>{pct(item.anual)}%</td>
                                                    </tr>
                                                ))}</>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}

                        {/* RESUMEN EJECUTIVO FINAL */}
                        <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 border border-blue-500/30 rounded-xl p-6">
                            <h3 className="text-blue-400 font-bold mb-4">📈 RESUMEN EJECUTIVO — COSTO TOTAL ANUAL</h3>
                            <table className="w-full">
                                <thead><tr className="border-b border-slate-700"><th className="text-left py-2 text-xs text-slate-500 uppercase">Categoría</th><th className="text-right py-2 text-xs text-slate-500 uppercase">Total Anual</th><th className="text-right py-2 text-xs text-slate-500 uppercase w-32">% del Total</th><th className="py-2 w-48"></th></tr></thead>
                                <tbody>
                                    {sections.map(s => (
                                        <tr key={s.title} className="border-b border-slate-700/30">
                                            <td className="py-3 text-sm text-white font-medium">{s.title}</td>
                                            <td className="py-3 text-sm text-white text-right font-mono font-bold">{formatMXN(s.subtotal)}</td>
                                            <td className={`py-3 text-sm text-right font-bold ${textMap[s.color]}`}>{s.pctTotal}</td>
                                            <td className="py-3 pl-4"><div className="h-3 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${colorMap[s.color]} rounded-full`} style={{ width: s.pctTotal }} /></div></td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-800/60"><td className="py-3 text-sm text-white font-bold">GRAN TOTAL</td><td className="py-3 text-lg text-white text-right font-mono font-bold">{formatMXN(GRAN_TOTAL)}</td><td className="py-3 text-sm text-right font-bold text-white">100%</td><td></td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })()}

            {/* PROYECTO IRONCAST */}
            {tabActiva === 'proyecto' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-600/10 to-blue-800/10 border border-blue-500/30 rounded-xl p-6">
                            <h3 className="text-blue-400 font-semibold text-sm mb-2">📋 Orden de Compra</h3>
                            <p className="text-3xl font-bold text-white">{formatMXN(IRONCAST.ordenCompra)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-600/10 to-red-800/10 border border-red-500/30 rounded-xl p-6">
                            <h3 className="text-red-400 font-semibold text-sm mb-2">💸 Costos Proyectados</h3>
                            <p className="text-3xl font-bold text-white">{formatMXN(IRONCAST.costosProyectados)}</p>
                        </div>
                        <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-800/10 border border-emerald-500/30 rounded-xl p-6">
                            <h3 className="text-emerald-400 font-semibold text-sm mb-2">🎯 Utilidad Esperada</h3>
                            <p className="text-3xl font-bold text-white">{formatMXN(IRONCAST.utilidad)}</p>
                            <p className="text-emerald-400 text-sm mt-1 font-medium">Margen: {Math.round((IRONCAST.utilidad / IRONCAST.ordenCompra) * 100)}%</p>
                        </div>
                    </div>

                    {/* Costos del proyecto */}
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6">
                        <h3 className="text-white font-bold mb-4">📊 Desglose Semanal IronCast</h3>
                        <div className="space-y-3">
                            {[
                                { label: 'Nómina Proyecto (Personal)', semanal: IRONCAST.nominaSemanal, icon: '👷' },
                                { label: 'IMSS y Cargas Sociales', semanal: IRONCAST.imss, icon: '🏛️' },
                                { label: 'Viáticos y Traslados', semanal: IRONCAST.viaticos, icon: '🚗' },
                                { label: 'Bonos Productividad', semanal: IRONCAST.bonos, icon: '⭐' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between p-4 bg-slate-800/60 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{item.icon}</span>
                                        <span className="text-sm text-slate-300">{item.label}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-white font-bold">{formatMXN(item.semanal)}/sem</p>
                                        <p className="text-slate-500 text-xs">{formatMXN(item.semanal * 4)}/mes</p>
                                    </div>
                                </div>
                            ))}
                            <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                                <span className="text-sm text-blue-400 font-bold">TOTAL SEMANAL PROYECTO</span>
                                <span className="text-blue-400 font-bold text-lg">{formatMXN(IRONCAST.nominaSemanal + IRONCAST.imss + IRONCAST.viaticos + IRONCAST.bonos)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
