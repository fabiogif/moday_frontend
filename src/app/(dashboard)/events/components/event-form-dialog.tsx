'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Event, EventFormData } from '@/hooks/use-events'
import { Calendar, Bell, MapPin, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: Event | null
  clients: any[]
  onSubmit: (data: EventFormData) => Promise<void>
  isLoading?: boolean
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
  clients,
  onSubmit,
  isLoading,
}: EventFormDialogProps) {
  const [selectedClients, setSelectedClients] = useState<number[]>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EventFormData>()

  const eventType = watch('type')

  useEffect(() => {
    if (event) {
      setValue('title', event.title)
      setValue('type', event.type)
      setValue('start_date', event.start_date?.substring(0, 16)) // YYYY-MM-DDTHH:MM
      setValue('duration_minutes', event.duration_minutes)
      setValue('location', event.location || '')
      setValue('description', event.description)
      setSelectedClients(event.clients?.map(c => c.id) || [])
    } else {
      reset()
      setSelectedClients([])
      setSelectedChannels([])
    }
  }, [event, setValue, reset])

  const handleFormSubmit = async (data: any) => {
    const formData: EventFormData = {
      ...data,
      client_ids: selectedClients,
      notification_channels: selectedChannels.length > 0 ? selectedChannels as any : undefined,
    }

    await onSubmit(formData)
    reset()
    setSelectedClients([])
    setSelectedChannels([])
  }

  const toggleClient = (clientId: number) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    )
  }

  const toggleChannel = (channel: string) => {
    setSelectedChannels(prev =>
      prev.includes(channel)
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Editar Evento' : 'Novo Evento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Título */}
          <div className="space-y-2">
            <Label htmlFor="title">Título do Evento *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Título é obrigatório' })}
              placeholder="Ex: Black Friday 2025"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select
              value={eventType}
              onValueChange={(value) => setValue('type', value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="promocao">🎉 Promoção</SelectItem>
                <SelectItem value="aviso">📢 Aviso</SelectItem>
                <SelectItem value="outro">📅 Outro</SelectItem>
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type.message}</p>
            )}
          </div>

          {/* Data e Hora / Duração */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data e Hora *
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                {...register('start_date', { required: 'Data é obrigatória' })}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">
                <Clock className="inline h-4 w-4 mr-1" />
                Duração (minutos) *
              </Label>
              <Input
                id="duration_minutes"
                type="number"
                min="1"
                {...register('duration_minutes', {
                  required: 'Duração é obrigatória',
                  min: { value: 1, message: 'Mínimo 1 minuto' },
                  max: { value: 1440, message: 'Máximo 24 horas' },
                })}
                placeholder="Ex: 60"
              />
              {errors.duration_minutes && (
                <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>
              )}
            </div>
          </div>

          {/* Local */}
          <div className="space-y-2">
            <Label htmlFor="location">
              <MapPin className="inline h-4 w-4 mr-1" />
              Local (opcional)
            </Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ex: Loja Física, Online, etc."
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              {...register('description', {
                required: 'Descrição é obrigatória',
                minLength: { value: 10, message: 'Mínimo 10 caracteres' },
              })}
              placeholder="Descreva os detalhes do evento..."
              rows={4}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Seleção de Clientes */}
          <div className="space-y-2">
            <Label>Clientes * (Selecione pelo menos 1)</Label>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2">
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado</p>
              ) : (
                clients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`client-${client.id}`}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={() => toggleClient(client.id)}
                    />
                    <label
                      htmlFor={`client-${client.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {client.name} - {client.email}
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedClients.length === 0 && (
              <p className="text-sm text-destructive">Selecione pelo menos 1 cliente</p>
            )}
          </div>

          {/* Canais de Notificação */}
          <div className="space-y-2">
            <Label>
              <Bell className="inline h-4 w-4 mr-1" />
              Enviar Notificações (opcional)
            </Label>
            <div className="flex gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-email"
                  checked={selectedChannels.includes('email')}
                  onCheckedChange={() => toggleChannel('email')}
                />
                <label htmlFor="channel-email" className="text-sm cursor-pointer">
                  📧 E-mail
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-whatsapp"
                  checked={selectedChannels.includes('whatsapp')}
                  onCheckedChange={() => toggleChannel('whatsapp')}
                />
                <label htmlFor="channel-whatsapp" className="text-sm cursor-pointer">
                  💬 WhatsApp
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="channel-sms"
                  checked={selectedChannels.includes('sms')}
                  onCheckedChange={() => toggleChannel('sms')}
                />
                <label htmlFor="channel-sms" className="text-sm cursor-pointer">
                  📱 SMS
                </label>
              </div>
            </div>
            {selectedChannels.length > 0 && (
              <p className="text-xs text-muted-foreground">
                As notificações serão enviadas imediatamente após salvar
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || selectedClients.length === 0}>
              {isLoading ? 'Salvando...' : event ? 'Atualizar' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

