# MICSA OS v1.0 – BACKLOG TÉCNICO DE DESARROLLO

> Versión: 1.0 — Febrero 2026
> Metodología: Sprints de 2 semanas
> Stack: Next.js (frontend) + FastAPI/SQLAlchemy (backend) + SQLite→PostgreSQL (DB)

---

## REGLAS PARA EL PROGRAMADOR

1. **Leer primero**: `MICSA_OS_v1_Integracion_Total.md` y `DATABASE_SCHEMA_v1.md`
2. **No inventar campos**: Usar exactamente el schema definido
3. **Todo es auditable**: Cada acción relevante → `audit_log`
4. **Gates primero**: Antes de crear funcionalidad, implementar el gate correspondiente
5. **PDF siempre**: Todo resultado debe poder exportarse a PDF
6. **Tests**: Cada endpoint con al menos un test de happy path y un test de gate bloqueado

---

## SPRINT 0 – INFRAESTRUCTURA (Semana 1-2)

**Objetivo:** Base sólida para todo lo demás.

### S0-01: Migración de base de datos con Alembic

- **Qué:** Configurar Alembic para migraciones incrementales
- **Por qué:** No podemos seguir haciendo `create_all`, necesitamos control de schema
- **Archivos:** `backend/alembic.ini`, `backend/alembic/`, `backend/alembic/env.py`
- **Criterio:** `alembic upgrade head` crea todas las tablas
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 4 hrs

### S0-02: Sistema de autenticación JWT

- **Qué:** Login, registro, tokens JWT, middleware de auth
- **Esquema:** `users` (ampliar con apellido, área, último_acceso)
- **Endpoints:** `POST /auth/login`, `POST /auth/register`, `GET /auth/me`, `POST /auth/refresh`
- **Middleware:** Verificar token en cada request protegido
- **Criterio:** Login funcional, token se valida, roles se respetan
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 8 hrs

### S0-03: Sistema de roles y permisos (RBAC)

- **Qué:** Tabla `roles_permisos`, middleware que verifica por módulo+acción
- **Roles iniciales:** ADMIN, DG, PRO, RH, SEG, ADM, CON, LEGAL, RSK, VTA, CALIDAD, OPERADOR
- **Decorator:** `@require_permission("modulo", "accion")` en cada endpoint
- **Criterio:** Endpoint protegido devuelve 403 si el rol no tiene permiso
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 6 hrs

### S0-04: Audit Log automático

- **Qué:** Tabla `audit_log` + middleware/decorator que registra acciones
- **Decorator:** `@audit("ACCION", "modulo")` que captura before/after
- **Qué registra:** Todo create, update, delete + desbloqueos + autorizaciones
- **Criterio:** Cualquier cambio de datos aparece en audit_log con antes/después
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 4 hrs

### S0-05: Motor de Gates (Sistema de Bloqueos)

- **Qué:** Tablas `gates` + `gate_evaluaciones`, servicio `GateService`
- **API:** `GateService.evaluar(entidad_tipo, entidad_id, accion)` → Aprobado/Bloqueado
- **Seed:** Los 13 gates predefinidos del schema
- **Desbloqueo DG:** Endpoint especial para DG con motivo obligatorio → audit_log
- **Criterio:** Gate bloqueado devuelve 423 con mensaje específico
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 12 hrs

### S0-06: Notificaciones en tiempo real

- **Qué:** Tabla `notificaciones` + WebSocket o polling
- **Triggers:** Gate bloqueado → notifica, Póliza por vencer → notifica, Aprobación pendiente → notifica
- **Frontend:** Bell icon en header con badge de no leídas
- **Criterio:** Notificación llega en <5 segundos
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 8 hrs

---

## SPRINT 1 – EXPEDIENTES CORE (Semana 3-4)

**Objetivo:** Los 3 expedientes más usados funcionando con gates.

### S1-01: Modelo y CRUD de Empleados

- **Tabla:** `empleados` completa
- **Endpoints:** CRUD completo + búsqueda + filtros
- **Frontend:** Lista de empleados, formulario de alta/edición, vista de expediente
- **Gates activos:** GATE-RH-001 a GATE-RH-005
- **Criterio:** Empleado sin contrato no puede tener nómina
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 16 hrs

### S1-02: Documentos de empleado (contratos, NDA, no competencia)

