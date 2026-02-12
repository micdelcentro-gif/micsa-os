'use client'

import { useState, useEffect } from 'react'
import {
    getComplianceExpedientes,
    createComplianceExpediente,
    updateComplianceExpediente,
    uploadComplianceDocument,
    sendComplianceExpediente,
    getProyectos
} from '@/lib/api'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Project {
    id: string
    nombre: string
}

interface ComplianceExpediente {
    id: string
    proyecto_id: string | null
    oc_number: string
    nombre_proyecto: string
    mes_curso: string
    status: string
    phase_0_ready: boolean
    phase_1_ready: boolean
    phase_2_ready: boolean
    phase_3_ready: boolean
    phase_4_ready: boolean
    phase_5_ready: boolean
    documents: any
    created_at: string
}

const PHASES = [
    { id: 0, title: 'Fase 0: Alta y Preparación', description: 'Documentos base y alta fiscal correcta' },
    { id: 1, title: 'Fase 1: O.C. y Ejecución', description: 'P.O., bitácoras y hoja de aceptación' },
    { id: 2, title: 'Fase 2: Facturación', description: 'CFDI válido y evidencia de envío' },
    { id: 3, title: 'Fase 3: Soporte Laboral y Fiscal', description: 'Nóminas, SUA, IMSS y opiniones positivas' },
    { id: 4, title: 'Fase 4: CxP', description: 'Reporte de CxP y póliza contable' },
    { id: 5, title: 'Fase 5: Pago y Cierre', description: 'Ejecución de pago y archivo' },
]

const FOLDERS = [
    {
        id: '01_CXP_Y_POLIZA',
        label: '01. CXP Y PÓLIZA',
        fields: [
            { id: 'reporte_cxp', label: 'Reporte de CxP' },
            { id: 'poliza_contable', label: 'Póliza Contable' }
        ],
        phase: 4
    },
    {
        id: '02_FACTURA',
        label: '02. FACTURA',
        fields: [
            { id: 'factura_pdf', label: 'Factura Proveedor (PDF)' },
            { id: 'factura_xml', label: 'Factura Proveedor (XML)' },
            { id: 'captura_correo', label: 'Captura Correo de Envío' }
        ],
        phase: 2
    },
    {
        id: '03_VERIFICACION_FISCAL',
        label: '03. VERIFICACIÓN FISCAL',
        fields: [
            { id: 'verificacion_sat', label: 'Verificación SAT (Estatus RFC)' }
        ],
        phase: 3
    },
    {
        id: '04_ORDEN_DE_COMPRA',
        label: '04. ORDEN DE COMPRA',
        fields: [
            { id: 'po_firmada', label: 'P.O. Firmada' }
        ],
        phase: 1
    },
    {
        id: '05_HOJA_DE_ACEPTACION',
        label: '05. HOJA DE ACEPTACIÓN',
        fields: [
            { id: 'hoja_aceptacion', label: 'Hoja de Aceptación / Liberación' }
        ],
        phase: 1
    },
    {
        id: '06_CONTRATO',
        label: '06. CONTRATO',
        fields: [
            { id: 'contrato_firmado', label: 'Contrato Firmado' }
        ],
        phase: 0
    },
    {
        id: '07_NOMINAS_Y_SEGURIDAD_SOCIAL',
        label: '07. NÓMINAS Y SEGURIDAD SOCIAL',
        fields: [
            { id: 'nominas', label: 'Nóminas' },
            { id: 'pago_seguro', label: 'Pago de Seguro' },
            { id: 'caratula_imss', label: 'Carátula IMSS' },
            { id: 'sua', label: 'SUA' }
        ],
        phase: 3
    },
    {
        id: '08_IMPUESTOS',
        label: '08. IMPUESTOS',
        fields: [
            { id: 'pago_isr', label: 'Pago ISR' },
            { id: 'acuse_isr', label: 'Acuse ISR' },
            { id: 'pago_iva', label: 'Pago IVA' },
            { id: 'acuse_iva', label: 'Acuse IVA' },
            { id: 'pago_isn', label: 'Pago ISN' }
        ],
        phase: 3
    },
    {
        id: '09_OPINIONES_POSITIVAS',
        label: '09. OPINIONES POSITIVAS',
        fields: [
            { id: 'opinion_imss', label: 'Opinión Positiva IMSS' },
            { id: 'opinion_infonavit', label: 'Opinión Positiva INFONAVIT' },
            { id: 'opinion_sat', label: 'Opinión Positiva SAT' }
        ],
        phase: 3
    },
]

