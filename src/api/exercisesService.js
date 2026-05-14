const API_URL = import.meta.env.VITE_API_URL
const MOCK = import.meta.env.VITE_MOCK === 'true'


function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_EXERCISES = {
  items: [
    { id: 'e1', title: 'Bench Press', muscle_group: 'chest', exercise_type: 'weight_reps', equipment_category: 'barbell', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e2', title: 'Squat', muscle_group: 'legs', exercise_type: 'weight_reps', equipment_category: 'barbell', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e3', title: 'Pull-up', muscle_group: 'back', exercise_type: 'reps_only', equipment_category: 'none', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e4', title: 'Shoulder Press', muscle_group: 'shoulders', exercise_type: 'weight_reps', equipment_category: 'dumbbell', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e5', title: 'Deadlift', muscle_group: 'back', exercise_type: 'weight_reps', equipment_category: 'barbell', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e6', title: 'Bicep Curl', muscle_group: 'arms', exercise_type: 'weight_reps', equipment_category: 'dumbbell', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e7', title: 'Tricep Dips', muscle_group: 'arms', exercise_type: 'reps_only', equipment_category: 'none', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e8', title: 'Leg Press', muscle_group: 'legs', exercise_type: 'weight_reps', equipment_category: 'machine', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e9', title: 'Lat Pulldown', muscle_group: 'back', exercise_type: 'weight_reps', equipment_category: 'machine', thumbnail_url: null, secondary_muscles: [] },
    { id: 'e10', title: 'Romanian Deadlift', muscle_group: 'legs', exercise_type: 'weight_reps', equipment_category: 'barbell', thumbnail_url: null, secondary_muscles: [] },
  ],
  total: 10,
  page: 1,
  page_size: 20,
  pages: 1,
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
  if (MOCK) {
    let items = MOCK_EXERCISES.items
    if (search) items = items.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    if (muscleGroup) items = items.filter(e => e.muscle_group === muscleGroup)
    if (exerciseType) items = items.filter(e => e.exercise_type === exerciseType)
    if (equipmentCategory) items = items.filter(e => e.equipment_category === equipmentCategory)
    return { items, total: items.length, page, page_size: pageSize, pages: 1 }
  }

  const params = new URLSearchParams()
  params.set('page', page)
  params.set('page_size', pageSize)
  if (exerciseType) params.set('exercise_type', exerciseType)
  if (muscleGroup) params.set('muscle_group', muscleGroup)
  if (equipmentCategory) params.set('equipment_category', equipmentCategory)
  if (search) params.set('search', search)
  if (useProfile) params.set('use_profile', 'true')

  const res = await fetch(`${API_URL}/exercises/?${params.toString()}`, {
    headers: {
      ...authHeaders(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch exercises')
  return data // { items, total, page, page_size, pages }
}

// ── Get single exercise ────────────────────────────────────────────────────────
export async function getExercise(exerciseId) {
  if (MOCK) {
    const ex = MOCK_EXERCISES.items.find(e => e.id === exerciseId)
    if (!ex) throw new Error('Exercise not found')
    return ex
  }
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
