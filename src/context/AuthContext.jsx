/**
 * Authentication Context
 *
 * Provides login, register, logout, and current user state to the entire app.
 * Tokens are stored in localStorage and attached to all API requests.
 * Works with the FastAPI backend at /api/v1/auth/*.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'

const AuthContext = createContext(null)

const API = '/api/v1'

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

function getStoredTokens() {
  try {
    return {
      access: localStorage.getItem('va-access-token'),
      refresh: localStorage.getItem('va-refresh-token'),
    }
  } catch {
    return { access: null, refresh: null }
  }
}

function storeTokens(access, refresh) {
  try {
    if (access) localStorage.setItem('va-access-token', access)
    if (refresh) localStorage.setItem('va-refresh-token', refresh)
  } catch { /* private browsing */ }
}

function clearTokens() {
  try {
    localStorage.removeItem('va-access-token')
    localStorage.removeItem('va-refresh-token')
  } catch { /* */ }
}

// ---------------------------------------------------------------------------
// API call helper with auth header
// ---------------------------------------------------------------------------

async function apiFetch(path, options = {}) {
  const { access } = getStoredTokens()
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }
  if (access) {
    headers['Authorization'] = `Bearer ${access}`
  }
  const res = await fetch(`${API}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = data.detail || data.message || `Request failed (${res.status})`
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message))
  }
  return data
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch current user from /auth/me
  const fetchUser = useCallback(async () => {
    const { access } = getStoredTokens()
    if (!access) {
      setUser(null)
      setLoading(false)
      return
    }
    try {
      const data = await apiFetch('/auth/me')
      setUser(data)
    } catch {
      // Token expired or invalid — try refresh
      try {
        await refreshTokens()
        const data = await apiFetch('/auth/me')
        setUser(data)
      } catch {
        clearTokens()
        setUser(null)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // On mount, check for existing session
  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Register
  const register = useCallback(async ({ email, password, full_name }) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, full_name }),
    })
    return data
  }, [])

  // Login
  const login = useCallback(async ({ email, password }) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    storeTokens(data.access_token, data.refresh_token)
    // Fetch full user profile
    try {
      const profile = await apiFetch('/auth/me')
      setUser(profile)
    } catch {
      setUser({ email })
    }
    return data
  }, [])

  // Logout
  const logout = useCallback(() => {
    clearTokens()
    setUser(null)
  }, [])

  // Refresh tokens
  const refreshTokens = useCallback(async () => {
    const { refresh } = getStoredTokens()
    if (!refresh) throw new Error('No refresh token')
    const data = await apiFetch('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refresh }),
    })
    storeTokens(data.access_token, data.refresh_token)
    return data
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshTokens,
    fetchUser,
    apiFetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext
