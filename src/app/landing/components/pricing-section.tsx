"use client"

import { Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ApiClient from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { TRIAL_DAYS } from '@/lib/subscription'
import { trackLandingCTAClick } from '@/lib/landing-analytics'
import { PlanFeaturesList } from '@/components/plan-features-list'
import type { PublicPlanFeatures } from '@/lib/plan-features'

interface Plan extends PublicPlanFeatures {
  id: number
  name: string
  url: string
  price: number | string
  description: string | null
}

const STATIC_PLANS: Plan[] = [
  {
    id: 1,
    name: 'Grátis',
    url: 'gratis',
    price: 0,
    description: 'Perfeito para testar o sistema',
    max_users: 1,
    max_products: 50,
    max_orders_per_month: 30,
    has_marketing: false,
    has_order_completion_email: false,
    has_reports: false,
    details: [
      { id: 1, name: 'Painel administrativo básico', plan_id: 1 },
      { id: 2, name: 'Cardápio digital', plan_id: 1 },
    ],
  },
  {
    id: 2,
    name: 'Básico',
    url: 'basico',
    price: 49.9,
    description: 'Perfeito para pequenos negócios começando',
    max_users: 5,
    max_products: 100,
    max_orders_per_month: 100,
    has_marketing: true,
    has_order_completion_email: true,
    has_reports: true,
    details: [
      { id: 3, name: 'Painel administrativo completo', plan_id: 2 },
      { id: 4, name: 'Cardápio digital personalizado', plan_id: 2 },
      { id: 5, name: 'Suporte por e-mail', plan_id: 2 },
    ],
  },
  {
    id: 3,
    name: 'Premium',
    url: 'premium',
    price: 99.9,
    description: 'Solução completa para grandes operações',
    max_users: null,
    max_products: null,
    max_orders_per_month: null,
    has_marketing: true,
    has_order_completion_email: true,
    has_reports: true,
    details: [
      { id: 6, name: 'Suporte prioritário via WhatsApp', plan_id: 3 },
      { id: 7, name: 'Múltiplos usuários e permissões', plan_id: 3 },
      { id: 8, name: 'Integrações com delivery', plan_id: 3 },
      { id: 9, name: 'Personalização completa da marca', plan_id: 3 },
      { id: 10, name: 'Relatórios avançados e exportação', plan_id: 3 },
      { id: 11, name: 'Controle de estoque inteligente', plan_id: 3 },
    ],
  },
]

function normalizePlan(plan: Plan): Plan {
  return {
    ...plan,
    price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price,
    max_users: plan.max_users ?? null,
    max_products: plan.max_products ?? null,
    max_orders_per_month: plan.max_orders_per_month ?? null,
    has_marketing: Boolean(plan.has_marketing),
    has_order_completion_email: Boolean(plan.has_order_completion_email),
    has_reports: Boolean(plan.has_reports),
    details: plan.details ?? [],
  }
}

export function PricingSection() {
  const router = useRouter()
  const [isYearly, setIsYearly] = useState(false)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await ApiClient.get<Plan[]>('/api/public/plans')
        if (response?.data) {
          const rawPlans = Array.isArray(response.data) ? response.data : []
          setPlans(rawPlans.map(normalizePlan))
        }
      } catch {
        setPlans(STATIC_PLANS)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSelectPlan = (planId: number) => {
    trackLandingCTAClick('cta_pricing_click', `/auth/register?plan=${planId}`)
    router.push(`/auth/register?plan=${planId}`)
  }

  const isPopular = (index: number) => index === 1

  if (loading) {
    return (
      <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Carregando planos...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-muted/30 via-background to-muted/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Planos e Preços
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
            Simples, transparente e sem surpresas
          </h2>
          <p className="text-lg text-muted-foreground mb-3">
            Escolha o plano ideal para o seu negócio. Comece grátis e escale quando precisar.
          </p>
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mb-8">
            Planos Básico e Premium incluem {TRIAL_DAYS} dias de teste grátis com acesso completo. Sem cartão de crédito.
          </p>

          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              type="single"
              value={isYearly ? 'yearly' : 'monthly'}
              onValueChange={(value) => setIsYearly(value === 'yearly')}
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Mensal
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Anual
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {isYearly ? (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Economize 20% com o plano anual
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Troque para anual e <span className="text-primary font-semibold">economize 20%</span>
            </p>
          )}
        </div>

        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:flex-nowrap gap-4 lg:gap-3 items-stretch">
            {plans.map((plan, index) => {
              const popular = isPopular(index)
              const isFree = Number(plan.price) === 0

              return (
                <div
                  key={plan.url || `plan-${index}`}
                  className={cn(
                    'relative flex flex-1 min-w-0 flex-col rounded-2xl border p-5 xl:p-6 transition-all duration-200',
                    popular
                      ? 'border-primary/30 bg-gradient-to-b from-primary/10 via-primary/5 to-background shadow-xl shadow-primary/10 ring-1 ring-primary/20'
                      : 'border-border bg-card hover:border-primary/20 hover:shadow-lg'
                  )}
                >
                  {popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-lg px-4 py-1">
                        <Zap className="h-3 w-3 mr-1" />
                        Mais popular
                      </Badge>
                    </div>
                  )}

                  <div className="mb-6">
                    <div className={cn('text-lg font-bold tracking-tight mb-1', popular && 'text-primary')}>
                      {plan.name}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {plan.description || 'Plano completo para seu negócio'}
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-end gap-1">
                      {isFree ? (
                        <span className="text-3xl xl:text-4xl font-bold">Grátis</span>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground self-start mt-2">R$</span>
                          <span className="text-3xl xl:text-4xl font-bold tabular-nums">
                            {isYearly
                              ? (Number(plan.price) * 0.8).toFixed(2)
                              : Number(plan.price).toFixed(2)}
                          </span>
                          <span className="text-muted-foreground text-sm mb-1">/mês</span>
                        </>
                      )}
                    </div>
                    {!isFree && isYearly && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Cobrado anualmente · R$ {(Number(plan.price) * 12 * 0.8).toFixed(2)}/ano
                      </p>
                    )}
                    {isFree && (
                      <p className="text-xs text-muted-foreground mt-1">Para sempre, sem cartão</p>
                    )}
                    {!isFree && (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-1">
                        {TRIAL_DAYS} dias de teste grátis
                      </p>
                    )}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={cn(
                      'w-full cursor-pointer mb-6',
                      popular
                        ? 'bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25 text-white'
                        : ''
                    )}
                    variant={popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {isFree ? 'Começar de graça' : 'Iniciar teste grátis'}
                  </Button>

                  <PlanFeaturesList plan={plan} highlight={popular} />
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Precisa de recursos personalizados?{' '}
            <Button variant="link" className="p-0 h-auto cursor-pointer text-primary" asChild>
              <a href="#contact">Entre em contato com nossa equipe</a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
