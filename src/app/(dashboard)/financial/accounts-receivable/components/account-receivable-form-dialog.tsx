'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AccountReceivable, AccountReceivableFormData } from '@/hooks/use-accounts-receivable'
import { FinancialCategory } from '@/hooks/use-financial-categories'
import { Loader2, AlertCircle, Search, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { extractValidationErrors } from '@/lib/error-formatter'
import { toast } from 'sonner'
import { endpoints, apiClient } from '@/lib/api-client'

interface AccountReceivableFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  account?: AccountReceivable | null
  categories: FinancialCategory[]
  onSubmit: (data: AccountReceivableFormData) => Promise<void>
  isLoading?: boolean
}

export function AccountReceivableFormDialog({
  open,
  onOpenChange,
  account,
  categories,
  onSubmit,
  isLoading,
}: AccountReceivableFormDialogProps) {
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})
  const [orderNumber, setOrderNumber] = useState('')
  const [searchingOrder, setSearchingOrder] = useState(false)
  const [orderFound, setOrderFound] = useState<any>(null)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AccountReceivableFormData>()

  const issueDate = watch('issue_date')
  
  // Buscar detalhes do pedido quando o número for digitado
  const handleSearchOrder = async () => {
    if (!orderNumber || orderNumber.trim() === '') {
      toast.error('Digite o número do pedido')
      return
    }
    
    setSearchingOrder(true)
    setOrderFound(null)
    
    try {
      const response: any = await apiClient.get(`${endpoints.orders.searchByNumber}?query=${orderNumber}`)
      
      if (Array.isArray(response?.data) && response.data.length > 0) {
        const order = response.data[0]
        
        // Buscar detalhes completos do pedido
        const detailsResponse: any = await apiClient.get(endpoints.orders.getDetails(order.id))
        
        if (detailsResponse?.data) {
          const orderDetails = detailsResponse.data
          setOrderFound(orderDetails)
          
          // Preencher automaticamente os campos
          setValue('order_id', orderDetails.id)
          setValue('description', `Venda - Pedido ${orderDetails.identify}`)
          setValue('amount', orderDetails.total)
          
          if (orderDetails.client_id) {
            setValue('client_id', orderDetails.client_id)
          }
          
          if (orderDetails.payment_method_id) {
            setValue('payment_method_id', orderDetails.payment_method_id)
          }
          
          toast.success('Pedido encontrado! Dados preenchidos automaticamente.')
        }
      } else {
        toast.error('Pedido não encontrado')
        setOrderFound(null)
      }
    } catch (error) {

      toast.error('Erro ao buscar pedido')
      setOrderFound(null)
    } finally {
      setSearchingOrder(false)
    }
  }

  useEffect(() => {
    if (account) {
      setValue('description', account.description)
      setValue('financial_category_id', account.category?.id)
      setValue('client_id', account.client?.id)
      setValue('order_id', account.order_id)
      setValue('issue_date', account.issue_date)
      setValue('due_date', account.due_date)
      setValue('amount', account.amount)
      setValue('status', account.status || 'pendente')
      setValue('document_number', account.document_number || '')
      setValue('discount', account.discount)
      setValue('interest', account.interest)
      setValue('fine', account.fine)
      setValue('notes', account.notes || '')
      setBackendErrors({})
      setOrderNumber('')
      setOrderFound(null)
    } else {
      reset()
      const today = format(new Date(), 'yyyy-MM-dd')
      setValue('issue_date', today)
      setValue('due_date', today)
      setValue('status', 'pendente')
      setBackendErrors({})
      setOrderNumber('')
      setOrderFound(null)
    }
  }, [account, setValue, reset, open])

  const handleFormSubmit = async (data: AccountReceivableFormData) => {
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
            {account ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
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
                placeholder="Ex: Venda de Produtos, Prestação de Serviços..."
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
                <Label htmlFor="orderNumber">Número do Pedido (Opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="orderNumber"
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Ex: 001, 1234..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleSearchOrder()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSearchOrder}
                    disabled={searchingOrder || !orderNumber}
                  >
                    {searchingOrder ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                {/* Campo hidden para order_id real */}
                <input type="hidden" {...register('order_id')} />
                
                {/* Informações do pedido encontrado */}
                {orderFound && (
                  <Alert className="mt-2 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Pedido #{orderFound.identify}</AlertTitle>
                    <AlertDescription className="text-green-700">
                      <div className="text-sm space-y-1 mt-1">
                        {orderFound.client_name && <p>Cliente: {orderFound.client_name}</p>}
                        <p>Total: R$ {Number(orderFound.total).toFixed(2)}</p>
                        <p>Data: {orderFound.created_at}</p>
                        {orderFound.payment_method_name && <p>Forma de Pagamento: {orderFound.payment_method_name}</p>}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                {(errors.order_id || backendErrors.order_id) && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.order_id?.message || backendErrors.order_id}
                  </p>
                )}
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

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Valor *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  {...register('amount', { 
                    required: 'Valor é obrigatório',
                    min: { value: 0.01, message: 'Valor deve ser maior que zero' }
                  })}
                  placeholder="0,00"
                />
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="discount">Desconto</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  {...register('discount')}
                  placeholder="0,00"
                />
              </div>

              <div>
                <Label htmlFor="interest">Juros</Label>
                <Input
                  id="interest"
                  type="number"
                  step="0.01"
                  {...register('interest')}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select
                  onValueChange={(value) => setValue('status', value, { shouldValidate: true })}
                  defaultValue={account?.status || 'pendente'}
                  value={watch('status') || 'pendente'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="recebido">Recebido</SelectItem>
                    <SelectItem value="parcial">Parcial</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                {(errors.status || backendErrors.status) && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.status?.message || backendErrors.status}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="document_number">Número do Documento</Label>
                <Input
                  id="document_number"
                  {...register('document_number')}
                  placeholder="Ex: NF-12345"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                {...register('notes')}
                placeholder="Informações adicionais..."
                rows={3}
              />
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

