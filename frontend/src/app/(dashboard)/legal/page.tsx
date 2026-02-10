'use client'

import { useState, useEffect } from 'react'
import { getExpedientesLegales, getLegalStats } from '@/lib/api'

interface CasoLegal {
    id: string
    tipo: 'laboral' | 'mercantil' | 'civil' | 'fiscal'
    titulo: string
    contraparte: string
    abogado: string
    montoDisputa: number
    riesgoFinanciero: 'alto' | 'medio' | 'bajo'
    estado: 'activo' | 'en_proceso' | 'resuelto' | 'apelacion'
    fechaInicio: string
    proximaAudiencia: string
    notas: string
}

const MOCK_CASOS: CasoLegal[] = [
    { id: 'LEG-001', tipo: 'laboral', titulo: 'Demanda Laboral - Polinar', contraparte: 'Ex-empleado Polinar', abogado: 'Lic. Rodríguez', montoDisputa: 185000, riesgoFinanciero: 'alto', estado: 'activo', fechaInicio: '2025-11-15', proximaAudiencia: '2026-03-10', notas: 'Demanda por despido injustificado. Revisar evidencias de contrato.' },
    { id: 'LEG-002', tipo: 'mercantil', titulo: 'Cobro de Factura - Cliente X', contraparte: 'Empresa ZF', abogado: 'Lic. Martínez', montoDisputa: 245000, riesgoFinanciero: 'medio', estado: 'en_proceso', fechaInicio: '2025-12-01', proximaAudiencia: '2026-02-28', notas: 'Factura vencida a 90 días. Proceso de cobranza legal.' },
    { id: 'LEG-003', tipo: 'laboral', titulo: 'Reclamación IMSS - Daniel', contraparte: 'IMSS', abogado: 'Lic. Rodríguez', montoDisputa: 42000, riesgoFinanciero: 'bajo', estado: 'resuelto', fechaInicio: '2025-08-10', proximaAudiencia: '—', notas: 'Resuelto a favor. Pago de diferencias completado.' },
]

interface Contrato {
    id: string
    tipo: 'laboral' | 'nda' | 'no_competencia' | 'servicio' | 'arrendamiento'
    titulo: string
    parte: string
    vigencia: string
    estado: 'vigente' | 'por_vencer' | 'vencido' | 'pendiente_firma'
    fechaFirma: string
}

const MOCK_CONTRATOS: Contrato[] = [
    { id: 'CON-001', tipo: 'laboral', titulo: 'Contrato Laboral', parte: 'Armando García', vigencia: 'Indefinido', estado: 'vigente', fechaFirma: '2025-06-01' },
    { id: 'CON-002', tipo: 'nda', titulo: 'Acuerdo de Confidencialidad', parte: 'Armando García', vigencia: '2 años', estado: 'vigente', fechaFirma: '2025-06-01' },
    { id: 'CON-003', tipo: 'no_competencia', titulo: 'Cláusula No Competencia', parte: 'Armando García', vigencia: '1 año post-empleo', estado: 'vigente', fechaFirma: '2025-06-01' },
    { id: 'CON-004', tipo: 'laboral', titulo: 'Contrato Laboral', parte: 'Mayte López', vigencia: 'Indefinido', estado: 'vigente', fechaFirma: '2025-07-15' },
    { id: 'CON-005', tipo: 'nda', titulo: 'Acuerdo de Confidencialidad', parte: 'Mayte López', vigencia: '2 años', estado: 'pendiente_firma', fechaFirma: '—' },
    { id: 'CON-006', tipo: 'no_competencia', titulo: 'Cláusula No Competencia', parte: 'Hugo Torres', vigencia: '1 año', estado: 'pendiente_firma', fechaFirma: '—' },
    { id: 'CON-007', tipo: 'arrendamiento', titulo: 'Renta Oficina', parte: 'Inm. del Centro', vigencia: '12 meses', estado: 'vigente', fechaFirma: '2025-09-01' },
    { id: 'CON-008', tipo: 'servicio', titulo: 'Contrato Servicio IronCast', parte: 'Ironcast SA de CV', vigencia: 'Por proyecto', estado: 'vigente', fechaFirma: '2026-01-10' },
]

const formatMXN = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(n)

const ESTADO_CASO: Record<string, { bg: string; text: string; label: string }> = {
    activo: { bg: 'bg-red-500/20', text: 'text-red-400', label: '🔴 Activo' },
    en_proceso: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '🟡 En proceso' },
    resuelto: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '✅ Resuelto' },
    apelacion: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '⚖️ Apelación' },
}

const ESTADO_CONTRATO: Record<string, { bg: string; text: string; label: string }> = {
    vigente: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '✅ Vigente' },
    por_vencer: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '⚠️ Por vencer' },
    vencido: { bg: 'bg-red-500/20', text: 'text-red-400', label: '❌ Vencido' },
    pendiente_firma: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '✍️ Pendiente firma' },
}

