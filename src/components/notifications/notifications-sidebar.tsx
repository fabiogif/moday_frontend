'use client'

import { useState, useEffect } from 'react'
import { X, Bell, Check, CheckCheck, ShoppingCart, MessageSquare, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useOrderNotifications } from '@/contexts/order-notifications-context'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export interface Notification {
  id: string
  type: 'order' | 'message' | 'alert'
  title: string
  description: string
  timestamp: number
  read: boolean
  orderId?: string
  orderIdentify?: string
}

interface NotificationsSidebarProps {
  open: boolean
  onClose: () => void
}

export function NotificationsSidebar({ open, onClose }: NotificationsSidebarProps) {
  const router = useRouter()
  const { notifications: orderNotifications } = useOrderNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  // Carregar IDs lidos do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('readNotifications')
    if (stored) {
      try {
        setReadIds(new Set(JSON.parse(stored)))
      } catch {
        setReadIds(new Set())
      }
    }
  }, [])

  // Converter notificações de pedidos para o formato padrão
  useEffect(() => {
    const formattedNotifications: Notification[] = orderNotifications.map(orderNotif => ({
      id: orderNotif.id,
      type: 'order' as const,
      title: '🛒 Novo Pedido',
      description: `${orderNotif.customerName} - ${orderNotif.orderIdentify} - R$ ${orderNotif.total}`,
      timestamp: orderNotif.timestamp,
      read: readIds.has(orderNotif.id),
      orderId: orderNotif.orderId,
      orderIdentify: orderNotif.orderIdentify,
    }))

    setNotifications(formattedNotifications.slice(0, 10))
  }, [orderNotifications, readIds])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setReadIds(prev => {
      const newSet = new Set(prev)
      newSet.add(id)
      localStorage.setItem('readNotifications', JSON.stringify([...newSet]))
      // Disparar evento após o render para evitar warnings do React
      setTimeout(() => {
        window.dispatchEvent(new Event('readNotificationsChanged'))
      }, 0)
      return newSet
    })
  }

  const markAsUnread = (id: string) => {
    setReadIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      localStorage.setItem('readNotifications', JSON.stringify([...newSet]))
      // Disparar evento após o render para evitar warnings do React
      setTimeout(() => {
        window.dispatchEvent(new Event('readNotificationsChanged'))
      }, 0)
      return newSet
    })
  }

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id)
    setReadIds(prev => {
      const newSet = new Set([...prev, ...allIds])
      localStorage.setItem('readNotifications', JSON.stringify([...newSet]))
      // Disparar evento após o render para evitar warnings do React
      setTimeout(() => {
        window.dispatchEvent(new Event('readNotificationsChanged'))
      }, 0)
      return newSet
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como lida
    markAsRead(notification.id)

    // Navegar para o pedido se for notificação de pedido
    if (notification.type === 'order' && notification.orderIdentify) {
      router.push(`/orders?view=${notification.orderIdentify}`)
      onClose()
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="h-5 w-5 text-blue-500" />
      case 'message':
        return <MessageSquare className="h-5 w-5 text-green-500" />
      case 'alert':
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getRelativeTime = (timestamp: number) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { 
        addSuffix: true,
        locale: ptBR 
      })
    } catch {
      return 'Agora mesmo'
    }
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[380px] bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-col gap-2 p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                <h2 className="text-lg font-semibold">Notificações</h2>
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="w-full text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma notificação ainda
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      'group relative p-3 rounded-lg border transition-all hover:shadow-md cursor-pointer',
                      notification.read
                        ? 'bg-background border-border'
                        : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {getRelativeTime(notification.timestamp)}
                          </span>
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {notification.read ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsUnread(notification.id)
                                }}
                              >
                                Marcar como não lida
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  markAsRead(notification.id)
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Marcar como lida
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Footer */}
          {notifications.length > 0 && (() => {
            const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
            const oldCount = notifications.filter(n => n.timestamp < oneDayAgo).length
            
            return (
              <div className="p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full text-xs"
                  disabled={oldCount === 0}
                  onClick={() => {
                    const oldNotificationIds = notifications
                      .filter(n => n.timestamp < oneDayAgo)
                      .map(n => n.id)
                    
                    if (oldNotificationIds.length > 0) {
                      // Marcar notificações antigas como lidas para que não apareçam mais
                      setReadIds(prev => {
                        const newSet = new Set([...prev, ...oldNotificationIds])
                        localStorage.setItem('readNotifications', JSON.stringify([...newSet]))
                        // Disparar evento após o render para evitar warnings do React
                        setTimeout(() => {
                          window.dispatchEvent(new Event('readNotificationsChanged'))
                        }, 0)
                        return newSet
                      })
                      toast.success(`${oldNotificationIds.length} notificação(ões) antiga(s) removida(s)`)
                    }
                  }}
                >
                  {oldCount > 0 
                    ? `Limpar ${oldCount} notificação(ões) antiga(s)` 
                    : 'Nenhuma notificação antiga'}
                </Button>
              </div>
            )
          })()}
        </div>
      </div>
    </>
  )
}

