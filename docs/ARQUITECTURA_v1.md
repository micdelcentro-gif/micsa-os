# MICSA OS v1.0 – ARQUITECTURA NEXT.JS + FASTAPI

> Versión: 1.0 — Febrero 2026

---

## ESTRUCTURA DE CARPETAS FINAL

```
micsa-os/
│
├── frontend/                          # Next.js 14 (App Router)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/               # Login, registro
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboard)/          # Todo el sistema
│   │   │   │   ├── layout.tsx         # Sidebar + Header + Notificaciones
│   │   │   │   ├── page.tsx           # Dashboard principal
│   │   │   │   │
│   │   │   │   ├── expedientes/       # 🆕 Sistema de expedientes
│   │   │   │   │   ├── page.tsx       # Buscador universal de expedientes
│   │   │   │   │   ├── [tipo]/        # proyecto, cliente, empleado, etc.
│   │   │   │   │   │   ├── page.tsx   # Lista de expedientes del tipo
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx  # Vista detallada del expediente
│   │   │   │   │
│   │   │   │   ├── proyectos/         # 🔄 Proyectos (ampliado)
│   │   │   │   │   ├── page.tsx       # Lista con filtros y pipeline
│   │   │   │   │   ├── nuevo/page.tsx # Crear proyecto (desde cotización)
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx   # Vista general + flujo maestro
│   │   │   │   │       ├── costos/page.tsx
│   │   │   │   │       ├── equipo/page.tsx      # Personal asignado
│   │   │   │   │       ├── seguridad/page.tsx   # Carpeta seg industrial
│   │   │   │   │       ├── bitacoras/page.tsx
│   │   │   │   │       └── cierre/page.tsx
│   │   │   │   │
│   │   │   │   ├── rh/                # 🆕 Recursos Humanos (ampliado)
│   │   │   │   │   ├── page.tsx       # Dashboard RH
│   │   │   │   │   ├── empleados/
│   │   │   │   │   │   ├── page.tsx   # Lista de empleados
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx        # Expediente completo
│   │   │   │   │   │       ├── contratos/page.tsx
│   │   │   │   │   │       ├── documentos/page.tsx
│   │   │   │   │   │       └── nomina/page.tsx
│   │   │   │   │   ├── nomina/
│   │   │   │   │   │   ├── page.tsx            # Periodos de nómina
│   │   │   │   │   │   └── [periodo]/page.tsx  # Detalle del periodo
│   │   │   │   │   └── capacitaciones/page.tsx
│   │   │   │   │
│   │   │   │   ├── seguridad/         # 🆕 Seguridad Industrial
│   │   │   │   │   ├── page.tsx       # Dashboard seguridad
│   │   │   │   │   ├── expedientes-cliente/
│   │   │   │   │   │   ├── page.tsx   # Lista por cliente
│   │   │   │   │   │   └── [id]/page.tsx  # Carpeta del cliente
│   │   │   │   │   ├── epp/page.tsx
│   │   │   │   │   └── formato9/page.tsx
│   │   │   │   │
│   │   │   │   ├── finanzas/          # 🆕 Administración y Finanzas
│   │   │   │   │   ├── page.tsx       # Dashboard financiero
│   │   │   │   │   ├── clientes/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── proveedores/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   ├── facturacion/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   └── nueva/page.tsx
│   │   │   │   │   ├── cobranza/page.tsx
│   │   │   │   │   ├── pagos/page.tsx
│   │   │   │   │   └── costos/page.tsx
│   │   │   │   │
│   │   │   │   ├── contabilidad/      # 🔄 Contabilidad (nativa)
│   │   │   │   │   ├── page.tsx       # Hub contable
│   │   │   │   │   ├── catalogo/page.tsx
│   │   │   │   │   ├── polizas/page.tsx
│   │   │   │   │   ├── libro-diario/page.tsx
│   │   │   │   │   ├── balanza/page.tsx
│   │   │   │   │   ├── estados-financieros/page.tsx
│   │   │   │   │   ├── bancos/page.tsx
│   │   │   │   │   └── tesoreria/page.tsx
│   │   │   │   │
│   │   │   │   ├── legal/             # 🆕 Legal
│   │   │   │   │   ├── page.tsx       # Dashboard legal
│   │   │   │   │   └── [id]/page.tsx  # Expediente legal
│   │   │   │   │
│   │   │   │   ├── riesgo/            # 🆕 Riesgo y Pólizas
│   │   │   │   │   ├── page.tsx       # Dashboard riesgo
│   │   │   │   │   ├── polizas/page.tsx
│   │   │   │   │   ├── vehiculos/page.tsx
│   │   │   │   │   └── siniestros/page.tsx
│   │   │   │   │
│   │   │   │   ├── ventas/            # 🔄 Ventas / CRM
│   │   │   │   │   ├── page.tsx       # Pipeline de ventas
│   │   │   │   │   ├── cotizaciones/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── nueva/page.tsx
│   │   │   │   │   │   └── [id]/page.tsx
│   │   │   │   │   └── clientes/page.tsx
│   │   │   │   │
│   │   │   │   ├── documentos/        # 🆕 Generador de Documentos
│   │   │   │   │   ├── page.tsx       # Lista de docs generados
│   │   │   │   │   ├── plantillas/page.tsx
│   │   │   │   │   ├── generar/page.tsx
│   │   │   │   │   └── firmar/[token]/page.tsx  # Firma por token
│   │   │   │   │
│   │   │   │   ├── repse/             # 🆕 REPSE
│   │   │   │   │   ├── page.tsx       # Dashboard REPSE
│   │   │   │   │   └── [mes]/page.tsx # Carpeta mensual
│   │   │   │   │
│   │   │   │   ├── auditoria/         # 🆕 Auditoría
│   │   │   │   │   ├── page.tsx       # Log de auditoría
│   │   │   │   │   └── gates/page.tsx # Gates activos y evaluaciones
│   │   │   │   │
│   │   │   │   ├── data-tools/        # 🆕 Data & Tools
│   │   │   │   │   ├── page.tsx       # Importador Excel
│   │   │   │   │   └── inventario/page.tsx
│   │   │   │   │
│   │   │   │   ├── configuracion/     # 🆕 Config del sistema
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── usuarios/page.tsx
│   │   │   │   │   ├── roles/page.tsx
│   │   │   │   │   └── gates/page.tsx  # Configurar gates
│   │   │   │   │
│   │   │   │   │── legacy/            # ✅ Módulos legacy (iframe)
│   │   │   │   │   └── [module]/page.tsx
│   │   │   │   │
│   │   │   │   ├── reporte-diario/    # ✅ Ya existe
│   │   │   │   ├── packing-list/      # ✅ Ya existe
│   │   │   │   ├── sistema-etiquetado/# ✅ Ya existe
│   │   │   │   ├── matriz-iso/        # ✅ Ya existe
│   │   │   │   ├── guia-iso/          # ✅ Ya existe
│   │   │   │   ├── capacitaciones/    # ✅ Ya existe
│   │   │   │   └── trabajadores/      # ✅ Ya existe
│   │   │   │
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                    # Componentes base
│   │   │   │   ├── Card.tsx           # ✅ Ya existe
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Alert.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Timeline.tsx       # 🆕 Para flujo maestro
│   │   │   │   ├── FileUpload.tsx     # 🆕 Para documentos
│   │   │   │   ├── SignatureCanvas.tsx # 🆕 Para firmas
│   │   │   │   ├── GateAlert.tsx      # 🆕 Alerta de bloqueo
│   │   │   │   └── ProgressBar.tsx    # 🆕 Para expedientes
│   │   │   │
│   │   │   ├── dashboard/             # ✅ Ya existe
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── BorradoresGuardados.tsx
│   │   │   │   └── KPIGrid.tsx        # 🆕 KPIs de DG
│   │   │   │
│   │   │   ├── expedientes/           # 🆕
│   │   │   │   ├── ExpedienteCard.tsx
│   │   │   │   ├── ExpedienteTimeline.tsx
│   │   │   │   └── DocumentChecklist.tsx
│   │   │   │
│   │   │   ├── proyectos/             # 🆕
│   │   │   │   ├── FlujoMaestro.tsx    # 17 pasos visual
│   │   │   │   ├── CostosTable.tsx
│   │   │   │   └── EquipoList.tsx
│   │   │   │
│   │   │   ├── rh/                    # 🆕
│   │   │   │   ├── EmpleadoForm.tsx
│   │   │   │   ├── ContratoViewer.tsx
│   │   │   │   └── NominaCalc.tsx
│   │   │   │
│   │   │   └── documentos/            # 🆕
│   │   │       ├── PDFPreview.tsx
│   │   │       ├── FirmaModal.tsx
│   │   │       └── PlantillaEditor.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── api.ts                 # ✅ Ya existe
│   │   │   ├── auth.ts                # 🆕 JWT client-side
│   │   │   ├── gates.ts               # 🆕 Gate evaluation client
│   │   │   └── utils.ts               # ✅ Ya existe
│   │   │
│   │   ├── types/
│   │   │   ├── user.ts                # ✅ Ya existe (ampliar)
│   │   │   ├── employee.ts            # ✅ Ya existe (ampliar)
│   │   │   ├── proyecto.ts            # 🆕
│   │   │   ├── cliente.ts             # 🆕
│   │   │   ├── proveedor.ts           # 🆕
│   │   │   ├── legal.ts               # 🆕
│   │   │   ├── riesgo.ts              # 🆕
│   │   │   ├── factura.ts             # 🆕
│   │   │   ├── nomina.ts              # 🆕
│   │   │   ├── documento.ts           # 🆕
│   │   │   ├── gate.ts                # 🆕
│   │   │   └── expediente.ts          # 🆕
│   │   │
│   │   └── hooks/                     # 🆕
│   │       ├── useAuth.ts
│   │       ├── useGates.ts
│   │       ├── useNotifications.ts
│   │       └── useExpediente.ts
│   │
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                           # FastAPI + SQLAlchemy
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                    # ✅ Ya existe (ampliar routers)
│   │   │
│   │   ├── core/
│   │   │   ├── config.py              # ✅ Ya existe
│   │   │   ├── database.py            # ✅ Ya existe
│   │   │   ├── security.py            # 🆕 JWT + password hashing
│   │   │   ├── permissions.py         # 🆕 RBAC middleware
│   │   │   └── audit.py               # 🆕 Audit log decorator
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py            # ✅ Ya existe (ampliar imports)
│   │   │   ├── user.py                # ✅ Ya existe (ampliar)
│   │   │   ├── cliente.py             # ✅ Ya existe (ampliar)
│   │   │   ├── cotizacion.py          # ✅ Ya existe (ampliar)
│   │   │   ├── proyecto.py            # ✅ Ya existe (ampliar)
│   │   │   ├── epp.py                 # ✅ Ya existe
│   │   │   ├── empleado.py            # 🆕
│   │   │   ├── proveedor.py           # 🆕
│   │   │   ├── legal.py               # 🆕
│   │   │   ├── riesgo.py              # 🆕
│   │   │   ├── seguridad.py           # 🆕
│   │   │   ├── factura.py             # 🆕
│   │   │   ├── nomina.py              # 🆕
│   │   │   ├── contabilidad.py        # 🆕
│   │   │   ├── documento.py           # 🆕
│   │   │   ├── gate.py                # 🆕
│   │   │   ├── repse.py               # 🆕
│   │   │   ├── audit.py               # 🆕
│   │   │   └── notificacion.py        # 🆕
│   │   │
│   │   ├── schemas/                   # Pydantic validation
│   │   │   ├── (misma estructura que models)
│   │   │   └── ...
│   │   │
│   │   ├── services/                  # Lógica de negocio
│   │   │   ├── gate_service.py        # 🆕 Motor de gates
│   │   │   ├── flow_service.py        # 🆕 Flujo maestro (state machine)
│   │   │   ├── document_service.py    # 🆕 Generador de PDFs
│   │   │   ├── notification_service.py# 🔄 Notificaciones reales
│   │   │   ├── nomina_service.py      # 🆕 Cálculo ISR/IMSS
│   │   │   ├── sicofi_service.py      # 🆕 Timbrado
│   │   │   ├── repse_service.py       # 🆕 Carpetas mensuales
│   │   │   └── audit_service.py       # 🆕 Registro auditoría
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                # 🆕 Dependencias comunes (get_current_user, etc.)
│   │   │   └── endpoints/
│   │   │       ├── auth.py            # 🆕 Login/register/refresh
│   │   │       ├── clientes.py        # ✅ Ya existe (ampliar)
│   │   │       ├── cotizaciones.py    # ✅ Ya existe
│   │   │       ├── proyectos.py       # ✅ Ya existe (ampliar)
│   │   │       ├── epp.py             # ✅ Ya existe
│   │   │       ├── dashboard.py       # ✅ Ya existe (ampliar)
│   │   │       ├── notifications.py   # ✅ Ya existe (ampliar)
│   │   │       ├── empleados.py       # 🆕
│   │   │       ├── proveedores.py     # 🆕
│   │   │       ├── legal.py           # 🆕
│   │   │       ├── riesgo.py          # 🆕
│   │   │       ├── seguridad.py       # 🆕
│   │   │       ├── facturas.py        # 🆕
│   │   │       ├── nomina.py          # 🆕
│   │   │       ├── contabilidad.py    # 🆕
│   │   │       ├── documentos.py      # 🆕
│   │   │       ├── gates.py           # 🆕
│   │   │       ├── repse.py           # 🆕
│   │   │       ├── audit.py           # 🆕
│   │   │       └── data_tools.py      # 🆕
│   │   │
│   │   └── templates/                 # 🆕 HTML templates para PDFs
│   │       ├── reporte_diario.html
│   │       ├── acta_cierre.html
│   │       ├── contrato_laboral.html
│   │       ├── nda.html
│   │       ├── no_competencia.html
│   │       ├── cotizacion.html
│   │       └── expediente_repse.html
│   │
│   ├── alembic/                       # 🆕 Migraciones
│   │   ├── env.py
│   │   ├── versions/
│   │   └── alembic.ini
│   │
│   ├── tests/                         # 🆕 Tests
│   │   ├── test_auth.py
│   │   ├── test_gates.py
│   │   ├── test_empleados.py
│   │   ├── test_proyectos.py
│   │   └── test_flow.py
│   │
│   ├── uploads/                       # 🆕 Archivos subidos
│   │   ├── documentos/
│   │   ├── firmas/
│   │   └── facturas/
│   │
│   ├── requirements.txt               # ✅ Ya existe (ampliar)
│   ├── Dockerfile                     # ✅ Ya existe
│   └── micsa_os.db                    # ✅ Ya existe
│
├── legacy/                            # ✅ Módulos existentes (iframe)
│   ├── reporte-digital/
│   └── scripts/
│
├── docs/                              # 📖 Documentación
│   ├── MICSA_OS_v1_Integracion_Total.md
│   ├── DATABASE_SCHEMA_v1.md
│   ├── BACKLOG_TECNICO_v1.md
│   └── ARQUITECTURA_v1.md            # (este archivo)
│
├── docker-compose.yml                 # ✅ Ya existe (ampliar)
└── README.md                          # ✅ Ya existe
```

