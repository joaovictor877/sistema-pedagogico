import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('pot_token'))
  const [usuario, setUsuario] = useState(() => {
    const u = localStorage.getItem('pot_usuario')
    return u ? JSON.parse(u) : null
  })

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const login = (tokenRecebido, usuarioRecebido) => {
    setToken(tokenRecebido)
    setUsuario(usuarioRecebido)
    localStorage.setItem('pot_token', tokenRecebido)
    localStorage.setItem('pot_usuario', JSON.stringify(usuarioRecebido))
    api.defaults.headers.common['Authorization'] = `Bearer ${tokenRecebido}`
  }

  const logout = () => {
    setToken(null)
    setUsuario(null)
    localStorage.removeItem('pot_token')
    localStorage.removeItem('pot_usuario')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
