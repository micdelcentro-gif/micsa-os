'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Controller } from 'react-hook-form'
import { createPortal } from 'react-dom'

import Button from '@/components/ui/Button'

import { FloatingMenu } from '@/components/ui/FloatingMenu'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import DynamicTable from '@/components/forms/DynamicTable'
import Card, { CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PersonalRow, ActivityRow, MaterialRow } from '@/types/daily-report'
import { useLogicaReporte } from '@/logica/useLogicaReporte'
import { useLogicaPdf } from '@/logica/useLogicaPdf'
import { Toast } from '@/components/ui/Toast'

// Utility for auto-resizing textareas
const AutoResizeTextarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>((props, ref) => {
  const internalRef = useRef<HTMLTextAreaElement | null>(null);

  const adjustHeight = (el: HTMLTextAreaElement) => {
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
  };

  useEffect(() => {
    if (internalRef.current) {
        adjustHeight(internalRef.current);
    }
  }, [props.value]);

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    adjustHeight(e.currentTarget);
    props.onInput?.(e);
  };

  return (
    <textarea
      {...props}
      ref={(node) => {
          // Asignar al ref interno
          internalRef.current = node;
          // Asignar al ref externo (react-hook-form)
          if (typeof ref === 'function') {
              ref(node);
          } else if (ref) {
              // TypeScript ve ref como readonly por defecto en forwardRef, necesitamos cast
              (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
          }
      }}
      rows={1}
      className={`w-full bg-slate-800/50 border border-slate-600 p-2 rounded focus:outline-none focus:border-blue-500 resize-none overflow-hidden whitespace-pre-wrap min-h-[38px] print:bg-transparent print:border-0 print:p-0 print:text-black ${props.className}`}
      onInput={handleInput}
    />
  );
});
AutoResizeTextarea.displayName = 'AutoResizeTextarea';

