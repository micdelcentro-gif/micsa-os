from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import shutil
from datetime import datetime
import base64

from app.core.database import get_db
from app.models.firma_electronica import DocumentoFirma, Firmante, HistorialFirma
from app.schemas.firma_electronica import (
    DocumentoFirmaCreate,
    DocumentoFirmaResponse,
    DocumentoFirmaUpdate,
    DocumentoFirmaStats,
    DocumentoPublicoResponse,
    FirmaData,
    FirmanteResponse
)

router = APIRouter()

UPLOAD_DIR = "docs/firmas_electronicas"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ========== ENDPOINTS ADMINISTRATIVOS ==========

@router.get("/stats", response_model=DocumentoFirmaStats)
async def get_firma_stats(db: Session = Depends(get_db)):
    """Obtener estadísticas del sistema de firmas"""
    total = db.query(DocumentoFirma).count()
    pendientes = db.query(DocumentoFirma).filter(DocumentoFirma.status == "PENDIENTE").count()
    en_proceso = db.query(DocumentoFirma).filter(DocumentoFirma.status == "EN_PROCESO").count()
    completados = db.query(DocumentoFirma).filter(DocumentoFirma.status == "COMPLETADO").count()
    cancelados = db.query(DocumentoFirma).filter(DocumentoFirma.status == "CANCELADO").count()
    
    firmantes_pendientes = db.query(Firmante).filter(Firmante.status.in_(["PENDIENTE", "NOTIFICADO"])).count()
    firmantes_completados = db.query(Firmante).filter(Firmante.status == "FIRMADO").count()
    
    return DocumentoFirmaStats(
        total_documentos=total,
        pendientes=pendientes,
        en_proceso=en_proceso,
        completados=completados,
        cancelados=cancelados,
        firmantes_pendientes=firmantes_pendientes,
        firmantes_completados=firmantes_completados
    )


@router.get("/", response_model=List[DocumentoFirmaResponse])
async def list_documentos(
    status: str = None,
    db: Session = Depends(get_db)
):
    """Listar todos los documentos de firma"""
    query = db.query(DocumentoFirma)
    if status:
        query = query.filter(DocumentoFirma.status == status)
    
    docs = query.order_by(DocumentoFirma.created_at.desc()).all()
    return docs