- **Tablas:** `documentos_empleado`
- **Upload:** Subir archivos PDF/imagen con storage local
- **Firma digital:** Canvas de firma + guardado base64
- **Auto-update:** Al firmar contrato → `empleado.contrato_firmado = true`
- **Gates:** Sin documentos → flags en false → gates bloquean
- **Criterio:** Flujo completo de firma visible en expediente
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 16 hrs

### S1-03: Ampliar modelo de Proyectos

- **Tabla:** `proyectos` ampliada con todos los campos nuevos
- **Agregar:** `hitos_proyecto`, `costos_proyecto`
- **Flujo maestro:** Campo `paso_actual` con los 17 pasos
- **Vista:** Timeline visual del proyecto con paso actual destacado
- **Gates:** Paso no avanza si el anterior no está completo
- **Criterio:** Proyecto visible con todos sus componentes
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 16 hrs

### S1-04: Ampliar modelo de Clientes

- **Tabla:** `clientes` ampliada + `contactos_cliente`
- **Agregar:** Campos de seguridad industrial, crédito mejorado
- **Vista:** Expediente de cliente con pestañas
- **Criterio:** Vista unificada del cliente con todos sus datos
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 8 hrs

### S1-05: Proveedores (expediente reutilizable)

- **Tabla:** `proveedores`
- **CRUD:** Completo con validación de RFC
- **Documentos:** CSF, opinión cumplimiento con upload
- **Gate:** Sin expediente completo → no se puede pagar
- **Criterio:** Proveedor con flag `validado` automático cuando tiene todo
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 10 hrs

### S1-06: Asignaciones empleado-proyecto

- **Tabla:** `asignaciones_proyecto`
- **Validación:** Gates RH deben pasar antes de asignar
- **Vista:** En proyecto → ver empleados asignados. En empleado → ver proyectos.
- **Criterio:** No se puede asignar empleado sin contrato/NDA/IMSS
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 8 hrs

---

## SPRINT 2 – SEGURIDAD INDUSTRIAL + LEGAL (Semana 5-6)

### S2-01: Expedientes de seguridad por cliente

- **Tablas:** `expedientes_seguridad_cliente`, `documentos_seguridad`
- **Config:** Cada cliente tiene su checklist (JSON configurable)
- **Multi-área:** RH, SEG, ADM y PRO pueden llenar su sección
- **Consolidación:** Vista de progreso con % por documento
- **Criterio:** Carpeta Ironcast generada automáticamente
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 20 hrs

### S2-02: Control de EPP mejorado

- **Tablas:** `epp_asignaciones`
- **Flujo:** Asignar EPP → Empleado firma recibido → Registro
- **Vista:** Por empleado (qué tiene) y por proyecto (qué se entregó)
- **Criterio:** EPP con firma de recibido
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 8 hrs

### S2-03: Módulo Legal

- **Tablas:** `expedientes_legales`, `movimientos_legales`
- **CRUD:** Expediente legal completo con timeline de movimientos
- **Dashboard:** Monto total en disputa, próximas audiencias, riesgo
- **Conexiones:** Vincular con cliente/empleado/proyecto
- **Contabilidad:** Monto provisión → aparece en provisiones contables
- **Criterio:** Caso Polinar registrado con todo su historial
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 16 hrs

### S2-04: Módulo de Riesgo y Pólizas

- **Tablas:** `polizas_seguro`, `vehiculos`, `siniestros`
- **Alertas:** 30/15/7 días antes de vencimiento → notificación
- **Gates:** GATE-RSK-001, 002, 003
- **Dashboard:** Pólizas vigentes, por vencer, costos
- **Criterio:** Vehículo sin póliza no se puede usar en proyecto
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 14 hrs

---

## SPRINT 3 – GENERADOR DE DOCUMENTOS + FLUJO MAESTRO (Semana 7-8)

### S3-01: Motor de plantillas de documentos

- **Tablas:** `plantillas_documento`
- **Engine:** Handlebars o Jinja2 para templates HTML→PDF
- **Librería:** `weasyprint` o `pdfkit` para generar PDFs
- **Seed:** 5 plantillas iniciales (Reporte diario, Acta cierre, Contrato, NDA, Cotización)
- **Criterio:** Template + datos = PDF con formato MICSA
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 20 hrs

### S3-02: Documentos generados con firmas

- **Tablas:** `documentos_generados`, `firmas_documento`
- **Flujo:** Generar → Enviar a firmas → Firmar (canvas) → Finalizar
- **Token:** Link de firma con token único
- **Versionado:** Cada cambio genera nueva versión con `parent_id`
- **Criterio:** Documento firmado digitalmente por todas las partes
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 16 hrs

