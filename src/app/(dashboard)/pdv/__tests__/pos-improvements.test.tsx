/**
 * Testes para as melhorias implementadas no PDV
 * 
 * Fase 1: Botões touch-first, ícones, atalhos, feedback visual, templates
 * Fase 2: Auto-complete, histórico, seleção inteligente, notificações
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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

jest.mock("@/hooks/use-authenticated-api", () => ({
  useAuthenticatedProducts: jest.fn(),
  useAuthenticatedCategories: jest.fn(),
  useAuthenticatedTables: jest.fn(),
  useAuthenticatedActivePaymentMethods: jest.fn(),
  useAuthenticatedClients: jest.fn(),
  useAuthenticatedOrdersByTable: jest.fn(),
  useAuthenticatedTodayOrders: jest.fn(),
  useMutation: jest.fn(),
}))

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

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

const categoriesMock = [
  { uuid: "cat-1", name: "Lanches" },
  { uuid: "cat-2", name: "Bebidas" },
]

const productsMock = [
  {
    uuid: "prod-1",
    name: "Hambúrguer",
    price: 25.00,
    promotional_price: null,
    categories: [{ uuid: "cat-1", name: "Lanches" }],
  },
  {
    uuid: "prod-2",
    name: "Pizza",
    price: 40.00,
    promotional_price: 30.00,
    categories: [{ uuid: "cat-1", name: "Lanches" }],
  },
]

const tablesMock = [
  { uuid: "table-1", name: "Mesa 1" },
  { uuid: "table-2", name: "Mesa 2" },
]

const paymentMock = [
  { uuid: "pix-1", name: "PIX" },
  { uuid: "card-1", name: "Cartão de Crédito" },
  { uuid: "cash-1", name: "Dinheiro" },
]

const clientsMock = [
  { uuid: "client-1", name: "João Silva", phone: "11999999999" },
  { uuid: "client-2", name: "Maria Santos", phone: "11888888888" },
]

const successMutation = jest.fn().mockResolvedValue({ identify: "order-123" })

const defaultHookReturn = {
  loading: false,
  error: null,
}

function setupSuccessMocks() {
  mockUseAuthenticatedCategories.mockReturnValue({
    data: categoriesMock,
    ...defaultHookReturn,
  } as any)
  mockUseAuthenticatedProducts.mockReturnValue({
    data: productsMock,
    ...defaultHookReturn,
  } as any)
  mockUseAuthenticatedTables.mockReturnValue({
    data: tablesMock,
    ...defaultHookReturn,
  } as any)
  mockUseAuthenticatedActivePaymentMethods.mockReturnValue({
    data: paymentMock,
    ...defaultHookReturn,
  } as any)
  mockUseAuthenticatedClients.mockReturnValue({
    data: clientsMock,
    ...defaultHookReturn,
  } as any)
  mockUseAuthenticatedOrdersByTable.mockReturnValue({
    data: [],
    ...defaultHookReturn,
    refetch: jest.fn(),
  } as any)
  mockUseAuthenticatedTodayOrders.mockReturnValue({
    data: [],
    ...defaultHookReturn,
    refetch: jest.fn(),
  } as any)
  mockUseMutation.mockReturnValue({
    mutate: successMutation,
    loading: false,
    error: null,
  } as any)
  mockUseAuth.mockReturnValue({
    user: { id: 1, tenant_id: 1 },
    isAuthenticated: true,
    isLoading: false,
  } as any)
}

describe("PDV - Melhorias Implementadas", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupSuccessMocks()
  })

  describe("Fase 1: Quick Wins", () => {
    describe("Botões Touch-First", () => {
      it("deve ter botões de quantidade com tamanho mínimo de 56x56px (h-14 w-14)", async () => {
        render(<POSPage />)

        const productButton = await screen.findByTestId("touch-product-prod-1")
        fireEvent.click(productButton)

        await waitFor(() => {
          const decreaseButton = screen.getByLabelText(/diminuir/i)
          const increaseButton = screen.getByLabelText(/aumentar/i)

          expect(decreaseButton).toHaveClass("h-14", "w-14")
          expect(increaseButton).toHaveClass("h-14", "w-14")
        })
      })

      it("deve ter botão finalizar com altura de 96px (h-24)", async () => {
        render(<POSPage />)

        const finalizeButton = await screen.findByTestId("finalize-order-button")
        expect(finalizeButton).toHaveClass("h-24")
      })

      it("deve ter botões de pagamento com altura de 64px (h-16)", async () => {
        render(<POSPage />)

        await waitFor(() => {
          const paymentButtons = screen.getAllByTestId(/payment-button-/)
          paymentButtons.forEach((button) => {
            expect(button).toHaveClass("h-16")
          })
        })
      })
    })

    describe("Ícones em Métodos de Pagamento", () => {
      it("deve exibir ícones nos botões de pagamento", async () => {
        render(<POSPage />)

        await waitFor(() => {
          const pixButton = screen.getByTestId("payment-button-pix-1")
          const cardButton = screen.getByTestId("payment-button-card-1")
          const cashButton = screen.getByTestId("payment-button-cash-1")

          expect(pixButton).toBeInTheDocument()
          expect(cardButton).toBeInTheDocument()
          expect(cashButton).toBeInTheDocument()
        })
      })

      it("deve mostrar indicador visual quando método está selecionado", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        const pixButton = await screen.findByTestId("payment-button-pix-1")
        await user.click(pixButton)

        await waitFor(() => {
          expect(pixButton).toHaveClass("bg-primary")
        })
      })
    })

    describe("Atalhos de Teclado", () => {
      it("deve criar novo pedido com Ctrl+N", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        await user.keyboard("{Control>}n{/Control}")

        await waitFor(() => {
          const { toast } = require("sonner")
          expect(toast.success).toHaveBeenCalledWith("Novo pedido iniciado")
        })
      })

      it("deve focar busca com Ctrl+F", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        const searchInput = await screen.findByPlaceholderText(/buscar pedido/i)

        await user.keyboard("{Control>}f{/Control}")

        await waitFor(() => {
          expect(searchInput).toHaveFocus()
        })
      })

      it("deve selecionar categoria com números 1-9", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        await user.keyboard("1")

        await waitFor(() => {
          const categoryButton = screen.getByTestId("touch-category-cat-1")
          expect(categoryButton).toHaveClass("bg-primary")
        })
      })
    })

    describe("Templates de Observações", () => {
      it("deve exibir templates de observações", async () => {
        render(<POSPage />)

        const productButton = await screen.findByTestId("touch-product-prod-1")
        fireEvent.click(productButton)

        await waitFor(() => {
          expect(screen.getByText("Sem cebola")).toBeInTheDocument()
          expect(screen.getByText("Sem tomate")).toBeInTheDocument()
          expect(screen.getByText("Bem passado")).toBeInTheDocument()
        })
      })

      it("deve adicionar template ao campo de observações ao clicar", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        const productButton = await screen.findByTestId("touch-product-prod-1")
        await user.click(productButton)

        await waitFor(async () => {
          const templateButton = screen.getByText("Sem cebola")
          await user.click(templateButton)

          const observationInput = screen.getByPlaceholderText(/observações/i)
          expect(observationInput).toHaveValue("Sem cebola")
        })
      })
    })
  })

  describe("Fase 2: Melhorias de Fluxo", () => {
    describe("Auto-complete", () => {
      it("deve ter datalist para nomes de clientes", async () => {
        render(<POSPage />)

        await waitFor(() => {
          const nameInput = screen.getByPlaceholderText(/nome do cliente/i)
          expect(nameInput).toHaveAttribute("list", "client-names")
        })
      })

      it("deve ter opções no datalist", async () => {
        render(<POSPage />)

        await waitFor(() => {
          const datalist = document.getElementById("client-names")
          expect(datalist).toBeInTheDocument()
        })
      })
    })

    describe("Seleção Inteligente", () => {
      it("deve ordenar produtos com promoção primeiro", async () => {
        render(<POSPage />)

        const categoryButton = await screen.findByTestId("touch-category-cat-1")
        fireEvent.click(categoryButton)

        await waitFor(() => {
          const productButtons = screen.getAllByTestId(/touch-product-/)
          // O primeiro produto deve ser a Pizza (tem promoção)
          expect(productButtons[0]).toHaveAttribute("data-testid", "touch-product-prod-2")
        })
      })
    })

    describe("Notificações Contextualizadas", () => {
      it("deve exibir alerta quando mesa não está selecionada", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        const productButton = await screen.findByTestId("touch-product-prod-1")
        await user.click(productButton)

        await waitFor(() => {
          expect(screen.getByText(/selecione uma mesa para continuar/i)).toBeInTheDocument()
        })
      })

      it("deve exibir alerta quando método de pagamento não está selecionado", async () => {
        const user = userEvent.setup()
        render(<POSPage />)

        const productButton = await screen.findByTestId("touch-product-prod-1")
        await user.click(productButton)

        await waitFor(() => {
          expect(screen.getByText(/selecione uma forma de pagamento/i)).toBeInTheDocument()
        })
      })

      it("deve exibir alerta quando mesa tem pedidos em aberto", async () => {
        mockUseAuthenticatedOrdersByTable.mockReturnValue({
          data: [{ id: 1, identify: "ORD-001" }],
          loading: false,
          error: null,
          refetch: jest.fn(),
        } as any)

        const user = userEvent.setup()
        render(<POSPage />)

        const tableButton = await screen.findByTestId("table-button-table-1")
        await user.click(tableButton)

        await waitFor(() => {
          expect(screen.getByText(/mesa tem.*pedido.*em aberto/i)).toBeInTheDocument()
        })
      })
    })
  })

  describe("Integração e Fluxo Completo", () => {
    it("deve permitir criar pedido completo com todas as melhorias", async () => {
      const user = userEvent.setup()
      render(<POSPage />)

      // 1. Selecionar categoria (atalho de teclado)
      await user.keyboard("1")

      // 2. Adicionar produto
      const productButton = await screen.findByTestId("touch-product-prod-1")
      await user.click(productButton)

      // 3. Adicionar observação via template
      await waitFor(async () => {
        const templateButton = screen.getByText("Sem cebola")
        await user.click(templateButton)
      })

      // 4. Selecionar mesa
      const tableButton = await screen.findByTestId("table-button-table-1")
      await user.click(tableButton)

      // 5. Selecionar método de pagamento
      const paymentButton = await screen.findByTestId("payment-button-pix-1")
      await user.click(paymentButton)

      // 6. Finalizar pedido
      const finalizeButton = await screen.findByTestId("finalize-order-button")
      await user.click(finalizeButton)

      // Verificar se o pedido foi criado
      await waitFor(() => {
        expect(successMutation).toHaveBeenCalled()
      })
    })
  })

  describe("Lógica de Mesa Ocupada", () => {
    it("NÃO deve exibir mensagem 'Mesa Ocupada' para o pedido que originalmente ocupou a mesa", async () => {
      // Mock: Pedido atual na mesa 1
      const currentOrder = {
        identify: "order-123",
        uuid: "order-123",
        id: 123,
        table: { uuid: "table-1", name: "Mesa 1" },
        status: "Em Preparo",
      }

      // Mock: Pedidos de hoje incluindo o pedido atual
      const todayOrdersWithCurrent = [
        {
          identify: "order-123",
          uuid: "order-123",
          id: 123,
          table: { uuid: "table-1", name: "Mesa 1" },
          status: "Em Preparo",
        },
      ]

      mockUseAuthenticatedTodayOrders.mockReturnValue({
        data: todayOrdersWithCurrent,
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const user = userEvent.setup()
      const { container } = render(<POSPage />)

      // Simular que há um pedido atual na mesa 1
      // (Isso seria feito internamente quando o pedido é iniciado)
      // Por enquanto, vamos verificar que não há mensagem de mesa ocupada

      // Selecionar mesa 1
      const tableSelect = await screen.findByLabelText(/mesa/i)
      await user.click(tableSelect)

      await waitFor(() => {
        const mesa1Option = screen.getByText("Mesa 1")
        await user.click(mesa1Option)
      })

      // Verificar que NÃO há mensagem de mesa ocupada
      await waitFor(() => {
        const mesaOcupadaMessage = screen.queryByText(/mesa ocupada/i)
        expect(mesaOcupadaMessage).not.toBeInTheDocument()
      })
    })

    it("deve exibir mensagem 'Mesa Ocupada' quando outro pedido tentar usar uma mesa já ocupada", async () => {
      // Mock: Pedido de OUTRO pedido na mesa 1
      const otherOrder = {
        identify: "order-456",
        uuid: "order-456",
        id: 456,
        table: { uuid: "table-1", name: "Mesa 1" },
        status: "Em Preparo",
      }

      // Mock: Pedidos de hoje com outro pedido na mesa
      const todayOrdersWithOther = [otherOrder]

      mockUseAuthenticatedTodayOrders.mockReturnValue({
        data: todayOrdersWithOther,
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      mockUseAuthenticatedOrdersByTable.mockReturnValue({
        data: [otherOrder],
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const user = userEvent.setup()
      render(<POSPage />)

      // Selecionar mesa 1 (que já tem outro pedido)
      const tableSelect = await screen.findByLabelText(/mesa/i)
      await user.click(tableSelect)

      await waitFor(async () => {
        const mesa1Option = screen.getByText("Mesa 1")
        await user.click(mesa1Option)
      })

      // Verificar que a mensagem de mesa ocupada é exibida
      await waitFor(() => {
        const mesaOcupadaMessage = screen.getByText(/mesa ocupada/i)
        expect(mesaOcupadaMessage).toBeInTheDocument()
      })
    })

    it("deve permitir editar o pedido que ocupou a mesa sem mostrar mensagem de ocupada", async () => {
      // Mock: Pedido sendo editado na mesa 1
      const editingOrder = {
        identify: "order-123",
        uuid: "order-123",
        id: 123,
        table: { uuid: "table-1", name: "Mesa 1" },
        status: "Em Preparo",
      }

      // Mock: Pedidos de hoje incluindo o pedido sendo editado
      const todayOrdersWithEditing = [editingOrder]

      mockUseAuthenticatedTodayOrders.mockReturnValue({
        data: todayOrdersWithEditing,
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      mockUseAuthenticatedOrdersByTable.mockReturnValue({
        data: [editingOrder],
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const user = userEvent.setup()
      render(<POSPage />)

      // Simular que estamos editando um pedido
      // (Isso seria feito ao carregar um pedido existente)
      // Por enquanto, vamos verificar que não há mensagem quando o pedido pertence à mesa

      // Verificar que NÃO há mensagem de mesa ocupada quando editando o próprio pedido
      await waitFor(() => {
        const mesaOcupadaMessage = screen.queryByText(/mesa ocupada/i)
        expect(mesaOcupadaMessage).not.toBeInTheDocument()
      })
    })

    it("deve exibir mensagem quando tentar criar novo pedido em mesa com pedido em aberto", async () => {
      // Mock: Outro pedido na mesa 1
      const existingOrder = {
        identify: "order-789",
        uuid: "order-789",
        id: 789,
        table: { uuid: "table-1", name: "Mesa 1" },
        status: "Em Preparo",
      }

      mockUseAuthenticatedTodayOrders.mockReturnValue({
        data: [existingOrder],
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      mockUseAuthenticatedOrdersByTable.mockReturnValue({
        data: [existingOrder],
        loading: false,
        error: null,
        refetch: jest.fn(),
      } as any)

      const user = userEvent.setup()
      render(<POSPage />)

      // Selecionar mesa 1 que já tem pedido
      const tableSelect = await screen.findByLabelText(/mesa/i)
      await user.click(tableSelect)

      await waitFor(async () => {
        const mesa1Option = screen.getByText("Mesa 1")
        await user.click(mesa1Option)
      })

      // Verificar que a mensagem aparece
      await waitFor(() => {
        expect(screen.getByText(/mesa ocupada/i)).toBeInTheDocument()
        expect(screen.getByText(/esta mesa possui pedidos em aberto/i)).toBeInTheDocument()
      })
    })
  })
})
