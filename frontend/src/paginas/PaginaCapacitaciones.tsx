'use client';
import { useState } from 'react';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useLogicaCapacitaciones } from '@/logica/useLogicaCapacitaciones';

export default function PaginaCapacitaciones() {
    const { trainings, addTraining, deleteTraining } = useLogicaCapacitaciones();
    const [showModal, setShowModal] = useState(false);
    
    // Formulario simple
    const [formData, setFormData] = useState({ name: '', code: '', isDC3: true });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addTraining(formData);
        setShowModal(false);
        setFormData({ name: '', code: '', isDC3: true });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white">🎓 Catálogo de Capacitaciones</h2>
                    <p className="text-slate-400">Administra los DC-3 y cursos disponibles para la matriz.</p>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500">
                    + Nuevo Curso
                </Button>
            </div>

            <Card variant="glass">
                <CardHeader>
                    <CardTitle>Cursos Registrados ({trainings.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase">
                                    <th className="p-4">Nomenclatura</th>
                                    <th className="p-4">Nombre del Curso</th>
                                    <th className="p-4">Tipo</th>
                                    <th className="p-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {trainings.length > 0 ? trainings.map(t => (
                                    <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                                        <td className="p-4 font-mono text-cyan-400">{t.code}</td>
                                        <td className="p-4 text-white font-medium">{t.name}</td>
                                        <td className="p-4">
                                            {t.isDC3 ? (
                                                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-xs font-bold border border-green-500/30">
                                                    DC-3 OFICIAL
                                                </span>
                                            ) : (
                                                <span className="px-2 py-1 rounded bg-slate-700 text-slate-300 text-xs">
                                                    OTRO
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => deleteTraining(t.id)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded transition-colors"
                                                title="Eliminar"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500 italic">
                                            No hay capacitaciones registradas. Agrega una para comenzar.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Modal Simple */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Nueva Capacitación</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Nombre del Curso</label>
                                <Input 
                                    autoFocus
                                    required 
                                    placeholder="Ej. Trabajos en Alturas" 
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-400 mb-1">Código / Nomenclatura</label>
                                <Input 
                                    required 
                                    placeholder="Ej. DC3-ALT" 
                                    value={formData.code}
                                    onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox" 
                                    id="isDC3"
                                    checked={formData.isDC3}
                                    onChange={e => setFormData({...formData, isDC3: e.target.checked})}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                />
                                <label htmlFor="isDC3" className="text-white text-sm select-none">
                                    Es documento DC-3 oficial
                                </label>
                            </div>
                            
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500">
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
