import { render, screen, waitFor } from '@testing-library/react'
import { PricingSection } from '../components/pricing-section'
import ApiClient from '@/lib/api-client'

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}))

describe('PricingSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('deve renderizar o título da seção', () => {
    render(<PricingSection />)
    expect(screen.getByText(/Planos que cabem no seu bolso/i)).toBeInTheDocument()
  })

  it('deve renderizar loading state inicialmente', () => {
    (ApiClient.get as jest.Mock).mockImplementation(() => new Promise(() => {}))
    render(<PricingSection />)
    expect(screen.getByText(/Carregando planos/i)).toBeInTheDocument()
  })

  it('deve renderizar planos estáticos quando API falhar', async () => {
    (ApiClient.get as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<PricingSection />)
    
    await waitFor(() => {
      expect(screen.getByText(/Grátis/i)).toBeInTheDocument()
      expect(screen.getByText(/Básico/i)).toBeInTheDocument()
      expect(screen.getByText(/Premium/i)).toBeInTheDocument()
    })
  })

  it('deve renderizar planos da API quando disponível', async () => {
    const mockPlans = [
      {
        id: 1,
        name: 'Grátis',
        url: 'gratis',
        price: 0,
        description: 'Teste',
        details: []
      }
    ]
    
    (ApiClient.get as jest.Mock).mockResolvedValue({ data: mockPlans })
    
    render(<PricingSection />)
    
    await waitFor(() => {
      expect(screen.getByText(/Grátis/i)).toBeInTheDocument()
    })
  })

  it('deve renderizar toggle mensal/anual', async () => {
    (ApiClient.get as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<PricingSection />)
    
    await waitFor(() => {
      expect(screen.getByText(/Grátis/i)).toBeInTheDocument()
    }, { timeout: 5000 })
    
    // Verifica se o toggle está presente (pode estar em um componente ToggleGroup)
    const toggleElements = screen.queryAllByText(/Mensal|Anual/i)
    expect(toggleElements.length).toBeGreaterThan(0)
  })

  it('deve destacar o plano popular', async () => {
    (ApiClient.get as jest.Mock).mockRejectedValue(new Error('API Error'))
    
    render(<PricingSection />)
    
    await waitFor(() => {
      expect(screen.getByText(/MAIS POPULAR/i)).toBeInTheDocument()
    })
  })
})

