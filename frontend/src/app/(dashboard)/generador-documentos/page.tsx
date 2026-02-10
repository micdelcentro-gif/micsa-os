'use client'

import { useState } from 'react'

interface DocumentTemplate {
    id: string
    nombre: string
    area: string
    areaIcon: string
    tipo: string
    campos: number
    camposLlenos: number
    estado: 'listo' | 'en_progreso' | 'pendiente' | 'requiere_firma'
    responsables: string[]
    ultimaEdicion: string
}

const MOCK_TEMPLATES: DocumentTemplate[] = [
    { id: 'DOC-001', nombre: 'Reporte Diario de Obra', area: 'Proyectos', areaIcon: '🏗️', tipo: 'Operativo', campos: 45, camposLlenos: 45, estado: 'listo', responsables: ['PRO', 'SEG'], ultimaEdicion: '2026-02-07' },
    { id: 'DOC-002', nombre: 'Acta de Cierre F6', area: 'Proyectos', areaIcon: '🏗️', tipo: 'Validación', campos: 30, camposLlenos: 22, estado: 'en_progreso', responsables: ['PRO', 'ADM', 'Cliente'], ultimaEdicion: '2026-02-06' },
    { id: 'DOC-003', nombre: 'Contrato Laboral', area: 'RH', areaIcon: '👥', tipo: 'Legal', campos: 25, camposLlenos: 25, estado: 'requiere_firma', responsables: ['RH', 'Empleado', 'DG'], ultimaEdicion: '2026-02-05' },
    { id: 'DOC-004', nombre: 'NDA - Confidencialidad', area: 'RH', areaIcon: '👥', tipo: 'Legal', campos: 15, camposLlenos: 15, estado: 'requiere_firma', responsables: ['RH', 'Empleado'], ultimaEdicion: '2026-02-05' },
    { id: 'DOC-005', nombre: 'No Competencia', area: 'RH', areaIcon: '👥', tipo: 'Legal', campos: 12, camposLlenos: 0, estado: 'pendiente', responsables: ['RH', 'Legal', 'Empleado'], ultimaEdicion: '2026-02-04' },
    { id: 'DOC-006', nombre: 'Carpeta Ironcast - Seguridad', area: 'Seguridad', areaIcon: '🛡️', tipo: 'Expediente', campos: 60, camposLlenos: 43, estado: 'en_progreso', responsables: ['SEG', 'RH', 'ADM', 'PRO'], ultimaEdicion: '2026-02-07' },
    { id: 'DOC-007', nombre: 'Alta de Proveedor', area: 'Administración', areaIcon: '📋', tipo: 'Expediente', campos: 20, camposLlenos: 20, estado: 'listo', responsables: ['ADM', 'Contabilidad'], ultimaEdicion: '2026-02-03' },
    { id: 'DOC-008', nombre: 'Carpeta Mensual REPSE - Feb 2026', area: 'Contabilidad', areaIcon: '🧮', tipo: 'Cumplimiento', campos: 35, camposLlenos: 8, estado: 'en_progreso', responsables: ['Contabilidad', 'RH', 'ADM'], ultimaEdicion: '2026-02-07' },
    { id: 'DOC-009', nombre: 'Póliza RC General 2026', area: 'Administración', areaIcon: '📋', tipo: 'Riesgo', campos: 18, camposLlenos: 16, estado: 'en_progreso', responsables: ['ADM', 'DG'], ultimaEdicion: '2026-02-04' },
    { id: 'DOC-010', nombre: 'Cotización Técnica #0045', area: 'Ventas', areaIcon: '💰', tipo: 'Comercial', campos: 40, camposLlenos: 40, estado: 'listo', responsables: ['Ventas', 'PRO'], ultimaEdicion: '2026-02-06' },
]

const AREAS = [
    { name: 'Seguridad', icon: '🛡️', color: 'from-red-500 to-orange-500', docs: 8, pendientes: 3 },
    { name: 'RH', icon: '👥', color: 'from-violet-500 to-purple-500', docs: 15, pendientes: 5 },
    { name: 'Administración', icon: '📋', color: 'from-amber-500 to-yellow-500', docs: 12, pendientes: 2 },
    { name: 'Proyectos', icon: '🏗️', color: 'from-emerald-500 to-green-500', docs: 20, pendientes: 7 },
    { name: 'Contabilidad', icon: '🧮', color: 'from-blue-500 to-cyan-500', docs: 10, pendientes: 4 },
    { name: 'Ventas', icon: '💰', color: 'from-rose-500 to-pink-500', docs: 6, pendientes: 1 },
]

const ESTADO_BADGE: Record<string, { bg: string; text: string; label: string }> = {
    listo: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: '✅ Listo para generar' },
    en_progreso: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: '🔄 En progreso' },
    pendiente: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: '⏳ Pendiente' },
    requiere_firma: { bg: 'bg-purple-500/20', text: 'text-purple-400', label: '✍️ Requiere firma' },
}

