import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import POSPage from "@/app/(dashboard)/pdv/page"
import {
  useAuthenticatedProducts,
  useAuthenticatedCategories,
  useAuthenticatedTables,
  useAuthenticatedActivePaymentMethods,
  useAuthenticatedClients,
  useMutation,
} from "@/hooks/use-authenticated-api"
import { useAuth } from "@/contexts/auth-context"
import { endpoints } from "@/lib/api-client"

jest.mock("@/hooks/use-authenticated-api", () => ({
  useAuthenticatedProducts: jest.fn(),
  useAuthenticatedCategories: jest.fn(),
  useAuthenticatedTables: jest.fn(),
  useAuthenticatedActivePaymentMethods: jest.fn(),
  useAuthenticatedClients: jest.fn(),
  useMutation: jest.fn(),
}))

jest.mock("@/contexts/auth-context", () => ({
  useAuth: jest.fn(),
}))

const mockUseAuthenticatedProducts = useAuthenticatedProducts as jest.MockedFunction<typeof useAuthenticatedProducts>
const mockUseAuthenticatedCategories = useAuthenticatedCategories as jest.MockedFunction<typeof useAuthenticatedCategories>
const mockUseAuthenticatedTables = useAuthenticatedTables as jest.MockedFunction<typeof useAuthenticatedTables>
const mockUseAuthenticatedActivePaymentMethods =
  useAuthenticatedActivePaymentMethods as jest.MockedFunction<typeof useAuthenticatedActivePaymentMethods>
const mockUseAuthenticatedClients =
  useAuthenticatedClients as jest.MockedFunction<typeof useAuthenticatedClients>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>

const categoriesMock = [
  { uuid: "cat-1", name: "Pizzas" },
  { uuid: "cat-2", name: "Bebidas" },
]

const productsMock = [
  {
    uuid: "prod-1",
    name: "Pizza Margherita",
    price: 32,
    categories: [{ uuid: "cat-1", name: "Pizzas" }],
  },
  {
    uuid: "prod-2",
    name: "Suco Natural",
    price: 12.5,
    categories: [{ uuid: "cat-2", name: "Bebidas" }],
  },
]

const tablesMock = [{ uuid: "table-1", name: "Mesa 01" }]
const paymentMock = [{ uuid: "pay-1", name: "PIX" }]
const clientsMock = []

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
  mockUseMutation.mockReturnValue({
    mutate: successMutation,
    loading: false,
    error: null,
  } as any)
  mockUseAuth.mockReturnValue({
    user: { tenant: { uuid: "tenant-001" } },
    isAuthenticated: true,
    isLoading: false,
  } as any)
}

describe("POSPage", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupSuccessMocks()
  })

  it("renderiza botões touch de categorias e produtos", async () => {
    render(<POSPage />)

    expect(await screen.findByTestId("touch-category-cat-1")).toBeInTheDocument()
    expect(screen.getByTestId("touch-grid-products")).toBeInTheDocument()
    expect(screen.getByTestId("touch-product-prod-1")).toBeInTheDocument()
  })

  it("permite adicionar e remover itens do carrinho", async () => {
    const user = userEvent.setup()
    render(<POSPage />)

    await user.click(screen.getByTestId("touch-product-prod-1"))
    const defaultSignature = "prod-1__base__none"
    expect(screen.getByTestId(`cart-item-qty-${defaultSignature}`)).toHaveTextContent("1")

    await user.click(screen.getByLabelText("Aumentar Pizza Margherita"))
    expect(screen.getByTestId(`cart-item-qty-${defaultSignature}`)).toHaveTextContent("2")

    await user.click(screen.getByLabelText("Diminuir Pizza Margherita"))
    expect(screen.getByTestId(`cart-item-qty-${defaultSignature}`)).toHaveTextContent("1")

    await user.click(screen.getByLabelText("Remover Pizza Margherita"))
    expect(screen.queryByTestId(`cart-item-qty-${defaultSignature}`)).not.toBeInTheDocument()
  })

  it("finaliza o pedido com o payload correto", async () => {
    const user = userEvent.setup()
    render(<POSPage />)

    await user.click(screen.getByTestId("touch-product-prod-1"))
    await user.click(screen.getByTestId("finalize-order-button"))

    await waitFor(() => {
      expect(successMutation).toHaveBeenCalledWith(
        endpoints.orders.create,
        "POST",
        expect.objectContaining({
          token_company: "tenant-001",
          products: [
            expect.objectContaining({
              identify: "prod-1",
              qty: 1,
              price: 32,
            }),
          ],
          payment_method_id: "pay-1",
          table: "table-1",
        })
      )
    })
  })

  it("mantém o layout responsivo para toques", async () => {
    render(<POSPage />)

    const categoriesGrid = await screen.findByTestId("touch-grid-categories")
    expect(categoriesGrid).toHaveClass("grid")

    const productsGrid = screen.getByTestId("touch-grid-products")
    expect(productsGrid).toHaveClass("grid")
  })
})

