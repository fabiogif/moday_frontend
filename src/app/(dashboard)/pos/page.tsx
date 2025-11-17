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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
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
  CheckCircle2,
  Flame,
  Star,
  Tag,
  Gift,
} from "lucide-react"
import { maskPhone, maskZipCode } from "@/lib/masks"
import { ProductBadges, type BadgeType } from "@/components/pdv/product-badges"
import { PaymentMethodCard } from "@/components/pdv/payment-method-card"
import { OrderConfirmationModal } from "@/components/pdv/order-confirmation-modal"

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

export default function POSPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
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
  const { mutate: mutateOrder, loading: submittingOrder } = useMutation()

  const categories = useMemo<Category[]>(() => extractCollection(categoriesData), [categoriesData])
  const products = useMemo<Product[]>(() => extractCollection(productsData), [productsData])
  const tables = useMemo<Table[]>(() => extractCollection(tablesData), [tablesData])
  const paymentMethods = useMemo<PaymentMethod[]>(() => extractCollection(paymentData), [paymentData])
  const clients = useMemo<Client[]>(() => extractCollection(clientsData), [clientsData])

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [orderNotes, setOrderNotes] = useState("")
  const [isDelivery, setIsDelivery] = useState(false)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  
  const {
    data: tableOrdersData,
    loading: tableOrdersLoading,
    error: tableOrdersError,
    refetch: refetchTableOrders,
  } = useAuthenticatedOrdersByTable(selectedTable)
  const {
    data: todayOrdersData,
    loading: todayOrdersLoading,
    error: todayOrdersError,
    refetch: refetchTodayOrders,
  } = useAuthenticatedTodayOrders()
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
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
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
  const [cartSheetOpen, setCartSheetOpen] = useState(false)
