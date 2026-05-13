const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function getFilterOptions() {
  const res = await fetch(`${API_URL}/meals/filters`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch filter options')
  return data
}

export async function getMeals(params = {}) {
  const query = new URLSearchParams()
  if (params.page) query.append('page', params.page)
  if (params.page_size) query.append('page_size', params.page_size)
  if (params.search) query.append('search', params.search)
  if (params.tag && params.tag !== 'all') query.append('tag', params.tag)
  if (params.use_profile) query.append('use_profile', params.use_profile)
  if (params.max_calories) query.append('max_calories', params.max_calories)
  
  const res = await fetch(`${API_URL}/meals/?${query.toString()}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch meals')
  return data
}

export async function getRecommendedMeals(page = 1, pageSize = 20) {
  const query = new URLSearchParams({ page, page_size: pageSize })
  const res = await fetch(`${API_URL}/meals/recommend?${query.toString()}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch recommended meals')
  return data
}

export async function getMeal(mealId) {
  const res = await fetch(`${API_URL}/meals/${mealId}`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch meal details')
  return data
}
