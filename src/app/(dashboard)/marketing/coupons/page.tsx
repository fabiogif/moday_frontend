"use client"

import { useMemo, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useAuthenticatedApi, useMutation } from "@/hooks/use-authenticated-api"
import { endpoints } from "@/lib/api-client"
import { toast } from "sonner"
import { MoreHorizontal, Plus, RefreshCcw, TicketPercent } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Coupon {
  uuid: string
  code: string
  name: string
  description?: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_discount_amount?: number | null
  minimum_order_amount?: number | null
  usage_limit?: number | null
  usage_limit_per_client?: number | null
  times_redeemed: number
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  is_featured: boolean
  metadata?: Record<string, any> | null
  created_at?: string
  updated_at?: string
}

interface CouponStats {
  total: number
  active: number
  scheduled: number
  expired: number
  expiring_soon: number
}

interface CouponFormState {
  code: string
  name: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: string
  max_discount_amount: string
  minimum_order_amount: string
  usage_limit: string
  usage_limit_per_client: string
  start_at: string
  end_at: string
  is_active: boolean
  is_featured: boolean
}

const emptyFormState: CouponFormState = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: "10",
  max_discount_amount: "",
  minimum_order_amount: "",
  usage_limit: "",
  usage_limit_per_client: "",
  start_at: "",
  end_at: "",
  is_active: true,
  is_featured: false,
}

const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "-"
  return `R$ ${value.toFixed(2)}`
}

const formatDiscount = (coupon: Coupon) => {
  if (coupon.discount_type === "percentage") {
    return `${coupon.discount_value.toFixed(2)}%`
  }
  return formatCurrency(coupon.discount_value)
}

