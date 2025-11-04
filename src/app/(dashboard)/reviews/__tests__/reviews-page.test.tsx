import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import ReviewsPage from '../page'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import '@testing-library/jest-dom'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
  endpoints: {
    reviews: {
      list: (status?: string) => `/api/reviews${status ? `?status=${status}` : ''}`,
      stats: '/api/reviews/stats',
      approve: (uuid: string) => `/api/reviews/${uuid}/approve`,
      reject: (uuid: string) => `/api/reviews/${uuid}/reject`,
      toggleFeatured: (uuid: string) => `/api/reviews/${uuid}/toggle-featured`,
      delete: (uuid: string) => `/api/reviews/${uuid}`,
    }
  }
}))

// Mock do toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}))

// Mock do window.confirm
global.confirm = jest.fn(() => true)

describe('ReviewsPage', () => {
  const mockStats = {
    total: 150,
    average_rating: 4.7,
    pending_count: 5,
    approved_count: 140,
    rejected_count: 5,
    featured_count: 8
  }

  const mockReviews = [
    {
      uuid: 'review-1',
      rating: 5,
      comment: 'Excelente!',
      customer_name: 'João Silva',
      status: 'pending',
      is_featured: false,
      created_at: '04/11/2025 10:30',
      created_at_human: 'há 2 horas',
      order: {
        id: 1,
        identify: 'ABC123'
      }
    },
    {
      uuid: 'review-2',
      rating: 4,
      comment: 'Muito bom!',
      customer_name: 'Maria Santos',
      status: 'approved',
      is_featured: false,
      created_at: '04/11/2025 09:15',
      created_at_human: 'há 3 horas',
      order: {
        id: 2,
        identify: 'DEF456'
      }
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    ;(apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: mockReviews, message: '' })
      .mockResolvedValueOnce({ success: true, data: mockStats, message: '' })
  })

  it('deve renderizar a página corretamente', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('Total de Avaliações')).toBeInTheDocument()
    })
  })

  it('deve exibir estatísticas nos cards', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument() // Total
      expect(screen.getByText('5')).toBeInTheDocument() // Pendentes
      expect(screen.getByText('140')).toBeInTheDocument() // Aprovadas
      expect(screen.getByText('8')).toBeInTheDocument() // Destaque
    })
  })

  it('deve listar avaliações na tabela', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
  })

  it('deve aprovar avaliação pendente', async () => {
    ;(apiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Avaliação aprovada!',
      data: { ...mockReviews[0], status: 'approved' }
    })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Encontrar e clicar no botão de aprovar (ícone Check verde)
    const approveButtons = screen.getAllByTitle('Aprovar')
    fireEvent.click(approveButtons[0])

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avaliação aprovada!')
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/reviews/review-1/approve', {})
  })

  it('deve abrir modal ao rejeitar avaliação', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Clicar em rejeitar
    const rejectButtons = screen.getAllByTitle('Rejeitar')
    fireEvent.click(rejectButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Rejeitar Avaliação')).toBeInTheDocument()
      expect(screen.getByText('Informe o motivo da rejeição')).toBeInTheDocument()
    })
  })

  it('deve rejeitar avaliação com motivo', async () => {
    ;(apiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Avaliação rejeitada',
      data: { ...mockReviews[0], status: 'rejected' }
    })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Abrir modal de rejeição
    const rejectButtons = screen.getAllByTitle('Rejeitar')
    fireEvent.click(rejectButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Rejeitar Avaliação')).toBeInTheDocument()
    })

    // Digitar motivo
    const textarea = screen.getByPlaceholderText(/Ex: Conteúdo inadequado/)
    fireEvent.change(textarea, { target: { value: 'Linguagem ofensiva' } })

    // Confirmar
    const confirmButton = screen.getByText('Rejeitar Avaliação')
    fireEvent.click(confirmButton)

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/reviews/review-1/reject', {
        reason: 'Linguagem ofensiva'
      })
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avaliação rejeitada')
    })
  })

  it('deve toggle featured em avaliação aprovada', async () => {
    ;(apiClient.post as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Status de destaque atualizado',
      data: { ...mockReviews[1], is_featured: true }
    })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })

    // Clicar em destaque (segunda linha - aprovada)
    const featuredButtons = screen.getAllByTitle(/Destacar|Remover destaque/)
    fireEvent.click(featuredButtons[0])

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/api/reviews/review-2/toggle-featured', {})
    })
  })

  it('deve deletar avaliação após confirmação', async () => {
    ;(apiClient.delete as jest.Mock).mockResolvedValue({
      success: true,
      message: 'Avaliação removida',
      data: null
    })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Clicar em deletar
    const deleteButtons = screen.getAllByTitle('Deletar')
    fireEvent.click(deleteButtons[0])

    await waitFor(() => {
      expect(apiClient.delete).toHaveBeenCalledWith('/api/reviews/review-1')
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Avaliação removida')
    })
  })

  it('deve filtrar por status', async () => {
    ;(apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: mockReviews, message: '' })
      .mockResolvedValueOnce({ success: true, data: mockStats, message: '' })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Alterar filtro de status
    const statusSelect = screen.getByRole('combobox', { name: /status/i })
    fireEvent.click(statusSelect)

    const pendingOption = screen.getByText('Pendentes')
    fireEvent.click(pendingOption)

    await waitFor(() => {
      // Deve mostrar apenas pendentes
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument()
    })
  })

  it('deve buscar por texto', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Digitar na busca
    const searchInput = screen.getByPlaceholderText('Cliente, comentário ou pedido...')
    fireEvent.change(searchInput, { target: { value: 'João' } })

    await waitFor(() => {
      // Deve mostrar apenas João
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument()
    })
  })

  it('deve filtrar por rating', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Encontrar todos os comboboxes
    const comboboxes = screen.getAllByRole('combobox')
    const ratingSelect = comboboxes.find(cb => 
      cb.getAttribute('aria-label')?.includes('Avaliação') || 
      cb.textContent?.includes('Todas') ||
      cb.parentElement?.previousElementSibling?.textContent === 'Avaliação'
    )

    if (ratingSelect) {
      fireEvent.click(ratingSelect)

      const option = screen.getByText('5 estrelas')
      fireEvent.click(option)

      await waitFor(() => {
        // Deve mostrar apenas 5 estrelas
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.queryByText('Maria Santos')).not.toBeInTheDocument()
      })
    }
  })

  it('deve mostrar mensagem quando não houver avaliações', async () => {
    ;(apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: [], message: '' })
      .mockResolvedValueOnce({ success: true, data: mockStats, message: '' })

    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('Nenhuma avaliação encontrada')).toBeInTheDocument()
    })
  })

  it('deve renderizar estrelas corretamente na tabela', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      // Deve ter estrelas renderizadas
      const stars = document.querySelectorAll('svg')
      expect(stars.length).toBeGreaterThan(0)
    })
  })

  it('deve mostrar ícone de troféu para featured na tabela', async () => {
    const reviewWithFeatured = [
      { ...mockReviews[1], is_featured: true }
    ]

    ;(apiClient.get as jest.Mock)
      .mockResolvedValueOnce({ success: true, data: reviewWithFeatured, message: '' })
      .mockResolvedValueOnce({ success: true, data: mockStats, message: '' })

    render(<ReviewsPage />)

    await waitFor(() => {
      // Deve ter ícone Award (troféu)
      const awards = document.querySelectorAll('svg.lucide-award')
      expect(awards.length).toBeGreaterThan(0)
    })
  })

  it('deve mostrar botões corretos conforme status', async () => {
    render(<ReviewsPage />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Pendente deve ter Aprovar e Rejeitar
    expect(screen.getByTitle('Aprovar')).toBeInTheDocument()
    expect(screen.getByTitle('Rejeitar')).toBeInTheDocument()

    // Aprovada deve ter Toggle Destaque
    const featuredButtons = screen.queryAllByTitle(/Destacar|Remover destaque/)
    expect(featuredButtons.length).toBeGreaterThan(0)

    // Todas devem ter Deletar
    const deleteButtons = screen.getAllByTitle('Deletar')
    expect(deleteButtons.length).toBe(2) // Uma para cada review
  })
}

