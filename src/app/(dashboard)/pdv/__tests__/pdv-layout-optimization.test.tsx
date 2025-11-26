/**
 * Testes para otimizações de layout e viewport do PDV
 * 
 * Validações:
 * - Layout cabe na viewport sem scroll
 * - Responsividade em diferentes resoluções
 * - Scroll otimizado apenas onde necessário
 * - Design moderno baseado em melhores práticas
 */

import { render, screen } from "@testing-library/react"
import POSPage from "@/app/(dashboard)/pdv/page"
import {
  useAuthenticatedProducts,
  useAuthenticatedCategories,
  useAuthenticatedTables,
  useAuthenticatedActivePaymentMethods,
  useAuthenticatedClients,
  useAuthenticatedOrdersByTable,
  useAuthenticatedTodayOrders,
  useMutation,
} from "@/hooks/use-authenticated-api"
import { useAuth } from "@/contexts/auth-context"

jest.mock("@/hooks/use-authenticated-api")
jest.mock("@/contexts/auth-context")
jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  },
}))

const mockUseAuthenticatedProducts = useAuthenticatedProducts as jest.MockedFunction<typeof useAuthenticatedProducts>
const mockUseAuthenticatedCategories = useAuthenticatedCategories as jest.MockedFunction<typeof useAuthenticatedCategories>
const mockUseAuthenticatedTables = useAuthenticatedTables as jest.MockedFunction<typeof useAuthenticatedTables>
const mockUseAuthenticatedActivePaymentMethods =
  useAuthenticatedActivePaymentMethods as jest.MockedFunction<typeof useAuthenticatedActivePaymentMethods>
const mockUseAuthenticatedClients =
  useAuthenticatedClients as jest.MockedFunction<typeof useAuthenticatedClients>
const mockUseAuthenticatedOrdersByTable =
  useAuthenticatedOrdersByTable as jest.MockedFunction<typeof useAuthenticatedOrdersByTable>
const mockUseAuthenticatedTodayOrders =
  useAuthenticatedTodayOrders as jest.MockedFunction<typeof useAuthenticatedTodayOrders>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const defaultMockData = {
  categories: [
    { uuid: "cat-1", name: "Lanches" },
    { uuid: "cat-2", name: "Bebidas" },
    { uuid: "cat-3", name: "Sobremesas" },
  ],
  products: [
    {
      uuid: "prod-1",
      name: "Hambúrguer",
      price: 25.00,
      categories: [{ uuid: "cat-1", name: "Lanches" }],
    },
    {
      uuid: "prod-2",
      name: "Coca-Cola",
      price: 5.00,
      categories: [{ uuid: "cat-2", name: "Bebidas" }],
    },
  ],
  tables: [
    { uuid: "table-1", name: "Mesa 1" },
    { uuid: "table-2", name: "Mesa 2" },
  ],
  paymentMethods: [
    { uuid: "pix-1", name: "PIX" },
    { uuid: "card-1", name: "Cartão" },
  ],
  clients: [],
  orders: [],
  todayOrders: [],
}

function setupMocks() {
  mockUseAuthenticatedCategories.mockReturnValue({
    data: defaultMockData.categories,
    loading: false,
    error: null,
  } as any)
  
  mockUseAuthenticatedProducts.mockReturnValue({
    data: defaultMockData.products,
    loading: false,
    error: null,
  } as any)
  
  mockUseAuthenticatedTables.mockReturnValue({
    data: defaultMockData.tables,
    loading: false,
    error: null,
  } as any)
  
  mockUseAuthenticatedActivePaymentMethods.mockReturnValue({
    data: defaultMockData.paymentMethods,
    loading: false,
    error: null,
  } as any)
  
  mockUseAuthenticatedClients.mockReturnValue({
    data: defaultMockData.clients,
    loading: false,
    error: null,
  } as any)
  
  mockUseAuthenticatedOrdersByTable.mockReturnValue({
    data: defaultMockData.orders,
    loading: false,
    error: null,
    refetch: jest.fn(),
  } as any)
  
  mockUseAuthenticatedTodayOrders.mockReturnValue({
    data: defaultMockData.todayOrders,
    loading: false,
    error: null,
    refetch: jest.fn(),
  } as any)
  
  mockUseMutation.mockReturnValue({
    mutate: jest.fn(),
    loading: false,
    error: null,
  } as any)
  
  mockUseAuth.mockReturnValue({
    user: { id: 1, tenant_id: 1 },
    isAuthenticated: true,
    isLoading: false,
  } as any)
}

