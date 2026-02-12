from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.core.database import get_db
from app.models.empleado import Empleado, EmpleadoDocumento
from app.schemas.empleado import Empleado as EmpleadoSchema, EmpleadoCreate, EmpleadoUpdate, EmpleadoStats

router = APIRouter()

@router.post("/", response_model=EmpleadoSchema, status_code=status.HTTP_201_CREATED)
def crear_empleado(empleado: EmpleadoCreate, db: Session = Depends(get_db)):
    db_empleado = Empleado(**empleado.dict())
    db.add(db_empleado)
    db.commit()
    db.refresh(db_empleado)
    return db_empleado

@router.get("/", response_model=List[EmpleadoSchema])
def listar_empleados(
    skip: int = 0, 
    limit: int = 100, 
    proyecto_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Empleado)
    if proyecto_id:
        query = query.filter(Empleado.proyecto_id == proyecto_id)
    return query.offset(skip).limit(limit).all()

@router.get("/stats", response_model=EmpleadoStats)
def obtener_estadisticas_empleados(db: Session = Depends(get_db)):
    total = db.query(Empleado).count()
    activos = db.query(Empleado).filter(Empleado.activo == True).count()
    en_proyectos = db.query(Empleado).filter(Empleado.proyecto_id != None).count()
    repse_rojo = db.query(Empleado).filter(Empleado.estatus_repse == "ROJO").count()
    repse_amarillo = db.query(Empleado).filter(Empleado.estatus_repse == "AMARILLO").count()
    
    return {
        "total_empleados": total,
        "empleados_activos": activos,
        "empleados_en_proyectos": en_proyectos,
        "alertas_repse_rojo": repse_rojo,
        "alertas_repse_amarillo": repse_amarillo
    }

@router.get("/{id}", response_model=EmpleadoSchema)
def obtener_empleado(id: str, db: Session = Depends(get_db)):
    empleado = db.query(Empleado).filter(Empleado.id == id).first()
    if not empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    return empleado

@router.put("/{id}", response_model=EmpleadoSchema)
def actualizar_empleado(id: str, empleado_update: EmpleadoUpdate, db: Session = Depends(get_db)):
    db_empleado = db.query(Empleado).filter(Empleado.id == id).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    update_data = empleado_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_empleado, key, value)
    
    db.commit()
    db.refresh(db_empleado)
    return db_empleado

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_empleado(id: str, db: Session = Depends(get_db)):
    db_empleado = db.query(Empleado).filter(Empleado.id == id).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    
    db.delete(db_empleado)
    db.commit()
    return None
