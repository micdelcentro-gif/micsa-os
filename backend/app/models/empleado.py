from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Boolean, Integer
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid

from app.core.database import Base

class Empleado(Base):
    __tablename__ = "empleados"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Datos personales
    nombre = Column(String(255), nullable=False)
    puesto = Column(String(255))
    rfc = Column(String(13))
    nss = Column(String(11))
    curp = Column(String(18))
    telefono = Column(String(20))
    email = Column(String(255))
    contacto_emergencia = Column(String(255))
    
    # Estatus y relación laboral
    activo = Column(Boolean, default=True)
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    
    # Datos financieros
    salario = Column(Float, default=0.0)
    banco = Column(String(100))
    cuenta_clabe = Column(String(50))
    
    # Estatus REPSE / IMSS
    imss_activo = Column(Boolean, default=True)
    estatus_repse = Column(String(20), default="VERDE") # VERDE, AMARILLO, ROJO
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    proyecto = relationship("Proyecto", backref="empleados")
    documentos = relationship("EmpleadoDocumento", back_populates="empleado", cascade="all, delete-orphan")

class EmpleadoDocumento(Base):
    __tablename__ = "empleado_documentos"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empleado_id = Column(String(36), ForeignKey("empleados.id"))
    
    tipo_documento = Column(String(100), nullable=False) # INE, NSS, ACTA, etc.
    nombre_archivo = Column(String(255), nullable=False)
    nombre_original = Column(String(255), nullable=False)
    ruta_archivo = Column(String(512), nullable=False)
    
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    empleado = relationship("Empleado", back_populates="documentos")
