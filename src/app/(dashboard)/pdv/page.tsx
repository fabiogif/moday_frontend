"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import Image from "next/image"
import {
  useAuthenticatedProducts,
  useAuthenticatedCategories,
  useAuthenticatedTables,
  useAuthenticatedActivePaymentMethods,
  useAuthenticatedClients,
  useAuthenticatedOrdersByTable,
  useAuthenticatedTodayOrders,
  useAuthenticatedActiveServiceTypes,
  useMutation,
} from "@/hooks/use-authenticated-api"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/usePermissions"
import { endpoints, apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { showErrorToast } from "@/components/ui/error-toast"
import { extractValidationErrors } from "@/lib/error-formatter"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Combobox, ComboboxOption } from "@/components/ui/combobox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PageLoading } from "@/components/ui/loading-progress"
import {
  Plus,
  Minus,
  Trash2,
  Loader2,
  Utensils,
  ShoppingCart,
  NotebookPen,
  MapPin,
  Search,
  Edit,
  X,
  Clock,
  User,
  Package,
  CreditCard,
  Smartphone,
  Banknote,
  Radio,
  Building2,
  CheckCircle2,
  Copy,
  HelpCircle,
  MessageSquare,
  Star,
  Mail,
  MessageCircle,
  Truck,
  Bell,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  BarChart,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  ArrowRight,
  Handshake,
  CreditCard as CreditCardIcon,
  ShoppingCart as ShoppingCartIcon,
} from "lucide-react"
import { maskPhone, maskZipCode } from "@/lib/masks"
import { useViaCEP } from "@/hooks/use-viacep"
import { PixQrCodeDialog } from "./components/pix-qr-code-dialog"
import { ProductRecommendations } from "./components/product-recommendations"
import { PDVTutorial } from "./components/pdv-tutorial"
import { PDVFeedback } from "./components/pdv-feedback"
import { ChangeDialog } from "./components/change-dialog"
import { usePOSHeader } from "@/contexts/pos-header-context"
import { OrderSearch } from "./components/search/order-search"
import { TableSearch } from "./components/search/table-search"
import { CombinedSearch } from "./components/search/combined-search"
import { PDVHeader } from "./components/layout/pdv-header"
import { PDVMainLayout, PDVTwoColumnLayout } from "./components/layout/pdv-main-layout"
import { OrderItemsList } from "./components/order/order-items-list"
import { OrderTotals } from "./components/order/order-totals"
import { OrderNotes } from "./components/order/order-notes"
import { OrderActions } from "./components/order/order-actions"
import { OrderTypeSelector, type OrderType } from "./components/order/order-type-selector"
import { TableSelector } from "./components/tables/table-selector"
import { DeliveryAddressForm } from "./components/delivery/delivery-address-form"
import { OrderStatusGuard } from "./components/order/order-status-guard"
import { OrderStatusBadge } from "./components/order/order-status-badge"
import { PaymentMethodsSelector } from "./components/payment/payment-methods-selector"
import { PaymentButtonsGrid } from "./components/payment/payment-buttons-grid"
import { FiscalDocument } from "./components/fiscal/fiscal-document"
import { PaymentAmountInput } from "./components/payment/payment-amount-input"
import { PaymentSummary } from "./components/payment/payment-summary"
import { PaymentConfirmationDialog, type PaymentConfirmationItem } from "./components/payment/payment-confirmation-dialog"
import { SplitPaymentForm, type SplitPaymentItem } from "./components/payment/split-payment-form"
import type { PaymentMethod as PaymentMethodType } from "./components/payment/payment-method-card"
import { ProductGrid } from "./components/catalog/product-grid"
import { ProductFilters } from "./components/catalog/product-filters"
import { ProductSearch } from "./components/catalog/product-search"
import { 
  isFinalStatus, 
  canEditOrder, 
  canAdvanceStatus, 
  canFinalizeOrder,
  getNextStatusName as getNextStatusNameUtil,
  FINAL_STATUSES 
} from "./utils/order-status"
import {
  parsePrice as parsePriceUtil,
  getProductPrice as getProductPriceUtil,
  getCartItemUnitPrice as getCartItemUnitPriceUtil,
  getCartItemTotal,
  calculateOrderTotal,
  formatCurrency as formatCurrencyUtil,
  calculateChange,
} from "./services/order-calculator"
import {
  validateOrderBeforeStart,
  validateOrderBeforeUpdate,
  validateOrderBeforeFinalize,
  type ValidationError,
} from "./services/order-validator"
import {
  preparePaymentData,
  preparePaymentPayload,
  isPaymentComplete,
  isCashPayment,
} from "./services/payment-processor"

type Category = {
  uuid?: string
  identify?: string
  name: string
  color?: string
}

type ProductCategory = {
  uuid?: string
  identify?: string
  name: string
}

type ProductVariation = {
  id?: string
  identify?: string
  name: string
  price?: number | string | null
}

type ProductOptional = {
  id?: string
  identify?: string
  name: string
  price?: number | string | null
}

type Product = {
  uuid?: string
  identify?: string
  name: string
  description?: string
  price: number | string
  promotional_price?: number | string | null
  image?: string | null
  image_url?: string | null
  categories?: ProductCategory[]
  variations?: ProductVariation[]
  optionals?: ProductOptional[]
  observation_templates?: string[]
  observation_suggestions?: string[]
}

type Table = {
  uuid?: string
  identify?: string
  name: string
}

// PaymentMethod type agora importado de payment-method-card.tsx como PaymentMethodType

type Client = {
  uuid?: string
  identify?: string
  name: string
  email?: string
  phone?: string
  cpf?: string
}

interface CartItem {
  signature: string
  product: Product
  quantity: number
  observation: string
  selectedVariation?: ProductVariation | null
  selectedOptionals?: Array<(ProductOptional & { quantity: number })>
}

type OrderStatus = 'Pendente' | 'Preparando' | 'Pronto' | 'Em Entrega' | 'Entregue' | 'Concluído' | 'Cancelado' | 'Arquivado'

interface Order {
  id?: string | number
  uuid?: string
  identify?: string
  status: OrderStatus | string
  order_status?: {
    name: OrderStatus | string
  }
  total: number | string
  client?: Client & { id?: string | number }
  client_id?: string
  table?: Table
  table_id?: string
  products?: Array<{
    product: Product
    quantity: number
    observation?: string
  }>
  created_at?: string
  updated_at?: string
  comment?: string
  is_delivery?: boolean
  delivery_address?: string
  delivery_zip_code?: string
  delivery_number?: string
  delivery_neighborhood?: string
  delivery_city?: string
  delivery_state?: string
  delivery_complement?: string
  payment_method_id?: string | number
  paymentMethod?: {
    id?: string | number
    uuid?: string
    name?: string
  }
}

interface TableOrder extends Order {
  table: Table
}

// Função helper para extrair coleções de dados da API
// Moved outside component to avoid minification issues
const extractCollection = <T,>(raw: unknown): T[] => {
  try {
    if (!raw) return []
    if (Array.isArray(raw)) return raw as T[]
    if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data?: unknown }).data)) {
      return (raw as { data: T[] }).data
    }
    // Se for um objeto com propriedades que parecem uma coleção
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      // Verificar se tem uma propriedade que é um array
      const arrayProps = Object.values(raw).filter(Array.isArray)
      if (arrayProps.length > 0) {
        return arrayProps[0] as T[]
      }
    }
    return []
  } catch (error) {
    console.error('Error extracting collection:', error)
    return []
  }
}


// Função helper para normalizar nome do status (remover variações como "/ Cozinha")
const normalizeStatusName = (statusName: string | null | undefined): string => {
  if (!statusName) return ''
  const normalized = statusName.trim()
  // Remover sufixos comuns após "/"
  if (normalized.includes('/')) {
    return normalized.split('/')[0].trim()
  }
  return normalized
}

// Função helper para obter o próximo status do fluxo
const getNextStatusName = (currentStatus: string | null | undefined, isDelivery: boolean): string | null => {
  if (!currentStatus) return null
  
  // Normalizar o status atual para comparação
  const normalizedCurrent = normalizeStatusName(currentStatus)
  
  // Mapear fluxo de status (usando nomes normalizados)
  const flow: Record<string, string> = {
    'Pedido Recebido': 'Em Preparação',
    'Em Preparação': 'Pronto',
    'Pronto': isDelivery ? 'Em Entrega' : 'Entregue',
    'Em Entrega': 'Entregue',
  }
  
  return flow[normalizedCurrent] || null
}

// Funções utilitárias - usando serviços com wrappers locais quando necessário
function getProductId(product: Product): string {
  return product.uuid || product.identify || product.name
}

// Wrapper para parsePrice que mantém compatibilidade
const parsePrice = parsePriceUtil

// Wrapper para getProductPrice que considera promotional_price
function getProductPrice(product: Product): number {
  const base = product.promotional_price ?? product.price
  return parsePrice(base)
}

// formatCurrency agora importado de order-calculator.ts
const formatCurrency = formatCurrencyUtil

function getCartItemSignature(
  productId: string,
  variationId?: string | null,
  optionals?: Array<{ id?: string; name?: string; quantity: number }>
): string {
  const variationKey = variationId || "base"
  const optionalsKey =
    optionals && optionals.length
      ? optionals
          .map((opt) => `${opt.id || opt.name || "opt"}:${opt.quantity}`)
          .sort()
          .join("|")
      : "none"
  return `${productId}__${variationKey}__${optionalsKey}`
}

// getCartItemUnitPrice - wrapper local que considera promotional_price
function getCartItemUnitPrice(item: CartItem): number {
  const basePrice = item.selectedVariation
    ? parsePrice(item.selectedVariation.price ?? null) || getProductPrice(item.product)
    : getProductPrice(item.product)

  const optionalsTotal =
    item.selectedOptionals?.reduce((sum, optional) => {
      return sum + parsePrice(optional.price) * optional.quantity
    }, 0) ?? 0

  return basePrice + optionalsTotal
}

