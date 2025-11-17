/**
 * Testes para as melhorias implementadas no PDV
 * 
 * Fase 1: Botões touch-first, ícones, atalhos, feedback visual, templates
 * Fase 2: Auto-complete, histórico, seleção inteligente, notificações
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import POSPage from "@/app/(dashboard)/pos/page"
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
})
