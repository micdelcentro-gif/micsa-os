# MICSA OS - EPP Schemas
from pydantic import BaseModel

class EppItemBase(BaseModel):
    sku: str
    name: str
    unit: str = "pz"
    pricePlusIva: float

class EppItemCreate(EppItemBase):
    pass

class EppItemResponse(EppItemBase):
    class Config:
        from_attributes = True
