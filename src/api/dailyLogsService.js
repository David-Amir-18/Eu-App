import { authHeaders } from './authService.js'
const API_URL = import.meta.env.VITE_API_URL

/** GET /tracker/daily/{log_date} */
export async function getDailyLog(dateStr) {
  const res = await fetch(`${API_URL}/tracker/daily/${dateStr}`, {
    headers: authHeaders()
  })
  if (res.status === 404) return null // Standard fallback for no record today
  
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch daily log')
  return data
}

/** POST /tracker/daily/ */
export async function upsertDailyLog(payload) {
  const res = await fetch(`${API_URL}/tracker/daily/`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  
  const responseData = await res.json()
  if (!res.ok) throw new Error(responseData.detail || 'Failed to save daily log')
  return responseData
}

/** GET /tracker/daily/ */
export async function listDailyLogs(filters = {}) {
  const { from_date, to_date } = filters
  const params = new URLSearchParams()
  if (from_date) params.append('from_date', from_date)
  if (to_date) params.append('to_date', to_date)

  const res = await fetch(`${API_URL}/tracker/daily/?${params.toString()}`, {
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to list daily logs')
  return data
}
