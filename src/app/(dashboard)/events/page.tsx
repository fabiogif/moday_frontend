'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useEvents, useEventStats, useEventMutation, Event } from '@/hooks/use-events'
import { useAuthenticatedApi } from '@/hooks/use-authenticated-api'
import { endpoints } from '@/lib/api-client'
import { EventFormDialog } from './components/event-form-dialog'
import { EventDetailDialog } from './components/event-detail-dialog'
import { Plus, CalendarDays, TrendingUp, Clock, Bell, Loader2, MapPin } from 'lucide-react'
import { format, startOfMonth, endOfMonth, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

export default function EventsPage() {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  // Buscar eventos do mês selecionado
  const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
  const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
  
  const { data: events, loading: eventsLoading, refetch } = useEvents(startDate, endDate)
  const { data: stats } = useEventStats()
  const { data: clients } = useAuthenticatedApi<any[]>(endpoints.clients.list, { immediate: true })
  const { mutate, loading: mutating } = useEventMutation()

  // Agrupar eventos por data
  const eventsByDate = (events || []).reduce((acc, event) => {
    const dateKey = format(parseISO(event.start_date), 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(event)
    return acc
  }, {} as Record<string, Event[]>)

  // Eventos da data selecionada
  const selectedDateEvents = selectedDate
    ? eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || []
    : []

  const handleCreateEvent = () => {
    setSelectedEvent(null)
    setFormDialogOpen(true)
  }

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event)
    setFormDialogOpen(true)
  }

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setDetailDialogOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      if (selectedEvent) {
        await mutate(endpoints.events.update(selectedEvent.uuid), 'PUT', data)
        toast.success('Evento atualizado com sucesso!')
      } else {
        await mutate(endpoints.events.create, 'POST', data)
        toast.success('Evento criado com sucesso!')
      }
      setFormDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar evento')
    }
  }

  const handleDelete = async (event: Event) => {
    if (!confirm(`Deseja realmente excluir o evento "${event.title}"?`)) {
      return
    }

    try {
      await mutate(endpoints.events.delete(event.uuid), 'DELETE')
      toast.success('Evento excluído com sucesso!')
      refetch()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir evento')
    }
  }

  // Verificar se uma data tem eventos
  const hasEvents = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return eventsByDate[dateKey]?.length > 0
  }

  // Customizar aparência dos dias com eventos
  const modifiers = {
    hasEvent: (date: Date) => hasEvents(date),
  }

  const modifiersClassNames = {
    hasEvent: 'relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-primary after:rounded-full',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
          <p className="text-muted-foreground">
            Gerencie eventos, promoções e avisos para seus clientes
          </p>
        </div>
        <Button onClick={handleCreateEvent} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Novo Evento
        </Button>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcoming}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passados</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.past}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notificados</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.notifications_sent}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Calendário e Lista */}
      <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
        {/* Calendário */}
        <Card>
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>
              Clique em uma data para ver os eventos do dia
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            {eventsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                onMonthChange={setSelectedMonth}
                month={selectedMonth}
                locale={ptBR}
                modifiers={modifiers}
                modifiersClassNames={modifiersClassNames}
                className="rounded-md border"
              />
            )}
          </CardContent>
        </Card>

        {/* Lista de Eventos do Dia */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate
                ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                : 'Selecione uma data'}
            </CardTitle>
            <CardDescription>
              {selectedDateEvents.length > 0
                ? `${selectedDateEvents.length} evento(s) neste dia`
                : 'Nenhum evento neste dia'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedDateEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleViewEvent(event)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{event.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {format(parseISO(event.start_date), 'HH:mm')} • {event.duration_minutes} min
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground">
                            <MapPin className="inline h-3 w-3 mr-1" />
                            {event.location}
                          </p>
                        )}
                      </div>
                      <Badge className={`text-xs ${
                        event.type === 'promocao'
                          ? 'bg-green-500/10 text-green-700'
                          : event.type === 'aviso'
                          ? 'bg-yellow-500/10 text-yellow-700'
                          : 'bg-blue-500/10 text-blue-700'
                      }`}>
                        {event.type_label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditEvent(event)
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(event)
                        }}
                        disabled={mutating}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDate ? (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum evento cadastrado para esta data</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-4"
                  onClick={handleCreateEvent}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Evento
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Selecione uma data no calendário</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <EventFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        event={selectedEvent}
        clients={clients || []}
        onSubmit={handleSubmit}
        isLoading={mutating}
      />

      <EventDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        event={selectedEvent}
      />
    </div>
  )
}

