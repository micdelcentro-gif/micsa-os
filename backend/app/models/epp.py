# MICSA OS - EPP Catalog Model
from sqlalchemy import Column, String, Float
import uuid

from app.core.database import Base

class EppItem(Base):
    __tablename__ = "epp_catalog"
    
    sku = Column(String(50), primary_key=True)
    name = Column(String(255), nullable=False)
    unit = Column(String(20), default="pz") # pz, par
    pricePlusIva = Column(Float, nullable=False)
