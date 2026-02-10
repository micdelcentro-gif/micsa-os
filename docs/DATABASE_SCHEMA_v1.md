# MICSA OS v1.0 – SCHEMA DE BASE DE DATOS COMPLETO

> Versión: 1.0 — Febrero 2026
> Motor: SQLite (dev) → PostgreSQL (prod)
> ORM: SQLAlchemy (Python/FastAPI)

---

## CONVENCIONES

- **IDs**: UUID v4 como `String(36)`
- **Timestamps**: `created_at`, `updated_at` en todas las tablas
- **Soft delete**: campo `activo` (Boolean) o `deleted_at` (DateTime nullable)
- **JSON flexible**: campos JSON para datos que varían por tipo
- **Relaciones**: Foreign Keys explícitas con cascades definidos

---

## 1. NÚCLEO – USUARIOS Y ROLES

### `users` ✅ (YA EXISTE — AMPLIAR)

```sql
id              String(36) PK
email           String(255) UNIQUE NOT NULL
hashed_password String(255) NOT NULL
nombre          String(255) NOT NULL
apellido        String(255)
rol             Enum(ADMIN, DG, PRO, RH, SEG, ADM, CON, LEGAL, RSK, VTA, CALIDAD, OPERADOR)
area            String(100)        -- Área organizacional
telefono        String(50)
activo          Boolean DEFAULT true
ultimo_acceso   DateTime
created_at      DateTime
updated_at      DateTime
```

### `roles_permisos`

```sql
id              String(36) PK
rol             String(50) NOT NULL     -- Rol del enum
modulo          String(100) NOT NULL    -- ej: "legal", "nomina", "cotizaciones"
permiso         Enum(VER, CREAR, EDITAR, ELIMINAR, AUTORIZAR, DESBLOQUEAR)
activo          Boolean DEFAULT true
created_at      DateTime
```

### `audit_log` (TODA ACCIÓN RELEVANTE)

```sql
id              String(36) PK
usuario_id      String(36) FK → users
accion          String(100) NOT NULL    -- ej: "DESBLOQUEO_EXCEPCION", "AUTORIZO_GASTO"
modulo          String(100)
entidad_tipo    String(100)            -- ej: "proyecto", "empleado"
entidad_id      String(36)
datos_antes     JSON                    -- Estado antes del cambio
datos_despues   JSON                    -- Estado después del cambio
ip_address      String(45)
motivo          Text                    -- Requerido para desbloqueos
created_at      DateTime
```

---

## 2. EXPEDIENTE DE CLIENTE

### `clientes` ✅ (YA EXISTE — AMPLIAR)

```sql
id                  String(36) PK
-- Datos fiscales
nombre              String(255) NOT NULL
rfc                 String(13) UNIQUE
nombre_comercial    String(255)
regimen_fiscal      String(100)
uso_cfdi            String(10)
industria           String(100)
-- Dirección
direccion_fiscal    Text
ciudad              String(100)
estado              String(100)
codigo_postal       String(10)
pais                String(100) DEFAULT 'México'
-- Contacto principal
contacto_nombre     String(255)
contacto_puesto     String(100)
contacto_email      String(255)
contacto_telefono   String(50)
contacto_movil      String(50)
-- Comercial
credito_autorizado  Float DEFAULT 0
dias_credito        Integer DEFAULT 0
saldo_pendiente     Float DEFAULT 0
-- Seguridad industrial
requiere_carpeta_seg    Boolean DEFAULT false
requisitos_especiales   JSON        -- Requisitos específicos del cliente
-- Status
activo              Boolean DEFAULT true
notas               Text
created_at          DateTime
updated_at          DateTime
```

### `contactos_cliente`

```sql
id              String(36) PK
cliente_id      String(36) FK → clientes
nombre          String(255) NOT NULL
puesto          String(100)
email           String(255)
telefono        String(50)
movil           String(50)
es_principal    Boolean DEFAULT false
activo          Boolean DEFAULT true
created_at      DateTime
```

---

## 3. EXPEDIENTE DE EMPLEADO

### `empleados`

