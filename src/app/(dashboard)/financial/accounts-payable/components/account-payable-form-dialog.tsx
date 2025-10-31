'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AccountPayable, AccountPayableFormData } from '@/hooks/use-accounts-payable'
import { FinancialCategory } from '@/hooks/use-financial-categories'
import { Supplier } from '@/hooks/use-suppliers'
import { Loader2, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { extractValidationErrors } from '@/lib/error-formatter'
import { toast } from 'sonner'

interface AccountPayableFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: AccountPayable | null
  categories: FinancialCategory[]
  suppliers: Supplier[]
  onSubmit: (data: AccountPayableFormData) => Promise<void>
  isLoading?: boolean
}

export function AccountPayableFormDialog({
  open,
  onOpenChange,
  account,
  categories,
  suppliers,
  onSubmit,
  isLoading,
}: AccountPayableFormDialogProps) {
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AccountPayableFormData>()

  const issueDate = watch('issue_date')

  useEffect(() => {
    if (account) {
      setValue('description', account.description)
      setValue('financial_category_id', account.category?.id)
      setValue('supplier_id', account.supplier?.id)
      setValue('issue_date', account.issue_date)
      setValue('due_date', account.due_date)
      setValue('amount', account.amount)
      setValue('status', account.status)
      setValue('document_number', account.document_number || '')
      setValue('notes', account.notes || '')
      setBackendErrors({})
    } else {
      reset()
      const today = format(new Date(), 'yyyy-MM-dd')
      setValue('issue_date', today)
      setValue('due_date', today)
      setValue('status', 'pendente')
      setBackendErrors({})
    }
  }, [account, setValue, reset, open])

  const handleFormSubmit = async (data: AccountPayableFormData) => {
    try {
      setBackendErrors({})
      await onSubmit(data)
      reset()
    } catch (error: any) {
      const validationErrors = extractValidationErrors(error)
      setBackendErrors(validationErrors)
      
      // Mostrar toast com resumo dos erros
      const errorMessages = Object.values(validationErrors)
      if (errorMessages.length > 0) {
        toast.error(errorMessages[0])
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {account ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Exibir erros do backend */}
          {Object.keys(backendErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {Object.entries(backendErrors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="description">Descrição *</Label>
              <Input
                id="description"
                {...register('description', { required: 'Descrição é obrigatória' })}
                placeholder="Ex: Aluguel, Energia Elétrica..."
              />
              {(errors.description || backendErrors.description) && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.description?.message || backendErrors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="financial_category_id">Categoria</Label>
                <Select
                  onValueChange={(value) => setValue('financial_category_id', parseInt(value))}
                  defaultValue={account?.category?.id?.toString()}
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

              <div>
                <Label htmlFor="supplier_id">Fornecedor</Label>
                <Select
                  onValueChange={(value) => setValue('supplier_id', parseInt(value))}
                  defaultValue={account?.supplier?.id?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um fornecedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id.toString()}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="issue_date">Data de Emissão *</Label>
                <Input
                  id="issue_date"
                  type="date"
                  {...register('issue_date', { 
                    required: 'Data de emissão é obrigatória',
                    onChange: (e) => {
                      // Atualizar data de vencimento se for menor que emissão
                      const currentDueDate = watch('due_date')
                      if (currentDueDate && currentDueDate < e.target.value) {
                        setValue('due_date', e.target.value)
                      }
                    }
                  })}
                />
                {(errors.issue_date || backendErrors.issue_date) && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.issue_date?.message || backendErrors.issue_date}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="due_date">Data de Vencimento *</Label>
                <Input
                  id="due_date"
                  type="date"
                  min={issueDate || format(new Date(), 'yyyy-MM-dd')}
                  {...register('due_date', { 
                    required: 'Data de vencimento é obrigatória',
                    validate: (value) => {
                      const issue = watch('issue_date')
                      if (issue && value < issue) {
                        return 'A data de vencimento deve ser igual ou posterior à data de emissão'
                      }
                      return true
                    }
                  })}
                />
                {(errors.due_date || backendErrors.due_date) && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.due_date?.message || backendErrors.due_date}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register('amount', { 
                    required: 'Valor é obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                  })}
                  placeholder="0,00"
                />
                {(errors.amount || backendErrors.amount) && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.amount?.message || backendErrors.amount}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  onValueChange={(value) => setValue('status', value)}
                  defaultValue={account?.status || 'pendente'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                {backendErrors.status && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {backendErrors.status}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="document_number">Número do Documento</Label>
              <Input
                id="document_number"
                {...register('document_number')}
                placeholder="Ex: NF-12345"
              />
              {backendErrors.document_number && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {backendErrors.document_number}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Informações adicionais..."
                rows={3}
              />
              {backendErrors.notes && (
                <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {backendErrors.notes}
                </p>
              )}
            </div>
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
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {account ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