@router.post("/", response_model=DocumentoFirmaResponse)
async def create_documento(
    titulo: str,
    descripcion: str = None,
    tipo_documento: str = None,
    proyecto_id: str = None,
    requiere_orden: bool = False,
    firmantes_json: str = "[]",  # JSON string de firmantes
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Crear un nuevo documento para firma"""
    import json
    
    # Guardar archivo PDF
    doc_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{doc_id}_original{file_ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Parsear firmantes
    firmantes_data = json.loads(firmantes_json)
    
    # Crear documento
    documento = DocumentoFirma(
        id=doc_id,
        titulo=titulo,
        descripcion=descripcion,
        tipo_documento=tipo_documento,
        proyecto_id=proyecto_id,
        requiere_orden=requiere_orden,
        archivo_pdf=filepath,
        total_firmantes=len(firmantes_data),
        status="PENDIENTE"
    )
    
    db.add(documento)
    
    # Crear firmantes
    for idx, firmante_data in enumerate(firmantes_data, 1):
        firmante = Firmante(
            documento_id=doc_id,
            nombre=firmante_data["nombre"],
            email=firmante_data["email"],
            puesto=firmante_data.get("puesto"),
            empresa=firmante_data.get("empresa"),
            orden=idx
        )
        db.add(firmante)
    
    # Registrar en historial
    historial = HistorialFirma(
        documento_id=doc_id,
        accion="creado",
        detalles={"titulo": titulo, "total_firmantes": len(firmantes_data)}
    )
    db.add(historial)
    
    db.commit()
    db.refresh(documento)
    
    return documento


@router.get("/{documento_id}", response_model=DocumentoFirmaResponse)
async def get_documento(documento_id: str, db: Session = Depends(get_db)):
    """Obtener detalles de un documento"""
    doc = db.query(DocumentoFirma).filter(DocumentoFirma.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    return doc


@router.put("/{documento_id}", response_model=DocumentoFirmaResponse)
async def update_documento(
    documento_id: str,
    update: DocumentoFirmaUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un documento"""
    doc = db.query(DocumentoFirma).filter(DocumentoFirma.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    for key, value in update.dict(exclude_unset=True).items():
        setattr(doc, key, value)
    
    doc.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(doc)
    
    return doc


@router.post("/{documento_id}/notify")
async def notify_firmantes(documento_id: str, db: Session = Depends(get_db)):
    """Enviar notificaciones a todos los firmantes pendientes"""
    doc = db.query(DocumentoFirma).filter(DocumentoFirma.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    firmantes = db.query(Firmante).filter(
        Firmante.documento_id == documento_id,
        Firmante.status == "PENDIENTE"
    ).all()
    
    notificados = 0
    for firmante in firmantes:
        # TODO: Integrar con servicio de email
        # send_email(firmante.email, f"http://localhost:3001/firmar/{firmante.token_acceso}")
        
        firmante.status = "NOTIFICADO"
        firmante.notificado_at = datetime.utcnow()
        
        historial = HistorialFirma(
            documento_id=documento_id,
            firmante_id=firmante.id,
            accion="notificado",
            detalles={"email": firmante.email}
        )
        db.add(historial)
        notificados += 1
    
    if doc.status == "PENDIENTE":
        doc.status = "EN_PROCESO"
    
    db.commit()
    
    return {"message": f"{notificados} firmantes notificados", "notificados": notificados}


# ========== ENDPOINTS PÚBLICOS (PARA FIRMANTES) ==========

@router.get("/public/{token}", response_model=DocumentoPublicoResponse)
async def get_documento_publico(token: str, request: Request, db: Session = Depends(get_db)):
    """Obtener documento para firmar (acceso público con token)"""
    firmante = db.query(Firmante).filter(Firmante.token_acceso == token).first()
    if not firmante:
        raise HTTPException(status_code=404, detail="Token inválido")
    
    documento = firmante.documento
    
    # Registrar visualización
    if not firmante.visto_at:
        firmante.visto_at = datetime.utcnow()
        historial = HistorialFirma(
            documento_id=documento.id,
            firmante_id=firmante.id,
            accion="visto",
            detalles={"ip": request.client.host}
        )
        db.add(historial)
        db.commit()
    
    # Preparar lista de otros firmantes (sin datos sensibles)
    otros_firmantes = [
        {
            "nombre": f.nombre,
            "puesto": f.puesto,
            "status": f.status,
            "orden": f.orden,
            "firmado_at": f.firmado_at.isoformat() if f.firmado_at else None
        }
        for f in documento.firmantes if f.id != firmante.id
    ]
    
    return DocumentoPublicoResponse(
        id=documento.id,
        titulo=documento.titulo,
        descripcion=documento.descripcion,
        tipo_documento=documento.tipo_documento,
        total_firmantes=documento.total_firmantes,
        firmantes_completados=documento.firmantes_completados,
        archivo_pdf_url=f"/api/v1/firmas/public/{token}/pdf",
        firmante=firmante,
        otros_firmantes=otros_firmantes,
        expira_en=documento.expira_en
    )


@router.get("/public/{token}/pdf")
async def get_pdf_publico(token: str, db: Session = Depends(get_db)):
    """Descargar PDF del documento (acceso público con token)"""
    from fastapi.responses import FileResponse
    
    firmante = db.query(Firmante).filter(Firmante.token_acceso == token).first()
    if not firmante:
        raise HTTPException(status_code=404, detail="Token inválido")
    
    documento = firmante.documento
    
    if not os.path.exists(documento.archivo_pdf):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return FileResponse(
        documento.archivo_pdf,
        media_type="application/pdf",
        filename=f"{documento.titulo}.pdf"
    )


@router.post("/public/{token}/firmar")
async def firmar_documento(
    token: str,
    firma_data: FirmaData,
    request: Request,
    db: Session = Depends(get_db)
):
    """Registrar firma de un documento"""
    firmante = db.query(Firmante).filter(Firmante.token_acceso == token).first()
    if not firmante:
        raise HTTPException(status_code=404, detail="Token inválido")
    
    if firmante.status == "FIRMADO":
        raise HTTPException(status_code=400, detail="Ya has firmado este documento")
    
    documento = firmante.documento
    
    # Verificar si requiere orden
    if documento.requiere_orden:
        firmantes_anteriores = db.query(Firmante).filter(
            Firmante.documento_id == documento.id,
            Firmante.orden < firmante.orden,
            Firmante.status != "FIRMADO"
        ).count()
        
        if firmantes_anteriores > 0:
            raise HTTPException(
                status_code=400,
                detail="Debes esperar a que los firmantes anteriores completen su firma"
            )
    
    # Registrar firma
    firmante.firma_imagen = firma_data.firma_imagen
    firmante.firma_tipo = firma_data.firma_tipo
    firmante.firma_metadata = {
        **(firma_data.metadata or {}),
        "ip": request.client.host,
        "user_agent": request.headers.get("user-agent"),
        "timestamp": datetime.utcnow().isoformat()
    }
    firmante.status = "FIRMADO"
    firmante.firmado_at = datetime.utcnow()
    
    # Actualizar contador del documento
    documento.firmantes_completados += 1
    
    # Verificar si todos firmaron
    if documento.firmantes_completados >= documento.total_firmantes:
        documento.status = "COMPLETADO"
        documento.completado_at = datetime.utcnow()
        
        # TODO: Generar PDF firmado con todas las firmas
        # documento.archivo_firmado = generate_signed_pdf(documento)
    
    # Registrar en historial
    historial = HistorialFirma(
        documento_id=documento.id,
        firmante_id=firmante.id,
        accion="firmado",
        detalles={
            "tipo_firma": firma_data.firma_tipo,
            "ip": request.client.host
        },
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    db.add(historial)
    
    db.commit()
    
    return {
        "message": "Firma registrada exitosamente",
        "documento_completado": documento.status == "COMPLETADO",
        "firmantes_completados": documento.firmantes_completados,
        "total_firmantes": documento.total_firmantes
    }


@router.get("/{documento_id}/download")
async def download_documento_firmado(documento_id: str, db: Session = Depends(get_db)):
    """Descargar documento con todas las firmas"""
    from fastapi.responses import FileResponse
    
    doc = db.query(DocumentoFirma).filter(DocumentoFirma.id == documento_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado")
    
    if doc.status != "COMPLETADO":
        raise HTTPException(status_code=400, detail="El documento aún no está completamente firmado")
    
    # Por ahora retornar el original, luego se generará el PDF con firmas
    archivo = doc.archivo_firmado if doc.archivo_firmado else doc.archivo_pdf
    
    if not os.path.exists(archivo):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    
    return FileResponse(
        archivo,
        media_type="application/pdf",
        filename=f"{doc.titulo}_firmado.pdf"
    )
