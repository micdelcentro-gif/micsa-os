# MICSA OS - Dashboard Endpoints
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.cotizacion import Cotizacion
from app.models.proyecto import Proyecto, FirmaRequest

from app.schemas.dashboard import CEODashboardResponse

router = APIRouter()

@router.get("/ceo", response_model=CEODashboardResponse)
def get_ceo_dashboard(db: Session = Depends(get_db)):
    total_cotizado = db.query(func.sum(Cotizacion.total)).scalar() or 0
    # Utilidad is stored in internal_data JSON, harder to sum in SQL directly with SQLite easily
    # Let's do a simple loop for now or store it as a column if needed
    quotes = db.query(Cotizacion).all()
    total_utilidad = sum([q.internal_data.get("totals", {}).get("grossProfitBeforeIva", 0) for q in quotes if q.internal_data])
    
    proyectos_activos = db.query(Proyecto).filter(Proyecto.status == "ACTIVE").count()
    proyectos_cerrados = db.query(Proyecto).filter(Proyecto.status == "CLOSED").count()
    
    # Cierres bloqueados: proyectos activos con firmas pendientes
    proyectos = db.query(Proyecto).filter(Proyecto.status == "ACTIVE").all()
    cierres_bloqueados = 0
    for p in proyectos:
        pending = db.query(FirmaRequest).filter(FirmaRequest.proyecto_id == p.id, FirmaRequest.status == "PENDING").count()
        if pending > 0:
            cierres_bloqueados += 1

    return {
        "quotes": len(quotes),
        "projects": proyectos_activos + proyectos_cerrados,
        "proyectosActivos": proyectos_activos,
        "proyectosCerrados": proyectos_cerrados,
        "totalCotizado": round(total_cotizado, 2),
        "totalUtilidad": round(total_utilidad, 2),
        "marginPromedio": round((total_utilidad / total_cotizado * 100), 2) if total_cotizado > 0 else 0.0,
        "cierresBloqueados": cierres_bloqueados
    }
