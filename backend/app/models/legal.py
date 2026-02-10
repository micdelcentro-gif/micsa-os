from sqlalchemy import Column, String, Float, Date, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
import uuid
from datetime import datetime

class ExpedienteLegal(Base):
    __tablename__ = "expedientes_legales"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    titulo = Column(String(255), nullable=False)
    folio = Column(String(50), unique=True)
    tipo = Column(String(50))  # DEMANDA_LABORAL, DEMANDA_MERCANTIL, etc.
    contraparte = Column(String(255))
    
    # Relaciones
    cliente_id = Column(String(36), ForeignKey("clientes.id"), nullable=True)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    # empleado_id = Column(String(36), ForeignKey("empleados.id"), nullable=True) # Empleados table missing for now
    
    # Detalles
    descripcion = Column(Text)
    monto_disputa = Column(Float, default=0.0)
    monto_provision = Column(Float, default=0.0)
    riesgo = Column(String(20)) # BAJO, MEDIO, ALTO, CRITICO
    
    # Fechas
    fecha_inicio = Column(Date)
    fecha_proxima_audiencia = Column(Date)
    fecha_resolucion = Column(Date)
    
    # Abogado
    abogado_nombre = Column(String(255))
    abogado_despacho = Column(String(255))
    abogado_telefono = Column(String(50))
    abogado_email = Column(String(255))
    
    # Resultado
    resultado = Column(String(50), default="PENDIENTE")
    monto_resolucion = Column(Float, default=0.0)
    
    # Status
    estatus = Column(String(20), default="ABIERTO")
    notas = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    movimientos = relationship("MovimientoLegal", back_populates="expediente", cascade="all, delete-orphan")

class MovimientoLegal(Base):
    __tablename__ = "movimientos_legales"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    expediente_id = Column(String(36), ForeignKey("expedientes_legales.id"))
    fecha = Column(Date, nullable=False)
    tipo = Column(String(50)) # AUDIENCIA, NOTIFICACION, etc.
    descripcion = Column(Text, nullable=False)
    monto = Column(Float, default=0.0)
    responsable_id = Column(String(36), ForeignKey("users.id"))
    documento_ruta = Column(String(500))
    created_at = Column(DateTime, default=datetime.utcnow)

    expediente = relationship("ExpedienteLegal", back_populates="movimientos")
