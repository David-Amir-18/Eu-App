// ── Imports ────────────────────────────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL

/**
 * Helper to perform authenticated fetch requests to the rehab endpoints.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers })

  if (!response.ok) {
    let errorMessage = 'An error occurred'
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch (e) {
      errorMessage = response.statusText
    }
    throw new Error(errorMessage)
  }

  // Handle 204 No Content
  if (response.status === 204) return null

  return response.json()
}

// ── Conditions & Exercises ───────────────────────────────────────────────────

export async function getConditions() {
  return apiFetch('/rehab/conditions')
}

export async function setMyCondition(conditionId, injuryDetails = null, recoveryStage = null) {
  return apiFetch('/rehab/my-condition', {
    method: 'PUT',
    body: JSON.stringify({
      condition_id: conditionId,
      injury_details: injuryDetails,
      recovery_stage: recoveryStage,
    }),
  })
}

export async function getRehabExercises() {
  return apiFetch('/rehab/exercises')
}

// ── Rehab Plans ──────────────────────────────────────────────────────────────

export async function getMyRehabPlans() {
  return apiFetch('/rehab/plans')
}

export async function createRehabPlan(data) {
  return apiFetch('/rehab/plans', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getRehabPlan(planId) {
  return apiFetch(`/rehab/plans/${planId}`)
}

export async function updateRehabPlan(planId, data) {
  return apiFetch(`/rehab/plans/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteRehabPlan(planId) {
  return apiFetch(`/rehab/plans/${planId}`, {
    method: 'DELETE',
  })
}

// ── Routines ─────────────────────────────────────────────────────────────────

export async function createRehabRoutine(planId, data) {
  return apiFetch(`/rehab/plans/${planId}/routines`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateRehabRoutine(routineId, data) {
  return apiFetch(`/rehab/routines/${routineId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteRehabRoutine(routineId) {
  return apiFetch(`/rehab/routines/${routineId}`, {
    method: 'DELETE',
  })
}

// ── Exercises in Routines ────────────────────────────────────────────────────

export async function addExerciseToRehabRoutine(routineId, data) {
  return apiFetch(`/rehab/routines/${routineId}/exercises`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deleteRoutineExercise(entryId) {
  return apiFetch(`/rehab/routines/exercises/${entryId}`, {
    method: 'DELETE',
  })
}