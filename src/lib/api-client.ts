/**
 * Cliente HTTP padronizado para comunicação com a API Laravel
 * Inclui autenticação JWT, tratamento de erros e cache
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

interface ApiError {
  success: false
  message: string
  data?: any
  errors?: Record<string, string[]>
  status?: number
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      // Primeiro tenta pegar do localStorage (usando a mesma chave do AuthContext)
      this.token = localStorage.getItem('auth-token')
      
      // Se não encontrar, tenta pegar do cookie
      if (!this.token) {
        const cookies = document.cookie.split(';')
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='))
        if (authCookie) {
          this.token = authCookie.split('=')[1]
        }
      }
      
      if (process.env.NODE_ENV === 'development') {
        // console.log('ApiClient: Token carregado:', this.token ? 'Sim' : 'Não')
      }
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token)
      // Também salvar no cookie para sincronizar com AuthContext
      document.cookie = `auth-token=${token}; path=/; max-age=${2 * 60 * 60}`
    }
    if (process.env.NODE_ENV === 'development') {
      // console.log('ApiClient: Token definido:', token ? 'Sim' : 'Não')
    }
  }

  // Função para forçar recarga do token
  reloadToken() {
    this.loadToken()
  }

  // Função para obter o token atual
  getToken() {
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-token')
      // Também remover do cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  private getHeaders(isFormData = false): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    }

    // Não definir Content-Type para FormData, deixar o navegador definir
    if (!isFormData) {
      headers['Content-Type'] = 'application/json'
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Tratar resposta 204 No Content (comum em DELETE)
    if (response.status === 204) {
      return {
        success: true,
        message: 'Operação realizada com sucesso',
        data: null as T
      }
    }

    try {
      const data = await response.json()

      if (!response.ok) {
        // Log amigável apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.group(`🔴 Erro ${response.status} - ${response.statusText}`)
          // console.log('Mensagem:', data.message || 'Sem mensagem')
          if (data.errors) {
            // console.log('Erros de validação:', data.errors)
          }
          console.groupEnd()
        }
        
        const error: ApiError = {
          success: false,
          message: data.message || 'Erro na requisição',
          data: data.data,
          errors: data.errors,
          status: response.status,
        }
        throw error
      }

      return data as ApiResponse<T>
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message.includes('JSON')) {
        if (process.env.NODE_ENV === 'development') {
          console.error('⚠️ Resposta não é JSON válido. Status:', response.status)
          const text = await response.text()
          console.error('Conteúdo:', text.substring(0, 200))
        }
      }
      throw parseError
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseURL}${endpoint}`)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    if (process.env.NODE_ENV === 'development') {
      // console.log('ApiClient: GET:', url.toString())
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(false),
      credentials: 'include', // Importante para cookies
    })

    return this.handleResponse<T>(response)
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData
    
    if (process.env.NODE_ENV === 'development') {
      // console.log('ApiClient: POST:', `${this.baseURL}${endpoint}`, 'isFormData:', isFormData)
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(isFormData),
      credentials: 'include', // Importante para cookies
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    })

    return this.handleResponse<T>(response)
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(isFormData),
      credentials: 'include', // Importante para cookies
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    })

    return this.handleResponse<T>(response)
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const isFormData = data instanceof FormData

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(isFormData),
      credentials: 'include',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    })

    return this.handleResponse<T>(response)
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(false),
      credentials: 'include', // Importante para cookies
    })

    return this.handleResponse<T>(response)
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient()

// Hooks para React Query (se disponível)
export const useApiClient = () => apiClient

// Utilitários para endpoints específicos
export const endpoints = {
  // Autenticação
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  
  // Produtos
  products: {
    list: '/api/product',
    stats: '/api/product/stats', // Added
    create: '/api/product',
    show: (id: string) => `/api/product/${id}`,
    getById: (id: string) => `/api/product/${id}`,
    update: (id: number | string) => `/api/product/${id}`,
    delete: (id: string) => `/api/product/${id}`,
  },
  
  // Categorias
  categories: {
    list: '/api/category',
    stats: '/api/category/stats',
    create: '/api/category',
    show: (id: string) => `/api/category/${id}`,
    getById: (id: string) => `/api/category/${id}`,
    update: (id: number | string) => `/api/category/${id}`,
    delete: (id: string) => `/api/category/${id}`,
  },
  
  // Pedidos
  orders: {
    list: '/api/order',
    stats: '/api/order/stats',
    searchByNumber: '/api/order/search-by-number',
    getByTable: (tableUuid: string) => `/api/order/by-table?table_uuid=${tableUuid}`,
    getToday: '/api/order/today',
    getDetails: (orderId: number) => `/api/order/${orderId}/details`,
    create: '/api/order',
    show: (id: string) => `/api/order/${id}`,
    update: (id: string) => `/api/order/${id}`,
    archive: (id: string) => `/api/order/${id}/archive`,
    delete: (id: string) => `/api/order/${id}`,
    invoice: (id: string) => `/api/order/${id}/invoice`,
    receipt: (id: string) => `/api/order/${id}/receipt`,
  },
  
  // Mesas
  tables: {
    list: '/api/table',
    stats: '/api/table/stats',
    create: '/api/table',
    show: (id: string) => `/api/table/${id}`,
    update: (id: number) => `/api/table/${id}`,
    delete: (id: string) => `/api/table/${id}`,
  },
  
  // Usuários
  users: {
    list: '/api/users',
    stats: '/api/user/stats',
    create: '/api/users',
    show: (id: string) => `/api/users/${id}`,
    update: (id: number | string) => `/api/users/${id}`,
    delete: (id: string) => `/api/users/${id}`,
    assignProfile: (id: string) => `/api/users/${id}/assign-profile`,
    changePassword: (id: string) => `/api/users/${id}/change-password`,
    permissions: (id: string) => `/api/users/${id}/permissions`,
  },

  // Permissões
  permissions: {
    list: '/api/permissions',
    create: '/api/permissions',
    show: (id: string) => `/api/permissions/${id}`,
    update: (id: number) => `/api/permissions/${id}`,
    delete: (id: string) => `/api/permissions/${id}`,
  },

  // Roles
  roles: {
    list: '/api/role',
    stats: '/api/role/stats',
    create: '/api/role',
    show: (id: string) => `/api/role/${id}`,
    update: (id: number) => `/api/role/${id}`,
    delete: (id: string) => `/api/role/${id}`,
  },

  // Perfis
  profiles: {
    base: '/api/profiles',
    list: '/api/profiles',
    create: '/api/profiles',
    show: (id: string) => `/api/profiles/${id}`,
    update: (id: number) => `/api/profiles/${id}`,
    delete: (id: string) => `/api/profiles/${id}`,
    permissions: (id: number) => `/api/profiles/${id}/permissions`,
    syncPermissions: (id: number) => `/api/profiles/${id}/permissions/sync`,
  },
  
  // Clientes
  clients: {
    list: '/api/client',
    stats: '/api/client/stats',
    create: '/api/client',
    show: (id: string) => `/api/client/${id}`,
    getById: (id: string) => `/api/client/${id}`,
    update: (id: number | string) => `/api/client/${id}`,
    delete: (id: string) => `/api/client/${id}`,
  },

  // Formas de Pagamento
  paymentMethods: {
    list: '/api/payment-methods',
    active: '/api/payment-methods/active',
    create: '/api/payment-methods',
    show: (uuid: string) => `/api/payment-methods/${uuid}`,
    update: (uuid: string) => `/api/payment-methods/${uuid}`,
    delete: (uuid: string) => `/api/payment-methods/${uuid}`,
  },

  // Planos
  plans: {
    list: '/api/plan',
    create: '/api/plan',
    show: (id: string | number) => `/api/plan/${id}`,
    update: (id: string | number) => `/api/plan/${id}`,
    delete: (id: string | number) => `/api/plan/${id}`,
    details: (id: string | number) => `/api/plan/${id}/details`,
  },

  // Avaliações
  reviews: {
    // Admin
    list: (status?: string) => `/api/reviews${status ? `?status=${status}` : ''}`,
    pending: '/api/reviews/pending',
    stats: '/api/reviews/stats',
    recent: (limit?: number) => `/api/reviews/recent${limit ? `?limit=${limit}` : ''}`,
    show: (uuid: string) => `/api/reviews/${uuid}`,
    approve: (uuid: string) => `/api/reviews/${uuid}/approve`,
    reject: (uuid: string) => `/api/reviews/${uuid}/reject`,
    toggleFeatured: (uuid: string) => `/api/reviews/${uuid}/toggle-featured`,
    delete: (uuid: string) => `/api/reviews/${uuid}`,
    
    // Público
    public: {
      list: (slug: string) => `/api/store/${slug}/reviews`,
      featured: (slug: string) => `/api/store/${slug}/reviews/featured`,
      stats: (slug: string) => `/api/store/${slug}/reviews/stats`,
      create: '/api/public/reviews',
      helpful: (uuid: string) => `/api/public/reviews/${uuid}/helpful`,
    }
  },

  marketing: {
    coupons: {
      list: '/api/marketing/coupons',
      stats: '/api/marketing/coupons/stats',
      create: '/api/marketing/coupons',
      show: (uuid: string) => `/api/marketing/coupons/${uuid}`,
      update: (uuid: string) => `/api/marketing/coupons/${uuid}`,
      toggle: (uuid: string) => `/api/marketing/coupons/${uuid}/toggle`,
      delete: (uuid: string) => `/api/marketing/coupons/${uuid}`,
      uploadImage: (uuid: string) => `/api/marketing/coupons/${uuid}/image`,
    },
  },

  integrations: {
    ifood: {
      catalogs: '/api/integrations/ifood/catalogs',
      categories: (catalogId: string) => `/api/integrations/ifood/catalogs/${catalogId}/categories`,
      groups: (catalogId: string) => `/api/integrations/ifood/catalogs/${catalogId}/groups`,
      unsellableItems: (catalogId: string) => `/api/integrations/ifood/catalogs/${catalogId}/unsellable-items`,
      sellableItems: (groupId: string) => `/api/integrations/ifood/catalog-groups/${groupId}/sellable-items`,
      catalogVersion: '/api/integrations/ifood/catalog/version',
      snapshots: '/api/integrations/ifood/catalog/snapshots',
      requestUserCode: '/api/integrations/ifood/oauth/user-code',
      orders: {
        list: '/api/integrations/ifood/orders',
        show: (externalOrderId: string) => `/api/integrations/ifood/orders/${externalOrderId}`,
        resendStatus: (externalOrderId: string) => `/api/integrations/ifood/orders/${externalOrderId}/status`,
        confirm: (externalOrderId: string) => `/api/integrations/ifood/orders/${externalOrderId}/confirm`,
      },
    },
  },

  // Loja Pública (Store)
  store: {
    info: (slug: string) => `/api/store/${slug}/info`,
    products: (slug: string) => `/api/store/${slug}/products`,
    paymentMethods: (slug: string) => `/api/store/${slug}/payment-methods`,
    createOrder: (slug: string) => `/api/store/${slug}/orders`,
    trackOrder: (slug: string) => `/api/store/${slug}/orders/track`,
    isOpen: (slug: string) => `/api/store/${slug}/is-open`,
  },

  // Status de Pedidos
  orderStatuses: {
    list: (activeOnly?: boolean) => `/api/order-statuses${activeOnly ? '?active_only=true' : ''}`,
    show: (uuid: string) => `/api/order-statuses/${uuid}`,
    create: '/api/order-statuses',
    update: (uuid: string) => `/api/order-statuses/${uuid}`,
    delete: (uuid: string) => `/api/order-statuses/${uuid}`,
    reorder: '/api/order-statuses/reorder',
  },

  // Tenant
  tenant: {
    current: '/api/tenant/current',
    update: '/api/tenant/update',
  },
  
  // Relatórios
  reports: {
    list: '/api/reports',
    dailySales: '/api/reports/daily-sales',
    clients: '/api/reports/clients',
    topProducts: '/api/reports/top-products',
    monthlyFinancial: '/api/reports/monthly-financial',
    tableOccupancy: '/api/reports/table-occupancy',
  },
  // Notificações
  notifications: {
    list: '/api/notifications',
    unread: '/api/notifications/unread',
    unreadCount: '/api/notifications/unread-count',
    markAsRead: (uuid: string) => `/api/notifications/${uuid}/read`,
    markAllAsRead: '/api/notifications/read-all',
    delete: (uuid: string) => `/api/notifications/${uuid}`,
    preferences: '/api/notifications/preferences',
    updatePreferences: '/api/notifications/preferences',
  },

  // Localização (Estados e Municípios)
  states: {
    list: '/api/states',
    cities: (uf: string) => `/api/states/${uf}/cities`,
  },
  cities: {
    list: '/api/cities',
    capitals: '/api/cities/capitals',
    search: '/api/cities/search',
  },

  // Eventos
  events: {
    list: '/api/events',
    stats: '/api/events/stats',
    upcoming: '/api/events/upcoming',
    create: '/api/events',
    show: (uuid: string) => `/api/events/${uuid}`,
    update: (uuid: string) => `/api/events/${uuid}`,
    delete: (uuid: string) => `/api/events/${uuid}`,
  },

  // Módulo Financeiro
  financialCategories: {
    list: '/api/financial-categories',
    create: '/api/financial-categories',
    show: (uuid: string) => `/api/financial-categories/${uuid}`,
    update: (uuid: string) => `/api/financial-categories/${uuid}`,
    delete: (uuid: string) => `/api/financial-categories/${uuid}`,
    byType: (type: string) => `/api/financial-categories?type=${type}`,
  },

  suppliers: {
    list: '/api/suppliers',
    create: '/api/suppliers',
    show: (uuid: string) => `/api/suppliers/${uuid}`,
    update: (uuid: string) => `/api/suppliers/${uuid}`,
    delete: (uuid: string) => `/api/suppliers/${uuid}`,
    checkDocument: '/api/suppliers/check-document',
  },

  expenses: {
    list: '/api/expenses',
    stats: '/api/expenses/stats',
    create: '/api/expenses',
    show: (uuid: string) => `/api/expenses/${uuid}`,
    update: (uuid: string) => `/api/expenses/${uuid}`,
    delete: (uuid: string) => `/api/expenses/${uuid}`,
    uploadAttachment: (uuid: string) => `/api/expenses/${uuid}/attachment`,
  },

  accountsPayable: {
    list: '/api/accounts-payable',
    stats: '/api/accounts-payable/stats',
    alerts: '/api/accounts-payable/alerts',
    create: '/api/accounts-payable',
    show: (uuid: string) => `/api/accounts-payable/${uuid}`,
    update: (uuid: string) => `/api/accounts-payable/${uuid}`,
    delete: (uuid: string) => `/api/accounts-payable/${uuid}`,
    pay: (uuid: string) => `/api/accounts-payable/${uuid}/pay`,
  },

  accountsReceivable: {
    list: '/api/accounts-receivable',
    stats: '/api/accounts-receivable/stats',
    fromOrder: (orderId: number) => `/api/accounts-receivable/from-order/${orderId}`,
    create: '/api/accounts-receivable',
    show: (uuid: string) => `/api/accounts-receivable/${uuid}`,
    update: (uuid: string) => `/api/accounts-receivable/${uuid}`,
    delete: (uuid: string) => `/api/accounts-receivable/${uuid}`,
    receive: (uuid: string) => `/api/accounts-receivable/${uuid}/receive`,
  },

  // Horários de Funcionamento
  storeHours: {
    list: '/api/store-hours',
    stats: '/api/store-hours/stats',
    checkIsOpen: '/api/store-hours/check-is-open',
    setAlwaysOpen: '/api/store-hours/set-always-open',
    removeAlwaysOpen: '/api/store-hours/remove-always-open',
    create: '/api/store-hours',
    show: (uuid: string) => `/api/store-hours/${uuid}`,
    update: (uuid: string) => `/api/store-hours/${uuid}`,
    delete: (uuid: string) => `/api/store-hours/${uuid}`,
  },

  // Programa de Fidelidade
  loyalty: {
    program: '/api/loyalty/program',
    updateProgram: (uuid: string) => `/api/loyalty/program/${uuid}`,
    rewards: '/api/loyalty/rewards',
    createReward: '/api/loyalty/rewards',
    showReward: (uuid: string) => `/api/loyalty/rewards/${uuid}`,
    updateReward: (uuid: string) => `/api/loyalty/rewards/${uuid}`,
    deleteReward: (uuid: string) => `/api/loyalty/rewards/${uuid}`,
    clientBalance: (clientId: number) => `/api/loyalty/client/${clientId}/balance`,
    clientTransactions: (clientId: number) => `/api/loyalty/client/${clientId}/transactions`,
    clientRedemptions: (clientId: number) => `/api/loyalty/client/${clientId}/redemptions`,
    adjustPoints: (clientId: number) => `/api/loyalty/client/${clientId}/adjust-points`,
    redeem: '/api/loyalty/redeem',
  },

  // Bank Accounts (Contas Bancárias)
  bankAccounts: {
    list: '/api/bank-accounts',
    create: '/api/bank-accounts',
    banks: '/api/bank-accounts/banks',
    show: (uuid: string) => `/api/bank-accounts/${uuid}`,
    update: (uuid: string) => `/api/bank-accounts/${uuid}`,
    delete: (uuid: string) => `/api/bank-accounts/${uuid}`,
    setPrimary: (uuid: string) => `/api/bank-accounts/${uuid}/set-primary`,
    verify: (uuid: string) => `/api/bank-accounts/${uuid}/verify`,
    logs: (uuid: string) => `/api/bank-accounts/${uuid}/logs`,
  },

  // Sales Performance (Desempenho/Vendas)
  salesPerformance: {
    list: (params?: { start_date?: string; end_date?: string; days?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.days) queryParams.append('days', params.days.toString())
      const queryString = queryParams.toString()
      return `/api/sales-performance${queryString ? `?${queryString}` : ''}`
    },
    export: (params?: { start_date?: string; end_date?: string; days?: number }) => {
      const queryParams = new URLSearchParams()
      if (params?.start_date) queryParams.append('start_date', params.start_date)
      if (params?.end_date) queryParams.append('end_date', params.end_date)
      if (params?.days) queryParams.append('days', params.days.toString())
      const queryString = queryParams.toString()
      return `/api/sales-performance/export${queryString ? `?${queryString}` : ''}`
    },
    refresh: '/api/sales-performance/refresh',
  },
} as const

export default apiClient