```sql
id                  String(36) PK
-- Datos personales
nombre              String(255) NOT NULL
apellido_paterno    String(255) NOT NULL
apellido_materno    String(255)
curp                String(18) UNIQUE
rfc                 String(13)
nss                 String(11)         -- Número Seguro Social
fecha_nacimiento    Date
genero              String(10)
estado_civil        String(20)
-- Dirección
direccion           Text
ciudad              String(100)
estado              String(100)
codigo_postal       String(10)
-- Contacto
telefono            String(50)
email               String(255)
contacto_emergencia String(255)
tel_emergencia      String(50)
-- Laboral
puesto              String(100)
area                String(100)
tipo_contrato       Enum(PLANTA, TEMPORAL, PROYECTO, HONORARIOS)
fecha_ingreso       Date
fecha_baja          Date
motivo_baja         Text
salario_diario      Float
salario_mensual     Float
banco               String(100)
clabe               String(18)
cuenta_bancaria     String(20)
-- Documentos firmados (gates)
contrato_firmado        Boolean DEFAULT false
contrato_fecha          DateTime
nda_firmado             Boolean DEFAULT false
nda_fecha               DateTime
no_competencia_firmado  Boolean DEFAULT false
no_competencia_fecha    DateTime
imss_activo             Boolean DEFAULT false
imss_fecha_alta         DateTime
-- Capacitación
dc3_vigente         Boolean DEFAULT false
dc3_fecha           DateTime
examen_medico       Boolean DEFAULT false
examen_medico_fecha DateTime
doping_ok           Boolean DEFAULT false
doping_fecha        DateTime
-- Status
activo              Boolean DEFAULT true
bloqueado           Boolean DEFAULT false
motivo_bloqueo      Text
created_at          DateTime
updated_at          DateTime
```

### `asignaciones_proyecto`

```sql
id              String(36) PK
empleado_id     String(36) FK → empleados
proyecto_id     String(36) FK → proyectos
rol_proyecto    String(100)         -- ej: "Soldador", "Supervisor"
fecha_inicio    Date
fecha_fin       Date
activo          Boolean DEFAULT true
created_at      DateTime
```

### `documentos_empleado`

```sql
id              String(36) PK
empleado_id     String(36) FK → empleados
tipo            Enum(CONTRATO, NDA, NO_COMPETENCIA, IMSS_ALTA, IMSS_BAJA, DC3, EXAMEN_MEDICO, DOPING, INE, CURP_DOC, COMPROBANTE_DOMICILIO, RFC_DOC, OTRO)
nombre_archivo  String(255)
ruta_archivo    String(500)
vigencia_inicio Date
vigencia_fin    Date
firmado         Boolean DEFAULT false
firma_digital   Text                -- Base64 de firma
firmado_por     String(36) FK → users
firmado_fecha   DateTime
estatus         Enum(PENDIENTE, VIGENTE, VENCIDO, RECHAZADO)
created_at      DateTime
```

---

## 4. EXPEDIENTE DE PROVEEDOR

### `proveedores`

```sql
id                  String(36) PK
-- Datos fiscales
razon_social        String(255) NOT NULL
rfc                 String(13) UNIQUE
nombre_comercial    String(255)
regimen_fiscal      String(100)
-- Dirección
direccion_fiscal    Text
ciudad              String(100)
estado              String(100)
codigo_postal       String(10)
-- Contacto
contacto_nombre     String(255)
contacto_email      String(255)
contacto_telefono   String(50)
-- Bancarios
banco               String(100)
clabe               String(18)
cuenta_bancaria     String(20)
-- Cumplimiento
csf_cargada         Boolean DEFAULT false   -- Constancia Situación Fiscal
csf_ruta            String(500)
opinion_cumplimiento    Boolean DEFAULT false
opinion_ruta        String(500)
opinion_vigencia    Date
-- Comercial
tipo                Enum(MATERIAL, SERVICIO, SUBCONTRATO, RENTA, OTRO)
dias_credito        Integer DEFAULT 0
credito_limite      Float DEFAULT 0
-- Status
activo              Boolean DEFAULT true
validado            Boolean DEFAULT false   -- Expediente completo
notas               Text
created_at          DateTime
updated_at          DateTime
```

---

## 5. EXPEDIENTE DE PROYECTO (AMPLIADO)

### `proyectos` ✅ (YA EXISTE — AMPLIAR)

