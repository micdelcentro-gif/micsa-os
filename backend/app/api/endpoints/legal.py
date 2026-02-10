from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.legal import ExpedienteLegal, MovimientoLegal
from app.schemas.legal import ExpedienteLegal as ExpedienteSchema, ExpedienteLegalCreate, MovimientoLegal as MovimientoSchema, MovimientoLegalCreate

router = APIRouter()

@router.post("/", response_model=ExpedienteSchema, status_code=status.HTTP_201_CREATED)
def crear_expediente(expediente: ExpedienteLegalCreate, db: Session = Depends(get_db)):
    db_expediente = ExpedienteLegal(**expediente.dict())
    db.add(db_expediente)
    db.commit()
    db.refresh(db_expediente)
    return db_expediente

@router.get("/", response_model=List[ExpedienteSchema])
def listar_expedientes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(ExpedienteLegal).offset(skip).limit(limit).all()

@router.get("/{id}", response_model=ExpedienteSchema)
def obtener_expediente(id: str, db: Session = Depends(get_db)):
    expediente = db.query(ExpedienteLegal).filter(ExpedienteLegal.id == id).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    return expediente

@router.post("/{id}/movimientos", response_model=MovimientoSchema)
def agregar_movimiento(id: str, movimiento: MovimientoLegalCreate, db: Session = Depends(get_db)):
    expediente = db.query(ExpedienteLegal).filter(ExpedienteLegal.id == id).first()
    if not expediente:
        raise HTTPException(status_code=404, detail="Expediente no encontrado")
    
    db_movimiento = MovimientoLegal(**movimiento.dict(), expediente_id=id)
    db.add(db_movimiento)
    db.commit()
    db.refresh(db_movimiento)
    return db_movimiento

@router.get("/stats/summary")
def get_legal_stats(db: Session = Depends(get_db)):
    casos = db.query(ExpedienteLegal).all()
    total_disputa = sum(c.monto_disputa for c in casos if c.estatus != 'CERRADO')
    total_activos = len([c for c in casos if c.estatus == 'ABIERTO'])
    
    return {
        "exposicion_total": total_disputa,
        "casos_activos": total_activos,
        "total_casos": len(casos)
    }