---

## DIAGRAMA DE FLUJO DE DATOS

```
                                    ┌─────────────────┐
                                    │   DIRECCIÓN (DG) │
                                    │   Dashboard +    │
                                    │   Autorizaciones  │
                                    └────────┬────────┘
                                             │ Autoriza / Desbloquea
                    ┌────────────────────────┼────────────────────────┐
                    │                        │                        │
          ┌─────────▼──────┐      ┌─────────▼──────┐      ┌─────────▼──────┐
          │   PROYECTOS    │      │   FINANZAS      │      │     LEGAL      │
          │   Levantamiento│      │   Facturación   │      │   Demandas     │
          │   Cotización   │      │   Cobranza      │      │   Contratos    │
          │   Planeación   │      │   Pagos         │      │   Riesgo       │
          │   Ejecución    │      │   Costos        │      │   Provisiones  │
          └──┬──────┬──────┘      └────────┬────────┘      └────────────────┘
             │      │                      │
    ┌────────▼──┐ ┌─▼────────────┐ ┌──────▼───────┐
    │    RH     │ │  SEGURIDAD   │ │ CONTABILIDAD │
    │ Empleados │ │ Carpetas CLI │ │ Pólizas      │
    │ Contratos │ │ EPP          │ │ Libro diario │
    │ Nómina    │ │ Formato 9    │ │ Bancos       │
    │ NDA       │ │ Accesos      │ │ EEFF         │
    └─────┬─────┘ └──────┬───────┘ └──────┬───────┘
          │              │                │
          └──────────────┼────────────────┘
                         │
               ┌─────────▼─────────┐
               │  GENERADOR DOCS   │
               │  Consolida        │
               │  Versiona         │
               │  Firma            │
               │  PDF              │
               └─────────┬─────────┘
                         │
               ┌─────────▼─────────┐
               │   MOTOR DE GATES  │
               │   Evalúa reglas   │
               │   Bloquea/Permite │
               │   Notifica        │
               │   Audita          │
               └─────────┬─────────┘
                         │
               ┌─────────▼─────────┐
               │   AUDIT LOG       │
               │   Todo queda      │
               │   registrado      │
               └───────────────────┘
```