```sql
id                  String(36) PK
cotizacion_id       String(36) FK → cotizaciones
cliente_id          String(36) FK → clientes
-- Datos del proyecto
nombre              String(255) NOT NULL
codigo              String(50) UNIQUE      -- ej: "PRO-2026-001"
ubicacion           String(255)
descripcion         Text
tipo_trabajo        String(100)
-- Flujo maestro (paso actual)
paso_actual         Integer DEFAULT 1       -- 1-17 del flujo maestro
status              Enum(LEVANTAMIENTO, AUTORIZADO, COTIZADO, PLANEACION, EN_EJECUCION, CIERRE_TECNICO, FACTURACION, COBRANZA, CERRADO, SUSPENDIDO)
-- Fechas
fecha_inicio_plan   Date
fecha_fin_plan      Date
fecha_inicio_real   Date
fecha_fin_real      Date
-- Financiero
presupuesto         Float DEFAULT 0
costo_real          Float DEFAULT 0
monto_facturado     Float DEFAULT 0
monto_cobrado       Float DEFAULT 0
margen_esperado     Float DEFAULT 0
-- Levantamiento
levantamiento_cobrable  Boolean DEFAULT false
levantamiento_monto     Float DEFAULT 0
-- Autorización DG
autorizado_dg       Boolean DEFAULT false
autorizado_por      String(36) FK → users
autorizado_fecha    DateTime
autorizado_folio    String(50)              -- DG-01-XXXX
-- Seguridad
carpeta_seg_completa    Boolean DEFAULT false
formato9_completo       Boolean DEFAULT false
-- Cierre
acta_cierre_firmada     Boolean DEFAULT false
acta_cierre_folio       String(50)
-- Compliance
compliance_status   JSON
-- Timestamps
closed_at           DateTime
created_at          DateTime
updated_at          DateTime
```

### `hitos_proyecto`

```sql
id              String(36) PK
proyecto_id     String(36) FK → proyectos
nombre          String(255) NOT NULL
descripcion     Text
fecha_plan      Date
fecha_real      Date
responsable_id  String(36) FK → users
completado      Boolean DEFAULT false
orden           Integer DEFAULT 0
created_at      DateTime
```

### `costos_proyecto`

```sql
id              String(36) PK
proyecto_id     String(36) FK → proyectos
categoria       Enum(MATERIAL, MANO_OBRA, EQUIPO, SUBCONTRATO, TRANSPORTE, VIATICOS, HERRAMIENTA, OTRO)
concepto        String(255) NOT NULL
cantidad        Float DEFAULT 1
precio_unitario Float NOT NULL
subtotal        Float NOT NULL
proveedor_id    String(36) FK → proveedores
factura_ref     String(100)
fecha           Date
aprobado        Boolean DEFAULT false
aprobado_por    String(36) FK → users
notas           Text
created_at      DateTime
```

---

## 6. COTIZACIONES ✅ (YA EXISTE — AMPLIAR)

### `cotizaciones`

```sql
id                  String(36) PK
cliente_id          String(36) FK → clientes
vendedor_id         String(36) FK → users
-- Datos
folio               String(50) UNIQUE      -- COT-2026-001
nombre_proyecto     String(255) NOT NULL
ubicacion           String(255)
tipo_trabajo        String(100)
duracion_meses      Float DEFAULT 1.0
condiciones_pago    String(100) DEFAULT 'NETO 30'
-- Cálculos
input_data          JSON NOT NULL
client_quote        JSON
internal_data       JSON
subtotal            Float DEFAULT 0.0
iva                 Float DEFAULT 0.0
total               Float DEFAULT 0.0
-- Flujo
status              Enum(BORRADOR, ENVIADA, APROBADA, RECHAZADA, PROYECTO)
enviada_fecha       DateTime
aprobada_fecha      DateTime
rechazada_motivo    Text
-- Versión
version             Integer DEFAULT 1
parent_id           String(36) FK → cotizaciones  -- Versión anterior
created_at          DateTime
updated_at          DateTime
```

---

## 7. EXPEDIENTE LEGAL

### `expedientes_legales`

