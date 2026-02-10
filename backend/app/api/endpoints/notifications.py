# MICSA OS - Notifications Endpoints
from fastapi import APIRouter
from pydantic import BaseModel
from app.services.notifications import NotificationService

router = APIRouter()

class EmailRequest(BaseModel):
    to: str
    subject: str
    body: str

class WhatsAppRequest(BaseModel):
    to: str
    message: str

@router.post("/email")
def send_email(req: EmailRequest):
    success = NotificationService.send_email(req.to, req.subject, req.body)
    return {"ok": success}

@router.post("/whatsapp")
def send_whatsapp(req: WhatsAppRequest):
    success = NotificationService.send_whatsapp_stub(req.to, req.message)
    return {"ok": success}
