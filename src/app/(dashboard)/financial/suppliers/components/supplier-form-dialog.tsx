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
import { Building2, Phone, MapPin, CreditCard, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { extractValidationErrors } from '@/lib/error-formatter'
import { OrderStepper } from '@/components/order-stepper'

interface SupplierFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplier?: Supplier | null
  onSubmit: (data: SupplierFormData) => Promise<void>
  isLoading?: boolean
}

const STEPS = [
  { label: 'Dados Principais', icon: Building2 },
  { label: 'Contato', icon: Phone },
  { label: 'Endereço', icon: MapPin },
  { label: 'Financeiro', icon: CreditCard },
]

// Campos validados ao avançar de cada passo (os demais são opcionais)
const STEP_FIELDS: (keyof SupplierFormData)[][] = [
  ['name', 'document_type', 'document'],
  ['phone'],
  [],
  [],
]

// Passo em que cada campo aparece — usado para levar o usuário até o erro retornado pelo backend
const FIELD_STEP: Partial<Record<keyof SupplierFormData, number>> = {
  name: 0,
  fantasy_name: 0,
  document_type: 0,
  document: 0,
  phone: 1,
  phone2: 1,
  email: 1,
  address: 2,
  number: 2,
  complement: 2,
  neighborhood: 2,
  zip_code: 2,
  city: 2,
  state: 2,
  bank_name: 3,
  bank_agency: 3,
  bank_account: 3,
  pix_key: 3,
  notes: 3,
}

export function SupplierFormDialog({
  open,
  onOpenChange,
  supplier,
  onSubmit,
  isLoading,
}: SupplierFormDialogProps) {
  const [backendErrors, setBackendErrors] = useState<Record<string, string>>({})
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    trigger,
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
    setCurrentStep(0)
    setCompletedSteps(new Set())
  }, [supplier, setValue, reset, open])

  const goNext = async () => {
    const fields = STEP_FIELDS[currentStep]
    const valid = fields.length === 0 || (await trigger(fields))
    if (!valid) return
    setCompletedSteps((prev) => new Set(prev).add(currentStep))
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0))

  const goToStep = (step: number) => {
    if (step <= currentStep || completedSteps.has(step)) {
      setCurrentStep(step)
    }
  }

  const handleFormSubmit = async (data: any) => {
    try {
      setBackendErrors({})
      await onSubmit(data)
      reset()
      setBackendErrors({})
      setCurrentStep(0)
      setCompletedSteps(new Set())
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

      // Leva o usuário até o passo onde está o primeiro campo com erro retornado pelo backend
      const firstErrorField = Object.keys(validationErrors).find(k => k !== '_general') as keyof SupplierFormData | undefined
      const stepWithError = firstErrorField ? FIELD_STEP[firstErrorField] : undefined
      if (stepWithError !== undefined) {
        setCurrentStep(stepWithError)
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

  const isLastStep = currentStep === STEPS.length - 1

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

        <OrderStepper
          currentStep={currentStep}
          steps={STEPS}
          onStepClick={goToStep}
          completedSteps={completedSteps}
        />

        {backendErrors._general && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{backendErrors._general}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Passo 1: Dados Principais */}
          {currentStep === 0 && (
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
          )}

          {/* Passo 2: Contato */}
          {currentStep === 1 && (
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
          )}

          {/* Passo 3: Endereço */}
          {currentStep === 2 && (
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
          )}

          {/* Passo 4: Financeiro */}
          {currentStep === 3 && (
            <div className="space-y-6">
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

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  {...register('notes')}
                  placeholder="Informações adicionais sobre o fornecedor..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-row items-center justify-between sm:justify-between gap-2">
            <div>
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={goBack} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Voltar
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                  Cancelar
                </Button>
              )}
            </div>

            {isLastStep ? (
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Salvando...' : supplier ? 'Atualizar' : 'Criar Fornecedor'}
              </Button>
            ) : (
              <Button type="button" onClick={goNext} disabled={isLoading}>
                Continuar
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