```sql
id                  String(36) PK
-- Referencia
titulo              String(255) NOT NULL
folio               String(50) UNIQUE
tipo                Enum(DEMANDA_LABORAL, DEMANDA_MERCANTIL, DEMANDA_CIVIL, CONTRATO, LITIGIO, ARBITRAJE, OTRO)
contraparte         String(255)             -- ej: "Polinar"
-- Relaciones
cliente_id          String(36) FK → clientes    -- Si aplica
empleado_id         String(36) FK → empleados   -- Si aplica
proyecto_id         String(36) FK → proyectos   -- Si aplica
-- Detalles
descripcion         Text
monto_disputa       Float DEFAULT 0
monto_provision     Float DEFAULT 0              -- Provisión contable
riesgo              Enum(BAJO, MEDIO, ALTO, CRITICO)
-- Fechas
fecha_inicio        Date
fecha_proxima_audiencia Date
fecha_resolucion    Date
-- Abogado
abogado_nombre      String(255)
abogado_despacho    String(255)
abogado_telefono    String(50)
abogado_email       String(255)
-- Resultado
resultado           Enum(PENDIENTE, FAVORABLE, DESFAVORABLE, ACUERDO, DESISTIMIENTO)
monto_resolucion    Float DEFAULT 0
-- Status
estatus             Enum(ABIERTO, EN_PROCESO, APELACION, CERRADO, ARCHIVADO)
notas               Text
created_at          DateTime
updated_at          DateTime
```

### `movimientos_legales`

```sql
id                  String(36) PK
expediente_id       String(36) FK → expedientes_legales
fecha               Date NOT NULL
tipo                Enum(AUDIENCIA, NOTIFICACION, ACUERDO, RESOLUCION, RECURSO, OTRO)
descripcion         Text NOT NULL
monto               Float DEFAULT 0
responsable_id      String(36) FK → users
documento_ruta      String(500)
created_at          DateTime
```

---

## 8. EXPEDIENTE DE RIESGO / PÓLIZAS

### `polizas_seguro`

```sql
id                  String(36) PK
-- Póliza
tipo                Enum(FLOTILLA, RESPONSABILIDAD_CIVIL, OFICINAS, PROYECTO, EQUIPO, VIDA, OTRO)
numero_poliza       String(100) UNIQUE
aseguradora         String(255) NOT NULL
-- Cobertura
descripcion         Text
suma_asegurada      Float DEFAULT 0
deducible           Float DEFAULT 0
prima_total         Float DEFAULT 0
forma_pago          Enum(MENSUAL, TRIMESTRAL, SEMESTRAL, ANUAL)
-- Vigencia
vigencia_inicio     Date NOT NULL
vigencia_fin        Date NOT NULL
-- Relaciones
proyecto_id         String(36) FK → proyectos   -- Si es por proyecto
vehiculo_id         String(36) FK → vehiculos   -- Si es flotilla
-- Status
estatus             Enum(VIGENTE, VENCIDA, CANCELADA, EN_RENOVACION)
dias_para_vencer    Integer                       -- Calculado
alerta_enviada      Boolean DEFAULT false
-- Archivos
poliza_ruta         String(500)
endoso_ruta         String(500)
notas               Text
created_at          DateTime
updated_at          DateTime
```

### `vehiculos`

```sql
id                  String(36) PK
tipo                Enum(CAMIONETA, CAMION, AUTO, MAQUINARIA, OTRO)
marca               String(100)
modelo              String(100)
anio                Integer
placas              String(20) UNIQUE
num_serie           String(50)
color               String(50)
-- Responsable
asignado_a          String(36) FK → empleados
-- Status
activo              Boolean DEFAULT true
poliza_vigente      Boolean DEFAULT false
km_actual           Integer DEFAULT 0
notas               Text
created_at          DateTime
updated_at          DateTime
```

### `siniestros`

```sql
id                  String(36) PK
poliza_id           String(36) FK → polizas_seguro
fecha               Date NOT NULL
descripcion         Text NOT NULL
monto_reclamado     Float DEFAULT 0
monto_indemnizado   Float DEFAULT 0
estatus             Enum(REPORTADO, EN_AJUSTE, PAGADO, RECHAZADO)
numero_siniestro    String(100)
created_at          DateTime
updated_at          DateTime
```

---

## 9. SEGURIDAD INDUSTRIAL

### `expedientes_seguridad_cliente`

