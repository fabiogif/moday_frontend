"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { apiClient } from '@/lib/api-client'

interface User {
  id: string
  name: string
  email: string
  tenant_id?: string
  tenant?: {
    uuid: string
    name: string
  }
}

interface TrialStatus {
  is_trial: boolean
  is_active: boolean
  is_expired?: boolean
  days_remaining: number
  expires_at: string | null
  is_expiring_soon?: boolean
  needs_payment: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  trialStatus: TrialStatus | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  refreshTrialStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se há dados no localStorage ao inicializar
    const savedUser = localStorage.getItem('auth-user')
    const savedToken = localStorage.getItem('auth-token')
    const savedTrialStatus = localStorage.getItem('trial-status')
    
    if (process.env.NODE_ENV === 'development') {
      // console.log('AuthContext: Inicializando autenticação')
      // console.log('AuthContext: Token presente?', !!savedToken)
      // console.log('AuthContext: Token é JWT?', savedToken?.startsWith('eyJ'))
    }
    
    if (savedUser && savedToken) {
      // Validar se o token parece ser um JWT válido
      if (!savedToken.startsWith('eyJ')) {
        console.error('AuthContext: Token inválido encontrado (não é JWT). Limpando...')
        localStorage.removeItem('auth-user')
        localStorage.removeItem('auth-token')
        localStorage.removeItem('trial-status')
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      } else {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setToken(savedToken)
          setIsAuthenticated(true)
          
          // Recuperar trial status se existir
          if (savedTrialStatus) {
            try {
              const trialData = JSON.parse(savedTrialStatus)
              setTrialStatus(trialData)
            } catch (error) {
              console.error('Erro ao recuperar trial status:', error)
            }
          }
          
          // Also set the token in apiClient
          apiClient.setToken(savedToken)
          
          if (process.env.NODE_ENV === 'development') {
            // console.log('AuthContext: Autenticação restaurada com sucesso')
          }
        } catch (error) {
          console.error('Erro ao recuperar dados de autenticação:', error)
          localStorage.removeItem('auth-user')
          localStorage.removeItem('auth-token')
          localStorage.removeItem('trial-status')
        }
      }
    }
    
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include', // Importante para cookies
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer login')
      }

      const result = await response.json()
      const data = result.data // Extract the data object from the response
      
      if (process.env.NODE_ENV === 'development') {
        // console.log('AuthContext: Login bem-sucedido')
        // console.log('AuthContext: Token recebido?', !!data.token)
        // console.log('AuthContext: Token é JWT?', data.token?.startsWith('eyJ'))
        // console.log('AuthContext: Trial status:', data.trial_status)
      }
      
      setUser(data.user)
      setToken(data.token) // Armazenar o token JWT recebido
      setIsAuthenticated(true)

      // Salvar trial status se presente
      if (data.trial_status) {
        setTrialStatus(data.trial_status)
        localStorage.setItem('trial-status', JSON.stringify(data.trial_status))
      }

      // Salvar dados do usuário e token
      localStorage.setItem('auth-user', JSON.stringify(data.user))
      localStorage.setItem('auth-token', data.token)
      
      // Also set the token in apiClient
      apiClient.setToken(data.token)
      
      // Também salvar no cookie para compatibilidade
      document.cookie = `auth-token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}`
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      // Chamar logout no backend
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error)
    } finally {
      setUser(null)
      setToken(null)
      setTrialStatus(null)
      setIsAuthenticated(false)
      
      // Clear token from apiClient
      apiClient.clearToken()
      
      // Remover dados do localStorage
      localStorage.removeItem('auth-user')
      localStorage.removeItem('auth-token')
      localStorage.removeItem('trial-status')
      
      // Limpar cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  const refreshTrialStatus = async () => {
    if (!token) return
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/subscription/trial-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'include',
      })

      if (response.ok) {
        const result = await response.json()
        if (result.data) {
          setTrialStatus(result.data)
          localStorage.setItem('trial-status', JSON.stringify(result.data))
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar trial status:', error)
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('auth-user', JSON.stringify(userData))
  }

  const updateToken = (tokenValue: string) => {
    setToken(tokenValue)
    setIsAuthenticated(true)
    localStorage.setItem('auth-token', tokenValue)
    // Also set in apiClient
    apiClient.setToken(tokenValue)
  }

  const value: AuthContextType = {
    user,
    token,
    trialStatus,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setUser: updateUser,
    setToken: updateToken,
    refreshTrialStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
