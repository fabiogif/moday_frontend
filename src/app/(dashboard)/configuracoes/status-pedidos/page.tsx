"use client"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, GripVertical, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { apiClient, endpoints } from "@/lib/api-client"
import type { OrderStatus } from "@/types/order-status"

export default function OrderStatusesPage() {
  const [statuses, setStatuses] = useState<OrderStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStatus, setEditingStatus] = useState<OrderStatus | null>(null)
  const [deletingUuid, setDeletingUuid] = useState<string | null>(null)
  
  // Form states
  const [formName, setFormName] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formColor, setFormColor] = useState("#6B7280")
  const [formIcon, setFormIcon] = useState("package")
  const [formIsInitial, setFormIsInitial] = useState(false)
  const [formIsFinal, setFormIsFinal] = useState(false)
  const [formIsActive, setFormIsActive] = useState(true)

  const fetchStatuses = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(endpoints.orderStatuses.list(false))
      
      if (response.success) {
        setStatuses(response.data)
      }
    } catch (error: any) {
      toast.error('Erro ao carregar status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatuses()
  }, [])

  const resetForm = () => {
    setFormName("")
    setFormDescription("")
    setFormColor("#6B7280")
    setFormIcon("package")
    setFormIsInitial(false)
    setFormIsFinal(false)
    setFormIsActive(true)
    setEditingStatus(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (status: OrderStatus) => {
    setEditingStatus(status)
    setFormName(status.name)
    setFormDescription(status.description || "")
    setFormColor(status.color)
    setFormIcon(status.icon)
    setFormIsInitial(status.is_initial)
    setFormIsFinal(status.is_final)
    setFormIsActive(status.is_active)
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formName) {
      toast.error('Nome é obrigatório')
      return
    }

    const data = {
      name: formName,
      description: formDescription || undefined,
      color: formColor,
      icon: formIcon,
      is_initial: formIsInitial,
      is_final: formIsFinal,
      is_active: formIsActive,
    }

    try {
      if (editingStatus) {
        const response = await apiClient.put(endpoints.orderStatuses.update(editingStatus.uuid), data)
        if (response.success) {
          toast.success('Status atualizado com sucesso')
          setDialogOpen(false)
          resetForm()
          fetchStatuses()
        }
      } else {
        const response = await apiClient.post(endpoints.orderStatuses.create, data)
        if (response.success) {
          toast.success('Status criado com sucesso')
          setDialogOpen(false)
          resetForm()
          fetchStatuses()
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao salvar status')
    }
  }

  const handleDelete = async (uuid: string) => {
    try {
      const response = await apiClient.delete(endpoints.orderStatuses.delete(uuid))
      if (response.success) {
        toast.success('Status deletado com sucesso')
        setDeletingUuid(null)
        fetchStatuses()
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao deletar status')
    }
  }

  const handleToggleActive = async (uuid: string, isActive: boolean) => {
    try {
      const response = await apiClient.put(endpoints.orderStatuses.update(uuid), {
        is_active: isActive
      })
      if (response.success) {
        toast.success(isActive ? 'Status ativado' : 'Status desativado')
        fetchStatuses()
      }
    } catch (error: any) {
      toast.error('Erro ao atualizar status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Carregando status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Status de Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie os status disponíveis para seus pedidos
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Status
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Status Cadastrados</CardTitle>
          <CardDescription>
            {statuses.length} status cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {statuses.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>Nenhum status cadastrado ainda.</p>
                <p className="text-sm mt-2">Clique em "Novo Status" para começar.</p>
              </div>
            ) : (
              statuses.map((status) => (
                <div
                  key={status.uuid}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                  
                  <div
                    className="w-6 h-6 rounded-full border-2 border-background shadow-sm"
                    style={{ backgroundColor: status.color }}
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{status.name}</p>
                      {status.is_initial && (
                        <Badge variant="secondary" className="text-xs">Inicial</Badge>
                      )}
                      {status.is_final && (
                        <Badge variant="secondary" className="text-xs">Final</Badge>
                      )}
                      {!status.is_active && (
                        <Badge variant="outline" className="text-xs">Inativo</Badge>
                      )}
                    </div>
                    {status.description && (
                      <p className="text-sm text-muted-foreground mt-1">{status.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        Ícone: {status.icon}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Posição: {status.order_position}
                      </span>
                      {status.orders_count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          {status.orders_count} pedido(s)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 mr-2">
                      <Label htmlFor={`active-${status.uuid}`} className="text-xs">
                        {status.is_active ? 'Ativo' : 'Inativo'}
                      </Label>
                      <Switch
                        id={`active-${status.uuid}`}
                        checked={status.is_active}
                        onCheckedChange={(checked) => handleToggleActive(status.uuid, checked)}
                      />
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(status)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingUuid(status.uuid)}
                      disabled={status.can_delete === false}
                      title={status.can_delete === false ? 'Não pode deletar status com pedidos' : 'Deletar'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Criação/Edição */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open)
        if (!open) resetForm()
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingStatus ? 'Editar Status' : 'Novo Status'}
            </DialogTitle>
            <DialogDescription>
              Configure as informações do status do pedido
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="Ex: Em Preparo"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Descrição opcional do status"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Cor *</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="h-10 w-20"
                  />
                  <div
                    className="h-10 flex-1 rounded-md border"
                    style={{ backgroundColor: formColor }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Ícone *</Label>
                <Input
                  id="icon"
                  value={formIcon}
                  onChange={(e) => setFormIcon(e.target.value)}
                  placeholder="Ex: package, truck, clock"
                />
                <p className="text-xs text-muted-foreground">
                  Use nomes do Lucide Icons
                </p>
              </div>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_initial">Status Inicial</Label>
                  <p className="text-xs text-muted-foreground">
                    Usado para novos pedidos
                  </p>
                </div>
                <Switch
                  id="is_initial"
                  checked={formIsInitial}
                  onCheckedChange={setFormIsInitial}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_final">Status Final</Label>
                  <p className="text-xs text-muted-foreground">
                    Indica conclusão do pedido
                  </p>
                </div>
                <Switch
                  id="is_final"
                  checked={formIsFinal}
                  onCheckedChange={setFormIsFinal}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active">Ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    Status disponível para uso
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              <Save className="mr-2 h-4 w-4" />
              {editingStatus ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deletingUuid} onOpenChange={(open) => !open && setDeletingUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja deletar este status? Esta ação não pode ser desfeita.
              {statuses.find(s => s.uuid === deletingUuid)?.orders_count ? (
                <span className="block mt-2 text-destructive font-semibold">
                  ⚠️ Este status possui {statuses.find(s => s.uuid === deletingUuid)?.orders_count} pedido(s) associado(s).
                </span>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingUuid) {
                  await handleDelete(deletingUuid)
                }
              }}
              className="bg-destructive hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

