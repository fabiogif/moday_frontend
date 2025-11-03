import adminApi from '@/lib/admin-api-client'

// Mock do fetch
global.fetch = jest.fn()

describe('AdminApiClient', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
    ;(global.fetch as jest.Mock).mockClear()
  })

  describe('Authentication', () => {
    it('should set authorization header when token exists', async () => {
      localStorage.setItem('admin-token', 'test-token-123')

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      })

      // Cria nova instância para carregar o token
      const { AdminApiClient } = await import('@/lib/admin-api-client')
      const api = new AdminApiClient()
      api.setToken('test-token-123')

      await api.getDashboardStats()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token-123',
          }),
        })
      )
    })

    it('should not set authorization header when token does not exist', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      })

      await adminApi.login('test@test.com', 'password')

      const callArgs = (global.fetch as jest.Mock).mock.calls[0][1]
      expect(callArgs.headers.Authorization).toBeUndefined()
    })
  })

  describe('Dashboard Endpoints', () => {
    it('should call dashboard stats endpoint', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { tenants: { total: 150 } },
        }),
      })

      const result = await adminApi.getDashboardStats()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard'),
        expect.any(Object)
      )
      expect(result.data.tenants.total).toBe(150)
    })

    it('should call recent activity endpoint with limit', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })

      await adminApi.getRecentActivity(10)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/dashboard/activity?limit=10'),
        expect.any(Object)
      )
    })
  })

  describe('Tenant Endpoints', () => {
    it('should call tenants list with filters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] }),
      })

      await adminApi.getTenants({
        status: 'active',
        search: 'test',
        per_page: 20,
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/tenants'),
        expect.any(Object)
      )
      
      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('status=active')
      expect(url).toContain('search=test')
      expect(url).toContain('per_page=20')
    })

    it('should call tenant details endpoint', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: { id: 1 } }),
      })

      await adminApi.getTenant(1)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/tenants/1'),
        expect.any(Object)
      )
    })

    it('should call activate tenant endpoint', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await adminApi.activateTenant(1)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/tenants/1/activate'),
        expect.objectContaining({
          method: 'POST',
        })
      )
    })

    it('should call suspend tenant endpoint with reason', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await adminApi.suspendTenant(1, 'Inadimplência')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/tenants/1/suspend'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ reason: 'Inadimplência' }),
        })
      )
    })
  })

  describe('Metrics Endpoints', () => {
    it('should call revenue metrics with date range', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      })

      await adminApi.getRevenueMetrics('2025-01-01', '2025-12-31')

      const url = (global.fetch as jest.Mock).mock.calls[0][0]
      expect(url).toContain('start_date=2025-01-01')
      expect(url).toContain('end_date=2025-12-31')
    })

    it('should call tenant specific metrics', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      })

      await adminApi.getTenantMetrics(1)

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/metrics/tenant/1'),
        expect.any(Object)
      )
    })
  })

  describe('Error Handling', () => {
    it('should throw error on failed request', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Erro no servidor',
        }),
      })

      await expect(adminApi.getDashboardStats()).rejects.toThrow(
        'Erro no servidor'
      )
    })

    it('should throw default error message when none provided', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false }),
      })

      await expect(adminApi.getDashboardStats()).rejects.toThrow(
        'Erro na requisição'
      )
    })
  })
})

