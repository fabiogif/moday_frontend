"use client"

import { Check, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ApiClient from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface PlanDetail {
  id: number
  name: string
  plan_id: number
}

interface Plan {
  id: number
  name: string
  url: string
  price: number | string  // Pode vir como string do backend
  description: string | null
  details: PlanDetail[]
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
        if (response && response.data) {
          // Garantir que price seja número
          const plansWithNumberPrice = response.data.map(plan => ({
            ...plan,
            price: typeof plan.price === 'string' ? parseFloat(plan.price) : plan.price
          }))
          setPlans(plansWithNumberPrice)
        }
      } catch (error) {

        // Se falhar, usa planos estáticos como fallback
        setPlans([
          {
            id: 1,
            name: 'Grátis',
            url: 'gratis',
            price: 0.00,
            description: 'Perfeito para testar o sistema',
            details: [
              { id: 1, name: 'Até 50 produtos cadastrados', plan_id: 1 },
              { id: 2, name: '1 usuário', plan_id: 1 },
              { id: 3, name: '30 pedidos por mês', plan_id: 1 },
              { id: 4, name: 'Painel administrativo básico', plan_id: 1 },
              { id: 5, name: 'Cardápio digital', plan_id: 1 },
              { id: 6, name: 'Sem acesso a Marketing', plan_id: 1 },
              { id: 7, name: 'Sem acesso a Relatórios', plan_id: 1 },
            ]
          },
          {
            id: 2,
            name: 'Básico',
            url: 'basico',
            price: 49.90,
            description: 'Perfeito para pequenos negócios começando',
            details: [
              { id: 8, name: 'Até 100 produtos cadastrados', plan_id: 2 },
              { id: 9, name: 'Até 5 usuários simultâneos', plan_id: 2 },
              { id: 10, name: '100 pedidos por mês', plan_id: 2 },
              { id: 11, name: 'Painel administrativo completo', plan_id: 2 },
              { id: 12, name: 'Cardápio digital personalizado', plan_id: 2 },
              { id: 13, name: '✅ Acesso a Marketing', plan_id: 2 },
              { id: 14, name: '✅ Acesso a Relatórios', plan_id: 2 },
              { id: 15, name: 'Suporte por email', plan_id: 2 },
            ]
          },
          {
            id: 3,
            name: 'Premium',
            url: 'premium',
            price: 99.90,
            description: 'Solução completa para grandes operações',
            details: [
              { id: 16, name: 'Produtos ilimitados', plan_id: 3 },
              { id: 17, name: 'Usuários ilimitados', plan_id: 3 },
              { id: 18, name: 'Pedidos ilimitados', plan_id: 3 },
              { id: 19, name: 'Acesso a todas funcionalidades', plan_id: 3 },
              { id: 20, name: '✅ Acesso a Marketing', plan_id: 3 },
              { id: 21, name: '✅ Acesso a Relatórios', plan_id: 3 },
              { id: 22, name: 'Suporte prioritário via WhatsApp', plan_id: 3 },
              { id: 23, name: 'Múltiplos usuários e permissões', plan_id: 3 },
              { id: 24, name: 'Integrações com delivery', plan_id: 3 },
              { id: 25, name: 'Personalização completa da marca', plan_id: 3 },
              { id: 26, name: 'Relatórios avançados e exportação', plan_id: 3 },
              { id: 27, name: 'Controle de estoque inteligente', plan_id: 3 },
            ]
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [])

  const handleSelectPlan = (planId: number) => {
    // Redirecionar para página de registro com o plano selecionado
    router.push(`/auth/register?plan=${planId}`)
  }

  const isPopular = (index: number) => index === 1 // Segundo plano (Básico) é popular

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
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4 border-primary/20 bg-primary/5 text-primary">
            <Zap className="h-3 w-3 mr-1" />
            Planos e Preços
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4">
            Simples, transparente e sem surpresas
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Escolha o plano ideal para o seu negócio. Comece grátis e escale quando precisar.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              type="single"
              value={isYearly ? "yearly" : "monthly"}
              onValueChange={(value) => setIsYearly(value === "yearly")}
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

          {isYearly && (
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              Economize 20% com o plano anual
            </p>
          )}
          {!isYearly && (
            <p className="text-sm text-muted-foreground">
              Troque para anual e <span className="text-primary font-semibold">economize 20%</span>
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-6 lg:grid-cols-3 lg:gap-4 items-start">
            {plans.map((plan, index) => {
              const popular = isPopular(index)
              const isFree = plan.price === 0 || plan.price === '0' || Number(plan.price) === 0

              return (
                <div
                  key={plan.url || `plan-${index}`}
                  className={cn(
                    "relative flex flex-col rounded-2xl border p-8 transition-all duration-200",
                    popular
                      ? "border-primary/30 bg-gradient-to-b from-primary/10 via-primary/5 to-background shadow-2xl shadow-primary/10 ring-1 ring-primary/20 scale-[1.02]"
                      : "border-border bg-card hover:border-primary/20 hover:shadow-lg"
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

                  {/* Plan Header */}
                  <div className="mb-6">
                    <div className={cn("text-lg font-bold tracking-tight mb-1", popular && "text-primary")}>
                      {plan.name}
                    </div>
                    <div className="text-muted-foreground text-sm">{plan.description || 'Plano completo para seu negócio'}</div>
                  </div>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      {isFree ? (
                        <span className="text-4xl font-bold">Grátis</span>
                      ) : (
                        <>
                          <span className="text-sm text-muted-foreground self-start mt-2">R$</span>
                          <span className="text-4xl font-bold tabular-nums">
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
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    className={cn(
                      "w-full cursor-pointer mb-8",
                      popular
                        ? "bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25 text-white"
                        : ""
                    )}
                    variant={popular ? 'default' : 'outline'}
                    size="lg"
                  >
                    {isFree ? "Começar de graça" : "Começar agora"}
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3 text-sm flex-1">
                    {plan.details.map((detail) => (
                      <li key={`${plan.id}-${detail.id || detail.name}`} className="flex items-start gap-3">
                        <Check
                          className={cn(
                            "size-4 flex-shrink-0 mt-0.5",
                            popular ? "text-primary" : "text-emerald-500"
                          )}
                          strokeWidth={2.5}
                        />
                        <span className="text-foreground/80">{detail.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>

        {/* Enterprise Note */}
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
