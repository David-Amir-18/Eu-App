const API_URL = import.meta.env.VITE_API_URL
const MOCK = import.meta.env.VITE_MOCK === 'true'

const MOCK_PROFILE = {
  Age: 25,
  Weight: '75.00',
  Height: '178.00',
  PrimaryGoal: 'GainMuscle',
  FitnessLevel: 'Intermediate',
  ActivityLevel: 'ModeratelyActive',
  DailyCalorieTarget: 2400,
  CurrentStreak: 7,
  LongestStreak: 14,
  InjuryDetails: null,
  MedicalDietNotes: null,
}

export async function login(username, password) {
  const body = new URLSearchParams()
  body.append('username', username)
  body.append('password', password)

  if (MOCK) {
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user_id', 'mock-user-id')
    localStorage.setItem('username', username || 'dev')
    return { access_token: 'mock-token', token_type: 'bearer', user_id: 'mock-user-id' }
  }
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Invalid credentials')
  return data // { access_token, token_type }
}

export async function register(username, email, password) {
  if (MOCK) {
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('user_id', 'mock-user-id')
    localStorage.setItem('username', username || 'dev')
    return { access_token: 'mock-token', token_type: 'bearer', user_id: 'mock-user-id' }
  }
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Registration failed')
  return data // { id, username, email }
}

export async function getMe(token) {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Unauthorized')
  return data // { id, username, email }
}

export async function getUserMetrics(userId) {
  if (MOCK) return MOCK_PROFILE
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/user-metrics?user_id=${userId}`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch metrics')
  return data
}

export async function saveUserMetrics(userId, metrics) {
  if (MOCK) return MOCK_PROFILE
  const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/user-metrics?user_id=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metrics),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save metrics')
  return data
}
