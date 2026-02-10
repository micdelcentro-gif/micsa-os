# MICSA OS - Dashboard Schemas
from pydantic import BaseModel

class CEODashboardResponse(BaseModel):
    quotes: int
    projects: int
    proyectosActivos: int
    proyectosCerrados: int
    totalCotizado: float
    totalUtilidad: float
    marginPromedio: float
    cierresBloqueados: int
