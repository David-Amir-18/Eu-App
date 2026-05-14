const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * GET /rehab/exercises
 * Returns exercises scoped to the user's condition, or all exercises.
 */
export async function getRehabExercises() {
  const res = await fetch(`${API_URL}/rehab/exercises`, {
    headers: {
      ...authHeaders(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
  if (!res.ok) throw new Error('Failed to fetch rehab exercises')
  return await res.json()
}

/**
 * GET /rehab/conditions
 * Returns all available rehab conditions/injuries.
 */
export async function getRehabConditions() {
  const res = await fetch(`${API_URL}/rehab/conditions`, {
    headers: {
      ...authHeaders(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
    },
  })
  if (!res.ok) throw new Error('Failed to fetch rehab conditions')
  return await res.json()
}

/**
 * PUT /rehab/my-condition
 * Updates the user's active rehab condition.
 */
export async function setMyCondition(conditionId, injuryDetails = null, recoveryStage = null) {
  const res = await fetch(`${API_URL}/rehab/my-condition`, {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      condition_id: conditionId,
      injury_details: injuryDetails,
      recovery_stage: recoveryStage,
    }),
  })
  if (!res.ok) throw new Error('Failed to set rehab condition')
  return await res.json()
}
