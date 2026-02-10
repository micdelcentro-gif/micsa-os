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

export default api
export { modernApi }
