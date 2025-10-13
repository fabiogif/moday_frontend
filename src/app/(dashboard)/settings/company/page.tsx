"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const companyFormSchema = z.object({
  name: z.string().min(1, "Nome da empresa é obrigatório"),
  email: z.string().email("Endereço de email inválido"),
  cnpj: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().max(2, "Estado deve ter no máximo 2 caracteres").optional(),
  zipcode: z.string().optional(),
  country: z.string().optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

interface TenantData {
  id: number
  uuid: string
  name: string
  slug: string
  email: string
  cnpj?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipcode?: string
  country?: string
  logo?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function CompanySettings() {
  const { user } = useAuth()
  const [tenantData, setTenantData] = useState<TenantData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      email: "",
      cnpj: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipcode: "",
      country: "",
    },
  })

  // Carregar dados da empresa
  useEffect(() => {
    const loadTenantData = async () => {
      try {
        setLoading(true)
        
        // Primeiro, obter os dados do usuário para pegar o tenant_id
        const userResponse = await apiClient.get('/api/auth/me')
        
        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data as any
          
          if (userData.tenant) {
            const tenant = userData.tenant
            
            // Buscar dados completos do tenant
            const tenantResponse = await apiClient.get(`/api/tenant/${tenant.uuid}`)
            
            if (tenantResponse.success && tenantResponse.data) {
              const tenantInfo = tenantResponse.data as TenantData
              setTenantData(tenantInfo)
              
              // Preencher formulário com dados do tenant
              form.reset({
                name: tenantInfo.name || "",
                email: tenantInfo.email || "",
                cnpj: tenantInfo.cnpj || "",
                phone: tenantInfo.phone || "",
                address: tenantInfo.address || "",
                city: tenantInfo.city || "",
                state: tenantInfo.state || "",
                zipcode: tenantInfo.zipcode || "",
                country: tenantInfo.country || "",
              })
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados da empresa:', error)
        toast.error('Erro ao carregar informações da empresa')
      } finally {
        setLoading(false)
      }
    }

    loadTenantData()
  }, [form])

  async function onSubmit(data: CompanyFormValues) {
    if (!tenantData?.uuid) {
      toast.error('Dados da empresa não encontrados')
      return
    }

    try {
      setSaving(true)
      
      const response = await apiClient.put(`/api/tenant/${tenantData.uuid}`, data)
      
      if (response.success) {
        toast.success('Informações da empresa atualizadas com sucesso')
        
        // Atualizar dados locais
        if (response.data) {
          setTenantData(response.data as TenantData)
        }
      }
    } catch (error: any) {
      console.error('Erro ao atualizar empresa:', error)
      toast.error(error.message || 'Erro ao atualizar informações da empresa')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
          <p className="text-muted-foreground">
            Gerencie as informações da sua empresa.
          </p>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Carregando informações da empresa...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações da Empresa</h1>
        <p className="text-muted-foreground">
          Gerencie as informações da sua empresa.
        </p>
      </div>

      {/* Informações da empresa */}
      {tenantData && (
        <Card>
          <CardHeader>
            <CardTitle>Informações Atuais</CardTitle>
            <CardDescription>Dados cadastrados da empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome</label>
                <p className="text-sm">{tenantData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{tenantData.email}</p>
              </div>
              {tenantData.cnpj && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                  <p className="text-sm">{tenantData.cnpj}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">{tenantData.is_active ? 'Ativo' : 'Inativo'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Atualize as informações cadastrais da sua empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cnpj"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNPJ</FormLabel>
                      <FormControl>
                        <Input placeholder="00.000.000/0000-00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Endereço</CardTitle>
              <CardDescription>
                Informações de localização da empresa.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, complemento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="Cidade" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input placeholder="UF" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>País</FormLabel>
                    <FormControl>
                      <Input placeholder="Brasil" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex space-x-2">
            <Button type="submit" className="cursor-pointer" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
              )}
            </Button>
            <Button 
              variant="outline" 
              type="button" 
              className="cursor-pointer" 
              disabled={saving}
              onClick={() => form.reset()}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
