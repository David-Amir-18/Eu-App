const API_URL = import.meta.env.VITE_API_URL

function authHeaders() {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Simulated fallback data ────────────────────────────────────────────────────
const MOCK_USERS = [
  { id: 'dev-u1', username: 'jdoe92', full_name: 'John Doe', email: 'john.doe@example.com', role: 'general', is_active: true, created_at: '2026-01-15T10:30:00Z' },
  { id: 'dev-u2', username: 'fit_expert', full_name: 'Sarah Jenkins', email: 'sjenkins@physique.fit', role: 'fitness', is_active: true, created_at: '2026-02-01T14:22:00Z' },
  { id: 'dev-u3', username: 'rehab_specialist', full_name: 'Michael Corle', email: 'corle.m@recovery.net', role: 'rehab', is_active: true, created_at: '2026-02-15T09:10:00Z' },
  { id: 'dev-u4', username: 'sys_admin', full_name: 'Root Operator', email: 'admin@eu-app.tech', role: 'admin', is_active: true, created_at: '2025-12-01T08:00:00Z' },
  { id: 'dev-u5', username: 'blocked_user', full_name: 'Dormant Account', email: 'dormant@dummy.com', role: 'general', is_active: false, created_at: '2026-03-10T11:15:00Z' },
]

/**
 * [Admin] Fetch comprehensive list of all users.
 * Automatically utilizes mock payload validation if the backend rejects 
 * authorization while simulated admin modes are enabled.
 */
export async function getAllUsers() {
  const isSimulating = localStorage.getItem('dev_sim_admin') === 'true'

  try {
    const res = await fetch(`${API_URL}/auth/users`, {
      headers: authHeaders(),
    })
    
    const data = await res.json()

    if (!res.ok) {
      // If rejected explicitly because user is not backend-admin, AND user is testing locally
      if (res.status === 403 && isSimulating) {
        console.warn("[SimDev] Real Backend rejected access. Injecting Mock dataset for local UI verification.")
        return MOCK_USERS
      }
      throw new Error(data.detail || 'Failed to fetch users list')
    }
    return data
  } catch (err) {
    // Network failures or backend rejection catch-all for simulator validation
    if (isSimulating) {
       return MOCK_USERS
    }
    throw err
  }
}
