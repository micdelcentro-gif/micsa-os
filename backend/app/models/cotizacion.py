# MICSA OS - Cotización Model
from sqlalchemy import Column, String, Float, Integer, JSON, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Cotizacion(Base):
    __tablename__ = "cotizaciones"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Referencias
    cliente_id = Column(String(36), ForeignKey("clientes.id"))
    vendedor_id = Column(String(36), ForeignKey("users.id"))
    
    # Encabezado
    nombre_proyecto = Column(String(255), nullable=False)
    ubicacion = Column(String(255))
    tipo_trabajo = Column(String(100))
    duracion_meses = Column(Float, default=1.0)
    condiciones_pago = Column(String(100), default="NETO 30")
    
    # Datos de entrada (JSON para flexibilidad)
    # Incluye peopleByRole, weldersCount, dc3, medical, epp, etc.
    input_data = Column(JSON, nullable=False)
    
    # Resultados del cálculo
    client_quote = Column(JSON) # Lo que ve el cliente
    internal_data = Column(JSON) # Datos internos de costos y márgenes
    
    # Totales
    subtotal = Column(Float, default=0.0)
    iva = Column(Float, default=0.0)
    total = Column(Float, default=0.0)
    
    # Status
    status = Column(String(20), default="DRAFT") # DRAFT, SENT, APPROVED, REJECTED, PROJECT
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    cliente = relationship("Cliente")
    vendedor = relationship("User")
