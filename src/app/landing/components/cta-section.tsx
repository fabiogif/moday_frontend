"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TRIAL_CTA_LABEL, TRIAL_MICRO_COPY } from '@/lib/landing-copy'
import { TRIAL_DAYS } from '@/lib/subscription'
import { useLandingCTAClick } from '@/hooks/use-landing-cta-click'
import { OperationFlowAnimation } from './operation-flow-animation'

export function CTASection() {
  const trackCTA = useLandingCTAClick('cta_final_click')

  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-violet-500/15 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flow-reveal-up hidden lg:block">
            <OperationFlowAnimation />
          </div>

          <div className="flow-reveal-up text-center lg:text-left [animation-delay:150ms]">
            <div className="mb-6 flex flex-col items-center gap-4 lg:items-start">
              <Badge
                variant="outline"
                className="flex items-center gap-2 border-white/20 bg-white/5 text-white"
              >
                <TrendingUp className="size-3" />
                Sistema de Gestão Completo
              </Badge>

              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/55 lg:justify-start">
                <span className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-green-500" />
                  500+ restaurantes
                </span>
                <Separator orientation="vertical" className="!h-4 bg-white/20" />
                <span>Suporte 24/7</span>
                <Separator orientation="vertical" className="!h-4 bg-white/20" />
                <span>4.9★ Avaliação</span>
              </div>
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-balance text-white sm:text-5xl">
              Revolucione a gestão do seu{' '}
              <span className="bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
                restaurante
              </span>{' '}
              hoje
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-white/60 lg:mx-0">
              Pare de usar planilhas e cadernos. Tenha controle total do seu negócio com relatórios
              em tempo real, cardápio digital e gestão de pedidos profissional.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-balance font-medium text-lime-300/90 lg:mx-0">
              Teste os planos Básico e Premium por {TRIAL_DAYS} dias grátis — ou comece no plano
              Grátis para sempre.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                className="h-12 rounded-full bg-white px-8 text-base font-semibold text-[#0a0a0f] hover:bg-white/90"
                asChild
              >
                <Link href="/auth/register" onClick={() => trackCTA('/auth/register')}>
                  <CheckCircle className="me-2 size-5" />
                  {TRIAL_CTA_LABEL}
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-white/20 bg-transparent px-8 text-white hover:bg-white/10"
                asChild
              >
                <Link href="#pricing" className="group">
                  Ver Planos e Preços
                  <ArrowRight className="ms-2 size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>

            <p className="mt-4 text-sm text-white/45">{TRIAL_MICRO_COPY}</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-white/50 lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="me-1 size-2 rounded-full bg-green-500" />
                <span>Teste grátis por {TRIAL_DAYS} dias nos planos pagos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="me-1 size-2 rounded-full bg-blue-400" />
                <span>Sem cartão de crédito</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="me-1 size-2 rounded-full bg-violet-400" />
                <span>Suporte especializado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
