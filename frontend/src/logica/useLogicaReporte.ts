import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import api from '@/lib/api'
import { ReportData } from '@/types/daily-report'
import { draftsUtils } from '@/lib/drafts-utils'
import { useSearchParams } from 'next/navigation'

// Schema Validation (Igual que antes)
const reportSchema = z.object({
  reportNo: z.string().min(1, 'Requerido'),
  date: z.string().min(1, 'Requerido'),
  client: z.string().min(1, 'Requerido'),
  project: z.string().min(1, 'Requerido'),
  location: z.string().min(1, 'Requerido'),
  specification: z.string().optional(),
  
  week: z.string().optional(),
  shift: z.enum(['PRIMERA', 'SEGUNDA', 'TERCERA']).optional(),
  supervisorMicsa: z.string().optional(),
  supervisorClient: z.string().optional(),

  personnel: z.array(z.any()).default([]),
  activities: z.array(z.any()).default([]),
  activitiesNarrative: z.string().optional(),
  materials: z.array(z.any()).default([]),
  
  plannedProgress: z.number().optional(),
  realProgress: z.number().optional(),
  statusVariation: z.enum(['ADELANTADO', 'EN TIEMPO', 'ATRASADO']).optional(),
  criticalPath: z.string().optional(),
  affectation: z.enum(['SÍ', 'NO']).optional(),
  correctiveAction: z.string().optional(),

  hse: z.object({
    epp: z.boolean().default(true),
    loto: z.boolean().default(true),
    unsafeActs: z.boolean().default(false),
    greenCards: z.number().optional(),
    incidents: z.boolean().default(false),
    report: z.string().optional(),
  }).default({}),

  technicalIncidents: z.string().optional(),
  productionIncidents: z.string().optional(),
  clientChanges: z.string().optional(),
  
  photos: z.array(z.any()).default([]),
  photosNotes: z.string().optional(),

  checklist: z.object({
    general: z.boolean().default(false),
    personnel: z.boolean().default(false),
    activities: z.boolean().default(false),
    progress: z.boolean().default(false),
    hse: z.boolean().default(false),
    incidents: z.boolean().default(false),
    photos: z.boolean().default(false),
    signatures: z.boolean().default(false),
  }).default({}),

  elaboratedBy: z.string().min(1, 'Requerido'),
  reviewedBy: z.string().min(1, 'Requerido'),
  approvedBy: z.string().min(1, 'Requerido'),
  notes: z.string().optional(),
})

export const useLogicaReporte = () => {
  const searchParams = useSearchParams()
  const draftId = searchParams.get('draftId')
  
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success'|'error', text: string} | null>(null)
  const [photoPreviews, setPhotoPreviews] = useState<{[key: number]: string}>({})
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId)

  const formMethods = useForm<ReportData>({
    resolver: zodResolver(reportSchema as any),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      reportNo: '',
      personnel: [],
      activities: [],
      materials: [],
      hse: { epp: true, loto: true, unsafeActs: false, incidents: false },
      checklist: { general: false, personnel: false, activities: false, progress: false, hse: false, incidents: false, photos: false, signatures: false },
      specification: '45766'
    }
  })

  const { watch, reset, getValues } = formMethods

  // 1. Cargar Borrador Inicial
  useEffect(() => {
    if (draftId) {
        const savedDraft = draftsUtils.getById(draftId)
        if (savedDraft) {
            // Sanitize lists to ensure IDs exist
            const cleanData = { ...savedDraft.data }
            const ensureIds = (list: any[]) => list?.map(item => ({ ...item, id: item.id || crypto.randomUUID() })) || []
            
            cleanData.personnel = ensureIds(cleanData.personnel)
            cleanData.activities = ensureIds(cleanData.activities)
            cleanData.materials = ensureIds(cleanData.materials)

            reset(cleanData)
            setCurrentDraftId(draftId)
        }
    }
  }, [draftId, reset])


  
  const onSubmit = async (data: ReportData) => {
    setSaving(true)
    setMessage(null)
    try {
      await api.post('/reports', { ...data, photos: photoPreviews })
      
      // Limpiar borrador al enviar definitivo
      if (currentDraftId) draftsUtils.delete(currentDraftId)
      
      setMessage({ type: 'success', text: 'Reporte guardado exitosamente' })
      setTimeout(() => setMessage(null), 1500)
    } catch (error) {
      console.error(error)
      setMessage({ type: 'error', text: 'Error al guardar el reporte' })
      setTimeout(() => setMessage(null), 1500)
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
          const reader = new FileReader()
          reader.onloadend = () => {
              setPhotoPreviews(prev => ({ ...prev, [index]: reader.result as string }))
          }
          reader.readAsDataURL(file)
      }
  }

  const handleSaveDraft = () => {
    const value = getValues()
    const draft = draftsUtils.save({
        id: currentDraftId || undefined,
        type: 'DAILY_REPORT',
        data: value as any,
        metadata: {
            reportNo: value.reportNo,
            client: value.client,
            project: value.project,
            location: value.location,
            specification: value.specification,
            date: value.date,
            supervisorMicsa: value.supervisorMicsa,
            supervisorClient: value.supervisorClient
        }
    })
    if (!currentDraftId) setCurrentDraftId(draft.id)
    setMessage({ type: 'success', text: 'Borrador guardado manualmente' })
    setTimeout(() => setMessage(null), 1500)
  }

  const handleReset = () => {
      if (window.confirm('¿Estás seguro de que quieres limpiar todo el formulario y eliminar el borrador?')) {
        if (currentDraftId) draftsUtils.delete(currentDraftId)
        reset({
            date: new Date().toISOString().split('T')[0],
            reportNo: '',
            personnel: [],
            activities: [],
            materials: [],
            hse: { epp: true, loto: true, unsafeActs: false, incidents: false },
            checklist: { general: false, personnel: false, activities: false, progress: false, hse: false, incidents: false, photos: false, signatures: false },
            specification: '45766'
        })
        setPhotoPreviews({})
        setCurrentDraftId(null)
        setMessage({ type: 'success', text: 'Formulario limpiado' })
        setTimeout(() => setMessage(null), 1500)
      }
  }

  const handleSend = async () => {
      const isValid = await formMethods.trigger();
      if (!isValid) {
          setMessage({ type: 'error', text: 'Por favor completa los campos requeridos.' });
          setTimeout(() => setMessage(null), 1500);
          return;
      }
      setSaving(true);
      setTimeout(() => {
          setSaving(false);
          setMessage({ type: 'success', text: 'Reporte enviado exitosamente.' });
          setTimeout(() => setMessage(null), 1500);
      }, 2000);
  }

  return {
    formMethods,
    saving,
    message,
    photoPreviews,
    handlePhotoUpload,
    onSubmit,
    handleSaveDraft,
    handleReset,
    handleSend,
    setMessage,
    supervisorClientLabel: watch('client') ? watch('client')?.toUpperCase() : 'CLIENTE',
    personnel: watch('personnel'),
    activities: watch('activities'),
    materials: watch('materials'),
    specification: watch('specification'),
    clientName: watch('client'),
    formattedDate: watch('date') ? new Date(watch('date') || '').toLocaleDateString() : '---'
  }
}
