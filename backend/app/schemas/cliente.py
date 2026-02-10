# MICSA OS - Cliente Schemas
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class ClienteBase(BaseModel):
    nombre: str
    rfc: Optional[str] = None
    nombre_comercial: Optional[str] = None
    industria: Optional[str] = None
    direccion_fiscal: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    pais: str = "México"
    contacto_nombre: Optional[str] = None
    contacto_puesto: Optional[str] = None
    contacto_email: Optional[EmailStr] = None
    contacto_telefono: Optional[str] = None
    contacto_movil: Optional[str] = None
    credito_autorizado: float = 0
    dias_credito: int = 0
    activo: bool = True
    notas: Optional[str] = None

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    rfc: Optional[str] = None
    nombre_comercial: Optional[str] = None
    industria: Optional[str] = None
    direccion_fiscal: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_email: Optional[EmailStr] = None
    contacto_telefono: Optional[str] = None
    credito_autorizado: Optional[float] = None
    dias_credito: Optional[int] = None
    activo: Optional[bool] = None
    notas: Optional[str] = None

class ClienteResponse(ClienteBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
