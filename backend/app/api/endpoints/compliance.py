from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid
from datetime import datetime
from app.core.database import get_db
from app.models.compliance import ComplianceExpediente
from app.schemas.compliance import ComplianceExpedienteResponse, ComplianceExpedienteCreate, ComplianceExpedienteUpdate

router = APIRouter()

# Directorio base para documentos de cumplimiento
UPLOAD_DIR = "/Users/jordangonzalez/Downloads/Project Manager/micsa-os/docs/compliance_seil"

@router.post("/", response_model=ComplianceExpedienteResponse, status_code=status.HTTP_201_CREATED)
def crear_expediente(expediente: ComplianceExpedienteCreate, db: Session = Depends(get_db)):
    db_expediente = ComplianceExpediente(**expediente.dict())
    db.add(db_expediente)
    db.commit()
    db.refresh(db_expediente)
    return db_expediente

@router.get("/", response_model=List[ComplianceExpedienteResponse])
def listar_expedientes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    return db.query(ComplianceExpediente).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=ComplianceExpedienteResponse)
def obtener_expediente(id: str, db: Session = Depends(get_db)):
    expediente = db.query(ComplianceExpediente).filter(ComplianceExpediente.id == id).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    return expediente

@router.put("/{id}", response_model=ComplianceExpedienteResponse)
def actualizar_expediente(id: str, expediente_update: ComplianceExpedienteUpdate, db: Session = Depends(get_db)):
    db_expediente = db.query(ComplianceExpediente).filter(ComplianceExpediente.id == id).first()
    if not db_expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    
    update_data = expediente_update.dict(exclude_unset=True)
    # Si documents está en update_data, lo fusionamos con el existente
    if "documents" in update_data and update_data["documents"]:
        current_docs = db_expediente.documents or {}
        new_docs = update_data["documents"]
        for category, files in new_docs.items():
            if category in current_docs:
                current_docs[category].update(files)
            else:
                current_docs[category] = files
        db_expediente.documents = current_docs
        del update_data["documents"]

    for key, value in update_data.items():
        setattr(db_expediente, key, value)
    
    db.commit()
    db.refresh(db_expediente)
    return db_expediente

@router.post("/{id}/upload", response_model=ComplianceExpedienteResponse)
async def upload_document(
    id: str,
    category: str = Form(...), # e.g., "02_FACTURA"
    field: str = Form(...),    # e.g., "factura_pdf"
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    db_expediente = db.query(ComplianceExpediente).filter(ComplianceExpediente.id == id).first()
    if not db_expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    
    # Crear carpeta para el expediente si no existe
    # Estructura: UPLOAD_DIR / OC_XXXXXX / category / filename
    safe_oc = db_expediente.oc_number.replace("/", "_").replace(" ", "_")
    folder_path = os.path.join(UPLOAD_DIR, safe_oc, category)
    os.makedirs(folder_path, exist_ok=True)
    
    file_extension = os.path.splitext(file.filename)[1]
    filename = f"{field}_{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(folder_path, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Actualizar JSON de documentos
    docs = db_expediente.documents or {}
    if category not in docs:
        docs[category] = {}
    docs[category][field] = file_path
    
    db_expediente.documents = docs
    # Marcar la fase como lista si todos los documentos requeridos están (esto es lógica del frontend usualmente, pero podemos ayudar)
    
    db.commit()
    db.refresh(db_expediente)
    return db_expediente

@router.post("/{id}/send", response_model=ComplianceExpedienteResponse)
def enviar_expediente(id: str, db: Session = Depends(get_db)):
    db_expediente = db.query(ComplianceExpediente).filter(ComplianceExpediente.id == id).first()
    if not db_expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    
    # Aquí iría la lógica de envío de correo real
    # Por ahora solo marcamos como ENVIADO
    db_expediente.status = "ENVIADO"
    db_expediente.sent_at = datetime.now()
    
    db.commit()
    db.refresh(db_expediente)
    return db_expediente
