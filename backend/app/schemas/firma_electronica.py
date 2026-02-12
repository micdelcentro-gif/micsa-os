from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ========== FIRMANTE SCHEMAS ==========

class FirmanteBase(BaseModel):
    nombre: str
    email: EmailStr
    puesto: Optional[str] = None
    empresa: Optional[str] = None
    orden: int = 1

class FirmanteCreate(FirmanteBase):
    pass

class FirmanteInDB(FirmanteBase):
    id: str
    documento_id: str
    status: str
    token_acceso: str
    notificado_at: Optional[datetime] = None
    firmado_at: Optional[datetime] = None
    visto_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class FirmanteResponse(FirmanteInDB):
    pass

class FirmaData(BaseModel):
    """Datos para registrar una firma"""
    firma_imagen: str  # Base64 de la firma
    firma_tipo: str  # "dibujada", "tipografica", "imagen"
    metadata: Optional[dict] = None


# ========== DOCUMENTO FIRMA SCHEMAS ==========

class DocumentoFirmaBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    tipo_documento: Optional[str] = None
    proyecto_id: Optional[str] = None
    requiere_orden: bool = False
    expira_en: Optional[datetime] = None

class DocumentoFirmaCreate(DocumentoFirmaBase):
    firmantes: List[FirmanteCreate]

class DocumentoFirmaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    status: Optional[str] = None
    expira_en: Optional[datetime] = None

class DocumentoFirmaInDB(DocumentoFirmaBase):
    id: str
    archivo_pdf: str
    archivo_firmado: Optional[str] = None
    status: str
    total_firmantes: int
    firmantes_completados: int
    creado_por: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    completado_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DocumentoFirmaResponse(DocumentoFirmaInDB):
    firmantes: List[FirmanteResponse] = []

class DocumentoFirmaStats(BaseModel):
    """Estadísticas del sistema de firmas"""
    total_documentos: int
    pendientes: int
    en_proceso: int
    completados: int
    cancelados: int
    firmantes_pendientes: int
    firmantes_completados: int


# ========== ACCESO PÚBLICO SCHEMAS ==========

class DocumentoPublicoResponse(BaseModel):
    """Información del documento para firmante (sin datos sensibles)"""
    id: str
    titulo: str
    descripcion: Optional[str]
    tipo_documento: Optional[str]
    total_firmantes: int
    firmantes_completados: int
    archivo_pdf_url: str
    firmante: FirmanteResponse
    otros_firmantes: List[dict]  # Solo nombre y status de otros firmantes
    expira_en: Optional[datetime] = None
