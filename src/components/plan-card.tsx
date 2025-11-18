"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Plan {
  id: number
  name: string
  url: string
  price: number
  description?: string
  max_users: number | null
  max_products: number | null
  max_orders_per_month: number | null
  has_marketing: boolean
  has_reports: boolean
  details?: Array<{ name: string }>
}

interface PlanCardProps {
  plan: Plan
  isCurrentPlan: boolean
  onMigrate: (planId: number) => void
  isMigrating?: boolean
}

export function PlanCard({ plan, isCurrentPlan, onMigrate, isMigrating = false }: PlanCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price)
  }

  const formatLimit = (limit: number | null) => {
    if (limit === null || limit >= 999999) {
      return 'Ilimitado'
    }
    return limit.toLocaleString('pt-BR')
  }

  const isPremium = plan.max_users === null || plan.max_users >= 999999

  return (
    <Card
      className={cn(
        "relative transition-all hover:shadow-lg",
        isCurrentPlan && "ring-2 ring-primary",
        isPremium && "border-primary/50"
      )}
    >
      {isCurrentPlan && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
          Plano Atual
        </Badge>
      )}
      
      {isPremium && (
        <div className="absolute -top-2 -right-2">
          <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500" />
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{plan.name}</CardTitle>
          {isPremium && <Zap className="h-5 w-5 text-primary" />}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
          <span className="text-muted-foreground text-sm">/mês</span>
        </div>
        {plan.description && (
          <CardDescription>{plan.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usuários</span>
            <span className="font-medium">{formatLimit(plan.max_users)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Produtos</span>
            <span className="font-medium">{formatLimit(plan.max_products)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Pedidos/mês</span>
            <span className="font-medium">{formatLimit(plan.max_orders_per_month)}</span>
          </div>
        </div>

        {plan.details && plan.details.length > 0 && (
          <div className="pt-4 border-t space-y-2">
            {plan.details.map((detail, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-600 shrink-0" />
                <span>{detail.name}</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t space-y-2">
          {plan.has_marketing && (
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600 shrink-0" />
              <span>Marketing</span>
            </div>
          )}
          {plan.has_reports && (
            <div className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600 shrink-0" />
              <span>Relatórios</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={() => onMigrate(plan.id)}
          disabled={isCurrentPlan || isMigrating}
        >
          {isCurrentPlan ? 'Plano Atual' : isMigrating ? 'Migrando...' : 'Migrar para este Plano'}
        </Button>
      </CardFooter>
    </Card>
  )
}