---

## APIs POR MÓDULO

### Auth

```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
GET    /api/v1/auth/me
POST   /api/v1/auth/refresh
```

### Empleados

```
GET    /api/v1/empleados
POST   /api/v1/empleados
GET    /api/v1/empleados/{id}
PUT    /api/v1/empleados/{id}
DELETE /api/v1/empleados/{id}
GET    /api/v1/empleados/{id}/documentos
POST   /api/v1/empleados/{id}/documentos
POST   /api/v1/empleados/{id}/asignar-proyecto
GET    /api/v1/empleados/{id}/expediente    # Expediente completo
```

### Proyectos (ampliado)

```
GET    /api/v1/proyectos
POST   /api/v1/proyectos
GET    /api/v1/proyectos/{id}
PUT    /api/v1/proyectos/{id}
POST   /api/v1/proyectos/{id}/avanzar-paso  # Flujo maestro
GET    /api/v1/proyectos/{id}/costos
POST   /api/v1/proyectos/{id}/costos
GET    /api/v1/proyectos/{id}/equipo
GET    /api/v1/proyectos/{id}/seguridad
GET    /api/v1/proyectos/{id}/timeline
```

### Legal

```
GET    /api/v1/legal
POST   /api/v1/legal
GET    /api/v1/legal/{id}
PUT    /api/v1/legal/{id}
POST   /api/v1/legal/{id}/movimientos
GET    /api/v1/legal/dashboard
```

