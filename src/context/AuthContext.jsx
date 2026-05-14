import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { login as apiLogin, register as apiRegister, refreshToken, getMe } from '../api/authService.js'

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ── Provider ───────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)   // { id, email, name }
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)   // true while we verify the token on mount
  const isRefreshing = useRef(false)
  const pendingQueue = useRef([])                 // requests waiting for the refresh to finish

  // ── Token helpers ────────────────────────────────────────────────────────────
  function saveTokens({ access_token, refresh_token }) {
    localStorage.setItem('token', access_token)
    if (refresh_token) localStorage.setItem('refresh_token', refresh_token)
  }

  function clearTokens() {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
  }

  function getAccessToken() {
    return localStorage.getItem('token')
  }

  // ── Refresh logic ─────────────────────────────────────────────────────────────
  async function doRefresh() {
    try {
      const data = await refreshToken()
      saveTokens(data)
      return data.access_token
    } catch {
      clearTokens()
      setUser(null)
      throw new Error('Session expired. Please log in again.')
    }
  }

  // ── apiFetch — drop-in fetch wrapper with auto-refresh ───────────────────────
  //
  // Usage: replace `fetch(url, opts)` with `apiFetch(url, opts)` in any service.
  // On a 401 it will refresh the token once, replay the request, and resolve.
  // If the refresh also fails it rejects and clears the session.
  //
  const apiFetch = useCallback(async (url, options = {}) => {
    const makeHeaders = () => {
      const token = getAccessToken()
      return {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    }

    // First attempt
    let res = await fetch(url, { ...options, headers: makeHeaders() })

    if (res.status !== 401) return res

    // ── 401 handling ──
    if (isRefreshing.current) {
      // Queue this request until the ongoing refresh finishes
      return new Promise((resolve, reject) => {
        pendingQueue.current.push({ resolve, reject, url, options })
      })
    }

    isRefreshing.current = true
    try {
      const newToken = await doRefresh()

      // Replay queued requests with the new token
      const queued = pendingQueue.current.splice(0)
      queued.forEach(({ resolve, reject, url: qUrl, options: qOpts }) => {
        fetch(qUrl, {
          ...qOpts,
          headers: { ...(qOpts.headers || {}), Authorization: `Bearer ${newToken}` },
        }).then(resolve).catch(reject)
      })

      // Replay the original request
      res = await fetch(url, {
        ...options,
        headers: { ...makeHeaders(), Authorization: `Bearer ${newToken}` },
      })
      return res
    } catch (err) {
      // Reject all queued requests too
      pendingQueue.current.splice(0).forEach(({ reject }) => reject(err))
      throw err
    } finally {
      isRefreshing.current = false
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Bootstrap on mount: verify stored token ──────────────────────────────────
  useEffect(() => {
    async function bootstrap() {
      const token = getAccessToken()
      if (!token) { setLoading(false); return }

      async function checkAccess(t) {
        try {
          const probe = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, { headers: { Authorization: `Bearer ${t}` } })
          setIsAdmin(probe.ok)
        } catch {
          setIsAdmin(false)
        }
      }

      try {
        const me = await getMe()
        setUser(me)
        await checkAccess(token)
      } catch {
        // Access token invalid — try to refresh
        try {
          const newToken = await doRefresh()
          const me = await getMe()
          setUser(me)
          await checkAccess(newToken)
        } catch {
          // Refresh also failed — clear everything
          clearTokens()
          setUser(null)
          setIsAdmin(false)
        }
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auth actions ─────────────────────────────────────────────────────────────
  async function login(identifier, password) {
    const data = await apiLogin(identifier, password)
    saveTokens(data)
    setUser(data.user)
    try {
      const probe = await fetch(`${import.meta.env.VITE_API_URL}/auth/users`, { headers: { Authorization: `Bearer ${data.access_token}` } })
      setIsAdmin(probe.ok)
    } catch {
      setIsAdmin(false)
    }
    return data
  }

  async function register(fullName, username, email, password) {
    const data = await apiRegister(fullName, username, email, password)
    saveTokens(data)
    setUser(data.user)
    setIsAdmin(false) // Newly registered are never admins immediately
    return data
  }

  function logout() {
    clearTokens()
    setUser(null)
    setIsAdmin(false)
  }

  // ── Context value ─────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, register, logout, apiFetch }}>
      {children}
    </AuthContext.Provider>
  )
}