### S3-03: Flujo maestro end-to-end (state machine)

- **Qué:** Implementar la máquina de estados de los 17 pasos
- **Servicio:** `FlowService.avanzar_paso(proyecto_id)` → evalúa gates → avanza o bloquea
- **Vista:** Barra de progreso visual con 17 pasos, paso actual resaltado
- **Reglas:** Cada paso tiene gates predefinidos que se evalúan automáticamente
- **Criterio:** Proyecto avanza paso a paso con bloqueos reales
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 16 hrs

### S3-04: Dashboard de Dirección General

- **Qué:** Panel ejecutivo con KPIs consolidados
- **Métricas:**
  - Proyectos activos con paso actual
  - Monto facturado vs cobrado vs por cobrar
  - Gates bloqueados (por área)
  - Riesgo legal (monto en disputa)
  - Pólizas por vencer
  - Empleados sin documentación completa
- **Criterio:** DG ve todo en una pantalla sin navegar
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 12 hrs

---

## SPRINT 4 – FINANZAS + NÓMINA (Semana 9-10)

### S4-01: Facturación con integración Sicofi

- **Tabla:** `facturas`
- **Flujo:** Datos → Validar → Timbrar (Sicofi) → PDF/XML → Enviar
- **Gate:** Sin acta cierre → no factura
- **Vista:** Lista de facturas con estatus, filtros, búsqueda
- **Criterio:** Factura timbrada automáticamente
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 20 hrs

### S4-02: Cobranza

- **Tabla:** `pagos_recibidos`
- **Flujo:** Factura emitida → Seguimiento → Pago → Complemento
- **Alertas:** Factura vencida → notificación diaria
- **Vista:** Antigüedad de saldos, por cliente, por proyecto
- **Criterio:** Timeline de cobranza con alertas
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 12 hrs

### S4-03: Nómina (cálculo + timbrado)

- **Tablas:** `periodos_nomina`, `recibos_nomina`
- **Cálculo:** ISR, IMSS, Infonavit basado en salario y días
- **Timbrado:** Integración Sicofi para recibos de nómina
- **Gate:** Sin contrato → no nómina. Sin proyecto → no pago.
- **Criterio:** Periodo calculado, timbrado, pagado
- **Prioridad:** 🔴 CRÍTICA
- **Esfuerzo:** 24 hrs

### S4-04: Pagos a proveedores

- **Tabla:** `pagos_proveedores`
- **Flujo:** Registrar → Aprobar → Pagar → Registrar en banco
- **Gate:** Proveedor sin expediente → no se paga
- **Contabilidad:** Pago → genera póliza automática
- **Criterio:** Pago aprobado con evidencia
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 10 hrs

---

## SPRINT 5 – CONTABILIDAD + REPSE (Semana 11-12)

### S5-01: Catálogo de cuentas y pólizas contables

- **Tablas:** `catalogo_cuentas`, `polizas_contables`, `movimientos_contables`
- **Import:** Cargar catálogo desde Excel/CSV
- **Auto-pólizas:** Factura emitida → póliza de ingreso
- **Vista:** Catálogo jerárquico, pólizas con detalle
- **Criterio:** Póliza automática al facturar
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 16 hrs

### S5-02: Bancos y conciliación

- **Tablas:** `bancos`, `movimientos_banco`
- **Import:** Carga de estados de cuenta (CSV/Excel)
- **Conciliación:** Matching manual con pólizas
- **Vista:** Saldo por banco, movimientos, conciliados vs pendientes
- **Criterio:** Conciliación funcional
- **Prioridad:** 🟢 MEDIA
- **Esfuerzo:** 12 hrs

### S5-03: REPSE y carpetas mensuales

- **Tablas:** `carpetas_mensuales`, `repse_entregas`
- **Auto-generación:** Cada mes se crea carpeta con checklist
- **Contenido:** Liga nómina, IMSS, ISN, pagos del mes
- **REPSE:** Consolida por cliente, genera paquete para enviar
- **Criterio:** Carpeta mensual completa descargable
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 16 hrs

### S5-04: Estados financieros

- **Qué:** Balance general y estado de resultados
- **Fuente:** Catálogo de cuentas + movimientos
- **Exportar:** PDF con formato MICSA
- **Criterio:** Balance cuadrado, resultados correctos
- **Prioridad:** 🟢 MEDIA
- **Esfuerzo:** 12 hrs

