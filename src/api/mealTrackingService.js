import { authHeaders } from './authService.js'
const API_URL = import.meta.env.VITE_API_URL

/** POST /meal/schedule/ */
export async function createMealSchedule(data) {
  const res = await fetch(`${API_URL}/meal/schedule/`, {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const responseData = await res.json()
  if (!res.ok) throw new Error(responseData.detail || 'Failed to schedule meal')
  return responseData
}

/** PATCH /meal/schedule/eaten */
export async function updateMealEatenStatus(scheduleId, isEaten, eatenDate = null) {
  const data = { schedule_id: scheduleId, is_eaten: isEaten }
  if (eatenDate) data.eaten_date = eatenDate
  
  const res = await fetch(`${API_URL}/meal/schedule/eaten`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  const responseData = await res.json()
  if (!res.ok) throw new Error(responseData.detail || 'Failed to update eaten status')
  return responseData
}

/** GET /meal/schedule/eaten */
export async function getEatenMeals(filters = {}) {
  const params = new URLSearchParams()
  if (filters.date) params.append('date', filters.date)
  if (filters.from_date) params.append('from_date', filters.from_date)
  if (filters.to_date) params.append('to_date', filters.to_date)
  if (filters.meal_type) params.append('meal_type', filters.meal_type)
  
  const res = await fetch(`${API_URL}/meal/schedule/eaten?${params.toString()}`, {
    headers: authHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch eaten meals')
  return data
}
