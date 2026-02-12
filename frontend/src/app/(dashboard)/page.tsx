'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StatCard from '@/components/dashboard/StatCard'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { BorradoresGuardados } from '@/components/dashboard/BorradoresGuardados'
import { getReports, getLegalStats } from '@/lib/api'

interface Report {
  id: string
  reportNo: string
  cliente: string
  proyecto: string
  ubicacion: string
  especificacion: string
  fecha: string
  tipo: string
}

type ModuleCard = {
  name: string
  href: string
  icon: string
  description: string
  native?: boolean
}

type ModuleSection = {
  title: string
  gradient: string
  borderColor: string
  modules: ModuleCard[]
}

const moduleSections: ModuleSection[] = [
  {
    title: '⚙️ Operaciones',
    gradient: 'from-emerald-500/10 to-emerald-600/5',
    borderColor: 'border-emerald-500/30',
    modules: [
      { name: 'Mapa de Procesos', href: '/procesos', icon: '🔄', description: '17 procesos integrados documentados', native: true },
      { name: 'Reporte Diario', href: '/reporte-diario', icon: '📋', description: 'Reportes de obra diarios', native: true },
      { name: 'Packing List', href: '/packing-list', icon: '📦', description: 'Listas de empaque y envío', native: true },
      { name: 'Sistema de Etiquetado', href: '/sistema-etiquetado', icon: '🏷️', description: 'Etiquetas y categorías', native: true },
      { name: 'Gestión de Proyectos', href: '/legacy/projects', icon: '🏗️', description: 'Proyectos activos y asignaciones' },
      { name: 'Renta de Equipo', href: '/renta-equipo', icon: '🚛', description: 'Flota, herramientas, DC3, presupuesto', native: true },
    ]
  },
  {
    title: '🛡️ Seguridad Industrial',
    gradient: 'from-red-500/10 to-red-600/5',
    borderColor: 'border-red-500/30',
    modules: [
      { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️', description: 'Carpeta CSC, checklists, inspecciones', native: true },
      { name: 'Expedientes', href: '/expedientes', icon: '📁', description: 'Carpeta acceso planta y personal', native: true },
    ]
  },
  {
    title: '👥 Recursos Humanos',
    gradient: 'from-violet-500/10 to-violet-600/5',
    borderColor: 'border-violet-500/30',
    modules: [
      { name: 'Trabajadores Activos', href: '/trabajadores/activos', icon: '✅', description: 'Personal activo en obra', native: true },
      { name: 'Empleados', href: '/legacy/employees', icon: '👥', description: 'Administración de empleados' },
      { name: 'Capacitaciones', href: '/capacitaciones', icon: '🎓', description: 'Plan de capacitación', native: true },
      { name: 'Nómina', href: '/legacy/nomina', icon: '💰', description: 'Cálculo y timbrado de nómina' },
    ]
  },
  {
    title: '🧮 Contabilidad',
    gradient: 'from-amber-500/10 to-amber-600/5',
    borderColor: 'border-amber-500/30',
    modules: [
      { name: 'Hub Contador', href: '/legacy/contador-hub', icon: '🧮', description: 'Panel central contable' },
      { name: 'Catálogo de Cuentas', href: '/legacy/catalogo-cuentas', icon: '📒', description: 'Plan de cuentas' },
      { name: 'Pólizas', href: '/legacy/polizas', icon: '📑', description: 'Pólizas contables' },
      { name: 'Balanza', href: '/legacy/balanza', icon: '⚖️', description: 'Balanza de comprobación' },
      { name: 'Estados Financieros', href: '/legacy/estados-financieros', icon: '📊', description: 'Balance y resultados' },
      { name: 'Tesorería', href: '/legacy/tesoreria', icon: '🏦', description: 'Flujo de efectivo' },
      { name: 'Egresos', href: '/legacy/egresos', icon: '💸', description: 'Control de gastos' },
      { name: 'Libro Diario', href: '/legacy/libro-diario', icon: '📖', description: 'Registro cronológico' },
      { name: 'Cumplimiento SEIL', href: '/cumplimiento-seil', icon: '✅', description: 'Pago a contratistas y checklist fiscal', native: true },
    ]
  },
  {
    title: '💼 Ventas / CRM',
    gradient: 'from-rose-500/10 to-rose-600/5',
    borderColor: 'border-rose-500/30',
    modules: [
      { name: 'Cotizador Rápido', href: '/legacy/cotizador', icon: '⚡', description: 'Generar cotizaciones' },
      { name: 'Control de Ventas', href: '/legacy/ventas', icon: '💰', description: 'Pipeline de ventas' },
      { name: 'Clientes / Proveedores', href: '/legacy/clientes-proveedores', icon: '🤝', description: 'Entidades fiscales' },
    ]
  },
  {
    title: '📋 Calidad / ISO',
    gradient: 'from-cyan-500/10 to-cyan-600/5',
    borderColor: 'border-cyan-500/30',
    modules: [
      { name: 'Matriz ISO', href: '/matriz-iso', icon: '📊', description: 'Documentación ISO 9001', native: true },
      { name: 'Guía de Implementación', href: '/guia-iso', icon: '📘', description: 'Progreso ISO paso a paso', native: true },
      { name: 'Auditoría', href: '/legacy/auditoria', icon: '🔍', description: 'Hallazgos y acciones' },
      { name: 'Cumplimiento REPSE', href: '/legacy/repse', icon: '🏛️', description: 'Registro especializado' },
    ]
  },
  {
    title: '🔧 Administración',
    gradient: 'from-slate-500/10 to-slate-600/5',
    borderColor: 'border-slate-500/30',
    modules: [
      { name: 'Usuarios', href: '/legacy/users', icon: '👤', description: 'Gestión de accesos' },
      { name: 'Inbox', href: '/legacy/inbox', icon: '📥', description: 'Documentos entrantes' },
      { name: 'Datos Maestros', href: '/legacy/datos-maestros', icon: '🗂️', description: 'Configuración base' },
      { name: 'Sicofi', href: '/legacy/sicofi-config', icon: '🔐', description: 'Timbrado fiscal' },
    ]
  },
  {
    title: '👔 Dirección',
    gradient: 'from-orange-500/10 to-orange-600/5',
    borderColor: 'border-orange-500/30',
    modules: [
      { name: 'Admin Interna', href: '/admin-interna', icon: '🏢', description: 'Costos anuales, Ironcast, gastos DG', native: true },
      { name: 'Legal', href: '/legal', icon: '⚖️', description: 'Contratos, NDA, demandas y cumplimiento', native: true },
    ]
  },
]

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [localDraftsCount, setLocalDraftsCount] = useState(0)
  const [isoProgress, setIsoProgress] = useState(0)
  const [legalStats, setLegalStats] = useState({ exposicion_total: 0, total_casos: 0 })

  useEffect(() => {
    loadReports()
    loadLegalStats()
    updateLocalDraftsCount()
    updateISOProgress()

    const handleStorage = () => {
      updateLocalDraftsCount()
      updateISOProgress()
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const updateISOProgress = () => {
    try {
      const saved = localStorage.getItem('MICSA_Checklist_Progress')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          const checked = parsed.filter(Boolean).length
          const total = parsed.length
          setIsoProgress(Math.round((checked / total) * 100))
        }
      }
    } catch (e) {
      setIsoProgress(0)
    }
  }

  const updateLocalDraftsCount = () => {
    try {
      const drafts = JSON.parse(localStorage.getItem('MICSA_SYSTEM_DRAFTS') || '[]')
      setLocalDraftsCount(Array.isArray(drafts) ? drafts.length : 0)
    } catch (e) {
      setLocalDraftsCount(0)
    }
  }

  const loadReports = async () => {
    try {
      const data = await getReports()
      setReports(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error loading reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const loadLegalStats = async () => {
    try {
      const data = await getLegalStats()
      setLegalStats(data)
    } catch (error) {
      console.error('Error loading legal stats:', error)
    }
  }

  const now = new Date()
  const dateStr = now.toLocaleDateString('es-MX', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando sistema...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">
          Sistema Integrado de Gestión
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <p className="text-slate-400 text-sm">
              Todos los servicios en línea
            </p>
          </div>
          <span className="text-slate-600">•</span>
          <p className="text-slate-500 text-sm capitalize">{dateStr} — {timeStr}</p>

          {/* Alerta de Riesgo Legal (Real Data) */}
          {legalStats.exposicion_total > 0 && (
            <Link href="/legal" className="ml-auto flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1 rounded-full hover:bg-red-500/20 transition-all group">
              <span className="text-xs font-bold text-red-400 animate-pulse">⚠️ RIESGO: {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(legalStats.exposicion_total)}</span>
              <span className="text-[10px] text-slate-500 group-hover:text-slate-300">{legalStats.total_casos} casos</span>
            </Link>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Reportes Enviados" value={reports.length.toString()} icon="📊" color="blue" />
        <StatCard title="Módulos Activos" value="30" icon="🧩" color="green" />
        <StatCard title="Borradores" value={localDraftsCount.toString()} icon="💾" color="purple" />
        <Link href="/guia-iso" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Progreso ISO" value={`${isoProgress}%`} icon="📈" color="orange" />
        </Link>
      </div>

      {/* Borradores */}
      <BorradoresGuardados />

      {/* ─── System Integration Status ─── */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🔄 Estado de Integración
          <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
            17 procesos conectados
          </span>
        </h2>

        {/* Process Lifecycle Quick View */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { phase: 'Comercial', icon: '💼', processes: 2, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', href: '/procesos' },
            { phase: 'Planeación', icon: '📐', processes: 2, color: 'from-emerald-500/20 to-teal-500/20', border: 'border-emerald-500/30', href: '/procesos' },
            { phase: 'RH & Seguridad', icon: '👷', processes: 5, color: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', href: '/procesos' },
            { phase: 'Ejecución', icon: '⚡', processes: 4, color: 'from-orange-500/20 to-amber-500/20', border: 'border-orange-500/30', href: '/procesos' },
            { phase: 'Cierre', icon: '✅', processes: 4, color: 'from-rose-500/20 to-pink-500/20', border: 'border-rose-500/30', href: '/procesos' },
          ].map((p) => (
            <Link key={p.phase} href={p.href}
              className={`bg-gradient-to-br ${p.color} border ${p.border} rounded-xl p-4 hover:scale-[1.03] transition-all text-center group`}>
              <span className="text-2xl group-hover:scale-110 inline-block transition-transform">{p.icon}</span>
              <p className="font-bold text-white text-sm mt-1">{p.phase}</p>
              <p className="text-xs text-slate-500">{p.processes} procesos</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/expedientes" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all group flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">📁</span>
            <div>
              <p className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">6 Expedientes Activos</p>
              <p className="text-xs text-slate-500">2 aprobados • 3 en proceso • 1 pendiente</p>
            </div>
            <span className="ml-auto text-amber-400 text-xs font-bold animate-pulse">6 alertas</span>
          </Link>
          <Link href="/procesos" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all group flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🔄</span>
            <div>
              <p className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">17 Procesos Documentados</p>
              <p className="text-xs text-slate-500">Cotización → Planeación → Ejecución → Cierre</p>
            </div>
          </Link>
          <Link href="/seguridad" className="bg-slate-800/40 border border-red-500/30 rounded-xl p-4 hover:border-red-400/50 transition-all group flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🛡️</span>
            <div>
              <p className="font-bold text-white text-sm group-hover:text-red-300 transition-colors">Seguridad Industrial EHS</p>
              <p className="text-xs text-slate-500">9/16 CSC • 10 checklists • 19 inspecciones</p>
            </div>
            <span className="ml-auto text-amber-400 text-xs font-bold">56%</span>
          </Link>
          <Link href="/renta-equipo" className="bg-slate-800/40 border border-blue-500/30 rounded-xl p-4 hover:border-blue-400/50 transition-all group flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">🚛</span>
            <div>
              <p className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">Renta de Equipo Móvil</p>
              <p className="text-xs text-slate-500">6 equipos • $576K renta • 32 DC3</p>
            </div>
            <span className="ml-auto text-cyan-400 text-xs font-bold">34%</span>
          </Link>
          <Link href="/generador-documentos" className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/50 transition-all group flex items-center gap-3">
            <span className="text-3xl group-hover:scale-110 transition-transform">📄</span>
            <div>
              <p className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">Generador de Documentos</p>
              <p className="text-xs text-slate-500">Contratos, actas, formatos ISO</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Module Grid by Section */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          🧩 Módulos del Sistema
          <span className="text-xs font-normal text-slate-500 bg-slate-800 px-2 py-1 rounded-full">
            30 módulos
          </span>
        </h2>

        {moduleSections.map((section) => (
          <div key={section.title}>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {section.modules.map((mod) => (
                <Link
                  key={mod.name}
                  href={mod.href}
                  className={`group relative flex items-start gap-3 p-4 rounded-xl border bg-gradient-to-br ${section.gradient} ${section.borderColor} hover:border-blue-500/50 hover:bg-blue-500/5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-0.5`}
                >
                  <span className="text-2xl group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5">
                    {mod.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">
                      {mod.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      {mod.description}
                    </p>
                  </div>
                  {mod.native && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-400" title="Nativo Next.js" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <Card variant="glass">
          <CardHeader><CardTitle>📈 Últimos Reportes Enviados</CardTitle></CardHeader>
          <CardContent>
            {reports.slice(0, 5).map(report => (
              <div key={report.id} className="p-4 bg-slate-800/30 rounded mb-2 border border-slate-700 hover:bg-slate-800/50 transition-colors">
                <h4 className="font-bold text-white">{report.tipo} #{report.reportNo}</h4>
                <p className="text-slate-400 text-sm">{report.cliente} - {report.proyecto}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