// Componente de Dashboard Rápido do PDV
function PDVQuickDashboard({ 
  todayOrders, 
  showDashboard, 
  onToggle 
}: { 
  todayOrders: Order[]
  showDashboard: boolean
  onToggle: () => void
}) {
  const stats = useMemo(() => {
    const totalSales = todayOrders.reduce((sum, order: Order) => sum + parsePrice(order.total || 0), 0)
    const totalOrders = todayOrders.length
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0
    
    // Contar mesas ocupadas
    const occupiedTables = new Set()
    todayOrders.forEach((order: Order) => {
      if (order.table?.uuid && !['Entregue', 'Concluído', 'Cancelado'].includes(order.status)) {
        occupiedTables.add(order.table.uuid)
      }
    })
    
    return {
      totalSales,
      totalOrders,
      averageTicket,
      occupiedTables: occupiedTables.size,
    }
  }, [todayOrders])
  
  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20 px-4 flex items-center justify-between gap-3 flex-1">
      <div className="flex items-center gap-2 flex-1">
        <BarChart className="h-5 w-5 text-indigo-600" />
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Vendas:</span>
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{formatCurrency(stats.totalSales)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Pedidos:</span>
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{stats.totalOrders}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Ticket Médio:</span>
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{formatCurrency(stats.averageTicket)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mesas Ocupadas:</span>
            <span className="text-sm font-medium text-indigo-900 dark:text-indigo-100">{stats.occupiedTables}</span>
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="h-8 w-8 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100"
        title={showDashboard ? "Ocultar dashboard" : "Exibir dashboard"}
      >
        {showDashboard ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}

// Componente de histórico de pedidos do cliente
function ClientOrderHistory({ clientId, onLoadOrder }: { clientId: string; onLoadOrder: (orderId: string) => void }) {
  const [history, setHistory] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!clientId) {
        setHistory([])
        return
      }
      
      setLoading(true)
      try {
        // Buscar pedidos do cliente usando o endpoint de listagem
        // Nota: O endpoint pode não suportar filtro por client_id diretamente
        // Por enquanto, buscamos todos os pedidos e filtramos no frontend
        const response = await apiClient.get(endpoints.orders.list, {
          per_page: 50, // Buscar mais para ter chance de encontrar pedidos do cliente
          order_by: 'created_at',
          order_direction: 'desc'
        })
        
        if (response.success && response.data) {
          // Tratar diferentes formatos de resposta
          let orders: Order[] = []
          
          if (Array.isArray(response.data)) {
            orders = response.data
          } else if (response.data && typeof response.data === 'object') {
            // Se for um objeto com propriedade data (Laravel Resource Collection)
            if (Array.isArray((response.data as { data?: Order[] }).data)) {
              orders = (response.data as { data: Order[] }).data
            } else if (Array.isArray((response.data as any).items)) {
              orders = (response.data as any).items
            }
          }
          
          // Filtrar pedidos do cliente específico
          const clientOrders = orders.filter((order: Order) => {
            const orderClientId = order.client_id || order.client?.uuid || order.client?.identify || order.client?.id
            return orderClientId === clientId
          })
          
          // Limitar a 5 pedidos mais recentes
          setHistory(clientOrders.slice(0, 5))
        } else {
          setHistory([])
        }
      } catch (error: unknown) {
        // Log mais detalhado do erro apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error('Erro ao carregar histórico do cliente:', error)
        }
        // Não mostrar erro ao usuário, apenas não exibir histórico
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchHistory()
  }, [clientId])
  
  if (loading) {
    return (
      <div className="rounded-xl border bg-muted/30 p-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Carregando histórico...</span>
        </div>
      </div>
    )
  }
  
  if (history.length === 0) {
    return null
  }
  
  return (
    <div className="rounded-xl border bg-muted/30 p-3 space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
        <Clock className="h-3 w-3" />
        Últimos Pedidos
      </p>
      <div className="space-y-1">
        {history.map((order: Order) => {
          const orderId = order.identify || order.uuid || order.id
          const orderTotal = parsePrice(order.total || 0)
          const orderDate = order.created_at 
            ? new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : '--'
          return (
            <button
              key={orderId}
              onClick={() => onLoadOrder(String(orderId))}
              className="w-full flex items-center justify-between gap-2 rounded-lg border bg-card p-2 text-left hover:bg-primary/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">#{order.identify || order.id}</p>
                <p className="text-xs text-muted-foreground">{orderDate} • {formatCurrency(orderTotal)}</p>
              </div>
              <Edit className="h-3 w-3 text-primary flex-shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Função helper para renderizar botões de ação do pedido
function renderOrderActionButtons({
  orderStarted,
  editingOrder,
  currentOrder,
  isDelivery,
  submittingOrder,
  cart,
  pdvPermissions,
  handleUpdateOrder,
  handleAdvanceStatus,
  handleFinalizeOrder,
  handleCancelOrder,
  getNextStatusName,
  isFinalStatus,
}: {
  orderStarted: boolean
  editingOrder: Order | null
  currentOrder: Order | null
  isDelivery: boolean
  submittingOrder: boolean
  cart: CartItem[]
  pdvPermissions: { canCreateOrder: boolean }
  handleUpdateOrder: () => void
  handleAdvanceStatus: () => void
  handleFinalizeOrder: () => void
  handleCancelOrder: () => void
  getNextStatusName: (status: string | null | undefined, isDelivery: boolean) => string | null
  isFinalStatus: (status: string | null | undefined) => boolean
}) {
  // Verificar se o pedido tem status final
  const orderStatus = editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name
  const orderIsFinal = isFinalStatus(orderStatus)
  const canAdvanceStatus = !orderIsFinal && orderStatus !== 'Entregue'
  const finalizeStatuses = ['Pronto', 'Em Entrega']
  const canFinalize = !orderIsFinal && orderStatus && finalizeStatuses.includes(orderStatus)
  const nextStatusNameForAdvance = getNextStatusName(orderStatus, isDelivery)
  const advanceTitle =
    !canAdvanceStatus
      ? "Status atual não permite avançar"
      : orderIsFinal
      ? `Pedido com status final ${orderStatus} não pode ter status alterado`
      : !pdvPermissions.canCreateOrder
      ? "Você não tem permissão para avançar status"
      : nextStatusNameForAdvance
      ? `Avançar de ${orderStatus} para ${nextStatusNameForAdvance}`
      : undefined
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {/* Atualizar Pedido */}
      <Button
        id="update-order-button"
        data-testid="update-order-button"
        onClick={handleUpdateOrder}
        disabled={
          submittingOrder || 
          !cart.length ||
          !pdvPermissions.canCreateOrder ||
          orderIsFinal
        }
        className="h-16 rounded-2xl text-sm sm:text-base font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full"
        title={
          orderIsFinal
            ? `Pedido com status final ${orderStatus} não pode ser editado`
            : !cart.length
            ? "Adicione itens ao pedido" 
            : !pdvPermissions.canCreateOrder 
            ? "Você não tem permissão para atualizar pedidos" 
            : undefined
        }
      >
        {submittingOrder ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span className="truncate">Atualizar Pedido</span>
          </>
        )}
      </Button>

      {/* Avançar Pedido */}
          <Button
            id="advance-status-button"
            data-testid="advance-status-button"
            onClick={handleAdvanceStatus}
            disabled={
              submittingOrder ||
              !pdvPermissions.canCreateOrder ||
          orderIsFinal ||
          !canAdvanceStatus
            }
        className="h-16 rounded-2xl text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full"
        title={advanceTitle}
          >
            {submittingOrder ? (
              <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
            <ArrowRight className="mr-2 h-4 w-4" />
            <span className="truncate">
              {nextStatusNameForAdvance ? `Avançar para ${nextStatusNameForAdvance}` : "Avançar Pedido"}
            </span>
              </>
            )}
          </Button>

      {/* Cancelar Pedido */}
      <Button
        id="cancel-order-button"
        data-testid="cancel-order-button"
        onClick={handleCancelOrder}
        disabled={
          submittingOrder ||
          !pdvPermissions.canCreateOrder ||
          (orderIsFinal && orderStatus !== 'Cancelado')
        }
        className="h-16 rounded-2xl text-sm sm:text-base font-semibold bg-red-600 hover:bg-red-700 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed w-full"
        title={
          orderIsFinal && orderStatus !== 'Cancelado'
            ? `Pedido com status final ${orderStatus} não pode ser cancelado`
            : !pdvPermissions.canCreateOrder 
            ? "Você não tem permissão para cancelar pedidos" 
            : undefined
        }
      >
        {submittingOrder ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <X className="mr-2 h-4 w-4" />
            <span className="truncate">Cancelar Pedido</span>
          </>
        )}
      </Button>
    </div>
  )
}

export default function POSPage() {
  // ============================================
  // TODOS OS HOOKS DEVEM SER CHAMADOS PRIMEIRO
  // ============================================
  
  // Hooks de autenticação e permissões
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { hasPermission } = usePermissions()
  
  // Hooks de dados autenticados (chamados sempre, na mesma ordem)
  const {
    data: categoriesData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useAuthenticatedCategories()
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
  } = useAuthenticatedProducts()
  const {
    data: tablesData,
    loading: tablesLoading,
    error: tablesError,
  } = useAuthenticatedTables()
  const {
    data: paymentData,
    loading: paymentLoading,
    error: paymentError,
  } = useAuthenticatedActivePaymentMethods()
  const {
    data: clientsData,
    loading: clientsLoading,
    error: clientsError,
  } = useAuthenticatedClients()
  const {
    data: todayOrdersData,
    loading: todayOrdersLoading,
    error: todayOrdersError,
    refetch: refetchTodayOrders,
  } = useAuthenticatedTodayOrders()
  const {
    data: serviceTypesData,
    loading: serviceTypesLoading,
    error: serviceTypesError,
  } = useAuthenticatedActiveServiceTypes()
  const { mutate: mutateOrder, loading: submittingOrder } = useMutation()

  // ============================================
  // ESTADOS LOCAIS (todos os useState juntos)
  // ============================================
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")
  const [isDelivery, setIsDelivery] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
  const [showPixDialog, setShowPixDialog] = useState(false)
  const [pixOrderData, setPixOrderData] = useState<{
    orderId: string
    total: number
    qrCode?: string
    qrCodeText?: string
  } | null>(null)
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string>("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [deliveryAddress, setDeliveryAddress] = useState({
    zip: "",
    address: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    complement: "",
  })
  const [selectionDialogOpen, setSelectionDialogOpen] = useState(false)
  const [selectionProduct, setSelectionProduct] = useState<Product | null>(null)
  const [selectionVariationId, setSelectionVariationId] = useState<string>("")
  const [selectionOptionals, setSelectionOptionals] = useState<Record<string, number>>({})
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [editOrderSheetOpen, setEditOrderSheetOpen] = useState(false)
  const [editOrderCart, setEditOrderCart] = useState<CartItem[]>([])
  const [editOrderNotes, setEditOrderNotes] = useState("")
  const [orderStarted, setOrderStarted] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(true)
  const [showProducts, setShowProducts] = useState(true)
  const [showCart, setShowCart] = useState(true)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showTodayOrdersSheet, setShowTodayOrdersSheet] = useState(false)
  const [showClientSection, setShowClientSection] = useState(true)
  const [productSearchQuery, setProductSearchQuery] = useState("")
  const [showPaymentMethods, setShowPaymentMethods] = useState(true)
  const [showChangeDialog, setShowChangeDialog] = useState(false)
  const [needsChange, setNeedsChange] = useState(false)
  const [receivedAmount, setReceivedAmount] = useState<number | null>(null)
  const [changeDialogAnswered, setChangeDialogAnswered] = useState(false)
  const [useSplitPayment, setUseSplitPayment] = useState(false)
  const [splitPaymentItems, setSplitPaymentItems] = useState<SplitPaymentItem[]>([])
  const [showPaymentConfirmation, setShowPaymentConfirmation] = useState(false)
  const [showOrderActions, setShowOrderActions] = useState(true)
  const [cartTab, setCartTab] = useState<"service" | "payment" | "client" | "items">("service")
  // Documento Fiscal
  const [fiscalDocumentType, setFiscalDocumentType] = useState<"nfce" | "nfe" | null>(null)
  const [fiscalCpfCnpj, setFiscalCpfCnpj] = useState("")
  const orderSearchRef = useRef<HTMLDivElement>(null)
  const addingItemTimerRef = useRef<NodeJS.Timeout | null>(null)
  const removingItemTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Hook que depende de estado (deve ser chamado DEPOIS de todos os useState)
  const {
    data: tableOrdersData,
    loading: tableOrdersLoading,
    error: tableOrdersError,
    refetch: refetchTableOrders,
  } = useAuthenticatedOrdersByTable(selectedTable)

  // Hook para busca de CEP via ViaCEP
  const { loading: loadingCEP, searchCEP } = useViaCEP()

  // ============================================
  // USEMEMO E OUTROS HOOKS DERIVADOS
  // ============================================
  
  // Verificar permissões do PDV
  const pdvPermissions = useMemo(() => {
    return {
      canCreateOrder: hasPermission('pdv.create_order'),
      canEditOrder: hasPermission('pdv.edit_order'),
      canCancelOrder: hasPermission('pdv.cancel_order'),
      canViewReports: hasPermission('pdv.view_reports'),
      canManageProducts: hasPermission('pdv.manage_products'),
      canApplyDiscount: hasPermission('pdv.apply_discount'),
      canRefund: hasPermission('pdv.refund'),
      canViewAllOrders: hasPermission('pdv.view_all_orders'),
    }
  }, [hasPermission])

  const categories = useMemo<Category[]>(() => extractCollection(categoriesData), [categoriesData])
  const products = useMemo<Product[]>(() => extractCollection(productsData), [productsData])
  const tables = useMemo<Table[]>(() => extractCollection(tablesData), [tablesData])
  const paymentMethods = useMemo<PaymentMethodType[]>(() => extractCollection(paymentData), [paymentData])
  const clients = useMemo<Client[]>(() => extractCollection(clientsData), [clientsData])
  
  // Normalizar tipos de atendimento
  const serviceTypes = useMemo(() => {
    if (!serviceTypesData) return []
    
    let normalized: any[] = []
    
    if (Array.isArray(serviceTypesData)) {
      normalized = serviceTypesData
    } else if (serviceTypesData && typeof serviceTypesData === 'object' && 'data' in serviceTypesData) {
      const dataArray = (serviceTypesData as any).data
      if (Array.isArray(dataArray)) {
        normalized = dataArray
      }
    }
    
    return normalized
      .filter((st: any) => st.is_active !== false)
      .sort((a: any, b: any) => (a.order_position || 0) - (b.order_position || 0))
  }, [serviceTypesData])
  
  // Obter tipo de atendimento selecionado
  const currentServiceType = useMemo(() => {
    if (!serviceTypes || serviceTypes.length === 0) return null

    // Se já existe um tipo selecionado, priorizar esse
    if (selectedServiceType) {
      const match = serviceTypes.find(
        (st: any) =>
          (st.identify || st.slug || "").toLowerCase() ===
          selectedServiceType.toLowerCase()
      )
      if (match) return match
    }

    // Determinar tipo baseado no estado atual e na configuração dos tipos
    if (isDelivery) {
      return (
        serviceTypes.find(
          (st: any) =>
            (st.slug || st.identify || "").toLowerCase() === "delivery" ||
            st.requires_address
        ) || null
      )
    }

    if (selectedTable) {
      return (
        serviceTypes.find(
          (st: any) =>
            st.requires_table ||
            ["table", "mesa"].includes(
              (st.slug || st.identify || "").toLowerCase()
            )
        ) || null
      )
    }

    // Fallback: atendimento de balcão
    return (
      serviceTypes.find(
        (st: any) =>
          !st.requires_address &&
          !st.requires_table &&
          ["counter", "balcao"].includes(
            (st.slug || st.identify || "").toLowerCase()
          )
      ) ||
      serviceTypes[0] ||
      null
    )
  }, [selectedServiceType, isDelivery, selectedTable, serviceTypes])
  
  // Determinar se precisa de endereço baseado no tipo de atendimento
  const requiresAddress = useMemo(() => {
    return currentServiceType?.requires_address || false
  }, [currentServiceType])
  
  // Determinar se precisa de mesa baseado no tipo de atendimento
  const requiresTable = useMemo(() => {
    return currentServiceType?.requires_table || false
  }, [currentServiceType])
  const todayOrders = useMemo<Order[]>(() => {
    const extracted = extractCollection<Order>(todayOrdersData)
    // Debug: verificar se os dados estão sendo extraídos corretamente
    if (process.env.NODE_ENV === 'development') {

    }
    return extracted
  }, [todayOrdersData])

  // Extrair pedidos da mesa
  const tableOrders = useMemo<TableOrder[]>(() => {
    return extractCollection(tableOrdersData)
  }, [tableOrdersData])

  // Pedidos para exibir na sidebar: se houver mesa selecionada e pedidos dessa mesa, usar esses; senão, usar pedidos de hoje
  const sidebarOrders = useMemo<Order[]>(() => {
    // Se houver mesa selecionada e pedidos em aberto dessa mesa, usar esses pedidos
    if (selectedTable && !isDelivery && tableOrders && Array.isArray(tableOrders) && tableOrders.length > 0) {
      return tableOrders
    }
    // Caso contrário, usar pedidos de hoje
    return todayOrders
  }, [selectedTable, isDelivery, tableOrders, todayOrders])
  
  // Contexto para comunicar com o SiteHeader
  const { setTodayOrdersClick, setTodayOrdersCount } = usePOSHeader()
  
  // Registrar callback e contador no header quando mudar
  useEffect(() => {
    setTodayOrdersClick(() => () => setShowTodayOrdersSheet(true))
    setTodayOrdersCount(todayOrders.length)
  }, [todayOrders.length, setTodayOrdersClick, setTodayOrdersCount])
  
  // Identificar mesas com pedidos em aberto
  const tablesWithOpenOrders = useMemo(() => {
    const occupiedTables = new Set<string>()
    todayOrders.forEach((order: Order) => {
      // Verificar se o pedido está em aberto (não entregue, não concluído, não cancelado)
      const status = order.status || ''
      if (!['Entregue', 'Concluído', 'Cancelado', 'Arquivado'].includes(status)) {
        if (order.table?.uuid || order.table?.identify || order.table?.name) {
          const tableKey = order.table.uuid || order.table.identify || order.table.name
          occupiedTables.add(tableKey)
        }
      }
    })
    return occupiedTables
  }, [todayOrders])
  
  // Verificar se a mesa selecionada está ocupada por outro pedido (não o que está sendo editado ou iniciado)
  const isTableOccupiedByOtherOrder = useMemo(() => {
    if (!selectedTable || !tablesWithOpenOrders.has(selectedTable)) {
      return false
    }
    
    // Obter o pedido atual (pode ser editingOrder ou currentOrder)
    const currentOrderData = editingOrder || currentOrder
    
    // Se não houver pedido atual, verificar se há pedidos abertos na mesa
    if (!currentOrderData) {
      // Verificar se há pedidos abertos na mesa que não sejam do pedido atual
      const hasOtherOrders = todayOrders.some((order: Order) => {
        const orderTableKey = order.table?.uuid || order.table?.identify || order.table?.name
        const status = order.status || ''
        const isOpen = !['Entregue', 'Concluído', 'Cancelado', 'Arquivado'].includes(status)
        return isOpen && orderTableKey === selectedTable
      })
      return hasOtherOrders
    }
    
    // Se houver pedido atual, verificar se ele pertence a esta mesa
    const currentOrderTableKey = currentOrderData.table?.uuid || currentOrderData.table?.identify || currentOrderData.table?.name
    const selectedTableKey = selectedTable
    
    // Se o pedido atual pertence a esta mesa, não está ocupada por outro pedido
    if (currentOrderTableKey === selectedTableKey) {
      return false
    }
    
    // Se o pedido atual não pertence a esta mesa, verificar se há outros pedidos abertos na mesa
    const hasOtherOrders = todayOrders.some((order: Order) => {
      const orderTableKey = order.table?.uuid || order.table?.identify || order.table?.name
      const orderId = order.identify || order.uuid || order.id
      const currentOrderId = currentOrderData.identify || currentOrderData.uuid || currentOrderData.id
      const status = order.status || ''
      const isOpen = !['Entregue', 'Concluído', 'Cancelado', 'Arquivado'].includes(status)
      
      // Verificar se é outro pedido (diferente do atual) na mesma mesa
      return isOpen && orderTableKey === selectedTableKey && orderId !== currentOrderId
    })
    
    return hasOtherOrders
  }, [selectedTable, tablesWithOpenOrders, editingOrder, currentOrder, todayOrders])

  const selectionTotal = useMemo(() => {
    if (!selectionProduct) return 0
    let total = getProductPrice(selectionProduct)

    if (selectionProduct.variations?.length) {
      const variation = selectionProduct.variations.find(
        (variation) =>
          (variation.id || variation.identify || variation.name) === selectionVariationId
      )
      if (variation) {
        total = parsePrice(variation.price ?? null) || total
      }
    }

    if (selectionProduct.optionals?.length) {
      selectionProduct.optionals.forEach((optional, index) => {
        const optionalKey =
          optional.id || optional.identify || optional.name || `optional-${index}`
        const quantity = selectionOptionals[optionalKey] || 0
        if (quantity > 0) {
          total += parsePrice(optional.price) * quantity
        }
      })
    }

    return total
  }, [selectionProduct, selectionVariationId, selectionOptionals])

  // ============================================
  // USEEFFECT HOOKS
  // ============================================
  
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      const first = categories[0]
      setSelectedCategory(first.uuid || first.identify || first.name)
    }
  }, [categories, selectedCategory])

  useEffect(() => {
    if (requiresTable && !selectedTable && tables.length > 0) {
      const first = tables[0]
      setSelectedTable(first.uuid || first.identify || first.name)
    }
  }, [tables, selectedTable, requiresTable])

  useEffect(() => {
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].uuid)
    }
  }, [paymentMethods, selectedPaymentMethod])

  // Cleanup de timers quando componente desmontar
  useEffect(() => {
    return () => {
      if (addingItemTimerRef.current) {
        clearTimeout(addingItemTimerRef.current)
      }
      if (removingItemTimerRef.current) {
        clearTimeout(removingItemTimerRef.current)
      }
    }
  }, [])


  // Recarregar pedidos quando o sheet de edição for fechado
  useEffect(() => {
    if (!editOrderSheetOpen) {
      refetchTodayOrders()
    }
  }, [editOrderSheetOpen, refetchTodayOrders])

  useEffect(() => {
    if (!isDelivery) {
      // Quando retirar no local, seleciona a primeira mesa se não houver seleção
      if (!selectedTable && tables.length > 0) {
        const firstTable = tables[0]
        setSelectedTable(firstTable.uuid || firstTable.identify || firstTable.name)
      }
    } else {
      // Quando delivery, limpa a seleção de mesa
      setSelectedTable(null)
    }
  }, [isDelivery, tables, selectedTable])

