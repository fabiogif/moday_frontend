'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode, useRef } from 'react'
import { useAuth } from './auth-context'
import { useRealtimeOrders } from '@/hooks/use-realtime'
import { playNotificationSound } from '@/lib/notification-sound'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Eye } from 'lucide-react'
import { useOrderRefresh } from '@/hooks/use-order-refresh'

interface OrderNotification {
  id: string
  orderId: string
  orderIdentify: string
  customerName: string
  total: string
  createdAt: string
  timestamp: number
}

interface OrderNotificationsContextData {
  notifications: OrderNotification[]
  soundEnabled: boolean
  setSoundEnabled: (enabled: boolean) => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
}

const OrderNotificationsContext = createContext<OrderNotificationsContextData>({} as OrderNotificationsContextData)

interface OrderNotificationsProviderProps {
  children: ReactNode
}

export function OrderNotificationsProvider({ children }: OrderNotificationsProviderProps) {
  const router = useRouter()
  const { user } = useAuth()
  const { triggerRefresh } = useOrderRefresh()
  const [notifications, setNotifications] = useState<OrderNotification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Usar refs para evitar re-renders no useEffect de polling
  const processedOrderIdsRef = useRef<Set<string>>(new Set())
  
  // Inicializar lastCheckedOrderId do localStorage
  const initialLastCheckedOrderId = typeof window !== 'undefined' 
    ? localStorage.getItem('lastCheckedOrderId') 
    : null
  const lastCheckedOrderIdRef = useRef<string | null>(initialLastCheckedOrderId)

  // Carregar preferência de som do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('orderNotificationSoundEnabled')
    if (stored !== null) {
      setSoundEnabled(stored === 'true')
    }
  }, [])

  // Salvar preferência quando mudar
  useEffect(() => {
    localStorage.setItem('orderNotificationSoundEnabled', soundEnabled.toString())
  }, [soundEnabled])

  const tenantId = typeof user?.tenant_id === 'number' 
    ? user.tenant_id 
    : typeof user?.tenant_id === 'string' 
    ? parseInt(user.tenant_id) 
    : 0

  // Callback para novos pedidos
  const handleNewOrder = useCallback((order: any) => {
    // Verificar se já processamos este pedido
    const orderId = order.id?.toString() || order.identify
    
    if (processedOrderIdsRef.current.has(orderId)) {
      return
    }
    
    // Marcar como processado
    processedOrderIdsRef.current.add(orderId)

    const notification: OrderNotification = {
      id: `order-${orderId}-${Date.now()}`,
      orderId: order.id?.toString() || '',
      orderIdentify: order.identify || order.order_id || `#${order.id}`,
      customerName: order.customer_name || order.client?.name || order.customerName || 'Cliente',
      total: order.total || order.total_amount || '0,00',
      createdAt: order.created_at || new Date().toISOString(),
      timestamp: Date.now(),
    }

    // Adicionar à lista de notificações
    setNotifications((prev) => [notification, ...prev].slice(0, 10)) // Manter apenas últimas 10
    
    // Reproduzir som se habilitado
    if (soundEnabled) {
      playNotificationSound()
    }

    // Exibir toast com ação
    toast(
      <div className="flex items-start gap-3 w-full">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white flex-shrink-0">
          <ShoppingCart className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base">Novo Pedido! 🎉</p>
          <p className="text-sm text-muted-foreground mt-0.5">
            <strong>#{notification.orderIdentify}</strong> • {notification.customerName}
          </p>
          <p className="text-sm font-medium mt-1">
            Valor: R$ {notification.total}
          </p>
        </div>
      </div>,
      {
        duration: 10000,
        position: 'top-right',
        action: {
          label: 'Ver Pedido',
          onClick: () => {
            router.push('/orders')
          },
        },
        className: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
      }
    )
  }, [soundEnabled, router])
  // processedOrderIdsRef é ref, não precisa estar nas dependências

  // Conectar ao WebSocket
  const { isConnected } = useRealtimeOrders({
    tenantId,
    onOrderCreated: handleNewOrder,
    enabled: !!tenantId && tenantId > 0,
  })

  // Fallback: Polling se WebSocket não estiver disponível
  useEffect(() => {
    if (isConnected || !tenantId || tenantId === 0) {
      return // WebSocket está funcionando, não precisa de polling
    }

    // Usar polling apenas se WebSocket falhar
    const checkForNewOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token') || localStorage.getItem('token')
        if (!token) {
          return
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order?per_page=1&sort=created_at&order=desc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
        
        if (response.ok) {
          const data = await response.json()
          
          // API pode retornar data.data.data (paginado) ou data.data (array direto)
          const orders = Array.isArray(data.data?.data) ? data.data.data : 
                        Array.isArray(data.data) ? data.data : []
                    
          if (orders.length > 0) {
            const latestOrder = orders[0]
            const orderId = latestOrder.id?.toString() || latestOrder.identify
            
            const lastCheckedOrderId = lastCheckedOrderIdRef.current
            
            // SOLUÇÃO DEFINITIVA: Detectar por mudança de ID ao invés de timestamp
            // Se o ID do último pedido mudou, é um pedido novo
            const isNewOrder = lastCheckedOrderId !== null && orderId !== lastCheckedOrderId
            
            if (isNewOrder && !processedOrderIdsRef.current.has(orderId)) {
              handleNewOrder(latestOrder)
              
              // Salvar imediatamente no localStorage e ref
              localStorage.setItem('lastCheckedOrderId', orderId)
              lastCheckedOrderIdRef.current = orderId
              
              // Disparar atualização da lista de pedidos
              triggerRefresh()
            } else if (lastCheckedOrderId === null) {
              // Primeira verificação - não notificar, apenas registrar
              // Salvar no localStorage e ref
              localStorage.setItem('lastCheckedOrderId', orderId)
              lastCheckedOrderIdRef.current = orderId
            }
          }
        }
      } catch (error) {
        // Erro silencioso no polling
      }
    }

    // Fazer primeira checagem imediatamente
    checkForNewOrders()
    
    // Polling a cada 5 segundos
    const interval = setInterval(checkForNewOrders, 5000)
    
    return () => {
      clearInterval(interval)
    }
  }, [isConnected, tenantId, handleNewOrder])
  
  // processedOrderIdsRef, lastCheckedOrderIdRef e triggerRefresh são refs/funções estáveis
  // NÃO devem estar nas dependências para evitar re-renders infinitos

  const clearNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  const clearAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <OrderNotificationsContext.Provider
      value={{
        notifications,
        soundEnabled,
        setSoundEnabled,
        clearNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </OrderNotificationsContext.Provider>
  )
}

export const useOrderNotifications = () => {
  const context = useContext(OrderNotificationsContext)
  
  if (!context) {
    throw new Error('useOrderNotifications must be used within OrderNotificationsProvider')
  }
  
  return context
}