```sql
id                  String(36) PK
cliente_id          String(36) FK → clientes
proyecto_id         String(36) FK → proyectos
-- Datos
nombre_carpeta      String(255)             -- ej: "Ironcast - Proyecto Tanques"
tipo_acceso         Enum(PLANTA, OFICINA, OBRA, MINA, OTRO)
-- Checklist de documentos requeridos
requisitos          JSON                     -- Array de {nombre, obligatorio, area_responsable}
-- Status
completa            Boolean DEFAULT false
porcentaje          Float DEFAULT 0
fecha_entrega       Date
aprobada_por_cliente Boolean DEFAULT false
-- Archivos
carpeta_ruta        String(500)
indice_ruta         String(500)
notas               Text
created_at          DateTime
updated_at          DateTime
```

### `documentos_seguridad`

```sql
id                  String(36) PK
expediente_seg_id   String(36) FK → expedientes_seguridad_cliente
-- Documento
nombre              String(255) NOT NULL
tipo                Enum(FORMATO9, LISTA_PERSONAL, EPP_CERT, POLIZA_RC, REGLAMENTO, CAPACITACION, PERMISO_TRABAJO, ACCESO_PLANTA, OTRO)
area_responsable    Enum(SEG, RH, ADM, PRO)
-- Contenido
ruta_archivo        String(500)
contenido_json      JSON                     -- Datos del formato si aplica
-- Status
estatus             Enum(PENDIENTE, CARGADO, APROBADO, RECHAZADO, VENCIDO)
obligatorio         Boolean DEFAULT true
fecha_carga         DateTime
cargado_por         String(36) FK → users
aprobado_por        String(36) FK → users
fecha_aprobacion    DateTime
vigencia_fin        Date
created_at          DateTime
```

### `epp_items` ✅ (YA EXISTE)

```sql
id              String(36) PK
nombre          String(100) NOT NULL
categoria       String(50)
descripcion     Text
activo          Boolean DEFAULT true
created_at      DateTime
```

### `epp_asignaciones`

```sql
id              String(36) PK
empleado_id     String(36) FK → empleados
epp_item_id     String(36) FK → epp_items
proyecto_id     String(36) FK → proyectos
fecha_entrega   Date NOT NULL
talla           String(20)
cantidad        Integer DEFAULT 1
firmado         Boolean DEFAULT false         -- Empleado firmó recibido
notas           Text
created_at      DateTime
```

---

## 10. FACTURACIÓN Y COBRANZA

### `facturas`

```sql
id                  String(36) PK
proyecto_id         String(36) FK → proyectos
cliente_id          String(36) FK → clientes
-- CFDI
uuid_fiscal         String(36) UNIQUE
folio_fiscal        String(50)
serie               String(10)
folio               Integer
-- Datos
concepto            Text NOT NULL
subtotal            Float NOT NULL
iva                 Float NOT NULL
total               Float NOT NULL
moneda              String(3) DEFAULT 'MXN'
tipo_comprobante    Enum(INGRESO, EGRESO, TRASLADO, PAGO)
metodo_pago         String(10)                -- PUE, PPD
forma_pago          String(10)
-- Timbrado (Sicofi)
xml_ruta            String(500)
pdf_ruta            String(500)
timbrado_fecha      DateTime
sicofi_response     JSON
-- Status
estatus             Enum(BORRADOR, TIMBRADA, ENVIADA, PAGADA, PARCIAL, CANCELADA)
fecha_emision       Date
fecha_vencimiento   Date
-- Cobranza
monto_pagado        Float DEFAULT 0
saldo_pendiente     Float DEFAULT 0
notas               Text
created_at          DateTime
updated_at          DateTime
```

### `pagos_recibidos`

```sql
id                  String(36) PK
factura_id          String(36) FK → facturas
-- Pago
monto               Float NOT NULL
fecha_pago          Date NOT NULL
forma_pago          Enum(TRANSFERENCIA, CHEQUE, EFECTIVO, TARJETA)
referencia          String(100)
banco               String(100)
-- Complemento de pago
complemento_uuid    String(36)
complemento_xml     String(500)
notas               Text
created_at          DateTime
```

---

## 11. NÓMINA Y PAGOS

### `periodos_nomina`

```sql
id                  String(36) PK
tipo                Enum(SEMANAL, QUINCENAL, MENSUAL)
numero_periodo      Integer
anio                Integer
fecha_inicio        Date
fecha_fin           Date
fecha_pago          Date
-- Totales
total_percepciones  Float DEFAULT 0
total_deducciones   Float DEFAULT 0
total_neto          Float DEFAULT 0
total_empleados     Integer DEFAULT 0
-- Status
estatus             Enum(ABIERTO, CALCULADO, TIMBRADO, PAGADO, CERRADO)
created_at          DateTime
updated_at          DateTime
```