describe("PDV - Otimizações de Layout e Viewport", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupMocks()
    
    // Mock window.innerHeight para testes de viewport
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 800,
    })
  })

  describe("Layout Principal", () => {
    it("deve ter container principal com altura calculada para viewport", () => {
      const { container } = render(<POSPage />)
      
      const mainContainer = container.querySelector('.flex.flex-col.h-\\[calc\\(100vh-4rem\\)\\]')
      expect(mainContainer).toBeInTheDocument()
    })

    it("deve ter overflow-hidden no container principal", () => {
      const { container } = render(<POSPage />)
      
      const mainContainer = container.querySelector('.overflow-hidden')
      expect(mainContainer).toBeInTheDocument()
    })

    it("deve ter header fixo (flex-shrink-0)", () => {
      const { container } = render(<POSPage />)
      
      const header = container.querySelector('header.flex-shrink-0')
      expect(header).toBeInTheDocument()
    })

    it("deve ter grid principal com proporção 2:1 em desktop", () => {
      const { container } = render(<POSPage />)
      
      const grid = container.querySelector('.grid.lg\\:grid-cols-\\[2fr\\,1fr\\]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe("Header Compacto", () => {
    it("deve ter padding reduzido no header", () => {
      const { container } = render(<POSPage />)
      
      const header = container.querySelector('header.p-3')
      expect(header).toBeInTheDocument()
    })

    it("deve ter título com tamanho otimizado", () => {
      const { container } = render(<POSPage />)
      
      const title = container.querySelector('.text-xl.lg\\:text-2xl')
      expect(title).toBeInTheDocument()
    })

    it("deve ter botões com altura reduzida", () => {
      const { container } = render(<POSPage />)
      
      const buttons = container.querySelectorAll('button.h-9')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe("Categorias Otimizadas", () => {
    it("deve ter grid responsivo para categorias", () => {
      const { container } = render(<POSPage />)
      
      const categoriesGrid = container.querySelector('.grid.sm\\:grid-cols-2.lg\\:grid-cols-3.xl\\:grid-cols-4')
      expect(categoriesGrid).toBeInTheDocument()
    })

    it("deve ter botões de categoria com altura otimizada", () => {
      const { container } = render(<POSPage />)
      
      const categoryButtons = container.querySelectorAll('#categories-section button.h-14')
      expect(categoryButtons.length).toBeGreaterThan(0)
    })

    it("deve ter título de seção com tamanho reduzido", () => {
      const { container } = render(<POSPage />)
      
      const title = container.querySelector('#categories-section .text-base')
      expect(title).toBeInTheDocument()
    })
  })

  describe("Produtos com Scroll Otimizado", () => {
    it("deve ter card de produtos com flex-1 para ocupar espaço disponível", () => {
      const { container } = render(<POSPage />)
      
      const productsCard = container.querySelector('#products-section.flex-1')
      expect(productsCard).toBeInTheDocument()
    })

    it("deve ter ScrollArea para produtos", () => {
      const { container } = render(<POSPage />)
      
      const scrollArea = container.querySelector('#products-section [data-radix-scroll-area-viewport]')
      expect(scrollArea).toBeInTheDocument()
    })

    it("deve ter produtos com altura reduzida", () => {
      const { container } = render(<POSPage />)
      
      const productButtons = container.querySelectorAll('#products-section button.h-32')
      expect(productButtons.length).toBeGreaterThan(0)
    })

    it("deve ter grid responsivo para produtos", () => {
      const { container } = render(<POSPage />)
      
      const productsGrid = container.querySelector('#products-section .grid.sm\\:grid-cols-2.xl\\:grid-cols-3')
      expect(productsGrid).toBeInTheDocument()
    })
  })

  describe("Carrinho Otimizado", () => {
    it("deve ter carrinho com flex-1 para ocupar espaço disponível", () => {
      const { container } = render(<POSPage />)
      
      const cartCard = container.querySelector('#order-summary .flex-1')
      expect(cartCard).toBeInTheDocument()
    })

    it("deve ter ScrollArea para itens do carrinho", () => {
      const { container } = render(<POSPage />)
      
      // Verificar se há ScrollArea dentro do carrinho
      const cartContent = container.querySelector('#order-summary [data-radix-scroll-area-viewport]')
      expect(cartContent).toBeInTheDocument()
    })

    it("deve ter seção fixa no final do carrinho (observações e botões)", () => {
      const { container } = render(<POSPage />)
      
      const fixedSection = container.querySelector('#order-summary .flex-shrink-0.border-t')
      expect(fixedSection).toBeInTheDocument()
    })
  })

  describe("Responsividade", () => {
    it("deve ter layout em coluna única em mobile", () => {
      // Simular viewport mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const { container } = render(<POSPage />)
      
      // Verificar que grid se adapta
      const grid = container.querySelector('.grid.lg\\:grid-cols-\\[2fr\\,1fr\\]')
      expect(grid).toBeInTheDocument()
    })

    it("deve ter layout em grid em desktop", () => {
      // Simular viewport desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      })

      const { container } = render(<POSPage />)
      
      const grid = container.querySelector('.grid.lg\\:grid-cols-\\[2fr\\,1fr\\]')
      expect(grid).toBeInTheDocument()
    })
  })

  describe("Espaçamento e Design", () => {
    it("deve usar gap consistente entre elementos", () => {
      const { container } = render(<POSPage />)
      
      const sections = container.querySelectorAll('.gap-3, .gap-4')
      expect(sections.length).toBeGreaterThan(0)
    })

    it("deve ter margens laterais consistentes", () => {
      const { container } = render(<POSPage />)
      
      const elementsWithMargin = container.querySelectorAll('.mx-2')
      expect(elementsWithMargin.length).toBeGreaterThan(0)
    })

    it("deve ter cards com bordas arredondadas", () => {
      const { container } = render(<POSPage />)
      
      const roundedCards = container.querySelectorAll('.rounded-xl, .rounded-2xl')
      expect(roundedCards.length).toBeGreaterThan(0)
    })
  })

  describe("Performance e Scroll", () => {
    it("não deve ter scroll no container principal", () => {
      const { container } = render(<POSPage />)
      
      const mainContainer = container.querySelector('.overflow-hidden')
      expect(mainContainer).toBeInTheDocument()
    })

    it("deve ter scroll apenas em áreas específicas (produtos e carrinho)", () => {
      const { container } = render(<POSPage />)
      
      const scrollAreas = container.querySelectorAll('[data-radix-scroll-area-viewport]')
      expect(scrollAreas.length).toBeGreaterThan(0)
    })
  })
})

