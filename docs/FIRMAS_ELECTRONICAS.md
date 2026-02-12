# Sistema de Firmas Electrónicas MICSA OS

## 📋 Descripción

Sistema completo de gestión de firmas electrónicas integrado en MICSA OS, similar a WeeTrust, que permite:

- ✍️ Firmar documentos de forma electrónica
- 📄 Gestión de documentos PDF
- 👥 Múltiples firmantes por documento
- 📧 Notificaciones automáticas
- 🔒 Auditoría completa de firmas
- 📊 Dashboard administrativo

## 🚀 Características Implementadas

### Backend (FastAPI)
- ✅ Modelos de base de datos (DocumentoFirma, Firmante, HistorialFirma)
- ✅ Endpoints REST completos
- ✅ Sistema de tokens únicos para firmantes
- ✅ Auditoría de acciones
- ✅ Estadísticas en tiempo real

### Frontend (Next.js)
- ✅ Panel administrativo (`/firmas-electronicas`)
- ✅ Interfaz pública de firma (`/firmar/[token]`)
- ✅ Visor de PDF integrado
- ✅ Canvas para dibujar firma
- ✅ Firma tipográfica
- ✅ Seguimiento de estado en tiempo real

## 📁 Estructura de Archivos

```
backend/
├── app/
│   ├── models/
│   │   └── firma_electronica.py       # Modelos de BD
│   ├── schemas/
│   │   └── firma_electronica.py       # Schemas Pydantic
│   └── api/endpoints/
│       └── firmas.py                  # Endpoints API
│
frontend/
├── src/app/
│   ├── (dashboard)/
│   │   └── firmas-electronicas/
│   │       └── page.tsx               # Panel admin
│   └── firmar/
│       └── [token]/
│           └── page.tsx               # Interfaz pública
│
docs/
└── firmas_electronicas/               # PDFs almacenados
```

## 🔧 Endpoints API

### Administrativos
- `GET /api/v1/firmas/stats` - Estadísticas del sistema
- `GET /api/v1/firmas/` - Listar documentos
- `POST /api/v1/firmas/` - Crear documento (multipart/form-data)
- `GET /api/v1/firmas/{id}` - Detalles de documento
- `PUT /api/v1/firmas/{id}` - Actualizar documento
- `POST /api/v1/firmas/{id}/notify` - Notificar firmantes
- `GET /api/v1/firmas/{id}/download` - Descargar PDF firmado

### Públicos (con token)
- `GET /api/v1/firmas/public/{token}` - Ver documento
- `GET /api/v1/firmas/public/{token}/pdf` - Descargar PDF
- `POST /api/v1/firmas/public/{token}/firmar` - Registrar firma

## 🎨 Flujo de Uso

### 1. Crear Documento
```typescript
// Admin crea documento con firmantes
const formData = new FormData()
formData.append('file', pdfFile)
formData.append('titulo', 'Contrato de Servicios')
formData.append('firmantes_json', JSON.stringify([
  { nombre: 'Juan Pérez', email: 'juan@example.com', puesto: 'Director' },
  { nombre: 'María López', email: 'maria@example.com', puesto: 'Gerente' }
]))

await fetch('/api/v1/firmas/', { method: 'POST', body: formData })
```

### 2. Notificar Firmantes
```typescript
// Enviar emails con enlaces únicos
await fetch(`/api/v1/firmas/${docId}/notify`, { method: 'POST' })
// Cada firmante recibe: https://micsa.com/firmar/{token-unico}
```

### 3. Firmar Documento
```typescript
// Firmante accede con su token y firma
await fetch(`/api/v1/firmas/public/${token}/firmar`, {
  method: 'POST',
  body: JSON.stringify({
    firma_imagen: canvasDataURL,
    firma_tipo: 'dibujada',
    metadata: { navegador: '...', ip: '...' }
  })
})
```

## 🔐 Integración con Adobe Acrobat (Próximamente)

### Preparación para Adobe Sign API

Una vez que tengas la licencia de Adobe Acrobat, podrás integrar:

