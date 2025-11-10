"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay,
  DragStartEvent,
  useDroppable, 
  useDraggable, 
  closestCorners, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageLoading } from "@/components/ui/loading-progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { apiClient, endpoints } from "@/lib/api-client"
import { toast } from "sonner"
import { useRealtimeOrders } from "@/hooks/use-realtime"
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  User, 
  Package, 
  MapPin,
  Truck,
  UtensilsCrossed,
  Archive
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Product {
  identify?: string
  name: string
  price: string | number
  quantity?: number
}

interface Client {
  id: number
  name: string
  email?: string
  phone?: string
}

interface Table {
  id: number
  identify?: string
  name: string
  capacity?: string | number
}

interface Order {
  identify: string
  total: string | number
  client?: Client
  client_full_name?: string
  client_email?: string
  client_phone?: string
  table?: Table
  status: string
  date: string
  created_at: string
  products: Product[]
  is_delivery?: boolean
  full_delivery_address?: string
  delivery_address?: string
  delivery_city?: string
  delivery_state?: string
  delivery_zip_code?: string
  delivery_neighborhood?: string
  delivery_number?: string
  delivery_complement?: string
  delivery_notes?: string
  comment?: string
}

type OrderStatus = "Em Preparo" | "Pronto" | "Saiu para entrega" | "A Caminho" | "Entregue" | "Concluído" | "Cancelado"

const COLUMNS: Array<{ 
  id: OrderStatus
  title: string
  badgeColor: string
  headerGradient: string
  icon: React.ReactNode
}> = [
  { 
    id: "Em Preparo", 
    title: "Em Preparo", 
    badgeColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    headerGradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30",
    icon: <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
  },
  { 
    id: "Pronto", 
    title: "Pronto", 
    badgeColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    headerGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30",
    icon: <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
  },
  { 
    id: "Saiu para entrega", 
    title: "Saiu para entrega", 
    badgeColor: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
    headerGradient: "from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30",
    icon: <Truck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
  },
  { 
    id: "A Caminho", 
    title: "A Caminho", 
    badgeColor: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
    headerGradient: "from-indigo-50 to-indigo-100/50 dark:from-indigo-950/50 dark:to-indigo-900/30",
    icon: <Truck className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
  },
  { 
    id: "Entregue", 
    title: "Entregue", 
    badgeColor: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    headerGradient: "from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30",
    icon: <Truck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
  },
  { 
    id: "Concluído", 
    title: "Concluído", 
    badgeColor: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    headerGradient: "from-green-50 to-green-100/50 dark:from-green-950/50 dark:to-green-900/30",
    icon: <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
  },
  { 
    id: "Cancelado", 
    title: "Cancelado", 
    badgeColor: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
    headerGradient: "from-rose-50 to-rose-100/50 dark:from-rose-950/50 dark:to-rose-900/30",
    icon: <RefreshCw className="h-4 w-4 text-rose-600 dark:text-rose-400" />
  },
]

interface OrderCardProps {
  order: Order
  isDragOverlay?: boolean
  onArchive: (order: Order) => void
}