---

## SPRINT 6 – MIGRACIÓN EXCEL + PULIDO (Semana 13-14)

### S6-01: Data & Tools – Importador de Excel

- **Qué:** Herramienta para importar hojas Excel al sistema
- **Flujo:** Upload Excel → Preview → Mapear columnas → Validar → Importar
- **Soporte:** Costos, pagos, planeación, administración
- **Criterio:** Excel importado correctamente al modelo correspondiente
- **Prioridad:** 🟢 MEDIA
- **Esfuerzo:** 16 hrs

### S6-02: Sidebar y navegación actualizados

- **Qué:** Agregar todas las nuevas secciones al sidebar
- **Secciones nuevas:** Legal, Riesgo/Pólizas, Generador de Documentos
- **Indicadores:** Badge de alertas/bloqueos por sección
- **Criterio:** Navegación completa y funcional
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 4 hrs

### S6-03: Tests E2E de flujo maestro

- **Qué:** Test del flujo completo de levantamiento a cobro
- **Herramienta:** Playwright o Cypress
- **Cobertura:** Crear proyecto → pasar por los 17 pasos → verificar gates
- **Criterio:** Test pasa de principio a fin
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 12 hrs

### S6-04: Deployment y Docker

- **Qué:** Docker Compose para producción
- **Servicios:** Frontend (Next.js), Backend (FastAPI), PostgreSQL, Nginx
- **Config:** Variables de entorno, SSL, backups
- **Criterio:** `docker-compose up` levanta todo
- **Prioridad:** 🟡 ALTA
- **Esfuerzo:** 8 hrs

---

## RESUMEN POR SPRINT

| Sprint | Semana | Enfoque | Tickets | Horas est. |
|--------|--------|---------|---------|-----------|
| **S0** | 1-2 | Infraestructura | 6 | 42 hrs |
| **S1** | 3-4 | Expedientes Core | 6 | 74 hrs |
| **S2** | 5-6 | Seguridad + Legal | 4 | 58 hrs |
| **S3** | 7-8 | Generador + Flujo | 4 | 64 hrs |
| **S4** | 9-10 | Finanzas + Nómina | 4 | 66 hrs |
| **S5** | 11-12 | Contabilidad + REPSE | 4 | 56 hrs |
| **S6** | 13-14 | Migración + Pulido | 4 | 40 hrs |
| **TOTAL** | 14 sem | | **32 tickets** | **400 hrs** |

---

## PRIORIDADES POR COLOR

- 🔴 **CRÍTICA** = Sin esto no hay sistema funcional (Sprint 0-1)
- 🟡 **ALTA** = Necesario para operación real (Sprint 2-4)
- 🟢 **MEDIA** = Mejora significativa pero operable sin ello (Sprint 5-6)

---

## DEPENDENCIAS ENTRE TICKETS

```
S0-01 (Alembic) ──┐
S0-02 (Auth)    ──┤
S0-03 (RBAC)    ──┼── S0-04 (Audit) ── S0-05 (Gates)
                   │
                   ├── S1-01 (Empleados) ── S1-02 (Docs) ── S1-06 (Asignaciones)
                   ├── S1-03 (Proyectos) ── S3-03 (Flujo Maestro)
                   ├── S1-04 (Clientes) ── S2-01 (Seg Industrial)
                   └── S1-05 (Proveedores) ── S4-04 (Pagos)

S2-03 (Legal) ← independiente
S2-04 (Riesgo) ← independiente

S3-01 (Plantillas) ── S3-02 (Docs Generados)

S4-01 (Facturación) ── S4-02 (Cobranza)
S4-03 (Nómina) ── S5-03 (REPSE)

S5-01 (Contabilidad) ── S5-02 (Bancos) ── S5-04 (Edo Fin)
```

---

## CÓMO EMPEZAR (DÍA 1)

1. `pip install alembic` y configurar migraciones
2. Crear migración inicial con tablas `users` (ampliada), `audit_log`, `roles_permisos`
3. Implementar JWT auth con `python-jose` + `passlib`
4. Implementar RBAC middleware
5. Implementar audit log decorator
6. Crear tabla `gates` + seed con los 13 gates predefinidos
7. Implementar `GateService.evaluar()`
8. **Ya tienes sistema con reglas de negocio desde el día 1**

---

*Documento vivo. Se actualiza al cerrar cada sprint.*