#### 1. Configuración de Credenciales
```python
# backend/app/core/config.py
ADOBE_CLIENT_ID = os.getenv("ADOBE_CLIENT_ID")
ADOBE_CLIENT_SECRET = os.getenv("ADOBE_CLIENT_SECRET")
ADOBE_API_URL = "https://api.na1.adobesign.com/api/rest/v6"
```

#### 2. Servicio de Adobe Sign
```python
# backend/app/services/adobe_sign.py
import requests

class AdobeSignService:
    def __init__(self):
        self.access_token = self.get_access_token()
    
    def get_access_token(self):
        # OAuth2 flow
        pass
    
    def create_agreement(self, pdf_path, signers):
        """Crear acuerdo en Adobe Sign"""
        # Upload document
        # Add signers
        # Send for signature
        pass
    
    def get_agreement_status(self, agreement_id):
        """Verificar estado de firma"""
        pass
    
    def download_signed_pdf(self, agreement_id):
        """Descargar PDF firmado"""
        pass
```

#### 3. Actualizar Endpoint de Creación
```python
# En firmas.py
from app.services.adobe_sign import AdobeSignService

@router.post("/")
async def create_documento(...):
    # ... código existente ...
    
    # Integrar con Adobe Sign
    adobe_service = AdobeSignService()
    agreement_id = adobe_service.create_agreement(
        pdf_path=filepath,
        signers=[{
            "email": f.email,
            "name": f.nombre
        } for f in firmantes_data]
    )
    
    documento.adobe_agreement_id = agreement_id
    # ...
```

#### 4. Webhook para Actualizaciones
```python
@router.post("/webhook/adobe")
async def adobe_webhook(payload: dict):
    """Recibir notificaciones de Adobe Sign"""
    if payload["event"] == "AGREEMENT_SIGNED":
        agreement_id = payload["agreementId"]
        # Actualizar estado en BD
        # Descargar PDF firmado
        pass
```

### Ventajas de Adobe Sign

- ✅ Firmas con validez legal certificada
- ✅ Cumplimiento con eIDAS, ESIGN Act
- ✅ Firma electrónica avanzada (e.firma/SAT)
- ✅ Certificados digitales
- ✅ Sellado de tiempo
- ✅ Trazabilidad completa

## 📧 Integración de Email (Pendiente)

Para enviar notificaciones, integra un servicio de email:

```python
# backend/app/services/email.py
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

def send_signature_request(firmante_email, token, documento_titulo):
    message = Mail(
        from_email='noreply@micsadelcentro.com',
        to_emails=firmante_email,
        subject=f'Firma requerida: {documento_titulo}',
        html_content=f'''
            <h2>Tienes un documento pendiente de firma</h2>
            <p>Haz clic en el siguiente enlace para firmar:</p>
            <a href="https://micsa.com/firmar/{token}">Firmar Documento</a>
        '''
    )
    
    sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
    response = sg.send(message)
    return response.status_code
```

## 🎯 Próximos Pasos

1. **Inmediato:**
   - ✅ Sistema base implementado
   - ⏳ Probar creación de documentos
   - ⏳ Probar flujo de firma

2. **Cuando tengas Adobe Acrobat:**
   - Obtener credenciales API de Adobe
   - Implementar `AdobeSignService`
   - Configurar webhooks
   - Migrar documentos existentes

3. **Mejoras Futuras:**
   - Firma biométrica (tablet/móvil)
   - Reconocimiento facial
   - Firma en lote
   - Plantillas de documentos
   - Integración con WhatsApp

## 🔍 Testing

### Crear Documento de Prueba
```bash
# 1. Iniciar backend
cd backend && ../venv/bin/uvicorn app.main:app --reload --port 8000

# 2. Iniciar frontend
cd frontend && npm run dev

# 3. Acceder a http://localhost:3001/firmas-electronicas
# 4. Crear nuevo documento con PDF de prueba
# 5. Copiar enlace de firma del firmante
# 6. Abrir en navegador privado para simular firmante
```

## 📞 Soporte

Para dudas sobre la integración de Adobe Acrobat:
- Documentación: https://www.adobe.io/apis/documentcloud/sign.html
- Soporte: https://helpx.adobe.com/sign/using/api-documentation.html

---

**Desarrollado para MICSA del Centro** 🏗️
Sistema de Firmas Electrónicas v1.0
