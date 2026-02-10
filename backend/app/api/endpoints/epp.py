# MICSA OS - EPP Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict
from pydantic import BaseModel
from app.core.database import get_db
from app.models.epp import EppItem

router = APIRouter()

class EppItemSchema(BaseModel):
    sku: str
    name: str
    unit: str = "pz"
    pricePlusIva: float

class EppUpsert(BaseModel):
    items: List[EppItemSchema]

@router.get("/", response_model=List[EppItemSchema])
def list_epp(db: Session = Depends(get_db)):
    return db.query(EppItem).all()

@router.post("/upsert")
def upsert_epp(data: EppUpsert, db: Session = Depends(get_db)):
    for item in data.items:
        db_item = db.query(EppItem).filter(EppItem.sku == item.sku).first()
        if db_item:
            db_item.name = item.name
            db_item.unit = item.unit
            db_item.pricePlusIva = item.pricePlusIva
        else:
            db_item = EppItem(**item.dict())
            db.add(db_item)
    db.commit()
    return {"ok": True, "count": len(data.items)}