### `recibos_nomina`

```sql
id                  String(36) PK
periodo_id          String(36) FK → periodos_nomina
empleado_id         String(36) FK → empleados
proyecto_id         String(36) FK → proyectos   -- Centro de costo
-- Cálculos
dias_trabajados     Float
salario_diario      Float
percepciones        JSON        -- {sueldo, extras, bonos, viaticos, ...}
deducciones         JSON        -- {imss, isr, infonavit, prestamos, ...}
total_percepciones  Float
total_deducciones   Float
neto_pagar          Float
-- Timbrado
uuid_fiscal         String(36)
xml_ruta            String(500)
pdf_ruta            String(500)
timbrado_ok         Boolean DEFAULT false
-- Status
estatus             Enum(CALCULADO, TIMBRADO, PAGADO, CANCELADO)
created_at          DateTime
updated_at          DateTime
```

### `pagos_proveedores`

```sql
id                  String(36) PK
proveedor_id        String(36) FK → proveedores
proyecto_id         String(36) FK → proyectos
-- Pago
concepto            Text NOT NULL
monto               Float NOT NULL
fecha_pago          Date
forma_pago          Enum(TRANSFERENCIA, CHEQUE, EFECTIVO)
referencia          String(100)
banco               String(100)
-- Factura del proveedor
factura_proveedor   String(100)
factura_uuid        String(36)
factura_ruta        String(500)
-- Status
estatus             Enum(PENDIENTE, PROGRAMADO, PAGADO, CANCELADO)
aprobado            Boolean DEFAULT false
aprobado_por        String(36) FK → users
notas               Text
created_at          DateTime
updated_at          DateTime
```

---

## 12. CARPETAS MENSUALES / REPSE

### `carpetas_mensuales`

```sql
id                  String(36) PK
anio                Integer NOT NULL
mes                 Integer NOT NULL
-- Contenido
nomina_incluida     Boolean DEFAULT false
imss_incluido       Boolean DEFAULT false
isn_incluido        Boolean DEFAULT false
pagos_incluidos     Boolean DEFAULT false
evidencias_ok       Boolean DEFAULT false
-- REPSE
repse_generado      Boolean DEFAULT false
repse_enviado       Boolean DEFAULT false
repse_fecha_envio   DateTime
-- Status
completa            Boolean DEFAULT false
porcentaje          Float DEFAULT 0
-- Archivos
carpeta_ruta        String(500)
created_at          DateTime
updated_at          DateTime
```

### `repse_entregas`

```sql
id                  String(36) PK
carpeta_id          String(36) FK → carpetas_mensuales
cliente_id          String(36) FK → clientes
-- Entrega
fecha_entrega       Date
metodo_entrega      Enum(EMAIL, PORTAL, FISICO)
acuse_ruta          String(500)
-- Status
estatus             Enum(PENDIENTE, ENVIADO, RECIBIDO, OBSERVACIONES)
observaciones       Text
created_at          DateTime
```

---

## 13. GENERADOR DE DOCUMENTOS

### `plantillas_documento`

```sql
id                  String(36) PK
nombre              String(255) NOT NULL
codigo              String(50) UNIQUE      -- ej: "F6-ACTA-CIERRE"
tipo                Enum(REPORTE, BITACORA, ACTA, CARPETA, CONTRATO, NDA, NO_COMPETENCIA, EXPEDIENTE, COTIZACION, FACTURA, ESTADO_FINANCIERO, AUTORIZACION)
-- Definición
campos              JSON NOT NULL           -- Array de {nombre, tipo, obligatorio, area_responsable}
plantilla_html      Text                    -- Template HTML/Handlebars para PDF
-- Metadata
version             Integer DEFAULT 1
activo              Boolean DEFAULT true
created_at          DateTime
updated_at          DateTime
```

### `documentos_generados`

