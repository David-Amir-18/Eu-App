const API_URL = import.meta.env.VITE_API_URL

export async function login(username, password) {
  const body = new URLSearchParams()
  body.append('username', username)
  body.append('password', password)

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
