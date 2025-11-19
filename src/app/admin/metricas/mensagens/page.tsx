'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import adminApi from '@/lib/admin-api-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoading } from '@/components/ui/loading-progress'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { Mail, Send, CheckCircle2, Clock, XCircle, AlertTriangle, FileText } from 'lucide-react'

interface Tenant {
  id: number
  name: string
  subdomain: string
  account_status: string
  subscription_plan: string
  trial_started_at: string | null
  trial_expires_at: string | null
  activated_at: string | null
  last_payment_at: string | null
  created_at: string
}

interface EmailFormData {
  subject: string
  message: string
  template: string
  recipients: number[]
}

const emailTemplates = {
  trial_expiring: {
    subject: '⏰ Seu período de teste está acabando!',
    message: `Olá {name},

Seu período de teste gratuito de 7 dias está chegando ao fim.

Não perca o acesso a todas as funcionalidades do Alba Tech! Continue aproveitando nosso sistema completo de gestão para seu negócio.

🎯 Benefícios de continuar:
• Gestão completa de pedidos
• Controle de estoque
• Relatórios detalhados
• Suporte prioritário
• E muito mais!

Escolha o plano ideal para você e continue crescendo!

[Ver Planos e Preços]

Atenciosamente,
Equipe Alba Tech`,
  },
  payment_reminder: {
    subject: '💳 Lembrete: Renovação do seu plano',
    message: `Olá {name},

Seu plano {plan} está próximo do vencimento.

Para continuar aproveitando todos os recursos do Alba Tech sem interrupções, renove seu plano agora!

📊 Seu plano atual:
• Plano: {plan}
• Valor: R$ {mrr}/mês
• Vencimento: {expires_at}

Clique no link abaixo para renovar:
[Renovar Agora]

Dúvidas? Nossa equipe está pronta para ajudar!

Atenciosamente,
Equipe Alba Tech`,
  },
  welcome: {
    subject: '🎉 Bem-vindo ao Alba Tech!',
    message: `Olá {name},

Seja bem-vindo(a) ao Alba Tech!

Estamos muito felizes em ter você conosco. Preparamos seu ambiente e está tudo pronto para você começar a gerenciar seu negócio de forma profissional.

🚀 Primeiros passos:
1. Complete seu perfil
2. Cadastre seus produtos
3. Configure suas formas de pagamento
4. Comece a vender!

Precisa de ajuda? Acesse nossa central de ajuda ou entre em contato com nosso suporte.

Vamos crescer juntos!

Atenciosamente,
Equipe Alba Tech`,
  },
  custom: {
    subject: '',
    message: '',
  },
}

