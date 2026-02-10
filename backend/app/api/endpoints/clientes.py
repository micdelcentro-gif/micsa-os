# MICSA OS - Clientes Endpoint
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.cliente import Cliente
from app.schemas.cliente import ClienteCreate, ClienteUpdate, ClienteResponse

router = APIRouter()

@router.post("/", response_model=ClienteResponse, status_code=status.HTTP_201_CREATED)
def crear_cliente(cliente: ClienteCreate, db: Session = Depends(get_db)):
    """
    Crear un nuevo cliente
    """
    # Verificar si el RFC ya existe
    if cliente.rfc:
        existing = db.query(Cliente).filter(Cliente.rfc == cliente.rfc).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Ya existe un cliente con RFC {cliente.rfc}"
            )
    
    db_cliente = Cliente(**cliente.dict())
    db.add(db_cliente)
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

@router.get("/", response_model=List[ClienteResponse])
def listar_clientes(
    skip: int = 0,
    limit: int = 100,
    activo: bool = None,
    db: Session = Depends(get_db)
):
    """
    Listar todos los clientes con paginación
    """
    query = db.query(Cliente)
    
    if activo is not None:
        query = query.filter(Cliente.activo == activo)
    
    clientes = query.offset(skip).limit(limit).all()
    return clientes

@router.get("/{cliente_id}", response_model=ClienteResponse)
def obtener_cliente(cliente_id: str, db: Session = Depends(get_db)):
    """
    Obtener un cliente por ID
    """
    cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    return cliente

@router.put("/{cliente_id}", response_model=ClienteResponse)
def actualizar_cliente(
    cliente_id: str,
    cliente_update: ClienteUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar un cliente existente
    """
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Actualizar solo los campos proporcionados
    update_data = cliente_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_cliente, field, value)
    
    db.commit()
    db.refresh(db_cliente)
    return db_cliente

@router.delete("/{cliente_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_cliente(cliente_id: str, db: Session = Depends(get_db)):
    """
    Eliminar un cliente (soft delete - marcar como inactivo)
    """
    db_cliente = db.query(Cliente).filter(Cliente.id == cliente_id).first()
    if not db_cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    
    # Soft delete
    db_cliente.activo = False
    db.commit()
    return

@router.get("/search/{query}", response_model=List[ClienteResponse])
def buscar_clientes(query: str, db: Session = Depends(get_db)):
    """
    Buscar clientes por nombre, RFC o nombre comercial
    """
    search_term = f"%{query}%"
    clientes = db.query(Cliente).filter(
        (Cliente.nombre.ilike(search_term)) |
        (Cliente.rfc.ilike(search_term)) |
        (Cliente.nombre_comercial.ilike(search_term))
    ).all()
    return clientes
