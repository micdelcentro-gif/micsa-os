import axios from 'axios'

// En desarrollo, usar la API interna de Next.js como proxy
// En producción, apuntar directo al backend legacy
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Modern Backend (FastAPI)
const MODERN_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

const modernApi = axios.create({
  baseURL: MODERN_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getHealth = async () => {
  const { data } = await modernApi.get('/health')
  return data
}

export const getReports = async () => {
  const { data } = await api.get('/reports')
  return data
}

// Endpoints de Empleados
export const getEmpleados = async (proyectoId?: string) => {
  const url = proyectoId ? `/empleados/?proyecto_id=${proyectoId}` : '/empleados/'
  const { data } = await modernApi.get(url)
  return data
}

export const getEmpleadoStats = async () => {
  const { data } = await modernApi.get('/empleados/stats')
  return data
}

// Legal Endpoints
export const getLegalStats = async () => {
  const { data } = await modernApi.get('/legal/stats/summary')
  return data
}

export const getExpedientesLegales = async () => {
  const { data } = await modernApi.get('/legal/')
  return data
}

export const createExpedienteLegal = async (expediente: any) => {
  const { data } = await modernApi.post('/legal/', expediente)
  return data
}

// Proyectos Endpoints
export const getProyectos = async () => {
  const { data } = await modernApi.get('/proyectos/')
  return data
}

// Compliance Endpoints
export const getComplianceExpedientes = async () => {
  const { data } = await modernApi.get('/compliance/')
  return data
}

export const createComplianceExpediente = async (expediente: any) => {
  const { data } = await modernApi.post('/compliance/', expediente)
  return data
}

export const updateComplianceExpediente = async (id: string, update: any) => {
  const { data } = await modernApi.put(`/compliance/${id}`, update)
  return data
}

export const uploadComplianceDocument = async (id: string, category: string, field: string, file: File) => {
  const formData = new FormData()
  formData.append('category', category)
  formData.append('field', field)
  formData.append('file', file)

  const { data } = await modernApi.post(`/compliance/${id}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const sendComplianceExpediente = async (id: string) => {
  const { data } = await modernApi.post(`/compliance/${id}/send`)
  return data
}

export default api
export { modernApi }
