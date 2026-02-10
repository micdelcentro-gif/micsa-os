export type ReportData = {
  id?: string
  reportNo: string
  date: string
  client: string
  project: string
  location: string
  specification: string
  
  // New Header Fields
  week?: string
  shift?: 'PRIMERO' | 'SEGUNDO' | 'TERCERO'
  supervisorMicsa?: string
  supervisorClient?: string

  // Tables
  personnel: PersonalRow[]
  activities: ActivityRow[]
  activitiesNarrative?: string
  materials: MaterialRow[]
  
  // Progress
  plannedProgress?: number
  realProgress?: number
  statusVariation?: 'ADELANTADO' | 'EN TIEMPO' | 'ATRASADO'
  criticalPath?: string
  affectation?: 'SÍ' | 'NO'
  correctiveAction?: string

  // HSE
  hse: {
    epp: boolean
    loto: boolean
    unsafeActs: boolean
    greenCards?: number
    incidents: boolean
    report?: string
  }

  // Incidents
  technicalIncidents?: string
  productionIncidents?: string
  clientChanges?: string

  // Photos
  photos: PhotoEntry[]
  photosNotes?: string

  // Checklist
  checklist: {
    general: boolean
    personnel: boolean
    activities: boolean
    progress: boolean
    hse: boolean
    incidents: boolean
    photos: boolean
    signatures: boolean
  }

  // Footer
  elaboratedBy: string
  reviewedBy: string
  approvedBy: string
  notes?: string
}

export type PersonalRow = {
  id: string
  name: string
  position: string
  startTime: string
  endTime: string
}

export type ActivityRow = {
  id: string
  phase: string
  description: string
  week: string
  percentage: number
}

export type MaterialRow = {
  id: string
  description: string
  quantity: number
  unit: string
  notes: string
}

export type PhotoEntry = {
  id: string
  label: string
  file?: File | null // Used for upload state
  preview?: string
}
