"use client"

import { useState, useEffect } from "react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Plus, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useInputMask } from "@/hooks/use-input-mask"
import { validateCPF, validateEmail, validatePhone, maskCPF, maskPhone, maskZipCode } from "@/lib/masks"
import { useViaCEP } from "@/hooks/use-viacep"
import { StateCityFormFields } from "@/components/location/state-city-form-fields"
import { useBackendValidation } from "@/hooks/use-backend-validation"
import { showErrorToast, showSuccessToast } from "@/components/ui/error-toast"

const clientFormSchema = z.object({
  name: z.string().min(3, {
    message: "O nome completo deve ter pelo menos 3 caracteres.",
  }).max(255, {
    message: "O nome completo não pode ter mais de 255 caracteres.",
  }),
  cpf: z.string()
    .min(1, { message: "CPF é obrigatório." })
    .refine((value) => validateCPF(value), {
      message: "CPF inválido. Verifique os dígitos.",
    }),
  email: z.string()
    .min(1, { message: "Email é obrigatório." })
    .refine((value) => validateEmail(value), {
      message: "Email inválido. Use o formato: exemplo@email.com",
    }),
  phone: z.string()
    .min(1, { message: "Telefone é obrigatório." })
    .refine((value) => validatePhone(value), {
      message: "Telefone inválido. Use (00) 00000-0000",
    }),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2, {
    message: "Estado deve ter 2 caracteres (UF).",
  }).optional(),
  zip_code: z.string().optional(),
  neighborhood: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  isActive: z.boolean(),
})

interface ClientFormValues {
  name: string
  cpf: string
  email: string
  phone: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  neighborhood?: string
  number?: string
  complement?: string
  isActive: boolean
}

interface ClientFormDialogProps {
  onAddClient: (clientData: ClientFormValues) => void | Promise<void>
  onEditClient?: (id: number, clientData: ClientFormValues) => void | Promise<void>
  editingClient?: ClientFormValues & { id: number } | null
  open: boolean
  onOpenChange: (open: boolean) => void
  hideTrigger?: boolean // Se true, não mostra o botão "Novo Cliente"
}

