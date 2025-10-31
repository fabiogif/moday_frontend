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
import { Supplier, SupplierFormData } from '@/hooks/use-suppliers'
import { Building2, Mail, Phone, MapPin, CreditCard, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { extractValidationErrors } from '@/lib/error-formatter'

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  onSubmit: (data: SupplierFormData) => Promise<void>
  isLoading?: boolean
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSubmit,
  isLoading,
}: SupplierFormDialogProps) {
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    clearErrors,
  } = useForm<SupplierFormData>({
    mode: 'onBlur',
  })

  const documentType = watch('document_type')

  useEffect(() => {
    if (supplier) {
      Object.entries(supplier).forEach(([key, value]) => {
        setValue(key as any, value)
      })
      setBackendErrors({})
    } else {
      reset()
      setValue('document_type', 'cnpj')
      setValue('is_active', true)
      setBackendErrors({})
    }
  }, [supplier, setValue, reset, open])

  const handleFormSubmit = async (data: any) => {
    try {
      setBackendErrors({})
      await onSubmit(data)
      reset()
      setBackendErrors({})
    } catch (error: any) {
      const validationErrors = extractValidationErrors(error)
      setBackendErrors(validationErrors)
      
      const errorCount = Object.keys(validationErrors).filter(k => k !== '_general').length
      if (validationErrors._general) {
        toast.error(validationErrors._general)
      } else if (errorCount > 0) {
        const firstError = Object.values(validationErrors)[0]
        toast.error(firstError, {
          description: errorCount > 1 ? `${errorCount - 1} outro(s) erro(s)` : undefined
        })
      }
      
      const dialogContent = document.querySelector('[role="dialog"]')
      if (dialogContent) {
        dialogContent.scrollTop = 0
      }
    }
  }

  const hasError = (field: string) => errors[field as keyof SupplierFormData] || backendErrors[field]
  const getErrorMessage = (field: string) => {
    const frontendError = errors[field as keyof SupplierFormData]?.message
    const backendError = backendErrors[field]
    return frontendError || backendError
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            {supplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription>
            Preencha os dados do fornecedor. Campos com * são obrigatórios.
          </DialogDescription>
        </DialogHeader>

        {backendErrors._general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{backendErrors._general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Dados Principais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Dados Principais</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome/Razão Social *</Label>
                <Input
                  id="name"
                  {...register('name', { required: 'O nome é obrigatório' })}
                  className={cn(hasError('name') && 'border-destructive')}
                  placeholder="Ex: Empresa Fornecedora Ltda"
                />
                {hasError('name') && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getErrorMessage('name')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fantasy_name">Nome Fantasia</Label>
                <Input
                  id="fantasy_name"
                  {...register('fantasy_name')}
                  placeholder="Ex: Fornecedora"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_type">Tipo de Documento *</Label>
                <Select
                  value={documentType}
                  onValueChange={(value) => setValue('document_type', value as any)}
                >
                  <SelectTrigger className={cn(hasError('document_type') && 'border-destructive')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="document">{documentType === 'cnpj' ? 'CNPJ' : 'CPF'} *</Label>
                <Input
                  id="document"
                  {...register('document', { required: 'O documento é obrigatório' })}
                  className={cn(hasError('document') && 'border-destructive')}
                  placeholder={documentType === 'cnpj' ? '00.000.000/0000-00' : '000.000.000-00'}
                />
                {hasError('document') && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getErrorMessage('document')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contato
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  {...register('phone', { required: 'O telefone é obrigatório' })}
                  className={cn(hasError('phone') && 'border-destructive')}
                  placeholder="(00) 00000-0000"
                />
                {hasError('phone') && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage('phone')}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone2">Telefone 2</Label>
                <Input
                  id="phone2"
                  {...register('phone2')}
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={cn(hasError('email') && 'border-destructive')}
                  placeholder="contato@fornecedor.com.br"
                />
                {hasError('email') && (
                  <p className="text-sm text-destructive">
                    {getErrorMessage('email')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Endereço <span className="text-sm text-muted-foreground font-normal">(opcional)</span>
            </h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="address">Logradouro</Label>
                <Input
                  id="address"
                  {...register('address')}
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  {...register('number')}
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  {...register('complement')}
                  placeholder="Sala, Bloco, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  {...register('neighborhood')}
                  placeholder="Centro"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">CEP</Label>
                <Input
                  id="zip_code"
                  {...register('zip_code')}
                  placeholder="00000-000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  {...register('city')}
                  placeholder="São Paulo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado (UF)</Label>
                <Input
                  id="state"
                  {...register('state')}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Dados Bancários */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Dados Bancários <span className="text-sm text-muted-foreground font-normal">(opcional)</span>
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bank_name">Banco</Label>
                <Input
                  id="bank_name"
                  {...register('bank_name')}
                  placeholder="Ex: Banco do Brasil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_agency">Agência</Label>
                <Input
                  id="bank_agency"
                  {...register('bank_agency')}
                  placeholder="0000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_account">Conta</Label>
                <Input
                  id="bank_account"
                  {...register('bank_account')}
                  placeholder="00000-0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  {...register('pix_key')}
                  placeholder="CNPJ, email, telefone ou chave aleatória"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Informações adicionais sobre o fornecedor..."
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
              {isLoading ? 'Salvando...' : supplier ? 'Atualizar' : 'Criar Fornecedor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

