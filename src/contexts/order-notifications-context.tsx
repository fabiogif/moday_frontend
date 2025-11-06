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
    console.log('🔔 handleNewOrder CHAMADO', { order, timestamp: new Date().toISOString() })
    
    // Verificar se já processamos este pedido
    const orderId = order.id?.toString() || order.identify
    console.log('🔔 Verificando duplicata:', { orderId, jaProcessado: processedOrderIdsRef.current.has(orderId) })
    
    if (processedOrderIdsRef.current.has(orderId)) {
      console.log('⚠️ Pedido já processado, ignorando')
      return
    }
    
    // Marcar como processado
    processedOrderIdsRef.current.add(orderId)
    console.log('✅ Pedido marcado como processado:', orderId)

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

    console.log('🔔 Notificação criada:', notification)
    
    // Reproduzir som se habilitado
    if (soundEnabled) {
      console.log('🔊 Tocando som...')
      playNotificationSound()
    } else {
      console.log('🔇 Som desabilitado')
    }

    // Exibir toast com ação
    console.log('📱 Exibindo toast...')
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

  console.log('🌐 OrderNotificationsProvider:', { 
    tenantId, 
    enabled: !!tenantId && tenantId > 0,
    user: user?.name || 'null'
  })

  // Conectar ao WebSocket
  const { isConnected } = useRealtimeOrders({
    tenantId,
    onOrderCreated: handleNewOrder,
    enabled: !!tenantId && tenantId > 0,
  })

  console.log('🔌 WebSocket status:', { isConnected })

  // Fallback: Polling se WebSocket não estiver disponível
  useEffect(() => {
    console.log('⏱️ Polling useEffect:', { isConnected, tenantId })
    
    if (isConnected || !tenantId || tenantId === 0) {
      console.log('⏭️ Polling desabilitado:', { 
        reason: isConnected ? 'WebSocket conectado' : 'Tenant inválido',
        isConnected,
        tenantId 
      })
      return // WebSocket está funcionando, não precisa de polling
    }

    console.log('⏱️ Iniciando polling (WebSocket não disponível)...')

    // Usar polling apenas se WebSocket falhar
    const checkForNewOrders = async () => {
      try {
        const token = localStorage.getItem('auth-token') || localStorage.getItem('token')
        if (!token) {
          console.log('⚠️ Polling: Sem token', {
            authToken: !!localStorage.getItem('auth-token'),
            token: !!localStorage.getItem('token')
          })
          return
        }

        console.log('🔍 Polling: Buscando pedidos...', { hasToken: !!token })
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order?per_page=1&sort=created_at&order=desc`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })

        console.log('📡 Polling: Resposta recebida', { status: response.status, ok: response.ok })
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 Polling: Dados recebidos', data)
          
          // API pode retornar data.data.data (paginado) ou data.data (array direto)
          const orders = Array.isArray(data.data?.data) ? data.data.data : 
                        Array.isArray(data.data) ? data.data : []
          
          console.log('📋 Polling: Pedidos extraídos', { count: orders.length, orders })
          
          if (orders.length > 0) {
            const latestOrder = orders[0]
            const orderId = latestOrder.id?.toString() || latestOrder.identify
            
            const lastCheckedOrderId = lastCheckedOrderIdRef.current
            
            console.log('🔍 Polling: Verificando último pedido', { 
              orderId, 
              lastCheckedOrderId,
              localStorage: localStorage.getItem('lastCheckedOrderId'),
              isNewOrder: orderId !== lastCheckedOrderId,
              alreadyProcessed: processedOrderIdsRef.current.has(orderId)
            })
            
            // SOLUÇÃO DEFINITIVA: Detectar por mudança de ID ao invés de timestamp
            // Se o ID do último pedido mudou, é um pedido novo
            const isNewOrder = lastCheckedOrderId !== null && orderId !== lastCheckedOrderId
            
            if (isNewOrder && !processedOrderIdsRef.current.has(orderId)) {
              console.log('🎯🎯🎯 POLLING: NOVO PEDIDO DETECTADO (ID MUDOU)! 🎯🎯🎯', {
                newOrderId: orderId,
                previousOrderId: lastCheckedOrderId,
                timestamp: new Date().toLocaleString('pt-BR')
              })
              handleNewOrder(latestOrder)
              
              // Salvar imediatamente no localStorage e ref
              localStorage.setItem('lastCheckedOrderId', orderId)
              lastCheckedOrderIdRef.current = orderId
              
              // Disparar atualização da lista de pedidos
              console.log('🔄 Disparando refresh da lista de pedidos...')
              triggerRefresh()
            } else if (lastCheckedOrderId === null) {
              // Primeira verificação - não notificar, apenas registrar
              console.log('📝 Polling: Primeira verificação, registrando último pedido:', orderId)
              // Salvar no localStorage e ref
              localStorage.setItem('lastCheckedOrderId', orderId)
              lastCheckedOrderIdRef.current = orderId
            } else if (processedOrderIdsRef.current.has(orderId)) {
              console.log('⏭️ Polling: Pedido já foi processado (não notificar novamente)', {
                orderId,
                lastCheckedOrderId
              })
            } else {
              console.log('⏭️ Polling: Mesmo pedido da última verificação', {
                orderId,
                lastCheckedOrderId,
                idsIguais: orderId === lastCheckedOrderId
              })
            }
          }
        } else {
          console.log('❌ Polling: Resposta não OK', response.status)
        }
      } catch (error) {
        console.error('❌ Polling: Erro', error)
      }
    }

    // Fazer primeira checagem imediatamente
    console.log('⚡ Polling: Fazendo primeira checagem imediata...')
    checkForNewOrders()
    
    // Polling a cada 5 segundos
    console.log('⏱️ Polling: Interval configurado (5s)')
    const interval = setInterval(checkForNewOrders, 5000)
    
    return () => {
      console.log('🛑 Polling: Limpando interval')
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

