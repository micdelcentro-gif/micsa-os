from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime

class EmpleadoDocumentoBase(BaseModel):
    tipo_documento: str
    nombre_archivo: str
    nombre_original: str
    ruta_archivo: str

class EmpleadoDocumentoCreate(EmpleadoDocumentoBase):
    pass

class EmpleadoDocumento(EmpleadoDocumentoBase):
    id: str
    empleado_id: str
    upload_date: datetime

    class Config:
        from_attributes = True

class EmpleadoBase(BaseModel):
    nombre: str
    puesto: Optional[str] = None
    rfc: Optional[str] = None
    nss: Optional[str] = None
    curp: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    activo: bool = True
    salario: float = 0.0
    banco: Optional[str] = None
    cuenta_clabe: Optional[str] = None
    imss_activo: bool = True
    estatus_repse: str = "VERDE"

class EmpleadoCreate(EmpleadoBase):
    proyecto_id: Optional[str] = None

class EmpleadoUpdate(BaseModel):
    nombre: Optional[str] = None
    puesto: Optional[str] = None
    rfc: Optional[str] = None
    nss: Optional[str] = None
    curp: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    contacto_emergencia: Optional[str] = None
    activo: Optional[bool] = None
    proyecto_id: Optional[str] = None
    salario: Optional[float] = None
    banco: Optional[str] = None
    cuenta_clabe: Optional[str] = None
    imss_activo: Optional[bool] = None
    estatus_repse: Optional[str] = None

class Empleado(EmpleadoBase):
    id: str
    proyecto_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    documentos: List[EmpleadoDocumento] = []

    class Config:
        from_attributes = True

class EmpleadoStats(BaseModel):
    total_empleados: int
    empleados_activos: int
    empleados_en_proyectos: int
    alertas_repse_rojo: int
    alertas_repse_amarillo: int
