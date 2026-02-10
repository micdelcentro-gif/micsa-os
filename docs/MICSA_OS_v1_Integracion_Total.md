# MICSA OS – INTEGRACIÓN TOTAL DEL SISTEMA
>
> Documento de planificación v1.0 — Febrero 2026
> Fuente: Prompt del usuario (Jordan González)

---

## PRINCIPIO RECTOR (NO NEGOCIABLE)

**El proceso manda, no la persona.**
El sistema:

- Guía
- Bloquea
- Consolida
- Genera documentos
- Deja evidencia legal

Nada avanza si falta algo. Punto.

---

## 1. SEGURIDAD INDUSTRIAL – CARPETA IRONCAST (EXPEDIENTE POR CLIENTE)

La carpeta Ironcast no es solo de seguridad, es un **expediente de acceso por cliente**.

### Nuevo concepto: Expedientes de Cliente / Acceso a Planta

- Cliente: Ironcast
- Tipo: Seguridad Industrial
- Vigencia: por proyecto / por periodo
- Responsable: Seguridad Industrial

### Qué debe contener la carpeta Ironcast

- Requisitos específicos del cliente
- Formatos propios de Ironcast
- Evidencias
- Checklists
- Documentos REPSE relacionados
- Accesos autorizados

### Flujo en sistema

1. **SEG** entra al módulo "Expedientes por Cliente"
2. Selecciona **Ironcast**
3. El sistema muestra:
   - Campos obligatorios a llenar
   - Documentos requeridos
   - Estatus por documento
4. Cada responsable llena **solo su parte**
5. El **Generador de Documentos**:
   - Consolida
   - Ordena
   - Genera carpeta final (PDFs + índices)

> Resultado: Carpeta Ironcast lista, validada y trazable.

---

## 2. GENERADOR DE DOCUMENTOS – MULTIÁREA (MOTOR CENTRAL)

El generador **NO es un módulo aislado**, es el **motor central**.

### Comportamiento

- Cada documento tiene:
  - Área responsable
  - Campos obligatorios
  - Validaciones
- Cada área llena SOLO sus datos
- El sistema junta todo, versiona, firma y exporta

### Ejemplo de flujo

- SEG llena formatos de seguridad
- RH llena personal
- ADM llena fiscales
- PRO llena técnicos
- → **Salida**: expediente consolidado por proyecto o cliente

---

## 3. LIMPIEZA E IMPLEMENTACIÓN DE TABLAS (EXCEL → SISTEMA)

### Nuevo submódulo: Data & Tools / Migración de Tablas

1. **Inventariar tablas**
2. Clasificarlas: Costos, Nómina, Proyectos, Administración
3. Limpiar: campos duplicados, errores de fórmula, estructura
4. Normalizar
5. Convertirlas en modelos del sistema y cálculos backend

> Esto no es subir Excel. Es **absorber el conocimiento** y volverlo sistema.

---

## 4. ALTA DE PROVEEDOR – EXPEDIENTE REUTILIZABLE

### Contenido del expediente

- Datos fiscales
- CSF
- Opinión de cumplimiento
- Cuenta bancaria
- Contratos
- Formatos del cliente (ej. Ironcast)

### Beneficio

> Das de alta una vez → reutilizas siempre.

---

## 5. CARPETA ADMIN – CONSOLIDACIÓN REAL

### A) Administración interna

- Control financiero
- Planeación
- Costos fijos
- Estructura de la empresa
- → Va a: Finanzas, Dirección, Contabilidad

### B) Administración de proyectos

- Planeación del proyecto
- Control de costos
- Cómo cobrar el levantamiento
- → Va a: PRO, Ventas, Cotización

---

## 6. CARPETAS MENSUALES DE PAGOS (Modelo Mensual)

Cada mes se genera automáticamente:

- Nómina
- Pagos a proveedores
- Evidencias
- Complemento REPSE
- Se relaciona con REPSE
- Se guarda como histórico

---

## 7. CONTRATOS DE NO COMPETENCIA Y CONFIDENCIALIDAD

### Reglas duras

- Todo empleado debe firmar:
  - Contrato laboral
  - Confidencialidad (NDA)
  - No competencia
- Todo firmado digitalmente

### Gate del sistema

> Empleado sin NDA / No Competencia → **bloqueado**

---

## 8. PROCESS DESIGN / BIBLIOTECA DE PROCESOS

### Qué hace el sistema

