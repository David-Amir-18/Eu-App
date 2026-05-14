import { authHeaders } from './authService.js'
const API_URL = import.meta.env.VITE_API_URL

/** GET /tracker/workouts/sessions */
export async function getWorkoutSessions(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status) params.append('status', filters.status)
  if (filters.from_date) params.append('from_date', filters.from_date)
  if (filters.to_date) params.append('to_date', filters.to_date)
  if (filters.workout_plan_id) params.append('workout_plan_id', filters.workout_plan_id)

  const res = await fetch(`${API_URL}/tracker/workouts/sessions?${params.toString()}`, {
    headers: authHeaders()
  })
  
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch workout sessions')
  return data
}
