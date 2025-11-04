"use client"

import { useState, useEffect } from "react"
import { DataTable } from "./components/data-table"
import { PlanFormDialog } from "./components/plan-form-dialog"
import { SuccessAlert } from "./components/success-alert"
import { useAuthenticatedPlans, useMutation } from "@/hooks/use-authenticated-api"
import { endpoints } from "@/lib/api-client"
import { PageLoading } from "@/components/ui/loading-progress"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export interface PlanDetail {
  id: number
  name: string
  description: string
  plan_id: number
}

export interface Plan {
  id: number
  name: string
  url: string
  price: string | number
  description: string | null
  is_active: boolean
  max_users: number | null
  max_products: number | null
  max_orders_per_month: number | null
  has_marketing: boolean
  has_reports: boolean
  details: PlanDetail[]
}

export interface PlanFormValues {
  name: string
  url: string
  price: number
  description?: string
  is_active: boolean
  max_users: number | null
  max_products: number | null
  max_orders_per_month: number | null
  has_marketing: boolean
  has_reports: boolean
  details?: Array<{ name: string }>
}

export default function PlansPage() {
  const { data: plansFromApi, loading, error, refetch, isAuthenticated } = useAuthenticatedPlans()
  const { mutate: createPlan, loading: creating } = useMutation()
  const { mutate: updatePlan, loading: updating } = useMutation()
  const { mutate: deletePlan, loading: deleting } = useMutation()

  // Estado local para manipulação otimista da lista
  const [localPlans, setLocalPlans] = useState<Plan[]>([])
  
  const [successAlert, setSuccessAlert] = useState({
    open: false,
    title: "",
    message: "",
  })

  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // Sincronizar planos da API com estado local
  useEffect(() => {
    if (plansFromApi && Array.isArray(plansFromApi)) {
      setLocalPlans(plansFromApi)
    }
  }, [plansFromApi])

  const handleAddPlan = async (planData: PlanFormValues) => {
    try {
      const result = await createPlan(
        endpoints.plans.create,
        "POST",
        planData
      )

      if (result) {
        // Adicionar plano à lista local imediatamente
        if (result && typeof result === 'object' && 'id' in result) {
          setLocalPlans((prevPlans) => [...prevPlans, result as Plan])
        }

        setSuccessAlert({
          open: true,
          title: "Sucesso!",
          message: "Plano criado com sucesso!",
        })
        setFormDialogOpen(false)
        
        // Recarregar da API em segundo plano
        refetch()
      }
    } catch (error) {
      console.error("Erro ao criar plano:", error)
      setSuccessAlert({
        open: true,
        title: "Erro!",
        message: "Erro ao criar plano. Tente novamente."
      })
    }
  }

  const handleEditPlan = async (planData: PlanFormValues) => {
    if (!editingPlan) return

    try {
      const result = await updatePlan(
        endpoints.plans.update(editingPlan.id),
        "PUT",
        planData
      )

      // Atualizar plano na lista local imediatamente
      setLocalPlans((prevPlans) =>
        prevPlans.map((p) =>
          p.id === editingPlan.id
            ? { ...p, ...planData, id: editingPlan.id, details: editingPlan.details }
            : p
        )
      )

      setSuccessAlert({
        open: true,
        title: "Sucesso!",
        message: "Plano atualizado com sucesso!",
      })
      setFormDialogOpen(false)
      setEditingPlan(null)

      // Recarregar da API em segundo plano
      refetch()
    } catch (error) {
      console.error("Erro ao editar plano:", error)
      setSuccessAlert({
        open: true,
        title: "Erro!",
        message: "Erro ao editar plano. Tente novamente."
      })
      // Em caso de erro, recarregar lista para garantir consistência
      refetch()
    }
  }

  const handleDeletePlan = async (id: number) => {
    try {
      const result = await deletePlan(
        endpoints.plans.delete(id),
        "DELETE"
      )

      // Remover plano da lista local imediatamente (UI otimista)
      setLocalPlans((prevPlans) => prevPlans.filter((p) => p.id !== id))

      setSuccessAlert({
        open: true,
        title: "Sucesso!",
        message: "Plano excluído com sucesso!",
      })

      // Recarregar da API em segundo plano para garantir sincronização
      refetch()
    } catch (error) {
      console.error("Erro ao excluir plano:", error)
      setSuccessAlert({
        open: true,
        title: "Erro!",
        message: "Erro ao excluir plano. Tente novamente."
      })
      // Em caso de erro, recarregar lista para garantir consistência
      refetch()
    }
  }

  const handleStartEdit = (plan: Plan) => {
    setEditingPlan(plan)
    setFormDialogOpen(true)
  }

  const handleStartNew = () => {
    setEditingPlan(null)
    setFormDialogOpen(true)
  }

  if (!isAuthenticated) {
    return <PageLoading />
  }

  if (loading) {
    return <PageLoading isLoading={loading} message="Carregando planos..." />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">Erro ao carregar planos: {error}</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Planos de Assinatura</h1>
            <p className="text-muted-foreground">
              Gerencie os planos disponíveis no sistema
            </p>
          </div>
          <Button onClick={handleStartNew} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        <DataTable
          plans={Array.isArray(localPlans) ? localPlans : []}
          onDeletePlan={handleDeletePlan}
          onEditPlan={handleStartEdit}
        />
      </div>

      <PlanFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={editingPlan ? handleEditPlan : handleAddPlan}
        editPlan={editingPlan}
        loading={creating || updating}
      />

      <SuccessAlert
        open={successAlert.open}
        onOpenChange={(open: boolean) =>
          setSuccessAlert((prev) => ({ ...prev, open }))
        }
        title={successAlert.title}
        message={successAlert.message}
      />
    </div>
  )
}

