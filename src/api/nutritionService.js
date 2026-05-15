// ── Nutrition Service ─────────────────────────────────────────────────────────
// Wraps /nutrition endpoints

const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  })
  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || data.message || res.statusText)
  return data
}

/**
 * GET /nutrition/stats
 * Returns aggregate nutrient totals for the current user.
 * Fields: total_calories_cal, total_protein_g, total_carbohydrates_g, total_fat_g,
 *         total_fiber_g, total_sugar_g, total_sodium_mg, meal_count, date_range
 */
export async function getNutritionStats() {
  return apiFetch('/nutrition/stats')
}
