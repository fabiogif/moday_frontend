/**
 * Cliente API para endpoints administrativos
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

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

class AdminApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('admin-token')
    }
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-token', token)
    }
  }

  // Método público para recarregar token do localStorage
  reloadToken() {
    this.loadToken()
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-token')
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Sempre recarregar o token do localStorage antes de cada requisição
    // Isso garante que o token mais recente seja usado
    this.loadToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    } else {
      // Se não tiver token após recarregar, pode ser um problema
      console.warn('[AdminApiClient] Token não encontrado para requisição:', endpoint)
    }

    const response = await fetch(`${this.baseURL}/api/admin${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    })

    // Verificar se a resposta é JSON antes de fazer parse
    const contentType = response.headers.get('content-type')
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Resposta inválida do servidor: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!response.ok) {
      // Tratar estrutura padrão da aplicação
      const errorMessage = data.message || 'Erro na requisição'
      const error: any = new Error(errorMessage)
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  // ============================================================================
  // AUTH
  // ============================================================================

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    })
  }

  async me() {
    return this.request('/auth/me')
  }

  async refreshToken() {
    return this.request('/auth/refresh', {
      method: 'POST',
    })
  }

  // ============================================================================
  // DASHBOARD
  // ============================================================================

  async getDashboardStats() {
    return this.request('/dashboard')
  }

  async getRecentActivity(limit = 20) {
    return this.request(`/dashboard/activity?limit=${limit}`)
  }

  async getAlerts() {
    return this.request('/dashboard/alerts')
  }

  // ============================================================================
  // TENANTS
  // ============================================================================

  async getTenants(params?: {
    search?: string
    status?: string
    plan?: string
    blocked?: boolean
    sort_by?: string
    sort_direction?: 'asc' | 'desc'
    per_page?: number
    page?: number
  }) {
    const queryString = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null) {
          acc[key] = String(value)
        }
        return acc
      }, {} as Record<string, string>)
    ).toString()

    return this.request(`/tenants${queryString ? `?${queryString}` : ''}`)
  }

  async getTenant(id: string | number) {
    return this.request(`/tenants/${id}`)
  }

  async updateTenant(id: string | number, data: {
    admin_notes?: string
    users_limit?: number
    messages_limit?: number
  }) {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async activateTenant(id: string | number) {
    return this.request(`/tenants/${id}/activate`, {
      method: 'POST',
    })
  }

  async suspendTenant(id: string | number, reason: string) {
    return this.request(`/tenants/${id}/suspend`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async blockTenant(id: string | number, reason: string) {
    return this.request(`/tenants/${id}/block`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async unblockTenant(id: string | number) {
    return this.request(`/tenants/${id}/unblock`, {
      method: 'POST',
    })
  }

  async updateTenantPlan(id: string | number, plan: string, mrr: number) {
    return this.request(`/tenants/${id}/plan`, {
      method: 'PUT',
      body: JSON.stringify({ plan, mrr }),
    })
  }

  async pauseTenantAccess(id: string | number, reason: string) {
    return this.request(`/tenants/${id}/pause-access`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async restoreTenantAccess(id: string | number) {
    return this.request(`/tenants/${id}/restore-access`, {
      method: 'POST',
    })
  }

  async deleteTenant(id: string | number) {
    return this.request(`/tenants/${id}`, {
      method: 'DELETE',
    })
  }

  async forceDeleteTenant(id: string | number) {
    return this.request(`/tenants/${id}/force`, {
      method: 'DELETE',
    })
  }

  // ============================================================================
  // METRICS
  // ============================================================================

  async getRevenueMetrics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    return this.request(`/metrics/revenue${params.toString() ? `?${params}` : ''}`)
  }

  async getUsageMetrics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    return this.request(`/metrics/usage${params.toString() ? `?${params}` : ''}`)
  }

  async getMessagesMetrics(startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    return this.request(`/metrics/messages${params.toString() ? `?${params}` : ''}`)
  }

  async getGrowthMetrics() {
    return this.request('/metrics/growth')
  }

  async getTenantMetrics(tenantId: string | number, startDate?: string, endDate?: string) {
    const params = new URLSearchParams()
    if (startDate) params.append('start_date', startDate)
    if (endDate) params.append('end_date', endDate)

    return this.request(`/metrics/tenant/${tenantId}${params.toString() ? `?${params}` : ''}`)
  }

  // ============================================================================
  // EMAIL
  // ============================================================================

  async sendBulkEmail(data: {
    tenant_ids: number[]
    subject: string
    message: string
  }) {
    return this.request('/email/send-bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getEmailHistory(limit = 50) {
    return this.request(`/email/history?limit=${limit}`)
  }
}

// Instância singleton
const adminApi = new AdminApiClient()

export default adminApi
export { AdminApiClient }

