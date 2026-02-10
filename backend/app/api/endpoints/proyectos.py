# MICSA OS - Proyectos Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import hashlib
import os

from app.core.database import get_db
from app.models.proyecto import Proyecto, FirmaRequest
from app.models.cotizacion import Cotizacion
from app.services.reports import ReportService
from app.schemas.proyecto import ProyectoCreate, ProyectoResponse, FirmaRequestResponse, ComplianceCheck, ComplianceCheckResult, SigSign, SigRequestInit
from fastapi.responses import Response

router = APIRouter()

@router.post("/from-quote", response_model=ProyectoResponse)
def create_from_quote(data: ProyectoCreate, db: Session = Depends(get_db)):
    quote = db.query(Cotizacion).filter(Cotizacion.id == data.quoteId).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    project = Proyecto(
        cotizacion_id=quote.id,
        cliente_id=quote.cliente_id,
        nombre=data.nameOverride or quote.nombre_proyecto,
        ubicacion=quote.ubicacion,
        status="ACTIVE"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[ProyectoResponse])
def list_projects(db: Session = Depends(get_db)):
    return db.query(Proyecto).all()

@router.get("/{project_id}", response_model=ProyectoResponse)
def get_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Proyecto).filter(Proyecto.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    return p

@router.post("/{project_id}/close")
def close_project(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Proyecto).filter(Proyecto.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    
    pending = db.query(FirmaRequest).filter(
        FirmaRequest.proyecto_id == p.id, 
        FirmaRequest.status == "PENDING"
    ).count()
    
    if pending > 0:
        raise HTTPException(status_code=409, detail=f"❌ Cierre bloqueado: faltan {pending} firmas")
    
    p.status = "CLOSED"
    p.closed_at = datetime.now()
    db.commit()
    return {"ok": True, "message": "✅ Proyecto cerrado"}

# Compliance
@router.post("/compliance/start-check", response_model=ComplianceCheckResult)
def compliance_check(data: ComplianceCheck):
    missing = []
    if not data.medicalOk: missing.append("Exámenes médicos vigentes")
    if not data.dopingOk: missing.append("Antidoping vigente")
    if not data.dc3Ok: missing.append("DC3 por puesto")
    if not data.eppOk: missing.append("EPP asignado")
    if not data.inductionOk: missing.append("Inducción / credenciales")
    if not data.isoDocsOk: missing.append("Documentación ISO/HSE")
    
    return {
        "startAllowed": len(missing) == 0,
        "status": "✅ LIBERADO" if len(missing) == 0 else "❌ BLOQUEADO",
        "missingItems": missing,
        "actions": [f"Gestionar: {m}" for m in missing]
    }

# Signatures
@router.post("/signatures/request", response_model=FirmaRequestResponse)
def request_signature(data: SigRequestInit, db: Session = Depends(get_db)):
    # Simple token generation
    token = hashlib.sha256(os.urandom(32)).hexdigest()[:24]
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    
    sig = FirmaRequest(
        proyecto_id=data.projectId,
        signer_name=data.signerName,
        signer_role=data.signerRole,
        token_hash=token_hash,
        status="PENDING"
    )
    db.add(sig)
    db.commit()
    db.refresh(sig)
    
    return {"signatureRequestId": sig.id, "token": token}

@router.post("/signatures/{sig_id}/sign")
def sign_request(sig_id: str, data: SigSign, db: Session = Depends(get_db)):
    sig = db.query(FirmaRequest).filter(FirmaRequest.id == sig_id).first()
    if not sig:
        raise HTTPException(status_code=404, detail="Signature request not found")
    
    token_hash = hashlib.sha256(data.token.encode()).hexdigest()
    if sig.token_hash != token_hash:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    sig.status = "SIGNED"
    sig.signed_at = datetime.now()
    sig.signature_base64 = data.signatureBase64
    db.commit()
    
    return {"ok": True, "message": "✅ Firmado"}

@router.get("/{project_id}/report/daily")
def get_daily_report(project_id: str, db: Session = Depends(get_db)):
    p = db.query(Proyecto).filter(Proyecto.id == project_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Project not found")
    
    pdf_content = ReportService.generate_daily_report_pdf({
        "nombre": p.nombre,
        "ubicacion": p.ubicacion,
        "eppOk": True, # Mocking these for now or fetching from compliance table if existent
        "dc3Ok": True,
        "medOk": True,
        "activities": ["Instalación de tubería", "Soldadura de soportes"],
        "peopleCount": 12
    })
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=reporte-diario-{project_id}.pdf"
        }
    )
