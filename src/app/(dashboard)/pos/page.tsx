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
  useMutation,
} from "@/hooks/use-authenticated-api"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/usePermissions"
import { endpoints, apiClient } from "@/lib/api-client"
import { toast } from "sonner"
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
} from "lucide-react"
import { maskPhone, maskZipCode } from "@/lib/masks"
import { PixQrCodeDialog } from "./components/pix-qr-code-dialog"
import { ProductRecommendations } from "./components/product-recommendations"
import { PDVTutorial } from "./components/pdv-tutorial"
import { PDVFeedback } from "./components/pdv-feedback"

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
}

type Table = {
  uuid?: string
  identify?: string
  name: string
}

type PaymentMethod = {
  uuid: string
  name: string
  description?: string | null
}

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

function extractCollection<T>(raw: any): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

function parsePrice(value?: number | string | null): number {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

function getProductPrice(product: Product): number {
  const base = product.promotional_price ?? product.price
  return parsePrice(base)
}

function getProductId(product: Product): string {
  return product.uuid || product.identify || product.name
}

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

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
function PDVQuickDashboard({ todayOrders }: { todayOrders: any[] }) {
  const stats = useMemo(() => {
    const totalSales = todayOrders.reduce((sum, order: any) => sum + parsePrice(order.total || 0), 0)
    const totalOrders = todayOrders.length
    const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0
    
    // Contar mesas ocupadas
    const occupiedTables = new Set()
    todayOrders.forEach((order: any) => {
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
    <Card className="border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
          <BarChart className="h-5 w-5" />
          Dashboard - Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Vendas</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(stats.totalSales)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Pedidos</p>
            <p className="text-xl font-bold text-primary">{stats.totalOrders}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Ticket Médio</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(stats.averageTicket)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Mesas Ocupadas</p>
            <p className="text-xl font-bold text-primary">{stats.occupiedTables}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Componente de histórico de pedidos do cliente
function ClientOrderHistory({ clientId, onLoadOrder }: { clientId: string; onLoadOrder: (orderId: string) => void }) {
  const [history, setHistory] = useState<any[]>([])
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
          let orders: any[] = []
          
          if (Array.isArray(response.data)) {
            orders = response.data
          } else if (response.data && typeof response.data === 'object') {
            // Se for um objeto com propriedade data (Laravel Resource Collection)
            if (Array.isArray((response.data as any).data)) {
              orders = (response.data as any).data
            } else if (Array.isArray((response.data as any).items)) {
              orders = (response.data as any).items
            }
          }
          
          // Filtrar pedidos do cliente específico
          const clientOrders = orders.filter((order: any) => {
            const orderClientId = order.client_id || order.client?.uuid || order.client?.identify || order.client?.id
            return orderClientId === clientId
          })
          
          // Limitar a 5 pedidos mais recentes
          setHistory(clientOrders.slice(0, 5))
        } else {
          setHistory([])
        }
      } catch (error: any) {
        // Log mais detalhado do erro apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.error("Erro ao buscar histórico do cliente:", {
            message: error?.message || 'Erro desconhecido',
            status: error?.status,
            clientId,
            error: error instanceof Error ? error.message : String(error)
          })
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
        {history.map((order: any) => {
          const orderId = order.identify || order.uuid || order.id
          const orderTotal = parsePrice(order.total || 0)
          const orderDate = order.created_at 
            ? new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
            : '--'
          return (
            <button
              key={orderId}
              onClick={() => onLoadOrder(orderId)}
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
  const { mutate: mutateOrder, loading: submittingOrder } = useMutation()

  // ============================================
  // ESTADOS LOCAIS (todos os useState juntos)
  // ============================================
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")
  const [isDelivery, setIsDelivery] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
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
  const [orderSearchQuery, setOrderSearchQuery] = useState("")
  const [orderSearchResults, setOrderSearchResults] = useState<any[]>([])
  const [orderSearchLoading, setOrderSearchLoading] = useState(false)
  const [editingOrder, setEditingOrder] = useState<any | null>(null)
  const [editOrderSheetOpen, setEditOrderSheetOpen] = useState(false)
  const [editOrderCart, setEditOrderCart] = useState<CartItem[]>([])
  const [editOrderNotes, setEditOrderNotes] = useState("")
  const [addingItem, setAddingItem] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const [showCategories, setShowCategories] = useState(true)
  const [showProducts, setShowProducts] = useState(true)
  const [showCart, setShowCart] = useState(true)
  const orderSearchRef = useRef<HTMLDivElement>(null)
  
  // Hook que depende de estado (deve ser chamado DEPOIS de todos os useState)
  const {
    data: tableOrdersData,
    loading: tableOrdersLoading,
    error: tableOrdersError,
    refetch: refetchTableOrders,
  } = useAuthenticatedOrdersByTable(selectedTable)

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
  const paymentMethods = useMemo<PaymentMethod[]>(() => extractCollection(paymentData), [paymentData])
  const clients = useMemo<Client[]>(() => extractCollection(clientsData), [clientsData])
  const todayOrders = useMemo<any[]>(() => extractCollection(todayOrdersData), [todayOrdersData])
  
  // Identificar mesas com pedidos em aberto
  const tablesWithOpenOrders = useMemo(() => {
    const occupiedTables = new Set<string>()
    todayOrders.forEach((order: any) => {
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
  
  // Verificar se a mesa selecionada está ocupada por outro pedido (não o que está sendo editado)
  const isTableOccupiedByOtherOrder = useMemo(() => {
    if (!selectedTable || !tablesWithOpenOrders.has(selectedTable)) {
      return false
    }
    
    // Se não estiver editando, a mesa está ocupada
    if (!editingOrder) {
      return true
    }
    
    // Se estiver editando, verificar se o pedido sendo editado pertence a esta mesa
    const editingOrderTableKey = editingOrder.table?.uuid || editingOrder.table?.identify || editingOrder.table?.name
    const currentTableKey = selectedTable
    
    // Se o pedido sendo editado pertence a esta mesa, não está ocupada por outro pedido
    return editingOrderTableKey !== currentTableKey
  }, [selectedTable, tablesWithOpenOrders, editingOrder])

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
    if (!isDelivery && !selectedTable && tables.length > 0) {
      const first = tables[0]
      setSelectedTable(first.uuid || first.identify || first.name)
    }
  }, [tables, selectedTable, isDelivery])

  useEffect(() => {
    if (!selectedPaymentMethod && paymentMethods.length > 0) {
      setSelectedPaymentMethod(paymentMethods[0].uuid)
    }
  }, [paymentMethods, selectedPaymentMethod])

  // Fechar dropdown de pesquisa ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (orderSearchRef.current && !orderSearchRef.current.contains(event.target as Node)) {
        setOrderSearchResults([])
      }
    }

    if (orderSearchResults.length > 0) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [orderSearchResults])

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
      return
    }

    const client = clients.find(
      (item) => (item.uuid || item.identify || item.name) === value
    )

    if (client) {
      setCustomerName(client.name || "")
      setCustomerPhone(client.phone || "")
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
        const key = cat.uuid || cat.identify || cat.name
        if (!map[key]) {
          map[key] = []
        }
        map[key].push(product)
      })
    })
    return map
  }, [products])

  const visibleProducts = useMemo(() => {
    if (!selectedCategory) return []
    const categoryProducts = groupedProducts[selectedCategory] || []
    
    // Ordenar produtos por relevância:
    // 1. Produtos com promoção primeiro
    // 2. Depois produtos sem promoção
    // 3. Ordenar alfabeticamente dentro de cada grupo
    return categoryProducts.sort((a, b) => {
      const aHasPromo = !!a.promotional_price && parsePrice(a.promotional_price) < parsePrice(a.price)
      const bHasPromo = !!b.promotional_price && parsePrice(b.promotional_price) < parsePrice(b.price)
      
      // Promoções primeiro
      if (aHasPromo !== bHasPromo) {
        return bHasPromo ? 1 : -1
      }
      
      // Depois alfabético
      return a.name.localeCompare(b.name)
    })
  }, [groupedProducts, selectedCategory])

  const orderTotal = useMemo(
    () => cart.reduce((sum, item) => sum + getCartItemUnitPrice(item) * item.quantity, 0),
    [cart]
  )

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
              // Scroll para seção de pedidos da mesa
              const orderSection = document.getElementById('table-orders')
              if (orderSection) {
                orderSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
              }
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
    
    // Alerta: Mesa não selecionada em retirada
    if (!isDelivery && !selectedTable && cart.length > 0) {
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
      const firstVariation = product.variations?.[0]
      const variationId = firstVariation
        ? firstVariation.id || firstVariation.identify || firstVariation.name
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
      variationData = selectionProduct.variations.find(
        (variation) =>
          (variation.id || variation.identify || variation.name) === selectionVariationId
      )
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
    // Feedback visual
    setAddingItem(signature)
    setTimeout(() => setAddingItem(null), 300)
    
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
    // Feedback visual
    setRemovingItem(signature)
    setTimeout(() => {
      setCart((prev) => prev.filter((item) => item.signature !== signature))
      setRemovingItem(null)
      toast.info("Item removido do pedido")
    }, 300)
  }

  const clearCart = () => {
    setCart([])
    setOrderNotes("")
  }

  // Buscar pedidos por número
  const handleOrderSearch = async (query: string) => {
    if (!query || query.length < 2) {
      setOrderSearchResults([])
      return
    }

    setOrderSearchLoading(true)
    try {
      const response = await apiClient.get(endpoints.orders.searchByNumber + `?query=${encodeURIComponent(query)}`)
      if (response.success && response.data) {
        setOrderSearchResults(Array.isArray(response.data) ? response.data : [])
      } else {
        setOrderSearchResults([])
      }
    } catch (error) {
      console.error("Erro ao buscar pedidos:", error)
      setOrderSearchResults([])
    } finally {
      setOrderSearchLoading(false)
    }
  }

  // Carregar pedido no PDV para edição direta
  const loadOrderInPDV = async (orderIdentify: string) => {
    try {
      const response = await apiClient.get(endpoints.orders.show(orderIdentify))
      if (response.success && response.data) {
        const order: any = response.data
        
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
          setSelectedClientId(clientId || "")
          setCustomerName(order.client.name || "")
          setCustomerPhone(order.client.phone || "")
        }
        
        // Configurar método de pagamento se houver
        if (order.payment_method_id || order.paymentMethod?.uuid) {
          const paymentId = order.payment_method_id || order.paymentMethod?.uuid
          setSelectedPaymentMethod(paymentId)
        }
        
        // Armazenar pedido para edição
        setEditingOrder(order)
        
        // Limpar busca
        setOrderSearchQuery("")
        setOrderSearchResults([])
        
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
        const order: any = response.data
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
        setOrderSearchQuery("")
        setOrderSearchResults([])
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

      const result = await mutateOrder(endpoints.orders.update(orderIdentify), "PUT", payload)
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

  const handleZipChange = (value: string) => {
    const masked = maskZipCode(value)
    setDeliveryAddress((prev) => ({ ...prev, zip: masked }))
  }

  const handleFinalizeOrder = async () => {
    if (!cart.length) {
      toast.error("Adicione pelo menos um item ao pedido.")
      return
    }

    if (!selectedPaymentMethod) {
      toast.error("Selecione uma forma de pagamento.")
      return
    }

    if (!isDelivery && !selectedTable) {
      toast.error("Selecione uma mesa para o pedido.")
      return
    }

    // Verificar se a mesa selecionada tem pedidos em aberto de outro pedido
    if (!isDelivery && isTableOccupiedByOtherOrder) {
      toast.error("Esta mesa possui pedidos em aberto. Finalize os pedidos antes de adicionar novos.")
      return
    }
    
    // Se estiver editando um pedido existente, atualizar ao invés de criar
    if (editingOrder) {
      return handleSaveOrderEdit()
    }

    const tenantToken = user?.tenant?.uuid || user?.tenant_id
    if (!tenantToken) {
      toast.error("Não foi possível identificar a empresa. Faça login novamente.")
      return
    }

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
      payment_method_id: selectedPaymentMethod,
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
    }

    try {
      const result: any = await mutateOrder(endpoints.orders.create, "POST", payload)
      if (result) {
        const orderId = result?.identify || result?.uuid || result?.id || ""
        
        // Verificar se o método de pagamento é PIX
        const paymentMethod = paymentMethods.find(m => m.uuid === selectedPaymentMethod)
        const isPixPayment = paymentMethod?.name?.toLowerCase().includes('pix') || false
        
        if (isPixPayment) {
          // Abrir dialog de QR Code PIX
          // TODO: Buscar QR Code real da API quando disponível
          // Por enquanto, usar dados mockados
          setPixOrderData({
            orderId,
            total: orderTotal,
            qrCode: undefined, // Será preenchido quando a API retornar
            qrCodeText: undefined, // Será preenchido quando a API retornar
          })
          setShowPixDialog(true)
        } else {
          toast.success("Pedido enviado com sucesso!")
        }
        
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
        
        // Recarregar pedidos da mesa se houver uma mesa selecionada
        if (selectedTable && !isDelivery) {
          refetchTableOrders()
        }
        
        // Recarregar lista de pedidos do dia
        refetchTodayOrders()
      }
    } catch (error: any) {
      toast.error(error?.message || "Erro ao finalizar pedido")
    }
  }

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N: Novo pedido
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
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
        setOrderNotes("")
        toast.success("Novo pedido iniciado")
      }
      
      // Ctrl/Cmd + F: Focar busca
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        const searchInput = document.querySelector('[data-search-input]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }
      
      // Ctrl/Cmd + Enter: Finalizar pedido (se tiver itens)
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (cart.length > 0 && !submittingOrder) {
          handleFinalizeOrder()
        }
      }
      
      // Escape: Fechar modais
      if (e.key === 'Escape') {
        setSelectionDialogOpen(false)
        setOrderSearchQuery("")
        setOrderSearchResults([])
      }
      
      // Números 1-9: Selecionar categoria rápida
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
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
  }, [cart.length, submittingOrder, categories, handleFinalizeOrder, clearCart, setSelectedCategory, setSelectionDialogOpen, setOrderSearchQuery, setOrderSearchResults, setEditingOrder, setCustomerName, setCustomerPhone, setDeliveryAddress, setSelectedClientId, setSelectedPaymentMethod, setSelectedTable, setIsDelivery, setOrderNotes])

  if (!isAuthenticated && !authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Card className="max-w-md">
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
    clientsLoading

  if (isLoadingData) {
    return (
      <PageLoading
        isLoading
        message="Carregando PDV..."
      />
    )
  }

  if (categoriesError || productsError || tablesError || paymentError || clientsError) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <h2 className="text-xl font-semibold text-destructive">Erro ao carregar o PDV</h2>
        <p className="text-muted-foreground">
          {categoriesError || productsError || tablesError || paymentError || clientsError}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Alertas contextuais */}
      {contextualAlerts.length > 0 && (
        <div className="space-y-2">
          {contextualAlerts.map((alert, index) => (
            <div
              key={index}
              className={cn(
                "rounded-xl border p-4 flex items-center justify-between gap-3",
                alert.type === 'error' && "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20",
                alert.type === 'warning' && "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20",
                alert.type === 'info' && "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20"
              )}
            >
              <div className="flex items-center gap-2 flex-1">
                {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                {alert.type === 'info' && <Bell className="h-5 w-5 text-blue-600" />}
                <p className={cn(
                  "text-sm font-medium",
                  alert.type === 'error' && "text-red-900 dark:text-red-100",
                  alert.type === 'warning' && "text-yellow-900 dark:text-yellow-100",
                  alert.type === 'info' && "text-blue-900 dark:text-blue-100"
                )}>
                  {alert.message}
                </p>
              </div>
              {alert.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={alert.action.onClick}
                  className="h-8"
                >
                  {alert.action.label}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Dashboard Rápido - Fase 3 */}
      {pdvPermissions.canViewReports && (
        <PDVQuickDashboard todayOrders={todayOrders} />
      )}
      
      <header className="rounded-3xl border bg-card p-4 shadow-sm lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ponto de Venda</p>
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">PDV - Tahan</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Campo de pesquisa de pedido */}
            <div ref={orderSearchRef} className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar pedido... (Ctrl+F)"
                value={orderSearchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setOrderSearchQuery(value)
                  handleOrderSearch(value)
                }}
                className="h-12 pl-10 pr-10 text-base"
                data-search-input
              />
              {orderSearchLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {orderSearchQuery && !orderSearchLoading && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                  onClick={() => {
                    setOrderSearchQuery("")
                    setOrderSearchResults([])
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              
              {/* Dropdown de resultados */}
              {orderSearchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto rounded-lg border bg-card shadow-lg">
                  {orderSearchResults.map((order: any) => {
                    const orderId = order.identify || order.uuid || order.id
                    const orderTotal = parsePrice(order.total)
                    const orderStatus = order.status || 'Pendente'
                    return (
                      <button
                        key={orderId}
                        onClick={() => loadOrderInPDV(orderId)}
                        className="flex w-full items-center justify-between gap-3 border-b p-3 text-left hover:bg-muted/50 last:border-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold">Pedido #{order.identify || order.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {orderStatus} • {formatCurrency(orderTotal)}
                          </p>
                          {order.client && (
                            <p className="text-xs text-muted-foreground">
                              Cliente: {order.client.name}
                            </p>
                          )}
                        </div>
                        <Edit className="h-4 w-4 text-primary" />
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="flex gap-2 flex-wrap items-center">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Total de itens: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-base">
                <Utensils className="h-4 w-4" />
                {selectedTableName || (isDelivery ? "Delivery" : "Selecione uma mesa")}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFeedbackDialog(true)}
                className="h-10 w-10"
                title="Enviar feedback"
              >
                <MessageSquare className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className={cn("grid gap-6", "lg:grid-cols-[2fr,1fr,320px]")}>
        <section className="space-y-6">
          <Card id="categories-section" className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Categorias</CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">Selecione uma categoria para ver os produtos.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCategories(!showCategories)}
                  className="h-8 w-8 text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100"
                  title={showCategories ? "Ocultar categorias" : "Exibir categorias"}
                >
                  {showCategories ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showCategories && (
              <CardContent>
              <div
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
                data-testid="touch-grid-categories"
              >
                {categories.map((category) => {
                  const key = category.uuid || category.identify || category.name
                  const active = selectedCategory === key
                  return (
                    <Button
                      key={key}
                      data-testid={`touch-category-${key}`}
                      onClick={() => setSelectedCategory(key)}
                      className={cn(
                        "h-20 rounded-2xl text-lg",
                        active
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-muted text-foreground hover:bg-primary/10"
                      )}
                    >
                      {category.name}
                    </Button>
                  )
                })}
              </div>
              </CardContent>
            )}
          </Card>

          <Card id="products-section" className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-green-900 dark:text-green-100">Produtos</CardTitle>
                  <CardDescription className="text-green-700 dark:text-green-300">Toque em um item para adicioná-lo ao pedido.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProducts(!showProducts)}
                  className="h-8 w-8 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
                  title={showProducts ? "Ocultar produtos" : "Exibir produtos"}
                >
                  {showProducts ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showProducts && (
              <CardContent>
              {visibleProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                  Nenhum produto nesta categoria.
                </div>
              ) : (
                <ScrollArea className="max-h-[70vh]" type="always">
                  <div
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    data-testid="touch-grid-products"
                  >
                    {visibleProducts.map((product) => {
                      const price = getProductPrice(product)
                      return (
                        <button
                          key={getProductId(product)}
                          data-testid={`touch-product-${getProductId(product)}`}
                          onClick={() => startProductSelection(product)}
                          className="flex h-40 flex-col rounded-2xl border bg-card text-left shadow-sm transition hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <div className="relative h-24 w-full overflow-hidden rounded-t-2xl bg-muted">
                            {product.image_url || product.image ? (
                              <Image
                                src={product.image_url || product.image || ""}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <NotebookPen className="h-6 w-6" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-1 p-3">
                            <p className="text-base font-semibold leading-tight line-clamp-2">
                              {product.name}
                            </p>
                            <p className="text-lg font-bold text-primary">
                              {formatCurrency(price)}
                            </p>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
              </CardContent>
            )}
          </Card>

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

        <aside id="order-summary">
          <Card className="sticky top-4 space-y-0 border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl text-orange-900 dark:text-orange-100">Carrinho</CardTitle>
                  <CardDescription className="text-orange-700 dark:text-orange-300">Gerencie os itens e finalize o pedido.</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCart(!showCart)}
                  className="h-8 w-8 text-orange-700 dark:text-orange-300 hover:text-orange-900 dark:hover:text-orange-100"
                  title={showCart ? "Ocultar carrinho" : "Exibir carrinho"}
                >
                  {showCart ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showCart && (
              <CardContent className="space-y-5">
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setIsDelivery(false)
                    // Força a seleção da primeira mesa quando retirar no local
                    if (tables.length > 0 && !selectedTable) {
                      const firstTable = tables[0]
                      setSelectedTable(firstTable.uuid || firstTable.identify || firstTable.name)
                    }
                  }}
                  variant={!isDelivery ? "default" : "outline"}
                  className={cn(
                    "w-full rounded-2xl py-6 text-lg",
                    !isDelivery && "bg-primary text-primary-foreground shadow-lg"
                  )}
                >
                  Retirada no local
                </Button>
                <Button
                  onClick={() => {
                    setIsDelivery(true)
                    setSelectedTable(null)
                  }}
                  variant={isDelivery ? "default" : "outline"}
                  className={cn(
                    "w-full rounded-2xl py-6 text-lg",
                    isDelivery && "bg-primary text-primary-foreground shadow-lg"
                  )}
                >
                  Delivery
                </Button>
              </div>

              {!isDelivery && (
                <div id="table-section" className="space-y-3">
                  <p className="text-sm font-medium">Selecione a mesa</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {/* Ordenar mesas: ocupadas primeiro, depois vazias */}
                    {(() => {
                      const occupiedTables: Table[] = []
                      const emptyTables: Table[] = []
                      
                      tables.forEach((table) => {
                        const key = table.uuid || table.identify || table.name
                        if (tablesWithOpenOrders.has(key)) {
                          occupiedTables.push(table)
                        } else {
                          emptyTables.push(table)
                        }
                      })
                      
                      return [...occupiedTables, ...emptyTables]
                    })().map((table) => {
                      const key = table.uuid || table.identify || table.name
                      const active = selectedTable === key
                      const hasOpenOrders = tablesWithOpenOrders.has(key)
                      
                      // Verificar se esta mesa está ocupada por outro pedido (não o que está sendo editado)
                      const isOccupiedByOther = hasOpenOrders && (
                        !editingOrder || 
                        (editingOrder.table?.uuid !== key && editingOrder.table?.identify !== key && editingOrder.table?.name !== key)
                      )
                      
                      return (
                        <Button
                          key={key}
                          data-testid={`table-button-${key}`}
                          onClick={() => {
                            // Permitir seleção mesmo se ocupada quando estiver editando o pedido desta mesa
                            if (isOccupiedByOther && !editingOrder) {
                              toast.error("Esta mesa possui pedidos em aberto. Finalize os pedidos antes de criar novos.")
                              return
                            }
                            setSelectedTable(key)
                          }}
                          className={cn(
                            "h-16 rounded-2xl text-lg transition-all",
                            active
                              ? isOccupiedByOther
                                ? "bg-red-600 text-white border-2 border-red-700 shadow-lg dark:bg-red-700 dark:border-red-800"
                                : "bg-primary text-primary-foreground shadow-lg"
                              : isOccupiedByOther
                              ? "bg-red-100 text-red-900 border-2 border-red-300 dark:bg-red-950/50 dark:text-red-100 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-950/70"
                              : "bg-muted text-foreground hover:bg-primary/10"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {table.name}
                            {isOccupiedByOther && (
                              <Badge 
                                variant={active ? "secondary" : "destructive"} 
                                className={cn(
                                  "text-xs",
                                  active && "bg-white/20 text-white border-white/30"
                                )}
                              >
                                Ocupada
                              </Badge>
                            )}
                          </div>
                        </Button>
                      )
                    })}
                  </div>

                  {/* Aviso se mesa tem pedidos em aberto (apenas se não estiver editando o pedido desta mesa) */}
                  {selectedTable && isTableOccupiedByOtherOrder && (
                    <div className="mt-4 rounded-2xl border-2 border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/30">
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/50">
                          <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                            Mesa Ocupada
                          </p>
                          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                            Esta mesa possui pedidos em aberto. Finalize os pedidos existentes antes de criar novos.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pedidos em aberto da mesa */}
                  {selectedTable && (
                    <div className="mt-4 space-y-3 rounded-2xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-800 dark:bg-blue-950/10">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                          Pedidos em aberto
                        </p>
                        {tableOrdersLoading && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                      </div>
                      {tableOrdersError ? (
                        <p className="text-xs text-destructive">{tableOrdersError}</p>
                      ) : (
                        <div className="space-y-2">
                          {tableOrdersData && Array.isArray(tableOrdersData) && tableOrdersData.length > 0 ? (
                            tableOrdersData.map((order: any, index: number) => {
                              const orderId = order.identify || order.uuid || order.id
                              const orderTotal = parsePrice(order.total)
                              const orderStatus = order.status || order.order_status?.name || 'Pendente'
                              const orderProducts = order.products || []
                              const totalItems = orderProducts.reduce((sum: number, p: any) => sum + (p.pivot?.qty || p.quantity || 0), 0)
                              
                              return (
                                <div
                                  key={orderId || `order-${index}`}
                                  className="rounded-xl border border-blue-200 bg-white p-3 dark:border-blue-800 dark:bg-gray-900"
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold">Pedido #{order.identify || order.id}</p>
                                        <Badge variant="outline" className="text-xs">
                                          {orderStatus}
                                        </Badge>
                                      </div>
                                      <p className="mt-1 text-xs text-muted-foreground">
                                        {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                                      </p>
                                      {order.client && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                          Cliente: {order.client.name}
                                        </p>
                                      )}
                                      <p className="mt-1 text-sm font-bold text-primary">
                                        {formatCurrency(orderTotal)}
                                      </p>
                                    </div>
                                  </div>
                                  {orderProducts.length > 0 && (
                                    <div className="mt-2 space-y-1 border-t pt-2">
                                      {orderProducts.slice(0, 3).map((product: any, idx: number) => {
                                        const qty = product.pivot?.qty || product.quantity || 0
                                        const price = parsePrice(product.pivot?.price || product.price)
                                        return (
                                          <div key={idx} className="flex items-center justify-between text-xs">
                                            <span className="text-muted-foreground">
                                              {qty}x {product.name}
                                            </span>
                                            <span className="font-medium">
                                              {formatCurrency(price * qty)}
                                            </span>
                                          </div>
                                        )
                                      })}
                                      {orderProducts.length > 3 && (
                                        <p className="text-xs text-muted-foreground">
                                          +{orderProducts.length - 3} {orderProducts.length - 3 === 1 ? 'item' : 'itens'}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            })
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-2">
                              Nenhum pedido em aberto para esta mesa
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isDelivery && (
                <div className="space-y-3 rounded-2xl border p-4">
                  <p className="text-sm font-medium">Endereço de entrega</p>
                  <div className="grid gap-3">
                    <Input
                      placeholder="CEP"
                      value={deliveryAddress.zip}
                      onChange={(event) => handleZipChange(event.target.value)}
                      className="h-12 text-lg"
                    />
                    <Input
                      placeholder="Endereço"
                      value={deliveryAddress.address}
                      onChange={(event) =>
                        setDeliveryAddress((prev) => ({ ...prev, address: event.target.value }))
                      }
                      className="h-12 text-lg"
                    />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Número"
                        value={deliveryAddress.number}
                        onChange={(event) =>
                          setDeliveryAddress((prev) => ({ ...prev, number: event.target.value }))
                        }
                        className="h-12 text-lg"
                      />
                      <Input
                        placeholder="Bairro"
                        value={deliveryAddress.neighborhood}
                        onChange={(event) =>
                          setDeliveryAddress((prev) => ({
                            ...prev,
                            neighborhood: event.target.value,
                          }))
                        }
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Cidade"
                        value={deliveryAddress.city}
                        onChange={(event) =>
                          setDeliveryAddress((prev) => ({ ...prev, city: event.target.value }))
                        }
                        className="h-12 text-lg"
                      />
                      <Input
                        placeholder="UF"
                        value={deliveryAddress.state}
                        maxLength={2}
                        onChange={(event) =>
                          setDeliveryAddress((prev) => ({
                            ...prev,
                            state: event.target.value.toUpperCase(),
                          }))
                        }
                        className="h-12 text-lg"
                      />
                    </div>
                    <Input
                      placeholder="Complemento"
                      value={deliveryAddress.complement}
                      onChange={(event) =>
                        setDeliveryAddress((prev) => ({ ...prev, complement: event.target.value }))
                      }
                      className="h-12 text-lg"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium">Cliente (opcional)</p>
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
                      }
                      setCustomerName(event.target.value)
                    }}
                    className="h-12 text-lg"
                    list="client-names"
                  />
                  {/* Auto-complete para nomes de clientes */}
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
                      }
                      setCustomerPhone(maskPhone(event.target.value))
                    }}
                    className="h-12 text-lg"
                  />
                </div>
                
                {/* Histórico rápido de pedidos do cliente selecionado */}
                {selectedClientId && (
                  <ClientOrderHistory clientId={selectedClientId} onLoadOrder={loadOrderInPDV} />
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Itens selecionados</p>
                {cart.length === 0 ? (
                  <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
                    Nenhum item no pedido.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => {
                      const productId = getProductId(item.product)
                      const unitPrice = getCartItemUnitPrice(item)
                      const isAdding = addingItem === item.signature
                      const isRemoving = removingItem === item.signature
                      return (
                        <div
                          key={item.signature}
                          data-testid={`cart-item-${item.signature}`}
                          className={cn(
                            "rounded-2xl border p-4 transition-all",
                            isAdding && "border-green-500 bg-green-50/50 scale-105",
                            isRemoving && "border-red-500 bg-red-50/50 opacity-50 scale-95"
                          )}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(unitPrice)} cada
                              </p>
                              {item.selectedVariation && (
                                <Badge variant="outline" className="mt-2 text-xs">
                                  {item.selectedVariation.name}
                                </Badge>
                              )}
                              {item.selectedOptionals && item.selectedOptionals.length > 0 && (
                                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                                  {item.selectedOptionals.map((optional, optionalIndex) => {
                                    const optionalKey =
                                      optional.id ||
                                      optional.identify ||
                                      optional.name ||
                                      `optional-${optionalIndex}`
                                    return (
                                      <div
                                        key={`${item.signature}-${optionalKey}-${optionalIndex}`}
                                        className="flex items-center justify-between gap-3"
                                      >
                                        <span>
                                          {optional.name} × {optional.quantity}
                                        </span>
                                        <span>
                                          {formatCurrency(
                                            parsePrice(optional.price) * optional.quantity
                                          )}
                                        </span>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remover ${item.product.name}`}
                              onClick={() => removeItem(item.signature)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-14 w-14 rounded-2xl"
                              aria-label={`Diminuir ${item.product.name}`}
                              onClick={() => updateItemQuantity(item.signature, -1)}
                            >
                              <Minus className="h-6 w-6" />
                            </Button>
                            <span
                              data-testid={`cart-item-qty-${item.signature}`}
                              className="min-w-[64px] rounded-2xl bg-muted px-4 py-3 text-center text-xl font-semibold"
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-14 w-14 rounded-2xl"
                              aria-label={`Aumentar ${item.product.name}`}
                              onClick={() => updateItemQuantity(item.signature, 1)}
                            >
                              <Plus className="h-6 w-6" />
                            </Button>
                            <span className="ml-auto text-xl font-semibold">
                              {formatCurrency(unitPrice * item.quantity)}
                            </span>
                          </div>
                          <div className="mt-3 space-y-2">
                            <Input
                              value={item.observation}
                              onChange={(event) => updateItemObservation(item.signature, event.target.value)}
                              placeholder="Observações (ex: sem cebola)"
                              className="h-12 rounded-2xl"
                            />
                            {/* Templates de observações rápidas */}
                            <div className="flex flex-wrap gap-2">
                              {['Sem cebola', 'Sem tomate', 'Bem passado', 'Mal passado', 'Sem pimenta', 'Extra molho'].map((template) => (
                                <Button
                                  key={template}
                                  variant="outline"
                                  size="sm"
                                  className="h-8 text-xs"
                                  onClick={() => {
                                    const currentObs = item.observation
                                    const newObs = currentObs 
                                      ? `${currentObs}, ${template}`
                                      : template
                                    updateItemObservation(item.signature, newObs)
                                  }}
                                >
                                  {template}
                                </Button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Observações do pedido</p>
                <Textarea
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder="Instruções adicionais"
                  className="min-h-[80px] rounded-2xl"
                />
              </div>

              <div id="payment-section" className="space-y-3">
                <p className="text-sm font-medium">Forma de pagamento</p>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => {
                    const active = selectedPaymentMethod === method.uuid
                    // Detectar tipo de pagamento pelo nome para mostrar ícone apropriado
                    const getPaymentIcon = (name: string) => {
                      const lowerName = name.toLowerCase()
                      if (lowerName.includes('pix') || lowerName.includes('pix')) {
                        return <Smartphone className="h-5 w-5" />
                      }
                      if (lowerName.includes('cartão') || lowerName.includes('card') || lowerName.includes('credito') || lowerName.includes('debito')) {
                        return <CreditCard className="h-5 w-5" />
                      }
                      if (lowerName.includes('dinheiro') || lowerName.includes('money') || lowerName.includes('cash')) {
                        return <Banknote className="h-5 w-5" />
                      }
                      if (lowerName.includes('contactless') || lowerName.includes('nfc') || lowerName.includes('aproximação')) {
                        return <Radio className="h-5 w-5" />
                      }
                      if (lowerName.includes('transferência') || lowerName.includes('transfer') || lowerName.includes('ted') || lowerName.includes('doc')) {
                        return <Building2 className="h-5 w-5" />
                      }
                      return <CreditCard className="h-5 w-5" />
                    }
                    
                    return (
                      <Button
                        key={method.uuid}
                        data-testid={`payment-button-${method.uuid}`}
                        onClick={() => setSelectedPaymentMethod(method.uuid)}
                        className={cn(
                          "h-16 rounded-2xl justify-start gap-3 px-4 text-left",
                          active
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-muted text-foreground hover:bg-primary/10"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getPaymentIcon(method.name)}
                          <div className="flex flex-col items-start flex-1">
                            <span className="font-semibold text-base">{method.name}</span>
                            {method.description && (
                              <span className={cn(
                                "text-xs",
                                active ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {method.description}
                              </span>
                            )}
                          </div>
                        </div>
                        {active && (
                          <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                        )}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-2xl border-2 border-purple-300 bg-purple-50 p-4 dark:border-purple-700 dark:bg-purple-950/30">
                <div className="flex items-center justify-between text-sm text-purple-700 dark:text-purple-300">
                  <span>Itens</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xl font-bold text-purple-900 dark:text-purple-100">
                  <span>Total</span>
                  <span data-testid="order-total">{formatCurrency(orderTotal)}</span>
                </div>
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
                          As alterações serão salvas ao finalizar
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

              <div className="flex flex-col gap-3">
                <Button
                  id="finalize-button"
                  data-testid="finalize-order-button"
                  onClick={handleFinalizeOrder}
                  disabled={
                    submittingOrder || 
                    !cart.length || 
                    (!isDelivery && isTableOccupiedByOtherOrder) ||
                    !pdvPermissions.canCreateOrder
                  }
                  className="h-24 rounded-2xl text-2xl font-bold bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  title={!pdvPermissions.canCreateOrder ? "Você não tem permissão para criar pedidos" : undefined}
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-3 h-6 w-6" />
                      <div className="flex flex-col items-start">
                        <span>
                          {editingOrder
                            ? "Salvar Alterações"
                            : !isDelivery && isTableOccupiedByOtherOrder
                            ? "Mesa ocupada - Finalize pedidos existentes"
                            : "Finalizar Pedido"}
                        </span>
                        {!editingOrder && cart.length > 0 && (
                          <span className="text-sm font-normal opacity-90">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? 'item' : 'itens'} • {formatCurrency(orderTotal)}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={!cart.length}
                  className="h-16 rounded-2xl text-lg"
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  Limpar carrinho
                </Button>
              </div>
              </CardContent>
            )}
          </Card>
        </aside>

        {/* Sidebar de Pedidos do Dia */}
        <aside className="hidden lg:block">
          <Card className="sticky top-6 border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20 h-[calc(100vh-8rem)] flex flex-col">
            <CardHeader className="pb-4 border-b">
              <CardTitle className="text-xl text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pedidos de Hoje
              </CardTitle>
              <CardDescription className="text-indigo-700 dark:text-indigo-300">
                {todayOrdersLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  `${todayOrders.length} ${todayOrders.length === 1 ? 'pedido' : 'pedidos'}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              {todayOrdersError ? (
                <div className="p-4 text-center text-sm text-destructive">
                  Erro ao carregar pedidos
                </div>
              ) : todayOrdersLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : todayOrders.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum pedido hoje
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="grid grid-cols-2 gap-2">
                      {todayOrders.map((order: any) => {
                        const orderId = order.identify || order.uuid || order.id
                        const orderTotal = parsePrice(order.total || 0)
                        const orderStatus = order.status || 'Pendente'
                        const orderDate = order.created_at 
                          ? new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                          : '--:--'
                        const isActive = editingOrder && (editingOrder.identify === orderId || editingOrder.uuid === orderId || editingOrder.id === order.id)
                        
                        return (
                          <button
                            key={orderId}
                            onClick={() => loadOrderInPDV(orderId)}
                            className={cn(
                              "w-full rounded-xl border p-3 text-left transition-all hover:shadow-md",
                              isActive
                                ? "border-primary bg-primary/10 shadow-md"
                                : "border-border bg-card hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                  <span className="font-bold text-sm text-foreground truncate">
                                    #{order.identify || order.id}
                                  </span>
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
                            
                            <div className="flex items-center justify-between pt-1.5 border-t mt-1">
                              <span className="text-[10px] font-medium text-muted-foreground">Total</span>
                              <span className="text-sm font-bold text-primary">
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
            </CardContent>
          </Card>
        </aside>
      </div>

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
                            placeholder="Observações (ex: sem cebola)"
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
                <Button
                  onClick={handleSaveOrderEdit}
                  disabled={submittingOrder || !editOrderCart.length}
                  className="h-16 rounded-2xl text-xl"
                >
                  {submittingOrder && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Salvar Alterações
                </Button>
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
    </div>
  )
}


