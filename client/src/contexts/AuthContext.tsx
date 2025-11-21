import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../api/client'
import { User, AuthResponse } from '../types'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: { emailOrUsername: string; password: string }) => Promise<void>
  register: (data: { username: string; displayName: string; email: string; password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: { emailOrUsername: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials)
      const { token, user } = response.data

      setToken(token)
      setUser(user)

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error: any) {
      throw error.response?.data || error
    }
  }

  const register = async (data: { username: string; displayName: string; email: string; password: string }) => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', data)
      const { token, user } = response.data

      setToken(token)
      setUser(user)

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } catch (error: any) {
      throw error.response?.data || error
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}