const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Meal Library ───────────────────────────────────────────────────────────────

/**
 * GET /meals/ — paginated + filtered meal list
 * params: { page, pageSize, search, tag, maxCalories, minProteinG, maxFatG, maxSodiumMg, maxSugarG, useProfile }
 */
export async function getMeals({ page = 1, pageSize = 20, search, tag, maxCalories, minProteinG, maxFatG, maxSodiumMg, maxSugarG, useProfile = false } = {}) {
  const params = new URLSearchParams({ page, page_size: pageSize })
  if (search)        params.set('search',        search)
  if (tag)           params.set('tag',            tag)
  if (maxCalories)   params.set('max_calories',   maxCalories)
  if (minProteinG)   params.set('min_protein_g',  minProteinG)
  if (maxFatG)       params.set('max_fat_g',      maxFatG)
  if (maxSodiumMg)   params.set('max_sodium_mg',  maxSodiumMg)
  if (maxSugarG)     params.set('max_sugar_g',    maxSugarG)
  if (useProfile)    params.set('use_profile',    'true')

  const res = await fetch(`${API_URL}/meals/?${params}`, {
    headers: {
      ...authHeaders(),
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch meals')
  return data  // { total, page, page_size, results: MealListItem[] }
}

/** GET /meals/filters — available tag options */
export async function getMealFilterOptions() {
  const res = await fetch(`${API_URL}/meals/filters`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch filter options')
  return data // { tags: string[] }
}

// ── Meal Plan CRUD ─────────────────────────────────────────────────────────────

/** GET /meal/plans/ — list user's own plans (summary) */
export async function getMealPlans() {
  const res = await fetch(`${API_URL}/meal/plans/`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch meal plans')
  return data // MealPlanListItem[]
}

/**
 * POST /meal/plans/ — create a meal plan
 * payload: { title, description?, goal_type?, start_date?, end_date? }
 */
export async function createMealPlan(payload) {
  const res = await fetch(`${API_URL}/meal/plans/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create meal plan')
  return data // MealPlanResponse
}

/** GET /meal/plans/:id — full plan with slot_meals[] embedded */
export async function getMealPlan(planId) {
  const res = await fetch(`${API_URL}/meal/plans/${planId}`, { headers: authHeaders() })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch meal plan')
  return data // MealPlanResponse
}

/** PUT /meal/plans/:id — partial update */
export async function updateMealPlan(planId, payload) {
  const res = await fetch(`${API_URL}/meal/plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to update meal plan')
  return data
}

/** DELETE /meal/plans/:id */
export async function deleteMealPlan(planId) {
  const res = await fetch(`${API_URL}/meal/plans/${planId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to delete meal plan')
  }
  return true
}

// ── Slot management ────────────────────────────────────────────────────────────

/**
 * POST /meal/plans/:planId/slots
 * payload: { meal_id, meal_type: 'breakfast'|'lunch'|'dinner'|'snack', note? }
 */
export async function addMealSlot(planId, payload) {
  const res = await fetch(`${API_URL}/meal/plans/${planId}/slots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to add meal slot')
  return data // MealPlanSlotResponse
}

/** DELETE /meal/plans/:planId/slots/:slotId */
export async function removeMealSlot(planId, slotId) {
  const res = await fetch(`${API_URL}/meal/plans/${planId}/slots/${slotId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to remove meal slot')
  }
  return true
}

// ── Admin: Meal CRUD ────────────────────────────────────────────────────────────

/**
 * POST /meals/ — [Admin] Add a meal to library
 * payload: { title, url?, image_url?, servings?, prep_time?, time_to_make?, instructions?, guide_info?, nutrition?, tags[], ingredients[] }
 */
export async function createMeal(payload) {
  const res = await fetch(`${API_URL}/meals/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to create meal')
  return data
}

/**
 * DELETE /meals/:id — [Admin] Permanently delete a meal
 */
export async function deleteMeal(mealId) {
  const res = await fetch(`${API_URL}/meals/${mealId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to delete meal')
  }
  return true
}