export default function LegalPage() {
    const [vista, setVista] = useState<'casos' | 'contratos'>('casos')
    const [casos, setCasos] = useState<any[]>([])
    const [stats, setStats] = useState({ exposicion_total: 0, casos_activos: 0, total_casos: 0 })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [casosData, statsData] = await Promise.all([
                    getExpedientesLegales(),
                    getLegalStats()
                ])
                setCasos(Array.isArray(casosData) ? casosData : [])
                setStats(statsData)
            } catch (error) {
                console.error("Error fetching legal data:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const exposicionTotal = stats.exposicion_total
    const pendientesFirma = MOCK_CONTRATOS.filter(c => c.estado === 'pendiente_firma').length

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">⚖️ Legal</h1>
                    <p className="text-slate-400 mt-1">Expedientes legales, contratos, NDA y cumplimiento</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold hover:from-blue-500 hover:to-blue-400 transition-all shadow-lg shadow-blue-500/25">
                    + Nuevo Registro
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-red-600/10 to-red-800/10 border border-red-500/30 rounded-xl p-5">
                    <p className="text-slate-400 text-sm">Exposición Legal</p>
                    <p className="text-2xl font-bold text-white mt-1">{formatMXN(exposicionTotal)}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-600/10 to-amber-800/10 border border-amber-500/30 rounded-xl p-5">
                    <p className="text-slate-400 text-sm">Casos Activos</p>
                    <p className="text-2xl font-bold text-white mt-1">{MOCK_CASOS.filter(c => c.estado === 'activo').length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-600/10 to-purple-800/10 border border-purple-500/30 rounded-xl p-5">
                    <p className="text-slate-400 text-sm">Contratos Pendientes Firma</p>
                    <p className="text-2xl font-bold text-white mt-1">{pendientesFirma}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-600/10 to-emerald-800/10 border border-emerald-500/30 rounded-xl p-5">
                    <p className="text-slate-400 text-sm">Contratos Vigentes</p>
                    <p className="text-2xl font-bold text-white mt-1">{MOCK_CONTRATOS.filter(c => c.estado === 'vigente').length}</p>
                </div>
            </div>

            {/* Alerta NDA */}
            {pendientesFirma > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <span className="text-2xl">⛔</span>
                    <div>
                        <p className="text-red-400 font-bold">GATE ACTIVO: {pendientesFirma} contratos pendientes de firma</p>
                        <p className="text-slate-400 text-sm">Empleados sin NDA o No Competencia firmado quedan BLOQUEADOS según política MICSA OS.</p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
                <button onClick={() => setVista('casos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vista === 'casos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    ⚖️ Casos Legales ({MOCK_CASOS.length})
                </button>
                <button onClick={() => setVista('contratos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vista === 'contratos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    📝 Contratos ({MOCK_CONTRATOS.length})
                </button>
            </div>

            {vista === 'casos' ? (
                <div className="space-y-3">
                    {loading ? (
                        <div className="text-center py-20 text-slate-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            Cargando expedientes...
                        </div>
                    ) : casos.length === 0 ? (
                        <div className="text-center py-20 bg-slate-800/20 border border-dashed border-slate-700 rounded-xl">
                            <p className="text-slate-500 text-lg">No hay expedientes registrados.</p>
                        </div>
                    ) : casos.map((caso) => {
                        const estado = ESTADO_CASO[caso.estatus.toLowerCase()] || ESTADO_CASO['activo']
                        return (
                            <div key={caso.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{caso.folio || caso.id.substring(0, 8)}</span>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.bg} ${estado.text}`}>{estado.label}</span>
                                            <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full capitalize">{caso.tipo.replace('_', ' ')}</span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${caso.riesgo === 'ALTO' || caso.riesgo === 'CRITICO' ? 'bg-red-500/20 text-red-400' : caso.riesgo === 'MEDIO' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                                Riesgo: {caso.riesgo}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-semibold text-lg">{caso.titulo}</h3>
                                        <p className="text-slate-500 text-sm mt-1">{caso.descripcion}</p>
                                        <div className="flex gap-6 mt-3 text-sm text-slate-500">
                                            <span>👤 {caso.contraparte}</span>
                                            <span>⚖️ {caso.abogado_nombre}</span>
                                            <span>📅 Inicio: {caso.fecha_inicio || '---'}</span>
                                        </div>
                                    </div>
                                    <div className="text-right ml-6">
                                        <p className="text-xs text-slate-500">Monto en disputa</p>
                                        <p className={`text-xl font-bold ${caso.estatus === 'CERRADO' ? 'text-emerald-400' : 'text-red-400'}`}>{formatMXN(caso.monto_disputa)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">ID</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Tipo</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Título</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Parte</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Vigencia</th>
                                <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Firma</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_CONTRATOS.map((c) => {
                                const estado = ESTADO_CONTRATO[c.estado]
                                return (
                                    <tr key={c.id} className="border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors">
                                        <td className="px-4 py-3 text-xs font-mono text-slate-500">{c.id}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300 capitalize">{c.tipo.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 text-sm text-white font-medium">{c.titulo}</td>
                                        <td className="px-4 py-3 text-sm text-slate-300">{c.parte}</td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{c.vigencia}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estado.bg} ${estado.text}`}>{estado.label}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-400">{c.fechaFirma}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}