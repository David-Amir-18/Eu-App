// ── Rehab Tracking Service ────────────────────────────────────────────────────
// Wraps all /tracker/rehab endpoints

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
 * POST /tracker/rehab/sessions
 * data: { plan_id (required), routine_id (required), scheduled_date?, status: 'scheduled'|'in_progress' }
 * Exercise logs are auto-created from the routine prescription.
 */
export async function createRehabSession(data) {
  return apiFetch('/tracker/rehab/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * GET /tracker/rehab/sessions
 * filters: { status?, from_date?, to_date?, plan_id? }
 */
export async function listRehabSessions(filters = {}) {
  const params = new URLSearchParams()
  if (filters.status)    params.append('status', filters.status)
  if (filters.from_date) params.append('from_date', filters.from_date)
  if (filters.to_date)   params.append('to_date', filters.to_date)
  if (filters.plan_id)   params.append('plan_id', filters.plan_id)
  return apiFetch(`/tracker/rehab/sessions?${params}`)
}

/** GET /tracker/rehab/sessions/{session_id} */
export async function getRehabSession(sessionId) {
  return apiFetch(`/tracker/rehab/sessions/${sessionId}`)
}

/**
 * PATCH /tracker/rehab/sessions/{session_id}/status
 * data: { status: 'in_progress'|'completed'|'skipped', pain_level?(1-10), notes?, completed_at? }
 * Completing requires ≥1 exercise marked is_completed=true.
 */
export async function updateRehabSessionStatus(sessionId, data) {
  return apiFetch(`/tracker/rehab/sessions/${sessionId}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** DELETE /tracker/rehab/sessions/{session_id} — non-completed only */
export async function deleteRehabSession(sessionId) {
  return apiFetch(`/tracker/rehab/sessions/${sessionId}`, { method: 'DELETE' })
}

// ─────────────────────────────────────────────────────────────────────────────
// Session Exercises (performance logging)
// ─────────────────────────────────────────────────────────────────────────────

/** GET /tracker/rehab/sessions/{session_id}/exercises */
export async function getRehabSessionExercises(sessionId) {
  return apiFetch(`/tracker/rehab/sessions/${sessionId}/exercises`)
}

/**
 * PATCH /tracker/rehab/sessions/{session_id}/exercises/{entry_id}
 * data: { sets_completed?, reps_completed?, hold_time_seconds?, is_completed?, pain_level?(1-10), notes? }
 * Session must be in_progress.
 */
export async function updateRehabSessionExercise(sessionId, entryId, data) {
  return apiFetch(`/tracker/rehab/sessions/${sessionId}/exercises/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /tracker/rehab/streaks
 * Returns: { current_streak, longest_streak, last_active_day }
 */
export async function getRehabStreaks() {
  return apiFetch('/tracker/rehab/streaks')
}

/**
 * GET /tracker/rehab/sessions/{session_id}/detail
 * Returns planned vs actual comparison per exercise.
 * Fields: routine_name, session_status, total_exercises, exercises_completed,
 *         exercises[]: { planned_sets, planned_reps, planned_hold_seconds, actual values, pain_level }
 */
export async function getRehabSessionDetail(sessionId) {
  return apiFetch(`/tracker/rehab/sessions/${sessionId}/detail`)
}

/**
 * GET /tracker/rehab/exercises/{exercise_id}/progress
 * Returns chronological timeline of performance for one exercise.
 * Fields: exercise_id, timeline[]: { scheduled_date, routine_name, planned/actual sets/reps/hold, pain_level }
 */
export async function getRehabExerciseProgress(exerciseId) {
  return apiFetch(`/tracker/rehab/exercises/${exerciseId}/progress`)
}

/**
 * GET /tracker/rehab/history
 * Returns all completed sessions with full exercise breakdown.
 * Fields: total, results[]: { session_id, plan_id, routine_name, dates, pain_level, total_exercises, exercises_completed, exercises[] }
 */
export async function getRehabHistory() {
  return apiFetch('/tracker/rehab/history')
}
