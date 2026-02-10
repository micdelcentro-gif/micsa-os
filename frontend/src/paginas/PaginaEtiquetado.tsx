import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLogicaEtiquetado } from '@/logica/useLogicaEtiquetado';
import { MobileView } from '@/components/responsive/MobileView';
import { DesktopView } from '@/components/responsive/DesktopView';
import { FloatingMenu } from '@/components/ui/FloatingMenu';
import Button from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { DeleteRowButton } from '@/components/ui/actions/DeleteRowButton';



// Utility for auto-resizing textareas (re-implemented in React)
// Utility for auto-resizing textareas (re-implemented in React)
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
      target.style.height = 'auto'; // Reset height to calculate scrollHeight
      target.style.height = `${target.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [value]); // Re-adjust when value changes (e.g. initial load)

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight();
    props.onInput?.(e);
  };

  return (
    <textarea
      ref={setRefs}
      rows={1}
      className={`w-full p-2 bg-white/5 border border-white/10 rounded text-white font-sans text-sm resize-none overflow-hidden min-h-[38px] focus:outline-none focus:bg-white/10 focus:border-blue-500 transition-colors ${className}`}
      onInput={handleInput}
      value={value} // Ensure controlled value is passed if provided
      {...props}
    />
  );
});
AutoResizeTextarea.displayName = "AutoResizeTextarea";

export const PaginaEtiquetado = () => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const {
        formMethods: { register, watch },
        fields,
        isLoading,
        activeMessage,
        handleSave,
        handleReset,
        handleAddRow,
        handleDeleteRow,
        setMessage
    } = useLogicaEtiquetado();

    if (isLoading) {
        return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-32">
             {/* Print/Legacy Header Style Block for specific print behavior if needed - omitting complex print styles here as the requirement focused on generic structure first, but we keep the header structure */}
             
             <div className="container mx-auto max-w-[1200px] p-6 lg:p-8">
                 {/* Header */}
                 <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-white/10 pb-6">
                    <div className="flex flex-col gap-2">
                         <a href="/" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">← Volver al Dashboard</a>
                         <div className="flex items-center gap-3">
                             <span className="text-3xl">🏷️</span>
                             <div>
                                 <h1 className="text-2xl font-bold uppercase tracking-wider text-white">MICSA</h1>
                                 <p className="text-xs text-slate-400 uppercase tracking-widest">Sistema de Identificación</p>
                             </div>
                         </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-white uppercase">SISTEMA DE IDENTIFICACIÓN Y ETIQUETADO</h2>
                        <p className="text-slate-400">Proyecto: General</p>
                        <div className="flex gap-4 justify-end text-xs text-slate-500 mt-1 font-mono">
                            <span><strong>Doc:</strong> SYS-TAG-01</span>
                            <span><strong>Rev:</strong> 01</span>
                        </div>
                    </div>
                 </header>

                 {/* Main Form */}
                 <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                     
                     {/* Section Header */}
                     <div className="bg-yellow-500 text-black px-6 py-3 flex items-center justify-between">
                         <h2 className="font-bold flex items-center gap-2">
                             🏷️ CÓDIGO DE ETIQUETAS
                         </h2>
                         <span className="bg-black/20 text-black px-2 py-0.5 rounded-full text-xs font-bold backdrop-blur-sm">
                             {fields.length} Categorías
                         </span>
                     </div>

                     {/* Table Container */}
                     <div className="overflow-x-auto p-4">
                         <table className="w-full text-left border-collapse">
                             <thead>
                                 <tr className="text-xs text-slate-400 border-b border-white/10">
                                     <th className="p-2 w-[60px] text-center">Prefijo</th>
                                     <th className="p-2 w-[150px]">Categoría (Nombre)</th>
                                     <th className="p-2 w-[250px]">Descripción</th>
                                     <th className="p-2 w-[120px]">Formato</th>
                                     <th className="p-2 w-[120px]">Ejemplo</th>
                                     <th className="p-2 w-[130px]">Ubicación</th>
                                     <th className="p-2 w-[120px]">Responsable</th>
                                     <th className="p-2 w-[40px]"></th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                 {fields.map((field, index) => (
                                     <tr key={field.id} className="group hover:bg-white/5 transition-colors">
                                         <td className="p-2 align-top">
                                             <AutoResizeTextarea 
                                                 {...register(`etiquetas.${index}.prefijo`)}
                                                 className="w-full p-2 bg-white/5 border border-white/10 rounded text-white font-sans text-sm text-center uppercase focus:outline-none focus:bg-white/10 focus:border-blue-500 transition-colors min-h-[38px]"
                                                 placeholder="XX"
                                                 rows={1}
                                             />
                                         </td>
                                         <td className="p-2 align-top">
                                             <AutoResizeTextarea {...register(`etiquetas.${index}.categoria`)} placeholder="Nombre Categoría" />
                                         </td>
                                         <td className="p-2 align-top">
                                             <AutoResizeTextarea {...register(`etiquetas.${index}.descripcion`)} placeholder="Descripción breve" />
                                         </td>
                                         <td className="p-2 align-top">
                                             <AutoResizeTextarea {...register(`etiquetas.${index}.formato`)} placeholder="XX-000" />
                                         </td>
                                         <td className="p-2 align-top">
                                              <AutoResizeTextarea {...register(`etiquetas.${index}.ejemplo`)} placeholder="Ejemplo" />
                                         </td>
                                         <td className="p-2 align-top">
                                             <AutoResizeTextarea {...register(`etiquetas.${index}.ubicacion`)} placeholder="Ubicación" />
                                         </td>
                                         <td className="p-2 align-top">
                                             <AutoResizeTextarea {...register(`etiquetas.${index}.responsable`)} placeholder="Responsable" />
                                         </td>
                                         <td className="p-2 align-top text-center w-32">
                                             <DeleteRowButton onClick={() => handleDeleteRow(index)} />
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                         
                         <div className="mt-4">
                             <Button 
                                onClick={handleAddRow}
                                variant="ghost"
                                className="border border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 w-full flex items-center justify-center gap-2"
                             >
                                 + Agregar Etiqueta
                             </Button>
                         </div>
                     </div>
                 </div>
             </div>

             {/* Toast Notification */}
             <Toast message={activeMessage} onClose={() => setMessage(null)} />

             {/* Footer Actions */}
             {mounted && createPortal(
                <>
                    <DesktopView>
                        <div 
                            style={{
                                position: 'fixed',
                                bottom: '1.5rem',
                                right: '1.5rem',
                                padding: '1rem 2rem',
                                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '1.25rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '16px',
                                zIndex: 9999,
                                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                            }}
                            className="left-6 md:left-[calc(16rem+1.5rem)] print:hidden"
                        >
                            <a href="/" className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-medium">
                                ← Dashboard
                            </a>

                            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 text-white px-8 shadow-lg shadow-blue-900/20">
                                💾 Guardar Sistema
                            </Button>

                            <Button onClick={handleReset} variant="danger" className="bg-red-600/80 hover:bg-red-500 text-white px-6">
                                🗑️ Restaurar
                            </Button>
                        </div>
                    </DesktopView>

                    <MobileView>
                        <FloatingMenu 
                            actions={[
                                { label: 'Guardar Sistema', icon: '💾', onClick: handleSave },
                                { label: 'Restaurar', icon: '🗑️', onClick: handleReset },
                                { label: 'Dashboard', icon: '🏠', href: '/' }
                            ]}
                        />
                    </MobileView>
                </>,
                document.body
             )}
        </div>
    );

};