```sql
id                  String(36) PK
plantilla_id        String(36) FK → plantillas_documento
-- Relaciones (polimórfico)
expediente_tipo     String(50)              -- "proyecto", "empleado", "legal", etc.
expediente_id       String(36)
-- Datos
folio               String(50) UNIQUE
datos               JSON NOT NULL            -- Datos consolidados de todas las áreas
-- Generación
pdf_ruta            String(500)
generado_por        String(36) FK → users
generado_fecha      DateTime
-- Firmas
requiere_firma      Boolean DEFAULT false
firmas_completadas  Integer DEFAULT 0
firmas_requeridas   Integer DEFAULT 0
-- Versionado
version             Integer DEFAULT 1
parent_id           String(36) FK → documentos_generados
-- Status
estatus             Enum(BORRADOR, EN_REVISION, FIRMADO, FINALIZADO, ANULADO)
created_at          DateTime
updated_at          DateTime
```

### `firmas_documento`

```sql
id                  String(36) PK
documento_id        String(36) FK → documentos_generados
firmante_id         String(36) FK → users
firmante_nombre     String(255) NOT NULL
firmante_rol        String(100)
-- Firma
firma_base64        Text
firmado             Boolean DEFAULT false
firmado_fecha       DateTime
token_hash          String(64) UNIQUE
ip_firma            String(45)
-- Status
estatus             Enum(PENDIENTE, FIRMADO, RECHAZADO, EXPIRADO)
motivo_rechazo      Text
created_at          DateTime
```

---

## 14. SISTEMA DE GATES (BLOQUEOS)

### `gates`

```sql
id                  String(36) PK
nombre              String(255) NOT NULL
codigo              String(50) UNIQUE       -- ej: "GATE-RH-001"
descripcion         Text
-- Regla
modulo_origen       String(100)             -- ej: "empleados"
campo_evaluar       String(100)             -- ej: "contrato_firmado"
operador            Enum(IGUAL, DIFERENTE, MAYOR, MENOR, EXISTE, NO_EXISTE, VERDADERO, FALSO)
valor_esperado      String(255)             -- ej: "true"
-- Efecto
modulo_bloqueado    String(100)             -- ej: "nomina"
accion_bloqueo      Enum(BLOQUEAR_CREACION, BLOQUEAR_AVANCE, BLOQUEAR_EDICION, ALERTAR)
mensaje_bloqueo     Text                    -- ej: "Empleado sin contrato firmado. No puede recibir nómina."
-- Config
permite_desbloqueo  Boolean DEFAULT false   -- ¿DG puede desbloquear?
activo              Boolean DEFAULT true
prioridad           Integer DEFAULT 0
created_at          DateTime
updated_at          DateTime
```

### `gate_evaluaciones`

```sql
id                  String(36) PK
gate_id             String(36) FK → gates
entidad_tipo        String(100)
entidad_id          String(36)
-- Resultado
resultado           Enum(APROBADO, BLOQUEADO, DESBLOQUEADO)
evaluado_fecha      DateTime
-- Desbloqueo (si aplica)
desbloqueado_por    String(36) FK → users
motivo_desbloqueo   Text
desbloqueado_fecha  DateTime
-- Evidencia
datos_evaluados     JSON                     -- Snapshot de los datos al evaluar
created_at          DateTime
```

---

## 15. CONTABILIDAD

### `catalogo_cuentas`

```sql
id                  String(36) PK
codigo              String(50) UNIQUE NOT NULL  -- ej: "1101.01"
nombre              String(255) NOT NULL
tipo                Enum(ACTIVO, PASIVO, CAPITAL, INGRESO, GASTO, COSTO)
naturaleza          Enum(DEUDORA, ACREEDORA)
nivel               Integer                     -- 1, 2, 3...
cuenta_padre_id     String(36) FK → catalogo_cuentas
afectable           Boolean DEFAULT true        -- ¿Acepta movimientos?
activa              Boolean DEFAULT true
created_at          DateTime
```

### `polizas_contables`

```sql
id                  String(36) PK
tipo                Enum(INGRESO, EGRESO, DIARIO)
folio               String(50)
fecha               Date NOT NULL
concepto            Text NOT NULL
-- Origen automático
origen_tipo         String(100)             -- "factura", "nomina", "pago_proveedor"
origen_id           String(36)
-- Status
estatus             Enum(BORRADOR, APLICADA, CANCELADA)
total_cargo         Float DEFAULT 0
total_abono         Float DEFAULT 0
created_at          DateTime
updated_at          DateTime
```

### `movimientos_contables`

