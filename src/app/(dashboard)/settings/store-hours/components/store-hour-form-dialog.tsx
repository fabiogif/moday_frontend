'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { StoreHour, StoreHourFormData } from '@/hooks/use-store-hours'
import { Clock, AlertCircle, Store, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import apiClient, { endpoints } from '@/lib/api-client'
import { extractValidationErrors } from '@/lib/error-formatter'

interface StoreHourFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hour?: StoreHour | null
  onSuccess: () => void
}

const storeHourSchema = z.object({
  day_of_week: z.number().min(0).max(6).optional(),
  delivery_type: z.enum(['delivery', 'pickup', 'both']),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  start_time_2: z.string().optional(),
  end_time_2: z.string().optional(),
  has_interval: z.boolean().optional(),
  is_active: z.boolean().optional(),
}).refine((data) => {
  // Validar primeiro período
  if (data.start_time && data.end_time) {
    if (data.end_time <= data.start_time) {
      return false
    }
  }
  return true
}, {
  message: "O horário de término do 1º período deve ser posterior ao horário de início",
  path: ["end_time"],
}).refine((data) => {
  // Validar segundo período (se existir)
  if (data.has_interval && data.start_time_2 && data.end_time_2) {
    // Segundo período deve terminar depois de começar
    if (data.end_time_2 <= data.start_time_2) {
      return false
    }
  }
  return true
}, {
  message: "O horário de término do 2º período deve ser posterior ao seu início",
  path: ["end_time_2"],
}).refine((data) => {
  // Validar que segundo período começa APÓS o primeiro terminar
  if (data.has_interval && data.end_time && data.start_time_2) {
    if (data.start_time_2 <= data.end_time) {
      return false
    }
  }
  return true
}, {
  message: "⚠️ O 2º período deve começar APÓS o 1º terminar. Ajuste o horário de término do 1º período para antes do intervalo (ex: 12:00) e o 2º período para começar depois (ex: 13:00)",
  path: ["start_time_2"],
})

type StoreHourFormValues = z.infer<typeof storeHourSchema>

const daysOfWeek = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
]

