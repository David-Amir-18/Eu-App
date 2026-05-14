const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/**
 * [Admin] Fetch comprehensive list of all users.
 * Standard authorized REST operation.
 */
export async function getAllUsers() {
  const res = await fetch(`${API_URL}/auth/users`, {
    headers: authHeaders(),
  })
  
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || 'Failed to fetch users list')
  }
  return data
}
