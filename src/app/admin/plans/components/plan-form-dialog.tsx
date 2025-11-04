"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plan, PlanFormValues, PlanDetail } from "../page"
import { PlanDetailsManager } from "./plan-details-manager"

interface PlanFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: PlanFormValues) => void
  editPlan?: Plan | null
  loading?: boolean
}

export function PlanFormDialog({
  open,
  onOpenChange,
  onSubmit,
  editPlan,
  loading = false
}: PlanFormDialogProps) {
  const [formData, setFormData] = useState<PlanFormValues>({
    name: "",
    url: "",
    price: 0,
    description: "",
    is_active: true,
    max_users: null,
    max_products: null,
    max_orders_per_month: null,
    has_marketing: false,
    has_reports: false,
  })

  const [details, setDetails] = useState<PlanDetail[]>([])

  // Carregar dados quando estiver editando
  useEffect(() => {
    if (editPlan) {
      setFormData({
        name: editPlan.name,
        url: editPlan.url,
        price: Number(editPlan.price),
        description: editPlan.description || "",
        is_active: editPlan.is_active,
        max_users: editPlan.max_users,
        max_products: editPlan.max_products,
        max_orders_per_month: editPlan.max_orders_per_month,
        has_marketing: editPlan.has_marketing || false,
        has_reports: editPlan.has_reports || false,
      })
      setDetails(editPlan.details || [])
    } else {
      // Resetar form quando não estiver editando
      setFormData({
        name: "",
        url: "",
        price: 0,
        description: "",
        is_active: true,
        max_users: null,
        max_products: null,
        max_orders_per_month: null,
        has_marketing: false,
        has_reports: false,
      })
      setDetails([])
    }
  }, [editPlan, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Incluir details junto com formData
    const dataToSubmit = {
      ...formData,
      details: details.map(d => ({ name: d.name }))
    }
    onSubmit(dataToSubmit as any)
  }

  // Gerar URL automaticamente a partir do nome
  const generateUrl = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove acentos
      .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
      .replace(/\s+/g, "-") // Substitui espaços por hífen
      .replace(/-+/g, "-") // Remove hífens duplicados
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      url: generateUrl(name)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editPlan ? "Editar Plano" : "Novo Plano"}
          </DialogTitle>
          <DialogDescription>
            {editPlan
              ? "Atualize as informações do plano"
              : "Preencha os dados para criar um novo plano"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Informações Básicas</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Nome do Plano <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ex: Básico, Premium, Enterprise"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">
                  URL (slug) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="Ex: basico, premium"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição do plano"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="price">
                Preço (R$) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                placeholder="0.00"
                required
              />
            </div>
          </div>

          {/* Limites */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm">Limites do Plano</h3>
            <p className="text-xs text-muted-foreground">
              Deixe em branco ou defina valores altos (999999) para ilimitado
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="max_users">Máximo de Usuários</Label>
                <Input
                  id="max_users"
                  type="number"
                  min="0"
                  value={formData.max_users === null ? "" : formData.max_users}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_users: e.target.value === "" ? null : Number(e.target.value)
                  })}
                  placeholder="Ex: 5 ou 999999"
                />
              </div>

              <div>
                <Label htmlFor="max_products">Máximo de Produtos</Label>
                <Input
                  id="max_products"
                  type="number"
                  min="0"
                  value={formData.max_products === null ? "" : formData.max_products}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_products: e.target.value === "" ? null : Number(e.target.value)
                  })}
                  placeholder="Ex: 100 ou 999999"
                />
              </div>

              <div>
                <Label htmlFor="max_orders_per_month">Pedidos/mês</Label>
                <Input
                  id="max_orders_per_month"
                  type="number"
                  min="0"
                  value={formData.max_orders_per_month === null ? "" : formData.max_orders_per_month}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    max_orders_per_month: e.target.value === "" ? null : Number(e.target.value)
                  })}
                  placeholder="Ex: 100 ou vazio"
                />
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold text-sm">Features Incluídas</h3>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="has_marketing">Acesso a Marketing</Label>
                  <p className="text-xs text-muted-foreground">
                    Permite acesso ao módulo de Marketing
                  </p>
                </div>
                <Switch
                  id="has_marketing"
                  checked={formData.has_marketing}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_marketing: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="has_reports">Acesso a Relatórios</Label>
                  <p className="text-xs text-muted-foreground">
                    Permite acesso ao módulo de Relatórios
                  </p>
                </div>
                <Switch
                  id="has_reports"
                  checked={formData.has_reports}
                  onCheckedChange={(checked) => setFormData({ ...formData, has_reports: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Plano Ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    Planos inativos não aparecem na landing page
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
          </div>

          {/* Detalhes do Plano */}
          <div className="space-y-4 border-t pt-4">
            <PlanDetailsManager details={details} onChange={setDetails} />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="cursor-pointer"
            >
              {loading ? "Salvando..." : editPlan ? "Atualizar Plano" : "Criar Plano"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

