const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── List exercises (paginated + filtered) ──────────────────────────────────────
export async function getExercises({
  page = 1,
  pageSize = 20,
  exerciseType,
  muscleGroup,
  equipmentCategory,
  search,
  useProfile = false,
} = {}) {
  const params = new URLSearchParams()
  params.set('page', page)
  params.set('page_size', pageSize)
  if (exerciseType)      params.set('exercise_type', exerciseType)
  if (muscleGroup)       params.set('muscle_group', muscleGroup)
  if (equipmentCategory) params.set('equipment_category', equipmentCategory)
  if (search)            params.set('search', search)
  if (useProfile)        params.set('use_profile', 'true')

  const res = await fetch(`${API_URL}/exercises/?${params.toString()}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch exercises')
  return data // { items, total, page, page_size, pages }
}

// ── Get single exercise ────────────────────────────────────────────────────────
export async function getExercise(exerciseId) {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Exercise not found')
  return data
}

// ── Admin: create exercise ─────────────────────────────────────────────────────
export async function createExercise(payload) {
  const res = await fetch(`${API_URL}/exercises/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create exercise')
  return data
}

// ── Admin: update exercise ─────────────────────────────────────────────────────
export async function updateExercise(exerciseId, payload) {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update exercise')
  return data
}

// ── Admin: archive exercise ────────────────────────────────────────────────────
export async function archiveExercise(exerciseId) {
  const res = await fetch(`${API_URL}/exercises/${exerciseId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to archive exercise')
  return data
}