const handleClientChange = (value: string) => {
    setSelectedClientId(value)

    if (!value) {
      setCustomerName("")
      setCustomerPhone("")
      setFiscalCpfCnpj("") // Limpar CPF quando cliente é removido
      return
    }

    const client = clients.find(
      (item) => (item.uuid || item.identify || item.name) === value
    )

    if (client) {
      setCustomerName(client.name || "")
      setCustomerPhone(client.phone || "")
      // Preencher CPF/CNPJ do cliente no documento fiscal apenas se existir
      if (client.cpf) {
        setFiscalCpfCnpj(client.cpf)
      } else {
        setFiscalCpfCnpj("") // Limpar CPF se o cliente não tiver CPF
      }
    } else {
      // Se o cliente não for encontrado, limpar CPF
      setFiscalCpfCnpj("")
    }
  }

  const clientOptions = useMemo<ComboboxOption[]>(() => {
    return clients.map((client) => ({
      value: client.uuid || client.identify || client.name,
      label: client.phone ? `${client.name} - ${client.phone}` : client.name,
    }))
  }, [clients])

  const groupedProducts = useMemo(() => {
    const map: Record<string, Product[]> = {}
    products.forEach((product) => {
      const productCategories = product.categories && product.categories.length > 0
        ? product.categories
        : [{ uuid: "sem-categoria", name: "Sem categoria" }]

      productCategories.forEach((cat) => {
        // Usar a mesma lógica de chave que é usada nas categorias principais
        // Prioridade: uuid > identify > name
        const key = cat.uuid || cat.identify || cat.name
        
        // Garantir que a chave existe no mapa
        if (!map[key]) {
          map[key] = []
        }
        map[key].push(product)
      })
    })
    
    // Debug em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      console.log('[PDV Debug] groupedProducts keys:', Object.keys(map))
      console.log('[PDV Debug] groupedProducts counts:', Object.entries(map).map(([key, prods]) => ({ key, count: prods.length })))
    }
    
    return map
  }, [products])

  const visibleProducts = useMemo(() => {
    let filteredProducts = products

    // Filtrar por categoria
    if (selectedCategory) {
      let categoryProducts = groupedProducts[selectedCategory] || []
      
      // Se não encontrou produtos pela chave exata, tentar buscar por correspondência
      if (categoryProducts.length === 0) {
        const selectedCategoryObj = categories.find(cat => {
          const key = cat.uuid || cat.identify || cat.name
          return key === selectedCategory
        })
        
        if (selectedCategoryObj) {
          const possibleKeys: string[] = [
            selectedCategoryObj.uuid,
            selectedCategoryObj.identify,
            selectedCategoryObj.name
          ].filter((key): key is string => !!key)
          
          for (const key of possibleKeys) {
            if (groupedProducts[key] && groupedProducts[key].length > 0) {
              categoryProducts = groupedProducts[key]
              break
            }
          }
        }
      }
      
      filteredProducts = categoryProducts
    }

    // Filtrar por busca de texto
    if (productSearchQuery && productSearchQuery.trim().length > 0) {
      const query = productSearchQuery.toLowerCase().trim()
      filteredProducts = filteredProducts.filter((product) => {
        const name = product.name?.toLowerCase() || ""
        const identify = product.identify?.toLowerCase() || ""
        const uuid = product.uuid?.toLowerCase() || ""
        const description = product.description?.toLowerCase() || ""

        return (
          name.includes(query) ||
          identify.includes(query) ||
          uuid.includes(query) ||
          description.includes(query)
        )
      })
    }
    
    // Ordenar produtos por relevância:
    // 1. Produtos com promoção primeiro
    // 2. Depois produtos sem promoção
    // 3. Ordenar alfabeticamente dentro de cada grupo
    return filteredProducts.sort((a, b) => {
      const aHasPromo = !!a.promotional_price && parsePrice(a.promotional_price) < parsePrice(a.price)
      const bHasPromo = !!b.promotional_price && parsePrice(b.promotional_price) < parsePrice(b.price)
      
      // Promoções primeiro
      if (aHasPromo !== bHasPromo) {
        return bHasPromo ? 1 : -1
      }
      
      // Depois alfabético
      return a.name.localeCompare(b.name)
    })
  }, [groupedProducts, selectedCategory, products, productSearchQuery, categories])

  // Calcular totais - usando cálculo local que considera promotional_price
  const orderTotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0),
    [cart]
  )
  
  // Cálculos adicionais usando serviço (para referência, mas usando orderTotal local)
  const orderCalculations = useMemo(() => {
    // Converter cart para formato do serviço (sem usar diretamente devido a incompatibilidade de tipos)
    return {
      subtotal: orderTotal,
      taxes: 0,
      discounts: 0,
      total: orderTotal,
    }
  }, [orderTotal])

  // Detectar quando método de pagamento muda para Dinheiro e abrir modal se necessário
  // Deve estar depois da declaração de orderTotal
  useEffect(() => {
    if (!selectedPaymentMethod || cart.length === 0 || orderTotal === 0) return
    
    const selectedMethod = paymentMethods.find(m => m.uuid === selectedPaymentMethod)
    if (!selectedMethod) return
    
    const isCash = selectedMethod.name.toLowerCase().includes('dinheiro') || 
                   selectedMethod.name.toLowerCase().includes('money') || 
                   selectedMethod.name.toLowerCase().includes('cash')
    
    // Se for dinheiro e ainda não tiver respondido ao modal, abrir modal
    if (isCash && !showChangeDialog && !changeDialogAnswered) {
      // Pequeno delay para evitar abertura imediata ao selecionar
      const timer = setTimeout(() => {
        setShowChangeDialog(true)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [selectedPaymentMethod, cart.length, orderTotal, paymentMethods, showChangeDialog, changeDialogAnswered])

  const selectedTableName = useMemo(() => {
    if (!selectedTable) return null
    const table = tables.find(
      (t) => (t.uuid || t.identify || t.name) === selectedTable
    )
    return table?.name || null
  }, [selectedTable, tables])

  // Alertas contextuais (deve ser chamado antes de qualquer early return)
  const contextualAlerts = useMemo(() => {
    const alerts: Array<{ type: 'warning' | 'error' | 'info'; message: string; action?: { label: string; onClick: () => void } }> = []
    
    // Alerta: Mesa ocupada
    if (selectedTable && !isDelivery) {
      const tableOrders = tableOrdersData || []
      if (Array.isArray(tableOrders) && tableOrders.length > 0) {
        alerts.push({
          type: 'warning',
          message: `Mesa tem ${tableOrders.length} pedido(s) em aberto`,
          action: {
            label: 'Ver pedidos',
            onClick: () => {
              // Abrir o Sheet de Pedidos de Hoje para exibir os pedidos da mesa
              setShowTodayOrdersSheet(true)
            },
          },
        })
      }
    }
    
    // Alerta: Carrinho vazio ao tentar finalizar
    if (cart.length === 0 && submittingOrder) {
      alerts.push({
        type: 'error',
        message: 'Adicione itens ao pedido antes de finalizar',
      })
    }
    
    // Alerta: Mesa não selecionada quando requerida
    if (requiresTable && !selectedTable && cart.length > 0) {
      alerts.push({
        type: 'warning',
        message: 'Selecione uma mesa para continuar',
      })
    }
    
    // Alerta: Método de pagamento não selecionado
    if (cart.length > 0 && !selectedPaymentMethod) {
      alerts.push({
        type: 'info',
        message: 'Selecione uma forma de pagamento',
      })
    }
    
    return alerts
  }, [selectedTable, isDelivery, tableOrdersData, cart.length, submittingOrder, selectedPaymentMethod])

  const addItemToCart = (
    product: Product,
    options?: {
      variation?: ProductVariation
      optionals?: Array<ProductOptional & { quantity: number }>
    }
  ) => {
    const productId = getProductId(product)
    const variationId =
      options?.variation?.id || options?.variation?.identify || options?.variation?.name || null
    const optionalsSignature = options?.optionals?.map((optional, index) => ({
      id: optional.id || optional.identify || optional.name || `opt-${index}`,
      name: optional.name,
      quantity: optional.quantity,
    }))
    const signature = getCartItemSignature(productId, variationId, optionalsSignature)

    setCart((prev) => {
      const exists = prev.find((item) => item.signature === signature)
      if (exists) {
        return prev.map((item) =>
          item.signature === signature ? { ...item, quantity: item.quantity + 1 } : item
        )
      }

      return [
        ...prev,
        {
          signature,
          product,
          quantity: 1,
          observation: "",
          selectedVariation: options?.variation,
          selectedOptionals:
            options?.optionals?.filter((optional) => optional.quantity > 0) ?? [],
        },
      ]
    })
    toast.success(`${product.name} adicionado ao pedido`)
  }

  const resetSelectionState = () => {
    setSelectionProduct(null)
    setSelectionVariationId("")
    setSelectionOptionals({})
  }

  const startProductSelection = (product: Product) => {
    const hasVariations = (product.variations?.length ?? 0) > 0
    const hasOptionals = (product.optionals?.length ?? 0) > 0

    if (!hasVariations && !hasOptionals) {
      addItemToCart(product)
      return
    }

    setSelectionProduct(product)
    if (hasVariations) {
      // Usar o mesmo método de cálculo do variationKey usado no RadioGroup
      const firstVariation = product.variations?.[0]
      const variationId = firstVariation
        ? firstVariation.id || firstVariation.identify || firstVariation.name || `variation-0`
        : ""
      setSelectionVariationId(variationId)
    } else {
      setSelectionVariationId("")
    }
    setSelectionOptionals({})
    setSelectionDialogOpen(true)
  }

  const handleSelectionOptionalChange = (optionalId: string, delta: number) => {
    setSelectionOptionals((prev) => {
      const current = prev[optionalId] || 0
      const next = Math.max(0, current + delta)
      const updated = { ...prev }
      if (next === 0) {
        delete updated[optionalId]
      } else {
        updated[optionalId] = next
      }
      return updated
    })
  }

  const handleConfirmSelection = () => {
    if (!selectionProduct) {
      return
    }

    let variationData: ProductVariation | undefined
    if (selectionProduct.variations?.length) {
      // Usar o mesmo método de cálculo do variationKey usado no RadioGroup
      variationData = selectionProduct.variations.find((variation, index) => {
        const variationKey =
          variation.id ||
          variation.identify ||
          variation.name ||
          `variation-${index}`
        return variationKey === selectionVariationId
      })
      if (!variationData) {
        toast.error("Selecione uma variação para continuar.")
        return
      }
    }

    const optionalsSelected =
      selectionProduct.optionals
        ?.map((optional, index) => {
          const optionalKey =
            optional.id || optional.identify || optional.name || `optional-${index}`
          const quantity = selectionOptionals[optionalKey] || 0
          if (!quantity) return null
          return {
            ...optional,
            quantity,
          }
        })
        .filter(Boolean) || []

    addItemToCart(selectionProduct, {
      variation: variationData,
      optionals: optionalsSelected as Array<ProductOptional & { quantity: number }>,
    })

    setSelectionDialogOpen(false)
    resetSelectionState()
  }

  const updateItemQuantity = (signature: string, delta: number) => {
    // Limpar timer anterior se existir
    if (addingItemTimerRef.current) {
      clearTimeout(addingItemTimerRef.current)
    }
    
    // Feedback visual
    setAddingItem(signature)
    addingItemTimerRef.current = setTimeout(() => {
      setAddingItem(null)
      addingItemTimerRef.current = null
    }, 300)
    
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.signature !== signature) return item
          const newQty = item.quantity + delta
          return { ...item, quantity: newQty }
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const updateItemObservation = (signature: string, value: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.signature === signature ? { ...item, observation: value } : item
      )
    )
  }

  const removeItem = (signature: string) => {
    // Limpar timer anterior se existir
    if (removingItemTimerRef.current) {
      clearTimeout(removingItemTimerRef.current)
    }
    
    // Feedback visual
    setRemovingItem(signature)
    removingItemTimerRef.current = setTimeout(() => {
      setCart((prev) => prev.filter((item) => item.signature !== signature))
      setRemovingItem(null)
      toast.info("Item removido do pedido")
      removingItemTimerRef.current = null
    }, 300)
  }

  const clearCart = () => {
    setCart([])
    setOrderNotes("")
    // Limpar dados de troco
    setNeedsChange(false)
    setReceivedAmount(null)
    setChangeDialogAnswered(false) // Resetar flag ao limpar carrinho
  }

  // Função para iniciar um novo pedido
  const handleNewOrder = () => {
    clearCart()
    setEditingOrder(null)
    setOrderStarted(false)
    setCurrentOrder(null)
    setCustomerName("")
    setCustomerPhone("")
    setDeliveryAddress({
      zip: "",
      address: "",
      number: "",
      neighborhood: "",
      city: "",
      state: "",
      complement: "",
    })
    setSelectedClientId("")
    setSelectedPaymentMethod(null)
    setSelectedTable(null)
    setIsDelivery(false)
    setOrderNotes("")
    setEditOrderSheetOpen(false)
    setSelectionDialogOpen(false)
    setSelectionProduct(null)
    setSelectionVariationId("")
    setSelectionOptionals({})
    toast.success("Novo pedido iniciado")
  }


  // Carregar pedido no PDV para edição direta
  const loadOrderInPDV = async (orderIdentify: string) => {
    try {
      const response = await apiClient.get(endpoints.orders.show(orderIdentify))
      if (response.success && response.data) {
        const order = response.data as Order
        
        // Limpar carrinho atual
        setCart([])
        setOrderNotes("")
        
        // Converter produtos do pedido para o formato do carrinho do PDV
        const orderProducts = order?.products || []
        const cartItems: CartItem[] = Array.isArray(orderProducts) ? orderProducts.map((product: any) => {
          const productId = product.uuid || product.identify || product.id
          const qty = product.pivot?.qty || product.quantity || 1
          const price = parsePrice(product.pivot?.price || product.price)
          
          // Extrair variação se houver
          let selectedVariation = null
          if (product.pivot?.variation_id || product.variation) {
            const variationData = product.variation || product.pivot?.variation
            if (variationData) {
              selectedVariation = {
                id: variationData.id || variationData.identify || variationData.name,
                identify: variationData.identify || variationData.id || variationData.name,
                name: variationData.name,
                price: variationData.price || 0,
              }
            }
          }
          
          // Extrair opcionais se houver
          const selectedOptionals: any[] = []
          if (product.pivot?.optionals && Array.isArray(product.pivot.optionals)) {
            product.pivot.optionals.forEach((optional: any) => {
              for (let i = 0; i < (optional.quantity || 1); i++) {
                selectedOptionals.push({
                  id: optional.id || optional.identify || optional.name,
                  identify: optional.identify || optional.id || optional.name,
                  name: optional.name,
                  price: optional.price || 0,
                  quantity: 1,
                })
              }
            })
          }
          
          // Criar assinatura única
          const signature = getCartItemSignature(
            productId, 
            selectedVariation?.id || null, 
            selectedOptionals.map(o => o.id)
          )
          
          return {
            signature,
            product: {
              uuid: product.uuid || product.identify,
              identify: product.identify || product.uuid,
              name: product.name,
              price: price,
              promotional_price: product.promotional_price,
              image: product.image,
              image_url: product.image_url,
              description: product.description,
              variations: product.variations,
              optionals: product.optionals,
            },
            quantity: qty,
            observation: product.pivot?.observation || "",
            selectedVariation: selectedVariation,
            selectedOptionals: selectedOptionals,
          }
        }) : []
        
        // Preencher dados do pedido no PDV
        setCart(cartItems)
        setOrderNotes(order?.comment || "")
        
        // Configurar mesa se houver
        if (order.table) {
          const tableKey = order.table.uuid || order.table.identify || order.table.name
          setSelectedTable(tableKey)
          setIsDelivery(false)
        } else if (order.is_delivery) {
          setIsDelivery(true)
          setSelectedTable(null)
          
          // Preencher dados de entrega se houver
          if (order.delivery_address) {
            setDeliveryAddress({
              zip: order.delivery_zip_code || "",
              address: order.delivery_address || "",
              number: order.delivery_number || "",
              neighborhood: order.delivery_neighborhood || "",
              city: order.delivery_city || "",
              state: order.delivery_state || "",
              complement: order.delivery_complement || "",
            })
          }
        }
        
        // Configurar cliente se houver
        if (order.client) {
          const clientId = order.client.uuid || order.client.identify || order.client.id
          setSelectedClientId(String(clientId || ""))
          setCustomerName(order.client.name || "")
          setCustomerPhone(order.client.phone || "")
        }
        
        // Configurar método de pagamento se houver
        if (order.payment_method_id || order.paymentMethod?.uuid) {
          const paymentId = order.payment_method_id || order.paymentMethod?.uuid
          setSelectedPaymentMethod(paymentId ? String(paymentId) : null)
        }
        
        // Armazenar pedido para edição
        setEditingOrder(order)
        
        
        toast.success("Pedido carregado no PDV para edição")
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao carregar pedido no PDV")
    }
  }

  // Carregar pedido para edição no Sheet
  const loadOrderForEdit = async (orderIdentify: string) => {
    try {
      const response = await apiClient.get(endpoints.orders.show(orderIdentify))
      if (response.success && response.data) {
        const order = response.data as Order
        setEditingOrder(order)
        
        // Converter produtos do pedido para o formato do carrinho
        const orderProducts = order?.products || []
        const cartItems: CartItem[] = Array.isArray(orderProducts) ? orderProducts.map((product: any) => {
          const productId = product.uuid || product.identify || product.id
          const qty = product.pivot?.qty || product.quantity || 1
          const price = parsePrice(product.pivot?.price || product.price)
          
          // Criar assinatura única
          const signature = getCartItemSignature(productId, null, [])
          
          return {
            signature,
            product: {
              uuid: product.uuid || product.identify,
              identify: product.identify || product.uuid,
              name: product.name,
              price: price,
              promotional_price: product.promotional_price,
              image: product.image,
              image_url: product.image_url,
              description: product.description,
            },
            quantity: qty,
            observation: "",
            selectedVariation: null,
            selectedOptionals: [],
          }
        }) : []
        
        setEditOrderCart(cartItems)
        setEditOrderNotes(order?.comment || "")
        setEditOrderSheetOpen(true)
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao carregar pedido")
    }
  }

  // Salvar alterações do pedido
  const handleSaveOrderEdit = async () => {
    if (!editingOrder) return

    // Se estiver editando no PDV (cart tem itens), usar cart. Senão, usar editOrderCart (Sheet)
    const itemsToSave = cart.length > 0 ? cart : editOrderCart
    const notesToSave = cart.length > 0 ? orderNotes : editOrderNotes

    if (!itemsToSave.length) {
      toast.error("O pedido deve ter pelo menos um item.")
      return
    }

    try {
      const orderIdentify = editingOrder.identify || editingOrder.uuid
      const payload: Record<string, any> = {
        comment: notesToSave,
        products: itemsToSave.map((item) => ({
          identify: item.product.uuid || item.product.identify,
          qty: item.quantity,
          price: getCartItemUnitPrice(item),
        })),
      }

      const result = await mutateOrder(endpoints.orders.update(String(orderIdentify)), "PUT", payload)
      if (result) {
        toast.success("Pedido atualizado com sucesso!")
        
        // Se estava editando no Sheet, fechar
        if (editOrderSheetOpen) {
          setEditOrderSheetOpen(false)
          setEditOrderCart([])
          setEditOrderNotes("")
        }
        
        // Se estava editando no PDV, limpar
        if (cart.length > 0) {
          clearCart()
          setEditingOrder(null)
          setCustomerName("")
          setCustomerPhone("")
          setDeliveryAddress({
            zip: "",
            address: "",
            number: "",
            neighborhood: "",
            city: "",
            state: "",
            complement: "",
          })
          setSelectedClientId("")
          setSelectedPaymentMethod(null)
          setSelectedTable(null)
          setIsDelivery(false)
        }
        
        setEditingOrder(null)
        
        // Recarregar pedidos da mesa se houver uma mesa selecionada
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        
        // Recarregar lista de pedidos do dia
        refetchTodayOrders()
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar pedido")
    }
  }

  const handleZipChange = async (value: string) => {
    const masked = maskZipCode(value)
    setDeliveryAddress((prev) => ({ ...prev, zip: masked }))

    // Buscar endereço automaticamente quando CEP estiver completo (8 dígitos)
    const cleanCEP = masked.replace(/\D/g, "")
    if (cleanCEP.length === 8) {
      try {
        const address = await searchCEP(masked)
        if (address) {
          setDeliveryAddress((prev) => ({
            ...prev,
            address: address.address || address.logradouro || prev.address,
            neighborhood: address.neighborhood || address.bairro || prev.neighborhood,
            city: address.city || address.localidade || prev.city,
            state: address.state || address.uf || prev.state,
          }))
        }
      } catch (error) {
        // Erro já é tratado pelo useViaCEP com toast
        if (process.env.NODE_ENV === "development") {

        }
      }
    }
  }

  const handleUpdateOrder = async () => {
    // Pode atualizar se estiver editando um pedido existente OU se tiver um pedido iniciado
    const orderToUpdate = editingOrder || currentOrder
    if (!orderToUpdate) {
      toast.error("Apenas pedidos existentes podem ser atualizados.")
      return
    }

    // Usar validação do serviço order-validator
    const orderStatus = orderToUpdate.status || orderToUpdate.order_status?.name
    const validationErrors = validateOrderBeforeUpdate({
      cart: cart as any, // Type assertion devido a incompatibilidade de tipos (optionals)
      orderStatus,
      selectedTable,
      isDelivery,
      selectedPaymentMethod,
      useSplitPayment,
      splitPaymentItems,
      orderTotal: orderTotal,
    })

    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => {
        toast.error(error.message)
      })
      return
    }

    try {
      const orderIdentify = orderToUpdate.identify || orderToUpdate.uuid || orderToUpdate.id
      if (!orderIdentify) {
        toast.error("Não foi possível identificar o pedido.")
        return
      }

      // Preparar comentário com observações
      const commentParts = []
      if (orderNotes) commentParts.push(orderNotes)
      if (customerName || customerPhone) {
        commentParts.push(`Cliente: ${customerName || "N/A"} ${customerPhone || ""}`.trim())
      }
      cart.forEach((item) => {
        if (item.observation) {
          commentParts.push(`${item.product.name}: ${item.observation}`)
        }
      })

      const payload: Record<string, any> = {
        // NÃO incluir status - mantém o status atual
        comment: commentParts.join(" | ") || null,
        products: cart.map((item) => ({
          identify: item.product.uuid || item.product.identify,
          qty: item.quantity,
          price: getCartItemUnitPrice(item),
          variation: item.selectedVariation
            ? {
                id: item.selectedVariation.id || item.selectedVariation.identify || item.selectedVariation.name,
                name: item.selectedVariation.name,
                price: parsePrice(item.selectedVariation.price),
              }
            : null,
          optionals:
            item.selectedOptionals?.map((optional) => ({
              id: optional.id || optional.identify || optional.name,
              name: optional.name,
              price: parsePrice(optional.price),
              quantity: optional.quantity,
            })) ?? [],
        })),
        is_delivery: isDelivery,
        delivery_address: isDelivery ? deliveryAddress.address : null,
        delivery_city: isDelivery ? deliveryAddress.city : null,
        delivery_state: isDelivery ? deliveryAddress.state : null,
        delivery_zip_code: isDelivery ? deliveryAddress.zip : null,
        delivery_neighborhood: isDelivery ? deliveryAddress.neighborhood : null,
        delivery_number: isDelivery ? deliveryAddress.number : null,
        delivery_complement: isDelivery ? deliveryAddress.complement : null,
        delivery_notes: isDelivery ? orderNotes : null,
      }

      // Incluir payment_method_id se estiver selecionado (para pagamento único)
      if (!useSplitPayment && selectedPaymentMethod) {
        payload.payment_method_id = selectedPaymentMethod
      }
      
      // Adicionar dados de troco se necessário (apenas para pagamento único em dinheiro)
      if (!useSplitPayment) {
        payload.precisa_troco = needsChange
        if (needsChange && receivedAmount) {
          payload.valor_recebido = receivedAmount
        } else {
          payload.valor_recebido = null
        }
      } else if (useSplitPayment && splitPaymentItems.length > 0) {
        // Suporte a split payment - enviar array de pagamentos
        payload.split_payments = splitPaymentItems
          .filter(item => item.amount !== null && item.amount > 0)
          .map(item => ({
            payment_method_id: item.method.uuid,
            amount: item.amount,
            // Verificar se é dinheiro e calcular troco se necessário
            needs_change: item.method.name.toLowerCase().includes('dinheiro') || 
                         item.method.name.toLowerCase().includes('money') || 
                         item.method.name.toLowerCase().includes('cash'),
          }))
      }

      const result = await mutateOrder(endpoints.orders.update(String(orderIdentify)), "PUT", payload)
      if (result) {
        toast.success("Pedido atualizado com sucesso!")
        
        // Atualizar o pedido atual com os dados retornados
        if (editingOrder) {
          setEditingOrder(result as Order)
        } else if (currentOrder) {
          setCurrentOrder(result as Order)
        }
        
        // Recarregar pedidos para refletir as mudanças
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        refetchTodayOrders()
        
        // NÃO limpar o estado - permite continuar editando
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar pedido")
    }
  }

  // Buscar status por position
  const getStatusByPosition = async (position: number): Promise<string | null> => {
    try {
      const response = await apiClient.get(endpoints.orderStatuses.list(true))
      if (response.success && response.data && Array.isArray(response.data)) {
        const status = response.data.find((s: any) => s.order_position === position)
        return status ? status.name : null
      }
      return null
    } catch (error) {

      return null
    }
  }

  // Buscar primeiro status (is_initial = true ou order_position = 1)
  const getInitialStatus = async (): Promise<string | null> => {
    try {
      const response = await apiClient.get(endpoints.orderStatuses.list(true))
      if (response.success && response.data && Array.isArray(response.data)) {
        // Primeiro tentar buscar por is_initial
        let status = response.data.find((s: any) => s.is_initial === true)
        // Se não encontrar, buscar por order_position = 1
        if (!status) {
          status = response.data.find((s: any) => s.order_position === 1)
        }
        return status ? status.name : null
      }
      return null
    } catch (error) {

      return null
    }
  }

  // Iniciar pedido - cria pedido com primeiro status
  const handleStartOrder = async () => {
    if (!cart.length) {
      toast.error("Adicione pelo menos um item ao pedido.")
      return
    }

    if (!selectedPaymentMethod) {
      toast.error("Selecione uma forma de pagamento.")
      return
    }

    if (requiresTable && !selectedTable) {
      toast.error("Selecione uma mesa para o pedido.")
      return
    }

    // Verificar se a mesa selecionada tem pedidos em aberto de outro pedido
    if (requiresTable && isTableOccupiedByOtherOrder) {
      toast.error("Esta mesa possui pedidos em aberto. Finalize os pedidos antes de adicionar novos.")
      return
    }

    const tenantToken = user?.tenant?.uuid || user?.tenant_id
    if (!tenantToken) {
      toast.error("Não foi possível identificar a empresa. Faça login novamente.")
      return
    }

    try {
      const commentParts = []
      if (orderNotes) commentParts.push(orderNotes)
      if (customerName || customerPhone) {
        commentParts.push(`Cliente: ${customerName || "N/A"} ${customerPhone || ""}`.trim())
      }
      cart.forEach((item) => {
        if (item.observation) {
          commentParts.push(`${item.product.name}: ${item.observation}`)
        }
      })

      const payload: Record<string, any> = {
        token_company: tenantToken,
        client_id: selectedClientId || null,
        table: !isDelivery ? selectedTable : null,
        comment: commentParts.join(" | ") || null,
        products: cart.map((item) => ({
          identify: item.product.uuid || item.product.identify,
          qty: item.quantity,
          price: getCartItemUnitPrice(item),
          variation: item.selectedVariation
            ? {
                id: item.selectedVariation.id || item.selectedVariation.identify || item.selectedVariation.name,
                name: item.selectedVariation.name,
                price: parsePrice(item.selectedVariation.price),
              }
            : null,
          optionals:
            item.selectedOptionals?.map((optional) => ({
              id: optional.id || optional.identify || optional.name,
              name: optional.name,
              price: parsePrice(optional.price),
              quantity: optional.quantity,
            })) ?? [],
        })),
        payment_method_id: !useSplitPayment ? selectedPaymentMethod : null,
        precisa_troco: !useSplitPayment ? needsChange : false,
        valor_recebido: !useSplitPayment && needsChange && receivedAmount ? receivedAmount : null,
        // Suporte a split payment ao iniciar pedido
        split_payments: useSplitPayment && splitPaymentItems.length > 0
          ? splitPaymentItems
              .filter(item => item.amount !== null && item.amount > 0)
              .map(item => ({
                payment_method_id: item.method.uuid,
                amount: item.amount,
                needs_change: item.method.name.toLowerCase().includes('dinheiro') || 
                             item.method.name.toLowerCase().includes('money') || 
                             item.method.name.toLowerCase().includes('cash'),
              }))
          : undefined,
        is_delivery: isDelivery,
        use_client_address: false,
        delivery_address: isDelivery ? deliveryAddress.address : null,
        delivery_city: isDelivery ? deliveryAddress.city : null,
        delivery_state: isDelivery ? deliveryAddress.state : null,
        delivery_zip_code: isDelivery ? deliveryAddress.zip : null,
        delivery_neighborhood: isDelivery ? deliveryAddress.neighborhood : null,
        delivery_number: isDelivery ? deliveryAddress.number : null,
        delivery_complement: isDelivery ? deliveryAddress.complement : null,
        delivery_notes: isDelivery ? orderNotes : null,
        // O backend já define o status inicial automaticamente
      }

      const result: any = await mutateOrder(endpoints.orders.create, "POST", payload)
      if (result) {
        setCurrentOrder(result)
        setOrderStarted(true)
        toast.success("Pedido iniciado com sucesso!")
        
        // Recarregar pedidos da mesa se houver uma mesa selecionada
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        
        // Recarregar lista de pedidos do dia
        refetchTodayOrders()
      }
    } catch (error: any) {
      // Exibir erros de validação do backend
      const validationErrors = extractValidationErrors(error)
      
      if (Object.keys(validationErrors).length > 0) {
        // Usar showErrorToast para exibir erros formatados
        showErrorToast(error, "Erro ao iniciar pedido")
      } else {
        // Fallback para erro genérico
        toast.error(error?.message || "Erro ao iniciar pedido")
      }
    }
  }

  // Avançar status do pedido para o próximo do fluxo
  const handleAdvanceStatus = async () => {
    const orderToUpdate = editingOrder || currentOrder
    if (!orderToUpdate) {
      toast.error("Nenhum pedido encontrado para avançar status.")
      return
    }

    const orderIdentify = orderToUpdate.identify || orderToUpdate.uuid || orderToUpdate.id
    if (!orderIdentify) {
      toast.error("Não foi possível identificar o pedido.")
      return
    }

    // Verificar se o pedido tem status final
    const orderStatus = orderToUpdate.status || orderToUpdate.order_status?.name
    if (isFinalStatus(orderStatus)) {
      toast.error(`Este pedido possui status final (${orderStatus}) e não pode ter status alterado.`)
      return
    }

    try {
      const result = await mutateOrder(endpoints.orders.advanceStatus(orderIdentify), "POST", {})
      if (result) {
        toast.success("Status do pedido atualizado com sucesso!")
        
        // Atualizar estado do pedido
        if (editingOrder) {
          setEditingOrder(result as Order)
        } else if (currentOrder) {
          setCurrentOrder(result as Order)
        }
        
        // Recarregar pedidos
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        refetchTodayOrders()
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao avançar status do pedido")
    }
  }

  // Preparar dados de pagamento para confirmação usando payment-processor
  const preparePaymentDataForConfirmation = (): PaymentConfirmationItem[] => {
    return preparePaymentData(
      useSplitPayment,
      selectedPaymentMethod,
      splitPaymentItems,
      paymentMethods,
      orderTotal,
      receivedAmount,
      needsChange
    )
  }

  // Finalizar pedido - atualiza para status "Entregue" (chamado após confirmação)
  const confirmFinalizeOrder = async () => {
    if (!currentOrder && !editingOrder) {
      toast.error("Nenhum pedido encontrado para finalizar.")
      return
    }

    const orderIdentify = (currentOrder || editingOrder)?.identify || (currentOrder || editingOrder)?.uuid || (currentOrder || editingOrder)?.id
    if (!orderIdentify) {
      toast.error("Não foi possível identificar o pedido.")
      return
    }

    // Verificar se o pedido tem status final
    const orderStatus = (currentOrder || editingOrder)?.status || (currentOrder || editingOrder)?.order_status?.name
    if (isFinalStatus(orderStatus)) {
      toast.error(`Este pedido possui status final (${orderStatus}) e não pode ser editado.`)
      return
    }

    // Verificar se está em status que permite finalizar
    const allowedStatuses = ['Pronto', 'Em Entrega']
    if (!allowedStatuses.includes(orderStatus || '')) {
      toast.error(`Pedido deve estar em "Pronto" ou "Em Entrega" para ser finalizado. Status atual: ${orderStatus}`)
      return
    }

    try {
      // Buscar status "Entregue" primeiro por nome
      let deliveredStatus = null
      try {
        const response = await apiClient.get(endpoints.orderStatuses.list(true))
        if (response.success && response.data && Array.isArray(response.data)) {
          deliveredStatus = response.data.find((s: any) => s.name === 'Entregue')
        }
      } catch (error) {

      }

      if (!deliveredStatus) {
        toast.error("Não foi possível encontrar o status 'Entregue'.")
        return
      }

      // Usar o nome do status diretamente
      const payload: Record<string, any> = {
        status: 'Entregue',
      }

      // Se houver alterações no carrinho, incluir produtos
      if (cart.length > 0) {
        const commentParts = []
        if (orderNotes) commentParts.push(orderNotes)
        if (customerName || customerPhone) {
          commentParts.push(`Cliente: ${customerName || "N/A"} ${customerPhone || ""}`.trim())
        }
        cart.forEach((item) => {
          if (item.observation) {
            commentParts.push(`${item.product.name}: ${item.observation}`)
          }
        })

        payload.comment = commentParts.join(" | ") || null
        payload.products = cart.map((item) => ({
          identify: item.product.uuid || item.product.identify,
          qty: item.quantity,
          price: getCartItemUnitPrice(item),
        }))
      }

      // Incluir payment_method_id se estiver selecionado (para pagamento único)
      if (!useSplitPayment && selectedPaymentMethod) {
        payload.payment_method_id = selectedPaymentMethod
      }
      
      // Adicionar dados de troco se necessário (apenas para pagamento único em dinheiro)
      if (!useSplitPayment) {
        payload.precisa_troco = needsChange
        if (needsChange && receivedAmount) {
          payload.valor_recebido = receivedAmount
        } else {
          payload.valor_recebido = null
        }
      } else if (useSplitPayment && splitPaymentItems.length > 0) {
        // Suporte a split payment - enviar array de pagamentos
        payload.split_payments = splitPaymentItems
          .filter(item => item.amount !== null && item.amount > 0)
          .map(item => ({
            payment_method_id: item.method.uuid,
            amount: item.amount,
            // Verificar se é dinheiro e calcular troco se necessário
            needs_change: item.method.name.toLowerCase().includes('dinheiro') || 
                         item.method.name.toLowerCase().includes('money') || 
                         item.method.name.toLowerCase().includes('cash'),
          }))
      }

      const result = await mutateOrder(endpoints.orders.update(String(orderIdentify)), "PUT", payload)
      if (result) {
        toast.success("Pedido finalizado com sucesso!")
        
        // Recarregar pedidos
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        refetchTodayOrders()
        
        // Limpar estado
        setOrderStarted(false)
        setCurrentOrder(null)
        setEditingOrder(null)
        clearCart()
        setCustomerName("")
        setCustomerPhone("")
        setSelectedClientId("")
        setSelectedPaymentMethod(null)
        setOrderNotes("")
        setUseSplitPayment(false)
        setSplitPaymentItems([])
        setNeedsChange(false)
        setReceivedAmount(null)
        setChangeDialogAnswered(false)
        setShowPaymentConfirmation(false)
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao finalizar pedido")
    }
  }

  // Abrir dialog de confirmação antes de finalizar
  const handleFinalizeOrder = () => {
    if (!currentOrder && !editingOrder) {
      toast.error("Nenhum pedido encontrado para finalizar.")
      return
    }

    // Verificar se há método de pagamento selecionado
    const payments = preparePaymentDataForConfirmation()
    if (payments.length === 0) {
      toast.error("Selecione uma forma de pagamento antes de finalizar.")
      return
    }

    // Verificar se o pagamento está completo
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    if (totalPaid < orderTotal) {
      toast.error("O valor pago é menor que o total do pedido.")
      return
    }

    setShowPaymentConfirmation(true)
  }

  // Cancelar pedido - atualiza para status "Cancelado" (ordem 5)
  const handleCancelOrder = async () => {
    if (!currentOrder && !editingOrder) {
      toast.error("Nenhum pedido encontrado para cancelar.")
      return
    }

    const orderIdentify = (currentOrder || editingOrder)?.identify || (currentOrder || editingOrder)?.uuid || (currentOrder || editingOrder)?.id
    if (!orderIdentify) {
      toast.error("Não foi possível identificar o pedido.")
      return
    }

    try {
      // Buscar status "Cancelado" primeiro por nome, depois por position
      let cancelledStatus = null
      try {
        const response = await apiClient.get(endpoints.orderStatuses.list(true))
        if (response.success && response.data && Array.isArray(response.data)) {
          // Primeiro tentar buscar por nome
          cancelledStatus = response.data.find((s: any) => s.name === 'Cancelado')
          // Se não encontrar, buscar por order_position = 5
          if (!cancelledStatus) {
            cancelledStatus = response.data.find((s: any) => s.order_position === 5)
          }
        }
      } catch (error) {

      }

      if (!cancelledStatus) {
        toast.error("Não foi possível encontrar o status 'Cancelado'.")
        return
      }

      // Usar o nome do status diretamente, que é mais confiável
      const payload: Record<string, any> = {
        status: 'Cancelado', // Usar nome diretamente
      }

      const result = await mutateOrder(endpoints.orders.update(String(orderIdentify)), "PUT", payload)
      if (result) {
        toast.success("Pedido cancelado com sucesso!")
        
        // Recarregar pedidos
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        refetchTodayOrders()
        
        // Limpar estado
        setOrderStarted(false)
        setCurrentOrder(null)
        setEditingOrder(null)
        clearCart()
        setCustomerName("")
        setCustomerPhone("")
        setSelectedClientId("")
        setSelectedPaymentMethod(null)
        setOrderNotes("")
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao cancelar pedido")
    }
  }

  const handleCompleteOrder = async () => {
    // Esta função agora redireciona para handleFinalizeOrder
    return handleFinalizeOrder()
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Novo pedido
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        handleNewOrder()
      }
      
      // Ctrl/Cmd + Enter: Iniciar pedido (se não tiver iniciado) ou Finalizar pedido (se já iniciado)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (cart.length > 0 && !submittingOrder) {
          if (!orderStarted && !editingOrder) {
            handleStartOrder()
          } else if (orderStarted || editingOrder) {
            handleFinalizeOrder()
          }
        }
      }
      
      // Escape: Fechar modais
      if (e.key === 'Escape') {
        setSelectionDialogOpen(false)
      }
      
      // Números 1-9: Selecionar categoria rápida (apenas se não estiver digitando em um input)
      const activeElement = document.activeElement as HTMLElement | null
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable
      )
      
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey && !isInputFocused) {
        const index = parseInt(e.key) - 1
        if (categories[index]) {
          const categoryKey = categories[index].uuid || categories[index].identify || categories[index].name
          setSelectedCategory(categoryKey)
          toast.info(`Categoria: ${categories[index].name}`)
        }
      }
    }
    
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [cart.length, submittingOrder, categories, handleFinalizeOrder, clearCart, setSelectedCategory, setSelectionDialogOpen, setEditingOrder, setCustomerName, setCustomerPhone, setDeliveryAddress, setSelectedClientId, setSelectedPaymentMethod, setSelectedTable, setIsDelivery, setOrderNotes])

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="max-w-md mx-2">
          <CardHeader>
            <CardTitle>Autenticação necessária</CardTitle>
            <CardDescription>Faça login para acessar o PDV.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const isLoadingData =
    authLoading ||
    categoriesLoading ||
    productsLoading ||
    tablesLoading ||
    paymentLoading ||
    clientsLoading ||
    serviceTypesLoading

  if (isLoadingData) {
    return (
      <PageLoading
        isLoading
        message="Carregando PDV..."
      />
    )
  }

  if (categoriesError || productsError || tablesError || paymentError || clientsError || serviceTypesError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <h2 className="text-xl font-semibold text-destructive">Erro ao carregar o PDV</h2>
        <p className="text-muted-foreground">
          {categoriesError || productsError || tablesError || paymentError || clientsError || serviceTypesError}
        </p>
      </div>
    )
  }

  return (
    <PDVMainLayout>
      {/* Header com busca, operador e status */}
      <PDVHeader
        operatorName={user?.name || user?.email}
        onOrderSelect={loadOrderInPDV}
        tables={tables.map((table) => ({
          uuid: table.uuid,
          identify: table.identify,
          name: table.name,
          isOccupied: tablesWithOpenOrders.has(table.uuid || table.identify || table.name),
          orderCount: todayOrders.filter((order: Order) => {
            const orderTableKey = order.table?.uuid || order.table?.identify || order.table?.name
            const tableKey = table.uuid || table.identify || table.name
            return orderTableKey === tableKey && !['Entregue', 'Concluído', 'Cancelado', 'Arquivado'].includes(order.status || '')
          }).length,
        }))}
        onTableSelect={(table) => {
          const tableKey = table.uuid || table.identify || table.name
          if (tableKey) {
            setSelectedTable(tableKey)
          }
        }}
        isDelivery={isDelivery}
        onNewOrder={handleNewOrder}
        onFeedback={() => setShowFeedbackDialog(true)}
        cartItemCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        selectedTableName={selectedTableName}
        showDashboard={showDashboard}
        onToggleDashboard={() => setShowDashboard(!showDashboard)}
        canViewReports={pdvPermissions.canViewReports}
        useCombinedSearch={true}
        dashboardComponent={
          showDashboard ? (
            <PDVQuickDashboard 
              todayOrders={todayOrders} 
              showDashboard={showDashboard}
              onToggle={() => setShowDashboard(!showDashboard)}
            />
          ) : undefined
        }
      />

      {/* Alerta de mesa ocupada - compacto */}
      {contextualAlerts.length > 0 && contextualAlerts.some(alert => alert.message.includes('pedido(s) em aberto')) && (
        <div className="flex-shrink-0 mx-1.5 mt-1.5">
          {contextualAlerts
            .filter(alert => alert.message.includes('pedido(s) em aberto'))
            .map((alert, index) => (
              <div
                key={index}
                className={cn(
                  "rounded-lg border px-2 py-1.5 flex items-center gap-1.5",
                  alert.type === 'warning' && "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20"
                )}
              >
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-600" />
                <p className="text-xs font-medium text-yellow-900 dark:text-yellow-100 flex-1">
                  {alert.message}
                </p>
                {alert.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={alert.action.onClick}
                    className="h-6 text-xs px-2"
                  >
                    {alert.action.label}
                  </Button>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Conteúdo principal com scroll otimizado */}
      <PDVTwoColumnLayout
        leftColumn={
          <section className="flex flex-col gap-2 overflow-hidden min-h-0">
          {/* Busca de Produtos */}
          <Card id="search-section" className="flex-shrink-0 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
            <CardContent className="pt-2 pb-2">
              <ProductSearch
                products={products as any}
                onProductSelect={(product: any) => startProductSelection(product)}
                onSearchChange={(query) => setProductSearchQuery(query)}
                placeholder="Buscar produtos por nome ou código..."
                showRecentSearches={true}
              />
            </CardContent>
          </Card>

          {/* Categorias */}
          <Card id="categories-section" className="flex-shrink-0 border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-950/10">
            <CardHeader className="pb-1 pt-2.5">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Categorias</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-1.5">
              <ProductFilters
                categories={categories as any}
                selectedCategory={selectedCategory}
                onCategorySelect={setSelectedCategory}
              />
            </CardContent>
          </Card>

          {/* Grid de Produtos */}
          <ProductGrid
            products={visibleProducts as any}
            onProductSelect={(product: any) => startProductSelection(product)}
            getProductPrice={(product: any) => getProductPrice(product)}
            getProductId={(product: any) => getProductId(product)}
            formatCurrency={formatCurrency}
            selectedCategory={selectedCategory}
            className="border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10"
          />

          {/* Recomendações Inteligentes - Fase 4 */}
          {cart.length > 0 && (
            <ProductRecommendations
              cart={cart}
              allProducts={products}
              onAddProduct={(product) => {
                startProductSelection(product)
              }}
              orderHistory={todayOrders}
            />
          )}
          </section>
        }
        rightColumn={
          <aside id="order-summary" className="flex flex-col min-h-0">
          <Card className="flex flex-col border-orange-200 bg-orange-50/30 dark:border-orange-800 dark:bg-orange-950/10 min-h-[650px] h-full max-h-[calc(100vh-4rem)]">
            <CardHeader className="flex-shrink-0 space-y-0 pb-1.5 pt-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-semibold text-orange-900 dark:text-orange-100">Carrinho</CardTitle>
                </div>
                {/* Badge de Status do Pedido */}
                {(editingOrder || currentOrder) && (
                  <OrderStatusBadge
                    status={editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name}
                    showIcon={true}
                  />
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-1 min-h-0 space-y-2 pt-2 pb-3 overflow-hidden">
              <Tabs value={cartTab} onValueChange={(value) => setCartTab(value as typeof cartTab)} className="flex flex-col flex-1 min-h-0 h-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-muted/50 p-1 rounded-lg h-auto min-h-[2.5rem] flex-shrink-0">
                  <TabsTrigger
                    value="service"
                    className="cursor-pointer flex items-center gap-1.5 sm:gap-2 rounded-md px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                  >
                    <Handshake className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden xs:inline truncate">Atendimento</span>
                    <span className="xs:hidden">Atend.</span>
                  </TabsTrigger>
                  <TabsTrigger
                  value="client"
                  className="cursor-pointer flex items-center gap-1.5 sm:gap-2 rounded-md px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                  >
                    <User className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden xs:inline truncate">Cliente</span>
                    <span className="xs:hidden">Cliente</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    className="cursor-pointer flex items-center gap-1.5 sm:gap-2 rounded-md px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                  >
                    <CreditCardIcon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden xs:inline truncate">Pagamento</span>
                    <span className="xs:hidden">Pag.</span>
                  </TabsTrigger>
                  <TabsTrigger
                  value="items"
                  className="cursor-pointer flex items-center gap-1.5 sm:gap-2 rounded-md px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-medium transition-all data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground"
                  >
                    <ShoppingCartIcon className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="hidden xs:inline truncate">Carrinho</span>
                    <span className="xs:hidden">Carr.</span>
                  </TabsTrigger>
                </TabsList>
                <div className="flex-1 min-h-0 mt-2 overflow-y-auto pr-3 max-h-full">
                  {/* Aba: Tipo de Atendimento */}
                  <TabsContent value="service" className="mt-0 h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      <OrderStatusGuard
                        status={
                          editingOrder?.status ||
                          editingOrder?.order_status?.name ||
                          currentOrder?.status ||
                          currentOrder?.order_status?.name
                        }
                        showAlert={false}
                        allowViewOnly={true}
                      >
                        <div className="flex-1 flex items-center justify-center">
                          <OrderTypeSelector
                            selectedType={
                              (currentServiceType?.identify ||
                                currentServiceType?.slug ||
                                selectedServiceType ||
                                (isDelivery
                                  ? "delivery"
                                  : selectedTable
                                  ? "table"
                                  : "counter")) as OrderType
                            }
                            onTypeChange={(type) => {
                              // Encontrar o tipo de atendimento correspondente
                              const serviceType = serviceTypes.find(
                                (st: any) =>
                                  (st.slug || st.identify || "")
                                    .toLowerCase()
                                    .trim() === type.toLowerCase().trim()
                              )

                              if (serviceType) {
                                setSelectedServiceType(
                                  serviceType.identify || serviceType.slug
                                )

                                // Atualizar estados baseado nas propriedades do tipo
                                if (serviceType.requires_address) {
                                  setIsDelivery(true)
                                  setSelectedTable(null)
                                } else {
                                  setIsDelivery(false)
                                }

                                if (serviceType.requires_table) {
                                  if (tables.length > 0 && !selectedTable) {
                                    const firstTable = tables[0]
                                    setSelectedTable(
                                      firstTable.uuid ||
                                        firstTable.identify ||
                                        firstTable.name
                                    )
                                  }
                                } else {
                                  setSelectedTable(null)
                                }
                              } else {
                                // Fallback para comportamento antigo
                                if (type === "delivery") {
                                  setIsDelivery(true)
                                  setSelectedTable(null)
                                  setSelectedServiceType("delivery")
                                } else if (type === "table") {
                                  setIsDelivery(false)
                                  setSelectedServiceType("table")
                                  if (tables.length > 0 && !selectedTable) {
                                    const firstTable = tables[0]
                                    setSelectedTable(
                                      firstTable.uuid ||
                                        firstTable.identify ||
                                        firstTable.name
                                    )
                                  }
                                } else if (type === "counter") {
                                  setIsDelivery(false)
                                  setSelectedTable(null)
                                  setSelectedServiceType("counter")
                                } else if (type === "pickup") {
                                  setIsDelivery(false)
                                  setSelectedTable(null)
                                  setSelectedServiceType("pickup")
                                }
                              }
                            }}
                            serviceTypes={serviceTypes}
                            loading={serviceTypesLoading}
                          />
                        </div>
                      </OrderStatusGuard>

                      {/* Seletor de Mesa (apenas para tipos que requerem mesa) */}
                      {requiresTable && (
                        <OrderStatusGuard
                          status={
                            editingOrder?.status ||
                            editingOrder?.order_status?.name ||
                            currentOrder?.status ||
                            currentOrder?.order_status?.name
                          }
                          showAlert={false}
                          allowViewOnly={true}
                        >
                          <TableSelector
                            tables={tables}
                            selectedTable={selectedTable}
                            onTableSelect={setSelectedTable}
                            tablesWithOpenOrders={tablesWithOpenOrders}
                            editingOrder={editingOrder}
                            currentOrder={currentOrder}
                            showOccupiedWarning={true}
                          />
                        </OrderStatusGuard>
                      )}

                      {/* Formulário de Endereço de Entrega (apenas para tipos que requerem endereço) */}
                      {requiresAddress && (
                        <OrderStatusGuard
                          status={
                            editingOrder?.status ||
                            editingOrder?.order_status?.name ||
                            currentOrder?.status ||
                            currentOrder?.order_status?.name
                          }
                          showAlert={false}
                          allowViewOnly={true}
                        >
                          <DeliveryAddressForm
                            address={deliveryAddress}
                            onAddressChange={setDeliveryAddress}
                          />
                        </OrderStatusGuard>
                      )}
                    </div>
                  </TabsContent>

                  {/* Aba: Cliente */}
                  <TabsContent value="client" className="mt-0 h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      <OrderStatusGuard
                        status={editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name}
                        showAlert={false}
                        allowViewOnly={true}
                      >
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowClientSection(!showClientSection)}
                          className="w-full h-12 justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Cliente (opcional)
                          </span>
                          {showClientSection ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                        {showClientSection && (
                          <div className="space-y-3 rounded-xl border p-4 bg-muted/30">
                            {clients.length > 0 && (
                              <Combobox
                                options={clientOptions}
                                value={selectedClientId}
                                onValueChange={handleClientChange}
                                placeholder="Selecione um cliente... (digite para buscar)"
                                searchPlaceholder="Buscar cliente..."
                                emptyText="Nenhum cliente encontrado"
                                allowClear
                                className="h-12 rounded-2xl text-lg"
                              />
                            )}
                            <div id="client-section" className="space-y-2">
                              <p className="text-xs text-muted-foreground">Ou preencha manualmente:</p>
                              <Input
                                placeholder="Nome do cliente"
                                value={customerName}
                                onChange={(event) => {
                                  if (selectedClientId) {
                                    setSelectedClientId("")
                                    setFiscalCpfCnpj("") // Limpar CPF quando cliente selecionado é removido
                                  }
                                  setCustomerName(event.target.value)
                                  // Se o nome for limpo, limpar também o CPF
                                  if (!event.target.value.trim()) {
                                    setFiscalCpfCnpj("")
                                  }
                                }}
                                className="h-12 text-lg"
                                list="client-names"
                              />
                              <datalist id="client-names">
                                {clients.slice(0, 10).map((client) => (
                                  <option key={client.uuid || client.identify} value={client.name} />
                                ))}
                              </datalist>
                              <Input
                                placeholder="Telefone"
                                value={customerPhone}
                                onChange={(event) => {
                                  if (selectedClientId) {
                                    setSelectedClientId("")
                                    setFiscalCpfCnpj("") // Limpar CPF quando cliente selecionado é removido
                                  }
                                  setCustomerPhone(maskPhone(event.target.value))
                                }}
                                className="h-12 text-lg"
                              />
                            </div>
                            {selectedClientId && (
                              <ClientOrderHistory clientId={selectedClientId} onLoadOrder={loadOrderInPDV} />
                            )}
                          </div>
                        )}
                      </div>
                    </OrderStatusGuard>
                    </div>
                  </TabsContent>

                  {/* Aba: Forma de Pagamento */}
                  <TabsContent value="payment" className="mt-0 h-full">
                    <div className="space-y-3 h-full flex flex-col">
                      {(() => {
                        // Determinar o status do pedido atual para proteção de edição
                        const currentOrderStatus = editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name
                        
                        // Converter paymentMethods para o formato esperado
                        const paymentMethodsFormatted: PaymentMethodType[] = paymentMethods.map(m => ({
                          uuid: m.uuid,
                          name: m.name,
                          description: m.description || null,
                        }))
                        
                        // Métodos selecionados (para split payment ou método único)
                        const selectedMethods: PaymentMethodType[] = useSplitPayment
                          ? splitPaymentItems.map(item => item.method)
                          : selectedPaymentMethod
                            ? paymentMethodsFormatted.filter(m => m.uuid === selectedPaymentMethod)
                            : []
                        
                        const handlePaymentSelect = (method: PaymentMethodType) => {
                          if (useSplitPayment) {
                            // Se já existe um item com este método, não adicionar
                            if (!splitPaymentItems.some(item => item.method.uuid === method.uuid)) {
                              setSplitPaymentItems([...splitPaymentItems, { method, amount: null }])
                            }
                          } else {
                            setSelectedPaymentMethod(method.uuid)
                            // Verificar se é dinheiro e abrir dialog de troco
                            const isCash = method.name.toLowerCase().includes('dinheiro') || 
                                           method.name.toLowerCase().includes('money') || 
                                           method.name.toLowerCase().includes('cash')
                            if (isCash && cart.length > 0 && orderTotal > 0 && !changeDialogAnswered) {
                              setShowChangeDialog(true)
                            } else if (!isCash) {
                              setChangeDialogAnswered(false)
                              setNeedsChange(false)
                              setReceivedAmount(null)
                            }

                            // Fechar modal após seleção em pagamento único
                            setShowPaymentMethods(false)
                          }
                        }
                        
                        const handlePaymentRemove = (method: PaymentMethodType) => {
                          if (useSplitPayment) {
                            setSplitPaymentItems(splitPaymentItems.filter(item => item.method.uuid !== method.uuid))
                          } else {
                            setSelectedPaymentMethod(null)
                          }
                        }
                        
                        return (
                          <OrderStatusGuard
                            status={currentOrderStatus}
                            showAlert={false}
                            allowViewOnly={true}
                          >
                            <div id="payment-section" className="space-y-3">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium">Pagamento</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUseSplitPayment(!useSplitPayment)
                                    if (!useSplitPayment) {
                                      // Inicializar split payment com método atual se houver
                                      if (selectedPaymentMethod) {
                                        const method = paymentMethodsFormatted.find(m => m.uuid === selectedPaymentMethod)
                                        if (method) {
                                          setSplitPaymentItems([{ method, amount: null }])
                                        }
                                      }
                                    } else {
                                      // Voltar para método único
                                      setSplitPaymentItems([])
                                    }
                                  }}
                                  className="h-7 text-[10px] px-2"
                                >
                                  {useSplitPayment ? "Pagamento único" : "Dividir pagamento"}
                                </Button>
                              </div>

                              {/* Botão que abre o modal de seleção de pagamento */}
                              <Button
                                type="button"
                                variant={selectedMethods.length ? "default" : "outline"}
                                size="lg"
                                className={cn(
                                  "w-full h-12 justify-between px-3",
                                  selectedMethods.length && "bg-primary text-primary-foreground"
                                )}
                                onClick={() => {
                                  if (!paymentLoading && paymentMethodsFormatted.length > 0) {
                                    setShowPaymentMethods(true)
                                  }
                                }}
                                disabled={paymentLoading || paymentMethodsFormatted.length === 0}
                              >
                                <span className="flex items-center gap-2 text-xs sm:text-sm">
                                  <CreditCard className="h-4 w-4" />
                                  {paymentLoading
                                    ? "Carregando formas de pagamento..."
                                    : paymentMethodsFormatted.length === 0
                                    ? "Nenhuma forma de pagamento disponível"
                                    : useSplitPayment
                                    ? selectedMethods.length > 0
                                      ? `${selectedMethods.length} métodos selecionados`
                                      : "Selecione os métodos de pagamento"
                                    : selectedMethods.length === 1
                                    ? selectedMethods[0].name
                                    : "Selecione a forma de pagamento"}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-70" />
                              </Button>

                              {/* Modal com a lista de pagamentos */}
                              <Dialog open={showPaymentMethods} onOpenChange={setShowPaymentMethods}>
                                <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <CreditCard className="h-5 w-5" />
                                      Selecionar forma de pagamento
                                    </DialogTitle>
                                    <DialogDescription>
                                      Escolha {useSplitPayment ? "uma ou mais formas de pagamento para este pedido" : "a forma de pagamento para este pedido"}
                                    </DialogDescription>
                                  </DialogHeader>

                                  {paymentLoading ? (
                                    <div className="space-y-2">
                                      <div className="h-10 rounded-lg border bg-muted animate-pulse" />
                                      <div className="h-10 rounded-lg border bg-muted animate-pulse" />
                                    </div>
                                  ) : paymentMethodsFormatted.length === 0 ? (
                                    <div className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                                      Nenhuma forma de pagamento ativa encontrada. Cadastre ou ative métodos no painel.
                                    </div>
                                  ) : !useSplitPayment ? (
                                    <PaymentButtonsGrid
                                      methods={paymentMethodsFormatted}
                                      selectedMethods={selectedMethods}
                                      onSelect={handlePaymentSelect}
                                      onRemove={handlePaymentRemove}
                                    />
                                  ) : (
                                    <SplitPaymentForm
                                      methods={paymentMethodsFormatted}
                                      orderTotal={orderTotal}
                                      items={splitPaymentItems}
                                      onChange={setSplitPaymentItems}
                                      formatCurrency={formatCurrency}
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>

                              {/* Campo de valor recebido para dinheiro */}
                              {selectedPaymentMethod && (() => {
                                const selectedMethod = paymentMethods.find(m => m.uuid === selectedPaymentMethod)
                                const isCash = selectedMethod && (
                                  selectedMethod.name.toLowerCase().includes('dinheiro') || 
                                  selectedMethod.name.toLowerCase().includes('money') || 
                                  selectedMethod.name.toLowerCase().includes('cash')
                                )
                                
                                if (isCash && needsChange) {
                                  return (
                                    <PaymentAmountInput
                                      value={receivedAmount}
                                      onChange={setReceivedAmount}
                                      orderTotal={orderTotal}
                                      label="Valor recebido"
                                      placeholder="0,00"
                                      showChange={true}
                                    />
                                  )
                                }
                                return null
                              })()}
                              
                              {/* Documento Fiscal */}
                              <Separator />
                              <FiscalDocument
                                documentType={fiscalDocumentType}
                                cpfCnpj={fiscalCpfCnpj}
                                onDocumentTypeChange={setFiscalDocumentType}
                                onCpfCnpjChange={setFiscalCpfCnpj}
                                onEmitNow={() => {
                                  // TODO: Implementar emissão de NFC-e
                                  toast.info("NFC-e emitida com sucesso")
                                }}
                                onEmitLater={() => {
                                  toast.info("NFC-e será emitida posteriormente")
                                }}
                              />
                            </div>
                          </OrderStatusGuard>
                        )
                      })()}
                    </div>
                  </TabsContent>

                  {/* Aba: Carrinho (Itens e Notas) */}
                  <TabsContent value="items" className="mt-0 h-full">
                    <div className="space-y-3 h-full flex flex-col bg-gradient-to-b from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/20 dark:via-purple-950/10 dark:to-pink-950/20 rounded-lg p-2">
                      {/* Itens do carrinho */}
                      <OrderStatusGuard
                        status={
                          editingOrder?.status ||
                          editingOrder?.order_status?.name ||
                          currentOrder?.status ||
                          currentOrder?.order_status?.name
                        }
                        showAlert={false}
                        allowViewOnly={true}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 pb-1">
                            <ShoppingCartIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                              Itens selecionados
                            </p>
                            {cart.length > 0 && (
                              <Badge className="bg-blue-500 text-white dark:bg-blue-600">
                                {cart.length}
                              </Badge>
                            )}
                          </div>
                          <OrderItemsList
                            items={cart as any}
                            getUnitPrice={getCartItemUnitPrice as any}
                            formatCurrency={formatCurrency}
                            onIncrease={(signature) => updateItemQuantity(signature, 1)}
                            onDecrease={(signature) => updateItemQuantity(signature, -1)}
                            onRemove={removeItem}
                            onObservationChange={updateItemObservation}
                            addingItem={addingItem}
                            removingItem={removingItem}
                          />
                        </div>
                      </OrderStatusGuard>

                      {/* Total e Subtotal - dentro da aba Itens */}
                      <div className="pt-2 border-t-2 border-purple-200 dark:border-purple-800">
                        <OrderTotals
                          subtotal={orderTotal}
                          taxes={0}
                          discounts={0}
                          formatCurrency={formatCurrency}
                        />
                      </div>

                      {/* Notas do pedido */}
                      <OrderStatusGuard
                        status={
                          editingOrder?.status ||
                          editingOrder?.order_status?.name ||
                          currentOrder?.status ||
                          currentOrder?.order_status?.name
                        }
                        showAlert={false}
                        allowViewOnly={true}
                      >
                        <div className="space-y-2 pt-2 border-t-2 border-pink-200 dark:border-pink-800">
                          <div className="flex items-center gap-2 pb-1">
                            <NotebookPen className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                            <p className="text-xs font-semibold text-pink-700 dark:text-pink-300">
                              Observações do Pedido
                            </p>
                          </div>
                          <OrderNotes
                            value={orderNotes}
                            onChange={setOrderNotes}
                            placeholder="Instruções adicionais"
                          />
                        </div>
                      </OrderStatusGuard>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
              
              {/* Seção fixa - Pagamento, Botões */}
              <div className="flex-shrink-0 space-y-1.5 pt-1.5 border-t">
              {/* Ações do Pedido */}
              {(orderStarted || editingOrder) && (
                <>
                  {/* Botão para ocultar/exibir ações */}
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">Ações do Pedido</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOrderActions(!showOrderActions)}
                      className="h-8 px-2"
                      title={showOrderActions ? "Ocultar ações" : "Exibir ações"}
                    >
                      {showOrderActions ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          <span className="text-xs">Ocultar</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          <span className="text-xs">Exibir</span>
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {/* Ações do Pedido - Ocultável */}
                  {showOrderActions && (
                    <div className="flex-shrink-0">
                      <OrderActions
                    orderId={editingOrder?.id || editingOrder?.uuid || currentOrder?.id || currentOrder?.uuid}
                    orderStatus={editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name}
                    isFinalStatus={isFinalStatus(editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name)}
                    tables={tables.map((table) => ({
                      uuid: table.uuid,
                      identify: table.identify,
                      name: table.name,
                      isOccupied: false, // TODO: Implementar verificação de ocupação
                    }))}
                    currentTable={
                      editingOrder?.table?.uuid || 
                      editingOrder?.table?.identify || 
                      editingOrder?.table?.name ||
                      editingOrder?.table_id ||
                      currentOrder?.table?.uuid || 
                      currentOrder?.table?.identify || 
                      currentOrder?.table?.name ||
                      currentOrder?.table_id ||
                      selectedTable ||
                      null
                    }
                    onCustomerNote={(note) => {
                      // TODO: Implementar API call para salvar observação do cliente
                      toast.info("Observação do cliente salva")
                    }}
                    onInternalNote={(note) => {
                      // TODO: Implementar API call para salvar observação interna
                      toast.info("Observação interna salva")
                    }}
                    onRefund={(amount, reason) => {
                      // TODO: Implementar API call para reembolso
                      toast.info(`Reembolso de ${formatCurrency(amount)} processado`)
                    }}
                    onSplit={(items, amounts) => {
                      // TODO: Implementar divisão de conta
                      toast.info("Conta dividida")
                    }}
                    onTransfer={(targetTable) => {
                      // TODO: Implementar transferência de mesa
                      toast.info(`Pedido transferido para mesa ${targetTable}`)
                    }}
                    onGuests={(count) => {
                      // TODO: Implementar atualização de quantidade de clientes
                      toast.info(`${count} cliente${count !== 1 ? 's' : ''} definido${count !== 1 ? 's' : ''}`)
                    }}
                  />
                    </div>
                  )}
                </>
              )}

                {/* Resumo Financeiro - Quantidade de itens e troco */}
              <div className="rounded-lg border-2 border-purple-300 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-950/30 space-y-2">
                {/* Quantidade de itens */}
                <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300 pb-1.5 border-b border-purple-200 dark:border-purple-800">
                  <span>Itens</span>
                  <span className="font-medium">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                
                {/* Informações de troco (apenas se for pagamento em dinheiro) */}
                {(() => {
                  const selectedMethod = paymentMethods.find(m => m.uuid === selectedPaymentMethod)
                  const isCash = selectedMethod && (
                    selectedMethod.name.toLowerCase().includes('dinheiro') || 
                    selectedMethod.name.toLowerCase().includes('money') || 
                    selectedMethod.name.toLowerCase().includes('cash')
                  )
                  
                  if (isCash && needsChange && receivedAmount) {
                    const changeAmount = receivedAmount - orderTotal
                    return (
                      <>
                        <div className="pt-1.5 border-t border-purple-200 dark:border-purple-800 space-y-1.5">
                          <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300">
                            <span>Valor Entregue</span>
                            <span className="font-medium">{formatCurrency(receivedAmount)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm font-semibold text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30 rounded px-2 py-1.5">
                            <span>Troco</span>
                            <span className="font-bold text-base">{formatCurrency(changeAmount)}</span>
                          </div>
                        </div>
                      </>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Indicador de edição */}
              {editingOrder && (
                <div className="rounded-2xl border-2 border-primary bg-primary/10 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Edit className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-primary">
                          Editando Pedido #{editingOrder.identify || editingOrder.id}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Use "Atualizar Pedido" para salvar sem finalizar ou "Concluir Pedido" para finalizar
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingOrder(null)
                        clearCart()
                        setCustomerName("")
                        setCustomerPhone("")
                        setDeliveryAddress({
                          zip: "",
                          address: "",
                          number: "",
                          neighborhood: "",
                          city: "",
                          state: "",
                          complement: "",
                        })
                        setSelectedClientId("")
                        setSelectedPaymentMethod(null)
                        setSelectedTable(null)
                        setIsDelivery(false)
                        setOrderNotes("")
                        toast.info("Edição cancelada")
                      }}
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {(() => {
                // Determinar o status do pedido atual para proteção de edição
                const currentOrderStatus = editingOrder?.status || editingOrder?.order_status?.name || currentOrder?.status || currentOrder?.order_status?.name
                
                return (
                  <>
                    <OrderStatusGuard
                      status={currentOrderStatus}
                      showAlert={false}
                      allowViewOnly={true}
                    >
                      <div className="flex flex-col gap-3">
                        {/* Botão Iniciar Pedido - aparece apenas quando o pedido não foi iniciado */}
                        {!orderStarted && !editingOrder && (
                          <Button
                            id="start-order-button"
                            data-testid="start-order-button"
                            onClick={handleStartOrder}
                            disabled={
                              submittingOrder || 
                              !cart.length || 
                              !selectedPaymentMethod ||
                                (requiresTable && !selectedTable) ||
                                (requiresTable && isTableOccupiedByOtherOrder) ||
                              !pdvPermissions.canCreateOrder
                            }
                            className="h-24 rounded-2xl text-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg"
                            title={
                              !cart.length
                                ? "Adicione itens ao pedido"
                                : !selectedPaymentMethod
                                ? "Selecione uma forma de pagamento"
                                  : requiresTable && !selectedTable
                                ? "Selecione uma mesa"
                                  : requiresTable && isTableOccupiedByOtherOrder
                                ? "Mesa ocupada - Finalize pedidos existentes"
                                : !pdvPermissions.canCreateOrder
                                ? "Você não tem permissão para criar pedidos"
                                : undefined
                            }
                          >
                            {submittingOrder ? (
                              <>
                                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                Processando...
                              </>
                            ) : (
                              <>
                                <Plus className="mr-3 h-6 w-6" />
                                <div className="flex flex-col items-start">
                                  <span>Iniciar Pedido</span>
                                  {cart.length > 0 && (() => {
                                    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
                                    const itemsText = totalItems === 1 ? 'item' : 'itens';
                                    const totalText = formatCurrency(orderTotal);
                                    const displayText = `${totalItems} ${itemsText} • ${totalText}`;
                                    return (
                                      <span className="text-sm font-normal opacity-90">
                                        {displayText}
                                      </span>
                                    );
                                  })()}
                                </div>
                              </>
                            )}
                          </Button>
                        )}

                        {/* Botões que aparecem após iniciar o pedido ou ao editar um pedido existente */}
                        {(orderStarted || editingOrder) && renderOrderActionButtons({
                          orderStarted,
                          editingOrder,
                          currentOrder,
                          isDelivery,
                          submittingOrder,
                          cart,
                          pdvPermissions,
                          handleUpdateOrder,
                          handleAdvanceStatus,
                          handleFinalizeOrder,
                          handleCancelOrder,
                          getNextStatusName,
                          isFinalStatus,
                        })}
                      </div>
                    </OrderStatusGuard>
                    
                      {/* Limpar carrinho */}
                    <OrderStatusGuard
                      status={currentOrderStatus}
                      showAlert={false}
                      allowViewOnly={true}
                    >
                      {cart.length > 0 && (
                          <div className="pt-2 border-t">
                          <Button
                            variant="outline"
                            onClick={clearCart}
                            className="w-full h-12 rounded-2xl text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="mr-2 h-5 w-5" />
                            Limpar carrinho
                          </Button>
                        </div>
                      )}
                    </OrderStatusGuard>
                  </>
                )
              })()}
              </div>
            </CardContent>
          </Card>
          </aside>
        }
      />

      {/* Sheet de Pedidos de Hoje */}
      <Sheet open={showTodayOrdersSheet} onOpenChange={setShowTodayOrdersSheet}>
        <SheetContent side="right" className="w-full sm:w-[400px] lg:w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pedidos de Hoje
            </SheetTitle>
            <SheetDescription>
              {(tableOrdersLoading || todayOrdersLoading) ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </span>
              ) : (
                <span>
                  {sidebarOrders.length} {sidebarOrders.length === 1 ? 'pedido' : 'pedidos'}
                  {selectedTable && !isDelivery && tableOrders && Array.isArray(tableOrders) && tableOrders.length > 0 ? ' (desta mesa)' : ' (de hoje)'}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 flex-1 overflow-hidden">
            {(tableOrdersError || todayOrdersError) ? (
              <div className="p-4 text-center text-sm text-destructive">
                Erro ao carregar pedidos: {tableOrdersError || todayOrdersError}
              </div>
            ) : (tableOrdersLoading || todayOrdersLoading) ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : sidebarOrders.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                <Package className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Nenhum pedido hoje
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-4 text-xs text-muted-foreground space-y-1">
                    <p>Debug Info:</p>
                    <p>todayOrdersData type: {String(typeof todayOrdersData)}</p>
                    <p>todayOrdersData isArray: {String(Array.isArray(todayOrdersData))}</p>
                    <p>todayOrders length: {String(todayOrders.length)}</p>
                    <p className="break-all text-xs">
                      Raw data: {todayOrdersData ? String(JSON.stringify(todayOrdersData).substring(0, 200)) + '...' : 'null'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-12rem)]">
                <div className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sidebarOrders.map((order: Order) => {
                      const orderId = order.identify || order.uuid || order.id
                      const orderTotal = parsePrice(order.total || 0)
                      const orderStatus = order.status || 'Pendente'
                      // Formatar data com validação
                      let orderDate = '--:--'
                      if (order.created_at) {
                        try {
                          const date = new Date(order.created_at)
                          if (!isNaN(date.getTime())) {
                            orderDate = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          }
                        } catch (error) {

                        }
                      }
                      const isActive = editingOrder && (editingOrder.identify === orderId || editingOrder.uuid === orderId || editingOrder.id === order.id)
                      
                      // Verificar se o pedido pertence à mesa selecionada
                      const orderTableKey = order.table?.uuid || order.table?.identify || order.table?.name
                      const isFromSelectedTable = selectedTable && orderTableKey === selectedTable && !isDelivery
                      
                      return (
                        <button
                          key={orderId}
                          onClick={() => {
                            loadOrderInPDV(String(orderId))
                            setShowTodayOrdersSheet(false)
                          }}
                          className={cn(
                            "w-full rounded-xl border p-3 text-left transition-all hover:shadow-md",
                            isActive
                              ? "border-primary bg-primary/10 shadow-md"
                              : isFromSelectedTable
                              ? "border-yellow-400 bg-yellow-50/50 dark:bg-yellow-950/20 shadow-sm"
                              : "border-border bg-card hover:border-primary/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-foreground truncate">
                                    #{order.identify || order.id}
                                  </span>
                                  {isFromSelectedTable && (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-yellow-400 text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-900/30">
                                      Esta Mesa
                                    </Badge>
                                  )}
                                </div>
                                <Badge 
                                  variant={orderStatus === 'Entregue' || orderStatus === 'Concluído' ? 'default' : 'secondary'}
                                  className="text-[10px] px-1 py-0 w-fit"
                                >
                                  {orderStatus}
                                </Badge>
                              </div>
                            </div>
                            <Edit className={cn(
                              "h-3 w-3 flex-shrink-0 mt-0.5",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                            <Clock className="h-2.5 w-2.5" />
                            {orderDate}
                          </div>
                          
                          {order.client && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 truncate">
                              <User className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">{order.client.name}</span>
                            </div>
                          )}
                          
                          {order.table && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1 truncate">
                              <Utensils className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">Mesa: {order.table.name}</span>
                            </div>
                          )}
                          
                          {order.products && Array.isArray(order.products) && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                              <Package className="h-2.5 w-2.5 flex-shrink-0" />
                              <span>{order.products.length} {order.products.length === 1 ? 'item' : 'itens'}</span>
                            </div>
                          )}
                          
                          <div className="mt-2 pt-2 border-t border-border">
                            <span className="font-bold text-sm text-foreground">
                              {formatCurrency(orderTotal)}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Sheet de Edição de Pedido */}
      <Sheet open={editOrderSheetOpen} onOpenChange={setEditOrderSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl flex flex-col p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <Edit className="h-6 w-6 text-primary" />
              Editar Pedido #{editingOrder?.identify || editingOrder?.id}
            </SheetTitle>
            <SheetDescription>
              {editingOrder && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-sm">
                    Status: {editingOrder.status || "Pendente"}
                  </Badge>
                  {editingOrder.client && (
                    <Badge variant="secondary" className="text-sm">
                      Cliente: {editingOrder.client.name}
                    </Badge>
                  )}
                  {editingOrder.table && (
                    <Badge variant="secondary" className="text-sm">
                      Mesa: {editingOrder.table.name}
                    </Badge>
                  )}
                </div>
              )}
            </SheetDescription>
          </SheetHeader>

          <ScrollArea className="flex-1 px-6">
            {editingOrder && (
              <div className="mt-6 space-y-6 pb-6">
                {/* Itens do Pedido */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Itens do Pedido</h3>
                {editOrderCart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                    Nenhum item no pedido.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {editOrderCart.map((item) => {
                      const unitPrice = getCartItemUnitPrice(item)
                      return (
                        <div
                          key={item.signature}
                          className="rounded-2xl border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <p className="text-lg font-semibold">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(unitPrice)} cada
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remover ${item.product.name}`}
                              onClick={() => {
                                setEditOrderCart((prev) =>
                                  prev.filter((i) => i.signature !== item.signature)
                                )
                              }}
                            >
                              <Trash2 className="h-5 w-5 text-destructive" />
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 rounded-2xl"
                              aria-label={`Diminuir ${item.product.name}`}
                              onClick={() => {
                                setEditOrderCart((prev) =>
                                  prev.map((i) =>
                                    i.signature === item.signature
                                      ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                      : i
                                  )
                                )
                              }}
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                            <span className="min-w-[56px] rounded-2xl bg-muted px-4 py-2 text-center text-lg font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 rounded-2xl"
                              aria-label={`Aumentar ${item.product.name}`}
                              onClick={() => {
                                setEditOrderCart((prev) =>
                                  prev.map((i) =>
                                    i.signature === item.signature
                                      ? { ...i, quantity: i.quantity + 1 }
                                      : i
                                  )
                                )
                              }}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                            <span className="ml-auto text-lg font-semibold">
                              {formatCurrency(unitPrice * item.quantity)}
                            </span>
                          </div>
                          <Input
                            value={item.observation}
                            onChange={(event) => {
                              setEditOrderCart((prev) =>
                                prev.map((i) =>
                                  i.signature === item.signature
                                    ? { ...i, observation: event.target.value }
                                    : i
                                )
                              )
                            }}
                            placeholder="Observações"
                            className="mt-3 h-11 rounded-2xl"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Adicionar Produtos */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Adicionar Produtos</h3>
                  <Badge variant="outline" className="text-xs">
                    {products.length} disponíveis
                  </Badge>
                </div>
                <ScrollArea className="h-64 rounded-lg border p-4">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {products.map((product) => {
                    const price = getProductPrice(product)
                    return (
                      <Button
                        key={getProductId(product)}
                        variant="outline"
                        onClick={() => {
                          const productId = getProductId(product)
                          const signature = getCartItemSignature(productId, null, [])
                          setEditOrderCart((prev) => {
                            const exists = prev.find((item) => item.signature === signature)
                            if (exists) {
                              return prev.map((item) =>
                                item.signature === signature
                                  ? { ...item, quantity: item.quantity + 1 }
                                  : item
                              )
                            }
                            return [
                              ...prev,
                              {
                                signature,
                                product,
                                quantity: 1,
                                observation: "",
                                selectedVariation: null,
                                selectedOptionals: [],
                              },
                            ]
                          })
                        }}
                        className="h-20 flex-col gap-1 rounded-2xl"
                      >
                        <span className="text-sm font-medium">{product.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(price)}
                        </span>
                      </Button>
                    )
                  })}
                  </div>
                </ScrollArea>
              </div>

              {/* Observações */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Observações do Pedido</Label>
                <Textarea
                  value={editOrderNotes}
                  onChange={(event) => setEditOrderNotes(event.target.value)}
                  placeholder="Instruções adicionais"
                  className="min-h-[80px] rounded-2xl"
                />
              </div>
              </div>
            )}
          </ScrollArea>

          {/* Botões de Ação Fixos */}
          {editingOrder && (
            <div className="border-t p-6 bg-muted/30 space-y-3">
              <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-950/30">
                <div className="flex items-center justify-between text-sm text-purple-700 dark:text-purple-300">
                  <span>Itens</span>
                  <span>{editOrderCart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xl font-bold text-purple-900 dark:text-purple-100">
                  <span>Total</span>
                  <span>
                    {formatCurrency(
                      editOrderCart.reduce(
                        (sum, item) => sum + getCartItemUnitPrice(item) * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                {/* Botão Salvar Alterações - Comentado */}
                {/* <Button
                  onClick={handleSaveOrderEdit}
                  disabled={submittingOrder || !editOrderCart.length}
                  className="h-16 rounded-2xl text-xl"
                >
                  {submittingOrder && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Salvar Alterações
                </Button> */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditOrderSheetOpen(false)
                    setEditingOrder(null)
                    setEditOrderCart([])
                    setEditOrderNotes("")
                  }}
                  className="h-14 rounded-2xl text-lg"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={selectionDialogOpen}
        onOpenChange={(open) => {
          setSelectionDialogOpen(open)
          if (!open) {
            resetSelectionState()
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              {selectionProduct?.name || "Selecionar produto"}
            </DialogTitle>
            {selectionProduct?.description && (
              <DialogDescription className="text-base">
                {selectionProduct.description}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectionProduct && (
            <div className="space-y-6">
              {selectionProduct.variations?.length ? (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Variações</Label>
                  <RadioGroup
                    value={selectionVariationId}
                    onValueChange={setSelectionVariationId}
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {selectionProduct.variations.map((variation, index) => {
                      const variationKey =
                        variation.id ||
                        variation.identify ||
                        variation.name ||
                        `variation-${index}`
                      const variationDomId = `variation-${variationKey}-${index}`
                      const variationPrice =
                        parsePrice(variation.price ?? null) || getProductPrice(selectionProduct)
                      return (
                        <Label
                          key={variationDomId}
                          htmlFor={variationDomId}
                          className={cn(
                            "flex cursor-pointer flex-col gap-1 rounded-2xl border p-3 text-sm font-medium",
                            selectionVariationId === variationKey
                              ? "border-primary bg-primary/5"
                              : "border-border bg-muted/40"
                          )}
                        >
                          <div className="flex w-full items-center justify-between gap-2">
                            <div>
                              <p className="text-base font-semibold">{variation.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(variationPrice)}
                              </p>
                            </div>
                            <RadioGroupItem
                              id={variationDomId}
                              value={variationKey}
                              className="border-primary text-primary"
                            />
                          </div>
                        </Label>
                      )
                    })}
                  </RadioGroup>
                </div>
              ) : null}

              {selectionProduct.optionals?.length ? (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Opcionais</Label>
                  <div className="space-y-3">
                    {selectionProduct.optionals.map((optional, index) => {
                      const optionalKey =
                        optional.id || optional.identify || optional.name || `optional-${index}`
                      const quantity = selectionOptionals[optionalKey] || 0
                      const optionalPrice = parsePrice(optional.price)
                      return (
                        <div
                          key={optionalKey}
                          className="flex items-center justify-between rounded-2xl border p-3"
                        >
                          <div>
                            <p className="font-semibold">{optional.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(optionalPrice)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleSelectionOptionalChange(optionalKey, -1)}
                              disabled={quantity === 0}
                              className="h-10 w-10 rounded-2xl"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleSelectionOptionalChange(optionalKey, 1)}
                              className="h-10 w-10 rounded-2xl"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <Separator />

              <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total estimado</p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(selectionTotal)}</p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setSelectionDialogOpen(false)
                      resetSelectionState()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    className="w-full sm:w-auto"
                    onClick={handleConfirmSelection}
                    disabled={
                      !!selectionProduct.variations?.length && !selectionVariationId
                    }
                  >
                    Adicionar ao pedido
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de QR Code PIX */}
      {pixOrderData && (
        <PixQrCodeDialog
          open={showPixDialog}
          onOpenChange={setShowPixDialog}
          orderId={pixOrderData.orderId}
          orderTotal={pixOrderData.total}
          qrCode={pixOrderData.qrCode}
          qrCodeText={pixOrderData.qrCodeText}
          onPaymentConfirmed={() => {
            toast.success("Pagamento confirmado! Pedido finalizado com sucesso.")
            setShowPixDialog(false)
            setPixOrderData(null)
          }}
        />
      )}

      {/* Tutorial Interativo - Fase 4 */}
      <PDVTutorial
        onComplete={() => {
          toast.success("Tutorial concluído! Você está pronto para usar o PDV.")
        }}
        onSkip={() => {
          toast.info("Tutorial pulado. Você pode reativá-lo a qualquer momento.")
        }}
      />

      {/* Sistema de Feedback - Fase 4 */}
      <PDVFeedback
        open={showFeedbackDialog}
        onOpenChange={setShowFeedbackDialog}
      />

      {/* Modal de Troco */}
      <ChangeDialog
        open={showChangeDialog}
        onOpenChange={(open) => {
          setShowChangeDialog(open)
          // Se fechar sem confirmar, marcar como respondido para evitar loop
          if (!open && !changeDialogAnswered) {
            setChangeDialogAnswered(true)
          }
        }}
        orderTotal={orderTotal}
        onConfirm={(needsChange, receivedAmount) => {
          setNeedsChange(needsChange)
          setReceivedAmount(receivedAmount || null)
          setChangeDialogAnswered(true) // Marcar como respondido
          if (needsChange && receivedAmount) {
            const change = receivedAmount - orderTotal
            toast.success(
              `Troco calculado: ${change.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}`
            )
          }
        }}
      />

      {/* Modal de Confirmação de Pagamento */}
      <PaymentConfirmationDialog
        open={showPaymentConfirmation}
        onOpenChange={setShowPaymentConfirmation}
        orderTotal={orderTotal}
        payments={preparePaymentDataForConfirmation()}
        formatCurrency={formatCurrency}
        onConfirm={confirmFinalizeOrder}
        isLoading={submittingOrder}
        orderId={editingOrder?.identify || editingOrder?.id || currentOrder?.identify || currentOrder?.id}
      />
    </PDVMainLayout>
  )
}