export function ClientFormDialog({ 
  onAddClient, 
  onEditClient, 
  editingClient, 
  open, 
  onOpenChange,
  hideTrigger = false 
}: ClientFormDialogProps) {
  const isEditing = !!editingClient
  const { loading: loadingCEP, searchCEP } = useViaCEP();
  const [submitting, setSubmitting] = React.useState(false);
  const [pendingCity, setPendingCity] = React.useState<string | null>(null);

  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      neighborhood: "",
      number: "",
      complement: "",
      isActive: true,
    },
  })

  const { handleBackendErrors } = useBackendValidation(form.setError)
  
  // Monitorar quando o estado mudar e há uma cidade pendente para ser setada
  const currentState = form.watch('state');
  React.useEffect(() => {
    if (pendingCity && currentState) {
      // Aguardar um pouco para as cidades carregarem
      const timer = setTimeout(() => {
        form.setValue('city', pendingCity);
        setPendingCity(null);
        
        if (process.env.NODE_ENV === 'development') {

        }
      }, 1000); // 1 segundo para garantir que as cidades carregaram
      
      return () => clearTimeout(timer);
    }
  }, [currentState, pendingCity, form]);
  
  // Função para buscar endereço pelo CEP
  const handleSearchCEP = async (cep: string) => {
    // Remove máscara e valida
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      return; // CEP incompleto, não busca
    }
    
    try {
      const address = await searchCEP(cep);
      
      if (address) {
        if (process.env.NODE_ENV === 'development') {

        }
        
        // Preenche os campos automaticamente
        form.setValue('address', address.address || address.logradouro || '');
        form.setValue('neighborhood', address.neighborhood || address.bairro || '');
        
        // Setar o estado primeiro (isso vai carregar as cidades)
        const stateToSet = address.state || address.uf || '';
        const cityToSet = address.city || address.localidade || '';
        
        form.setValue('state', stateToSet);
        
        // Armazenar a cidade para ser setada quando as cidades carregarem
        if (cityToSet) {
          setPendingCity(cityToSet);
          
          if (process.env.NODE_ENV === 'development') {

          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {

      }
      // Erro já é tratado pelo useViaCEP com toast
    }
  }

  // Preencher o formulário quando editingClient mudar
  React.useEffect(() => {
    // Limpar cidade pendente ao resetar formulário
    setPendingCity(null);
    
    if (editingClient) {
      form.reset({
        name: editingClient.name || "",
        cpf: editingClient.cpf || "",
        email: editingClient.email || "",
        phone: editingClient.phone || "",
        address: editingClient.address || "",
        city: editingClient.city || "",
        state: editingClient.state || "",
        zip_code: editingClient.zip_code || "",
        neighborhood: editingClient.neighborhood || "",
        number: editingClient.number || "",
        complement: editingClient.complement || "",
        isActive: editingClient.isActive ?? true,
      })
    } else {
      form.reset({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        neighborhood: "",
        number: "",
        complement: "",
        isActive: true,
      })
    }
  }, [editingClient, form])

  const onSubmit = async (data: ClientFormValues) => {
    try {
      setSubmitting(true)
      
      if (isEditing && editingClient && onEditClient) {
        await onEditClient(editingClient.id, data)
      } else {
        await onAddClient(data)
      }
      
      // Só fechar e limpar se não houver erro
      form.reset()
      onOpenChange(false)
      
    } catch (error: any) {
      // Log organizado apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {

      }
      
      // Tentar tratar erros do backend automaticamente
      const handled = handleBackendErrors(error)
      
      // Se não conseguiu tratar automaticamente, mostrar erro formatado
      if (!handled) {
        // Mostrar toast com erro formatado
        showErrorToast(error, isEditing ? 'Erro ao Atualizar Cliente' : 'Erro ao Cadastrar Cliente')
        
        // Verificar se é erro de CPF duplicado
        if (error?.data?.message?.includes('CPF')) {
          form.setError('cpf', { 
            type: 'manual', 
            message: error.data.message 
          })
        } else if (error?.data?.message?.includes('email')) {
          form.setError('email', { 
            type: 'manual', 
            message: error.data.message 
          })
        }
      } else {
        // Se foi tratado, ainda mostrar toast
        showErrorToast(error, isEditing ? 'Erro ao Atualizar Cliente' : 'Erro ao Cadastrar Cliente')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEditing && !hideTrigger && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Edite os dados do cliente abaixo.' 
              : 'Adicione um novo cliente ao sistema. Preencha os dados abaixo.'
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Dados básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => {
                  const handleCPFChange = useInputMask('cpf', field.onChange);
                  
                  return (
                    <FormItem className="md:col-span-2">
                      <FormLabel>CPF *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="000.000.000-00" 
                          value={field.value}
                          onChange={handleCPFChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          maxLength={14}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="joao@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => {
                  const handlePhoneChange = useInputMask('phone', field.onChange);
                  
                  return (
                    <FormItem>
                      <FormLabel>Telefone *</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(11) 99999-9999" 
                          value={field.value}
                          onChange={handlePhoneChange}
                          onBlur={field.onBlur}
                          name={field.name}
                          maxLength={15}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Endereço (Opcional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Logradouro</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua das Flores, Av. Paulista" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complemento</FormLabel>
                      <FormControl>
                        <Input placeholder="Apto 101" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Estado e Cidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <StateCityFormFields
                    control={form.control}
                    stateFieldName="state"
                    cityFieldName="city"
                    stateLabel="Estado"
                    cityLabel="Cidade"
                    gridCols="equal"
                  />
                </div>

                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => {
                    const handleZipCodeChange = useInputMask('zipCode', field.onChange);
                    
                    return (
                      <FormItem>
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="01234-567" 
                              value={field.value}
                              onChange={handleZipCodeChange}
                              onBlur={(e) => {
                                field.onBlur();
                                handleSearchCEP(e.target.value);
                              }}
                              name={field.name}
                              maxLength={9}
                              disabled={loadingCEP}
                            />
                            {loadingCEP && (
                              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <p className="text-xs text-muted-foreground mt-1">
                          {loadingCEP ? 'Buscando endereço...' : 'Digite o CEP para preencher automaticamente'}
                        </p>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            </div>

            {/* Status */}
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Cliente Ativo</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Este cliente poderá fazer pedidos
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Salvando...' : 'Criando...'}
                  </>
                ) : (
                  isEditing ? 'Salvar Alterações' : 'Criar Cliente'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
