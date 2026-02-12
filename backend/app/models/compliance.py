from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

class ComplianceExpediente(Base):
    __tablename__ = "compliance_expedientes"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    proyecto_id = Column(String(36), ForeignKey("proyectos.id"), nullable=True)
    oc_number = Column(String(50), nullable=False) # Numero de Orden de Compra
    nombre_proyecto = Column(String(255), nullable=False)
    mes_curso = Column(String(20), nullable=False) # e.g., "Febrero 2026"
    
    status = Column(String(20), default="ABIERTO") # ABIERTO, LISTO_PARA_ENVIAR, ENVIADO, CERRADO
    
    # Marcadores de fase completada
    phase_0_ready = Column(Boolean, default=False)
    phase_1_ready = Column(Boolean, default=False)
    phase_2_ready = Column(Boolean, default=False)
    phase_3_ready = Column(Boolean, default=False)
    phase_4_ready = Column(Boolean, default=False)
    phase_5_ready = Column(Boolean, default=False)
    phase_6_ready = Column(Boolean, default=False)
    phase_7_ready = Column(Boolean, default=False)
    phase_8_ready = Column(Boolean, default=False)
    phase_9_ready = Column(Boolean, default=False)
    
    # Almacenamos el estado de los documentos específicos
    # { "01_CXP_Y_POLIZA": { "reporte_cxp": "path/to/file", "poliza": null }, ... }
    documents = Column(JSON, default=lambda: {
        "01_CXP_Y_POLIZA": {"reporte_cxp": None, "poliza_contable": None},
        "02_FACTURA": {"factura_pdf": None, "factura_xml": None, "captura_correo": None},
        "03_VERIFICACION_FISCAL": {"verificacion_sat": None},
        "04_ORDEN_DE_COMPRA": {"po_firmada": None},
        "05_HOJA_DE_ACEPTACION": {"hoja_aceptacion": None},
        "06_CONTRATO": {"contrato_firmado": None},
        "07_NOMINAS_Y_SEGURIDAD_SOCIAL": {"nominas": None, "pago_seguro": None, "caratula_imss": None, "sua": None},
        "08_IMPUESTOS": {"pago_isr": None, "acuse_isr": None, "pago_iva": None, "acuse_iva": None, "pago_isn": None},
        "09_OPINIONES_POSITIVAS": {"opinion_imss": None, "opinion_infonavit": None, "opinion_sat": None}
    })
    
    sent_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    proyecto = relationship("Proyecto")
