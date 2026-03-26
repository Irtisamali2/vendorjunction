import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem('vj_token', newToken)
    setToken(newToken)
    setUser(newUser)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('vj_token')
    setToken(null)
    setUser(null)
  }, [])

  // On mount, check localStorage and rehydrate
  useEffect(() => {
    const storedToken = localStorage.getItem('vj_token')
    if (!storedToken) {
      setLoading(false)
      return
    }
    setToken(storedToken)
    api.get('/api/auth/me')
      .then((res) => {
        setUser(res.data.user || res.data)
      })
      .catch(() => {
        localStorage.removeItem('vj_token')
        setToken(null)
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export default AuthContext