export default function CompliancePage() {
    const [expedientes, setExpedientes] = useState<ComplianceExpediente[]>([])
    const [projects, setProjects] = useState<Project[]>([])
    const [selectedExpediente, setSelectedExpediente] = useState<ComplianceExpediente | null>(null)
    const [loading, setLoading] = useState(true)
    const [activePhase, setActivePhase] = useState(0)
    const [isNewModalOpen, setIsNewModalOpen] = useState(false)
    const [uploadingField, setUploadingField] = useState<string | null>(null)

    // States for new expediente form
    const [newOC, setNewOC] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [newProjectName, setNewProjectName] = useState('')
    const [newMonth, setNewMonth] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const [expData, projData] = await Promise.all([
                getComplianceExpedientes(),
                getProyectos()
            ])
            setExpedientes(expData)
            setProjects(projData)
            if (expData.length > 0) {
                setSelectedExpediente(expData[0])
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const proj = projects.find(p => p.id === selectedProjectId)
            const data = await createComplianceExpediente({
                oc_number: newOC,
                proyecto_id: selectedProjectId || null,
                nombre_proyecto: proj?.nombre || newProjectName,
                mes_curso: newMonth
            })
            setExpedientes([data, ...expedientes])
            setSelectedExpediente(data)
            setIsNewModalOpen(false)
            setNewOC('')
            setSelectedProjectId('')
            setNewProjectName('')
            setNewMonth('')
        } catch (error) {
            alert('Error al crear expediente')
        }
    }

    const handleUpload = async (category: string, field: string, file: File) => {
        if (!selectedExpediente) return
        setUploadingField(`${category}-${field}`)
        try {
            const updated = await uploadComplianceDocument(selectedExpediente.id, category, field, file)
            setSelectedExpediente(updated)
            setExpedientes(expedientes.map(e => e.id === updated.id ? updated : e))
        } catch (error) {
            alert('Error al cargar archivo')
        } finally {
            setUploadingField(null)
        }
    }

    const handleTogglePhase = async (phaseId: number) => {
        if (!selectedExpediente) return
        const fieldName = `phase_${phaseId}_ready` as keyof ComplianceExpediente
        const newValue = !selectedExpediente[fieldName]

        try {
            const updated = await updateComplianceExpediente(selectedExpediente.id, { [fieldName]: newValue })
            setSelectedExpediente(updated)
            setExpedientes(expedientes.map(e => e.id === updated.id ? updated : e))
        } catch (error) {
            alert('Error al actualizar fase')
        }
    }

    const handleSend = async () => {
        if (!selectedExpediente) return

        // Check if critical phases are ready
        if (!selectedExpediente.phase_3_ready) {
            if (!confirm('La Fase 3 (Soporte Laboral/Fiscal) no está marcada como lista. ¿Deseas enviar de todos modos?')) return
        }

        try {
            const updated = await sendComplianceExpediente(selectedExpediente.id)
            setSelectedExpediente(updated)
            setExpedientes(expedientes.map(e => e.id === updated.id ? updated : e))
            alert('🚀 Expediente enviado a Cuentas por Pagar exitosamente.')
        } catch (error) {
            alert('Error al enviar expediente')
        }
    }

    const totalProgress = selectedExpediente ?
        ([
            selectedExpediente.phase_0_ready,
            selectedExpediente.phase_1_ready,
            selectedExpediente.phase_2_ready,
            selectedExpediente.phase_3_ready,
            selectedExpediente.phase_4_ready,
            selectedExpediente.phase_5_ready
        ].filter(Boolean).length / 6) * 100 : 0

    if (loading) return (
        <div className="flex items-center justify-center h-96">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Preparando módulo de cumplimiento...</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        CUMPLIMIENTO <span className="text-blue-500">SEIL</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Módulo de Blindaje Legal-Fiscal para Pago a Contratistas</p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <span>📂</span> Nuevo Expediente de Pago
                </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Left Sidebar - Navigation */}
                <div className="xl:col-span-1 space-y-4">
                    <Card variant="glass" className="h-[750px] flex flex-col border-slate-700/50">
                        <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xs uppercase tracking-widest text-slate-500">Expedientes</CardTitle>
                                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{expedientes.length} total</span>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {expedientes.length === 0 ? (
                                <div className="text-center py-20">
                                    <span className="text-4xl block mb-2 opacity-20">📁</span>
                                    <p className="text-slate-500 text-sm italic">Sin expedientes</p>
                                </div>
                            ) : (
                                expedientes.map(exp => (
                                    <button
                                        key={exp.id}
                                        onClick={() => setSelectedExpediente(exp)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-2xl border transition-all relative group overflow-hidden",
                                            selectedExpediente?.id === exp.id
                                                ? "bg-blue-600/10 border-blue-500/50 shadow-xl shadow-blue-500/5"
                                                : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50"
                                        )}
                                    >
                                        {selectedExpediente?.id === exp.id && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                        )}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter",
                                                exp.status === 'ENVIADO' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                                            )}>
                                                {exp.status}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">{new Date(exp.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-black text-white group-hover:text-blue-400 transition-colors uppercase">{exp.oc_number}</p>
                                        <p className="text-xs text-slate-400 truncate mt-1">{exp.nombre_proyecto}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-1000"
                                                    style={{ width: `${([exp.phase_0_ready, exp.phase_1_ready, exp.phase_2_ready, exp.phase_3_ready, exp.phase_4_ready, exp.phase_5_ready].filter(Boolean).length / 6) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500">{exp.mes_curso}</span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Content - Management */}
                <div className="xl:col-span-3 space-y-6">
                    {selectedExpediente ? (
                        <>
                            {/* Header Card */}
                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-blue-500/10 transition-colors"></div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-3xl font-black text-white flex items-center gap-2 uppercase">
                                                {selectedExpediente.oc_number}
                                                <span className="text-blue-500">/</span>
                                                {selectedExpediente.mes_curso}
                                            </h2>
                                            {selectedExpediente.status === 'ENVIADO' && (
                                                <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30">
                                                    LISTO CXP
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-400 font-medium flex items-center gap-2">
                                            🏗️ {selectedExpediente.nombre_proyecto}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-right mb-1">
                                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Progreso del Expediente</p>
                                            <p className="text-2xl font-black text-white">{Math.round(totalProgress)}%</p>
                                        </div>
                                        <button
                                            onClick={handleSend}
                                            disabled={selectedExpediente.status === 'ENVIADO'}
                                            className={cn(
                                                "group relative px-8 py-4 rounded-2xl font-black transition-all flex items-center gap-3 overflow-hidden active:scale-95",
                                                selectedExpediente.status === 'ENVIADO'
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                                                    : "bg-white text-slate-900 hover:bg-blue-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-blue-500/20"
                                            )}
                                        >
                                            {selectedExpediente.status === 'ENVIADO' ? (
                                                <><span>✓</span> EXPEDIENTE EN CxP</>
                                            ) : (
                                                <>
                                                    <span className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">🚀</span>
                                                    ENVIAR A CUENTAS POR PAGAR
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Phase Stepper - Premium */}
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                {PHASES.map((phase) => {
                                    const isReady = (selectedExpediente as any)[`phase_${phase.id}_ready`]
                                    const isActive = activePhase === phase.id
                                    return (
                                        <button
                                            key={phase.id}
                                            onClick={() => setActivePhase(phase.id)}
                                            className={cn(
                                                "flex flex-col items-center p-4 rounded-2xl border transition-all relative overflow-hidden",
                                                isActive
                                                    ? "bg-slate-800/80 border-blue-500 shadow-xl shadow-blue-500/10 ring-1 ring-blue-500/50"
                                                    : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50",
                                                isReady && !isActive ? "border-emerald-500/30 text-emerald-400" : ""
                                            )}
                                        >
                                            {isReady && (
                                                <div className="absolute top-1 right-1 text-[8px] bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold">✓</div>
                                            )}
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black mb-2 transition-all",
                                                isReady
                                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    : (isActive ? "bg-blue-500 text-white shadow-lg shadow-blue-500/50" : "bg-slate-700/50 text-slate-500")
                                            )}>
                                                {phase.id}
                                            </div>
                                            <span className={cn("text-[9px] text-center font-black uppercase tracking-tighter leading-tight",
                                                isActive ? "text-white" : (isReady ? "text-emerald-400" : "text-slate-500"))}>
                                                {phase.title.split(': ')[1]}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>

                            {/* Main Workspace Card */}
                            <Card variant="glass" className="overflow-hidden border-slate-700/50">
                                <div className="bg-slate-800/40 p-6 border-b border-slate-800/50 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-black text-white flex items-center gap-3">
                                            <span className="bg-blue-500/10 text-blue-400 w-8 h-8 rounded-lg flex items-center justify-center text-sm">#</span>
                                            {PHASES[activePhase].title}
                                        </h3>
                                        <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1 ml-11">{PHASES[activePhase].description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleTogglePhase(activePhase)}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all flex items-center gap-2",
                                            (selectedExpediente as any)[`phase_${activePhase}_ready`]
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                                : "bg-slate-700 text-slate-400 hover:bg-slate-600 active:scale-95"
                                        )}
                                    >
                                        {(selectedExpediente as any)[`phase_${activePhase}_ready`] ? '✓ FASE VALIDADA' : 'VALIDAR FASE'}
                                    </button>
                                </div>

                                <CardContent className="p-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {FOLDERS.filter(f => f.phase === activePhase).map((folder) => (
                                            <div key={folder.id} className="bg-slate-900/40 rounded-3xl p-6 border border-slate-800/50 hover:border-slate-700 transition-colors group">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-sm font-black text-white flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                        {folder.label}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-slate-600 bg-slate-950 px-2 py-0.5 rounded italic">Items: {folder.fields.length}</span>
                                                </div>

                                                <div className="space-y-4">
                                                    {folder.fields.map(field => {
                                                        const currentFile = selectedExpediente.documents[folder.id]?.[field.id]
                                                        const isUploading = uploadingField === `${folder.id}-${field.id}`

                                                        return (
                                                            <div key={field.id} className="group/field">
                                                                <label className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1.5 block px-1">{field.label}</label>
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "flex-1 h-12 px-4 flex items-center rounded-2xl border text-xs font-medium transition-all",
                                                                        currentFile
                                                                            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400 shadow-inner"
                                                                            : "bg-slate-950/50 border-slate-800 text-slate-600 group-hover/field:border-slate-700"
                                                                    )}>
                                                                        {isUploading ? (
                                                                            <div className="flex items-center gap-2">
                                                                                <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                                                <span className="animate-pulse">Cargando...</span>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <span>{currentFile ? '📄' : '⭕'}</span>
                                                                                <span className="truncate max-w-[150px]">{currentFile ? 'Documento Listo' : 'Sin documento'}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    <label className={cn(
                                                                        "w-12 h-12 flex items-center justify-center rounded-2xl cursor-pointer transition-all active:scale-90",
                                                                        currentFile
                                                                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                                            : "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/10"
                                                                    )}>
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const file = e.target.files?.[0]
                                                                                if (file) handleUpload(folder.id, field.id, file)
                                                                            }}
                                                                        />
                                                                        <span className="text-xl">{currentFile ? '✓' : '↑'}</span>
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        )
                                                    }
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {FOLDERS.filter(f => f.phase === activePhase).length === 0 && (
                                            <div className="col-span-2 py-20 text-center bg-slate-900/20 rounded-3xl border border-slate-800/30 border-dashed">
                                                <span className="text-5xl block mb-4 opacity-10">📋</span>
                                                <h4 className="text-slate-400 font-black uppercase text-sm">Validación de Proceso</h4>
                                                <p className="text-slate-600 text-xs mt-2 max-w-md mx-auto">
                                                    Esta fase corresponde a pasos administrativos de flujo de trabajo. Valida que las fases anteriores tengan los documentos completos antes de marcar ésta como lista.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Strategic Context Footer */}
                            <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-center">
                                <div className="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-amber-500/30">💡</div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-amber-400 font-black uppercase tracking-widest text-xs">Lectura Estratégica SEIL</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Este checklist es un <span className="text-white font-bold underline">blindaje legal-fiscal</span>. Al entregar el expediente ordenado así,
                                        CxP se limita a ejecutar el pago de forma automática. El poder reside en la integridad documental del sistema.
                                    </p>
                                </div>
                                <div className="w-full md:w-auto">
                                    <div className="flex -space-x-3 overflow-hidden p-1">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="inline-block h-10 w-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {i}
                                            </div>
                                        ))}
                                        <div className="inline-block h-10 w-10 rounded-full border-2 border-slate-900 bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                            +17
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[750px] flex flex-col items-center justify-center text-center p-12 bg-slate-800/20 border border-slate-700 border-dashed rounded-[3rem] space-y-6">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-500 blur-[80px] opacity-20"></div>
                                <span className="text-8xl block relative z-10">🛡️</span>
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Módulo de Cumplimiento</h3>
                                <p className="text-slate-500 font-medium mt-2 max-w-sm">No hay un expediente activo seleccionado. Crea uno o elige uno de la lista lateral.</p>
                            </div>
                            <button
                                onClick={() => setIsNewModalOpen(true)}
                                className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black transition-all hover:bg-blue-50 shadow-2xl active:scale-95 flex items-center gap-2"
                            >
                                <span>➕</span> CREAR PRIMER EXPEDIENTE
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modern Creation Modal */}
            {isNewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Nuevo Expediente SEIL</h3>
                            <p className="text-blue-100/70 text-sm font-medium">Inicia un nuevo ciclo de pago a contratista</p>
                        </div>
                        <form onSubmit={handleCreate} className="p-8 space-y-5 bg-slate-900">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Referencia P.O. / Orden de Compra</label>
                                <input
                                    type="text"
                                    value={newOC}
                                    onChange={(e) => setNewOC(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-800 placeholder:font-black"
                                    placeholder="OC-XXXXXXX"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Asociar a Proyecto Maestro</label>
                                <select
                                    value={selectedProjectId}
                                    onChange={(e) => setSelectedProjectId(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                >
                                    <option value="">-- Selecciona Proyecto (Opcional) --</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                    <option value="custom">-- Escribir nombre personalizado --</option>
                                </select>
                            </div>

                            {(selectedProjectId === '' || selectedProjectId === 'custom') && (
                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Nombre del Proyecto</label>
                                    <input
                                        type="text"
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                        placeholder="Ej. Planta Ford - Rigging Service"
                                        required
                                    />
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Mes de Operación</label>
                                <input
                                    type="text"
                                    value={newMonth}
                                    onChange={(e) => setNewMonth(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Ej. Febrero 2026"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsNewModalOpen(false)}
                                    className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-black transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-4 bg-white text-slate-900 hover:bg-blue-50 rounded-2xl font-black transition-all shadow-xl active:scale-95"
                                >
                                    ABRIR EXPEDIENTE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
        </div>
    )
}
