"use client"

import { useState, useEffect } from "react"
import { PlanCard, type Plan } from "@/components/plan-card"
import { PlanMigrationModal } from "@/components/plan-migration-modal"
import { useAuthenticatedPlans } from "@/hooks/use-authenticated-api"
import { usePlanMigration } from "@/hooks/use-plan-migration"
import { usePlanLimits } from "@/hooks/use-plan-limits"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { toast } from "sonner"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function PlansSection() {
  const { user } = useAuth()
  const { data: plans, loading: plansLoading, error: plansError, refetch: refetchPlans } = useAuthenticatedPlans()
  const { migratePlan, isMigrating, error: migrationError } = usePlanMigration()
  const { currentUsage, planLimits, planName, hasLimitReached } = usePlanLimits()
  const [migrationModalOpen, setMigrationModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<{ id: number; name: string } | null>(null)
  const [currentPlanId, setCurrentPlanId] = useState<number | null>(null)

  // Buscar plan_id do tenant
  useEffect(() => {
    const fetchTenantPlan = async () => {
      try {
        if (user?.tenant?.uuid) {
          const response = await apiClient.get(`/api/tenant/${user.tenant.uuid}`)
          if (response.success && response.data) {
            const tenant = response.data as any
            setCurrentPlanId(tenant.plan_id || null)
          }
        }
      } catch (error) {
        console.error('Erro ao buscar plano do tenant:', error)
      }
    }

    if (user?.tenant?.uuid) {
      fetchTenantPlan()
    }
  }, [user])

  const handleMigrate = (planId: number) => {
    const plan = plans?.find((p: Plan) => p.id === planId)
    if (plan) {
      setSelectedPlan({ id: plan.id, name: plan.name })
      setMigrationModalOpen(true)
    }
  }

  const handleConfirmMigration = async (planId: number, notes?: string) => {
    try {
      const success = await migratePlan({ plan_id: planId, notes })
      
      if (success) {
        toast.success("Plano migrado com sucesso!")
        setMigrationModalOpen(false)
        setSelectedPlan(null)
        
        // Recarregar dados
        refetchPlans()
        
        // Recarregar página para atualizar dados do usuário
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        toast.error(migrationError || "Erro ao migrar plano")
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao migrar plano")
    }
  }

  const formatLimit = (limit: number | null) => {
    if (limit === null || limit >= 999999) {
      return 'Ilimitado'
    }
    return limit.toLocaleString('pt-BR')
  }

  const getUsagePercentage = (current: number, max: number | null) => {
    if (max === null || max >= 999999) {
      return 0
    }
    return Math.min((current / max) * 100, 100)
  }

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Carregando planos...</span>
      </div>
    )
  }

  if (plansError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Erro ao carregar planos: {plansError}
        </AlertDescription>
      </Alert>
    )
  }

  if (!plans || plans.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Nenhum plano disponível no momento.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Card do Plano Atual */}
      {currentPlanId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Plano Atual</CardTitle>
                <CardDescription>
                  Informações sobre seu plano atual e uso de recursos
                </CardDescription>
              </div>
              <Badge variant="default" className="text-sm">
                {planName || 'Carregando...'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Uso de Usuários */}
            {planLimits.max_users !== null && planLimits.max_users < 999999 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usuários</span>
                  <span className="font-medium">
                    {currentUsage.users} / {formatLimit(planLimits.max_users)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentUsage.users, planLimits.max_users)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Uso de Produtos */}
            {planLimits.max_products !== null && planLimits.max_products < 999999 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Produtos</span>
                  <span className="font-medium">
                    {currentUsage.products} / {formatLimit(planLimits.max_products)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentUsage.products, planLimits.max_products)} 
                  className="h-2"
                />
              </div>
            )}

            {/* Uso de Pedidos */}
            {planLimits.max_orders_per_month !== null && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pedidos este mês</span>
                  <span className="font-medium">
                    {currentUsage.orders_this_month} / {formatLimit(planLimits.max_orders_per_month)}
                  </span>
                </div>
                <Progress 
                  value={getUsagePercentage(currentUsage.orders_this_month, planLimits.max_orders_per_month)} 
                  className="h-2"
                />
              </div>
            )}

            {hasLimitReached && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você atingiu um ou mais limites do seu plano atual. Considere migrar para um plano superior.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards de Planos Disponíveis */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Planos Disponíveis</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan: Plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrentPlan={plan.id === currentPlanId}
              onMigrate={handleMigrate}
              isMigrating={isMigrating}
            />
          ))}
        </div>
      </div>

      {/* Modal de Confirmação de Migração */}
      <PlanMigrationModal
        open={migrationModalOpen}
        onOpenChange={setMigrationModalOpen}
        planToMigrate={selectedPlan}
        onConfirm={handleConfirmMigration}
        loading={isMigrating}
      />
    </div>
  )
}

