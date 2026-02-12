from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ComplianceExpedienteBase(BaseModel):
    proyecto_id: Optional[str] = None
    oc_number: str
    nombre_proyecto: str
    mes_curso: str
    status: Optional[str] = "ABIERTO"
    phase_0_ready: Optional[bool] = False
    phase_1_ready: Optional[bool] = False
    phase_2_ready: Optional[bool] = False
    phase_3_ready: Optional[bool] = False
    phase_4_ready: Optional[bool] = False
    phase_5_ready: Optional[bool] = False
    phase_6_ready: Optional[bool] = False
    phase_7_ready: Optional[bool] = False
    phase_8_ready: Optional[bool] = False
    phase_9_ready: Optional[bool] = False
    documents: Optional[Dict[str, Any]] = None

class ComplianceExpedienteCreate(ComplianceExpedienteBase):
    pass

class ComplianceExpedienteUpdate(BaseModel):
    proyecto_id: Optional[str] = None
    oc_number: Optional[str] = None
    nombre_proyecto: Optional[str] = None
    mes_curso: Optional[str] = None
    status: Optional[str] = None
    phase_0_ready: Optional[bool] = None
    phase_1_ready: Optional[bool] = None
    phase_2_ready: Optional[bool] = None
    phase_3_ready: Optional[bool] = None
    phase_4_ready: Optional[bool] = None
    phase_5_ready: Optional[bool] = None
    phase_6_ready: Optional[bool] = None
    phase_7_ready: Optional[bool] = None
    phase_8_ready: Optional[bool] = None
    phase_9_ready: Optional[bool] = None
    documents: Optional[Dict[str, Any]] = None

class ComplianceExpedienteInDB(ComplianceExpedienteBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ComplianceExpedienteResponse(ComplianceExpedienteInDB):
    pass
