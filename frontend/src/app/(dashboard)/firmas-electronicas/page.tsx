'use client'

import { useState, useEffect } from 'react'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Firmante {
    nombre: string
    email: string
    puesto?: string
    empresa?: string
    status: string
    firmado_at?: string
}

interface Documento {
    id: string
    titulo: string
    descripcion: string
    tipo_documento: string
    status: string
    total_firmantes: number
    firmantes_completados: number
    created_at: string
    firmantes: Firmante[]
}

interface Stats {
    total_documentos: number
    pendientes: number
    en_proceso: number
    completados: number
    cancelados: number
    firmantes_pendientes: number
    firmantes_completados: number
}

export default function FirmasElectronicasPage() {
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedDoc, setSelectedDoc] = useState<Documento | null>(null)
    const [isNewModalOpen, setIsNewModalOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState<string>('all')

    // Form states
    const [newTitulo, setNewTitulo] = useState('')
    const [newDescripcion, setNewDescripcion] = useState('')
    const [newTipo, setNewTipo] = useState('contrato')
    const [newFile, setNewFile] = useState<File | null>(null)
    const [firmantes, setFirmantes] = useState<Array<{ nombre: string, email: string, puesto: string }>>([
        { nombre: '', email: '', puesto: '' }
    ])
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        loadData()
    }, [filterStatus])

    const loadData = async () => {
        try {
            setLoading(true)
            const [docsRes, statsRes] = await Promise.all([
                fetch(`http://localhost:8000/api/v1/firmas/${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`),
                fetch('http://localhost:8000/api/v1/firmas/stats')
            ])

            const docsData = await docsRes.json()
            const statsData = await statsRes.json()

            setDocumentos(docsData)
            setStats(statsData)

            if (docsData.length > 0 && !selectedDoc) {
                setSelectedDoc(docsData[0])
            }
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateDocumento = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newFile) {
            alert('Debes seleccionar un archivo PDF')
            return
        }

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', newFile)
            formData.append('titulo', newTitulo)
            formData.append('descripcion', newDescripcion)
            formData.append('tipo_documento', newTipo)
            formData.append('firmantes_json', JSON.stringify(firmantes.filter(f => f.nombre && f.email)))

            const response = await fetch('http://localhost:8000/api/v1/firmas/', {
                method: 'POST',
                body: formData
            })

            if (response.ok) {
                await loadData()
                setIsNewModalOpen(false)
                resetForm()
                alert('Documento creado exitosamente')
            } else {
                alert('Error al crear documento')
            }
        } catch (error) {
            console.error('Error creating document:', error)
            alert('Error al crear documento')
        } finally {
            setUploading(false)
        }
    }

    const handleNotifyFirmantes = async (docId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/firmas/${docId}/notify`, {
                method: 'POST'
            })

            if (response.ok) {
                const data = await response.json()
                alert(data.message)
                await loadData()
            }
        } catch (error) {
            console.error('Error notifying signers:', error)
            alert('Error al enviar notificaciones')
        }
    }

    const resetForm = () => {
        setNewTitulo('')
        setNewDescripcion('')
        setNewTipo('contrato')
        setNewFile(null)
        setFirmantes([{ nombre: '', email: '', puesto: '' }])
    }

    const addFirmante = () => {
        setFirmantes([...firmantes, { nombre: '', email: '', puesto: '' }])
    }

    const removeFirmante = (index: number) => {
        setFirmantes(firmantes.filter((_, i) => i !== index))
    }

    const updateFirmante = (index: number, field: string, value: string) => {
        const updated = [...firmantes]
        updated[index] = { ...updated[index], [field]: value }
        setFirmantes(updated)
    }

    const copySignatureLink = (token: string) => {
        const link = `${window.location.origin}/firmar/${token}`
        navigator.clipboard.writeText(link)
        alert('Enlace copiado al portapapeles')
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-slate-400">Cargando sistema de firmas...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        FIRMAS <span className="text-blue-500">ELECTRÓNICAS</span>
                    </h1>
                    <p className="text-slate-400 font-medium">Sistema de Gestión de Firmas Digitales</p>
                </div>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <span>📝</span> Nuevo Documento
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card variant="glass" className="border-slate-700/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Total Documentos</p>
                                    <p className="text-3xl font-black text-white mt-1">{stats.total_documentos}</p>
                                </div>
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl">
                                    📄
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-slate-700/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">En Proceso</p>
                                    <p className="text-3xl font-black text-amber-400 mt-1">{stats.en_proceso}</p>
                                </div>
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
                                    ⏳
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-slate-700/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Completados</p>
                                    <p className="text-3xl font-black text-emerald-400 mt-1">{stats.completados}</p>
                                </div>
                                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl">
                                    ✓
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card variant="glass" className="border-slate-700/50">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase font-bold tracking-widest">Firmas Pendientes</p>
                                    <p className="text-3xl font-black text-red-400 mt-1">{stats.firmantes_pendientes}</p>
                                </div>
                                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl">
                                    ✍️
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'Todos', count: stats?.total_documentos },
                    { id: 'PENDIENTE', label: 'Pendientes', count: stats?.pendientes },
                    { id: 'EN_PROCESO', label: 'En Proceso', count: stats?.en_proceso },
                    { id: 'COMPLETADO', label: 'Completados', count: stats?.completados }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilterStatus(tab.id)}
                        className={cn(
                            "px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap",
                            filterStatus === tab.id
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                : "bg-slate-800/50 text-slate-400 hover:bg-slate-800"
                        )}
                    >
                        {tab.label} {tab.count !== undefined && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Documents List */}
                <div className="xl:col-span-1">
                    <Card variant="glass" className="h-[700px] flex flex-col border-slate-700/50">
                        <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
                            <CardTitle className="text-xs uppercase tracking-widest text-slate-500">
                                Documentos ({documentos.length})
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                            {documentos.length === 0 ? (
                                <div className="text-center py-20">
                                    <span className="text-4xl block mb-2 opacity-20">📄</span>
                                    <p className="text-slate-500 text-sm italic">Sin documentos</p>
                                </div>
                            ) : (
                                documentos.map(doc => (
                                    <button
                                        key={doc.id}
                                        onClick={() => setSelectedDoc(doc)}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl border transition-all",
                                            selectedDoc?.id === doc.id
                                                ? "bg-blue-600/10 border-blue-500/50 shadow-xl shadow-blue-500/5"
                                                : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-tighter",
                                                doc.status === 'COMPLETADO' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    doc.status === 'EN_PROCESO' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                            )}>
                                                {doc.status}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="font-black text-white text-sm mb-1">{doc.titulo}</p>
                                        <p className="text-xs text-slate-400 truncate">{doc.tipo_documento}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-1000"
                                                    style={{ width: `${(doc.firmantes_completados / doc.total_firmantes) * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-500">
                                                {doc.firmantes_completados}/{doc.total_firmantes}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Document Details */}
                <div className="xl:col-span-2">
                    {selectedDoc ? (
                        <Card variant="glass" className="border-slate-700/50">
                            <CardHeader className="border-b border-slate-800/50 bg-slate-800/20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-white mb-1">
                                            {selectedDoc.titulo}
                                        </CardTitle>
                                        <p className="text-slate-400 text-sm">{selectedDoc.descripcion}</p>
                                    </div>
                                    <button
                                        onClick={() => handleNotifyFirmantes(selectedDoc.id)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                                    >
                                        📧 Notificar
                                    </button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">
                                    Firmantes ({selectedDoc.firmantes_completados}/{selectedDoc.total_firmantes})
                                </h3>
                                <div className="space-y-3">
                                    {selectedDoc.firmantes.map((firmante, idx) => (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "p-4 rounded-xl border",
                                                firmante.status === 'FIRMADO'
                                                    ? "bg-emerald-500/10 border-emerald-500/30"
                                                    : "bg-slate-800/50 border-slate-700"
                                            )}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                                                        firmante.status === 'FIRMADO'
                                                            ? "bg-emerald-500"
                                                            : "bg-slate-700"
                                                    )}>
                                                        {firmante.status === 'FIRMADO' ? '✓' : '📝'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white">{firmante.nombre}</p>
                                                        <p className="text-sm text-slate-400">{firmante.email}</p>
                                                        {firmante.puesto && (
                                                            <p className="text-xs text-slate-500">{firmante.puesto}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={cn(
                                                        "px-3 py-1 rounded-lg font-bold text-xs",
                                                        firmante.status === 'FIRMADO'
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : firmante.status === 'NOTIFICADO'
                                                                ? "bg-amber-500/20 text-amber-400"
                                                                : "bg-slate-700 text-slate-400"
                                                    )}>
                                                        {firmante.status}
                                                    </span>
                                                    {firmante.status !== 'FIRMADO' && (
                                                        <button
                                                            onClick={() => copySignatureLink((firmante as any).token_acceso)}
                                                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                                            title="Copiar enlace de firma"
                                                        >
                                                            🔗
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {firmante.firmado_at && (
                                                <p className="text-xs text-slate-500 mt-2">
                                                    Firmado: {new Date(firmante.firmado_at).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-[700px] flex items-center justify-center bg-slate-800/20 border border-slate-700 border-dashed rounded-3xl">
                            <div className="text-center">
                                <span className="text-8xl block mb-4">📄</span>
                                <h3 className="text-2xl font-black text-white mb-2">Selecciona un documento</h3>
                                <p className="text-slate-500">Elige un documento de la lista para ver sus detalles</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Document Modal */}
            {isNewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl my-8">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Nuevo Documento para Firma</h3>
                            <p className="text-blue-100/70 text-sm font-medium">Carga un PDF y define los firmantes</p>
                        </div>

                        <form onSubmit={handleCreateDocumento} className="p-8 space-y-6 bg-slate-900 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Título del Documento</label>
                                <input
                                    type="text"
                                    value={newTitulo}
                                    onChange={(e) => setNewTitulo(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Descripción</label>
                                <textarea
                                    value={newDescripcion}
                                    onChange={(e) => setNewDescripcion(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Tipo de Documento</label>
                                    <select
                                        value={newTipo}
                                        onChange={(e) => setNewTipo(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    >
                                        <option value="contrato">Contrato</option>
                                        <option value="orden_compra">Orden de Compra</option>
                                        <option value="convenio">Convenio</option>
                                        <option value="acta">Acta</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Archivo PDF</label>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:font-bold file:cursor-pointer"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] uppercase font-black tracking-widest text-slate-500">Firmantes</label>
                                    <button
                                        type="button"
                                        onClick={addFirmante}
                                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg font-bold transition-colors"
                                    >
                                        + Agregar
                                    </button>
                                </div>

                                {firmantes.map((firmante, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 p-4 bg-slate-950 rounded-xl border border-slate-800">
                                        <input
                                            type="text"
                                            placeholder="Nombre completo"
                                            value={firmante.nombre}
                                            onChange={(e) => updateFirmante(idx, 'nombre', e.target.value)}
                                            className="col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email"
                                            value={firmante.email}
                                            onChange={(e) => updateFirmante(idx, 'email', e.target.value)}
                                            className="col-span-4 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Puesto"
                                            value={firmante.puesto}
                                            onChange={(e) => updateFirmante(idx, 'puesto', e.target.value)}
                                            className="col-span-3 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {firmantes.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeFirmante(idx)}
                                                className="col-span-1 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsNewModalOpen(false)
                                        resetForm()
                                    }}
                                    className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50"
                                >
                                    {uploading ? 'CREANDO...' : '✓ CREAR DOCUMENTO'}
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
