'use client';

import React, { useState, useEffect } from 'react';
import { draftsUtils, Draft } from '@/lib/drafts-utils';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export const BorradoresGuardados = () => {
    const router = useRouter();
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [filters, setFilters] = useState({
        reportNo: '',
        client: '',
        project: '',
        location: '',
        specification: '',
        date: '',
        type: 'ALL'
    });

    const loadDrafts = () => {
        setDrafts(draftsUtils.getAll());
    };

    useEffect(() => {
        loadDrafts();

        // Escuchar cambios en otras pestañas/ventanas
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'MICSA_SYSTEM_DRAFTS') {
                loadDrafts();
            }
        };

        // Escuchar cuando la ventana vuelve a tener foco (útil si se cambió en otra pestaña y se vuelve a esta)
        const handleFocus = () => {
            loadDrafts();
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('¿Eliminar este borrador?')) {
            draftsUtils.delete(id);
            setDrafts(draftsUtils.getAll());
        }
    };

    const handleContinue = (draft: Draft) => {
        const path = draft.type === 'PACKING_LIST' ? '/packing-list' : '/reporte-diario';
        router.push(`${path}?draftId=${draft.id}`);
    };

    const filteredDrafts = drafts.filter(d => {
        const m = d.metadata;
        return (
            (!filters.reportNo || m.reportNo?.toLowerCase().includes(filters.reportNo.toLowerCase())) &&
            (!filters.client || m.client?.toLowerCase().includes(filters.client.toLowerCase())) &&
            (!filters.project || m.project?.toLowerCase().includes(filters.project.toLowerCase())) &&
            (!filters.location || m.location?.toLowerCase().includes(filters.location.toLowerCase())) &&
            (!filters.specification || m.specification?.toLowerCase().includes(filters.specification.toLowerCase())) &&
            (!filters.date || m.date === filters.date) &&
            (filters.type === 'ALL' || d.type === filters.type)
        );
    });

    return (
        <Card variant="glass" className="border-white/5 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                    <span className="text-xl">📂</span> Borradores Guardados
                </CardTitle>
                <button className="text-cyan-400 text-sm hover:underline">Ver todos →</button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Filtros */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">No. Reporte</label>
                        <Input 
                            placeholder="Ej: 0001" 
                            className="bg-slate-900/50 border-white/10 text-sm h-10"
                            value={filters.reportNo}
                            onChange={(e) => setFilters({...filters, reportNo: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Cliente</label>
                        <Input 
                            placeholder="Ej: Ironcast" 
                            className="bg-slate-900/50 border-white/10 text-sm h-10"
                            value={filters.client}
                            onChange={(e) => setFilters({...filters, client: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Nombre Proyecto</label>
                        <Input 
                            placeholder="Ej: Fabricación..." 
                            className="bg-slate-900/50 border-white/10 text-sm h-10"
                            value={filters.project}
                            onChange={(e) => setFilters({...filters, project: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Ubicación</label>
                        <Input 
                            placeholder="Ej: Planta 1" 
                            className="bg-slate-900/50 border-white/10 text-sm h-10"
                            value={filters.location}
                            onChange={(e) => setFilters({...filters, location: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Especificación</label>
                        <Input 
                            placeholder="Ej: SPEC-99" 
                            className="bg-slate-900/50 border-white/10 text-sm h-10"
                            value={filters.specification}
                            onChange={(e) => setFilters({...filters, specification: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Fecha</label>
                        <Input 
                            type="date"
                            className="bg-slate-900/50 border-white/10 text-sm h-10"
                            value={filters.date}
                            onChange={(e) => setFilters({...filters, date: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Tipo de Documento</label>
                        <select 
                            className="w-full bg-slate-900/50 border border-white/10 p-2 rounded-lg text-sm h-10 text-white focus:outline-none focus:border-blue-500"
                            value={filters.type}
                            onChange={(e) => setFilters({...filters, type: e.target.value})}
                        >
                            <option value="ALL">Ver Todos</option>
                            <option value="PACKING_LIST">Packing List</option>
                            <option value="DAILY_REPORT">Reporte Diario</option>
                        </select>
                    </div>
                </div>

                {/* Lista */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredDrafts.length > 0 ? (
                        filteredDrafts.map(draft => (
                            <div key={draft.id} className="group flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-xl">
                                        {draft.type === 'PACKING_LIST' ? '📦' : '📋'}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold text-sm">
                                            {draft.type === 'PACKING_LIST' ? 'Packing List' : 'Reporte Diario'} #{draft.metadata.reportNo || 'S/N'}
                                            <span className="ml-2 text-[10px] text-blue-400 font-mono">[{draft.metadata.specification || 'N/A'}]</span>
                                        </h4>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            Fecha: <span className="text-slate-200">{draft.metadata.date || 'Pendiente'}</span><br/>
                                            Cliente: <span className="text-slate-200">{draft.metadata.client || 'N/A'}</span> 
                                            <span className="text-slate-600 mx-1">|</span>
                                            Sup. MICSA: <span className="text-slate-200">{draft.metadata.supervisorMicsa || 'N/A'}</span>
                                            <br/>
                                            Proyecto: <span className="text-slate-200">{draft.metadata.project || 'N/A'}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button 
                                        size="sm" 
                                        className="bg-blue-600 hover:bg-blue-500 text-xs px-6 font-bold"
                                        onClick={() => handleContinue(draft)}
                                    >
                                        Continuar
                                    </Button>
                                    <Button 
                                        size="sm" 
                                        variant="danger" 
                                        className="bg-red-600 hover:bg-red-500 text-xs px-3 font-bold"
                                        onClick={(e) => handleDelete(draft.id, e)}
                                    >
                                        🗑️
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500 italic border-2 border-dashed border-white/5 rounded-xl">
                            No se encontraron borradores con los filtros aplicados.
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
