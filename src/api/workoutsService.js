const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Plan CRUD ──────────────────────────────────────────────────────────────────

/** GET /workouts/plans — list the user's own plans (summary, no nested routines) */
export async function getWorkoutPlans() {
  const res = await fetch(`${API_URL}/workouts/plans`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch plans')
  return data // WorkoutPlanListItem[]
}

/** POST /workouts/plans — create a plan (metadata only) */
export async function createWorkoutPlan(payload) {
  const res = await fetch(`${API_URL}/workouts/plans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create workout plan')
  return data // WorkoutPlanResponse
}

/** GET /workouts/plans/:id — full plan with nested routines + exercises */
export async function getWorkoutPlan(planId) {
  const res = await fetch(`${API_URL}/workouts/plans/${planId}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch plan')
  return data // WorkoutPlanResponse
}

/** PUT /workouts/plans/:id — partial update of plan metadata */
export async function updateWorkoutPlan(planId, payload) {
  const res = await fetch(`${API_URL}/workouts/plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update plan')
  return data // WorkoutPlanResponse
}

/** DELETE /workouts/plans/:id */
export async function deleteWorkoutPlan(planId) {
  const res = await fetch(`${API_URL}/workouts/plans/${planId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to delete plan')
  }
  return true
}

// ── Routine CRUD ───────────────────────────────────────────────────────────────

/**
 * POST /workouts/plans/:planId/routines
 * payload: { name, description?, day_number?, day_of_week?, position?, is_rest_day? }
 * Returns: WorkoutPlanRoutineResponse
 */
export async function createRoutine(planId, payload) {
  const res = await fetch(`${API_URL}/workouts/plans/${planId}/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create routine')
  return data // WorkoutPlanRoutineResponse
}

/** GET /workouts/routines/:routineId — routine with full exercise details */
export async function getRoutine(routineId) {
  const res = await fetch(`${API_URL}/workouts/routines/${routineId}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch routine')
  return data // WorkoutPlanRoutineResponse
}

/** DELETE /workouts/routines/:routineId */
export async function deleteRoutine(routineId) {
  const res = await fetch(`${API_URL}/workouts/routines/${routineId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to delete routine')
  }
  return true
}

/** PUT /workouts/routines/:routineId — partial update of routine */
export async function updateRoutine(routineId, payload) {
  const res = await fetch(`${API_URL}/workouts/routines/${routineId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update routine')
  return data // WorkoutPlanRoutineResponse
}

/** Clone a routine to another day */
export async function cloneRoutine(planId, routineId, newDayOfWeek) {
  const original = await getRoutine(routineId)
  const created = await createRoutine(planId, {
    name: original.name,
    description: original.description,
    day_of_week: newDayOfWeek,
    is_rest_day: original.is_rest_day,
    position: original.position,
  })
  for (const ex of original.exercises || []) {
    await addExerciseToRoutine(created.id, {
      exercise_id: ex.exercise_id,
      position: ex.position,
      sets: ex.sets,
      reps: ex.reps,
      weight_kg: ex.weight_kg,
      rest_time_seconds: ex.rest_time_seconds,
    })
  }
  return created
}

// ── Exercise management within a routine ──────────────────────────────────────

/**
 * POST /workouts/routines/:routineId/exercises
 * payload: { exercise_id, position?, sets?, reps?, weight_kg?, rest_time_seconds? }
 * Returns: RoutineExerciseResponse (with embedded exercise details)
 */
export async function addExerciseToRoutine(routineId, payload) {
  const res = await fetch(`${API_URL}/workouts/routines/${routineId}/exercises`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to add exercise')
  return data // RoutineExerciseResponse
}
