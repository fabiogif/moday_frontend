'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Package, MapPin, User, Phone, Mail, ArrowLeft, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { OrderStatusTracker } from '@/components/order-status-tracker'
import { PageLoading } from '@/components/ui/loading-progress'
import { apiClient, endpoints } from '@/lib/api-client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OrderProduct {
  name: string
  quantity: number
  price: number
}

interface OrderData {
  identify: string
  status: string
  total: number
  is_delivery: boolean
  client?: {
    name: string
    email?: string
    phone?: string
  }
  delivery_address?: string
  delivery_city?: string
  delivery_state?: string
  delivery_zip_code?: string
  delivery_neighborhood?: string
  delivery_number?: string
  delivery_complement?: string
  delivery_notes?: string
  products: OrderProduct[]
  created_at: string
  updated_at?: string
}

function OrderSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      toast.error('ID do pedido não encontrado')
      router.push('/orders')
      return
    }

    const fetchOrder = async () => {
      try {
        const response = await apiClient.get<any>(endpoints.orders.show(orderId))
        if (response.success && response.data) {
          setOrder(response.data)
        } else {
          throw new Error('Pedido não encontrado')
        }
      } catch (error) {
        console.error('Erro ao buscar pedido:', error)
        toast.error('Não foi possível carregar os detalhes do pedido')
        router.push('/orders')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  if (loading) {
    return <PageLoading />
  }

  if (!order) {
    return null
  }

  const fullAddress = order.is_delivery && order.delivery_address
    ? `${order.delivery_address}${order.delivery_number ? ', ' + order.delivery_number : ''} - ${order.delivery_neighborhood || ''}, ${order.delivery_city || ''} - ${order.delivery_state || ''} ${order.delivery_zip_code ? '- CEP: ' + order.delivery_zip_code : ''}`
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-background to-blue-50 dark:from-emerald-950/20 dark:via-background dark:to-blue-950/20">
      <div className="max-w-4xl mx-auto p-4 lg:p-8 space-y-6">
        {/* Success Header */}
        <div
          className="text-center space-y-4 py-8 animate-in fade-in-0 zoom-in-95 duration-500"
        >
          <div className="inline-block animate-in zoom-in-50 duration-500" style={{ animationDelay: '200ms' }}>
            <div className="h-24 w-24 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto relative">
              <CheckCircle2 className="h-16 w-16 text-emerald-600 dark:text-emerald-400" />
              <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-30" />
            </div>
          </div>

          <div className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '300ms' }}>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Pedido Realizado com Sucesso!
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Seu pedido foi confirmado e já está sendo processado
            </p>
          </div>

          <div
            className="flex items-center justify-center gap-2 animate-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '400ms' }}
          >
            <span className="text-sm text-muted-foreground">Número do pedido:</span>
            <Badge className="text-lg px-4 py-1.5 font-mono">
              #{order.identify}
            </Badge>
          </div>
        </div>

        {/* Status Tracker - Only for delivery */}
        {order.is_delivery && (
          <div
            className="animate-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: '500ms' }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Status da Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderStatusTracker
                  currentStatus={order.status as any}
                  createdAt={order.created_at}
                  updatedAt={order.updated_at}
                  estimatedDelivery="30-45 minutos"
                />
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Order Details */}
          <div
            className="animate-in slide-in-from-left-4 duration-500"
            style={{ animationDelay: '600ms' }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detalhes do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Products */}
                <div className="space-y-3">
                  {order.products.map((product, index) => (
                    <div key={index} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {product.quantity}x
                          </Badge>
                          <span className="text-sm font-medium">{product.name}</span>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        R$ {(product.price * product.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
                    R$ {order.total.toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customer & Delivery Info */}
          <div
            className="space-y-6 animate-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: '700ms' }}
          >
            {/* Customer Info */}
            {order.client && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.client.name}</span>
                  </div>
                  {order.client.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{order.client.email}</span>
                    </div>
                  )}
                  {order.client.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.client.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Delivery Address */}
            {order.is_delivery && fullAddress && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-relaxed">
                    {fullAddress}
                  </p>
                  {order.delivery_complement && (
                    <p className="text-sm text-muted-foreground">
                      <strong>Complemento:</strong> {order.delivery_complement}
                    </p>
                  )}
                  {order.delivery_notes && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                        Observações
                      </p>
                      <p className="text-sm italic">"{order.delivery_notes}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <div
          className="flex flex-wrap gap-3 justify-center animate-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '800ms' }}
        >
          <Button
            onClick={() => router.push('/orders')}
            variant="outline"
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver Todos os Pedidos
          </Button>
          
          <Button
            onClick={() => router.push('/orders/new')}
            className="gap-2"
          >
            <Package className="h-4 w-4" />
            Fazer Novo Pedido
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.print()}
          >
            <Download className="h-4 w-4" />
            Imprimir Comprovante
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<PageLoading />}>
      <OrderSuccessContent />
    </Suspense>
  )
}

