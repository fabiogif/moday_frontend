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
import { Loader2, Building2, Upload, X, ExternalLink, Copy } from "lucide-react"
import Image from "next/image"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = useState(false)

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

  // Manipular seleção de logo
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB')
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor, selecione uma imagem válida')
        return
      }

      setLogoFile(file)
      setRemoveLogo(false)
      
      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remover logo
  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    setRemoveLogo(true)
    toast.success('Logo marcado para remoção')
  }

  // Cancelar remoção
  const handleCancelRemove = () => {
    setRemoveLogo(false)
    toast.success('Remoção de logo cancelada')
  }

  // Copiar slug/URL da loja
  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug)
    toast.success('Slug copiado para a área de transferência')
  }

  const handleCopyStoreUrl = (slug: string) => {
    const storeUrl = `${window.location.origin}/store/${slug}`
    navigator.clipboard.writeText(storeUrl)
    toast.success('URL da loja copiada para a área de transferência')
  }

  async function onSubmit(data: CompanyFormValues) {
    if (!tenantData?.uuid) {
      toast.error('Dados da empresa não encontrados')
      return
    }

    try {
      setSaving(true)
      
      // Preparar FormData se houver arquivo
      let response
      if (logoFile || removeLogo) {
        const formData = new FormData()
        
        // Adicionar campos do formulário
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            formData.append(key, value.toString())
          }
        })
        
        // Adicionar arquivo se houver
        if (logoFile) {
          formData.append('logo', logoFile)
        }
        
        // Marcar para remover logo se necessário
        if (removeLogo && !logoFile) {
          formData.append('remove_logo', 'true')
        }
        
        // Enviar com FormData (multipart/form-data)
        response = await apiClient.put(`/api/tenant/${tenantData.uuid}`, formData)
      } else {
        // Enviar como JSON normal
        response = await apiClient.put(`/api/tenant/${tenantData.uuid}`, data)
      }
      
      if (response.success) {
        toast.success('Informações da empresa atualizadas com sucesso')
        
        // Atualizar dados locais
        if (response.data) {
          setTenantData(response.data as TenantData)
          setLogoFile(null)
          setLogoPreview(null)
          setRemoveLogo(false)
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
            <div className="flex items-center gap-4 mb-6">
              {tenantData.logo ? (
                <Image 
                  src={tenantData.logo} 
                  alt={tenantData.name} 
                  width={80} 
                  height={80} 
                  className="rounded-lg object-cover border"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center border">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{tenantData.name}</h3>
                <p className="text-sm text-muted-foreground">{tenantData.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    {tenantData.slug}
                  </Badge>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopySlug(tenantData.slug)}
                    className="h-6 w-6 p-0"
                    title="Copiar slug"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/store/${tenantData.slug}`, '_blank')}
                    className="h-6 w-6 p-0"
                    title="Abrir loja pública"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">URL da Loja</label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    /store/{tenantData.slug}
                  </code>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyStoreUrl(tenantData.slug)}
                    className="h-7 px-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`/store/${tenantData.slug}`, '_blank')}
                    className="h-7 px-2"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Abrir
                  </Button>
                </div>
              </div>
              {tenantData.cnpj && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CNPJ</label>
                  <p className="text-sm">{tenantData.cnpj}</p>
                </div>
              )}
              {tenantData.phone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="text-sm">{tenantData.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">{tenantData.is_active ? 'Ativo' : 'Inativo'}</p>
              </div>
              {tenantData.city && tenantData.state && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Localização</label>
                  <p className="text-sm">{tenantData.city}/{tenantData.state}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card de Upload de Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo da Empresa</CardTitle>
              <CardDescription>
                Faça upload do logo da sua empresa. Recomendamos uma imagem quadrada de pelo menos 200x200px.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Preview do Logo */}
                <div className="flex flex-col items-center gap-3">
                  <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/30">
                    {logoPreview ? (
                      <Image 
                        src={logoPreview} 
                        alt="Preview do logo" 
                        width={128} 
                        height={128} 
                        className="object-cover w-full h-full"
                      />
                    ) : tenantData?.logo && !removeLogo ? (
                      <Image 
                        src={tenantData.logo} 
                        alt="Logo atual" 
                        width={128} 
                        height={128} 
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Building2 className="h-12 w-12 mb-2" />
                        <span className="text-xs">Sem logo</span>
                      </div>
                    )}
                  </div>
                  {(tenantData?.logo || logoPreview) && !removeLogo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveLogo}
                      className="text-destructive hover:text-destructive"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remover Logo
                    </Button>
                  )}
                  {removeLogo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCancelRemove}
                    >
                      Cancelar Remoção
                    </Button>
                  )}
                </div>

                {/* Upload Input */}
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="border-2 border-dashed rounded-lg p-6 hover:border-primary/50 transition-colors">
                        <div className="flex flex-col items-center justify-center gap-2 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">
                              Clique para fazer upload ou arraste uma imagem
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PNG, JPG ou WEBP (máx. 5MB)
                            </p>
                          </div>
                        </div>
                      </div>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleLogoChange}
                        className="hidden"
                      />
                    </Label>
                  </div>
                  {logoFile && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm font-medium">Arquivo selecionado:</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {logoFile.name} ({(logoFile.size / 1024).toFixed(2)} KB)
                      </p>
                    </div>
                  )}
                  {removeLogo && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <p className="text-sm font-medium text-destructive">
                        O logo será removido ao salvar as alterações
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

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
