"use client"

import { useState, useEffect } from "react"
import { Users, UserPlus, Search, Filter, Shield, AlertTriangle, CheckCircle, FileText } from "lucide-react"
import { getEmpleados, getEmpleadoStats } from "@/lib/api"

interface Empleado {
    id: string;
    nombre: string;
    rfc?: string;
    email?: string;
    puesto?: string;
    imss_activo?: boolean;
    estatus_repse?: string;
}

interface Stats {
    total_empleados: number;
    empleados_activos: number;
    empleados_en_proyectos: number;
    alertas_repse_rojo: number;
    alertas_repse_amarillo: number;
}

export default function EmpleadosPage() {
    const [empleados, setEmpleados] = useState<Empleado[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")

    useEffect(() => {
        const fetchData = async () => {
            console.log("Iniciando carga de datos de empleados...")
            try {
                const [empData, statsData] = await Promise.all([
                    getEmpleados(),
                    getEmpleadoStats()
                ])
                console.log("EmpData recibida:", empData)
                console.log("StatsData recibida:", statsData)
                setEmpleados(Array.isArray(empData) ? empData : [])
                setStats(statsData)
            } catch (error) {
                console.error("Error al cargar empleados:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    const filteredEmpleados = empleados.filter(e =>
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.rfc && e.rfc.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6 bg-slate-900 min-h-screen text-white">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Recursos Humanos</h1>
                    <p className="text-slate-400">Gestión de capital humano y cumplimiento REPSE</p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20">
                    <UserPlus className="w-4 h-4" />
                    Nuevo Empleado
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-blue-400" />
                        <span className="text-slate-400 text-sm">Total Plantilla</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.total_empleados || 0}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <Shield className="w-5 h-5 text-green-400" />
                        <span className="text-slate-400 text-sm">Activos</span>
                    </div>
                    <div className="text-2xl font-bold">{stats?.empleados_activos || 0}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <span className="text-slate-400 text-sm">Alerta REPSE</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-400">{stats?.alertas_repse_amarillo || 0}</div>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="text-slate-400 text-sm">Crítico REPSE</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">{stats?.alertas_repse_rojo || 0}</div>
                </div>
            </div>

            {/* List Control */}
            <div className="flex gap-4 items-center bg-slate-800/30 p-4 rounded-xl border border-slate-700">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, RFC o ID..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg border border-slate-600 transition-all">
                    <Filter className="w-4 h-4" />
                    Filtros
                </button>
            </div>

            {/* Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 text-slate-400 border-b border-slate-700">
                            <th className="px-6 py-4 font-semibold">Empleado</th>
                            <th className="px-6 py-4 font-semibold">Puesto</th>
                            <th className="px-6 py-4 font-semibold">RFC / Seguridad</th>
                            <th className="px-6 py-4 font-semibold text-center">Estatus REPSE</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredEmpleados.map((empleado) => (
                            <tr key={empleado.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-blue-100">{empleado.nombre}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider">{empleado.email || 'Sin correo'}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-slate-300">{empleado.puesto || 'General'}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-mono text-slate-400">{empleado.rfc || 'S/RFC'}</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {empleado.imss_activo ? (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                                                <span className="text-[10px] text-green-500 font-bold uppercase">IMSS Activo</span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                                <span className="text-[10px] text-red-500 font-bold uppercase">IMSS Baja</span>
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${empleado.estatus_repse === 'VERDE' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        empleado.estatus_repse === 'AMARILLO' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                            'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {empleado.estatus_repse === 'VERDE' && <CheckCircle className="w-2.5 h-2.5" />}
                                        {empleado.estatus_repse === 'VERDE' ? 'CUMPLIMIENTO' : 'ALERTA'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white" title="Documentos">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        <button className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs transition-colors">
                                            Detalles
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredEmpleados.length === 0 && (
                    <div className="p-12 text-center text-slate-500 italic">
                        No se encontraron empleados con los criterios de búsqueda.
                    </div>
                )}
            </div>
        </div>
    )
}
