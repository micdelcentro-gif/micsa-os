'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import { useLogicaMatrizISO } from '@/logica/useLogicaMatrizISO';
import { ISOTableDesktop } from '@/components/iso/ISOTableDesktop';
import { ISOCardMobile } from '@/components/iso/ISOCardMobile';
import { DesktopView } from '@/components/responsive/DesktopView';
import { MobileView } from '@/components/responsive/MobileView';
import { FloatingMenu } from '@/components/ui/FloatingMenu';

export default function PaginaMatrizISO() {
    const { documents, stats, filters } = useLogicaMatrizISO();
    
    // Función auxiliar para color de badges según tipo
    const getBadgeColor = (tipo: string) => {
        // Estilo simple: solo texto coloreado y negrita, sin "badge" box.
        switch(tipo) {
            case 'Política': return 'text-fuchsia-400';
            case 'Manual': return 'text-indigo-400';
            case 'Procedimiento': return 'text-emerald-400';
            case 'Registro': return 'text-orange-400';
            case 'Formato': return 'text-rose-400';
            case 'Instructivo': return 'text-sky-400';
            case 'Programa': return 'text-violet-400';
            default: return 'text-slate-400';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-16">
            <div className="container mx-auto max-w-7xl p-4 lg:p-8 space-y-8">
                
                {/* Header Responsivo */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-8">
                    <div className="space-y-3">
                        <a href="/" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                           <span>←</span> Volver al Dashboard
                        </a>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-900/40">🏗️</div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight uppercase">MICSA</h1>
                                <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-medium">Sistema de Gestión de Calidad</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-left md:text-right space-y-1">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">MATRIZ ISO 9001:2015</h2>
                        <div className="flex flex-col md:flex-row gap-4 md:items-center text-xs text-slate-500 font-mono mt-2">
                             <div className="bg-slate-900/50 px-3 py-1 rounded border border-white/5">
                                Total Documentos: <span className="text-cyan-400 font-bold">{stats.total}</span>
                             </div>
                             <div className="bg-slate-900/50 px-3 py-1 rounded border border-white/5">
                                Filtrados: <span className="text-white font-bold">{stats.visible}</span>
                             </div>
                        </div>
                    </div>
                </header>

                {/* Filtros */}
                <div className="bg-slate-900/40 backdrop-blur-md p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[250px]">
                        <Input 
                            label="Buscar Documento" 
                            placeholder="Nombre, código o requisito..." 
                            value={filters.searchTerm}
                            onChange={(e) => filters.setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Filtrar por Tipo</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={filters.filterTipo}
                            onChange={(e) => filters.setFilterTipo(e.target.value)}
                        >
                            <option value="">Todos los Tipos</option>
                            <option value="Política">Política</option>
                            <option value="Manual">Manual</option>
                            <option value="Procedimiento">Procedimiento</option>
                            <option value="Registro">Registro</option>
                            <option value="Formato">Formato</option>
                            <option value="Instructivo">Instructivo</option>
                            <option value="Programa">Programa</option>
                        </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm font-medium text-slate-400 mb-1">Filtrar por Área</label>
                        <select 
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={filters.filterArea}
                            onChange={(e) => filters.setFilterArea(e.target.value)}
                        >
                            <option value="">Todas las Áreas</option>
                            <option value="Dirección">Dirección</option>
                            <option value="Calidad">Calidad</option>
                            <option value="Operaciones">Operaciones</option>
                            <option value="Compras">Compras</option>
                            <option value="Comercial">Comercial</option>
                            <option value="Ingeniería">Ingeniería</option>
                        </select>
                    </div>
                </div>

                {/* Componentes de Responsividad Globales */}
                <DesktopView>
                    <ISOTableDesktop documents={documents} getBadgeColor={getBadgeColor} />
                </DesktopView>
                
                <MobileView>
                    <ISOCardMobile documents={documents} getBadgeColor={getBadgeColor} />
                    <FloatingMenu 
                        actions={[
                            { label: 'Exportar Excel', icon: '📊', onClick: () => alert('Exportar Excel') },
                            { label: 'Ver Dashboard', icon: '🏠', href: '/' }
                        ]}
                    />
                </MobileView>

            </div>
        </div>
    );
}