const formatDate = (value?: string | null) => {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

const resolveStatus = (coupon: Coupon) => {
  const now = new Date()
  const start = coupon.start_at ? new Date(coupon.start_at) : null
  const end = coupon.end_at ? new Date(coupon.end_at) : null

  if (!coupon.is_active) return { label: "Inativo", tone: "destructive" as const }
  if (end && end.getTime() < now.getTime()) return { label: "Expirado", tone: "secondary" as const }
  if (start && start.getTime() > now.getTime()) return { label: "Agendado", tone: "warning" as const }
  return { label: "Ativo", tone: "default" as const }
}

export default function CouponsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formState, setFormState] = useState<CouponFormState>(emptyFormState)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)

  const { data: couponsResponse, loading, error, refetch, isAuthenticated } = useAuthenticatedApi<any>(
    endpoints.marketing.coupons.list
  )
  const { data: statsResponse, loading: statsLoading, refetch: refetchStats } = useAuthenticatedApi<CouponStats>(
    endpoints.marketing.coupons.stats
  )
  const { mutate: mutateCoupon, loading: saving } = useMutation<any, Partial<CouponFormState>>()
  const { mutate: mutateToggle, loading: toggling } = useMutation()
  const { mutate: mutateDelete, loading: deleting } = useMutation()

  const coupons: Coupon[] = useMemo(() => {
    if (!couponsResponse) return []
    if (Array.isArray(couponsResponse)) return couponsResponse as Coupon[]
    if (Array.isArray(couponsResponse.data)) return couponsResponse.data as Coupon[]
    return []
  }, [couponsResponse])

  const stats: CouponStats | null = useMemo(() => {
    if (!statsResponse) return null
    if ("data" in (statsResponse as any)) {
      return (statsResponse as any).data as CouponStats
    }
    return statsResponse
  }, [statsResponse])

  const openCreateDialog = () => {
    setEditingCoupon(null)
    setFormState(emptyFormState)
    setIsDialogOpen(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormState({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description ?? "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      max_discount_amount: coupon.max_discount_amount?.toString() ?? "",
      minimum_order_amount: coupon.minimum_order_amount?.toString() ?? "",
      usage_limit: coupon.usage_limit?.toString() ?? "",
      usage_limit_per_client: coupon.usage_limit_per_client?.toString() ?? "",
      start_at: coupon.start_at ? coupon.start_at.slice(0, 16) : "",
      end_at: coupon.end_at ? coupon.end_at.slice(0, 16) : "",
      is_active: coupon.is_active,
      is_featured: coupon.is_featured,
    })
    setIsDialogOpen(true)
  }

  const closeDialog = () => {
    setIsDialogOpen(false)
    setFormState(emptyFormState)
    setEditingCoupon(null)
  }

  const handleInputChange = (field: keyof CouponFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const parseNumber = (value: string) => {
    if (!value) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  const handleSubmit = async () => {
    const payload: any = {
      code: formState.code.trim(),
      name: formState.name.trim(),
      description: formState.description.trim() || null,
      discount_type: formState.discount_type,
      discount_value: Number(formState.discount_value) || 0,
      max_discount_amount: parseNumber(formState.max_discount_amount) ?? null,
      minimum_order_amount: parseNumber(formState.minimum_order_amount) ?? null,
      usage_limit: parseNumber(formState.usage_limit) ?? null,
      usage_limit_per_client: parseNumber(formState.usage_limit_per_client) ?? null,
      start_at: formState.start_at || null,
      end_at: formState.end_at || null,
      is_active: formState.is_active,
      is_featured: formState.is_featured,
    }

    try {
      if (editingCoupon) {
        await mutateCoupon(endpoints.marketing.coupons.update(editingCoupon.uuid), "PUT", payload)
        toast.success("Cupom atualizado com sucesso!")
      } else {
        await mutateCoupon(endpoints.marketing.coupons.create, "POST", payload)
        toast.success("Cupom criado com sucesso!")
      }
      closeDialog()
      await Promise.all([refetch(), refetchStats()])
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível salvar o cupom")
    }
  }

  const handleToggleActive = async (coupon: Coupon, active: boolean) => {
    try {
      await mutateToggle(endpoints.marketing.coupons.toggle(coupon.uuid), "PATCH", { is_active: active })
      toast.success(active ? "Cupom ativado" : "Cupom desativado")
      await Promise.all([refetch(), refetchStats()])
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível alterar o status")
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    try {
      await mutateDelete(endpoints.marketing.coupons.delete(coupon.uuid), "DELETE")
      toast.success("Cupom removido")
      await Promise.all([refetch(), refetchStats()])
    } catch (err: any) {
      toast.error(err?.message || "Não foi possível remover o cupom")
    }
  }

  const isBusy = saving || toggling || deleting

  return (
    <div className="flex flex-col gap-6 px-4 pb-8 md:px-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <TicketPercent className="h-4 w-4" />
            Marketing
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Cupons Promocionais</h1>
          <p className="text-muted-foreground">
            Crie campanhas de desconto, acompanhe desempenho e mantenha seus clientes engajados.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            disabled={loading}
            onClick={() => {
              refetch()
              refetchStats()
            }}
          >
            <RefreshCcw className={cn("mr-2 h-4 w-4", loading ? "animate-spin" : "")} /> Atualizar
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" /> Novo Cupom
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 w-full rounded-2xl" />)
        ) : stats ? (
          [
            {
              label: "Cupons Ativos",
              value: stats.active,
              description: "Disponíveis para os clientes",
            },
            {
              label: "Agendados",
              value: stats.scheduled,
              description: "Entrarão em vigor futuramente",
            },
            {
              label: "Expirados",
              value: stats.expired,
              description: "Finalizados recentemente",
            },
            {
              label: "Total",
              value: stats.total,
              description: `${stats.expiring_soon} expiram em até 7 dias`,
            },
          ].map((stat, index) => (
            <Card key={index} className="rounded-2xl border border-border/60 shadow-sm">
              <CardHeader>
                <CardDescription>{stat.description}</CardDescription>
                <CardTitle className="text-3xl font-bold">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Não foi possível carregar as estatísticas.</p>
        )}
      </div>

      <Card className="rounded-3xl border border-border/60 shadow-sm">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Cupons cadastrados</CardTitle>
            <CardDescription>Gerencie códigos, limites de uso e período de validade.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {error ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <p>Não foi possível carregar os cupons.</p>
              <Button variant="outline" className="mt-4" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              <p>Nenhum cupom cadastrado ainda.</p>
              <p className="mt-1">Clique em "Novo Cupom" para criar sua primeira campanha.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="hidden md:table-cell">Desconto</TableHead>
                  <TableHead className="hidden lg:table-cell">Período</TableHead>
                  <TableHead className="hidden xl:table-cell">Limites</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px] text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => {
                  const status = resolveStatus(coupon)
                  return (
                    <TableRow key={coupon.uuid} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold uppercase tracking-wide">{coupon.code}</span>
                          <span className="text-xs text-muted-foreground">Criação: {formatDate(coupon.created_at)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{coupon.name}</p>
                          {coupon.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">{coupon.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2 text-xs">
                            {coupon.is_featured && <Badge variant="outline">Destaque</Badge>}
                            {coupon.metadata?.segment && (
                              <Badge variant="outline">Segmento: {coupon.metadata.segment}</Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <p className="font-semibold text-primary">{formatDiscount(coupon)}</p>
                          {coupon.max_discount_amount ? (
                            <p className="text-xs text-muted-foreground">
                              Limite: {formatCurrency(coupon.max_discount_amount)}
                            </p>
                          ) : null}
                          {coupon.minimum_order_amount ? (
                            <p className="text-xs text-muted-foreground">
                              Pedido mínimo: {formatCurrency(coupon.minimum_order_amount)}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Início: {formatDate(coupon.start_at)}</p>
                          <p>Fim: {formatDate(coupon.end_at)}</p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Uso total: {coupon.usage_limit ? `${coupon.times_redeemed}/${coupon.usage_limit}` : `${coupon.times_redeemed}`}</p>
                          <p>
                            Por cliente: {coupon.usage_limit_per_client ? coupon.usage_limit_per_client : "Ilimitado"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={coupon.is_active}
                              onCheckedChange={(checked) => handleToggleActive(coupon, checked)}
                              disabled={isBusy}
                            />
                            <Badge variant={status.tone === "default" ? "default" : "outline"}>{status.label}</Badge>
                          </div>
                          {coupon.end_at && (
                            <p className="text-[11px] text-muted-foreground">
                              Expira em {formatDate(coupon.end_at)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Abrir ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => openEditDialog(coupon)}>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleToggleActive(coupon, !coupon.is_active)}>
                              {coupon.is_active ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={() => handleDelete(coupon)}
                            >
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => (!open && !isBusy ? closeDialog() : setIsDialogOpen(open))}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? "Editar cupom" : "Novo cupom"}</DialogTitle>
            <DialogDescription>
              Configure o código, o tipo de desconto e as restrições de uso.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="code">Código *</Label>
                <Input
                  id="code"
                  value={formState.code}
                  onChange={(event) => handleInputChange("code", event.target.value.toUpperCase())}
                  placeholder="PROMO2024"
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formState.name}
                  onChange={(event) => handleInputChange("name", event.target.value)}
                  placeholder="Desconto de Primavera"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formState.description}
                onChange={(event) => handleInputChange("description", event.target.value)}
                placeholder="Detalhe regras adicionais ou canais de divulgação"
                rows={3}
              />
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Tipo de desconto *</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant={formState.discount_type === "percentage" ? "default" : "outline"}
                    onClick={() => handleInputChange("discount_type", "percentage")}
                    size="sm"
                  >
                    Percentual (%)
                  </Button>
                  <Button
                    type="button"
                    variant={formState.discount_type === "fixed" ? "default" : "outline"}
                    onClick={() => handleInputChange("discount_type", "fixed")}
                    size="sm"
                  >
                    Valor fixo (R$)
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_value">Valor *</Label>
                <Input
                  id="discount_value"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.discount_value}
                  onChange={(event) => handleInputChange("discount_value", event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">Limite de desconto</Label>
                <Input
                  id="max_discount_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.max_discount_amount}
                  onChange={(event) => handleInputChange("max_discount_amount", event.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minimum_order_amount">Pedido mínimo</Label>
                <Input
                  id="minimum_order_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formState.minimum_order_amount}
                  onChange={(event) => handleInputChange("minimum_order_amount", event.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit">Limite total de uso</Label>
                <Input
                  id="usage_limit"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.usage_limit}
                  onChange={(event) => handleInputChange("usage_limit", event.target.value)}
                  placeholder="Ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usage_limit_per_client">Limite por cliente</Label>
                <Input
                  id="usage_limit_per_client"
                  type="number"
                  min="0"
                  step="1"
                  value={formState.usage_limit_per_client}
                  onChange={(event) => handleInputChange("usage_limit_per_client", event.target.value)}
                  placeholder="Ilimitado"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_at">Início</Label>
                <Input
                  id="start_at"
                  type="datetime-local"
                  value={formState.start_at}
                  onChange={(event) => handleInputChange("start_at", event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_at">Fim</Label>
                <Input
                  id="end_at"
                  type="datetime-local"
                  value={formState.end_at}
                  onChange={(event) => handleInputChange("end_at", event.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <div>
                  <p className="font-medium">Cupom ativo</p>
                  <p className="text-xs text-muted-foreground">Clientes poderão utilizar imediatamente.</p>
                </div>
                <Switch
                  checked={formState.is_active}
                  onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-4 py-3">
                <div>
                  <p className="font-medium">Destacar cupom</p>
                  <p className="text-xs text-muted-foreground">Evidencie na vitrine pública e nas comunicações.</p>
                </div>
                <Switch
                  checked={formState.is_featured}
                  onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={isBusy}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={isBusy}>
              {saving ? "Salvando..." : editingCoupon ? "Salvar alterações" : "Criar cupom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isAuthenticated && (
        <div className="rounded-3xl border border-dashed border-border/60 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Você precisa estar autenticado para gerenciar cupons.
        </div>
      )}
    </div>
  )
}