function OrderCard({ order, isDragOverlay = false, onArchive }: OrderCardProps) {
  const { 
    setNodeRef, 
    attributes, 
    listeners, 
    transform, 
    isDragging 
  } = useDraggable({ 
    id: `order-${order.identify}`,
    data: { order }
  })
  
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: isDragOverlay ? 'grabbing' : 'grab',
  }
  
  const deliveryAddress = order.is_delivery && (
    order.full_delivery_address || 
    (order.delivery_address && `${order.delivery_address}${order.delivery_number ? ', ' + order.delivery_number : ''} - ${order.delivery_neighborhood || ''}, ${order.delivery_city || ''} - ${order.delivery_state || ''}`)
  )

  const customerName = order.client?.name || order.client_full_name
  const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total
  
  const columnInfo = COLUMNS.find(col => col.id === order.status)
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border bg-card transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] active:scale-100",
        isDragging && "shadow-2xl border-primary ring-2 ring-primary/50 ring-offset-2 scale-105",
        isDragOverlay && "shadow-2xl rotate-2",
        "cursor-grab active:cursor-grabbing"
      )}
      {...attributes}
      {...listeners}
    >
      {/* Barra de cor superior */}
      <div className={cn(
        "h-1 rounded-t-lg",
        order.status === "Em Preparo" && "bg-gradient-to-r from-amber-400 to-amber-600",
        order.status === "Pronto" && "bg-gradient-to-r from-blue-400 to-blue-600",
        order.status === "Saiu para entrega" && "bg-gradient-to-r from-purple-400 to-purple-600",
        order.status === "A Caminho" && "bg-gradient-to-r from-indigo-400 to-indigo-600",
        order.status === "Entregue" && "bg-gradient-to-r from-emerald-400 to-emerald-600",
        order.status === "Concluído" && "bg-gradient-to-r from-green-400 to-green-600",
        order.status === "Cancelado" && "bg-gradient-to-r from-rose-400 to-rose-600"
      )} />
      
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {columnInfo?.icon}
            <span className="font-semibold text-base tracking-tight">#{order.identify}</span>
          </div>
        <div className="flex items-center gap-1.5">
          <Badge 
            variant="outline" 
            className={cn("text-xs font-medium border", columnInfo?.badgeColor)}
          >
            {order.status}
          </Badge>
          <Button
            variant="ghost"
            size="icon"
            title="Arquivar pedido"
            aria-label={`Arquivar pedido ${order.identify}`}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            disabled={isDragOverlay}
            onClick={(event) => {
              event.stopPropagation()
              onArchive(order)
            }}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
        </div>
        
        {/* Info Section */}
        <div className="space-y-2.5">
          {customerName && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate font-medium">{customerName}</span>
            </div>
          )}

          {order.table && (
            <div className="flex items-center gap-2 text-sm">
              <UtensilsCrossed className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{order.table.name}</span>
            </div>
          )}
          
          {deliveryAddress && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed line-clamp-2 break-words">{deliveryAddress}</span>
              </div>
              {order.delivery_notes && (
                <div className="text-xs text-muted-foreground italic pl-5 line-clamp-1">
                  "{order.delivery_notes}"
                </div>
              )}
            </div>
          )}
          
          {order.products && order.products.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                <Package className="h-3 w-3" />
                Produtos ({order.products.length})
              </div>
              <div className="space-y-1 pl-5">
                {order.products.slice(0, 2).map((product, idx) => (
                  <div key={product.identify || idx} className="flex items-start gap-2 text-xs">
                    <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-medium">
                      {product.quantity || 1}x
                    </Badge>
                    <span className="truncate leading-5">{product.name}</span>
                  </div>
                ))}
                {order.products.length > 2 && (
                  <div className="text-xs text-muted-foreground font-medium">
                    +{order.products.length - 2} item(s)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer - Total */}
        <div className="flex items-center justify-between pt-3 border-t">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</span>
          <span className="text-lg font-bold bg-gradient-to-br from-primary to-primary/70 bg-clip-text text-transparent">
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
      
      {/* Indicador de drag */}
      <div className="absolute inset-0 rounded-lg bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </div>
  )
}

interface DroppableColumnAreaProps {
  columnId: OrderStatus
  children: React.ReactNode
}

function DroppableColumnArea({ columnId, children }: DroppableColumnAreaProps) {
  const { setNodeRef, isOver } = useDroppable({ 
    id: `column-${columnId}`, 
    data: { column: columnId } 
  })
  
  return (
    <div 
      ref={setNodeRef} 
      className={cn(
        "flex flex-col gap-3 min-h-[400px] p-3 rounded-lg transition-all duration-200",
        isOver && "bg-primary/5 border-2 border-dashed border-primary ring-2 ring-primary/20"
      )}
    >
      {children}
    </div>
  )
}

interface BoardColumnProps {
  column: { 
    id: OrderStatus
    title: string
    badgeColor: string
    headerGradient: string
    icon: React.ReactNode
  }
  orders: Order[]
  isUpdating: boolean
  onArchive: (order: Order) => void
}

