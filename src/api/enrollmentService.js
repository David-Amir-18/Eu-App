// ── Enrollment Service ────────────────────────────────────────────────────────
// Wraps POST /enrollments   GET /enrollments   GET /enrollments/active/...
// PATCH /enrollments/{id}/status   DELETE /enrollments/{id}

const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  })

  if (!res.ok) {
    let msg = 'An error occurred'
    try {
      const err = await res.json()
      msg = err.detail || err.message || msg
    } catch (_) {
      msg = res.statusText
    }
    throw new Error(msg)
  }

  if (res.status === 204) return null
  return res.json()
}

// ─────────────────────────────────────────────────────────────────────────────
// Create — POST /enrollments/
// At least one of workout_plan_id, meal_plan_id, rehab_plan_id must be supplied.
// Returns 409 if user already has an active enrollment for that plan type.
// ─────────────────────────────────────────────────────────────────────────────
export async function createEnrollment({ workoutPlanId, mealPlanId, rehabPlanId }) {
  return apiFetch('/enrollments/', {
    method: 'POST',
    body: JSON.stringify({
      workout_plan_id: workoutPlanId ?? null,
      meal_plan_id:    mealPlanId    ?? null,
      rehab_plan_id:   rehabPlanId   ?? null,
    }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// List — GET /enrollments/?status=active|paused|completed|dropped
// ─────────────────────────────────────────────────────────────────────────────
export async function listEnrollments(status = null) {
  const qs = status ? `?status=${status}` : ''
  return apiFetch(`/enrollments/${qs}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Get single — GET /enrollments/{id}
// ─────────────────────────────────────────────────────────────────────────────
export async function getEnrollment(enrollmentId) {
  return apiFetch(`/enrollments/${enrollmentId}`)
}

// ─────────────────────────────────────────────────────────────────────────────
// Active queries — returns 404 (throws) if not enrolled
// ─────────────────────────────────────────────────────────────────────────────
export async function getActiveWorkoutEnrollment() {
  return apiFetch('/enrollments/active/workout')
}

export async function getActiveMealEnrollment() {
  return apiFetch('/enrollments/active/meal')
}

export async function getActiveRehabEnrollment() {
  return apiFetch('/enrollments/active/rehab')
}

// ─────────────────────────────────────────────────────────────────────────────
// Update status — PATCH /enrollments/{id}/status
// status: 'active' | 'paused' | 'completed' | 'dropped'
// Transitions: active → paused/completed/dropped; paused → active/dropped
// completed and dropped are terminal — no further changes.
// ─────────────────────────────────────────────────────────────────────────────
export async function updateEnrollmentStatus(enrollmentId, status) {
  return apiFetch(`/enrollments/${enrollmentId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete — DELETE /enrollments/{id}
// Hard-delete. Completed enrollments CANNOT be deleted (409).
// ─────────────────────────────────────────────────────────────────────────────
export async function deleteEnrollment(enrollmentId) {
  return apiFetch(`/enrollments/${enrollmentId}`, { method: 'DELETE' })
}
