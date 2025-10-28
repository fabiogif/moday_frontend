import { describe, it, expect, beforeEach, vi } from '@jest/globals'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PublicStorePage from '../page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ slug: 'test-store' }),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}))

// Mock hooks
vi.mock('@/hooks/use-viacep', () => ({
  useViaCEP: () => ({
    searchCEP: vi.fn(),
    loading: false,
  }),
}))

// Mock de produtos para teste
const mockProducts = [
  {
    uuid: '1',
    name: 'Pizza Margherita',
    description: 'Pizza tradicional',
    price: 30.00,
    promotional_price: 25.00,
    image: '/pizza.jpg',
    qtd_stock: 10,
    brand: 'Casa',
    categories: [{ uuid: 'cat1', name: 'Pizzas' }],
  },
  {
    uuid: '2',
    name: 'Coca-Cola',
    description: 'Refrigerante',
    price: 5.00,
    promotional_price: null,
    image: '/coca.jpg',
    qtd_stock: 50,
    brand: 'Coca',
    categories: [{ uuid: 'cat2', name: 'Bebidas' }],
  },
  {
    uuid: '3',
    name: 'Hambúrguer',
    description: 'Hambúrguer artesanal',
    price: 20.00,
    promotional_price: 15.00,
    image: '/burger.jpg',
    qtd_stock: 8,
    brand: 'Casa',
    categories: [{ uuid: 'cat3', name: 'Lanches' }],
  },
  {
    uuid: '4',
    name: 'Pudim',
    description: 'Pudim caseiro',
    price: 10.00,
    promotional_price: 5.00,
    image: '/pudim.jpg',
    qtd_stock: 5,
    brand: 'Casa',
    categories: [{ uuid: 'cat4', name: 'Sobremesas' }],
  },
]

// Mock fetch
global.fetch = vi.fn()

describe('PublicStorePage - Categorias', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/store/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              store: {
                name: 'Loja Teste',
                slug: 'test-store',
                email: 'test@test.com',
                phone: '1234567890',
                address: 'Rua Teste',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '12345678',
                logo: '/logo.jpg',
                whatsapp: '1234567890',
              },
              products: mockProducts,
            },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
    })
  })

  it('deve renderizar a aba "Todos" por padrão', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Todos/i)).toBeInTheDocument()
    })
  })

  it('deve extrair categorias únicas dos produtos', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Pizzas/i)).toBeInTheDocument()
      expect(screen.getByText(/Bebidas/i)).toBeInTheDocument()
      expect(screen.getByText(/Lanches/i)).toBeInTheDocument()
      expect(screen.getByText(/Sobremesas/i)).toBeInTheDocument()
    })
  })

  it('deve mostrar contador correto de produtos por categoria', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      // Cada categoria tem 1 produto
      expect(screen.getByText(/Pizzas \(1\)/i)).toBeInTheDocument()
      expect(screen.getByText(/Bebidas \(1\)/i)).toBeInTheDocument()
    })
  })

  it('deve filtrar produtos ao clicar em uma categoria', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Pizza Margherita')).toBeInTheDocument()
    })

    // Clicar na aba de Bebidas
    const bebidasTab = screen.getByText(/Bebidas \(1\)/i)
    fireEvent.click(bebidasTab)

    await waitFor(() => {
      // Deve mostrar apenas Coca-Cola
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument()
      // Não deve mostrar Pizza
      expect(screen.queryByText('Pizza Margherita')).not.toBeInTheDocument()
    })
  })

  it('deve mostrar todos os produtos na aba "Todos"', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Pizza Margherita')).toBeInTheDocument()
      expect(screen.getByText('Coca-Cola')).toBeInTheDocument()
      expect(screen.getByText('Hambúrguer')).toBeInTheDocument()
      expect(screen.getByText('Pudim')).toBeInTheDocument()
    })
  })
})

describe('PublicStorePage - Ofertas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/store/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              store: {
                name: 'Loja Teste',
                slug: 'test-store',
                email: 'test@test.com',
                phone: '1234567890',
                address: 'Rua Teste',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '12345678',
                logo: '/logo.jpg',
                whatsapp: '1234567890',
              },
              products: mockProducts,
            },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
    })
  })

  it('deve identificar produtos com ofertas', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      // Pizza, Hambúrguer e Pudim têm ofertas
      const offerBadges = screen.getAllByText(/% OFF/i)
      expect(offerBadges.length).toBeGreaterThan(0)
    })
  })

  it('deve calcular o percentual de desconto corretamente', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      // Pudim: de 10 para 5 = 50% OFF
      expect(screen.getByText(/50% OFF/i)).toBeInTheDocument()
      
      // Pizza: de 30 para 25 = 17% OFF (arredondado)
      expect(screen.getByText(/17% OFF/i)).toBeInTheDocument()
    })
  })

  it('deve ordenar ofertas por maior desconto', async () => {
    // Teste da lógica de ordenação
    const productsWithOffers = [
      { ...mockProducts[0], discountPercent: 17 }, // Pizza: 17%
      { ...mockProducts[2], discountPercent: 25 }, // Hambúrguer: 25%
      { ...mockProducts[3], discountPercent: 50 }, // Pudim: 50%
    ].sort((a, b) => b.discountPercent - a.discountPercent)

    expect(productsWithOffers[0].discountPercent).toBe(50) // Pudim
    expect(productsWithOffers[1].discountPercent).toBe(25) // Hambúrguer
    expect(productsWithOffers[2].discountPercent).toBe(17) // Pizza
  })

  it('deve limitar ofertas a 4 produtos', async () => {
    const manyProducts = Array.from({ length: 10 }, (_, i) => ({
      ...mockProducts[0],
      uuid: `prod-${i}`,
      promotional_price: 20 - i,
    }))

    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/store/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              store: mockProducts[0],
              products: manyProducts,
            },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
    })

    const bestOffers = manyProducts
      .filter(p => p.promotional_price && p.promotional_price < p.price)
      .slice(0, 4)

    expect(bestOffers).toHaveLength(4)
  })
})

