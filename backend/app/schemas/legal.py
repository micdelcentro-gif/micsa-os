from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class MovimientoLegalBase(BaseModel):
    fecha: date
    tipo: str
    descripcion: str
    monto: Optional[float] = 0.0
    responsable_id: Optional[str] = None
    documento_ruta: Optional[str] = None

class MovimientoLegalCreate(MovimientoLegalBase):
    pass

class MovimientoLegal(MovimientoLegalBase):
    id: str
    expediente_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ExpedienteLegalBase(BaseModel):
    titulo: str
    folio: Optional[str] = None
    tipo: str
    contraparte: str
    descripcion: Optional[str] = None
    monto_disputa: float = 0.0
    monto_provision: float = 0.0
    riesgo: str
    fecha_inicio: Optional[date] = None
    fecha_proxima_audiencia: Optional[date] = None
    abogado_nombre: Optional[str] = None
    abogado_despacho: Optional[str] = None
    estatus: str = "ABIERTO"
    notas: Optional[str] = None

class ExpedienteLegalCreate(ExpedienteLegalBase):
    cliente_id: Optional[str] = None
    proyecto_id: Optional[str] = None

class ExpedienteLegal(ExpedienteLegalBase):
    id: str
    cliente_id: Optional[str] = None
    proyecto_id: Optional[str] = None
    resultado: Optional[str] = "PENDIENTE"
    monto_resolucion: float = 0.0
    created_at: datetime
    updated_at: datetime
    movimientos: List[MovimientoLegal] = []

    class Config:
        from_attributes = True
