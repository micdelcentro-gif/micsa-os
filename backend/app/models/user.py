# MICSA OS - User Model
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
import enum
import uuid

from app.core.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    SUPERVISOR = "SUPERVISOR"
    OPERADOR = "OPERADOR"
    COMERCIAL = "COMERCIAL"
    FINANZAS = "FINANZAS"
    EHS = "EHS"
    ALMACEN = "ALMACEN"
    RRHH = "RRHH"

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nombre = Column(String(255), nullable=False)
    rol = Column(SQLEnum(UserRole), default=UserRole.OPERADOR, nullable=False)
    activo = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