### Riesgo / Pólizas

```
GET    /api/v1/riesgo/polizas
POST   /api/v1/riesgo/polizas
GET    /api/v1/riesgo/vehiculos
POST   /api/v1/riesgo/vehiculos
GET    /api/v1/riesgo/siniestros
GET    /api/v1/riesgo/por-vencer
GET    /api/v1/riesgo/dashboard
```

### Gates

```
GET    /api/v1/gates                         # Todos los gates
POST   /api/v1/gates/evaluar                 # Evaluar gate específico
POST   /api/v1/gates/{id}/desbloquear        # Solo DG
GET    /api/v1/gates/bloqueados              # Gates actualmente bloqueados
GET    /api/v1/gates/evaluaciones            # Historial
```

### Documentos

```
GET    /api/v1/documentos/plantillas
POST   /api/v1/documentos/generar
GET    /api/v1/documentos/{id}/pdf
POST   /api/v1/documentos/{id}/enviar-firma
POST   /api/v1/documentos/firmar/{token}
GET    /api/v1/documentos/{id}/versiones
```

### REPSE

```
GET    /api/v1/repse/carpetas
POST   /api/v1/repse/generar/{anio}/{mes}
GET    /api/v1/repse/carpeta/{id}
POST   /api/v1/repse/carpeta/{id}/enviar
GET    /api/v1/repse/dashboard
```

### Auditoría

```
GET    /api/v1/audit                         # Con filtros
GET    /api/v1/audit/usuario/{id}
GET    /api/v1/audit/modulo/{modulo}
GET    /api/v1/audit/entidad/{tipo}/{id}
```

---

## TECNOLOGÍAS ADICIONALES REQUERIDAS

| Necesidad | Librería | Uso |
|-----------|----------|-----|
| JWT Auth | `python-jose[cryptography]` | Tokens |
| Password | `passlib[bcrypt]` | Hash de contraseñas |
| Migraciones | `alembic` | Control de schema |
| PDF | `weasyprint` o `pdfkit` | Generación de PDFs |
| Templates | `jinja2` | Templates HTML→PDF |
| Excel | `openpyxl` | Import/export Excel |
| Upload | `python-multipart` | Archivos |
| Email | `fastapi-mail` | Notificaciones |
| WebSocket | `fastapi` (nativo) | Tiempo real |

---

*Este documento define la arquitectura completa del sistema.*
*Actualizar conforme se agreguen nuevas funcionalidades.*
