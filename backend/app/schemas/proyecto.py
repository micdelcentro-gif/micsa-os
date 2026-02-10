# MICSA OS - Proyecto Schemas
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ProyectoBase(BaseModel):
    nombre: str
    ubicacion: Optional[str] = None
    status: Optional[str] = "ACTIVE"

class ProyectoCreate(BaseModel):
    quoteId: str
    nameOverride: Optional[str] = None

class ProyectoResponse(ProyectoBase):
    id: str
    cotizacion_id: str
    cliente_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class FirmaRequestBase(BaseModel):
    signer_name: str
    signer_role: str

class FirmaRequestResponse(FirmaRequestBase):
    id: str
    proyecto_id: str
    status: str
    signed_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ComplianceCheck(BaseModel):
    medicalOk: bool
    dopingOk: bool
    dc3Ok: bool
    eppOk: bool
    inductionOk: bool
    isoDocsOk: bool

class ComplianceCheckResult(BaseModel):
    startAllowed: bool
    status: str
    missingItems: List[str]
    actions: List[str]

class SigRequestInit(BaseModel):
    projectId: str
    signerName: str
    signerRole: str

class SigSign(BaseModel):
    token: str
    signatureBase64: str
