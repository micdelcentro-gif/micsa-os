'use client'

import { useParams } from 'next/navigation'
import { useMemo } from 'react'

// Mapeo de rutas Next.js a páginas HTML del sistema Legacy
const LEGACY_ROUTES: Record<string, { page: string; title: string; icon: string }> = {
    // Operaciones
    'projects': { page: 'projects.html', title: 'Gestión de Proyectos', icon: '🏗️' },

    // Recursos Humanos
    'employees': { page: 'employees.html', title: 'Gestión de Empleados', icon: '👥' },
    'nomina': { page: 'nomina.html', title: 'Nómina RH', icon: '💰' },
    'config-rh': { page: 'config_rh.html', title: 'Configuración RH', icon: '⚙️' },

    // Contabilidad
    'contador-hub': { page: 'contador-hub.html', title: 'Hub del Contador', icon: '🧮' },
    'catalogo-cuentas': { page: 'catalogo_cuentas.html', title: 'Catálogo de Cuentas', icon: '📒' },
    'polizas': { page: 'polizas.html', title: 'Pólizas Contables', icon: '📑' },
    'libro-diario': { page: 'libro-diario.html', title: 'Libro Diario', icon: '📖' },
    'balanza': { page: 'balanza-comprobacion.html', title: 'Balanza de Comprobación', icon: '⚖️' },
    'estados-financieros': { page: 'estados-financieros.html', title: 'Estados Financieros', icon: '📊' },
    'tesoreria': { page: 'tesoreria.html', title: 'Tesorería', icon: '🏦' },
    'egresos': { page: 'egresos.html', title: 'Control de Egresos', icon: '💸' },
    'contabilidad': { page: 'contabilidad.html', title: 'Contabilidad General', icon: '📚' },

    // Ventas / CRM
    'cotizador': { page: 'cotizador.html', title: 'Cotizador Rápido', icon: '⚡' },
    'ventas': { page: 'ventas.html', title: 'Control de Ventas', icon: '💰' },
    'clientes-proveedores': { page: 'clientes_proveedores.html', title: 'Clientes y Proveedores', icon: '🤝' },

    // Calidad / ISO  
    'auditoria': { page: 'auditoria.html', title: 'Auditoría', icon: '🔍' },
    'repse': { page: 'repse.html', title: 'Cumplimiento REPSE', icon: '🏛️' },

    // Administración
    'users': { page: 'users.html', title: 'Gestión de Usuarios', icon: '👤' },
    'inbox': { page: 'inbox.html', title: 'Inbox de Documentos', icon: '📥' },
    'datos-maestros': { page: 'datos-maestros.html', title: 'Datos Maestros', icon: '🗂️' },
    'sicofi-config': { page: 'sicofi-config.html', title: 'Sicofi - Timbrado', icon: '🔐' },
}

const LEGACY_BASE_URL = 'http://localhost:3000'

export default function LegacyModulePage() {
    const params = useParams()
    const slug = Array.isArray(params.slug) ? params.slug.join('/') : params.slug || ''

    const route = useMemo(() => LEGACY_ROUTES[slug], [slug])

    if (!route) {
        return (
            <div className="flex items-center justify-center h-[70vh]">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚧</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Módulo no encontrado</h2>
                    <p className="text-slate-400">La ruta <code className="bg-slate-800 px-2 py-1 rounded">/legacy/{slug}</code> no existe.</p>
                </div>
            </div>
        )
    }

    const iframeSrc = `${LEGACY_BASE_URL}/src/pages/bridge.html?target=${encodeURIComponent(route.page)}`

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-3xl">{route.icon}</span>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{route.title}</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Módulo Legacy
                            </span>
                            <span className="text-xs text-slate-500">Migración a Next.js pendiente</span>
                        </div>
                    </div>
                </div>
                <a
                    href={iframeSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 transition-all text-sm border border-slate-700"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Abrir en pestaña
                </a>
            </div>

            {/* Iframe Container */}
            <div className="relative rounded-xl overflow-hidden border border-slate-700/50 bg-white shadow-2xl shadow-black/20">
                <iframe
                    src={iframeSrc}
                    className="w-full border-0"
                    style={{ height: 'calc(100vh - 12rem)', minHeight: '600px' }}
                    title={route.title}
                    allow="clipboard-read; clipboard-write"
                />
            </div>
        </div>
    )
}
