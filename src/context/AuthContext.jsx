import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

/**
 * Dashboard gate.
 *
 * This is a front-of-house lock, NOT security. The credentials below ship in
 * the JavaScript bundle, so anyone who opens devtools can read them, and the
 * Apps Script endpoint is reachable without going through this screen at all.
 * It keeps casual visitors off the admin view; it does not protect the data.
 *
 * Real protection would mean checking credentials inside the Apps Script and
 * having it refuse to return rows without a valid session.
 *
 * Setting VITE_DASHBOARD_USER / VITE_DASHBOARD_PASSWORD at least keeps the
 * values out of the public repository.
 */
const USERNAME = import.meta.env.VITE_DASHBOARD_USER || 'accel'
const PASSWORD = import.meta.env.VITE_DASHBOARD_PASSWORD || '1234567'

// sessionStorage, not localStorage: signing in lasts for the tab, not forever.
const STORAGE_KEY = 'acel.auth'

const AuthContext = createContext(null)

function readStoredAuth() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(readStoredAuth)

  useEffect(() => {
    try {
      if (isAuthenticated) sessionStorage.setItem(STORAGE_KEY, 'true')
      else sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // Blocked storage just means the session is not remembered.
    }
  }, [isAuthenticated])

  /** Returns true on success so the caller can show an error on false. */
  const login = useCallback((username, password) => {
    const ok = String(username).trim() === USERNAME && String(password) === PASSWORD
    if (ok) setIsAuthenticated(true)
    return ok
  }, [])

  const logout = useCallback(() => setIsAuthenticated(false), [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout }),
    [isAuthenticated, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside an AuthProvider')
  return context
}
