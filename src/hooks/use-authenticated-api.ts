/**
 * Hook para fazer requisições autenticadas
 * Verifica se o usuário está autenticado antes de fazer a requisição
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { apiClient, endpoints } from '@/lib/api-client'

interface UseAuthenticatedApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  isAuthenticated: boolean
  pagination?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export function useAuthenticatedApi<T>(
  endpoint: string,
  options: { immediate?: boolean; queryParams?: Record<string, any> } = {}
): UseAuthenticatedApiState<T> {
  const { immediate = true, queryParams = {} } = options
  const { token, isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    current_page: number
    last_page: number
    per_page: number
    total: number
  } | null>(null)

  // Serializar queryParams para evitar loop infinito no useCallback
  const queryParamsKey = useMemo(() => JSON.stringify(queryParams), [queryParams])

  const fetchData = useCallback(async () => {
    // Aguardar o AuthContext terminar de carregar antes de verificar autenticação
    if (authLoading) {
      return
    }
    
    if (!isAuthenticated || !token) {
      setError('Usuário não autenticado')
      return
    }

    // Garantir que o token está no ApiClient
    // Primeiro verifica se há token no localStorage (mais confiável)
    if (typeof window !== 'undefined') {
      const tokenFromStorage = localStorage.getItem('auth-token')
      if (tokenFromStorage) {
        apiClient.setToken(tokenFromStorage)
      } else {
        apiClient.setToken(token)
      }
    } else {
      apiClient.setToken(token)
    }

    setLoading(true)
    setError(null)

    try {
      // Reconstruir queryParams do queryParamsKey para garantir atualização
      const currentQueryParams = queryParamsKey ? JSON.parse(queryParamsKey) : {}
      
      // Construir URL com query parameters apenas se houver queryParams adicionais
      let finalEndpoint = endpoint
      
      if (Object.keys(currentQueryParams).length > 0) {
        const url = new URL(endpoint, window.location.origin)
        Object.entries(currentQueryParams).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            url.searchParams.append(key, value.toString())
          }
        })
        finalEndpoint = url.pathname + url.search
      }
      
      const response = await apiClient.get<T>(finalEndpoint)
      
      if (response.success) {
        // Verificar diferentes estruturas de resposta
        let extractedData = response.data
        let paginationData = null
        
        // 1. Se response.data é um array, usar diretamente
        if (Array.isArray(response.data)) {
          extractedData = response.data
        }
        // 2. Se response.data é um objeto e tem pagination no mesmo nível
        else if (response.data && typeof response.data === 'object' && 'pagination' in response.data) {
          // Verificar se há paginação
          paginationData = (response.data as any).pagination
          extractedData = response.data
        }
        // 3. Se response.data tem uma propriedade data (Laravel Resource Collection)
        else if (response.data && typeof response.data === 'object' && 'data' in response.data) {
          extractedData = (response.data as any).data
          // Verificar se há paginação
          if ('pagination' in response.data) {
            paginationData = (response.data as any).pagination
          }
        }
        // 4. Se response.data é um objeto simples 
        else if (response.data && typeof response.data === 'object') {
          extractedData = response.data
        }
        
        setData(extractedData as T)
        if (paginationData) {
          setPagination(paginationData)
        }
      } else {
        setError(response.message || 'Erro ao carregar dados')
      }
    } catch (err: any) {
      
      // Tentar extrair mais informações do erro
      let errorMessage = 'Erro na requisição'
      if (err.message) {
        errorMessage = err.message
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [endpoint, isAuthenticated, token, authLoading, queryParamsKey])

  useEffect(() => {
    // Só fazer fetch quando não estiver carregando autenticação e estiver autenticado
    if (immediate && !authLoading && isAuthenticated && token) {
      fetchData()
    }
  }, [immediate, authLoading, isAuthenticated, token, fetchData])

  // Retornar isAuthenticated como false apenas se não estiver carregando E não estiver autenticado
  // Isso evita mostrar "não autenticado" durante o carregamento inicial
  const effectiveIsAuthenticated = authLoading ? true : isAuthenticated

  return { 
    data, 
    loading, 
    error, 
    refetch: fetchData,
    isAuthenticated: effectiveIsAuthenticated,
    pagination: pagination || undefined
  }
}

// Hooks específicos para endpoints autenticados
export function useAuthenticatedProducts() {
  return useAuthenticatedApi(endpoints.products.list, { immediate: true })
}

export function useAuthenticatedPermissions() {
  const result = useAuthenticatedApi(endpoints.permissions.list, { 
    immediate: true
  })
  
  // Extrair permissions do response.data.permissions
  const permissions = result.data && typeof result.data === 'object' && 'permissions' in result.data 
    ? (result.data as any).permissions 
    : result.data
  
  return {
    ...result,
    data: permissions
  }
}

export function useAuthenticatedProductStats() {
  return useAuthenticatedApi(endpoints.products.stats, { immediate: true })
}

export function useAuthenticatedCategories() {
  return useAuthenticatedApi(endpoints.categories.list, { immediate: true })
}

export function useAuthenticatedCategoryStats() {
  return useAuthenticatedApi(endpoints.categories.stats, { immediate: true })
}

export function useAuthenticatedOrders(params?: { page?: number; per_page?: number; status?: string }) {
  const queryString = params ? `?${new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString()}` : ''
  
  return useAuthenticatedApi(`${endpoints.orders.list}${queryString}`, { immediate: true })
}

export function useAuthenticatedOrderStats() {
  return useAuthenticatedApi(endpoints.orders.stats, { immediate: true })
}

export function useAuthenticatedTables() {
  return useAuthenticatedApi(endpoints.tables.list, { immediate: true })
}

export function useAuthenticatedPlans() {
  return useAuthenticatedApi(endpoints.plans.list, { immediate: true })
}

export function useAuthenticatedServiceTypes() {
  return useAuthenticatedApi(endpoints.serviceTypes.list, { immediate: true })
}

export function useAuthenticatedActiveServiceTypes() {
  return useAuthenticatedApi(endpoints.serviceTypes.active, { immediate: true })
}

export function useAuthenticatedMenuServiceTypes() {
  return useAuthenticatedApi(endpoints.serviceTypes.menu, { immediate: true })
}

export function useAuthenticatedTableStats() {
  return useAuthenticatedApi(endpoints.tables.stats, { immediate: true })
}

export function useAuthenticatedProfiles() {
  const result = useAuthenticatedApi(endpoints.profiles.list, { 
    immediate: true
  })
  
  // Extrair profiles do response.data.profiles
  const profiles = result.data && typeof result.data === 'object' && 'profiles' in result.data 
    ? (result.data as any).profiles 
    : result.data
  
  return {
    ...result,
    data: profiles
  }
}

export function useAuthenticatedUsers(page: number = 1, perPage: number = 15) {
  const result = useAuthenticatedApi(endpoints.users.list, { 
    immediate: true, 
    queryParams: { page, per_page: perPage } 
  })
  
  // Extrair users do response.data.users
  const users = result.data && typeof result.data === 'object' && 'users' in result.data 
    ? (result.data as any).users 
    : result.data
  
  return {
    ...result,
    data: users,
    pagination: result.pagination
  }
}

export function useAuthenticatedRoles() {
  return useAuthenticatedApi(endpoints.roles.list, { immediate: true })
}

export function useAuthenticatedClients() {
  return useAuthenticatedApi(endpoints.clients.list, { immediate: true })
}

export function useAuthenticatedOrdersByTable(tableUuid: string | null) {
  return useAuthenticatedApi(
    tableUuid ? endpoints.orders.getByTable(tableUuid) : '',
    { immediate: !!tableUuid }
  )
}

export function useAuthenticatedTodayOrders() {
  return useAuthenticatedApi(endpoints.orders.getToday, { immediate: true })
}

export function useAuthenticatedClientStats() {
  return useAuthenticatedApi(endpoints.clients.stats, { immediate: true })
}

// Reviews
export function useAuthenticatedReviews(status?: string) {
  return useAuthenticatedApi(endpoints.reviews.list(status), { immediate: true })
}

export function useAuthenticatedReviewStats() {
  return useAuthenticatedApi(endpoints.reviews.stats, { immediate: true })
}

export function useAuthenticatedRecentReviews(limit: number = 5) {
  return useAuthenticatedApi(endpoints.reviews.recent(limit), { immediate: true })
}

// Hook para operações de mutação (POST, PUT, DELETE)
export function useMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, isAuthenticated } = useAuth()

  const mutate = useCallback(async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: P
  ): Promise<T | null> => {
    if (!isAuthenticated || !token) {
      setError('Usuário não autenticado')
      throw new Error('Usuário não autenticado')
    }

    // Garantir que o token está no ApiClient e recarregar do localStorage se necessário
    apiClient.setToken(token)
    apiClient.reloadToken() // Forçar recarga do token para garantir sincronização

    setLoading(true)
    setError(null)

    try {
      let response
      switch (method) {
        case 'POST':
          response = await apiClient.post<T>(endpoint, data)
          break
        case 'PUT':
          response = await apiClient.put<T>(endpoint, data)
          break
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint)
          break
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, data)
          break
      }

      // Verificar se a resposta existe e é válida
      if (!response) {
        const errorMsg = 'Resposta vazia do servidor'
        setError(errorMsg)
        throw new Error(errorMsg)
      }

      if (response.success) {
        return response.data
      } else {
        const errorMsg = response.message || 'Erro na operação'
        setError(errorMsg)
        throw new Error(errorMsg)
      }
    } catch (err: any) {
      // Log detalhado apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {

      }
      
      let errorMessage = 'Erro na requisição'
      
      // Tratar erros de validação (HTTP 422)
      if (err.errors || err.data) {
        // Laravel retorna erros em diferentes formatos
        const validationErrors = err.errors || err.data || {}
        const errorMessages: string[] = []
        
        Object.entries(validationErrors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => errorMessages.push(msg))
          } else if (typeof messages === 'string') {
            errorMessages.push(messages)
          }
        })
        
        if (errorMessages.length > 0) {
          errorMessage = errorMessages.join('\n')
        } else if (err.message) {
          errorMessage = err.message
        }
      } else if (err.message) {
        errorMessage = err.message
      }
      
      setError(errorMessage)
      throw err  // Lançar erro original ao invés de new Error()
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token])

  return { mutate, loading, error }
}

// Hook para operações de mutação com tratamento de erros de validação
export function useMutationWithValidation<T, P = any>(
  setFormError: any,
  fieldMapping?: Record<string, string>
) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { token, isAuthenticated } = useAuth()

  const mutate = useCallback(async (
    endpoint: string,
    method: 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    data?: P
  ): Promise<T | null> => {
    if (!isAuthenticated || !token) {
      setError('Usuário não autenticado')
      return null
    }

    // Garantir que o token está no ApiClient e recarregar do localStorage se necessário
    apiClient.setToken(token)
    apiClient.reloadToken() // Forçar recarga do token para garantir sincronização

    setLoading(true)
    setError(null)

    try {
      let response
      switch (method) {
        case 'POST':
          response = await apiClient.post<T>(endpoint, data)
          break
        case 'PUT':
          response = await apiClient.put<T>(endpoint, data)
          break
        case 'DELETE':
          response = await apiClient.delete<T>(endpoint)
          break
        case 'PATCH':
          response = await apiClient.patch<T>(endpoint, data)
          break
      }

      if (response.success) {
        return response.data
      } else {
        setError(response.message || 'Erro na operação')
        return null
      }
    } catch (err: any) {

      // Tratar erros de validação do backend
      if (err.data && err.data.data) {

        // Mapear erros para campos do formulário
        Object.entries(err.data.data).forEach(([field, messages]) => {
          const fieldName = fieldMapping?.[field] || field
          const errorMessage = Array.isArray(messages) ? messages[0] : messages
          
          setFormError(fieldName, {
            type: 'server',
            message: errorMessage
          })
        })
        
        return null
      } else {
        setError(err.message || 'Erro na requisição')
        return null
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, token, setFormError])

  return { mutate, loading, error }
}

// Hook específico para formas de pagamento
export function useAuthenticatedPaymentMethods() {
  return useAuthenticatedApi(endpoints.paymentMethods.list)
}

// Hook específico para formas de pagamento ativas
export function useAuthenticatedActivePaymentMethods() {
  return useAuthenticatedApi(endpoints.paymentMethods.active)
}