# MICSA OS - Cotización Endpoints
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.cotizacion import Cotizacion
from app.models.epp import EppItem
from app.schemas.cotizacion import QuoteCreate, QuoteResponse
from app.services.calculator import QuotationCalculator
from app.core.config import settings

router = APIRouter()

# Default rules as seen in reproduce_issue.js
DEFAULT_RULES = {
    "labor": {"weekly": 6489.25, "weeksMonth": 4},
    "welding": {"per10Month": {"cost": 18446.96, "price": 21213}},
    "weldingConsumablesPerWelderMonth": 3800,
    "dc3": {"sell": 500, "package": 1500, "cost": 100},
    "medical": {"cost": 250, "sell": 350},
    "managementPct": 0.15,
    "platformPM": {"feePerPersonMonth": 180},
    "iso": {"feePerProjectMonth": 3500},
    "commercialization": {"defaultMarginPct": 0.20},
    "epp": {"markupPct": 0.25, "workingDaysMonth": 26}
}

@router.post("/", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def create_quote(quote_in: QuoteCreate, db: Session = Depends(get_db)):
    # 1. Fetch EPP catalog for calculation
    epp_items = db.query(EppItem).all()
    catalog_epp = {it.sku: it for it in epp_items}
    
    # 2. Run calculator
    calc = QuotationCalculator(rules=DEFAULT_RULES, catalog_epp=catalog_epp)
    result = calc.compute(quote_in.dict())
    
    # 3. Save to DB
    db_quote = Cotizacion(
        nombre_proyecto=quote_in.projectName,
        ubicacion=quote_in.location,
        tipo_trabajo=quote_in.workType,
        duracion_meses=quote_in.durationMonths,
        condiciones_pago=quote_in.paymentTerms,
        input_data=quote_in.dict(),
        client_quote=result["clientQuote"],
        internal_data=result["internal"],
        subtotal=result["totals"]["subtotal"],
        iva=result["totals"]["iva"],
        total=result["totals"]["total"],
        status="DRAFT"
    )
    db.add(db_quote)
    db.commit()
    db.refresh(db_quote)
    
    # Map to schema response
    return {
        "id": db_quote.id,
        "createdAt": db_quote.created_at,
        "status": db_quote.status,
        "input_data": db_quote.input_data,
        "clientQuote": db_quote.client_quote,
        "internal_data": db_quote.internal_data,
        "totals": {
            "subtotal": db_quote.subtotal,
            "iva": db_quote.iva,
            "total": db_quote.total
        }
    }

@router.get("/", response_model=List[QuoteResponse])
def list_quotes(db: Session = Depends(get_db)):
    quotes = db.query(Cotizacion).all()
    # Need to map to schema because DB fields names slightly differ from schema names
    results = []
    for q in quotes:
        results.append({
            "id": q.id,
            "createdAt": q.created_at,
            "status": q.status,
            "input_data": q.input_data,
            "clientQuote": q.client_quote,
            "internal_data": q.internal_data,
            "totals": {
                "subtotal": q.subtotal,
                "iva": q.iva,
                "total": q.total
            }
        })
    return results

@router.get("/{quote_id}", response_model=QuoteResponse)
def get_quote(quote_id: str, db: Session = Depends(get_db)):
    q = db.query(Cotizacion).filter(Cotizacion.id == quote_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Quotation not found")
    return {
        "id": q.id,
        "createdAt": q.created_at,
        "status": q.status,
        "input_data": q.input_data,
        "clientQuote": q.client_quote,
        "internal_data": q.internal_data,
        "totals": {
            "subtotal": q.subtotal,
            "iva": q.iva,
            "total": q.total
        }
    }