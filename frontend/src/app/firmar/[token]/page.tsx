'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

interface Firmante {
    id: string
    nombre: string
    puesto: string
    status: string
    orden: number
    firmado_at: string | null
}

interface DocumentoPublico {
    id: string
    titulo: string
    descripcion: string
    tipo_documento: string
    total_firmantes: number
    firmantes_completados: number
    archivo_pdf_url: string
    firmante: Firmante
    otros_firmantes: Firmante[]
    expira_en: string | null
}

export default function FirmarDocumentoPage() {
    const params = useParams()
    const token = params.token as string

    const [documento, setDocumento] = useState<DocumentoPublico | null>(null)
    const [loading, setLoading] = useState(true)
    const [showSignaturePad, setShowSignaturePad] = useState(false)
    const [signatureType, setSignatureType] = useState<'draw' | 'type' | 'upload'>('draw')
    const [typedSignature, setTypedSignature] = useState('')
    const [signing, setSigning] = useState(false)
    const [signed, setSigned] = useState(false)
    const [pdfUrl, setPdfUrl] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [zoom, setZoom] = useState(100)

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)

    useEffect(() => {
        loadDocumento()
    }, [token])

    const loadDocumento = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/firmas/public/${token}`)
            const data = await response.json()
            setDocumento(data)
            setPdfUrl(data.archivo_pdf_url)

            if (data.firmante.status === 'FIRMADO') {
                setSigned(true)
            }
        } catch (error) {
            console.error('Error loading document:', error)
        } finally {
            setLoading(false)
        }
    }

    // Canvas drawing functions
    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.beginPath()
            ctx.moveTo(x, y)
            setIsDrawing(true)
        }
    }

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return

        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.lineTo(x, y)
            ctx.strokeStyle = '#000'
            ctx.lineWidth = 2
            ctx.lineCap = 'round'
            ctx.stroke()
        }
    }

    const stopDrawing = () => {
        setIsDrawing(false)
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
    }

    const handleSign = async () => {
        if (!documento) return

        setSigning(true)

        try {
            let firmaImagen = ''
            let firmaType = signatureType

            if (signatureType === 'draw') {
                const canvas = canvasRef.current
                if (canvas) {
                    firmaImagen = canvas.toDataURL('image/png')
                }
            } else if (signatureType === 'type') {
                // Generate signature from typed text
                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = 400
                tempCanvas.height = 150
                const ctx = tempCanvas.getContext('2d')
                if (ctx) {
                    ctx.font = '48px "Brush Script MT", cursive'
                    ctx.fillStyle = '#000'
                    ctx.fillText(typedSignature, 20, 100)
                    firmaImagen = tempCanvas.toDataURL('image/png')
                }
            }

            const response = await fetch(`http://localhost:8000/api/v1/firmas/public/${token}/firmar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firma_imagen: firmaImagen,
                    firma_tipo: firmaType,
                    metadata: {
                        navegador: navigator.userAgent,
                        resolucion: `${window.screen.width}x${window.screen.height}`
                    }
                })
            })

            if (response.ok) {
                setSigned(true)
                setShowSignaturePad(false)
                await loadDocumento()
            } else {
                const error = await response.json()
                alert(error.detail || 'Error al firmar el documento')
            }
        } catch (error) {
            console.error('Error signing:', error)
            alert('Error al firmar el documento')
        } finally {
            setSigning(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-white text-lg">Cargando documento...</p>
                </div>
            </div>
        )
    }

    if (!documento) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
                <Card variant="glass" className="max-w-md">
                    <CardContent className="p-12 text-center">
                        <span className="text-6xl block mb-4">⚠️</span>
                        <h2 className="text-2xl font-bold text-white mb-2">Documento no encontrado</h2>
                        <p className="text-slate-400">El enlace puede haber expirado o ser inválido.</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-3xl">🏗️</span>
                            <div>
                                <h1 className="text-xl font-bold text-white">
                                    MICSA <span className="text-blue-400">Firmas</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setZoom(Math.max(50, zoom - 10))}
                                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                            >
                                🔍-
                            </button>
                            <span className="text-white font-mono text-sm">{zoom}%</span>
                            <button
                                onClick={() => setZoom(Math.min(200, zoom + 10))}
                                className="p-2 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                            >
                                🔍+
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Document Info */}
                <div className="mb-6 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-md">
                    <h2 className="text-2xl font-black text-white mb-2">{documento.titulo}</h2>
                    {documento.descripcion && (
                        <p className="text-slate-400 mb-4">{documento.descripcion}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-500">
                            Firmante: <span className="text-white font-bold">{documento.firmante.nombre}</span>
                        </span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-500">
                            {documento.firmante.puesto}
                        </span>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 mb-6">
                    <div className="bg-white rounded-xl overflow-hidden" style={{ height: '600px' }}>
                        <iframe
                            src={`http://localhost:8000${pdfUrl}#zoom=${zoom}`}
                            className="w-full h-full"
                            title="Documento PDF"
                        />
                    </div>
                </div>

                {/* Signature Status */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">
                            Firmas Pendientes ({documento.firmantes_completados}/{documento.total_firmantes})
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 transition-all duration-500"
                                    style={{ width: `${(documento.firmantes_completados / documento.total_firmantes) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {/* Current Signer */}
                        <div className={cn(
                            "flex items-center justify-between p-4 rounded-xl border",
                            signed
                                ? "bg-emerald-500/10 border-emerald-500/30"
                                : "bg-blue-500/10 border-blue-500/30"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                                    signed ? "bg-emerald-500" : "bg-blue-500"
                                )}>
                                    {signed ? '✓' : '📝'}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{documento.firmante.nombre}</p>
                                    <p className="text-sm text-slate-400">{documento.firmante.puesto}</p>
                                </div>
                            </div>
                            <div>
                                {signed ? (
                                    <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg font-bold text-sm">
                                        ✓ FIRMADO
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setShowSignaturePad(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                                    >
                                        ✍️ FIRMAR AHORA
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Other Signers */}
                        {documento.otros_firmantes.map((firmante, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "flex items-center justify-between p-4 rounded-xl border",
                                    firmante.status === 'FIRMADO'
                                        ? "bg-emerald-500/5 border-emerald-500/20"
                                        : "bg-slate-800/50 border-slate-700"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                                        firmante.status === 'FIRMADO' ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700 text-slate-500"
                                    )}>
                                        {firmante.status === 'FIRMADO' ? '✓' : firmante.orden}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{firmante.nombre}</p>
                                        <p className="text-sm text-slate-400">{firmante.puesto}</p>
                                    </div>
                                </div>
                                <span className={cn(
                                    "px-4 py-2 rounded-lg font-bold text-sm",
                                    firmante.status === 'FIRMADO'
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-amber-500/20 text-amber-400"
                                )}>
                                    {firmante.status === 'FIRMADO' ? '✓ Firmado' : 'Pendiente'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Signature Pad Modal */}
            {showSignaturePad && !signed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                            <h3 className="text-2xl font-black uppercase tracking-tight">Firmar Documento</h3>
                            <p className="text-blue-100/70 text-sm font-medium">Elige cómo deseas firmar</p>
                        </div>

                        <div className="p-6">
                            {/* Signature Type Selector */}
                            <div className="flex gap-2 mb-6">
                                <button
                                    onClick={() => setSignatureType('draw')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold transition-all",
                                        signatureType === 'draw'
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                    )}
                                >
                                    ✍️ Dibujar
                                </button>
                                <button
                                    onClick={() => setSignatureType('type')}
                                    className={cn(
                                        "flex-1 py-3 rounded-xl font-bold transition-all",
                                        signatureType === 'type'
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                                    )}
                                >
                                    ⌨️ Escribir
                                </button>
                            </div>

                            {/* Draw Signature */}
                            {signatureType === 'draw' && (
                                <div>
                                    <canvas
                                        ref={canvasRef}
                                        width={600}
                                        height={200}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onMouseLeave={stopDrawing}
                                        className="w-full border-2 border-slate-700 rounded-xl bg-white cursor-crosshair"
                                    />
                                    <button
                                        onClick={clearCanvas}
                                        className="mt-3 text-sm text-slate-400 hover:text-white transition-colors"
                                    >
                                        🗑️ Limpiar
                                    </button>
                                </div>
                            )}

                            {/* Type Signature */}
                            {signatureType === 'type' && (
                                <div>
                                    <input
                                        type="text"
                                        value={typedSignature}
                                        onChange={(e) => setTypedSignature(e.target.value)}
                                        placeholder="Escribe tu nombre completo"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    <div className="mt-4 h-32 bg-white rounded-xl flex items-center justify-center border-2 border-slate-700">
                                        <p className="text-5xl" style={{ fontFamily: '"Brush Script MT", cursive' }}>
                                            {typedSignature || 'Vista previa'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-4 mt-6">
                                <button
                                    onClick={() => setShowSignaturePad(false)}
                                    className="flex-1 px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-black transition-colors"
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleSign}
                                    disabled={signing || (signatureType === 'type' && !typedSignature)}
                                    className="flex-1 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {signing ? 'FIRMANDO...' : '✓ CONFIRMAR FIRMA'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
