from sqlalchemy import Column, String, DateTime, Boolean, Text, JSON, Integer, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base

class DocumentoFirma(Base):
    """Documento que requiere firmas electrónicas"""
    __tablename__ = "documentos_firma"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    titulo = Column(String, nullable=False)
    descripcion = Column(Text)
    archivo_pdf = Column(String, nullable=False)  # Path al PDF original
    archivo_firmado = Column(String)  # Path al PDF con todas las firmas
    
    # Metadata
    tipo_documento = Column(String)  # "contrato", "orden_compra", "convenio", etc.
    proyecto_id = Column(String, ForeignKey("proyectos.id"))
    creado_por = Column(String, default="admin")
    
    # Estado del documento
    status = Column(String, default="PENDIENTE")  # PENDIENTE, EN_PROCESO, COMPLETADO, CANCELADO
    total_firmantes = Column(Integer, default=0)
    firmantes_completados = Column(Integer, default=0)
    
    # Configuración de firma
    requiere_orden = Column(Boolean, default=False)  # Si las firmas deben ser en orden
    expira_en = Column(DateTime)  # Fecha de expiración del documento
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    completado_at = Column(DateTime)
    
    # Relaciones
    firmantes = relationship("Firmante", back_populates="documento", cascade="all, delete-orphan")
    proyecto = relationship("Proyecto", foreign_keys=[proyecto_id])


class Firmante(Base):
    """Persona que debe firmar un documento"""
    __tablename__ = "firmantes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    documento_id = Column(String, ForeignKey("documentos_firma.id"), nullable=False)
    
    # Información del firmante
    nombre = Column(String, nullable=False)
    email = Column(String, nullable=False)
    puesto = Column(String)
    empresa = Column(String)
    
    # Orden y estado
    orden = Column(Integer, default=1)  # Orden en que debe firmar (si requiere_orden=True)
    status = Column(String, default="PENDIENTE")  # PENDIENTE, NOTIFICADO, FIRMADO, RECHAZADO
    
    # Token único para acceso
    token_acceso = Column(String, unique=True, default=lambda: str(uuid.uuid4()))
    
    # Datos de la firma
    firma_imagen = Column(Text)  # Base64 de la firma dibujada
    firma_tipo = Column(String)  # "dibujada", "tipografica", "imagen", "certificado_digital"
    firma_metadata = Column(JSON)  # IP, user agent, timestamp, etc.
    
    # Timestamps
    notificado_at = Column(DateTime)
    firmado_at = Column(DateTime)
    visto_at = Column(DateTime)  # Cuando abrió el documento
    
    # Relaciones
    documento = relationship("DocumentoFirma", back_populates="firmantes")


class HistorialFirma(Base):
    """Registro de auditoría de todas las acciones sobre documentos"""
    __tablename__ = "historial_firmas"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    documento_id = Column(String, ForeignKey("documentos_firma.id"))
    firmante_id = Column(String, ForeignKey("firmantes.id"))
    
    accion = Column(String, nullable=False)  # "creado", "notificado", "visto", "firmado", "rechazado", "cancelado"
    detalles = Column(JSON)  # Información adicional de la acción
    
    # Metadata de auditoría
    ip_address = Column(String)
    user_agent = Column(String)
    
    created_at = Column(DateTime, default=datetime.utcnow)
