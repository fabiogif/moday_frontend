'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Expense, ExpenseFormData } from '@/hooks/use-expenses'
import { FinancialCategory } from '@/hooks/use-financial-categories'
import { Supplier } from '@/hooks/use-suppliers'
import { Calendar, DollarSign, FileText, AlertCircle, Upload } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { extractValidationErrors } from '@/lib/error-formatter'

interface ExpenseFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expense?: Expense | null
  categories: FinancialCategory[]
  suppliers: Supplier[]
  onSubmit: (data: ExpenseFormData) => Promise<void>
  isLoading?: boolean
}

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  categories,
  suppliers,
  onSubmit,
  isLoading,
}: ExpenseFormDialogProps) {
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    mode: 'onBlur',
  })

  useEffect(() => {
    if (expense) {
      setValue('description', expense.description)
      setValue('financial_category_id', expense.category?.id)
      setValue('supplier_id', expense.supplier?.id)
      setValue('payment_method_id', expense.payment_method?.uuid)
      setValue('issue_date', expense.issue_date)
      setValue('due_date', expense.due_date)
      setValue('payment_date', expense.payment_date || '')
      setValue('amount', expense.amount)
      setValue('status', expense.status)
      setValue('notes', expense.notes || '')
      setBackendErrors({})
    } else {
      reset()
      const today = format(new Date(), 'yyyy-MM-dd')
      setValue('issue_date', today)
      setValue('due_date', today)
      setValue('status', 'pendente')
      setBackendErrors({})
    }
  }, [expense, setValue, reset, open])

  const handleFormSubmit = async (data: any) => {
    try {
      setBackendErrors({})
      await onSubmit(data)
      reset()
    } catch (error: any) {
      const validationErrors = extractValidationErrors(error)
      setBackendErrors(validationErrors)
      
      if (validationErrors._general) {
        toast.error(validationErrors._general)
      }
    }
  }

  const hasError = (field: string) => errors[field as keyof ExpenseFormData] || backendErrors[field]
  const getErrorMessage = (field: string) => {
    const frontendError = errors[field as keyof ExpenseFormData]?.message
    const backendError = backendErrors[field]
    return frontendError || backendError
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {expense ? 'Editar Despesa' : 'Nova Despesa'}
          </DialogTitle>
          <DialogDescription>
            Registre uma nova despesa. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        {backendErrors._general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{backendErrors._general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              {...register('description', { required: 'A descrição é obrigatória' })}
              className={cn(hasError('description') && 'border-destructive')}
              placeholder="Ex: Aluguel do mês, Conta de energia..."
            />
            {hasError('description') && (
              <p className="text-sm text-destructive">{getErrorMessage('description')}</p>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="financial_category_id">Categoria</Label>
              <Select
                value={watch('financial_category_id')?.toString()}
                onValueChange={(value) => setValue('financial_category_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier_id">Fornecedor</Label>
              <Select
                value={watch('supplier_id')?.toString()}
                onValueChange={(value) => setValue('supplier_id', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((sup) => (
                    <SelectItem key={sup.id} value={sup.id.toString()}>
                      {sup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue_date">Data de Emissão *</Label>
              <Input
                id="issue_date"
                type="date"
                {...register('issue_date', { required: 'Data obrigatória' })}
                className={cn(hasError('issue_date') && 'border-destructive')}
              />
              {hasError('issue_date') && (
                <p className="text-sm text-destructive">{getErrorMessage('issue_date')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Data de Vencimento *</Label>
              <Input
                id="due_date"
                type="date"
                min={watch('issue_date')}
                {...register('due_date', { required: 'Data obrigatória' })}
                className={cn(hasError('due_date') && 'border-destructive')}
              />
              {hasError('due_date') && (
                <p className="text-sm text-destructive">{getErrorMessage('due_date')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Valor *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                {...register('amount', {
                  required: 'Valor obrigatório',
                  min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                })}
                className={cn(hasError('amount') && 'border-destructive')}
                placeholder="0,00"
              />
              {hasError('amount') && (
                <p className="text-sm text-destructive">{getErrorMessage('amount')}</p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {watch('status') === 'pago' && (
              <div className="space-y-2">
                <Label htmlFor="payment_date">Data de Pagamento</Label>
                <Input
                  id="payment_date"
                  type="date"
                  {...register('payment_date')}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Informações adicionais..."
              rows={3}
            />
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : expense ? 'Atualizar' : 'Criar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

