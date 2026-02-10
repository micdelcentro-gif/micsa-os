# MICSA OS - Proyecto Model
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Proyecto(Base):
    __tablename__ = "proyectos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    cotizacion_id = Column(String(36), ForeignKey("cotizaciones.id"))
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    
    nombre = Column(String(255), nullable=False)
    ubicacion = Column(String(255))
    status = Column(String(20), default="ACTIVE") # ACTIVE, CLOSED, ON_HOLD
    
    # Compliance data
    compliance_status = Column(JSON) # medicalOk, dopingOk, etc.
    
    start_date = Column(DateTime(timezone=True))
    end_date = Column(DateTime(timezone=True))
    closed_at = Column(DateTime(timezone=True))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cotizacion = relationship("Cotizacion")
    cliente = relationship("Cliente")
    firmas = relationship("FirmaRequest", back_populates="proyecto")

class FirmaRequest(Base):
    __tablename__ = "firma_requests"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"))
    
    signer_name = Column(String(255), nullable=False)
    signer_role = Column(String(100), nullable=False)
    
    status = Column(String(20), default="PENDING") # PENDING, SIGNED, REVOKED
    signed_at = Column(DateTime(timezone=True))
    
    # Token for signing link (hashed in reproduce_issue.js, let's keep it simple or follow that)
    token_hash = Column(String(64), unique=True)
    signature_base64 = Column(Text) # The actual signature image or data
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    proyecto = relationship("Proyecto", back_populates="firmas")
