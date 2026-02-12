# MICSA OS - Main Application
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine

# Import routers
from app.api.endpoints import clientes, cotizaciones, proyectos, epp, dashboard, notifications, legal, empleados, compliance, firmas

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(
    clientes.router,
    prefix=f"{settings.API_V1_STR}/clientes",
    tags=["CRM - Clientes"]
)

app.include_router(
    cotizaciones.router,
    prefix=f"{settings.API_V1_STR}/cotizaciones",
    tags=["Comercial - Cotizaciones"]
)

app.include_router(
    proyectos.router,
    prefix=f"{settings.API_V1_STR}/proyectos",
    tags=["Operaciones - Proyectos"]
)

app.include_router(
    epp.router,
    prefix=f"{settings.API_V1_STR}/catalog/epp",
    tags=["Catálogos - EPP"]
)

app.include_router(
    dashboard.router,
    prefix=f"{settings.API_V1_STR}/dashboard",
    tags=["Dirección - Dashboard"]
)

app.include_router(
    notifications.router,
    prefix=f"{settings.API_V1_STR}/notifications",
    tags=["Servicios - Notificaciones"]
)

app.include_router(
    legal.router,
    prefix=f"{settings.API_V1_STR}/legal",
    tags=["Dirección - Legal"]
)

app.include_router(
    empleados.router, prefix="/api/v1/empleados", tags=["Empleados"])

app.include_router(
    compliance.router,
    prefix=f"{settings.API_V1_STR}/compliance",
    tags=["Contabilidad - Cumplimiento SEIL"]
)

app.include_router(
    firmas.router,
    prefix=f"{settings.API_V1_STR}/firmas",
    tags=["Contabilidad - Firmas Electrónicas"]
)


@app.get("/")
async def root():
    return {
        "message": "MICSA OS - Sistema ERP Industrial",
        "version": "1.0.0",
        "docs": f"{settings.API_V1_STR}/docs",
        "company": settings.EMPRESA_NOMBRE
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "app": settings.PROJECT_NAME}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
