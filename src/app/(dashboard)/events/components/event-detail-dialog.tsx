'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Event } from '@/hooks/use-events'
import { Calendar, Clock, MapPin, Users, Bell } from 'lucide-react'

interface EventDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event: Event | null
}

export function EventDetailDialog({ open, onOpenChange, event }: EventDetailDialogProps) {
  if (!event) return null

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'promocao':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'aviso':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      default:
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {event.title}
            <Badge className={getTypeColor(event.type)}>{event.type_label}</Badge>
            {!event.is_active && (
              <Badge variant="outline" className="text-muted-foreground">
                Inativo
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Data e Hora */}
          <div className="flex items-start gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Data e Hora</p>
              <p className="text-sm text-muted-foreground">
                {event.start_date_formatted}
              </p>
            </div>
          </div>

          {/* Duração */}
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Duração</p>
              <p className="text-sm text-muted-foreground">
                {event.duration_minutes} minutos
                {event.end_date_formatted && ` (até ${event.end_date_formatted})`}
              </p>
            </div>
          </div>

          {/* Local */}
          {event.location && (
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Local</p>
                <p className="text-sm text-muted-foreground">{event.location}</p>
              </div>
            </div>
          )}

          {/* Descrição */}
          <div>
            <p className="font-medium mb-2">Descrição</p>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </div>

          {/* Clientes */}
          <div className="flex items-start gap-2">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">
                Clientes ({event.clients_count})
              </p>
              {event.clients && event.clients.length > 0 && (
                <div className="mt-2 space-y-1">
                  {event.clients.slice(0, 5).map((client) => (
                    <p key={client.id} className="text-sm text-muted-foreground">
                      • {client.name}
                    </p>
                  ))}
                  {event.clients.length > 5 && (
                    <p className="text-sm text-muted-foreground italic">
                      + {event.clients.length - 5} mais...
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Status de Notificações */}
          <div className="flex items-start gap-2">
            <Bell className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Notificações</p>
              <p className="text-sm text-muted-foreground">
                {event.notifications_sent ? (
                  <Badge variant="outline" className="text-green-600">
                    ✓ Enviadas
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Não enviadas
                  </Badge>
                )}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