export default function MensagensPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading, admin } = useAdminAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTenants, setSelectedTenants] = useState<number[]>([])
  const [emailData, setEmailData] = useState<EmailFormData>({
    subject: '',
    message: '',
    template: 'custom',
    recipients: [],
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login')
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (isAuthenticated) {
      loadTenants()
    }
  }, [isAuthenticated])

  const loadTenants = async () => {
    try {
      setIsLoading(true)
      const response = await adminApi.getTenants({ per_page: 100 })
      setTenants(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
      toast.error('Erro ao carregar lista de empresas')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectTenant = (tenantId: number, checked: boolean) => {
    if (checked) {
      setSelectedTenants([...selectedTenants, tenantId])
    } else {
      setSelectedTenants(selectedTenants.filter((id) => id !== tenantId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTenants(tenants.map((t) => t.id))
    } else {
      setSelectedTenants([])
    }
  }

  const handleTemplateChange = (template: string) => {
    setEmailData({
      ...emailData,
      template,
      subject: emailTemplates[template as keyof typeof emailTemplates].subject,
      message: emailTemplates[template as keyof typeof emailTemplates].message,
    })
  }

  const handleSendEmail = async () => {
    if (selectedTenants.length === 0) {
      toast.error('Selecione pelo menos uma empresa')
      return
    }

    if (!emailData.subject || !emailData.message) {
      toast.error('Preencha o assunto e a mensagem')
      return
    }

    setSending(true)

    try {
      // Enviar email via API
      const response = await adminApi.sendBulkEmail({
        tenant_ids: selectedTenants,
        subject: emailData.subject,
        message: emailData.message,
      })

      if (response.success) {
        toast.success(
          `Email "${emailData.subject}" enviado com sucesso!`,
          {
            description: `${response.data.sent} email(s) enviado(s) para as empresas selecionadas.`,
          }
        )
      }

      // Limpar seleção e fechar dialog
      setEmailData({ subject: '', message: '', template: 'custom', recipients: [] })
      setSelectedTenants([])
      setDialogOpen(false)
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      toast.error('Erro ao enviar email. Tente novamente.')
    } finally {
      setSending(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return null
  }

  if (isLoading) {
    return <PageLoading message="Carregando empresas..." />
  }

  const getStatusBadge = (tenant: Tenant) => {
    const status = tenant.account_status

    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      active: {
        variant: 'default',
        icon: CheckCircle2,
        label: 'Pago',
      },
      trial: {
        variant: 'secondary',
        icon: Clock,
        label: 'Trial',
      },
      expired: {
        variant: 'destructive',
        icon: XCircle,
        label: 'Expirado',
      },
      suspended: {
        variant: 'outline',
        icon: AlertTriangle,
        label: 'Suspenso',
      },
    }

    const config = variants[status] || variants.expired
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (date: string | null) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getDaysUntilExpiration = (expiresAt: string | null) => {
    if (!expiresAt) return null
    
    const now = new Date()
    const expires = new Date(expiresAt)
    const diffTime = expires.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }

  const selectedTenantsData = tenants.filter((t) => selectedTenants.includes(t.id))

  return (
    <div className="flex-1 space-y-6 px-6 pt-0">
      {/* Header */}
      <div className="flex md:flex-row flex-col md:items-center justify-between gap-4 md:gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight">Envio de Mensagens</h1>
          <p className="text-muted-foreground">
            Envie emails para as empresas cadastradas no sistema
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={selectedTenants.length === 0} size="lg">
              <Mail className="h-4 w-4 mr-2" />
              Enviar Email ({selectedTenants.length})
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Compor Email</DialogTitle>
              <DialogDescription>
                Enviar mensagem para {selectedTenants.length} empresa(s) selecionada(s)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Template Selector */}
              <div className="space-y-2">
                <Label htmlFor="template">Template</Label>
                <Select
                  value={emailData.template}
                  onValueChange={handleTemplateChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Email Personalizado
                      </div>
                    </SelectItem>
                    <SelectItem value="trial_expiring">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Trial Expirando
                      </div>
                    </SelectItem>
                    <SelectItem value="payment_reminder">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Lembrete de Pagamento
                      </div>
                    </SelectItem>
                    <SelectItem value="welcome">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Boas-vindas
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Assunto</Label>
                <Input
                  id="subject"
                  placeholder="Ex: Renovação de plano disponível"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  rows={12}
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Você pode usar variáveis: {'{'}name{'}'}, {'{'}plan{'}'}, {'{'}mrr{'}'}, {'{'}expires_at{'}'}
                </p>
              </div>

              {/* Recipients Preview */}
              <Alert>
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">
                    Destinatários ({selectedTenants.length}):
                  </p>
                  <div className="max-h-32 overflow-y-auto">
                    {selectedTenantsData.map((tenant, index) => (
                      <div key={tenant.id} className="text-sm py-1 flex items-center justify-between">
                        <span>
                          {index + 1}. {tenant.name}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {tenant.subdomain}@Alba Tech.app
                        </span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>

              {/* Email Preview */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-sm">Preview do Email</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Assunto:</p>
                    <p className="font-medium">{emailData.subject || '(sem assunto)'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Mensagem:</p>
                    <div className="bg-background p-3 rounded-md text-sm whitespace-pre-wrap max-h-48 overflow-y-auto border">
                      {emailData.message || '(mensagem vazia)'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSendEmail} 
                disabled={sending || !emailData.subject || !emailData.message}
              >
                {sending ? (
                  <>
                    <Send className="h-4 w-4 mr-2 animate-pulse" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar para {selectedTenants.length} empresa(s)
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros Rápidos */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const trialTenants = tenants.filter((t) => t.account_status === 'trial')
            setSelectedTenants(trialTenants.map((t) => t.id))
          }}
        >
          <Clock className="h-4 w-4 mr-2" />
          Selecionar Trials ({tenants.filter((t) => t.account_status === 'trial').length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const expiringSoon = tenants.filter((t) => {
              if (t.account_status !== 'trial' || !t.trial_expires_at) return false
              const days = getDaysUntilExpiration(t.trial_expires_at)
              return days !== null && days <= 3 && days > 0
            })
            setSelectedTenants(expiringSoon.map((t) => t.id))
          }}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Trials Expirando (
          {tenants.filter((t) => {
            if (t.account_status !== 'trial' || !t.trial_expires_at) return false
            const days = getDaysUntilExpiration(t.trial_expires_at)
            return days !== null && days <= 3 && days > 0
          }).length}
          )
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const expired = tenants.filter((t) => t.account_status === 'expired')
            setSelectedTenants(expired.map((t) => t.id))
          }}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Expirados ({tenants.filter((t) => t.account_status === 'expired').length})
        </Button>
      </div>

      {/* Lista de Empresas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Empresas Cadastradas</CardTitle>
              <CardDescription>
                Selecione as empresas para enviar email
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedTenants.length === tenants.length && tenants.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="cursor-pointer">
                Selecionar Todas ({tenants.length})
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead>Data Expiração</TableHead>
                  <TableHead className="text-right">Dias Restantes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma empresa cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  tenants.map((tenant) => {
                    const daysLeft = getDaysUntilExpiration(tenant.trial_expires_at)
                    const isSelected = selectedTenants.includes(tenant.id)

                    return (
                      <TableRow key={tenant.id} className={isSelected ? 'bg-muted/50' : ''}>
                        <TableCell>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) =>
                              handleSelectTenant(tenant.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tenant.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {tenant.subdomain}.Alba Tech.app
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(tenant)}</TableCell>
                        <TableCell>
                          <span className="text-sm">{formatDate(tenant.created_at)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {tenant.account_status === 'trial' && tenant.trial_expires_at
                              ? formatDate(tenant.trial_expires_at)
                              : tenant.activated_at
                              ? formatDate(tenant.activated_at)
                              : '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {tenant.account_status === 'trial' && daysLeft !== null ? (
                            <Badge
                              variant={
                                daysLeft <= 0
                                  ? 'destructive'
                                  : daysLeft <= 3
                                  ? 'destructive'
                                  : daysLeft <= 7
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {daysLeft > 0 ? `${daysLeft} dias` : 'Expirado'}
                            </Badge>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
