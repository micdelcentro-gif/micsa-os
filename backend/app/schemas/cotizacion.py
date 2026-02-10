# MICSA OS - Quotation Schemas
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
from datetime import datetime

class QuoteEPP(BaseModel):
    enabled: bool = True

class QuoteMedical(BaseModel):
    enabled: bool = True

class QuotePlatformPM(BaseModel):
    enabled: bool = True

class QuoteISO(BaseModel):
    enabled: bool = True

class CommItem(BaseModel):
    description: str
    qty: float
    unit: str = "pz"
    vendorCost: float
    marginPct: Optional[float] = None

class QuoteCommercialization(BaseModel):
    enabled: bool = False
    items: List[CommItem] = []

class QuoteLogistics(BaseModel):
    enabled: bool = False
    travelPeopleCount: int = 0
    hotelNights: int = 0
    perDiemDays: int = 0
    roundTripTravelPerPerson: float = 6342.0
    hotelPerNight: float = 1200.0
    peoplePerRoom: int = 2
    perDiemPerDay: float = 350.0

class QuoteCreate(BaseModel):
    clientName: str
    projectName: str
    location: str
    workType: str
    durationMonths: float = 1.0
    paymentTerms: str = "NETO 30"
    
    peopleByRole: Dict[str, float] = {}
    weldersCount: int = 0
    
    dc3PeopleCount: int = 0
    dc3PackageCount: int = 0
    
    medical: QuoteMedical = Field(default_factory=QuoteMedical)
    epp: QuoteEPP = Field(default_factory=QuoteEPP)
    platformPM: QuotePlatformPM = Field(default_factory=QuotePlatformPM)
    iso: QuoteISO = Field(default_factory=QuoteISO)
    
    commercialization: QuoteCommercialization = Field(default_factory=QuoteCommercialization)
    logistics: QuoteLogistics = Field(default_factory=QuoteLogistics)
    
    assumptions: List[str] = []
    exclusions: List[str] = []

class QuoteResponse(BaseModel):
    id: str
    createdAt: datetime
    status: str
    input_data: Dict[str, Any]
    clientQuote: Dict[str, Any]
    internal_data: Dict[str, Any]
    totals: Dict[str, float]

    class Config:
        from_attributes = True
