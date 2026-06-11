"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Sparkles, Star, Clock, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DotPattern } from '@/components/dot-pattern'
import { HeroProductAnimation } from './hero-product-animation'
import {
  FREE_PLAN_BADGE,
  TRIAL_BADGE_LABEL,
  TRIAL_CTA_LABEL,
  TRIAL_MICRO_COPY,
} from '@/lib/landing-copy'
import {
  getVariantFromQuery,
  persistLandingVariant,
  resolveLandingVariant,
} from '@/lib/landing-variants'
import { useLandingCTAClick } from '@/hooks/use-landing-cta-click'

export function HeroSection() {
  const searchParams = useSearchParams()
  const variant = resolveLandingVariant(searchParams)
  const trackCTA = useLandingCTAClick('cta_hero_click', variant.id)

  useEffect(() => {
    const queryVariant = getVariantFromQuery(searchParams)
    if (queryVariant) {
      persistLandingVariant(queryVariant)
    }
  }, [searchParams])

  return (
    <section
      id="inicio"
      aria-label="Apresentação do Alba Tec, sistema de gestão para restaurantes"
      className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background pt-20 sm:pt-28 pb-16 sm:pb-24"
    >
      <div className="absolute inset-0">
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/25 to-violet-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-violet-500/15 to-purple-500/15 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-br from-violet-600/15 to-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Coluna esquerda — proposta de valor */}
          <div className="text-center lg:text-left">
            <div className="mb-6 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Badge
                variant="outline"
                className="px-5 py-2.5 text-sm font-medium border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 hover:from-primary/20 hover:via-purple-500/20 hover:to-pink-500/20 transition-all shadow-lg"
              >
                <Clock className="w-3.5 h-3.5 mr-2 text-primary" />
                <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent font-semibold">
                  {TRIAL_BADGE_LABEL}
                </span>
              </Badge>
              <Badge
                variant="outline"
                className="px-4 py-2 text-sm font-medium border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
              >
                <Gift className="w-3.5 h-3.5 mr-2" />
                {FREE_PLAN_BADGE}
              </Badge>
            </div>

            <h1 className="mb-6 text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000 text-balance">
              {variant.title}
            </h1>

            <p className="mb-8 max-w-xl mx-auto lg:mx-0 text-lg sm:text-xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1200 text-balance">
              {variant.subtitle}
            </p>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-8 animate-in fade-in slide-in-from-bottom-9 duration-1200">
              {['PDV touch-first', 'Cardápio digital', 'Controle de mesas', 'Relatórios em tempo real'].map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-normal">
                  <Sparkles className="w-3 h-3 mr-1 text-primary" />
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-10 duration-1400">
              <Button
                size="lg"
                className="group text-base sm:text-lg px-8 py-7 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300"
                asChild
              >
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2"
                  onClick={() => trackCTA('/auth/register')}
                >
                  {TRIAL_CTA_LABEL}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Link href="/auth/login" className="cursor-pointer">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base sm:text-lg px-8 py-7 border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:scale-105 transition-all duration-300 cursor-pointer"
                >
                  Fazer Login
                </Button>
              </Link>
            </div>

            <p className="mt-4 text-sm text-muted-foreground animate-in fade-in duration-1500">
              {TRIAL_MICRO_COPY}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-sm text-muted-foreground animate-in fade-in duration-1600">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">4.8 de 5 estrelas</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="font-medium">500+ restaurantes ativos</div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="font-medium">1M+ pedidos processados</div>
            </div>
          </div>

          {/* Coluna direita — micro-animação do produto */}
          <div className="flow-reveal-up [animation-delay:200ms]">
            <HeroProductAnimation />
          </div>
        </div>
      </div>
    </section>
  )
}
