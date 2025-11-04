import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { RecentReviewsCard } from '../recent-reviews-card'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import '@testing-library/jest-dom'

// Mock do apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
  },
  endpoints: {
    reviews: {
      recent: (limit?: number) => `/api/reviews/recent${limit ? `?limit=${limit}` : ''}`,
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

// Mock do Next Link
jest.mock('next/link', () => {
  return ({ children, href }: any) => <a href={href}>{children}</a>
})

describe('RecentReviewsCard', () => {
  const mockReviews = [
    {
      uuid: 'review-1',
      rating: 5,
      comment: 'Excelente serviço!',
      customer_name: 'João Silva',
      status: 'approved',
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
      status: 'pending',
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
  })

  it('deve renderizar o card corretamente', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('Avaliações Recentes')).toBeInTheDocument()
    })

    expect(screen.getByText('Últimas avaliações dos seus clientes')).toBeInTheDocument()
  })

  it('deve mostrar loading durante carregamento', () => {
    ;(apiClient.get as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<RecentReviewsCard limit={5} />)

    expect(screen.getByText('Avaliações Recentes')).toBeInTheDocument()
    // Loading spinner deve aparecer
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('deve listar as avaliações recebidas', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })

    expect(screen.getByText('Excelente serviço!')).toBeInTheDocument()
    expect(screen.getByText('Muito bom!')).toBeInTheDocument()
  })

  it('deve renderizar estrelas corretamente', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })

    // Deve ter estrelas renderizadas (SVG)
    const stars = document.querySelectorAll('svg')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('deve mostrar badge de status correto', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('Aprovada')).toBeInTheDocument()
      expect(screen.getByText('Pendente')).toBeInTheDocument()
    })
  })

  it('deve mostrar informações do pedido', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText(/Pedido #ABC123/)).toBeInTheDocument()
      expect(screen.getByText(/Pedido #DEF456/)).toBeInTheDocument()
    })
  })

  it('deve mostrar mensagem quando não houver avaliações', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('Nenhuma avaliação ainda.')).toBeInTheDocument()
      expect(screen.getByText('As avaliações dos clientes aparecerão aqui.')).toBeInTheDocument()
    })
  })

  it('deve mostrar erro ao falhar no carregamento', async () => {
    ;(apiClient.get as jest.Mock).mockRejectedValue(new Error('Erro de conexão'))

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar avaliações')).toBeInTheDocument()
    })

    expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
  })

  it('deve permitir tentar novamente após erro', async () => {
    ;(apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Erro'))
      .mockResolvedValueOnce({
        success: true,
        data: mockReviews,
        message: 'Sucesso'
      })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('Tentar Novamente')).toBeInTheDocument()
    })

    const retryButton = screen.getByText('Tentar Novamente')
    fireEvent.click(retryButton)

    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
    })
  })

  it('deve truncar comentários longos', async () => {
    const longCommentReview = {
      ...mockReviews[0],
      comment: 'Este é um comentário muito longo que deveria ser truncado para caber no card sem quebrar o layout e manter a interface limpa e organizada.'
    }

    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [longCommentReview],
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      const comment = screen.getByText(/Este é um comentário muito longo/)
      expect(comment.textContent?.length).toBeLessThanOrEqual(103) // 100 + "..."
    })
  })

  it('deve chamar API com limite correto', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: [],
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={10} />)

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/api/reviews/recent?limit=10')
    })
  })

  it('deve ter link para página de avaliações', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      const link = screen.getByText('Ver todas').closest('a')
      expect(link).toHaveAttribute('href', '/reviews')
    })
  })

  it('deve mostrar avatar com inicial do cliente', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('J')).toBeInTheDocument() // João
      expect(screen.getByText('M')).toBeInTheDocument() // Maria
    })
  })

  it('deve mostrar data relativa', async () => {
    ;(apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockReviews,
      message: 'Sucesso'
    })

    render(<RecentReviewsCard limit={5} />)

    await waitFor(() => {
      expect(screen.getByText('há 2 horas')).toBeInTheDocument()
      expect(screen.getByText('há 3 horas')).toBeInTheDocument()
    })
  })
}