function BoardColumn({ column, orders, isUpdating, onArchive }: BoardColumnProps) {
  return (
    <Card
      className={cn(
        "border-2 shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col h-full",
        "w-full min-w-[260px] sm:min-w-[280px] md:min-w-[300px]"
      )}
    >
      <CardHeader className={cn(
        "flex flex-row items-center justify-between space-y-0 pb-4 rounded-t-lg bg-gradient-to-br",
        column.headerGradient
      )}>
        <CardTitle className="flex items-center gap-2.5">
          {column.icon}
          <span className="text-lg font-bold tracking-tight">{column.title}</span>
        </CardTitle>
        <Badge 
          variant="outline" 
          className={cn(
            "text-sm font-bold px-2.5 py-1 border-2",
            column.badgeColor
          )}
        >
          {orders.length}
        </Badge>
      </CardHeader>
      <CardContent className="p-0 flex-1 flex flex-col">
        <ScrollArea className="flex-1">
          <DroppableColumnArea columnId={column.id}>
            {orders.length === 0 && !isUpdating && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                  {column.icon}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Nenhum pedido
                </p>
              </div>
            )}
            
            {orders.map((order) => (
              <OrderCard key={order.identify} order={order} onArchive={onArchive} />
            ))}
            
            {isUpdating && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-4">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="font-medium">Atualizando...</span>
              </div>
            )}
          </DroppableColumnArea>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default function OrdersBoardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [updatingIdentify, setUpdatingIdentify] = useState<string | null>(null)
  const [activeOrder, setActiveOrder] = useState<Order | null>(null)
  const [dynamicColumns, setDynamicColumns] = useState(COLUMNS)
  const [orderToArchive, setOrderToArchive] = useState<Order | null>(null)
  const [archiving, setArchiving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const tenantId = user?.tenant_id ? parseInt(user.tenant_id, 10) : 0

  const openArchiveDialog = useCallback((order: Order) => {
    setOrderToArchive(order)
  }, [])

  const cancelArchiveDialog = useCallback(() => {
    if (!archiving) {
      setOrderToArchive(null)
    }
  }, [archiving])

  const confirmArchiveOrder = useCallback(async () => {
    if (!orderToArchive) return

    try {
      setArchiving(true)
      await apiClient.patch(endpoints.orders.archive(orderToArchive.identify))
      toast.success(`Pedido #${orderToArchive.identify} arquivado com sucesso!`)
      setOrders((prev) => prev.filter((order) => order.identify !== orderToArchive.identify))
      setOrderToArchive(null)
    } catch (error: any) {
      toast.error(error?.message || 'Erro ao arquivar pedido')
    } finally {
      setArchiving(false)
    }
  }, [orderToArchive])

  const normalizeOrder = useCallback((rawOrder: any): Order => {
    const total = typeof rawOrder.total === 'string' 
      ? parseFloat(rawOrder.total) 
      : (rawOrder.total || 0)

    return {
      identify: rawOrder.identify || String(rawOrder.id),
      total,
      client: rawOrder.client,
      client_full_name: rawOrder.client?.name || rawOrder.client_full_name,
      client_email: rawOrder.client?.email || rawOrder.client_email,
      client_phone: rawOrder.client?.phone || rawOrder.client_phone,
      table: rawOrder.table,
      status: rawOrder.status || "Em Preparo",
      date: rawOrder.date || rawOrder.created_at,
      created_at: rawOrder.created_at,
      products: Array.isArray(rawOrder.products) 
        ? rawOrder.products.map((p: any) => ({
            identify: p.identify,
            name: p.name || 'Produto',
            price: p.price || '0.00',
            quantity: p.quantity || 1,
          }))
        : [],
      is_delivery: rawOrder.is_delivery || false,
      full_delivery_address: rawOrder.full_delivery_address,
      delivery_address: rawOrder.delivery_address,
      delivery_city: rawOrder.delivery_city,
      delivery_state: rawOrder.delivery_state,
      delivery_zip_code: rawOrder.delivery_zip_code,
      delivery_neighborhood: rawOrder.delivery_neighborhood,
      delivery_number: rawOrder.delivery_number,
      delivery_complement: rawOrder.delivery_complement,
      delivery_notes: rawOrder.delivery_notes,
      comment: rawOrder.comment,
    }
  }, [])

  const { isConnected } = useRealtimeOrders({
    tenantId,
    enabled: !!user?.tenant_id,
    onOrderCreated: useCallback((newOrder: any) => {
      // console.log('Real-time: New order created', newOrder)
      const normalized = normalizeOrder(newOrder)

      if (normalized.status === 'Arquivado') {
        return
      }

      setOrders((prev) => {
        if (prev.some(o => o.identify === normalized.identify)) {
          return prev
        }
        return [normalized, ...prev]
      })

      toast.success(`Novo pedido #${normalized.identify} criado!`)
    }, [normalizeOrder]),
    
    onOrderStatusUpdated: useCallback(({ order: updatedOrder, oldStatus, newStatus }: any) => {
      // console.log('Real-time: Order status updated', { updatedOrder, oldStatus, newStatus })
      const normalized = normalizeOrder(updatedOrder)

      if (newStatus === 'Arquivado' || normalized.status === 'Arquivado') {
        setOrders((prev) => prev.filter((o) => o.identify !== updatedOrder.identify))
        toast.info(`Pedido #${updatedOrder.identify} foi arquivado.`)
        return
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.identify === updatedOrder.identify
            ? { ...normalized, status: newStatus }
            : o
        )
      )

      toast.info(`Pedido #${updatedOrder.identify} mudou de "${oldStatus}" para "${newStatus}"`)
    }, [normalizeOrder]),
    
    onOrderUpdated: useCallback((updatedOrder: any) => {
      // console.log('Real-time: Order updated', updatedOrder)
      
      setOrders((prev) => {
        const normalized = normalizeOrder(updatedOrder)

        if (normalized.status === 'Arquivado') {
          return prev.filter((o) => o.identify !== normalized.identify)
        }

        return prev.map((o) =>
          o.identify === updatedOrder.identify
            ? normalized
            : o
        )
      })
    }, [normalizeOrder]),
  })

  const loadStatuses = useCallback(async () => {
    try {
      const res = await apiClient.get<any>(endpoints.orderStatuses.list(true))
      
      if (res.success && res.data && Array.isArray(res.data)) {
        // Mapear status da API para formato das colunas
        const iconMap: Record<string, React.ReactNode> = {
          'clock': <Clock className="h-4 w-4" />,
          'package': <Package className="h-4 w-4" />,
          'check-circle': <Package className="h-4 w-4" />,
          'check-circle-2': <Package className="h-4 w-4" />,
          'truck': <Truck className="h-4 w-4" />,
          'x-circle': <RefreshCw className="h-4 w-4" />,
        }

        const columns = res.data.map((status: any) => ({
          id: status.name,
          title: status.name,
          badgeColor: `bg-[${status.color}]/10 text-[${status.color}] border-[${status.color}]/20`,
          headerGradient: `from-[${status.color}]/5 to-[${status.color}]/10`,
          icon: iconMap[status.icon] || <Package className="h-4 w-4" />,
        }))

        setDynamicColumns(columns)
      }
    } catch (e: any) {
      console.warn("Erro ao carregar status, usando padrões:", e)
      // Manter colunas padrão em caso de erro
    }
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const res = await apiClient.get<any>(endpoints.orders.list)
      
      const raw = Array.isArray(res.data)
        ? res.data
        : (res.data?.orders || res.data?.data || [])
      
      const normalized: Order[] = raw
        .map((o: any) => normalizeOrder(o))
        .filter((order: Order) => order.status !== 'Arquivado')

      setOrders(normalized)
    } catch (e: any) {
      toast.error(e?.message || "Erro ao carregar pedidos")
    } finally {
      setLoading(false)
    }
  }, [normalizeOrder])

  useEffect(() => {
    loadStatuses()
    loadOrders()
  }, [loadOrders, loadStatuses])

  const groupedOrders = useMemo(() => {
    // Criar map dinâmico baseado nas colunas carregadas
    const map: Record<string, Order[]> = {}
    
    dynamicColumns.forEach((col) => {
      map[col.id] = []
    })
    
    for (const order of orders) {
      const status = dynamicColumns.find((c) => c.id === order.status)?.id || dynamicColumns[0]?.id || "Em Preparo"
      if (map[status]) {
        map[status].push(order)
      }
    }
    
    return map as Record<OrderStatus, Order[]>
  }, [orders, dynamicColumns])

  const updateOrderStatus = async (orderIdentify: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.identify === orderIdentify)
    if (!order) return
    
    const columnInfo = dynamicColumns.find((c) => c.id === newStatus)
    
    try {
      setUpdatingIdentify(orderIdentify)
      
      await apiClient.put(endpoints.orders.update(orderIdentify), { status: newStatus })
      
      setOrders((prev) => 
        prev.map((o) => 
          o.identify === orderIdentify ? { ...o, status: newStatus } : o
        )
      )
      
      toast.success(`Pedido #${orderIdentify} movido para ${columnInfo?.title}`)
    } catch (e: any) {
      toast.error(e?.message || "Não foi possível atualizar o status")
      await loadOrders()
    } finally {
      setUpdatingIdentify(null)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const orderIdentify = String(active.id).replace('order-', '')
    const order = orders.find((o) => o.identify === orderIdentify)
    
    if (order) {
      setActiveOrder(order)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveOrder(null)
    
    if (!over) return

    const orderIdentify = String(active.id).replace('order-', '')
    const currentOrder = orders.find((o) => o.identify === orderIdentify)
    
    if (!currentOrder) return

    const overData: any = over.data?.current
    let newStatus: OrderStatus | null = null
    
    if (overData?.column) {
      newStatus = overData.column as OrderStatus
    } else {
      const targetOrderIdentify = String(over.id).replace('order-', '')
      const targetOrder = orders.find((o) => o.identify === targetOrderIdentify)
      if (targetOrder) {
        newStatus = targetOrder.status as OrderStatus
      }
    }

    if (!newStatus || !dynamicColumns.find((c) => c.id === newStatus)) {
      return
    }

    if (currentOrder.status === newStatus) {
      return
    }

    updateOrderStatus(orderIdentify, newStatus)
  }

  if (loading) {
    return <PageLoading />
  }

  const totalOrders = orders.length
  const pendingOrders = groupedOrders["Em Preparo"]?.length || 0
  const readyOrders = groupedOrders["Pronto"]?.length || 0

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6 h-full">
      {/* Header Section */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
            Quadro de Pedidos
          </h1>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span>Arraste os pedidos entre colunas para atualizar o status</span>
            <Badge variant="outline" className="ml-2 font-mono text-xs">
              {totalOrders} {totalOrders === 1 ? 'pedido' : 'pedidos'}
            </Badge>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Connection Status */}
          <Badge 
            variant={isConnected ? "default" : "secondary"} 
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 transition-all",
              isConnected && "bg-emerald-500 hover:bg-emerald-600"
            )}
          >
            {isConnected ? (
              <Wifi className="h-3.5 w-3.5 animate-pulse" />
            ) : (
              <WifiOff className="h-3.5 w-3.5" />
            )}
            <span className="font-medium">{isConnected ? "Tempo Real" : "Offline"}</span>
          </Badge>
          
          {/* Quick Stats */}
          {pendingOrders > 0 && (
            <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 px-3 py-1.5">
              <Clock className="h-3.5 w-3.5 mr-1" />
              {pendingOrders} em preparo
            </Badge>
          )}
          
          {readyOrders > 0 && (
            <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 px-3 py-1.5">
              <Package className="h-3.5 w-3.5 mr-1" />
              {readyOrders} pronto{readyOrders > 1 && 's'}
            </Badge>
          )}
          
          {/* Refresh Button */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadOrders} 
            disabled={loading}
            className="gap-2 shadow-sm"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
        </div>
      </div>

      {/* Board Section */}
      <DndContext 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd} 
        collisionDetection={closestCorners} 
        sensors={sensors}
      >
        <div
          className={cn(
            "grid gap-4 auto-cols-[minmax(260px,_1fr)] grid-flow-col overflow-x-auto overflow-y-hidden pb-4 pr-4",
            "sm:auto-cols-[minmax(280px,_1fr)] md:auto-cols-[minmax(300px,_1fr)] lg:pr-6",
            "xl:grid-flow-row xl:auto-cols-auto xl:grid-cols-5 xl:overflow-x-hidden xl:pr-0"
          )}
        >
          {dynamicColumns.map((column) => (
            <BoardColumn 
              key={column.id} 
              column={column} 
              orders={groupedOrders[column.id] || []}
              isUpdating={groupedOrders[column.id]?.some(o => o.identify === updatingIdentify) || false}
              onArchive={openArchiveDialog}
            />
          ))}
        </div>
        
        <DragOverlay>
          {activeOrder ? (
            <div className="rotate-3 scale-105">
              <OrderCard order={activeOrder} isDragOverlay onArchive={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <AlertDialog open={!!orderToArchive} onOpenChange={(open) => {
        if (!open) {
          cancelArchiveDialog()
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Arquivar pedido</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja arquivar o pedido <strong>#{orderToArchive?.identify}</strong>? Essa ação não poderá ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmArchiveOrder}
              disabled={archiving}
              className="bg-primary hover:bg-primary/90"
            >
              {archiving ? 'Arquivando...' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


