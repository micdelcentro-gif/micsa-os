# MICSA OS - Cliente Model
from sqlalchemy import Column, String, Boolean, DateTime, Float, Integer, Text
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Cliente(Base):
    __tablename__ = "clientes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Información básica
    nombre = Column(String(255), nullable=False)
    rfc = Column(String(13), unique=True)
    nombre_comercial = Column(String(255))
    industria = Column(String(100))
    
    # Dirección
    direccion_fiscal = Column(Text)
    ciudad = Column(String(100))
    estado = Column(String(100))
    codigo_postal = Column(String(10))
    pais = Column(String(100), default='México')
    
    # Contacto principal
    contacto_nombre = Column(String(255))
    contacto_puesto = Column(String(100))
    contacto_email = Column(String(255))
    contacto_telefono = Column(String(50))
    contacto_movil = Column(String(50))
    
    # Comercial
    credito_autorizado = Column(Float, default=0)
    dias_credito = Column(Integer, default=0)
    
    # Status
    activo = Column(Boolean, default=True)
    notas = Column(Text)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