export function StoreHourFormDialog({
  open,
  onOpenChange,
  hour,
  onSuccess,
}: StoreHourFormDialogProps) {
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StoreHourFormValues>({
    resolver: zodResolver(storeHourSchema),
  })

  const selectedDay = watch('day_of_week')
  const startTime = watch('start_time')
  const endTime = watch('end_time')
  const hasInterval = watch('has_interval')
  const startTime2 = watch('start_time_2')
  const endTime2 = watch('end_time_2')

  useEffect(() => {
    if (hour) {
      setValue('day_of_week', hour.day_of_week)
      setValue('delivery_type', hour.delivery_type)
      setValue('start_time', hour.start_time || '')
      setValue('end_time', hour.end_time || '')
      setValue('start_time_2', (hour as any).start_time_2 || '')
      setValue('end_time_2', (hour as any).end_time_2 || '')
      setValue('has_interval', !!(hour as any).start_time_2 || !!(hour as any).end_time_2)
      setValue('is_active', hour.is_active)
      setBackendErrors({})
    } else {
      reset({
        day_of_week: 1, // Segunda-feira
        delivery_type: 'both',
        start_time: '08:00',
        end_time: '18:00',
        start_time_2: '',
        end_time_2: '',
        has_interval: false,
        is_active: true,
      })
      setBackendErrors({})
    }
  }, [hour, setValue, reset, open])

  // Validação de sobreposição de horários
  const checkOverlap = async (dayOfWeek: number, start: string, end: string) => {
    try {
      const response = await apiClient.get(endpoints.storeHours.list, {
        day_of_week: dayOfWeek,
        is_active: true,
      })

      if (response.success && response.data) {
        const existingHours = response.data as StoreHour[]
        
        for (const existing of existingHours) {
          // Pular o próprio horário quando estiver editando
          if (hour && existing.uuid === hour.uuid) continue

          const existingStart = existing.start_time || ''
          const existingEnd = existing.end_time || ''

          // Verificar sobreposição
          const hasOverlap = 
            (start >= existingStart && start < existingEnd) || // Início dentro de um período existente
            (end > existingStart && end <= existingEnd) ||     // Fim dentro de um período existente
            (start <= existingStart && end >= existingEnd)      // Engloba completamente um período existente

          if (hasOverlap) {
            return {
              hasOverlap: true,
              conflictingHour: existing,
            }
          }
        }
      }

      return { hasOverlap: false }
    } catch (error) {
      console.error('Erro ao verificar sobreposição:', error)
      return { hasOverlap: false }
    }
  }

  const handleFormSubmit = async (data: StoreHourFormValues) => {
    setIsSubmitting(true)
    setBackendErrors({})

    try {
      // Validar campos obrigatórios
      if (data.day_of_week === undefined || data.day_of_week === null) {
        setBackendErrors({ day_of_week: 'O dia da semana é obrigatório' })
        setIsSubmitting(false)
        return
      }

      if (!data.start_time || !data.end_time) {
        setBackendErrors({ 
          start_time: !data.start_time ? 'O horário de início é obrigatório' : '',
          end_time: !data.end_time ? 'O horário de término é obrigatório' : '',
        })
        setIsSubmitting(false)
        return
      }

      // Verificar sobreposição
      const overlapCheck = await checkOverlap(
        data.day_of_week,
        data.start_time,
        data.end_time
      )

      if (overlapCheck.hasOverlap && overlapCheck.conflictingHour) {
        const conflicting = overlapCheck.conflictingHour
        toast.error(`Já existe um horário cadastrado para ${conflicting.day_name} das ${conflicting.start_time} às ${conflicting.end_time}`)
        setIsSubmitting(false)
        return
      }

      // Preparar dados
      const submitData: StoreHourFormData = {
        day_of_week: data.day_of_week,
        delivery_type: data.delivery_type,
        start_time: data.start_time,
        end_time: data.end_time,
        start_time_2: data.has_interval ? data.start_time_2 : null,
        end_time_2: data.has_interval ? data.end_time_2 : null,
        is_active: data.is_active ?? true,
        is_always_open: false,
      }

      // Criar ou atualizar
      if (hour) {
        await apiClient.put(endpoints.storeHours.update(hour.uuid), submitData)
        toast.success('Horário atualizado com sucesso')
      } else {
        await apiClient.post(endpoints.storeHours.create, submitData)
        toast.success('Horário criado com sucesso')
      }

      reset()
      onSuccess()
    } catch (error: any) {
      const validationErrors = extractValidationErrors(error)
      setBackendErrors(validationErrors)
      
      if (validationErrors._general) {
        toast.error(validationErrors._general)
      } else {
        toast.error(error.message || 'Erro ao salvar horário')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasError = (field: string) => errors[field as keyof StoreHourFormValues] || backendErrors[field]
  const getErrorMessage = (field: string) => {
    const frontendError = errors[field as keyof StoreHourFormValues]?.message
    const backendError = backendErrors[field]
    return frontendError || backendError
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {hour ? 'Editar Horário' : 'Adicionar Horário'}
          </DialogTitle>
          <DialogDescription>
            Configure os horários de funcionamento da sua loja
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {backendErrors._general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{backendErrors._general}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="day_of_week">
              Dia da Semana <span className="text-destructive">*</span>
            </Label>
            <Select
              value={selectedDay?.toString()}
              onValueChange={(value) => setValue('day_of_week', parseInt(value))}
            >
              <SelectTrigger className={hasError('day_of_week') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o dia" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError('day_of_week') && (
              <p className="text-sm text-destructive">{getErrorMessage('day_of_week')}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">
                {hasInterval ? 'Primeiro Período (Manhã)' : 'Horário de Funcionamento'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">
                    {hasInterval ? 'Abre às' : 'Horário de Início'} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    placeholder="08:00"
                    {...register('start_time')}
                    className={hasError('start_time') ? 'border-destructive' : ''}
                  />
                  {hasError('start_time') && (
                    <p className="text-sm text-destructive">{getErrorMessage('start_time')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">
                    {hasInterval ? 'Fecha às (antes do intervalo)' : 'Horário de Término'} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    placeholder={hasInterval ? '12:00' : '18:00'}
                    {...register('end_time')}
                    className={hasError('end_time') ? 'border-destructive' : ''}
                  />
                  {hasError('end_time') && (
                    <p className="text-sm text-destructive">{getErrorMessage('end_time')}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Checkbox para adicionar intervalo */}
            <div className="space-y-3 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="has_interval"
                  checked={hasInterval}
                  onCheckedChange={(checked) => {
                    setValue('has_interval', checked)
                    if (checked) {
                      // Pré-preencher com valores sugeridos
                      if (startTime === '08:00' && endTime === '18:00') {
                        setValue('end_time', '12:00') // Termina meio-dia
                        setValue('start_time_2', '13:00') // Retorna 13h
                        setValue('end_time_2', '18:00') // Termina 18h
                      }
                    } else {
                      setValue('start_time_2', '')
                      setValue('end_time_2', '')
                      // Restaurar horário completo se estava com intervalo
                      if (endTime === '12:00' && !startTime2) {
                        setValue('end_time', '18:00')
                      }
                    }
                  }}
                />
                <Label htmlFor="has_interval" className="cursor-pointer font-medium">
                  🍴 Adicionar intervalo (ex: horário de almoço)
                </Label>
              </div>
              <Alert className="border-amber-200 dark:border-amber-800">
                <Clock className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>💡 Como funciona:</strong><br/>
                  Ao marcar esta opção, o horário do 1º período será ajustado automaticamente.<br/>
                  <strong>Exemplo:</strong> Se você trabalha das 08:00 às 18:00 com intervalo de almoço:<br/>
                  • 1º período: 08:00-<strong>12:00</strong> (ajuste o término para meio-dia)<br/>
                  • 2º período: <strong>13:00</strong>-18:00 (reabertura após almoço)
                </AlertDescription>
              </Alert>
            </div>

            {/* Segundo período (visível apenas se has_interval = true) */}
            {hasInterval && (
              <div className="pl-4 border-l-2 border-primary/30 bg-primary/5 rounded-lg p-4">
                <p className="text-sm font-medium mb-2 text-primary">
                  🕐 Segundo Período (Tarde - após intervalo)
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time_2">
                      Reabre às <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="start_time_2"
                      type="time"
                      placeholder="13:00"
                      {...register('start_time_2')}
                      className={hasError('start_time_2') ? 'border-destructive' : ''}
                    />
                    {hasError('start_time_2') && (
                      <p className="text-sm text-destructive">{getErrorMessage('start_time_2')}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end_time_2">
                      Fecha às <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="end_time_2"
                      type="time"
                      placeholder="18:00"
                      {...register('end_time_2')}
                      className={hasError('end_time_2') ? 'border-destructive' : ''}
                    />
                    {hasError('end_time_2') && (
                      <p className="text-sm text-destructive">{getErrorMessage('end_time_2')}</p>
                    )}
                  </div>
                </div>
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    ✅ <strong>Exemplo correto:</strong><br/>
                    • Manhã: 08:00-12:00<br/>
                    • Intervalo: 12:00-13:00 (fechado)<br/>
                    • Tarde: 13:00-18:00
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery_type">
              Tipo de Serviço <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('delivery_type')}
              onValueChange={(value: any) => setValue('delivery_type', value)}
            >
              <SelectTrigger className={hasError('delivery_type') ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Entrega e Retirada</SelectItem>
                <SelectItem value="delivery">Apenas Entrega</SelectItem>
                <SelectItem value="pickup">Apenas Retirada</SelectItem>
              </SelectContent>
            </Select>
            {hasError('delivery_type') && (
              <p className="text-sm text-destructive">{getErrorMessage('delivery_type')}</p>
            )}
          </div>

          <div className="flex items-center space-x-2 rounded-lg border p-4">
            <Switch
              id="is_active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Horário ativo
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {hour ? 'Atualizar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