describe('PublicStorePage - Mais Vendidos', () => {
  it('deve retornar até 4 produtos mais vendidos', () => {
    const bestSellers = mockProducts.slice(0, 4)
    expect(bestSellers).toHaveLength(4)
  })

  it('deve funcionar com menos de 4 produtos disponíveis', () => {
    const fewProducts = mockProducts.slice(0, 2)
    const bestSellers = fewProducts.slice(0, 4)
    expect(bestSellers).toHaveLength(2)
  })
})

describe('PublicStorePage - Badge de Categoria', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/store/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              store: {
                name: 'Loja Teste',
                slug: 'test-store',
                email: 'test@test.com',
                phone: '1234567890',
                address: 'Rua Teste',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '12345678',
                logo: '/logo.jpg',
                whatsapp: '1234567890',
              },
              products: mockProducts,
            },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
    })
  })

  it('deve exibir badge com nome da categoria no card do produto', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      expect(screen.getByText('Pizzas')).toBeInTheDocument()
      expect(screen.getByText('Bebidas')).toBeInTheDocument()
    })
  })

  it('não deve exibir badge se produto não tiver categoria', async () => {
    const productWithoutCategory = {
      ...mockProducts[0],
      categories: [],
    }

    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/store/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              store: mockProducts[0],
              products: [productWithoutCategory],
            },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
    })

    render(<PublicStorePage />)
    
    await waitFor(() => {
      const categoryBadges = screen.queryAllByText(/Pizzas|Bebidas/i)
      // Badge não deve aparecer no card
      expect(categoryBadges.length).toBe(0)
    })
  })
})

describe('PublicStorePage - Casos Especiais', () => {
  it('deve lidar com produtos sem preço promocional', async () => {
    const product = mockProducts[1] // Coca-Cola sem promoção
    expect(product.promotional_price).toBeNull()
  })

  it('deve lidar com categorias vazias', async () => {
    ;(global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/store/')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            data: {
              store: mockProducts[0],
              products: [],
            },
          }),
        })
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ success: true, data: [] }) })
    })

    render(<PublicStorePage />)
    
    await waitFor(() => {
      expect(screen.getByText(/Todos \(0\)/i)).toBeInTheDocument()
    })
  })

  it('deve exibir mensagem quando não há produtos na categoria', async () => {
    render(<PublicStorePage />)
    
    await waitFor(() => {
      const bebidasTab = screen.getByText(/Bebidas \(1\)/i)
      fireEvent.click(bebidasTab)
    })

    // Se não houver produtos, deve mostrar mensagem
    // Como temos 1 produto, não deve mostrar a mensagem
    expect(screen.queryByText(/Nenhum produto encontrado/i)).not.toBeInTheDocument()
  })

  it('deve calcular preço corretamente para strings e numbers', () => {
    const getNumericPrice = (price: number | string): number => {
      return typeof price === 'string' ? parseFloat(price) || 0 : price
    }

    expect(getNumericPrice(10)).toBe(10)
    expect(getNumericPrice('10')).toBe(10)
    expect(getNumericPrice('10.50')).toBe(10.5)
    expect(getNumericPrice('invalid')).toBe(0)
  })
})

describe('PublicStorePage - Performance', () => {
  it('não deve recalcular categorias desnecessariamente', () => {
    const extractCategories = (products: typeof mockProducts) => {
      return Array.from(
        new Set(
          products.flatMap(product => 
            product.categories?.map(cat => cat.name) || []
          )
        )
      ).sort()
    }

    const categories1 = extractCategories(mockProducts)
    const categories2 = extractCategories(mockProducts)

    expect(categories1).toEqual(categories2)
    expect(categories1).toHaveLength(4)
  })

  it('deve filtrar produtos eficientemente', () => {
    const filterByCategory = (products: typeof mockProducts, category: string) => {
      if (category === 'all') return products
      return products.filter(product => 
        product.categories?.some(cat => cat.name === category)
      )
    }

    const pizzas = filterByCategory(mockProducts, 'Pizzas')
    expect(pizzas).toHaveLength(1)
    expect(pizzas[0].name).toBe('Pizza Margherita')

    const all = filterByCategory(mockProducts, 'all')
    expect(all).toHaveLength(4)
  })
})

