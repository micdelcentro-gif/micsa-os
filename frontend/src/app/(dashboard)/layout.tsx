'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isMobileMenuOpen])

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  /* eslint-disable */
  type NavItem = {
    name: string;
    href: string;
    icon: string;
    badge?: string;
    children?: { name: string; href: string; icon: string }[];
  }

  type NavSection = {
    title: string;
    color: string;
    items: NavItem[];
  }

  const navigationSections: NavSection[] = [
    {
      title: 'Principal',
      color: 'blue',
      items: [
        { name: 'Dashboard', href: '/', icon: '📊' },
        { name: 'Mapa de Procesos', href: '/procesos', icon: '🔄' },
        { name: 'Expedientes', href: '/expedientes', icon: '📁' },
        { name: 'Generador Docs', href: '/generador-documentos', icon: '📄' },
      ]
    },
    {
      title: 'Operaciones',
      color: 'emerald',
      items: [
        { name: 'Reporte Diario', href: '/reporte-diario', icon: '📋' },
        { name: 'Packing List', href: '/packing-list', icon: '📦' },
        { name: 'Sistema de Etiquetado', href: '/sistema-etiquetado', icon: '🏷️' },
        { name: 'Gestión de Proyectos', href: '/legacy/projects', icon: '🏗️' },
        { name: 'Renta de Equipo', href: '/renta-equipo', icon: '🚛' },
      ]
    },
    {
      title: 'Seguridad Industrial',
      color: 'red',
      items: [
        { name: 'Seguridad EHS', href: '/seguridad', icon: '🛡️' },
      ]
    },
    {
      title: 'Recursos Humanos',
      color: 'violet',
      items: [
        {
          name: 'Trabajadores',
          href: '/trabajadores',
          icon: '👷',
          children: [
            { name: 'Activos', href: '/trabajadores/activos', icon: '✅' },
            { name: 'Bajas / Histórico', href: '/trabajadores/inactivos', icon: '📂' }
          ]
        },
        { name: 'Gestión RH', href: '/empleados', icon: '👥', badge: 'V1.0' },
        { name: 'Empleados (Legacy)', href: '/legacy/employees', icon: '👣' },
        { name: 'Capacitaciones', href: '/capacitaciones', icon: '🎓' },
        { name: 'Nómina', href: '/legacy/nomina', icon: '💰' },
      ]
    },
    {
      title: 'Contabilidad',
      color: 'amber',
      items: [
        { name: 'Hub Contador', href: '/legacy/contador-hub', icon: '🧮' },
        { name: 'Catálogo de Cuentas', href: '/legacy/catalogo-cuentas', icon: '📒' },
        { name: 'Pólizas', href: '/legacy/polizas', icon: '📑' },
        { name: 'Libro Diario', href: '/legacy/libro-diario', icon: '📖' },
        { name: 'Balanza', href: '/legacy/balanza', icon: '⚖️' },
        { name: 'Estados Financieros', href: '/legacy/estados-financieros', icon: '📊' },
        { name: 'Tesorería', href: '/legacy/tesoreria', icon: '🏦' },
        { name: 'Egresos', href: '/legacy/egresos', icon: '💸' },
        { name: 'Cumplimiento SEIL', href: '/cumplimiento-seil', icon: '✅', badge: 'Nuevo' },
        { name: 'REPSE Regulatorio', href: '/legacy/repse', icon: '📋', badge: 'STPS' },
        { name: 'Cumplimiento Regulatorio', href: '/cumplimiento-regulatorio', icon: '📊', badge: 'SEIL' },
        { name: 'Firmas Electrónicas', href: '/firmas-electronicas', icon: '✍️', badge: 'Nuevo' },
      ]
    },
    {
      title: 'Ventas / CRM',
      color: 'rose',
      items: [
        { name: 'Cotizador Rápido', href: '/legacy/cotizador', icon: '⚡' },
        { name: 'Control de Ventas', href: '/legacy/ventas', icon: '💰' },
        { name: 'Clientes / Proveedores', href: '/legacy/clientes-proveedores', icon: '🤝' },
      ]
    },
    {
      title: 'Calidad / ISO',
      color: 'cyan',
      items: [
        { name: 'Matriz ISO', href: '/matriz-iso', icon: '📊' },
        { name: 'Guía ISO', href: '/guia-iso', icon: '📘' },
        { name: 'Auditoría', href: '/legacy/auditoria', icon: '🔍' },
        { name: 'Cumplimiento REPSE', href: '/legacy/repse', icon: '🏛️' },
      ]
    },
    {
      title: 'Dirección',
      color: 'orange',
      items: [
        { name: 'Admin Interna', href: '/admin-interna', icon: '🏢' },
        { name: 'Legal', href: '/legal', icon: '⚖️' },
      ]
    },
    {
      title: 'Administración',
      color: 'slate',
      items: [
        { name: 'Gestión de Usuarios', href: '/legacy/users', icon: '👤' },
        { name: 'Inbox Documentos', href: '/legacy/inbox', icon: '📥' },
        { name: 'Datos Maestros', href: '/legacy/datos-maestros', icon: '🗂️' },
        { name: 'Sicofi (Timbrado)', href: '/legacy/sicofi-config', icon: '🔐' },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">

      {/* Mobile Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 w-full">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-slate-400 hover:text-white transition-colors lg:hidden p-2 rounded-md hover:bg-slate-800"
                aria-label="Abrir menú"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl">🏗️</span>
                <div>
                  <h1 className="text-xl font-bold text-white hidden sm:block">
                    MICSA <span className="text-blue-400">OS</span>
                  </h1>
                  <h1 className="text-xl font-bold text-white sm:hidden">MICSA</h1>
                </div>
              </Link>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white">Admin</p>
                <p className="text-xs text-slate-400">Super Administrador</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-0">
        {/* Sidebar */}
        {/* 
            Desktop: sticky, visible, width fijo
            Mobile: fixed, hidden (translate), width mayoría de pantalla
        */}
        <aside className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-md border-r border-slate-800 shadow-2xl',
          'transform transition-transform duration-300 ease-in-out', // Animación suave
          'lg:translate-x-0 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:shadow-none lg:z-0', // Desktop styles
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full' // Mobile toggle logic
        )}>
          {/* Mobile Header dentro del sidebar (opcional, para cerrar) */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800 lg:hidden">
            <span className="font-bold text-white">Menú Principal</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>

          <nav className="p-3 space-y-1 h-full overflow-y-auto custom-scrollbar pb-24">
            {navigationSections.map((section) => {
              const isCollapsed = collapsedSections[section.title]
              const sectionHasActive = section.items.some(
                item => pathname === item.href || pathname.startsWith(item.href + '/') ||
                  (item.children && item.children.some(child => pathname === child.href))
              )

              return (
                <div key={section.title} className="mb-1">
                  {/* Section Header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all',
                      sectionHasActive ? 'text-slate-300' : 'text-slate-500 hover:text-slate-400'
                    )}
                  >
                    <span>{section.title}</span>
                    <span className={cn(
                      'text-[10px] transition-transform duration-200',
                      isCollapsed ? '-rotate-90' : ''
                    )}>▼</span>
                  </button>

                  {/* Section Items */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 mt-0.5">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href ||
                          (item.href !== '/' && pathname.startsWith(item.href + '/')) ||
                          (item.children && item.children.some(child => pathname === child.href))
                        const isLegacy = item.href.startsWith('/legacy/')

                        if (item.children) {
                          return (
                            <div key={item.name} className="space-y-0.5">
                              <button
                                className={cn(
                                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group',
                                  isActive ? 'text-white bg-slate-800/50' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{item.icon}</span>
                                  <span className="font-medium text-sm">{item.name}</span>
                                </div>
                                <span className="text-[10px]">▼</span>
                              </button>
                              <div className="pl-4 space-y-0.5 border-l-2 border-slate-800 ml-5">
                                {item.children.map(child => {
                                  const isChildActive = pathname === child.href
                                  return (
                                    <Link
                                      key={child.name}
                                      href={child.href}
                                      className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all',
                                        isChildActive
                                          ? 'text-blue-400 bg-blue-900/20 font-bold border-l-2 border-blue-500'
                                          : 'text-slate-500 hover:text-slate-300'
                                      )}
                                    >
                                      <span>{child.icon}</span>
                                      <span>{child.name}</span>
                                    </Link>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        }

                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                              'transition-all duration-200',
                              'group relative',
                              isActive
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                            )}
                          >
                            <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                            <span className="font-medium text-sm">{item.name}</span>
                            {isLegacy && !isActive && (
                              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-500/60" title="Módulo Legacy" />
                            )}
                            {isActive && (
                              <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white lg:block hidden" />
                            )}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            <div className="mt-6 pt-6 border-t border-slate-800">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-left">
                <span>🚪</span>
                <span className="font-medium text-sm">Cerrar Sesión</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 w-full min-w-0">
          <div className={cn(
            'mx-auto p-4 sm:p-6 lg:p-8',
            pathname.startsWith('/legacy/') ? 'max-w-full' : 'max-w-7xl'
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