```sql
id                  String(36) PK
poliza_id           String(36) FK → polizas_contables
cuenta_id           String(36) FK → catalogo_cuentas
tipo                Enum(CARGO, ABONO)
monto               Float NOT NULL
concepto            Text
referencia          String(100)
orden               Integer DEFAULT 0
created_at          DateTime
```

### `bancos`

```sql
id                  String(36) PK
nombre_banco        String(255) NOT NULL
cuenta              String(20)
clabe               String(18)
moneda              String(3) DEFAULT 'MXN'
saldo_actual        Float DEFAULT 0
cuenta_contable_id  String(36) FK → catalogo_cuentas
activa              Boolean DEFAULT true
created_at          DateTime
updated_at          DateTime
```

### `movimientos_banco`

```sql
id                  String(36) PK
banco_id            String(36) FK → bancos
tipo                Enum(DEPOSITO, RETIRO, TRANSFERENCIA, COMISION, INTERES)
monto               Float NOT NULL
fecha               Date NOT NULL
referencia          String(100)
concepto            Text
conciliado          Boolean DEFAULT false
poliza_id           String(36) FK → polizas_contables
created_at          DateTime
```

---

## 16. NOTIFICACIONES Y ALERTAS

### `notificaciones`

```sql
id                  String(36) PK
usuario_id          String(36) FK → users
tipo                Enum(INFO, ALERTA, BLOQUEO, VENCIMIENTO, TAREA, APROBACION)
titulo              String(255) NOT NULL
mensaje             Text
-- Referencia
modulo              String(100)
entidad_tipo        String(100)
entidad_id          String(36)
enlace              String(500)             -- URL para ir al detalle
-- Status
leida               Boolean DEFAULT false
leida_fecha         DateTime
accionada           Boolean DEFAULT false
prioridad           Enum(BAJA, MEDIA, ALTA, URGENTE)
created_at          DateTime
```

---

## ÍNDICE DE RELACIONES PRINCIPALES

```
clientes ──┬─── proyectos
            ├─── cotizaciones
            ├─── facturas
            ├─── expedientes_seguridad_cliente
            ├─── expedientes_legales
            └─── repse_entregas

empleados ──┬─── asignaciones_proyecto
             ├─── documentos_empleado
             ├─── recibos_nomina
             ├─── epp_asignaciones
             └─── expedientes_legales

proyectos ──┬─── hitos_proyecto
             ├─── costos_proyecto
             ├─── facturas
             ├─── asignaciones_proyecto
             ├─── expedientes_seguridad_cliente
             ├─── polizas_seguro
             └─── recibos_nomina

proveedores ├─── pagos_proveedores
             └─── costos_proyecto

gates ──────── gate_evaluaciones (motor de reglas)

plantillas ──── documentos_generados ──── firmas_documento
```

---

## GATES PREDEFINIDOS (CONFIGURACIÓN INICIAL)

| Código | Gate | Si falta... | Bloquea... |
|--------|------|------------|-----------|
| GATE-RH-001 | Contrato firmado | contrato_firmado = false | Nómina |
| GATE-RH-002 | NDA firmado | nda_firmado = false | Asignación proyecto |
| GATE-RH-003 | No competencia | no_competencia_firmado = false | Asignación proyecto |
| GATE-RH-004 | IMSS activo | imss_activo = false | Asignación proyecto |
| GATE-RH-005 | Sin proyecto | asignacion activa = false | Pago nómina |
| GATE-SEG-001 | Carpeta seg completa | carpeta_seg_completa = false | Ejecución proyecto |
| GATE-SEG-002 | Formato 9 | formato9_completo = false | Acceso planta |
| GATE-RSK-001 | Póliza vehículo | poliza_vigente = false | Uso en proyecto |
| GATE-RSK-002 | Póliza RC proyecto | poliza RC vigente = false | Ejecución proyecto |
| GATE-RSK-003 | Póliza vencida | vigencia_fin < hoy | Bloqueo automático |
| GATE-ADM-001 | Acta cierre | acta_cierre_firmada = false | Facturación |
| GATE-ADM-002 | OC recibida | orden_compra = null | Facturación |
| GATE-DG-001 | Sin autorización DG | autorizado_dg = false | Cotización |

---

*Este schema cubre el 100% de las 6 capas del documento de integración.*
*Se implementa incrementalmente por prioridad de negocio.*
