"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ApiClient from '@/lib/api-client'

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
        console.error('Erro ao carregar planos:', error)
        // Se falhar, usa planos estáticos como fallback
        setPlans([
          {
            id: 1,
            name: 'Básico',
            url: 'basico',
            price: 49.90,
            description: 'Perfeito para pequenos negócios começando',
            details: [
              { id: 1, name: 'Até 100 produtos cadastrados', plan_id: 1 },
              { id: 2, name: 'Painel administrativo completo', plan_id: 1 },
              { id: 3, name: 'Suporte por email', plan_id: 1 },
              { id: 4, name: 'Cardápio digital', plan_id: 1 },
            ]
          },
          {
            id: 2,
            name: 'Profissional',
            url: 'profissional',
            price: 99.90,
            description: 'Para negócios que precisam de mais recursos',
            details: [
              { id: 5, name: 'Produtos ilimitados', plan_id: 2 },
              { id: 6, name: 'Painel avançado com relatórios', plan_id: 2 },
              { id: 7, name: 'Suporte prioritário', plan_id: 2 },
              { id: 8, name: 'Múltiplos usuários', plan_id: 2 },
              { id: 9, name: 'Integrações com delivery', plan_id: 2 },
              { id: 10, name: 'Personalização da marca', plan_id: 2 },
            ]
          },
          {
            id: 3,
            name: 'Enterprise',
            url: 'enterprise',
            price: 199.90,
            description: 'Solução completa para grandes operações',
            details: [
              { id: 11, name: 'Tudo do plano Profissional', plan_id: 3 },
              { id: 12, name: 'Suporte 24/7', plan_id: 3 },
              { id: 13, name: 'Gerente de conta dedicado', plan_id: 3 },
              { id: 14, name: 'API personalizada', plan_id: 3 },
              { id: 15, name: 'Treinamento da equipe', plan_id: 3 },
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

  const isPopular = (index: number) => index === 1 // Segundo plano é popular

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
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Planos</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Escolha seu plano
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece hoje mesmo e transforme a gestão do seu negócio com nossa plataforma completa.
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

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Economize 20%</span> no plano anual
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${
                    isPopular(index)
                      ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                      : ''
                  }`}
                >
                  {/* Plan Header */}
                  <div>
                    <div className="text-lg font-medium tracking-tight mb-2">{plan.name}</div>
                    <div className="text-muted-foreground text-balance text-sm">{plan.description || 'Plano completo para seu negócio'}</div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="text-4xl font-bold mb-1">
                      R$ {isYearly 
                        ? (Number(plan.price) * 12 * 0.8).toFixed(2) 
                        : Number(plan.price).toFixed(2)}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Por mês
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      onClick={() => handleSelectPlan(plan.id)}
                      className={`w-full cursor-pointer my-2 ${
                        isPopular(index)
                          ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                          : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                      }`}
                      variant={isPopular(index) ? 'default' : 'secondary'}
                    >
                      Começar agora
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="space-y-3 text-sm">
                      {plan.details.map((detail, detailIndex) => (
                        <li key={detail.id ? `detail-${detail.id}` : `plan-${plan.id}-detail-${detailIndex}`} className="flex items-center gap-3">
                          <Check className="text-muted-foreground size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>{detail.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Precisa de recursos personalizados? {' '}
            <Button variant="link" className="p-0 h-auto cursor-pointer" asChild>
              <a href="#contact">
                Entre em contato
              </a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
