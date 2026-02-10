export interface ISODocument {
    clausula: string;
    requisito: string;
    documento: string;
    tipo: 'Política' | 'Manual' | 'Procedimiento' | 'Registro' | 'Formato' | 'Instructivo' | 'Programa';
    codigo: string;
    area: string;
    responsable: string;
    version: string;
}

export const DOCUMENTOS_ISO: ISODocument[] = [
    // Cláusula 4 - Contexto de la Organización
    { clausula: "4.1", requisito: "Comprensión de la organización", documento: "Análisis de Contexto Organizacional", tipo: "Registro", codigo: "SGC-RG-001", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    { clausula: "4.2", requisito: "Partes Interesadas", documento: "Matriz de Partes Interesadas", tipo: "Registro", codigo: "SGC-RG-002", area: "Dirección", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "4.3", requisito: "Alcance del SGC", documento: "Declaración de Alcance del Sistema", tipo: "Registro", codigo: "SGC-RG-003", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "4.4", requisito: "SGC y sus procesos", documento: "Mapa de Procesos", tipo: "Registro", codigo: "SGC-RG-004", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "4.4.1", requisito: "Procesos del SGC", documento: "Fichas de Caracterización de Procesos", tipo: "Formato", codigo: "SGC-FO-001", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    
    // Cláusula 5 - Liderazgo
    { clausula: "5.1", requisito: "Liderazgo y compromiso", documento: "Acta de Compromiso de Dirección", tipo: "Registro", codigo: "SGC-RG-005", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    { clausula: "5.2", requisito: "Política de calidad", documento: "Política de Calidad", tipo: "Política", codigo: "SGC-PO-001", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    { clausula: "5.2.2", requisito: "Comunicación política", documento: "Procedimiento de Comunicación Interna", tipo: "Procedimiento", codigo: "SGC-PR-001", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "5.3", requisito: "Roles y responsabilidades", documento: "Manual de Organización y Funciones", tipo: "Manual", codigo: "SGC-MN-001", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    
    // Cláusula 6 - Planificación
    { clausula: "6.1", requisito: "Riesgos y oportunidades", documento: "Matriz de Riesgos y Oportunidades", tipo: "Registro", codigo: "SGC-RG-006", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "6.1.2", requisito: "Acciones para riesgos", documento: "Plan de Tratamiento de Riesgos", tipo: "Procedimiento", codigo: "SGC-PR-002", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "6.2", requisito: "Objetivos de calidad", documento: "Matriz de Objetivos de Calidad", tipo: "Registro", codigo: "SGC-RG-007", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "6.2.2", requisito: "Planificación objetivos", documento: "Plan de Acción para Objetivos", tipo: "Formato", codigo: "SGC-FO-002", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "6.3", requisito: "Planificación de cambios", documento: "Procedimiento de Gestión del Cambio", tipo: "Procedimiento", codigo: "SGC-PR-003", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    
    // Cláusula 7 - Apoyo
    { clausula: "7.1.1", requisito: "Recursos generales", documento: "Plan de Recursos", tipo: "Procedimiento", codigo: "SGC-PR-004", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    { clausula: "7.1.2", requisito: "Personas", documento: "Procedimiento de Gestión del Personal", tipo: "Procedimiento", codigo: "SGC-PR-005", area: "Operaciones", responsable: "Jefe RRHH", version: "1.0" },
    { clausula: "7.1.3", requisito: "Infraestructura", documento: "Plan de Mantenimiento de Infraestructura", tipo: "Procedimiento", codigo: "SGC-PR-006", area: "Operaciones", responsable: "Jefe Mant.", version: "1.0" },
    { clausula: "7.1.4", requisito: "Ambiente de operación", documento: "Matriz de Condiciones de Trabajo", tipo: "Registro", codigo: "SGC-RG-008", area: "Operaciones", responsable: "Jefe Seg.", version: "1.0" },
    { clausula: "7.1.5", requisito: "Recursos de seguimiento", documento: "Plan de Control de Equipos", tipo: "Procedimiento", codigo: "SGC-PR-007", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "7.1.5.2", requisito: "Trazabilidad de medición", documento: "Registro de Calibración de Equipos", tipo: "Registro", codigo: "SGC-RG-009", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "7.1.6", requisito: "Conocimientos", documento: "Gestión del Conocimiento Organizacional", tipo: "Procedimiento", codigo: "SGC-PR-008", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "7.2", requisito: "Competencia", documento: "Matriz de Competencias", tipo: "Registro", codigo: "SGC-RG-010", area: "Operaciones", responsable: "Jefe RRHH", version: "1.0" },
    { clausula: "7.2", requisito: "Competencia", documento: "Programa de Capacitación", tipo: "Programa", codigo: "SGC-PG-001", area: "Operaciones", responsable: "Jefe RRHH", version: "1.0" },
    { clausula: "7.3", requisito: "Toma de conciencia", documento: "Plan de Sensibilización SGC", tipo: "Procedimiento", codigo: "SGC-PR-009", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "7.4", requisito: "Comunicación", documento: "Matriz de Comunicaciones", tipo: "Registro", codigo: "SGC-RG-011", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "7.5", requisito: "Información documentada", documento: "Procedimiento Control de Documentos", tipo: "Procedimiento", codigo: "SGC-PR-010", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "7.5.2", requisito: "Creación documentos", documento: "Formato de Control Documental", tipo: "Formato", codigo: "SGC-FO-003", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "7.5.3", requisito: "Control de la información", documento: "Lista Maestra de Documentos", tipo: "Registro", codigo: "SGC-RG-012", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    
    // Cláusula 8 - Operación
    { clausula: "8.1", requisito: "Planificación operacional", documento: "Plan de Realización del Producto", tipo: "Procedimiento", codigo: "SGC-PR-011", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.2", requisito: "Requisitos productos", documento: "Procedimiento Comercial", tipo: "Procedimiento", codigo: "SGC-PR-012", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "8.2.1", requisito: "Comunicación cliente", documento: "Formato de Atención al Cliente", tipo: "Formato", codigo: "SGC-FO-004", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "8.2.2", requisito: "Determinación requisitos", documento: "Formato de Cotización", tipo: "Formato", codigo: "SGC-FO-005", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "8.2.3", requisito: "Revisión de requisitos", documento: "Formato de Orden de Trabajo", tipo: "Formato", codigo: "SGC-FO-006", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.2.4", requisito: "Cambios en requisitos", documento: "Control de Cambios en Pedidos", tipo: "Formato", codigo: "SGC-FO-007", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "8.3", requisito: "Diseño y desarrollo", documento: "Procedimiento de Diseño", tipo: "Procedimiento", codigo: "SGC-PR-013", area: "Ingeniería", responsable: "Jefe Ing.", version: "1.0" },
    { clausula: "8.3.2", requisito: "Planificación diseño", documento: "Plan de Diseño y Desarrollo", tipo: "Formato", codigo: "SGC-FO-008", area: "Ingeniería", responsable: "Jefe Ing.", version: "1.0" },
    { clausula: "8.3.3", requisito: "Entradas diseño", documento: "Especificaciones de Entrada", tipo: "Formato", codigo: "SGC-FO-009", area: "Ingeniería", responsable: "Jefe Ing.", version: "1.0" },
    { clausula: "8.3.4", requisito: "Controles diseño", documento: "Lista de Verificación Diseño", tipo: "Formato", codigo: "SGC-FO-010", area: "Ingeniería", responsable: "Jefe Ing.", version: "1.0" },
    { clausula: "8.3.5", requisito: "Salidas diseño", documento: "Planos y Especificaciones Técnicas", tipo: "Formato", codigo: "SGC-FO-011", area: "Ingeniería", responsable: "Jefe Ing.", version: "1.0" },
    { clausula: "8.3.6", requisito: "Cambios diseño", documento: "Control de Cambios de Diseño", tipo: "Formato", codigo: "SGC-FO-012", area: "Ingeniería", responsable: "Jefe Ing.", version: "1.0" },
    { clausula: "8.4", requisito: "Control proveedores", documento: "Procedimiento de Compras", tipo: "Procedimiento", codigo: "SGC-PR-014", area: "Compras", responsable: "Jefe Compras", version: "1.0" },
    { clausula: "8.4.1", requisito: "Evaluación proveedores", documento: "Matriz de Evaluación Proveedores", tipo: "Registro", codigo: "SGC-RG-013", area: "Compras", responsable: "Jefe Compras", version: "1.0" },
    { clausula: "8.4.2", requisito: "Tipo de control", documento: "Criterios de Selección Proveedores", tipo: "Formato", codigo: "SGC-FO-013", area: "Compras", responsable: "Jefe Compras", version: "1.0" },
    { clausula: "8.4.3", requisito: "Información proveedores", documento: "Orden de Compra", tipo: "Formato", codigo: "SGC-FO-014", area: "Compras", responsable: "Jefe Compras", version: "1.0" },
    { clausula: "8.5", requisito: "Producción y servicio", documento: "Procedimiento de Producción", tipo: "Procedimiento", codigo: "SGC-PR-015", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.5.1", requisito: "Control producción", documento: "Instructivo de Fabricación", tipo: "Instructivo", codigo: "SGC-IN-001", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.5.1", requisito: "Control producción", documento: "Registro de Producción Diario", tipo: "Registro", codigo: "SGC-RG-014", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.5.2", requisito: "Identificación trazabilidad", documento: "Procedimiento de Trazabilidad", tipo: "Procedimiento", codigo: "SGC-PR-016", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "8.5.3", requisito: "Propiedad cliente", documento: "Control Propiedad del Cliente", tipo: "Formato", codigo: "SGC-FO-015", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.5.4", requisito: "Preservación", documento: "Instructivo de Almacenamiento", tipo: "Instructivo", codigo: "SGC-IN-002", area: "Operaciones", responsable: "Jefe Almacén", version: "1.0" },
    { clausula: "8.5.5", requisito: "Actividades postventa", documento: "Procedimiento de Servicio Postventa", tipo: "Procedimiento", codigo: "SGC-PR-017", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "8.5.6", requisito: "Control de cambios", documento: "Control de Cambios Producción", tipo: "Formato", codigo: "SGC-FO-016", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.6", requisito: "Liberación productos", documento: "Procedimiento de Inspección Final", tipo: "Procedimiento", codigo: "SGC-PR-018", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "8.6", requisito: "Liberación productos", documento: "Formato de Liberación de Producto", tipo: "Formato", codigo: "SGC-FO-017", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "8.7", requisito: "Salidas no conformes", documento: "Procedimiento de No Conformidades", tipo: "Procedimiento", codigo: "SGC-PR-019", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "8.7", requisito: "Salidas no conformes", documento: "Registro de Producto No Conforme", tipo: "Registro", codigo: "SGC-RG-015", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    
    // Cláusula 9 - Evaluación del Desempeño
    { clausula: "9.1", requisito: "Seguimiento y medición", documento: "Plan de Seguimiento y Medición", tipo: "Procedimiento", codigo: "SGC-PR-020", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "9.1.2", requisito: "Satisfacción cliente", documento: "Encuesta de Satisfacción", tipo: "Formato", codigo: "SGC-FO-018", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "9.1.2", requisito: "Satisfacción cliente", documento: "Análisis de Satisfacción del Cliente", tipo: "Registro", codigo: "SGC-RG-016", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "9.1.3", requisito: "Análisis y evaluación", documento: "Informe de Indicadores SGC", tipo: "Registro", codigo: "SGC-RG-017", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "9.2", requisito: "Auditoría interna", documento: "Procedimiento de Auditoría Interna", tipo: "Procedimiento", codigo: "SGC-PR-021", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "9.2", requisito: "Auditoría interna", documento: "Programa Anual de Auditorías", tipo: "Programa", codigo: "SGC-PG-002", area: "Calidad", responsable: "Auditor Líder", version: "1.0" },
    { clausula: "9.2.2", requisito: "Planificación auditoría", documento: "Plan de Auditoría Interna", tipo: "Formato", codigo: "SGC-FO-019", area: "Calidad", responsable: "Auditor Líder", version: "1.0" },
    { clausula: "9.2.2", requisito: "Planificación auditoría", documento: "Lista de Verificación Auditoría", tipo: "Formato", codigo: "SGC-FO-020", area: "Calidad", responsable: "Auditor Líder", version: "1.0" },
    { clausula: "9.2.2", requisito: "Planificación auditoría", documento: "Informe de Auditoría Interna", tipo: "Formato", codigo: "SGC-FO-021", area: "Calidad", responsable: "Auditor Líder", version: "1.0" },
    { clausula: "9.3", requisito: "Revisión por la dirección", documento: "Procedimiento Revisión Dirección", tipo: "Procedimiento", codigo: "SGC-PR-022", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    { clausula: "9.3.2", requisito: "Entradas revisión", documento: "Formato Entradas Revisión", tipo: "Formato", codigo: "SGC-FO-022", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "9.3.3", requisito: "Salidas revisión", documento: "Informe de Revisión por la Dirección", tipo: "Registro", codigo: "SGC-RG-018", area: "Dirección", responsable: "Dir. General", version: "1.0" },
    
    // Cláusula 10 - Mejora
    { clausula: "10.1", requisito: "Generalidades mejora", documento: "Procedimiento de Mejora Continua", tipo: "Procedimiento", codigo: "SGC-PR-023", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "10.2", requisito: "No conformidad", documento: "Formato de Reporte de No Conformidad", tipo: "Formato", codigo: "SGC-FO-023", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "10.2", requisito: "Acción correctiva", documento: "Procedimiento Acciones Correctivas", tipo: "Procedimiento", codigo: "SGC-PR-024", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "10.2", requisito: "Acción correctiva", documento: "Formato de Acción Correctiva", tipo: "Formato", codigo: "SGC-FO-024", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "10.2.2", requisito: "Información documentada", documento: "Registro de Acciones Correctivas", tipo: "Registro", codigo: "SGC-RG-019", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "10.3", requisito: "Mejora continua", documento: "Programa de Mejora Continua", tipo: "Programa", codigo: "SGC-PG-003", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "10.3", requisito: "Mejora continua", documento: "Registro de Oportunidades de Mejora", tipo: "Registro", codigo: "SGC-RG-020", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    
    // Documentos Adicionales
    { clausula: "7.1.5", requisito: "Monitoreo y Medición", documento: "Instructivo Uso de Equipos de Medición", tipo: "Instructivo", codigo: "SGC-IN-003", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "8.5.1", requisito: "Control producción", documento: "Instructivo de Seguridad Industrial", tipo: "Instructivo", codigo: "SGC-IN-004", area: "Operaciones", responsable: "Jefe Seg.", version: "1.0" },
    { clausula: "8.2.1", requisito: "Comunicación cliente", documento: "Formato de Quejas y Reclamos", tipo: "Formato", codigo: "SGC-FO-025", area: "Comercial", responsable: "Jefe Comercial", version: "1.0" },
    { clausula: "7.5.3", requisito: "Control información", documento: "Formato de Distribución de Documentos", tipo: "Formato", codigo: "SGC-FO-026", area: "Calidad", responsable: "Coord. Calidad", version: "1.0" },
    { clausula: "8.4.1", requisito: "Evaluación proveedores", documento: "Registro de Proveedores Aprobados", tipo: "Registro", codigo: "SGC-RG-021", area: "Compras", responsable: "Jefe Compras", version: "1.0" },
    { clausula: "7.2", requisito: "Competencia", documento: "Formato de Evaluación de Desempeño", tipo: "Formato", codigo: "SGC-FO-027", area: "Operaciones", responsable: "Jefe RRHH", version: "1.0" },
    { clausula: "7.2", requisito: "Competencia", documento: "Formato de Descripción de Puesto", tipo: "Formato", codigo: "SGC-FO-028", area: "Operaciones", responsable: "Jefe RRHH", version: "1.0" },
    { clausula: "8.6", requisito: "Liberación productos", documento: "Formato de Certificado de Calidad", tipo: "Formato", codigo: "SGC-FO-029", area: "Calidad", responsable: "Dir. Calidad", version: "1.0" },
    { clausula: "8.5.2", requisito: "Identificación trazabilidad", documento: "Formato de Etiqueta de Identificación", tipo: "Formato", codigo: "SGC-FO-030", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
    { clausula: "8.1", requisito: "Planificación operacional", documento: "Formato de Reporte Diario de Obra", tipo: "Formato", codigo: "SGC-FO-031", area: "Operaciones", responsable: "Jefe Prod.", version: "1.0" },
];
