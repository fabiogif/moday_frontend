"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { ShoppingCart, Plus, Minus, Trash2, Store, MapPin, Phone, Mail, Image as ImageIcon, Loader2, Search, Package, Menu, X, MessageCircle, UserCircle2, Check, Clock, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import Image from "next/image"
import { maskCPF, validateCPF, maskPhone, validatePhone, maskZipCode, validateEmail } from '@/lib/masks'
import { useViaCEP } from '@/hooks/use-viacep'
import { StateCitySelect } from '@/components/location/state-city-select'
import { StoreHoursBanner } from './components/store-hours-banner'
import { SiteFooter } from '@/components/site-footer'
import { ReviewModal } from './components/review-modal'
import { ReviewsSection } from './components/reviews-section'
import { apiClient, endpoints } from '@/lib/api-client'

interface ProductVariation {
  id: string
  name: string
  price: number
}

interface ProductOptional {
  id: string
  name: string
  price: number
}

interface Product {
  uuid: string
  name: string
  description: string
  price: number | string
  promotional_price?: number | string
  image: string
  qtd_stock: number
  brand: string
  categories: Array<{ uuid: string; name: string }>
  variations?: ProductVariation[]   // Seleção única (tamanhos)
  optionals?: ProductOptional[]     // Múltipla escolha com quantidade
}

interface StoreInfo {
  id?: number
  tenant_id?: number
  name: string
  slug: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipcode: string
  logo: string
  whatsapp: string
  settings?: {
    delivery_pickup?: {
      pickup_enabled?: boolean
      pickup_time_minutes?: number
      pickup_discount_enabled?: boolean
      pickup_discount_percent?: number
      delivery_enabled?: boolean
      delivery_minimum_order_value?: number
      delivery_free_above_value?: number
    }
  }
}

interface CartItem extends Product {
  quantity: number
  selectedVariation?: ProductVariation    // Variação escolhida (apenas 1)
  selectedOptionals?: Array<{             // Opcionais com quantidade
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export default function PublicStorePage() {
  const params = useParams()
  const slug = params.slug as string

  // Helper function to convert price to number and format
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    if (isNaN(numPrice)) {
      return '0,00'
    }
    return numPrice.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  // Helper function to get numeric price
  const getNumericPrice = (price: number | string): number => {
    return typeof price === 'string' ? parseFloat(price) || 0 : price
  }

  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "checkout" | "success">("cart")
  const [submitting, setSubmitting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Estados para avaliação
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [completedOrderId, setCompletedOrderId] = useState<number | null>(null)
  
  // Estados para variações e opcionais
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<string>('') // ID da variação (radio)
  const [selectedOptionalsQty, setSelectedOptionalsQty] = useState<Record<string, number>>({}) // {optionalId: quantidade}
  const [showSelectionDialog, setShowSelectionDialog] = useState(false)

  // Form state
  const [clientData, setClientData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
  })

  const [deliveryData, setDeliveryData] = useState({
    is_delivery: true,
    address: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
    zip_code: "",
    complement: "",
    notes: "",
  })

  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentMethodName, setPaymentMethodName] = useState("")
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [shippingMethod, setShippingMethod] = useState("delivery")
  const [orderResult, setOrderResult] = useState<{
    order_id: string
    total: string
    whatsapp_message: string
    whatsapp_link?: string | null
  } | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactExpanded, setContactExpanded] = useState<{ whatsapp: boolean; location: boolean }>({
    whatsapp: false,
    location: false,
  })
  const [couponCode, setCouponCode] = useState("")
  const [isStoreOpen, setIsStoreOpen] = useState(true) // Default true para não bloquear até carregar

  // Hook para buscar CEP
  const { searchCEP, loading: cepLoading } = useViaCEP()

  // Extrair categorias únicas dos produtos
  const categories = Array.from(
    new Set(
      products.flatMap(product => 
        product.categories?.map(cat => cat.name) || []
      )
    )
  ).sort()