- Guarda el proceso visual (fotos, flujos, ideas)
- Lo traduce a: SOP, flujo digital, formatos
- Lo convierte en paso obligatorio del sistema

> Aquí se define la evolución del sistema, no solo su estado actual.

---

## ESTRUCTURA MAESTRA – EXPEDIENTES BASE

1. **Expediente de Proyecto**
2. **Expediente de Cliente**
3. **Expediente de Empleado**
4. **Expediente de Proveedor**
5. **Expediente Mensual (Pagos / REPSE)**
6. **Expediente Legal**
7. **Expediente de Riesgo / Pólizas**
8. **Expediente de Procesos**

> Todo documento vive **dentro de un expediente**, nunca suelto.

---

## FLUJO MAESTRO END-TO-END (DE LEVANTAMIENTO A COBRO)

1. Levantamiento técnico
2. Autorización Dirección (DG-01)
3. Cotización técnica
4. Alta cliente + OC
5. Planeación del proyecto
6. Asignación de personal
7. Seguridad industrial (cliente específico, ej. Ironcast)
8. Ejecución
9. Bitácoras y evidencias
10. Cierre técnico
11. Validación cliente (Acta F6)
12. Facturación
13. Cobranza
14. Pagos / Nómina
15. REPSE / Cumplimiento
16. Auditoría
17. Cierre administrativo

> Si falta algo → **bloqueo automático**.

---

## SISTEMA POR ÁREA

### DIRECCIÓN GENERAL

- Autoriza proyectos y gastos
- Ve riesgos, legales, pólizas, financieros
- Puede desbloquear excepciones (auditadas)

### PROYECTOS / OPERACIONES

- Levantamientos, cotizaciones, planeación
- Administración del proyecto, control de costos
- Define si el levantamiento se cobra

### RECURSOS HUMANOS (AMPLIADO)

1. Expediente del empleado
2. Contratos laborales
3. Contratos de confidencialidad
4. Contratos de no competencia
5. Firma digital
6. Nómina (cálculo + timbrado)

**Gates RH:**

- Sin contrato firmado → no nómina
- Sin NDA / No competencia → bloqueado
- Sin IMSS → no proyecto
- Sin proyecto → no pago

### SEGURIDAD INDUSTRIAL (AMPLIADO + IRONCAST)

1. Seguridad general
2. Expedientes por cliente (Ironcast, etc.)
3. Control de accesos
4. Formato 9
5. Evidencias
6. Carpetas de acceso a planta

### ADMINISTRACIÓN Y FINANZAS

1. Alta de clientes
2. Alta de proveedores (expediente reutilizable)
3. Facturación
4. Cobranza
5. Pagos
6. Administración interna
7. Administración de proyectos
8. Costos fijos y variables

### CONTABILIDAD / TESORERÍA

- Catálogo de cuentas, pólizas, libro diario
- Estados financieros, bancos, conciliación
- Provisiones (incluye litigios)

### LEGAL (NUEVO)

- Expedientes legales (ej. Polinar)
- Demandas, contratos, evidencias
- Monto en disputa, estatus legal, riesgo financiero

### RIESGO Y PÓLIZAS (NUEVO)

- Flotilla, responsabilidad civil, oficinas
- Pólizas por proyecto

**Gates:**

- Vehículo sin póliza → no proyecto
- Proyecto sin RC → no ejecución
- Póliza vencida → bloqueo automático

---

## GENERADOR DE DOCUMENTOS – QUÉ GENERA

- Reportes diarios
- Bitácoras
- Actas
- Carpetas de cliente (Ironcast)
- Contratos laborales
- NDA / No competencia
- Expedientes REPSE
- Expedientes legales
- Alta de proveedor
- Carpetas mensuales de pagos

> No hay documentos "manuales".

---

## REPSE + PAGOS MENSUALES

Cada mes se genera:

- Nómina, IMSS, ISN
- Pagos, evidencias
- Complemento REPSE

---

## RESULTADO FINAL

- Ya no dependes de tu memoria
- Ya no se pierde información
- Nadie "se salta" pasos
- Todo deja rastro legal
- Todo genera documentos
- Todo se puede auditar
- Todo se puede escalar

> Esto ya no es un sistema administrativo. Es un **sistema de control empresarial y legal**.

---

## PRÓXIMOS PASOS POSIBLES

1. Arquitectura Next.js final (carpetas + flujos)
2. Schema de base de datos completo
3. Backlog técnico para programador
4. Manual operativo digital por área
5. Plan de despliegue a producción
