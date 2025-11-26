'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: number
  name: string
  email: string
  role: 'super_admin' | 'admin' | 'analyst'
  is_active: boolean
  last_login_at: string | null
  permissions: Record<string, string[]>
}

interface AdminAuthContextType {
  admin: AdminUser | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  isAuthenticated: boolean
  isSuperAdmin: boolean
  isAdmin: boolean
  isAnalyst: boolean
  hasPermission: (permission: string) => boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Carrega dados do localStorage
  useEffect(() => {
    const loadAdminData = () => {
      try {
        const storedToken = localStorage.getItem('admin-token')
        const storedAdmin = localStorage.getItem('admin-user')

        if (storedToken && storedAdmin) {
          setToken(storedToken)
          setAdmin(JSON.parse(storedAdmin))
        }
      } catch (error) {

      } finally {
        setIsLoading(false)
      }
    }

    loadAdminData()
  }, [])

  // Login
  const login = async (email: string, password: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

      const response = await fetch(`${apiUrl}/api/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer login')
      }

      const { admin: adminData, token: authToken } = data.data

      // Salva no localStorage
      localStorage.setItem('admin-token', authToken)
      localStorage.setItem('admin-user', JSON.stringify(adminData))

      setToken(authToken)
      setAdmin(adminData)

      // Busca permissões
      await fetchAdminData(authToken)

      router.push('/admin/dashboard')
    } catch (error) {

      throw error
    }
  }

  // Busca dados completos do admin
  const fetchAdminData = async (authToken: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const adminData = data.data
        
        setAdmin(adminData)
        localStorage.setItem('admin-user', JSON.stringify(adminData))
      }
    } catch (error) {

    }
  }

  // Logout
  const logout = async () => {
    try {
      if (token) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        await fetch(`${apiUrl}/api/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {

    } finally {
      // Limpa dados locais
      localStorage.removeItem('admin-token')
      localStorage.removeItem('admin-user')
      setToken(null)
      setAdmin(null)
      router.push('/admin/login')
    }
  }

  // Refresh token
  const refreshToken = async () => {
    try {
      if (!token) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/admin/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        const newToken = data.data.token

        localStorage.setItem('admin-token', newToken)
        setToken(newToken)
      } else {
        // Token inválido, faz logout
        logout()
      }
    } catch (error) {

      logout()
    }
  }

  // Helpers
  const isAuthenticated = !!admin && !!token
  const isSuperAdmin = admin?.role === 'super_admin'
  const isAdmin = admin?.role === 'admin'
  const isAnalyst = admin?.role === 'analyst'

  const hasPermission = (permission: string): boolean => {
    if (!admin) return false
    if (isSuperAdmin) return true // Super admin tem todas as permissões

    const [module, action] = permission.split('.')
    return admin.permissions[module]?.includes(action) || false
  }

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isLoading,
        login,
        logout,
        refreshToken,
        isAuthenticated,
        isSuperAdmin,
        isAdmin,
        isAnalyst,
        hasPermission,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth deve ser usado dentro de AdminAuthProvider')
  }
  return context
}

