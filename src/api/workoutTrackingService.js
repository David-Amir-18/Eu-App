// ── Workout Tracking Service ──────────────────────────────────────────────────
// Wraps all /tracker/workouts endpoints

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

// ─────────────────────────────────────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /tracker/workouts/sessions
 * data: { workout_plan_id?, routine_id?, scheduled_date?, status: 'scheduled'|'in_progress' }
 */
export async function createWorkoutSession(data) {
  return apiFetch('/tracker/workouts/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * GET /tracker/workouts/sessions
 * filters: { status?, from_date?, to_date?, workout_plan_id? }
 */
export async function getWorkoutSessions(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status)          params.append('status', filters.status)
  if (filters.from_date)       params.append('from_date', filters.from_date)
  if (filters.to_date)         params.append('to_date', filters.to_date)
  if (filters.workout_plan_id) params.append('workout_plan_id', filters.workout_plan_id)
  return apiFetch(`/tracker/workouts/sessions?${params}`)
}

/** GET /tracker/workouts/sessions/{session_id} */
export async function getWorkoutSession(sessionId) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}`)
}

/**
 * PATCH /tracker/workouts/sessions/{session_id}/status
 * data: { status: 'in_progress'|'completed'|'abandoned'|'skipped', completed_at? }
 * Transitions: scheduled → in_progress|skipped; in_progress → completed|abandoned
 */
export async function updateWorkoutSessionStatus(sessionId, data) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** DELETE /tracker/workouts/sessions/{session_id} — non-completed only */
export async function deleteWorkoutSession(sessionId) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Items (individual sets)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /tracker/workouts/sessions/{session_id}/items
 * data: { exercise_id, set_number (≥1), reps_completed?, weight_used?, is_completed? }
 * Session must be in_progress. (exercise_id, set_number) must be unique per session.
 */
export async function logWorkoutSet(sessionId, data) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * POST /tracker/workouts/sessions/{session_id}/items/bulk
 * data: { exercise_id, sets: [{ exercise_id, set_number, reps_completed?, weight_used?, is_completed? }] }
 * Log all sets of ONE exercise atomically.
 */
export async function logWorkoutSetsBulk(sessionId, exerciseId, sets) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}/items/bulk`, {
    method: 'POST',
    body: JSON.stringify({ exercise_id: exerciseId, sets }),
  })
}

/** GET /tracker/workouts/sessions/{session_id}/items */
export async function getWorkoutSessionItems(sessionId) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}/items`)
}

/**
 * PATCH /tracker/workouts/sessions/{session_id}/items/{item_id}
 * data: { reps_completed?, weight_used?, is_completed? }
 */
export async function updateWorkoutSet(sessionId, itemId, data) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** DELETE /tracker/workouts/sessions/{session_id}/items/{item_id} */
export async function deleteWorkoutSet(sessionId, itemId) {
  return apiFetch(`/tracker/workouts/sessions/${sessionId}/items/${itemId}`, {
    method: 'DELETE',
  })
}