export default function GeneradorDocumentosPage() {
    const [vistaActiva, setVistaActiva] = useState<'documentos' | 'areas'>('documentos')
    const [filtroArea, setFiltroArea] = useState('todos')

    const docsFiltrados = filtroArea === 'todos' ? MOCK_TEMPLATES : MOCK_TEMPLATES.filter(d => d.area === filtroArea)

    const stats = {
        total: MOCK_TEMPLATES.length,
        listos: MOCK_TEMPLATES.filter(d => d.estado === 'listo').length,
        firmas: MOCK_TEMPLATES.filter(d => d.estado === 'requiere_firma').length,
        pendientes: MOCK_TEMPLATES.filter(d => d.estado === 'pendiente').length,
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">📄 Generador de Documentos</h1>
                    <p className="text-slate-400 mt-1">Motor central — cada área llena su parte, el sistema consolida y genera.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/25">
                        📤 Generar Todos los Listos ({stats.listos})
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Templates Activos', value: stats.total, icon: '📄', color: 'from-blue-600/20 to-blue-800/20 border-blue-500/30' },
                    { label: 'Listos p/ Generar', value: stats.listos, icon: '✅', color: 'from-emerald-600/20 to-emerald-800/20 border-emerald-500/30' },
                    { label: 'Requieren Firma', value: stats.firmas, icon: '✍️', color: 'from-purple-600/20 to-purple-800/20 border-purple-500/30' },
                    { label: 'Pendientes', value: stats.pendientes, icon: '⏳', color: 'from-amber-600/20 to-amber-800/20 border-amber-500/30' },
                ].map((stat) => (
                    <div key={stat.label} className={`bg-gradient-to-br ${stat.color} border rounded-xl p-5`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                            <span className="text-3xl">{stat.icon}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-800/50 p-1 rounded-xl w-fit">
                <button onClick={() => setVistaActiva('documentos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'documentos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    📄 Documentos
                </button>
                <button onClick={() => setVistaActiva('areas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${vistaActiva === 'areas' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                    🏢 Por Área
                </button>
            </div>

            {vistaActiva === 'areas' ? (
                /* Vista por Áreas */
                <div className="grid grid-cols-3 gap-4">
                    {AREAS.map((area) => (
                        <div key={area.name} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all cursor-pointer group">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                                {area.icon}
                            </div>
                            <h3 className="text-white font-bold text-lg mb-1">{area.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500 mt-3">
                                <span>📄 {area.docs} documentos</span>
                                <span className="text-amber-400">⏳ {area.pendientes} pendientes</span>
                            </div>
                            <div className="mt-4 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${area.color} rounded-full`} style={{ width: `${((area.docs - area.pendientes) / area.docs) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Vista Documentos */
                <div className="space-y-3">
                    {/* Filtro por área */}
                    <div className="flex gap-2 mb-4">
                        <button onClick={() => setFiltroArea('todos')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filtroArea === 'todos' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            Todos
                        </button>
                        {AREAS.map((area) => (
                            <button key={area.name} onClick={() => setFiltroArea(area.name)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${filtroArea === area.name ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                                {area.icon} {area.name}
                            </button>
                        ))}
                    </div>

                    {docsFiltrados.map((doc) => {
                        const estado = ESTADO_BADGE[doc.estado]
                        const progreso = Math.round((doc.camposLlenos / doc.campos) * 100)
                        return (
                            <div key={doc.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-all group cursor-pointer">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="text-2xl">{doc.areaIcon}</div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-xs font-mono text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{doc.id}</span>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${estado.bg} ${estado.text}`}>
                                                    {estado.label}
                                                </span>
                                                <span className="text-xs text-slate-600 bg-slate-800 px-2 py-0.5 rounded">{doc.tipo}</span>
                                            </div>
                                            <h3 className="text-white font-semibold group-hover:text-blue-400 transition-colors">{doc.nombre}</h3>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className="text-xs text-slate-500">Responsables:</span>
                                                <div className="flex gap-1">
                                                    {doc.responsables.map((r) => (
                                                        <span key={r} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{r}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        {/* Campos */}
                                        <div className="text-center">
                                            <p className="text-xs text-slate-500 mb-1">Campos</p>
                                            <p className="text-sm font-bold text-slate-300">{doc.camposLlenos}/{doc.campos}</p>
                                        </div>
                                        {/* Progress */}
                                        <div className="w-28">
                                            <div className="flex items-center justify-between text-xs mb-1">
                                                <span className="text-slate-500">Avance</span>
                                                <span className={`font-bold ${progreso === 100 ? 'text-emerald-400' : 'text-blue-400'}`}>{progreso}%</span>
                                            </div>
                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full ${progreso === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} style={{ width: `${progreso}%` }} />
                                            </div>
                                        </div>
                                        {/* Actions */}
                                        <div className="flex gap-2">
                                            {doc.estado === 'listo' && (
                                                <button className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-500 transition-all">
                                                    📤 Generar PDF
                                                </button>
                                            )}
                                            {doc.estado === 'requiere_firma' && (
                                                <button className="px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-lg hover:bg-purple-500 transition-all">
                                                    ✍️ Firmar
                                                </button>
                                            )}
                                            <button className="px-3 py-1.5 bg-slate-700 text-slate-300 text-xs font-medium rounded-lg hover:bg-slate-600 transition-all">
                                                Abrir
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
