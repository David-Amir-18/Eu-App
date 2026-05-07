const API_URL = import.meta.env.VITE_API_URL
const MOCK = import.meta.env.VITE_MOCK === 'true'

// ── Shared helper ──────────────────────────────────────────────────────────────
export function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Mock data ──────────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  user_id: 'mock-user-id',
  age: 25,
  weight: 75.0,
  height: 178.0,
  gender: null,
  primary_goal: 'GainMuscle',
  fitness_level: 'Intermediate',
  activity_level: 'ModeratelyActive',
  daily_calorie_target: 2400,
  current_streak: 7,
  longest_streak: 14,
  injury_details: null,
  recovery_stage: null,
  medical_diet_notes: null,
}

// ── Auth ───────────────────────────────────────────────────────────────────────

/**
 * Login — backend accepts email OR username as login_identifier
 */
export async function login(loginIdentifier, password) {
  if (MOCK) {
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('refresh_token', 'mock-refresh')
    localStorage.setItem('user_id', 'mock-user-id')
    localStorage.setItem('username', loginIdentifier || 'dev')
    return {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      token_type: 'bearer',
      user: { id: 'mock-user-id', email: 'dev@example.com', name: loginIdentifier || 'dev' },
    }
  }
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login_identifier: loginIdentifier, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Invalid credentials')
  return data // { access_token, refresh_token, token_type, user: { id, email, name } }
}

/**
 * Register — requires Full_name, username, email, password
 */
export async function register(fullName, username, email, password) {
  if (MOCK) {
    localStorage.setItem('token', 'mock-token')
    localStorage.setItem('refresh_token', 'mock-refresh')
    localStorage.setItem('user_id', 'mock-user-id')
    localStorage.setItem('username', username || 'dev')
    return {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh',
      token_type: 'bearer',
      user: { id: 'mock-user-id', email, name: username },
    }
  }
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Full_name: fullName, username, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Registration failed')
  return data
}

/**
 * Refresh access token using refresh_token
 */
export async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token')
  if (!refresh) throw new Error('No refresh token')
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refresh }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Token refresh failed')
  return data
}

/**
 * Get current user from token
 */
export async function getMe() {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Unauthorized')
  return data // { id, email, name }
}

// ── Health profile ─────────────────────────────────────────────────────────────

/**
 * Get health profile — uses JWT, no user_id param needed
 */
export async function getUserMetrics() {
  if (MOCK) return MOCK_PROFILE
  const res = await fetch(`${API_URL}/auth/health-profile`, {
    headers: authHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to fetch health profile')
  return data
}

/**
 * Create or update health profile — uses JWT, no user_id param needed
 */
export async function saveUserMetrics(metrics) {
  if (MOCK) return MOCK_PROFILE
  const res = await fetch(`${API_URL}/auth/health-profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(metrics),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Failed to save health profile')
  return data
}
