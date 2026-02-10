# MICSA OS - Configuration
from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DB_ECHO: bool = False
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    
    # API
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "MICSA OS"
    DEBUG: bool = True
    
    # Company
    EMPRESA_NOMBRE: str
    EMPRESA_RFC: str
    EMPRESA_DIRECCION: str
    EMPRESA_TELEFONO: str
    
    # Business
    PORCENTAJE_ADMIN: float = 18.0
    PORCENTAJE_IVA: float = 16.0
    
    # Paths
    UPLOADS_PATH: str = "./uploads"
    OUTPUTS_PATH: str = "./outputs"

    # SMTP (Optional, stubs if missing)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = False

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
