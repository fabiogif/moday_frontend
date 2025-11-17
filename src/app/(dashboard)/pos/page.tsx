"use client"

import { useMemo, useState, useEffect } from "react"
import Image from "next/image"
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
} from "lucide-react"
import { maskPhone, maskZipCode } from "@/lib/masks"

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
  product: Product
  quantity: number
  observation: string
}

function extractCollection<T>(raw: any): T[] {
  if (!raw) return []
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

function getProductPrice(product: Product): number {
  const base = product.promotional_price ?? product.price
  if (typeof base === "string") {
    const parsed = parseFloat(base)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return base ?? 0
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
    return groupedProducts[selectedCategory] || []
  }, [groupedProducts, selectedCategory])

  const orderTotal = useMemo(
    () => cart.reduce((sum, item) => sum + getProductPrice(item.product) * item.quantity, 0),
    [cart]
  )

  const selectedTableName = useMemo(() => {
    if (!selectedTable) return null
    const table = tables.find(
      (t) => (t.uuid || t.identify || t.name) === selectedTable
    )
    return table?.name || null
  }, [selectedTable, tables])

  const addItemToCart = (product: Product) => {
    const productId = getProductId(product)
    setCart((prev) => {
      const exists = prev.find((item) => getProductId(item.product) === productId)
      if (exists) {
        return prev.map((item) =>
          getProductId(item.product) === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { product, quantity: 1, observation: "" }]
    })
    toast.success(`${product.name} adicionado ao pedido`)
  }

  const updateItemQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (getProductId(item.product) !== productId) return item
          const newQty = item.quantity + delta
          return { ...item, quantity: newQty }
        })
        .filter((item) => item.quantity > 0)
    )
  }

  const updateItemObservation = (productId: string, value: string) => {
    setCart((prev) =>
      prev.map((item) =>
        getProductId(item.product) === productId ? { ...item, observation: value } : item
      )
    )
  }

  const removeItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => getProductId(item.product) !== productId))
  }

  const clearCart = () => {
    setCart([])
    setOrderNotes("")
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
        price: getProductPrice(item.product),
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
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Ponto de Venda</p>
            <h1 className="text-2xl font-semibold tracking-tight lg:text-3xl">PDV - Tahan</h1>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 text-base">
              <ShoppingCart className="h-4 w-4" />
              Total de itens: {cart.reduce((sum, item) => sum + item.quantity, 0)}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-2 px-4 py-2 text-base">
              <Utensils className="h-4 w-4" />
              {selectedTableName || (isDelivery ? "Delivery" : "Selecione uma mesa")}
            </Badge>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <section className="space-y-6">
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-blue-900 dark:text-blue-100">Categorias</CardTitle>
              <CardDescription className="text-blue-700 dark:text-blue-300">Selecione uma categoria para ver os produtos.</CardDescription>
            </CardHeader>
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
          </Card>

          <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-green-900 dark:text-green-100">Produtos</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">Toque em um item para adicioná-lo ao pedido.</CardDescription>
            </CardHeader>
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
                          onClick={() => addItemToCart(product)}
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
          </Card>
        </section>

        <aside id="order-summary">
          <Card className="sticky top-4 space-y-0 border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader className="space-y-1">
              <CardTitle className="text-xl text-orange-900 dark:text-orange-100">Carrinho</CardTitle>
              <CardDescription className="text-orange-700 dark:text-orange-300">Gerencie os itens e finalize o pedido.</CardDescription>
            </CardHeader>
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
                <div className="space-y-3">
                  <p className="text-sm font-medium">Selecione a mesa</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tables.map((table) => {
                      const key = table.uuid || table.identify || table.name
                      const active = selectedTable === key
                      return (
                        <Button
                          key={key}
                          data-testid={`table-button-${key}`}
                          onClick={() => setSelectedTable(key)}
                          className={cn(
                            "h-16 rounded-2xl text-lg",
                            active
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          )}
                        >
                          {table.name}
                        </Button>
                      )
                    })}
                  </div>
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
                      const price = getProductPrice(item.product)
                      return (
                        <div
                          key={productId}
                          data-testid={`cart-item-${productId}`}
                          className="rounded-2xl border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold">{item.product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency(price)} cada
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Remover ${item.product.name}`}
                              onClick={() => removeItem(productId)}
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
                              onClick={() => updateItemQuantity(productId, -1)}
                            >
                              <Minus className="h-5 w-5" />
                            </Button>
                            <span
                              data-testid={`cart-item-qty-${productId}`}
                              className="min-w-[56px] rounded-2xl bg-muted px-4 py-2 text-center text-lg font-semibold"
                            >
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-12 w-12 rounded-2xl"
                              aria-label={`Aumentar ${item.product.name}`}
                              onClick={() => updateItemQuantity(productId, 1)}
                            >
                              <Plus className="h-5 w-5" />
                            </Button>
                            <span className="ml-auto text-lg font-semibold">
                              {formatCurrency(price * item.quantity)}
                            </span>
                          </div>
                          <Input
                            value={item.observation}
                            onChange={(event) => updateItemObservation(productId, event.target.value)}
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
                  className="min-h-[80px] rounded-2xl"
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium">Forma de pagamento</p>
                <div className="grid gap-2">
                  {paymentMethods.map((method) => {
                    const active = selectedPaymentMethod === method.uuid
                    return (
                      <Button
                        key={method.uuid}
                        data-testid={`payment-button-${method.uuid}`}
                        onClick={() => setSelectedPaymentMethod(method.uuid)}
                        className={cn(
                          "h-14 rounded-2xl justify-between",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                        )}
                      >
                        <span>{method.name}</span>
                        {method.description && (
                          <span className="text-xs text-muted-foreground">{method.description}</span>
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

              <div className="flex flex-col gap-3">
                <Button
                  data-testid="finalize-order-button"
                  onClick={handleFinalizeOrder}
                  disabled={submittingOrder || !cart.length}
                  className="h-16 rounded-2xl text-xl"
                >
                  {submittingOrder && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  Finalizar pedido
                </Button>
                <Button
                  variant="outline"
                  onClick={clearCart}
                  disabled={!cart.length}
                  className="h-14 rounded-2xl text-lg"
                >
                  Limpar carrinho
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}