  // Filtrar produtos por categoria
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => 
        product.categories?.some(cat => cat.name === selectedCategory)
      )

  // Produtos com ofertas (têm promotional_price)
  const productsWithOffers = products
    .filter(product => product.promotional_price && product.promotional_price < product.price)
    .map(product => ({
      ...product,
      discountPercent: Math.round((1 - (getNumericPrice(product.promotional_price!) / getNumericPrice(product.price))) * 100)
    }))
    .sort((a, b) => b.discountPercent - a.discountPercent)
    .slice(0, 4)

  // 4 Melhores ofertas (maior desconto)
  const bestOffers = productsWithOffers

  // Para produtos mais vendidos, vou usar uma propriedade fictícia por enquanto
  // Você pode substituir isso por dados reais da API se tiver um campo 'total_sales'
  const bestSellers = products
    .slice()
    .sort(() => Math.random() - 0.5) // Por enquanto, aleatório
    .slice(0, 4)

  const loadPaymentMethods = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      const response = await fetch(`${apiUrl}/api/store/${slug}/payment-methods`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      })

      if (!response.ok) {
        throw new Error('Erro ao carregar formas de pagamento')
      }

      const data = await response.json()
      
      if (data.success && data.data) {
        // console.log('data.data', data.data, data)
        setPaymentMethods(data.data)
        // Selecionar primeiro método por padrão
        if (data.data.length > 0) {
          // Usar UUID da forma de pagamento
          setPaymentMethod(data.data[0].uuid)
          setPaymentMethodName(data.data[0].name) // ← CORRIGIDO: Setar o nome também
        }
      } else {
        setPaymentMethods([])
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error)
      toast.error('Erro ao carregar formas de pagamento')
      setPaymentMethods([])
    }
  }, [slug])

  const loadStoreData = useCallback(async () => {
    try {
      setLoading(true)

1      // Prefer env var; fallback to Laravel default port 8000
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      
      const [storeRes, productsRes] = await Promise.all([
        fetch(`${apiUrl}/api/store/${slug}/info`, { mode: 'cors' }),
        fetch(`${apiUrl}/api/store/${slug}/products`, { mode: 'cors' }),
      ])

      // Check if response is JSON
      const storeContentType = storeRes.headers.get("content-type")
      const productsContentType = productsRes.headers.get("content-type")

      if (!storeContentType || !storeContentType.includes("application/json")) {
        throw new Error("API retornou resposta inválida. Verifique se o servidor Laravel está rodando.")
      }

      const storeData = await storeRes.json()
      const productsData = await productsRes.json()

        if (storeData.success) {
          setStoreInfo(storeData.data)
          // Carregar formas de pagamento após obter info da loja
          await loadPaymentMethods()
        } else {
          toast.error(storeData.message || "Loja não encontrada")
      }

      if (productsData.success) {
        setProducts(productsData.data)
      }
    } catch (error) {
      console.error("Error loading store:", error)
      const errorMessage = error instanceof Error ? error.message : "Erro ao carregar dados da loja"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [slug, loadPaymentMethods])

  useEffect(() => {
    loadStoreData()
  }, [loadStoreData])

  useEffect(() => {
    setMobileSummaryOpen(false)
  }, [checkoutStep])

  function addToCart(
    product: Product, 
    variation?: ProductVariation,
    optionalsWithQty: Array<{ id: string; name: string; price: number; quantity: number }> = []
  ) {
    setCart((prev) => {
      // Não mesclar itens com configurações diferentes - cada um é único
      return [...prev, { 
        ...product, 
        quantity: 1, 
        selectedVariation: variation,
        selectedOptionals: optionalsWithQty 
      }]
    })
    toast.success("Produto adicionado ao carrinho")
  }

  function handleProductClick(product: Product) {
    // DEBUG: Ver o produto clicado
    // console.log('🛒 Produto clicado:', product);
    // console.log('🔍 Variations:', product.variations);
    // console.log('🔍 Optionals:', product.optionals);
    
    // Se o produto tem variações OU opcionais, abrir modal de seleção
    const hasVariations = product.variations && product.variations.length > 0
    const hasOptionals = product.optionals && product.optionals.length > 0
    
    // console.log('✅ hasVariations:', hasVariations);
    // console.log('✅ hasOptionals:', hasOptionals);
    
    if (hasVariations || hasOptionals) {
      // console.log('📱 Abrindo modal de seleção...');
      setSelectedProduct(product)
      setSelectedVariation(product.variations?.[0]?.id || '')
      setSelectedOptionalsQty({})
      setShowSelectionDialog(true)
    } else {
      // console.log('➡️ Adicionando direto ao carrinho (sem opções)');
      // Adicionar direto ao carrinho sem variações/opcionais
      addToCart(product)
    }
  }

  function handleOptionalQuantityChange(optionalId: string, delta: number) {
    setSelectedOptionalsQty((prev) => {
      const currentQty = prev[optionalId] || 0
      const newQty = Math.max(0, currentQty + delta)
      
      if (newQty === 0) {
        const { [optionalId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [optionalId]: newQty }
    })
  }

  function confirmAddToCart() {
    if (!selectedProduct) return
    
    // Validar: Se tem variações, é obrigatório selecionar uma
    const hasVariations = selectedProduct.variations && selectedProduct.variations.length > 0
    if (hasVariations && !selectedVariation) {
      toast.error('Por favor, selecione uma variação')
      return
    }
    
    // Buscar variação selecionada
    const variation = selectedProduct.variations?.find(v => v.id === selectedVariation)
    
    // Montar opcionais com quantidade
    const optionalsWithQty = Object.entries(selectedOptionalsQty)
      .map(([optId, qty]) => {
        const optional = selectedProduct.optionals?.find(opt => opt.id === optId)
        return optional ? { ...optional, quantity: qty } : null
      })
      .filter((opt): opt is { id: string; name: string; price: number; quantity: number } => opt !== null)
    
    addToCart(selectedProduct, variation, optionalsWithQty)
    setShowSelectionDialog(false)
    resetSelectionState()
  }

  function calculateSelectionTotal(): number {
    if (!selectedProduct) return 0
    
    const basePrice = getNumericPrice(selectedProduct.promotional_price || selectedProduct.price)
    
    // Adicionar preço da variação selecionada
    const variation = selectedProduct.variations?.find(v => v.id === selectedVariation)
    const variationPrice = variation ? variation.price : 0
    
    // Adicionar preço dos opcionais (preço × quantidade)
    const optionalsTotal = Object.entries(selectedOptionalsQty).reduce((sum, [optId, qty]) => {
      const optional = selectedProduct.optionals?.find(opt => opt.id === optId)
      return sum + (optional ? optional.price * qty : 0)
    }, 0)
    
    return basePrice + variationPrice + optionalsTotal
  }

  function updateQuantity(key: string, delta: number) {
    const index = parseInt(key.split('-').pop() || '0')
    setCart((prev) => {
      const newCart = [...prev]
      const item = newCart[index]
      
      if (!item) return prev
      
      const newQty = item.quantity + delta
      
      if (newQty > item.qtd_stock) {
        toast.error("Estoque insuficiente")
        return prev
      }
      
      if (newQty <= 0) {
        newCart.splice(index, 1)
        return newCart
      }
      
      newCart[index] = { ...item, quantity: newQty }
      return newCart
    })
  }

  function removeFromCart(key: string) {
    const index = parseInt(key.split('-').pop() || '0')
    setCart((prev) => {
      const newCart = [...prev]
      newCart.splice(index, 1)
      return newCart
    })
    toast.success("Produto removido do carrinho")
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const basePrice = getNumericPrice(item.promotional_price || item.price)
      
      // Adicionar preço da variação (se selecionada)
      const variationPrice = item.selectedVariation ? item.selectedVariation.price : 0
      
      // Adicionar preço dos opcionais (preço × quantidade de cada opcional)
      const optionalsPrice = item.selectedOptionals?.reduce(
        (optSum, opt) => optSum + (opt.price * opt.quantity), 
        0
      ) || 0
      
      // Total do item = (base + variação + opcionais) × quantidade do produto
      const itemTotal = (basePrice + variationPrice + optionalsPrice) * item.quantity
      return sum + itemTotal
    }, 0)
  }

  // Validation function for delivery fields
  const validateDeliveryFields = () => {
    if (shippingMethod !== "delivery") return true
    
    const requiredFields = ['address', 'number', 'neighborhood', 'city', 'state', 'zip_code']
    
    for (const field of requiredFields) {
      if (!deliveryData[field as keyof typeof deliveryData]?.toString().trim()) {
        toast.error(`Campo ${getFieldLabel(field)} é obrigatório para entrega`)
        return false
      }
    }
    
    // Validate CEP format (basic validation)
    if (deliveryData.zip_code && !/^\d{5}-?\d{3}$/.test(deliveryData.zip_code.replace(/\D/g, ''))) {
      toast.error('CEP deve ter o formato 00000-000')
      return false
    }
    
    // Validate State format (2 characters)
    if (deliveryData.state && deliveryData.state.length !== 2) {
      toast.error('Estado deve ter 2 caracteres (ex: SP, RJ)')
      return false
    }
    
    return true
  }

  // Helper function to get field labels
  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      address: 'Endereço',
      number: 'Número',
      neighborhood: 'Bairro',
      city: 'Cidade',
      state: 'Estado',
      zip_code: 'CEP'
    }
    return labels[field] || field
  }

  // Helper function to format CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  // Helper function to handle CEP input
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setDeliveryData({ ...deliveryData, zip_code: formatted })
  }

  // Helper function to handle State input (uppercase, 2 chars max)
  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 2)
    setDeliveryData({ ...deliveryData, state: value })
  }

  // Buscar endereço por CEP
  const handleSearchCEP = async () => {
    const cep = deliveryData.zip_code.replace(/\D/g, '')
    
    if (cep.length !== 8) {
      return
    }

    const result = await searchCEP(cep)
    
    if (result) {
      // Primeiro atualiza estado (isso vai carregar as cidades)
      setDeliveryData({
        ...deliveryData,
        address: result.logradouro || deliveryData.address,
        neighborhood: result.bairro || deliveryData.neighborhood,
        state: result.uf || deliveryData.state,
      })
      
      // Aguardar cidades carregarem, então setar a cidade
      setTimeout(() => {
        setDeliveryData(prev => ({
          ...prev,
          city: result.localidade || prev.city,
        }))
      }, 500)
      
      toast.success('CEP encontrado! Endereço preenchido automaticamente.')
    } else {
      toast.error('CEP não encontrado. Preencha manualmente.')
    }
  }

  // Helper function to translate field names from backend
  const translateFieldName = (field: string): string => {
    const fieldTranslations: Record<string, string> = {
      'client.name': 'Nome',
      'client.email': 'Email',
      'client.phone': 'Telefone',
      'client.cpf': 'CPF',
      'delivery.address': 'Endereço',
      'delivery.number': 'Número',
      'delivery.neighborhood': 'Bairro',
      'delivery.city': 'Cidade',
      'delivery.state': 'Estado',
      'delivery.zip_code': 'CEP',
      'delivery.complement': 'Complemento',
      'delivery.notes': 'Observações',
      'products': 'Produtos',
      'payment_method': 'Forma de Pagamento',
      'shipping_method': 'Método de Entrega'
    }
    return fieldTranslations[field] || field
  }

  // Helper function to translate payment method
  const translatePaymentMethod = (method: string): string => {
    const paymentMethods: Record<string, string> = {
      'pix': 'PIX',
      'credit_card': 'Cartão de Crédito',
      'debit_card': 'Cartão de Débito',
      'money': 'Dinheiro',
      'bank_transfer': 'Transferência Bancária'
    }
    return paymentMethods[method] || method
  }

  // Helper function to translate shipping method
  const translateShippingMethod = (method: string): string => {
    const shippingMethods: Record<string, string> = {
      'delivery': 'Entrega no endereço',
      'pickup': 'Retirar no local'
    }
    return shippingMethods[method] || method
  }

  // Helper function to translate error messages
  const translateErrorMessage = (message: string): string => {
    const messageTranslations: Record<string, string> = {
      'The client.name field is required.': 'Nome é obrigatório',
      'The client.email field is required.': 'Email é obrigatório',
      'The client.email must be a valid email address.': 'Email deve ser válido',
      'The client.phone field is required.': 'Telefone é obrigatório',
      'The delivery.address field is required when delivery.is delivery is true.': 'Endereço é obrigatório para entrega',
      'The delivery.number field is required when delivery.is delivery is true.': 'Número é obrigatório para entrega',
      'The delivery.neighborhood field is required when delivery.is delivery is true.': 'Bairro é obrigatório para entrega',
      'The delivery.city field is required when delivery.is delivery is true.': 'Cidade é obrigatória para entrega',
      'The delivery.state field is required when delivery.is delivery is true.': 'Estado é obrigatório para entrega',
      'The delivery.zip code field is required when delivery.is delivery is true.': 'CEP é obrigatório para entrega',
      'The delivery.city must be a string.': 'Cidade deve ser um texto',
      'The delivery.state must be a string.': 'Estado deve ser um texto',
      'The delivery.zip code must be a string.': 'CEP deve ser um texto',
      'The delivery.address must be a string.': 'Endereço deve ser um texto',
      'The delivery.number must be a string.': 'Número deve ser um texto',
      'The delivery.neighborhood must be a string.': 'Bairro deve ser um texto',
      'The products field is required.': 'Selecione pelo menos um produto',
      'The payment method field is required.': 'Forma de pagamento é obrigatória',
      'The shipping method field is required.': 'Método de entrega é obrigatório'
    }
    return messageTranslations[message] || message
  }

  async function handleCheckout() {
    try {
      setSubmitting(true)

      // Basic frontend validation (backend will do detailed validation)
      if (cart.length === 0) {
        toast.error('Adicione pelo menos um produto ao carrinho')
        setSubmitting(false)
        return
      }

      if (!clientData.name.trim() || !clientData.email.trim() || !clientData.phone.trim()) {
        toast.error('Preencha todos os dados obrigatórios do cliente')
        setSubmitting(false)
        return
      }

      // Prepare delivery data based on shipping method
      const deliveryDataToSend = shippingMethod === "delivery" 
        ? {
            // Only send delivery fields when delivery is selected
            address: deliveryData.address.toString(),
            number: deliveryData.number.toString(),
            neighborhood: deliveryData.neighborhood.toString(),
            city: deliveryData.city.toString(),
            state: deliveryData.state.toString(),
            zip_code: deliveryData.zip_code.toString(),
            complement: deliveryData.complement.toString(),
            notes: deliveryData.notes.toString(),
            is_delivery: true,
          }
        : {
            // For pickup, only send is_delivery as false
            is_delivery: false,
          }

      const orderData = {
        client: clientData,
        delivery: deliveryDataToSend,
        products: cart.map((item) => ({
          uuid: item.uuid,
          quantity: item.quantity,
          optionals: item.selectedOptionals || [],
        })),
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
      }

      // Debug log to see what's being sent
      // console.log('=== DEBUG: Order Data Being Sent ===')
      // console.log('shippingMethod:', shippingMethod)
      // console.log('deliveryDataToSend:', deliveryDataToSend)
      // console.log('full orderData:', orderData)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      const fullUrl = `${apiUrl}/api/store/${slug}/orders`
      
      // console.log('=== DEBUG: Request Info ===')
      // console.log('API URL:', apiUrl)
      // console.log('Full URL:', fullUrl)
      // console.log('Slug:', slug)
      
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(orderData),
        mode: 'cors',
        credentials: 'include',
      })

      // Check if response is JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("API retornou resposta inválida. Verifique se o servidor Laravel está rodando.")
      }

      const result = await response.json()
      
      // Debug log for response
      if (result.success) {
        setOrderResult(result.data)
        setCheckoutStep("success")
        setCart([])
        toast.success(result.message)
      } else {
        // Handle validation errors from backend
        if (result.errors) {
          const errors: Record<string, string> = {}
          
          // Fields that should be ignored when pickup is selected
          const pickupIgnoredFields = [
            'delivery.address',
            'delivery.number', 
            'delivery.neighborhood',
            'delivery.city',
            'delivery.state',
            'delivery.zip_code'
          ]
          
          // Show specific field errors and store them for visual feedback
          Object.entries(result.errors).forEach(([field, messages]: [string, any]) => {
            // Skip delivery field validation errors when pickup is selected
            if (shippingMethod === "pickup" && pickupIgnoredFields.includes(field)) {
              return
            }
            
            const translatedField = translateFieldName(field)
            const message = Array.isArray(messages) ? messages[0] : messages
            const translatedMessage = translateErrorMessage(message)
            
            errors[field] = translatedMessage
            toast.error(`${translatedField}: ${translatedMessage}`)
          })
          
          setValidationErrors(errors)
          
          // Clear errors after 5 seconds
          setTimeout(() => setValidationErrors({}), 5000)
        } else {
          toast.error(result.message || "Erro ao criar pedido")
        }
      }
    } catch (error) {
      console.error("=== ERROR creating order ===")
      console.error("Error type:", error?.constructor?.name)
      console.error("Error details:", error)
      
      let errorMessage = "Erro ao finalizar pedido"
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão com a internet ou se o servidor está online."
        console.error("Network error - possible causes:")
        console.error("1. Backend is not running")
        console.error("2. CORS is not configured properly")
        console.error("3. Wrong API_URL:", process.env.NEXT_PUBLIC_API_URL)
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage, {
        duration: 5000,
      })
    } finally {
      setSubmitting(false)
    }
  }

  function openWhatsApp() {
    // console.log('openWhatsApp called - orderResult:', orderResult)
    
    if (orderResult?.whatsapp_link) {
      // console.log('Opening WhatsApp link:', orderResult.whatsapp_link)
      window.open(orderResult.whatsapp_link, "_blank")
    } else {
      console.error('WhatsApp link não encontrado no resultado do pedido:', orderResult)
      toast.error('Link do WhatsApp não disponível. Verifique se a loja possui telefone cadastrado.')
    }
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      if (!storeInfo) {
        throw new Error('Dados da loja não encontrados')
      }
      
      // Usar order_id (identify) do orderResult
      const orderIdentify = orderResult?.order_id
      
      if (!orderIdentify) {
        throw new Error('Identificador do pedido não encontrado')
      }
      
      // Usar tenant_id ou id (fallback)
      const tenantId = storeInfo.tenant_id || storeInfo.id
      
      if (!tenantId) {
        throw new Error('ID do tenant não encontrado. Dados da loja incompletos.')
      }

      const response = await apiClient.post(endpoints.reviews.public.create, {
        tenant_id: tenantId,
        order_identify: orderIdentify,
        rating: reviewData.rating,
        comment: reviewData.comment,
        customer_name: reviewData.customer_name || clientData.name,
        customer_email: reviewData.customer_email || clientData.email,
      })

      if (response.success) {
        setShowReviewModal(false)
        toast.success('Avaliação enviada! Obrigado pelo feedback.')
      }
    } catch (error: any) {
      throw new Error(error.message || 'Erro ao enviar avaliação')
    }
  }

  const cartTotal = getCartTotal()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const progressSteps = [
    { key: 'cart', label: 'Seleção de Itens', description: 'Escolha seus produtos favoritos' },
    { key: 'checkout', label: 'Dados de Entrega', description: 'Informe seus dados e endereço' },
    { key: 'payment', label: 'Pagamento', description: 'Revise e confirme o pagamento' },
    { key: 'success', label: 'Confirmação', description: 'Pedido finalizado com sucesso' },
  ] as const

  const currentProgressKey =
    checkoutStep === 'cart'
      ? 'cart'
      : checkoutStep === 'checkout'
        ? (submitting ? 'payment' : 'checkout')
        : 'success'

  const currentStepIndex = progressSteps.findIndex((step) => step.key === currentProgressKey)

  const whatsappNumber = storeInfo?.whatsapp || storeInfo?.phone || ''
  const sanitizedWhatsapp = whatsappNumber.replace(/\D/g, '')
  const whatsappLink = sanitizedWhatsapp ? `https://wa.me/${sanitizedWhatsapp}` : undefined
  const displayWhatsapp = whatsappNumber ? maskPhone(whatsappNumber) : 'Não informado'

  const locationText = [
    storeInfo?.address,
    storeInfo?.city && storeInfo?.state ? `${storeInfo.city} - ${storeInfo.state}` : storeInfo?.city || storeInfo?.state,
    storeInfo?.zipcode && `CEP: ${storeInfo.zipcode}`,
  ].filter(Boolean).join(' • ')

  const attendanceText = storeInfo?.settings?.delivery_pickup?.pickup_time_minutes
    ? `Retirada pronta em aproximadamente ${storeInfo.settings.delivery_pickup.pickup_time_minutes} minutos`
    : 'Atendimento disponível durante o horário de funcionamento.'

  const estimatedTime = storeInfo?.settings?.delivery_pickup?.pickup_time_minutes
  const estimatedTimeLabel = estimatedTime ? `${estimatedTime} min` : '30-45 min'
  const acceptedPayments = paymentMethods.length > 0 ? paymentMethods.map((method) => method.name) : ['Verificar na loja']

  const handleContactToggle = (type: 'whatsapp' | 'location') => {
    setContactExpanded((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  const handleScrollToSummary = () => {
    if (typeof document === 'undefined') return
    const element = document.getElementById('order-summary')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleStartCheckout = () => {
    if (!isStoreOpen) {
      toast.error('A loja está fechada no momento. Volte durante o horário de funcionamento.')
      return
    }

    if (cart.length === 0) {
      toast.error('Adicione ao menos um item ao carrinho para continuar.')
      return
    }

    setCheckoutStep('checkout')
    setMobileSummaryOpen(false)
    setTimeout(() => handleScrollToSummary(), 150)
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error('Digite um cupom antes de aplicar.')
      return
    }

    toast.info('Aplicação de cupom em desenvolvimento.', {
      description: 'Em breve você poderá validar descontos automaticamente.',
    })
  }

  const showMobileSummaryButton = cart.length > 0 && checkoutStep !== 'success'

  const renderSummaryContent = (variant: 'cart' | 'checkout') => {
    if (cart.length === 0) {
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Nenhum item no carrinho ainda.</p>
          <p>Explore o cardápio e adicione seus produtos favoritos!</p>
        </div>
      )
    }

    const buttonLabel =
      variant === 'cart'
        ? 'Ir para Dados de Entrega'
        : submitting
          ? 'Finalizando...'
          : 'Confirmar Pedido'

    const buttonAction = variant === 'cart' ? handleStartCheckout : handleCheckout
    const buttonDisabled = variant === 'checkout' ? submitting : !isStoreOpen

    return (
      <div className="space-y-4">
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {cart.map((item, index) => {
            const basePrice = getNumericPrice(item.promotional_price || item.price)
            const variationPrice = item.selectedVariation ? item.selectedVariation.price : 0
            const optionalsPrice =
              item.selectedOptionals?.reduce((sum, opt) => sum + (opt.price * opt.quantity), 0) || 0
            const unitPrice = basePrice + variationPrice + optionalsPrice
            const totalPrice = unitPrice * item.quantity

            return (
              <div key={`${item.uuid}-${index}`} className="rounded-xl border bg-card/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="font-semibold text-sm sm:text-base text-foreground line-clamp-2">{item.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {item.quantity}
                      </span>
                      <span>R$ {formatPrice(unitPrice)}</span>
                    </div>
                    {item.selectedVariation && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.selectedVariation.name}
                        </Badge>
                        <span>
                          {item.selectedVariation.price > 0 && `+R$ ${item.selectedVariation.price.toFixed(2)}`}
                          {item.selectedVariation.price === 0 && 'Incluso'}
                        </span>
                      </div>
                    )}
                    {item.selectedOptionals && item.selectedOptionals.length > 0 && (
                      <div className="space-y-1 border-l border-border/60 pl-2 text-xs text-muted-foreground">
                        {item.selectedOptionals.map((opt) => (
                          <div key={opt.id} className="flex items-center justify-between">
                            <span>{opt.name} × {opt.quantity}</span>
                            <span>R$ {(opt.price * opt.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-base text-foreground">
                    R$ {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        {variant === 'cart' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="order-notes" className="text-sm font-medium">Observações do pedido</Label>
              <Textarea
                id="order-notes"
                value={deliveryData.notes}
                onChange={(e) => setDeliveryData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Ex: Retirar ingredientes, ponto da carne, instruções especiais..."
                className="min-h-[90px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-code" className="text-sm font-medium">Cupom de desconto</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="coupon-code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="DIGITE AQUI"
                  className="uppercase"
                />
                <Button type="button" variant="secondary" onClick={handleApplyCoupon} className="whitespace-nowrap">
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Itens ({cartCount})</span>
            <span>R$ {formatPrice(cartTotal)}</span>
          </div>

          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium text-muted-foreground/90">Tempo estimado</p>
              <p>{estimatedTimeLabel}</p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-muted-foreground/90">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-medium">Formas de pagamento</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {acceptedPayments.map((method) => (
                <Badge key={method} variant="outline" className="text-xs">
                  {method}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">R$ {formatPrice(cartTotal)}</span>
          </div>

        </div>

        <Button
          className="w-full rounded-full"
          size="lg"
          onClick={buttonAction}
          disabled={buttonDisabled}
        >
          {buttonLabel}
        </Button>

        {variant === 'cart' && (
          <Button variant="ghost" className="w-full" onClick={() => setCart([])}>
            Limpar carrinho
          </Button>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando loja...</p>
        </div>
      </div>
    )
  }

  if (!storeInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loja não encontrada</CardTitle>
            <CardDescription>A loja que você está procurando não existe ou está inativa.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const resetSelectionState = () => {
    setSelectedProduct(null)
    setSelectedVariation('')
    setSelectedOptionalsQty({})
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Store Hours Banner */}
      <StoreHoursBanner slug={slug} onStatusChange={setIsStoreOpen} />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur shadow-md">
        <div className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full p-0 sm:max-w-sm">
                  <div className="space-y-6 p-6">
                    <div className="flex items-center gap-3">
                      {storeInfo.logo ? (
                        <Image
                          src={storeInfo.logo}
                          alt={storeInfo.name}
                          width={48}
                          height={48}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Store className="h-6 w-6 text-muted-foreground" />
                        </div>
              )}
              <div>
                        <h2 className="text-lg font-semibold">{storeInfo.name}</h2>
                        {locationText && <p className="text-sm text-muted-foreground">{locationText}</p>}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          setMobileSummaryOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Ver carrinho ({cartCount})
                      </Button>
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <Link href={`/store/${slug}/track`} onClick={() => setMobileMenuOpen(false)}>
                          <Package className="h-4 w-4" />
                          Acompanhar pedido
                        </Link>
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm text-muted-foreground">
                      {displayWhatsapp !== 'Não informado' && (
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/50 px-4 py-2 transition hover:border-primary hover:text-primary"
                        >
                          <MessageCircle className="h-4 w-4 text-primary" />
                          <span>WhatsApp: {displayWhatsapp}</span>
                        </a>
                  )}
                      {locationText && (
                        <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-4 py-2">
                          <MapPin className="mt-1 h-4 w-4 text-primary" />
                          <span>{locationText}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-4 py-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{attendanceText}</span>
                </div>
              </div>
            </div>
                </SheetContent>
              </Sheet>

              {storeInfo.logo ? (
                <Image
                  src={storeInfo.logo}
                  alt={storeInfo.name}
                  width={48}
                  height={48}
                  className="hidden h-12 w-12 rounded-full object-cover sm:block"
                />
              ) : (
                <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-muted sm:flex">
                  <Store className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              <div>
                <h1 className="text-lg font-semibold sm:text-xl">{storeInfo.name}</h1>
                {locationText && (
                  <p className="hidden text-xs text-muted-foreground sm:block">{locationText}</p>
                )}
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button variant="ghost" className="relative gap-2" onClick={handleScrollToSummary}>
                <ShoppingCart className="h-4 w-4" />
                <span>Carrinho</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" className="gap-2" asChild>
              <Link href={`/store/${slug}/track`}>
                  <Package className="h-4 w-4" />
                  Meu pedido
                </Link>
                </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
                <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setMobileSummaryOpen(true)}
                >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Abrir resumo do carrinho</span>
                </Button>
            </div>
          </div>
        </div>

        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <button
                    type="button"
                    onClick={() => handleContactToggle('whatsapp')}
                    className="flex w-full items-center justify-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                    <span className="text-xs text-muted-foreground">(toque para ver detalhes)</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all ${contactExpanded.whatsapp ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="rounded-lg border bg-background/95 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">
                        {displayWhatsapp !== 'Não informado' ? displayWhatsapp : 'Contato não informado'}
                      </p>
                      <p className="mt-1">{attendanceText}</p>
                      {whatsappLink && (
                        <Button variant="link" className="px-0 text-primary" asChild>
                          <a href={whatsappLink} target="_blank" rel="noreferrer">
                            Conversar no WhatsApp
                          </a>
                </Button>
              )}
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <button
                    type="button"
                    onClick={() => handleContactToggle('location')}
                    className="flex w-full items-center justify-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Localização</span>
                    <span className="text-xs text-muted-foreground">(toque para ver detalhes)</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all ${contactExpanded.location ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="rounded-lg border bg-background/95 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">
                        {locationText || 'Endereço não informado'}
                      </p>
                      <p className="mt-1">{attendanceText}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b bg-background/90">
          <div className="container mx-auto px-4 py-2 sm:py-3">
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 md:gap-4">
              {progressSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isActive = index === currentStepIndex

                return (
                  <div
                    key={step.key}
                    className={`flex flex-none items-center gap-3 rounded-2xl border border-border/60 bg-background px-3 py-2 text-xs shadow-sm transition md:flex-1 md:px-5 md:py-3 md:text-sm ${
                      isActive ? 'ring-1 ring-primary/30' : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all md:h-10 md:w-10 md:text-sm ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : isCompleted
                            ? 'border-primary/60 bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : index + 1}
                    </div>
                    <div className="min-w-[110px] md:min-w-0">
                      <span
                        className={`block font-semibold ${
                          isActive ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:block">{step.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

      </header>

      <main className="flex-1">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          {checkoutStep === "cart" && (
            <section className="container mx-auto space-y-10 px-4 py-10">
              <div className="flex flex-col gap-10 lg:flex-row">
                <div className="flex-1 space-y-6">
                  <TabsContent value={selectedCategory} className="mt-0">
                    {filteredProducts.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-muted p-12 text-center">
                        <p className="text-lg text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                        {filteredProducts.map((product) => {
                          const price = product.promotional_price || product.price;
                          const hasDiscount = product.promotional_price && product.promotional_price < product.price;

                          return (
                            <Card
                              key={product.uuid}
                              className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                            >
                              <div className="relative aspect-square bg-muted">
                                {product.image ? (
                                  <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center bg-muted">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                                  </div>
                                )}
                                {hasDiscount && (
                                  <Badge className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                                    {Math.round((1 - (getNumericPrice(product.promotional_price!) / getNumericPrice(product.price))) * 100)}% OFF
                                  </Badge>
                                )}
                                {product.categories && product.categories.length > 0 && (
                                  <Badge className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                    {product.categories[0].name}
                                  </Badge>
                                )}
                              </div>
                              <CardHeader className="flex-1 space-y-2 p-4">
                                <CardTitle className="line-clamp-2 text-base font-semibold leading-tight sm:text-lg">
                                  {product.name}
                                </CardTitle>
                                {product.description && (
                                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                                    {product.description}
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent className="space-y-4 p-4 pt-0">
                                <div className="space-y-1">
                                  {hasDiscount && (
                                    <p className="text-xs text-muted-foreground line-through">
                                      R$ {formatPrice(product.price)}
                                    </p>
                                  )}
                                  <p className="text-lg font-semibold text-primary sm:text-2xl">
                                    R$ {formatPrice(price)}
                                  </p>
                                </div>
                                <Button
                                  onClick={() => handleProductClick(product)}
                                  className="w-full rounded-full py-5 text-sm font-semibold sm:text-base"
                                  disabled={product.qtd_stock === 0}
                                >
                                  {product.qtd_stock === 0 ? "Esgotado" : "Adicionar"}
                                </Button>
                                {((product.variations && product.variations.length > 0) ||
                                  (product.optionals && product.optionals.length > 0)) && (
                                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
                                      {product.variations && product.variations.length > 0 && (
                                        <Badge variant="outline" className="rounded-full px-3 py-1">
                                          {product.variations.length} {product.variations.length === 1 ? 'variação' : 'variações'}
                                        </Badge>
                                      )}
                                      {product.optionals && product.optionals.length > 0 && (
                                        <Badge variant="outline" className="rounded-full px-3 py-1">
                                          {product.optionals.length} {product.optionals.length === 1 ? 'opcional' : 'opcionais'}
                                        </Badge>
                                      )}
                                    </div>
                                  )}
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    )}
                  </TabsContent>
                </div>

                <aside className="hidden w-full max-w-sm lg:block" id="order-summary">
                  <Card className="sticky top-32 space-y-0 rounded-3xl border border-border/60 shadow-2xl">
                    <CardHeader className="space-y-1 pb-0">
                      <CardTitle className="flex items-center justify-between text-xl">
                        <span>Resumo do Pedido</span>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Revise os itens selecionados antes de prosseguir.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      {renderSummaryContent('cart')}
                    </CardContent>
                  </Card>
                </aside>
                              </div>
                            </section>
                          )}
                        </Tabs>
                
                        {checkoutStep === "checkout" && (
          <section className="container mx-auto px-4 py-10">
            <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="mb-6">
              ← Voltar para o carrinho
            </Button>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Client Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={clientData.name}
                          onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={clientData.email}
                          onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone *</Label>
                        <Input
                          id="phone"
                          value={clientData.phone}
                          onChange={(e) => setClientData({ ...clientData, phone: maskPhone(e.target.value) })}
                          placeholder="(11) 99999-9999"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={clientData.cpf}
                          onChange={(e) => setClientData({ ...clientData, cpf: maskCPF(e.target.value) })}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Método de Entrega</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery">Entrega no endereço</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup">Retirar no local</Label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Delivery Address */}
                {shippingMethod === "delivery" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Endereço de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <Label htmlFor="address">Endereço *</Label>
                          <Input
                            id="address"
                            value={deliveryData.address}
                            onChange={(e) => setDeliveryData({ ...deliveryData, address: e.target.value })}
                            required={shippingMethod === "delivery"}
                            placeholder="Rua, Avenida, etc."
                            className={validationErrors['delivery.address'] ? 'border-red-500' : ''}
                          />
                          {validationErrors['delivery.address'] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors['delivery.address']}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="number">Número *</Label>
                          <Input
                            id="number"
                            value={deliveryData.number}
                            onChange={(e) => setDeliveryData({ ...deliveryData, number: e.target.value })}
                            required={shippingMethod === "delivery"}
                            placeholder="123"
                            className={validationErrors['delivery.number'] ? 'border-red-500' : ''}
                          />
                          {validationErrors['delivery.number'] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors['delivery.number']}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="neighborhood">Bairro *</Label>
                          <Input
                            id="neighborhood"
                            value={deliveryData.neighborhood}
                            onChange={(e) => setDeliveryData({ ...deliveryData, neighborhood: e.target.value })}
                            required={shippingMethod === "delivery"}
                            placeholder="Centro, Jardins, etc."
                            className={validationErrors['delivery.neighborhood'] ? 'border-red-500' : ''}
                          />
                          {validationErrors['delivery.neighborhood'] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors['delivery.neighborhood']}</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Estado e Cidade */}
                      <StateCitySelect
                        stateValue={deliveryData.state}
                        cityValue={deliveryData.city}
                        onStateChange={(value) => setDeliveryData({ ...deliveryData, state: value })}
                        onCityChange={(value) => setDeliveryData({ ...deliveryData, city: value })}
                        stateError={validationErrors['delivery.state']}
                        cityError={validationErrors['delivery.city']}
                        required={shippingMethod === "delivery"}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="zip_code">CEP *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="zip_code"
                              value={deliveryData.zip_code}
                              onChange={handleCEPChange}
                              onBlur={handleSearchCEP}
                              maxLength={9}
                              required={shippingMethod === "delivery"}
                              placeholder="01234-567"
                              className={validationErrors['delivery.zip_code'] ? 'border-red-500' : ''}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={handleSearchCEP}
                              disabled={cepLoading || deliveryData.zip_code.replace(/\D/g, '').length !== 8}
                            >
                              {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                          </div>
                          {validationErrors['delivery.zip_code'] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors['delivery.zip_code']}</p>
                          )}
                          {cepLoading && (
                            <p className="text-sm text-muted-foreground mt-1">Buscando CEP...</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          value={deliveryData.complement}
                          onChange={(e) => setDeliveryData({ ...deliveryData, complement: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea
                          id="notes"
                          value={deliveryData.notes}
                          onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                          placeholder="Ex: Ponto de referência, instruções de entrega..."
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle>Forma de Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {paymentMethods.length > 0 ? (
                      <RadioGroup 
                        value={paymentMethod} 
                        onValueChange={(uuid) => {
                          setPaymentMethod(uuid)
                          const selected = paymentMethods.find(m => m.uuid === uuid)
                          setPaymentMethodName(selected?.name || uuid)
                        }}
                      >
                        {paymentMethods.map((method) => (
                          <div key={method.uuid} className="flex items-center space-x-2">
                            <RadioGroupItem value={method.uuid} id={method.uuid} />
                            <Label htmlFor={method.uuid} className="flex items-center gap-2 cursor-pointer">
                              {method.name}
                              {method.description && (
                                <Badge variant="outline" className="text-xs">
                                  {method.description}
                                </Badge>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Carregando formas de pagamento...</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="w-full lg:max-w-sm" id="order-summary">
                <Card className="sticky top-24 space-y-0 rounded-3xl border border-border/60 shadow-2xl">
                  <CardHeader className="space-y-1 pb-0">
                    <CardTitle className="flex items-center justify-between text-xl">
                      <span>Resumo do Pedido</span>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Confira os valores antes de finalizar.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {renderSummaryContent('checkout')}
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        )}

        {checkoutStep === "success" && orderResult && (
          <section className="container mx-auto flex justify-center px-4 py-12">
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-2xl">Pedido Realizado com Sucesso!</CardTitle>
                <CardDescription>
                  Seu pedido <strong>#{orderResult.order_id}</strong> foi criado com sucesso.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100">Dados do Cliente</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{clientData.name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{clientData.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{clientData.phone}</p>
                    </div>
                    <div className="flex items-center gap-3 pt-2 border-t border-blue-200 dark:border-blue-800">
                      <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {new Date().toLocaleDateString('pt-BR', { 
                          day: '2-digit', 
                          month: 'long', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Itens do Pedido</h3>
                  </div>
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const price = getNumericPrice(item.promotional_price || item.price)
                      return (
                        <div key={item.uuid} className="flex justify-between items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900/30 dark:to-gray-800/20 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/50 text-xs font-bold text-orange-700 dark:text-orange-300">
                                {item.quantity}
                              </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                × R$ {formatPrice(item.promotional_price || item.price)}
                              </span>
                            </div>
                          </div>
                          <p className="font-bold text-lg text-gray-900 dark:text-gray-100">
                            R$ {formatPrice(price * item.quantity)}
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Payment and Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Forma de Pagamento</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{paymentMethodName || 'Não selecionado'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-4 rounded-xl border border-purple-100 dark:border-purple-900">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Método de Entrega</p>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{translateShippingMethod(shippingMethod)}</p>
                  </div>
                </div>

                {/* Delivery Address (if delivery is selected) */}
                {shippingMethod === "delivery" && (
                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-5 rounded-xl border border-amber-100 dark:border-amber-900">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">Endereço de Entrega</h3>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {deliveryData.address}, {deliveryData.number}
                      </p>
                      {deliveryData.complement && (
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium">Complemento:</span> {deliveryData.complement}
                        </p>
                      )}
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {deliveryData.neighborhood} - {deliveryData.city}/{deliveryData.state}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">CEP:</span> {deliveryData.zip_code}
                      </p>
                      {deliveryData.notes && (
                        <div className="pt-2 border-t border-amber-200 dark:border-amber-800 mt-3">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold text-amber-700 dark:text-amber-300">📝 Observações:</span> {deliveryData.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 p-6 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-500 dark:bg-green-600 rounded-xl shadow-md">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">Total do Pedido</p>
                        <p className="text-4xl font-black text-green-700 dark:text-green-300 tracking-tight">
                          R$ {orderResult.total}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                      <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">Próximos Passos</h3>
                  </div>
                  <ol className="space-y-3">
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">1</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">Confirme seu pedido via WhatsApp</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">2</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">Aguarde a confirmação do restaurante</p>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300 pt-0.5">Você receberá atualizações sobre o status do pedido</p>
                    </li>
                  </ol>
                </div>

                {/* Pickup Time Estimate (if pickup is selected) */}
                {shippingMethod === "pickup" && storeInfo?.settings?.delivery_pickup?.pickup_enabled && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-green-900">⏰ Tempo Estimado para Retirada</p>
                        <p className="text-sm text-green-700 mt-1">
                          Seu pedido estará pronto em aproximadamente{" "}
                          <strong>{storeInfo.settings.delivery_pickup.pickup_time_minutes || 35} minutos</strong>
                        </p>
                        {storeInfo.settings.delivery_pickup.pickup_discount_enabled && 
                         (storeInfo.settings.delivery_pickup.pickup_discount_percent || 0) > 0 && (
                          <p className="text-sm text-green-700 mt-2 font-medium">
                            🎉 Desconto de {storeInfo.settings.delivery_pickup.pickup_discount_percent}% aplicado por retirada no local!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {orderResult?.whatsapp_link ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0" 
                    size="lg" 
                    onClick={openWhatsApp}
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Enviar Pedido via WhatsApp
                  </Button>
                ) : (
                  <div className="w-full p-6 text-center bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <Phone className="h-10 w-10 mx-auto mb-3 text-gray-400 dark:text-gray-600" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">WhatsApp não disponível</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Restaurante não possui telefone cadastrado</p>
                  </div>
                )}

                <Button 
                  variant="outline" 
                  className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-900/50" 
                  size="lg"
                  onClick={() => {
                    setCheckoutStep("cart")
                    setOrderResult(null)
                  }}
                >
                  <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Fazer Novo Pedido
                </Button>

                {/* Botão de Avaliação */}
                <Button 
                  variant="secondary" 
                  className="w-full" 
                  onClick={() => {
                    if (!orderResult?.order_id) {
                      toast.error('Identificador do pedido não encontrado.')
                      return
                    }
                    setShowReviewModal(true)
                  }}
                >
                  ⭐ Avaliar Pedido
                </Button>
              </CardContent>
            </Card>
          </section>
        )}
      </main>

      {showMobileSummaryButton && (
        <Button
          onClick={() => setMobileSummaryOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 lg:hidden"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-3 -right-3 h-6 min-w-[1.5rem] rounded-full px-1 text-xs">
                {cartCount}
                          </Badge>
            )}
          </div>
          <span className="sr-only">Abrir resumo do pedido</span>
                          </Button>
      )}

      <Sheet open={mobileSummaryOpen} onOpenChange={setMobileSummaryOpen}>
        <SheetContent side="bottom" className="w-full max-h-[85vh] overflow-y-auto px-6 py-6 sm:mx-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Resumo do Pedido</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {renderSummaryContent(checkoutStep === 'checkout' ? 'checkout' : 'cart')}
      </div>
        </SheetContent>
      </Sheet>

      <Dialog
        open={showSelectionDialog}
        onOpenChange={(open) => {
          setShowSelectionDialog(open)
          if (!open) {
            resetSelectionState()
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-3xl border border-border/50 bg-background/95 p-0 shadow-2xl backdrop-blur">
          {selectedProduct && (
            <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-xl font-semibold sm:text-2xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Personalize o pedido antes de adicionar ao carrinho.
            </DialogDescription>
          </DialogHeader>
          
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-muted sm:h-24 sm:w-24">
                  {selectedProduct.image ? (
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.description || 'Selecione as opções disponíveis e adicione ao seu pedido.'}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Preço base: <span className="text-primary font-semibold whitespace-nowrap">R$ {formatPrice(selectedProduct.promotional_price || selectedProduct.price)}</span>
                  </div>
              </div>
            </div>

              {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                <div className="space-y-3">
              <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variações</p>
                    <p className="text-sm text-muted-foreground">Escolha uma opção</p>
                  </div>
                  <RadioGroup value={selectedVariation} onValueChange={setSelectedVariation} className="grid gap-2">
                    {selectedProduct.variations.map((variation) => {
                      const isSelected = selectedVariation === variation.id
                      return (
                        <div
                          key={variation.id}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                            isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/40'
                          }`}
                        >
                          <RadioGroupItem value={variation.id} id={`variation-${variation.id}`} className="sr-only" />
                          <label htmlFor={`variation-${variation.id}`} className="flex flex-1 cursor-pointer items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{variation.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {variation.price > 0 ? `+ R$ ${formatPrice(variation.price)}` : 'Sem custo adicional'}
                              </p>
                      </div>
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                              {isSelected ? <Check className="h-3 w-3" /> : null}
                  </div>
                          </label>
                        </div>
                      )
                    })}
                </RadioGroup>
              </div>
            )}

              {selectedProduct.optionals && selectedProduct.optionals.length > 0 && (
                <div className="space-y-3">
              <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opcionais</p>
                    <p className="text-sm text-muted-foreground">Adicione itens extras ao seu pedido</p>
                  </div>
                  <div className="space-y-3">
                  {selectedProduct.optionals.map((optional) => {
                    const qty = selectedOptionalsQty[optional.id] || 0
                    return (
                        <div
                          key={optional.id}
                          className="flex items-center justify-between rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{optional.name}</p>
                            <p className="text-xs text-muted-foreground">+ R$ {formatPrice(optional.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleOptionalQuantityChange(optional.id, -1)}
                            disabled={qty === 0}
                          >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">Remover opcional</span>
                          </Button>
                            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleOptionalQuantityChange(optional.id, 1)}
                          >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Adicionar opcional</span>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
                
                <Separator />

              <DialogFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col sm:w-auto">
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total estimado</span>
                  <span className="text-xl font-semibold text-primary sm:text-2xl whitespace-nowrap">R$ {formatPrice(calculateSelectionTotal())}</span>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:min-w-[140px]"
                    onClick={() => {
                      setShowSelectionDialog(false)
                      resetSelectionState()
                    }}
                  >
              Cancelar
            </Button>
            <Button 
                    type="button"
                    className="sm:min-w-[180px]"
                    onClick={confirmAddToCart}
                    disabled={selectedProduct.variations && selectedProduct.variations.length > 0 && !selectedVariation}
                  >
                    <span className="whitespace-nowrap text-sm sm:text-base">Adicionar • R$ {formatPrice(calculateSelectionTotal())}</span>
                  </Button>
                </div>
          </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ReviewsSection tenantSlug={slug} />

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
