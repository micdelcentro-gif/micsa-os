export interface DailyReport {
  id?: string
  internalId: string
  reportNo: string
  fechaReporte: string
  nombreCliente: string
  nombreProyecto: string
  ubicacionPlanta: string
  especificacionNo?: string
  
  // Tablas dinámicas
  personal: PersonalRow[]
  actividades: ActividadRow[]
  materiales: MaterialRow[]
  
  // Otros campos
  condicionesClimaticas?: string
  observaciones?: string
  seguridadHSE?: string
  
  // Metadatos
  userId?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface PersonalRow {
  id: string
  nombre: string
  puesto: string
  horaEntrada: string
  horaSalida: string
}

export interface ActividadRow {
  id: string
  descripcion: string
  avance: number
  responsable: string
  observaciones?: string
}

export interface MaterialRow {
  id: string
  descripcion: string
  cantidad: number
  unidad: string
  proveedor?: string
}

export interface ReportFilters {
  reportNo?: string
  cliente?: string
  proyecto?: string
  ubicacion?: string
  especificacion?: string
  fecha?: string
  tipo?: 'DAILY_REPORT' | 'PACKING_LIST' | 'ALL'
}
