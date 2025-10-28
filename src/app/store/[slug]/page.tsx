"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { ShoppingCart, Plus, Minus, Trash2, Store, MapPin, Phone, Mail, Image as ImageIcon, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import Image from "next/image"
import { maskCPF, validateCPF, maskPhone, validatePhone, maskZipCode, validateEmail } from '@/lib/masks'
import { useViaCEP } from '@/hooks/use-viacep'

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
}

interface StoreInfo {
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
}

interface CartItem extends Product {
  quantity: number
}

export default function PublicStorePage() {
  const params = useParams()
  const slug = params.slug as string

  // Helper function to convert price to number and format
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2)
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
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [shippingMethod, setShippingMethod] = useState("delivery")
  const [orderResult, setOrderResult] = useState<any>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [cartCollapsed, setCartCollapsed] = useState(false)

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

  useEffect(() => {
    loadStoreData()
  }, [slug])

  async function loadPaymentMethods() {
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
        setPaymentMethods(data.data)
        // Selecionar primeiro método por padrão
        if (data.data.length > 0) {
          setPaymentMethod(data.data[0].uuid)
        }
      } else {
        setPaymentMethods([])
      }
    } catch (error) {
      console.error('Erro ao carregar formas de pagamento:', error)
      toast.error('Erro ao carregar formas de pagamento')
      setPaymentMethods([])
    }
  }

  async function loadStoreData() {
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
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((item) => item.uuid === product.uuid)
      if (existing) {
        if (existing.quantity >= product.qtd_stock) {
          toast.error("Estoque insuficiente")
          return prev
        }
        return prev.map((item) =>
          item.uuid === product.uuid ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    toast.success("Produto adicionado ao carrinho")
  }

  function updateQuantity(uuid: string, delta: number) {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.uuid === uuid) {
            const newQty = item.quantity + delta
            if (newQty > item.qtd_stock) {
              toast.error("Estoque insuficiente")
              return item
            }
            return { ...item, quantity: newQty }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    )
  }

  function removeFromCart(uuid: string) {
    setCart((prev) => prev.filter((item) => item.uuid !== uuid))
    toast.success("Produto removido do carrinho")
  }

  function getCartTotal() {
    return cart.reduce((sum, item) => {
      const price = getNumericPrice(item.promotional_price || item.price)
      return sum + price * item.quantity
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
      setDeliveryData({
        ...deliveryData,
        address: result.logradouro || deliveryData.address,
        neighborhood: result.bairro || deliveryData.neighborhood,
        city: result.localidade || deliveryData.city,
        state: result.uf || deliveryData.state,
      })
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
        })),
        payment_method: paymentMethod,
        shipping_method: shippingMethod,
      }

      // Debug log to see what's being sent
      console.log('=== DEBUG: Order Data Being Sent ===')
      console.log('shippingMethod:', shippingMethod)
      console.log('deliveryDataToSend:', deliveryDataToSend)
      console.log('full orderData:', orderData)

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      const fullUrl = `${apiUrl}/api/store/${slug}/orders`
      
      console.log('=== DEBUG: Request Info ===')
      console.log('API URL:', apiUrl)
      console.log('Full URL:', fullUrl)
      console.log('Slug:', slug)
      
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
      console.log('=== DEBUG: Backend Response ===')
      console.log('response status:', response.status)
      console.log('response result:', result)

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
    if (orderResult?.whatsapp_link) {
      window.open(orderResult.whatsapp_link, "_blank")
    }
  }

  const cartTotal = getCartTotal()
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {storeInfo.logo && (
                <Image src={storeInfo.logo} alt={storeInfo.name} width={50} height={50} className="rounded-full" />
              )}
              <div>
                <h1 className="text-2xl font-bold">{storeInfo.name}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  {storeInfo.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {storeInfo.phone}
                    </span>
                  )}
                  {storeInfo.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {storeInfo.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="relative"
                onClick={() => setCartCollapsed(!cartCollapsed)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
                <span className="ml-2 hidden md:inline">
                  {cartCollapsed ? 'Mostrar' : 'Ocultar'} Carrinho
                </span>
              </Button>
              
              {checkoutStep === "cart" && cart.length > 0 && (
                <Button
                  onClick={() => setCheckoutStep("checkout")}
                  className="hidden md:inline-flex"
                >
                  Finalizar Pedido
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {checkoutStep === "cart" && (
          <>
            {/* Products with Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto flex-wrap h-auto gap-2 mb-6 bg-transparent">
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Todos ({products.length})
                </TabsTrigger>
                {categories.map((category) => {
                  const count = products.filter(p => 
                    p.categories?.some(c => c.name === category)
                  ).length
                  return (
                    <TabsTrigger 
                      key={category} 
                      value={category}
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                    >
                      {category} ({count})
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value={selectedCategory} className="mt-6">
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">Nenhum produto encontrado nesta categoria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProducts.map((product) => {
                      const price = product.promotional_price || product.price
                      const hasDiscount = product.promotional_price && product.promotional_price < product.price

                      return (
                        <Card key={product.uuid} className="overflow-hidden">
                          <div className="aspect-square relative bg-muted">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                              </div>
                            )}
                            {hasDiscount && (
                              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                                {Math.round((1 - (getNumericPrice(product.promotional_price!) / getNumericPrice(product.price))) * 100)}% OFF
                              </Badge>
                            )}
                            {product.categories && product.categories.length > 0 && (
                              <Badge className="absolute bottom-2 left-2 bg-black/70 text-white">
                                {product.categories[0].name}
                              </Badge>
                            )}
                          </div>
                          <CardHeader className="p-4">
                            <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                            {product.description && (
                              <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                            )}
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="mb-3">
                              {hasDiscount && (
                                <p className="text-sm text-muted-foreground line-through">
                                  R$ {formatPrice(product.price)}
                                </p>
                              )}
                              <p className="text-2xl font-bold text-primary">R$ {formatPrice(price)}</p>
                            </div>
                            <Button onClick={() => addToCart(product)} className="w-full" disabled={product.qtd_stock === 0}>
                              {product.qtd_stock === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Cart Summary - Collapsible */}
            {cart.length > 0 && (
              <Card className={`mt-8 sticky bottom-4 transition-all duration-300 ${cartCollapsed ? 'shadow-lg' : 'shadow-xl'}`}>
                <CardHeader className="cursor-pointer" onClick={() => setCartCollapsed(!cartCollapsed)}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingCart className="h-5 w-5" />
                      Carrinho ({cartCount} {cartCount === 1 ? "item" : "itens"})
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      {cartCollapsed && (
                        <span className="text-lg font-bold">R$ {formatPrice(cartTotal)}</span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCartCollapsed(!cartCollapsed)
                        }}
                      >
                        {cartCollapsed ? 'Expandir' : 'Recolher'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                {!cartCollapsed && (
                  <CardContent>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto">
                      {cart.map((item) => {
                        const price = getNumericPrice(item.promotional_price || item.price)
                        return (
                          <div key={item.uuid} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{item.name}</p>
                              <p className="text-sm text-muted-foreground">R$ {formatPrice(item.promotional_price || item.price)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.uuid, -1)}>
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button size="sm" variant="outline" onClick={() => updateQuantity(item.uuid, 1)}>
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.uuid)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                            <p className="font-bold w-24 text-right">R$ {formatPrice(price * item.quantity)}</p>
                          </div>
                        )
                      })}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-between text-xl font-bold mb-4">
                      <span>Total</span>
                      <span className="text-primary">R$ {formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => setCart([])}>
                        Limpar Carrinho
                      </Button>
                      <Button className="flex-1" size="lg" onClick={() => setCheckoutStep("checkout")}>
                        Finalizar Pedido
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </>
        )}

        {checkoutStep === "checkout" && (
          <div className="max-w-4xl mx-auto">
            <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="mb-6">
              ← Voltar para o carrinho
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        <div>
                          <Label htmlFor="city">Cidade *</Label>
                          <Input
                            id="city"
                            value={deliveryData.city}
                            onChange={(e) => setDeliveryData({ ...deliveryData, city: e.target.value })}
                            required={shippingMethod === "delivery"}
                            placeholder="São Paulo"
                            className={validationErrors['delivery.city'] ? 'border-red-500' : ''}
                          />
                          {validationErrors['delivery.city'] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors['delivery.city']}</p>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="state">Estado *</Label>
                          <Input
                            id="state"
                            value={deliveryData.state}
                            onChange={handleStateChange}
                            maxLength={2}
                            required={shippingMethod === "delivery"}
                            placeholder="SP"
                            className={validationErrors['delivery.state'] ? 'border-red-500' : ''}
                          />
                          {validationErrors['delivery.state'] && (
                            <p className="text-sm text-red-500 mt-1">{validationErrors['delivery.state']}</p>
                          )}
                        </div>
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
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        {paymentMethods.map((method) => (
                          <div key={method.uuid} className="flex items-center space-x-2">
                            <RadioGroupItem value={method.uuid} id={method.uuid} />
                            <Label htmlFor={method.uuid} className="flex items-center gap-2 cursor-pointer">
                              {method.name}
                              {method.type && (
                                <Badge variant="outline" className="text-xs">
                                  {method.type}
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
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Resumo do Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cart.map((item) => {
                      const price = getNumericPrice(item.promotional_price || item.price)
                      return (
                        <div key={item.uuid} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>R$ {formatPrice(price * item.quantity)}</span>
                        </div>
                      )
                    })}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {formatPrice(cartTotal)}</span>
                    </div>
                    <Button className="w-full" size="lg" onClick={handleCheckout} disabled={submitting}>
                      {submitting ? "Finalizando..." : "Confirmar Pedido"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {checkoutStep === "success" && orderResult && (
          <div className="max-w-2xl mx-auto">
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
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Dados do Cliente</p>
                  <div className="space-y-1">
                    <p className="font-semibold">{clientData.name}</p>
                    <p className="text-sm text-muted-foreground">{clientData.email}</p>
                    <p className="text-sm text-muted-foreground">{clientData.phone}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Itens do Pedido</h3>
                  <div className="space-y-2">
                    {cart.map((item) => {
                      const price = getNumericPrice(item.promotional_price || item.price)
                      return (
                        <div key={item.uuid} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity}x R$ {formatPrice(item.promotional_price || item.price)}
                            </p>
                          </div>
                          <p className="font-bold">R$ {formatPrice(price * item.quantity)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Payment and Shipping Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Forma de Pagamento</p>
                    <p className="font-semibold">{translatePaymentMethod(paymentMethod)}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Método de Entrega</p>
                    <p className="font-semibold">{translateShippingMethod(shippingMethod)}</p>
                  </div>
                </div>

                {/* Delivery Address (if delivery is selected) */}
                {shippingMethod === "delivery" && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Endereço de Entrega</p>
                    <div className="space-y-1">
                      <p className="font-medium">
                        {deliveryData.address}, {deliveryData.number}
                      </p>
                      {deliveryData.complement && (
                        <p className="text-sm text-muted-foreground">
                          {deliveryData.complement}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        {deliveryData.neighborhood} - {deliveryData.city}/{deliveryData.state}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CEP: {deliveryData.zip_code}
                      </p>
                      {deliveryData.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Observações:</strong> {deliveryData.notes}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-primary/10 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Total do Pedido</p>
                  <p className="text-3xl font-bold text-primary">R$ {orderResult.total}</p>
                </div>

                {/* Next Steps */}
                <div className="space-y-2">
                  <p className="font-medium">Próximos Passos:</p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Confirme seu pedido via WhatsApp</li>
                    <li>Aguarde a confirmação da loja</li>
                    <li>Você receberá atualizações sobre o status do pedido</li>
                  </ol>
                </div>

                <Button className="w-full" size="lg" onClick={openWhatsApp}>
                  <Phone className="mr-2 h-5 w-5" />
                  Enviar Pedido via WhatsApp
                </Button>

                <Button variant="outline" className="w-full" onClick={() => {
                  setCheckoutStep("cart")
                  setOrderResult(null)
                }}>
                  Fazer Novo Pedido
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