export default function PaginaReporteDiario() {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  const { 
    formMethods, saving, message, photoPreviews, handlePhotoUpload, 
    onSubmit, handleSaveDraft, handleReset, handleSend, setMessage, 
    supervisorClientLabel, formattedDate, personnel, activities, materials, specification 
  } = useLogicaReporte()

  const { register, handleSubmit, setValue, formState: { errors } } = formMethods
  const { handlePrint, printMessage, setPrintMessage } = useLogicaPdf()

  // Combinar mensajes de ambos hooks
  const activeMessage = printMessage || message

  // Manejador para cerrar cualquier notificación
  const handleCloseToast = () => {
    setMessage(null)
    setPrintMessage(null)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-64 selection:bg-blue-500/30 -m-6 lg:-m-8 p-6 lg:p-8 print:m-0 print:p-0 print:bg-white print:text-black print:min-h-0 print:pb-0">
      <div className="max-w-5xl mx-auto space-y-6 print:max-w-none print:w-full print:m-0 print:p-0 print:space-y-4">
      <Toast message={activeMessage} onClose={handleCloseToast} />
      
      {/* Print Header (Visible only on print) */}
      <div className="header hidden print:flex mb-2 border-b-2 border-slate-800 pb-2 flex-col">
          <div className="logo-section flex items-center justify-between mb-1 w-full">
             <div className="flex items-center gap-3">
                <span className="text-3xl">🏗️</span>
                <div>
                    <h1 className="logo-text text-xl font-bold uppercase tracking-wider text-black m-0">MICSA</h1>
                    <p className="logo-subtitle text-[10px] text-gray-600 uppercase tracking-widest m-0">Fabricación y Montaje Industrial</p>
                </div>
             </div>
             <div className="header-info text-right">
                 <h2 className="text-lg font-bold text-black uppercase m-0">Reporte Diario de Obra</h2>
             </div>
          </div>
          <div className="flex justify-between text-[10px] text-black mt-2 font-mono w-full">
              <div className="w-2/3">
                  <strong>PROYECTO:</strong> {formMethods.watch('project') || '__________________________'}
              </div>
              <div className="w-1/3 flex justify-end gap-6">
                  <span><strong>ESPEC. TÉCNICA:</strong> {specification || '45766'}</span>
                  <span><strong>REPORTE NO.:</strong> {formMethods.watch('reportNo') || '____'}</span>
              </div>
          </div>
      </div>

      {/* Screen Header - Hidden on Print */}
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white">Reporte Diario</h1>
          <p className="text-slate-400">Crear o editar reporte de actividades</p>
        </div>
        <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={handlePrint}>🖨️ Imprimir PDF</Button>
            <Button type="button" variant="primary" onClick={handleSubmit(onSubmit)} isLoading={saving}>💾 Guardar</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 1. Info General */}
        <Card variant="glass" className="form-section print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader className="section-header"><CardTitle>1. DATOS GENERALES DEL REPORTE</CardTitle></CardHeader>
          <CardContent className="form-grid grid grid-cols-3 gap-6 print:grid-cols-3">
            <Input label="Fecha" type="date" {...register('date')} error={errors.date?.message} />
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-slate-300 print:text-black">Semana</label>
               <AutoResizeTextarea {...register('week')} placeholder="Semana #" className="min-h-[42px]" rows={1} />
            </div>
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-slate-300 print:text-black">Turno</label>
               <select {...register('shift')} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white print:bg-transparent print:border-gray-300 print:text-black h-[42px]">
                  <option value="PRIMERA">PRIMERA</option>
                  <option value="SEGUNDA">SEGUNDA</option>
                  <option value="TERCERA">TERCERA</option>
               </select>
            </div>
            
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-slate-300 print:text-black">Supervisor MICSA</label>
               <AutoResizeTextarea {...register('supervisorMicsa')} placeholder="Nombre Supervisor" className="min-h-[42px]" rows={1} />
            </div>
            <div className="flex flex-col gap-1.5">
               <label className="text-sm font-medium text-slate-300 print:text-black">Cliente</label>
               <AutoResizeTextarea {...register('client')} placeholder="Nombre Cliente" className="min-h-[42px]" rows={1} />
            </div>
            <Input label="Ubicación" {...register('location')} placeholder="Sitio de obra" />
            
            <Input label={`SUPERVISOR DE ${supervisorClientLabel}`} {...register('supervisorClient')} placeholder="Nombre del Supervisor" />
            <Input label="Proyecto" {...register('project')} error={errors.project?.message} />
            
            <div className="md:col-span-1 flex gap-2">
               <Input label="Espec. Técnica" {...register('specification')} className="w-full" />
               <Controller
                 name="reportNo"
                 control={formMethods.control}
                 render={({ field }) => (
                   <Input 
                     label="Reporte No." 
                     {...field} 
                     placeholder="AUTO" 
                     className="w-full" 
                     error={errors.reportNo?.message} 
                   />
                 )}
               />
             </div>
          </CardContent>
        </Card>

        {/* 2. Personal */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader><CardTitle>2. PERSONAL EN SITIO</CardTitle></CardHeader>
          <CardContent>
            <DynamicTable<PersonalRow>
              title=""
              data={personnel}
              onChange={(data) => setValue('personnel', data, { shouldValidate: true, shouldDirty: true })}
              columns={[
                { key: 'name', label: 'Nombre del Trabajador', placeholder: 'Nombre Apellido' },
                { key: 'position', label: 'Puesto / Categoría', placeholder: 'Puesto' },
                { key: 'startTime', label: 'Entrada', type: 'time', width: '120px' },
                { key: 'endTime', label: 'Salida', type: 'time', width: '120px' }
              ]}
              onRowDelete={() => {
                  setMessage({ type: 'error', text: 'Fila eliminada permanentemente' });
                  setTimeout(() => setMessage(null), 1500);
              }}
              enableSelection={true}
            />
          </CardContent>
        </Card>

        {/* 3. Actividades */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader><CardTitle>3. ACTIVIDADES EJECUTADAS (GANTT)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <DynamicTable<ActivityRow>
              title=""
              data={activities}
              onChange={(data) => setValue('activities', data, { shouldValidate: true, shouldDirty: true })}
              columns={[
                { key: 'phase', label: 'Fase Gantt', placeholder: 'Fase' },
                { key: 'description', label: 'Descripción de Actividad', placeholder: 'Detalle técnico...', width: '40%' },
                { key: 'week', label: 'Sem', width: '80px' },
                { key: 'percentage', label: '% Avance', type: 'number', width: '100px' }
              ]}
              onRowDelete={() => {
                  setMessage({ type: 'error', text: 'Actividad eliminada' });
                  setTimeout(() => setMessage(null), 1500);
              }}
              enableSelection={true}
            />
            <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 print:text-black">DESCRIPCIÓN NARRATIVA:</label>
                <AutoResizeTextarea 
                    {...register('activitiesNarrative')} 
                    placeholder="Redactar en forma técnica y detallada las actividades ejecutadas durante el turno..." 
                />
            </div>
          </CardContent>
        </Card>

        {/* 4. Materiales */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader><CardTitle>4. MATERIALES Y RECURSOS UTILIZADOS</CardTitle></CardHeader>
          <CardContent>
            <DynamicTable<MaterialRow>
              title=""
              data={materials}
              onChange={(data) => setValue('materials', data, { shouldValidate: true, shouldDirty: true })}
              columns={[
                { key: 'description', label: 'Material / Recurso', placeholder: 'Descripción' },
                { key: 'quantity', label: 'Cant.', type: 'number', width: '100px' },
                { key: 'unit', label: 'Unidad', width: '100px', placeholder: 'Pza/Kg' },
                { key: 'notes', label: 'Observaciones', placeholder: 'Notas' }
              ]}
              onRowDelete={() => {
                  setMessage({ type: 'error', text: 'Material eliminado' });
                  setTimeout(() => setMessage(null), 1500);
              }}
              enableSelection={true}
            />
          </CardContent>
        </Card>

        {/* 5 & 6. Avance y Ruta Crítica */}
        <div className="grid grid-cols-2 gap-6 print:grid-cols-2">
            <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
                <CardHeader><CardTitle>5. AVANCE DEL PROYECTO</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <label className="w-1/2 text-sm text-slate-300 print:text-black">Avance Planeado Acum.:</label>
                        <Input type="number" {...register('plannedProgress')} className="w-24" placeholder="%" />
                    </div>
                    <div className="flex gap-4 items-center">
                        <label className="w-1/2 text-sm text-slate-300 print:text-black">Avance Real Acum.:</label>
                        <Input type="number" {...register('realProgress')} className="w-24" placeholder="%" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300 print:text-black">Estatus / Variación</label>
                        <select {...register('statusVariation')} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white print:bg-transparent print:border-gray-300 print:text-black">
                            <option value="EN TIEMPO">EN TIEMPO</option>
                            <option value="ADELANTADO">ADELANTADO</option>
                            <option value="ATRASADO">ATRASADO</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
                <CardHeader><CardTitle>6. RUTA CRÍTICA</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-300 print:text-black">Ruta Crítica Actual</label>
                        <AutoResizeTextarea {...register('criticalPath')} placeholder="Describir ruta..." rows={1} />
                     </div>
                     <div className="flex gap-4">
                         <div className="w-1/3">
                            <label className="text-sm font-medium text-slate-300 print:text-black block mb-1">Afectación</label>
                            <select {...register('affectation')} className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white print:bg-transparent print:border-gray-300 print:text-black">
                                <option value="NO">NO</option>
                                <option value="SÍ">SÍ</option>
                            </select>
                         </div>
                         <div className="w-2/3">
                            <label className="text-sm font-medium text-slate-300 print:text-black block mb-1">Acción Correctiva</label>
                            <Input {...register('correctiveAction')} placeholder="N/A o Acción" />
                         </div>
                     </div>
                </CardContent>
            </Card>
        </div>

        {/* 7. HSE */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader><CardTitle>7. SEGURIDAD Y CUMPLIMIENTO (HSE)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded border border-slate-700 print:border-gray-300">
                    <input type="checkbox" {...register('hse.epp')} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm">Uso EPP Completo</span>
                 </label>
                 <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded border border-slate-700 print:border-gray-300">
                    <input type="checkbox" {...register('hse.loto')} className="w-4 h-4 rounded text-blue-600" />
                    <span className="text-sm">Aplicación LOTO</span>
                 </label>
                 <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded border border-slate-700 print:border-gray-300">
                    <input type="checkbox" {...register('hse.unsafeActs')} className="w-4 h-4 rounded text-red-600" />
                    <span className="text-sm">Actos Inseguros</span>
                 </label>
                 <label className="flex items-center gap-2 p-3 bg-slate-800/30 rounded border border-slate-700 print:border-gray-300">
                    <input type="checkbox" {...register('hse.incidents')} className="w-4 h-4 rounded text-red-600" />
                    <span className="text-sm">Incidentes</span>
                 </label>
             </div>
             <Textarea label="Reporte HSE Detallado:" {...register('hse.report')} placeholder="Descripción de eventos..." />
          </CardContent>
        </Card>

        {/* 8. INCIDENCIAS */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader><CardTitle>8. INCIDENCIAS / OBSERVACIONES / CAMBIOS</CardTitle></CardHeader>
          <CardContent className="space-y-4">
              <Textarea label="INCIDENCIAS TÉCNICAS" {...register('technicalIncidents')} placeholder="Sin incidencias..." />
              <Textarea label="INCIDENCIAS PRODUCCIÓN / LOGÍSTICA" {...register('productionIncidents')} placeholder="Sin incidencias..." />
              <Textarea label="CAMBIOS SOLICITADOS POR CLIENTE" {...register('clientChanges')} placeholder="Ningún cambio solicitado" />
          </CardContent>
        </Card>

        {/* 9. EVIDENCIA FOTOGRÁFICA */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
           <CardHeader><CardTitle>9. EVIDENCIA FOTOGRÁFICA</CardTitle></CardHeader>
           <CardContent>
              <p className="text-sm text-slate-400 mb-4 print:text-black">
                  Se anexa al presente reporte digital el registro fotográfico correspondiente al día: <strong className="text-white print:text-black">{formattedDate}</strong>
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  {[
                      "FOTO 1: CONDICIÓN INICIAL",
                      "FOTO 2: EJECUCIÓN ACTIVIDAD",
                      "FOTO 3: AVANCE GENERAL",
                      "FOTO 4: DETALLE TÉCNICO",
                      "FOTO 5: SEGURIDAD / EPP",
                      "FOTO 6: CONDICIÓN FINAL"
                  ].map((label, i) => {
                      const index = i + 1
                      return (
                        <label key={index} className="group relative aspect-video bg-slate-800 rounded border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700 transition-colors overflow-hidden print:border-gray-300 print:bg-gray-100">
                            {photoPreviews[index] ? (
                                <img src={photoPreviews[index]} alt={`Foto ${index}`} className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <span className="text-2xl mb-2">📷</span>
                                    <span className="text-slate-500 text-xs text-center px-2">{label}<br/>(Clic para subir)</span>
                                </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handlePhotoUpload(index, e)} />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity print:opacity-100 print:bg-transparent print:text-black print:text-xs">
                                {label}
                            </div>
                        </label>
                      )
                  })}
              </div>
              <Textarea label="NOTAS SOBRE FOTOS:" {...register('photosNotes')} placeholder="Descripción de fotos..." />
           </CardContent>
        </Card>

        {/* 10. CHECKLIST */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
            <CardHeader><CardTitle>10. CHECKLIST DE CALIDAD</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-300 print:text-black">
                    <label className="flex gap-2 items-center"><input type="checkbox" {...register('checklist.general')} className="rounded text-blue-600" /> Datos generales completos</label>
                    <label className="flex gap-2 items-center"><input type="checkbox" {...register('checklist.personnel')} className="rounded text-blue-600" /> Personal verificado</label>
                    <label className="flex gap-2 items-center"><input type="checkbox" {...register('checklist.activities')} className="rounded text-blue-600" /> Actividades detalladas</label>
                    <label className="flex gap-2 items-center"><input type="checkbox" {...register('checklist.hse')} className="rounded text-blue-600" /> Cumplimiento HSE verificado</label>
                    <label className="flex gap-2 items-center"><input type="checkbox" {...register('checklist.signatures')} className="rounded text-blue-600" /> Firmas de supervisores</label>
                </div>
            </CardContent>
        </Card>

        {/* 11. CIERRE TÉCNICO */}
        <Card variant="glass" className="print:border-0 print:shadow-none print:bg-white print:text-black">
          <CardHeader><CardTitle>11. CIERRE TÉCNICO</CardTitle></CardHeader>
          <CardContent className="space-y-8">
             <p className="text-sm text-slate-400 print:text-black">
                Se confirma que las actividades descritas fueron ejecutadas bajo los estándares de calidad de MICSA y conforme a los lineamientos de la Especificación Técnica.
             </p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <Textarea label="Elaborado por (Supervisor MICSA)" {...register('elaboratedBy')} placeholder="Nombre y Firma" rows={1} />
               <Textarea label="Revisado por (Residente)" {...register('reviewedBy')} placeholder="Nombre Supervisor" rows={1} />
               <Textarea label={supervisorClientLabel} {...register('approvedBy')} placeholder={`Supervisor de ${supervisorClientLabel}`} rows={1} />
             </div>
             <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-300 print:text-black">Notas / Observaciones Finales</label>
                <AutoResizeTextarea {...register('notes')} />
             </div>
             
             <div className="text-center text-xs text-slate-500 mt-8 pt-4 border-t border-slate-700 print:text-black print:border-gray-300">
                Este reporte cumple con la Especificación Técnica {specification || '45766'} y documentos vigentes obligatorios para facturación y mantenimiento del proyecto.<br/>
                MICSA - Soluciones Industriales | Reporte Diario Automatizado v2.0
             </div>
          </CardContent>
        </Card>

        {/* Footer Actions (Hidden on Print) */}
        {mounted && createPortal(
          <>
            <FloatingMenu 
                    actions={[
                        { label: 'Guardar Borrador', icon: '💾', onClick: handleSaveDraft },
                        { label: 'Importar PDF', icon: '📂', onClick: () => alert('Funcionalidad de Importar PDF pendiente de implementación') },
                        { label: 'Generar PDF', icon: '📄', onClick: handlePrint },
                        { label: 'Enviar Reporte', icon: '📧', onClick: handleSend },
                        { label: 'Limpiar Formulario', icon: '🗑️', onClick: handleReset },
                        { label: 'Inicio', icon: '🏠', href: '/' }
                    ]}
                />
          </>,
          document.body
        )}
      </form>
      </div>
    </div>
  )
}