const [editOrderCart, setEditOrderCart] = useState<CartItem[]>([])
const [editOrderNotes, setEditOrderNotes] = useState("")
const [showConfirmationModal, setShowConfirmationModal] = useState(false)
const orderSearchRef = useRef<HTMLDivElement>(null)

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

  // Categorias especiais
  const specialCategories = useMemo(() => {
    const popular = products.filter(p => {
      // Por enquanto, considerar produtos com mais de 0 vendas (pode ser melhorado com dados reais)
      // Ou produtos sem preço promocional (mais vendidos geralmente não têm desconto)
      return !p.promotional_price
    }).slice(0, 10) // Top 10
    
    const newProducts = products
      .filter(p => {
        // Produtos criados nos últimos 30 dias (se tiver created_at)
        // Por enquanto, usar todos os produtos como "novos"
        return true
      })
      .slice(0, 10)
    
    const promotions = products.filter(p => {
      const promoPrice = p.promotional_price ? parsePrice(p.promotional_price) : null
      const regularPrice = parsePrice(p.price)
      return promoPrice && promoPrice < regularPrice
    })
    
    return {
      popular,
      new: newProducts,
      promotions,
    }
  }, [products])

  const visibleProducts = useMemo(() => {
    if (!selectedCategory) return []
    
    // Categorias especiais
    if (selectedCategory === "popular") return specialCategories.popular
    if (selectedCategory === "new") return specialCategories.new
    if (selectedCategory === "promotions") return specialCategories.promotions
    
    // Categorias normais
    return groupedProducts[selectedCategory] || []
  }, [groupedProducts, selectedCategory, specialCategories])

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
    setCart((prev) => prev.filter((item) => item.signature !== signature))
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

    // Mostrar modal de confirmação antes de finalizar
    setShowConfirmationModal(true)
  }

  const handleConfirmOrder = async () => {
    setShowConfirmationModal(false)

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
      const result = await mutateOrder(endpoints.orders.create, "POST", payload)
      if (result) {
        toast.success("Pedido enviado com sucesso!")
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
                placeholder="Buscar pedido..."
                value={orderSearchQuery}
                onChange={(e) => {
                  const value = e.target.value
                  setOrderSearchQuery(value)
                  handleOrderSearch(value)
                }}
                className="h-12 pl-10 pr-10 text-base"
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
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCartSheetOpen(true)}
                className="md:hidden flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="font-semibold">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </Button>
              <Badge variant="secondary" className="hidden md:flex items-center gap-2 px-4 py-2 text-base">
                <ShoppingCart className="h-4 w-4" />
                Total de itens: {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-base">
                <Utensils className="h-4 w-4" />
                {selectedTableName || (isDelivery ? "Delivery" : "Selecione uma mesa")}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className={cn(
        "grid gap-4",
        "h-[calc(100vh-10rem)] max-h-[calc(100vh-10rem)]",
        "grid-cols-1",
        "md:grid-cols-[1fr,1fr] md:h-[calc(100vh-10rem)]",
        "lg:grid-cols-[2fr,1fr,280px] lg:h-[calc(100vh-10rem)]",
        "xl:grid-cols-[2fr,1fr,320px]"
      )}>
        <section className="flex flex-col gap-4 min-h-0 overflow-hidden">
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20 flex-shrink-0">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-base md:text-lg text-blue-900 dark:text-blue-100">Categorias</CardTitle>
              <CardDescription className="text-xs md:text-sm text-blue-700 dark:text-blue-300 hidden sm:block">Selecione uma categoria para ver os produtos.</CardDescription>
            </CardHeader>
            <CardContent className="pb-3 px-4">
              <div className="grid grid-cols-2 gap-2">
                {/* Categorias Especiais */}
                <Button
                  key="popular"
                  data-testid="touch-category-popular"
                  onClick={() => setSelectedCategory("popular")}
                  className={cn(
                    "h-16 rounded-2xl px-4 text-sm font-medium transition-all",
                    selectedCategory === "popular"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-foreground hover:bg-primary/10"
                  )}
                >
                  <Flame className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">Mais Vendidos</span>
                  {specialCategories.popular.length > 0 && (
                    <Badge variant={selectedCategory === "popular" ? "secondary" : "outline"} className="ml-2">
                      {specialCategories.popular.length}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  key="new"
                  data-testid="touch-category-new"
                  onClick={() => setSelectedCategory("new")}
                  className={cn(
                    "h-16 rounded-2xl px-4 text-sm font-medium transition-all",
                    selectedCategory === "new"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-foreground hover:bg-primary/10"
                  )}
                >
                  <Star className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">Novidades</span>
                  {specialCategories.new.length > 0 && (
                    <Badge variant={selectedCategory === "new" ? "secondary" : "outline"} className="ml-2">
                      {specialCategories.new.length}
                    </Badge>
                  )}
                </Button>
                
                <Button
                  key="promotions"
                  data-testid="touch-category-promotions"
                  onClick={() => setSelectedCategory("promotions")}
                  className={cn(
                    "h-16 rounded-2xl px-4 text-sm font-medium transition-all",
                    selectedCategory === "promotions"
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-foreground hover:bg-primary/10"
                  )}
                >
                  <Tag className="mr-2 h-4 w-4" />
                  <span className="flex-1 text-left">Promoções</span>
                  {specialCategories.promotions.length > 0 && (
                    <Badge variant={selectedCategory === "promotions" ? "secondary" : "outline"} className="ml-2">
                      {specialCategories.promotions.length}
                    </Badge>
                  )}
                </Button>
                
                {/* Categorias Normais */}
                {categories.map((category) => {
                  const key = category.uuid || category.identify || category.name
                  const active = selectedCategory === key
                  const productCount = groupedProducts[key]?.length || 0
                  return (
                    <Button
                      key={key}
                      data-testid={`touch-category-${key}`}
                      onClick={() => setSelectedCategory(key)}
                      className={cn(
                        "h-16 rounded-2xl px-4 text-sm font-medium transition-all",
                        active
                          ? "bg-primary text-primary-foreground shadow-lg"
                          : "bg-muted text-foreground hover:bg-primary/10"
                      )}
                    >
                      <span className="flex-1 text-left truncate">{category.name}</span>
                      {productCount > 0 && (
                        <Badge variant={active ? "secondary" : "outline"} className="ml-2 flex-shrink-0">
                          {productCount}
                        </Badge>
                      )}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 flex-1 min-h-0 flex flex-col overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4 flex-shrink-0">
              <CardTitle className="text-base md:text-lg text-green-900 dark:text-green-100">Produtos</CardTitle>
              <CardDescription className="text-xs md:text-sm text-green-700 dark:text-green-300 hidden sm:block">Toque em um item para adicioná-lo ao pedido.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pb-3 px-4 overflow-hidden">
              {visibleProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
                  Nenhum produto nesta categoria.
                </div>
              ) : (
                <ScrollArea className="h-full max-h-full" type="always">
                  <div
                    className="grid gap-2 sm:gap-3 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    data-testid="touch-grid-products"
                  >
                    {visibleProducts.map((product) => {
                      const price = getProductPrice(product)
                      const promotionalPrice = product.promotional_price ? parsePrice(product.promotional_price) : null
                      const hasDiscount = promotionalPrice && promotionalPrice < price
                      
                      // Detectar badges do produto (por enquanto baseado no nome, depois virá do backend)
                      const productBadges: BadgeType[] = []
                      const nameLower = product.name.toLowerCase()
                      if (nameLower.includes("vegetariano") || nameLower.includes("vegetariana")) {
                        productBadges.push("vegetarian")
                      }
                      if (nameLower.includes("vegano") || nameLower.includes("vegana")) {
                        productBadges.push("vegan")
                      }
                      if (nameLower.includes("sem glúten") || nameLower.includes("sem gluten")) {
                        productBadges.push("gluten-free")
                      }
                      if (nameLower.includes("picante") || nameLower.includes("pimenta")) {
                        productBadges.push("spicy")
                      }
                      if (hasDiscount) {
                        productBadges.push("promotion")
                      }
                      
                      return (
                        <button
                          key={getProductId(product)}
                          data-testid={`touch-product-${getProductId(product)}`}
                          onClick={() => startProductSelection(product)}
                          className="group relative flex h-44 flex-col rounded-2xl border bg-card text-left shadow-sm transition-all hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <div className="relative h-28 w-full overflow-hidden rounded-t-2xl bg-muted">
                            {product.image_url || product.image ? (
                              <Image
                                src={product.image_url || product.image || ""}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                                <NotebookPen className="h-8 w-8" />
                              </div>
                            )}
                            
                            {/* Badges no canto superior */}
                            {productBadges.length > 0 && (
                              <div className="absolute left-2 top-2 z-10">
                                <ProductBadges badges={productBadges} />
                              </div>
                            )}

                            {/* Badge de desconto */}
                            {hasDiscount && (
                              <div className="absolute right-2 top-2 z-10">
                                <Badge variant="destructive" className="text-xs">
                                  {Math.round(((price - promotionalPrice!) / price) * 100)}% OFF
                                </Badge>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-1 flex-col justify-between gap-1 p-2.5">
                            <div>
                              <p className="text-sm font-semibold leading-tight line-clamp-2">
                                {product.name}
                              </p>
                              {product.description && (
                                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="flex flex-col">
                                {hasDiscount ? (
                                  <>
                                    <span className="text-base font-bold text-primary">
                                      {formatCurrency(promotionalPrice!)}
                                    </span>
                                    <span className="text-xs text-muted-foreground line-through">
                                      {formatCurrency(price)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-base font-bold text-primary">
                                    {formatCurrency(price)}
                                  </span>
                                )}
                              </div>
                              <Button
                                size="icon"
                                className="h-9 w-9 rounded-xl"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startProductSelection(product)
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </section>

        <aside id="order-summary" className="hidden md:flex flex-col min-h-0 overflow-hidden">
          <Card className="flex flex-col h-full max-h-full border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20 overflow-hidden">
            <CardHeader className="space-y-1 flex-shrink-0 pb-2 px-4 pt-4">
              <CardTitle className="text-base md:text-lg text-orange-900 dark:text-orange-100">Carrinho</CardTitle>
              <CardDescription className="text-xs md:text-sm text-orange-700 dark:text-orange-300 hidden sm:block">Gerencie os itens e finalize o pedido.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 flex flex-col overflow-hidden px-4">
              <ScrollArea className="flex-1 min-h-0 max-h-full">
                <div className="space-y-3 pr-3">
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
                        "w-full rounded-2xl py-5 text-base",
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
                        "w-full rounded-2xl py-5 text-base",
                        isDelivery && "bg-primary text-primary-foreground shadow-lg"
                      )}
                    >
                      Delivery
                    </Button>
                  </div>

                {!isDelivery && (
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Selecione a mesa</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                    {tables.map((table) => {
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
                    placeholder="Selecione um cliente..."
                    searchPlaceholder="Buscar cliente..."
                    emptyText="Nenhum cliente encontrado"
                    allowClear
                    className="h-12 rounded-2xl text-lg"
                  />
                )}
                <div className="space-y-2">
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
                  />
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
                      return (
                        <div
                          key={item.signature}
                          data-testid={`cart-item-${item.signature}`}
                          className="rounded-2xl border p-4"
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
                              className="h-12 w-12 rounded-2xl"
                              aria-label={`Diminuir ${item.product.name}`}
                              onClick={() => updateItemQuantity(item.signature, -1)}
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                            <span
                              data-testid={`cart-item-qty-${item.signature}`}
                              className="min-w-[56px] rounded-2xl bg-muted px-4 py-2 text-center text-lg font-semibold"
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 rounded-2xl"
                              aria-label={`Aumentar ${item.product.name}`}
                              onClick={() => updateItemQuantity(item.signature, 1)}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                            <span className="ml-auto text-lg font-semibold">
                              {formatCurrency(unitPrice * item.quantity)}
                            </span>
                          </div>
                          <Input
                            value={item.observation}
                            onChange={(event) => updateItemObservation(item.signature, event.target.value)}
                            placeholder="Observações (ex: sem cebola)"
                            className="mt-3 h-11 rounded-2xl"
                          />
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
                  className="min-h-[60px] rounded-2xl"
                />
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium">Forma de pagamento</p>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.uuid}
                      method={{
                        uuid: method.uuid,
                        name: method.name,
                        description: method.description || undefined,
                        recommended: method.name.toLowerCase().includes("pix"),
                      }}
                      selected={selectedPaymentMethod === method.uuid}
                      onSelect={setSelectedPaymentMethod}
                    />
                  ))}
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
                </div>
              </ScrollArea>
              
              <div className="flex flex-col gap-2 flex-shrink-0 pt-3 border-t mt-3">
                <Button
                  data-testid="finalize-order-button"
                  onClick={handleFinalizeOrder}
                  disabled={
                    submittingOrder || 
                    !cart.length || 
                    (!isDelivery && isTableOccupiedByOtherOrder)
                  }
                  className="h-16 rounded-2xl bg-green-600 text-lg font-bold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-xl disabled:opacity-50"
                  size="lg"
                >
                  {submittingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      <div className="flex flex-col items-start">
                        <span>
                          {editingOrder
                            ? "Salvar Alterações"
                            : !isDelivery && isTableOccupiedByOtherOrder
                            ? "Mesa ocupada"
                            : "Finalizar Pedido"}
                        </span>
                        {!editingOrder && !isTableOccupiedByOtherOrder && (
                          <span className="text-xs font-normal opacity-90">
                            {cart.reduce((sum, item) => sum + item.quantity, 0)} {cart.reduce((sum, item) => sum + item.quantity, 0) === 1 ? "item" : "itens"} • {formatCurrency(orderTotal)}
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
                  className="h-12 rounded-2xl text-base"
                >
                  Limpar carrinho
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Sidebar de Pedidos do Dia */}
        <aside className="hidden lg:flex flex-col min-h-0 overflow-hidden">
          <Card className="h-full max-h-full border-indigo-200 bg-indigo-50/50 dark:border-indigo-800 dark:bg-indigo-950/20 flex flex-col overflow-hidden">
            <CardHeader className="pb-2 px-4 pt-4 border-b flex-shrink-0">
              <CardTitle className="text-base md:text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pedidos de Hoje
              </CardTitle>
              <CardDescription className="text-xs md:text-sm text-indigo-700 dark:text-indigo-300">
                {todayOrdersLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Carregando...
                  </span>
                ) : (
                  `${Math.min(todayOrders.length, 30)} de ${todayOrders.length} ${todayOrders.length === 1 ? 'pedido' : 'pedidos'}`
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 overflow-hidden p-0">
              {todayOrdersError ? (
                <div className="p-4 text-center text-xs text-destructive">
                  Erro ao carregar pedidos
                </div>
              ) : todayOrdersLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : todayOrders.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                  <Package className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">
                    Nenhum pedido hoje
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-full max-h-full">
                  <div className="p-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      {todayOrders.slice(0, 30).map((order: any) => {
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
                              "w-full rounded-lg border p-2 text-left transition-all hover:shadow-sm",
                              isActive
                                ? "border-primary bg-primary/10 shadow-sm"
                                : "border-border bg-card hover:border-primary/50"
                            )}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-xs text-foreground truncate">
                                    #{order.identify || order.id}
                                  </span>
                                  <Badge 
                                    variant={orderStatus === 'Entregue' || orderStatus === 'Concluído' ? 'default' : 'secondary'}
                                    className="text-[9px] px-1 py-0 h-4 w-fit"
                                  >
                                    {orderStatus}
                                  </Badge>
                                </div>
                              </div>
                              <Edit className={cn(
                                "h-2.5 w-2.5 flex-shrink-0 mt-0.5",
                                isActive ? "text-primary" : "text-muted-foreground"
                              )} />
                            </div>
                            
                            <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-0.5">
                              <Clock className="h-2 w-2" />
                              {orderDate}
                            </div>
                            
                            {order.client && (
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-0.5 truncate">
                                <User className="h-2 w-2 flex-shrink-0" />
                                <span className="truncate">{order.client.name}</span>
                              </div>
                            )}
                            
                            {order.table && (
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-0.5 truncate">
                                <Utensils className="h-2 w-2 flex-shrink-0" />
                                <span className="truncate">Mesa: {order.table.name}</span>
                              </div>
                            )}
                            
                            {order.products && Array.isArray(order.products) && (
                              <div className="flex items-center gap-1 text-[9px] text-muted-foreground mb-0.5">
                                <Package className="h-2 w-2 flex-shrink-0" />
                                <span>{order.products.length} {order.products.length === 1 ? 'item' : 'itens'}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-1 border-t mt-0.5">
                              <span className="text-[9px] font-medium text-muted-foreground">Total</span>
                              <span className="text-xs font-bold text-primary">
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

      {/* Sheet do Carrinho para Mobile */}
      <Sheet open={cartSheetOpen} onOpenChange={setCartSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 overflow-hidden">
          <SheetHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
            <SheetTitle className="text-xl font-bold text-orange-900 dark:text-orange-100">Carrinho</SheetTitle>
            <SheetDescription className="text-sm text-orange-700 dark:text-orange-300">
              Gerencie os itens e finalize o pedido.
            </SheetDescription>
          </SheetHeader>
          
          <ScrollArea className="flex-1 min-h-0 px-4">
            <div className="space-y-3 py-4">
              {/* Conteúdo do carrinho - mesma estrutura do aside */}
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setIsDelivery(false)
                    if (tables.length > 0 && !selectedTable) {
                      const firstTable = tables[0]
                      setSelectedTable(firstTable.uuid || firstTable.identify || firstTable.name)
                    }
                  }}
                  variant={!isDelivery ? "default" : "outline"}
                  className={cn(
                    "w-full rounded-xl py-4 text-sm",
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
                    "w-full rounded-xl py-4 text-sm",
                    isDelivery && "bg-primary text-primary-foreground shadow-lg"
                  )}
                >
                  Delivery
                </Button>
              </div>

              {!isDelivery && (
                <div className="space-y-2">
                  <p className="text-xs font-medium">Selecione a mesa</p>
                  <div className="grid gap-2 grid-cols-2">
                    {tables.map((table) => {
                      const key = table.uuid || table.identify || table.name
                      const active = selectedTable === key
                      const hasOpenOrders = tablesWithOpenOrders.has(key)
                      const isOccupiedByOther = hasOpenOrders && (
                        !editingOrder || 
                        (editingOrder.table?.uuid !== key && editingOrder.table?.identify !== key && editingOrder.table?.name !== key)
                      )
                      
                      return (
                        <Button
                          key={key}
                          onClick={() => {
                            if (isOccupiedByOther && !editingOrder) {
                              toast.error("Esta mesa possui pedidos em aberto.")
                              return
                            }
                            setSelectedTable(key)
                          }}
                          className={cn(
                            "h-12 rounded-xl text-sm transition-all",
                            active
                              ? isOccupiedByOther
                                ? "bg-red-600 text-white border-2 border-red-700"
                                : "bg-primary text-primary-foreground shadow-lg"
                              : isOccupiedByOther
                              ? "bg-red-100 text-red-900 border-2 border-red-300"
                              : "bg-muted text-foreground hover:bg-primary/10"
                          )}
                        >
                          {table.name}
                          {isOccupiedByOther && (
                            <Badge variant={active ? "secondary" : "destructive"} className="ml-1 text-[10px]">
                              Ocupada
                            </Badge>
                          )}
                        </Button>
                      )
                    })}
                  </div>
                </div>
              )}

              {isDelivery && (
                <div className="space-y-2 rounded-xl border p-3">
                  <p className="text-xs font-medium">Endereço de entrega</p>
                  <div className="grid gap-2">
                    <Input
                      placeholder="CEP"
                      value={deliveryAddress.zip}
                      onChange={(event) => handleZipChange(event.target.value)}
                      className="h-10 text-sm"
                    />
                    <Input
                      placeholder="Endereço"
                      value={deliveryAddress.address}
                      onChange={(event) =>
                        setDeliveryAddress((prev) => ({ ...prev, address: event.target.value }))
                      }
                      className="h-10 text-sm"
                    />
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        placeholder="Número"
                        value={deliveryAddress.number}
                        onChange={(event) =>
                          setDeliveryAddress((prev) => ({ ...prev, number: event.target.value }))
                        }
                        className="h-10 text-sm"
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
                        className="h-10 text-sm"
                      />
                    </div>
                    <div className="grid gap-2 grid-cols-2">
                      <Input
                        placeholder="Cidade"
                        value={deliveryAddress.city}
                        onChange={(event) =>
                          setDeliveryAddress((prev) => ({ ...prev, city: event.target.value }))
                        }
                        className="h-10 text-sm"
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
                        className="h-10 text-sm"
                      />
                    </div>
                    <Input
                      placeholder="Complemento"
                      value={deliveryAddress.complement}
                      onChange={(event) =>
                        setDeliveryAddress((prev) => ({ ...prev, complement: event.target.value }))
                      }
                      className="h-10 text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xs font-medium">Cliente (opcional)</p>
                {clients.length > 0 && (
                  <Combobox
                    options={clientOptions}
                    value={selectedClientId}
                    onValueChange={handleClientChange}
                    placeholder="Selecione um cliente..."
                    searchPlaceholder="Buscar cliente..."
                    emptyText="Nenhum cliente encontrado"
                    allowClear
                    className="h-10 rounded-xl text-sm"
                  />
                )}
                <div className="space-y-2">
                  <Input
                    placeholder="Nome do cliente"
                    value={customerName}
                    onChange={(event) => {
                      if (selectedClientId) setSelectedClientId("")
                      setCustomerName(event.target.value)
                    }}
                    className="h-10 text-sm"
                  />
                  <Input
                    placeholder="Telefone"
                    value={customerPhone}
                    onChange={(event) => {
                      if (selectedClientId) setSelectedClientId("")
                      setCustomerPhone(maskPhone(event.target.value))
                    }}
                    className="h-10 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Itens selecionados</p>
                {cart.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-4 text-center text-xs text-muted-foreground">
                    Nenhum item no pedido.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const unitPrice = getCartItemUnitPrice(item)
                      return (
                        <div
                          key={item.signature}
                          className="rounded-xl border p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold truncate">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatCurrency(unitPrice)} cada
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => removeItem(item.signature)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl"
                              onClick={() => updateItemQuantity(item.signature, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="min-w-[40px] rounded-xl bg-muted px-3 py-1.5 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-xl"
                              onClick={() => updateItemQuantity(item.signature, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <span className="ml-auto text-sm font-semibold">
                              {formatCurrency(unitPrice * item.quantity)}
                            </span>
                          </div>
                          <Input
                            value={item.observation}
                            onChange={(event) => updateItemObservation(item.signature, event.target.value)}
                            placeholder="Observações"
                            className="mt-2 h-9 rounded-xl text-xs"
                          />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Observações do pedido</p>
                <Textarea
                  value={orderNotes}
                  onChange={(event) => setOrderNotes(event.target.value)}
                  placeholder="Instruções adicionais"
                  className="min-h-[50px] rounded-xl text-sm"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium">Forma de pagamento</p>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.uuid}
                      method={{
                        uuid: method.uuid,
                        name: method.name,
                        description: method.description || undefined,
                        recommended: method.name.toLowerCase().includes("pix"),
                      }}
                      selected={selectedPaymentMethod === method.uuid}
                      onSelect={setSelectedPaymentMethod}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-3 dark:border-purple-700 dark:bg-purple-950/30">
                <div className="flex items-center justify-between text-xs text-purple-700 dark:text-purple-300">
                  <span>Itens</span>
                  <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-lg font-bold text-purple-900 dark:text-purple-100">
                  <span>Total</span>
                  <span>{formatCurrency(orderTotal)}</span>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          <div className="flex flex-col gap-2 flex-shrink-0 p-4 border-t">
            <Button
              onClick={() => {
                setCartSheetOpen(false)
                handleFinalizeOrder()
              }}
              disabled={submittingOrder || !cart.length || (!isDelivery && isTableOccupiedByOtherOrder)}
              className="h-12 rounded-xl bg-green-600 text-base font-bold text-white shadow-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submittingOrder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar Pedido
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={!cart.length}
              className="h-10 rounded-xl text-sm"
            >
              Limpar carrinho
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Modal de Confirmação de Pedido */}
      <OrderConfirmationModal
        open={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleConfirmOrder}
        orderData={{
          table: !isDelivery && selectedTable
            ? tables.find(t => (t.uuid || t.identify || t.name) === selectedTable)?.name
            : undefined,
          client: selectedClientId
            ? clients.find(c => (c.uuid || c.identify) === selectedClientId)?.name
            : customerName || undefined,
          items: cart.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: getCartItemUnitPrice(item) * item.quantity,
          })),
          total: orderTotal,
          paymentMethod: paymentMethods.find(m => m.uuid === selectedPaymentMethod)?.name || "Não selecionado",
          isDelivery,
        }}
      />
    </div>
  )
}


