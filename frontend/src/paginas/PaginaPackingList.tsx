'use client';

import React, { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useLogicaPackingList } from '@/logica/useLogicaPackingList';
import { DeleteRowButton } from '@/components/ui/actions/DeleteRowButton';

import { FloatingMenu } from '@/components/ui/FloatingMenu';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Utility for auto-resizing textareas
// Utility for auto-resizing textareas
const AutoResizeTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, value, ...props }, ref) => {
  const internalRef = React.useRef<HTMLTextAreaElement>(null);
  
  // Función para manejar ambos tipos de refs (callback y objeto)
  const setRefs = (element: HTMLTextAreaElement | null) => {
    (internalRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
    if (typeof ref === 'function') {
      ref(element);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
    }
  };

  const adjustHeight = () => {
    const target = internalRef.current;
    if (target) {
      target.style.height = 'auto'; // Reset height
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    props.onInput?.(e);
  };

  return (
    <textarea
      ref={setRefs}
      rows={1}
      className={`w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 resize-none overflow-hidden whitespace-pre-wrap min-h-[38px] ${className}`}
      onInput={handleInput}
      value={value}
      {...props}
    />
  );
});
const DeleteRowButtonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
)

AutoResizeTextarea.displayName = "AutoResizeTextarea";

export const PaginaPackingList = () => {
    const [mounted, setMounted] = useState(false);
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleSelection = (index: number) => {
        const newSelected = new Set(selectedIndices);
        if (newSelected.has(index)) {
            newSelected.delete(index);
        } else {
            newSelected.add(index);
        }
        setSelectedIndices(newSelected);
    };

    const {
        formMethods,
        fields,
        append,
        remove,
        handleDeleteRow,
        loading,
        saving,
        message,
        setMessage,
        handleCategoryChange,
        handlePhotoUpload,
        onSave,
        handleSaveDraft,
        handleImportExcel,
        handleExportExcel,
        handleReset,
        globalLabels,
        summary,
        totalWeight
    } = useLogicaPackingList();

    const { register, watch, handleSubmit, formState: { errors } } = formMethods;
    const items = watch('items');

    const handleBulkDelete = () => {
        if (window.confirm(`¿Eliminar ${selectedIndices.size} ítems seleccionados?`)) {
            // Sort indices in descending order to avoid shift issues when deleting
            const indicesToDelete = Array.from(selectedIndices).sort((a, b) => b - a);
            indicesToDelete.forEach(index => handleDeleteRow(index));
            setSelectedIndices(new Set());
            setIsSelectionMode(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">Cargando Sistema de Logística...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-32 selection:bg-blue-500/30">
            <Toast message={message} onClose={() => setMessage(null)} />
            
            <div className="container mx-auto max-w-[1200px] p-4 lg:p-8 space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/10 pb-12">
                    <div className="space-y-3">
                        <a href="/" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-2">
                           <span className="text-xs">←</span> Volver al Dashboard
                        </a>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-blue-900/40">📦</div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-tight uppercase">MICSA</h1>
                                <p className="text-xs text-slate-400 uppercase tracking-[0.2em] font-medium">Logística e Inventario Industrial</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-left md:text-right space-y-1">
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">PACKING LIST - LISTA DE EMPAQUE</h2>
                        <div className="flex flex-col md:items-end gap-2 mt-4">
                             <div className="grid grid-cols-3 gap-3 w-full">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Proyecto</label>
                                    <AutoResizeTextarea {...register('projectName')} placeholder="Nombre del Proyecto" className="bg-white/5 border-white/10 text-sm min-h-[40px]" rows={1} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Cliente</label>
                                    <AutoResizeTextarea {...register('clientName')} placeholder="Nombre del Cliente" className="bg-white/5 border-white/10 text-sm min-h-[40px]" rows={1} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase text-slate-500 font-bold ml-1">Fecha</label>
                                    <Input {...register('date')} type="date" className="bg-white/5 border-white/10 text-sm h-10" />
                                </div>
                             </div>
                        </div>
                    </div>
                </header>

                <form onSubmit={handleSubmit(onSave)} className="space-y-8">
                    {/* 1. Contenido del Embarque */}
                    <Card variant="glass" className="border-white/5 overflow-hidden shadow-2xl relative">
                        {/* Bulk Action Bar */}
                        {isSelectionMode && selectedIndices.size > 0 && (
                            <div className="absolute top-2 right-16 left-16 bg-blue-600 text-white rounded-lg shadow-lg flex items-center justify-between p-2 px-4 z-[100] animate-in slide-in-from-top-2 fade-in">
                                <span className="font-bold flex items-center gap-2">
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{selectedIndices.size}</span>
                                    seleccionados
                                </span>
                                <button 
                                    type="button"
                                    onClick={handleBulkDelete}
                                    className="bg-red-500 hover:bg-red-400 text-white px-4 py-1.5 rounded-md font-bold shadow-sm transition-colors flex items-center gap-2"
                                >
                                    <DeleteRowButtonIcon /> ELIMINAR
                                </button>
                            </div>
                        )}

                        {/* Cancel Selection Mode Button */}
                        {isSelectionMode && (
                            <div className="bg-slate-800/50 p-2 flex justify-end border-b border-slate-700">
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setIsSelectionMode(false);
                                        setSelectedIndices(new Set());
                                    }}
                                    className="text-xs text-slate-400 hover:text-white uppercase tracking-wider font-bold px-3 py-1"
                                >
                                    Cancelar Selección
                                </button>
                            </div>
                        )}

                        <CardHeader className="bg-blue-600/20 py-4 px-6 border-b border-white/5">
                            <CardTitle className="text-blue-400 flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-400 border border-blue-500/30">1</span>
                                Contenido del Embarque
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 uppercase tracking-tighter border-b border-white/10">
                                        {isSelectionMode && (
                                           <th className="p-3 w-10 text-center">
                                               <input 
                                                  type="checkbox" 
                                                  className="rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600"
                                                  checked={selectedIndices.size === fields.length && fields.length > 0}
                                                  onChange={(e) => {
                                                      if (e.target.checked) {
                                                          setSelectedIndices(new Set(fields.map((_, i) => i)));
                                                      } else {
                                                          setSelectedIndices(new Set());
                                                      }
                                                  }}
                                               />
                                           </th>
                                        )}
                                        <th className="p-3 w-10 text-center">#</th>
                                        <th className="p-3 w-16 text-center">Cant.</th>
                                        <th className="p-3 w-36">Categoría</th>
                                        <th className="p-3 w-36">Código TAG</th>
                                        <th className="p-3 min-w-[250px]">Descripción Equipo</th>
                                        <th className="p-3 w-36">Ubicación</th>
                                        <th className="p-3 w-16 text-center">Color</th>
                                        <th className="p-3 w-24 text-right">Peso (kg)</th>
                                        {!isSelectionMode && (
                                            <th className="p-3 w-32 text-center text-slate-400 text-[10px] uppercase tracking-wider">
                                                <button 
                                                    type="button" 
                                                    onClick={() => setIsSelectionMode(true)}
                                                    className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 mx-auto"
                                                >
                                                    Seleccionar
                                                </button>
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className={`group hover:bg-white/5 transition-colors ${selectedIndices.has(index) ? 'bg-blue-900/20' : ''}`}>
                                            {isSelectionMode && (
                                                <td className="p-2 text-center align-top relative z-20">
                                                    <input 
                                                        type="checkbox"
                                                        checked={selectedIndices.has(index)}
                                                        onChange={() => toggleSelection(index)}
                                                        className="rounded text-blue-600 focus:ring-blue-500 bg-slate-700 border-slate-600 w-4 h-4 cursor-pointer"
                                                    />
                                                </td>
                                            )}
                                            <td className="p-2 text-center text-slate-500 font-mono italic text-[10px] align-top">{index + 1}</td>
                                            <td className="p-2 text-center text-slate-500 align-top"><input {...register(`items.${index}.qty`)} type="number" className="w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 text-center" /></td>
                                            <td className="p-2 align-top">
                                                <select 
                                                    {...register(`items.${index}.category`)} 
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        formMethods.setValue(`items.${index}.category`, val); // Manual fix for potential event loss
                                                        handleCategoryChange(index, val);
                                                    }}
                                                    className="w-full bg-slate-900/50 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 text-sm"
                                                >
                                                    <option value="">Seleccionar...</option>
                                                    {globalLabels.map((l: any) => <option key={l.categoria} value={l.categoria}>{l.categoria}</option>)}
                                                </select>
                                            </td>
                                            <td className="p-2 align-top"><AutoResizeTextarea {...register(`items.${index}.tag`)} placeholder="TAG" className="w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 uppercase font-bold text-blue-400 text-sm min-h-[38px]" rows={1} /></td>
                                            <td className="p-2 align-top"><AutoResizeTextarea {...register(`items.${index}.description`)} rows={1} placeholder="Descripción..." className="w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 resize-none text-sm min-h-[38px] overflow-hidden whitespace-pre-wrap" /></td>
                                            <td className="p-2 align-top"><AutoResizeTextarea {...register(`items.${index}.location`)} placeholder="Sitio" className="w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 text-sm min-h-[38px]" rows={1} /></td>
                                            <td className="p-2 text-center align-top">
                                                <input type="color" {...register(`items.${index}.colorTag`)} className="w-7 h-7 rounded-sm border-none bg-transparent cursor-pointer overflow-hidden p-0" />
                                            </td>
                                            <td className="p-2 align-top"><input {...register(`items.${index}.weight`)} type="number" step="0.01" className="w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500 text-right font-mono text-blue-300" /></td>
                                            {!isSelectionMode && (
                                                <td className="p-2 align-top text-center w-32 relative z-[100]">
                                                    <DeleteRowButton onClick={() => handleDeleteRow(index)} />
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-blue-600/5 font-bold">
                                        <td colSpan={isSelectionMode ? 8 : 7} className="p-3 text-right text-slate-400 uppercase text-[10px] tracking-widest">Peso Total Acumulado:</td>
                                        <td className="p-3 text-right text-blue-400 font-mono text-sm">{totalWeight.toFixed(2)} kg</td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                            <div className="p-4 bg-slate-900 border-t border-white/5">
                                <Button type="button" variant="ghost" onClick={() => append({ qty: 1, category: '', tag: '', description: '', location: '', colorTag: '#cccccc', weight: 0, dimensions: '', id: Math.random().toString(36).substr(2, 9) } as any)} className="w-full border-dashed border-slate-700 text-slate-500 hover:text-white hover:border-slate-500 min-h-[44px]">
                                    + Agregar Nuevo Ítem
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 2. Detalles Técnicos (Sincronizado) */}
                    <Card variant="glass" className="border-white/5 overflow-hidden shadow-2xl">
                         <CardHeader className="bg-yellow-600/20 py-4 px-6 border-b border-white/5">
                            <CardTitle className="text-yellow-400 flex items-center gap-2 text-sm uppercase tracking-widest font-bold">
                                <span className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center text-[10px] text-yellow-400 border border-yellow-500/30">2</span>
                                Detalles Técnicos y Fotos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 uppercase tracking-tighter border-b border-white/10">
                                        <th className="p-3 w-12 text-center">#</th>
                                        <th className="p-3 w-32">Condición</th>
                                        <th className="p-3 min-w-[150px]">Conexiones</th>
                                        <th className="p-3 w-32 text-center">Foto Referencia</th>
                                        <th className="p-3 min-w-[150px]">Observaciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fields.map((field, index) => (
                                        <tr key={field.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                            <td className="p-3 text-center text-slate-500 font-mono italic">{index + 1}</td>
                                            <td className="p-2">
                                                <select {...register(`items.${index}.condition`)} className="w-full bg-white/5 border border-white/10 p-1.5 rounded focus:outline-none focus:border-blue-500">
                                                    <option value="Nuevo">Nuevo</option>
                                                    <option value="Operativo">Operativo</option>
                                                    <option value="Bueno">Bueno</option>
                                                    <option value="Regular">Regular</option>
                                                </select>
                                            </td>
                                            <td className="p-2"><AutoResizeTextarea {...register(`items.${index}.connections`)} placeholder="Detalles de conexión..." /></td>
                                            <td className="p-2">
                                                 <div className="flex items-center gap-3">
                                                    <label className="cursor-pointer bg-slate-800 hover:bg-slate-700 p-2 rounded-lg border border-white/10 transition-colors">
                                                        📷
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handlePhotoUpload(index, e.target.files[0])} />
                                                    </label>
                                                    {items[index]?.photo && (
                                                        <img src={items[index].photo} className="w-10 h-10 rounded border border-white/10 object-cover shadow-lg" alt="Previsualización" />
                                                    )}
                                                 </div>
                                            </td>
                                            <td className="p-2"><AutoResizeTextarea {...register(`items.${index}.observations`)} placeholder="Notas adicionales..." /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* 3. Resumen por Categoría */}
                    <Card variant="glass" className="border-white/5">
                        <CardHeader><CardTitle className="text-sm uppercase tracking-widest font-bold text-cyan-400">📈 Resumen de Carga</CardTitle></CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-4 gap-4">
                                {summary.map(s => (
                                    <div key={s.category} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                                        <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{s.category}</h4>
                                        <div className="flex justify-between items-end">
                                            <span className="text-xl font-bold text-white">{s.count} <span className="text-[10px] text-slate-500 font-normal">items</span></span>
                                            <span className="text-sm text-blue-400 font-mono">{s.weight.toFixed(1)} kg</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500" style={{ width: s.percentage }}></div>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </CardContent>
                    </Card>

                    {/* Botones de Acción */}
                    {mounted && createPortal(
                        <>
                            <FloatingMenu 
                                actions={[
                                    { label: 'Guardar Borrador', icon: '💾', onClick: handleSaveDraft },
                                    { label: 'Importar Excel', icon: '📂', onClick: () => document.getElementById('excelInput')?.click() },
                                    { label: 'Generar Excel', icon: '📊', onClick: handleExportExcel },
                                    { label: 'Generar PDF', icon: '📄', onClick: () => window.print() },
                                    { label: 'Limpiar', icon: '🗑️', onClick: handleReset },
                                    { label: 'Inicio', icon: '🏠', href: '/' }
                                ]}
                            />
                            {/* Hidden input for import */}
                            <input type="file" id="excelInput" className="hidden" accept=".xlsx, .xls" onChange={(e) => e.target.files?.[0] && handleImportExcel(e.target.files[0])} />
                        </>,
                        document.body
                    )}
                </form>
            </div>
        </div>
    );
};
