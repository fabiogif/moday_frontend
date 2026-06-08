"use client"

import Link from 'next/link'
import { ArrowRight, TrendingUp, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { TRIAL_CTA_LABEL, TRIAL_MICRO_COPY } from '@/lib/landing-copy'
import { TRIAL_DAYS } from '@/lib/subscription'
import { useLandingCTAClick } from '@/hooks/use-landing-cta-click'

export function CTASection() {
  const trackCTA = useLandingCTAClick('cta_final_click')

  return (
    <section className='py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-violet-500/10'>
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl' />
        <div className='absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl' />
      </div>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='mx-auto max-w-4xl'>
          <div className='text-center'>
            <div className='space-y-8'>
              <div className='flex flex-col items-center gap-4'>
                <Badge variant='outline' className='flex items-center gap-2'>
                  <TrendingUp className='size-3' />
                  Sistema de Gestão Completo
                </Badge>

                <div className='text-muted-foreground flex items-center gap-4 text-sm'>
                  <span className='flex items-center gap-1'>
                    <div className='size-2 rounded-full bg-green-500' />
                    500+ restaurantes
                  </span>
                  <Separator orientation='vertical' className='!h-4' />
                  <span>Suporte 24/7</span>
                  <Separator orientation='vertical' className='!h-4' />
                  <span>4.9★ Avaliação</span>
                </div>
              </div>

              <div className='space-y-6'>
                <h2 className='text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl'>
                  Revolucione a gestão do seu
                  <span className='flex sm:inline-flex justify-center'>
                    <span className='relative mx-2'>
                      <span className='bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent'>
                        restaurante
                      </span>
                      <div className='absolute start-0 -bottom-2 h-1 w-full bg-gradient-to-r from-primary/30 to-secondary/30' />
                    </span>
                    hoje
                  </span>
                </h2>

                <p className='text-muted-foreground mx-auto max-w-2xl text-balance lg:text-xl'>
                  Pare de usar planilhas e cadernos. Tenha controle total do seu negócio com relatórios em tempo real,
                  cardápio digital e gestão de pedidos profissional.
                </p>
                <p className='text-emerald-600 dark:text-emerald-400 mx-auto max-w-2xl text-balance font-medium'>
                  Teste os planos Básico e Premium por {TRIAL_DAYS} dias grátis — ou comece no plano Grátis para sempre.
                </p>
              </div>

              <div className='flex flex-col justify-center gap-4 sm:flex-row sm:gap-6'>
                <Button
                  size='lg'
                  className='cursor-pointer px-8 py-6 text-lg font-medium bg-gradient-to-r from-primary to-violet-600 hover:from-primary/90 hover:to-violet-600/90 shadow-lg shadow-primary/25'
                  asChild
                >
                  <Link
                    href='/auth/register'
                    onClick={() => trackCTA('/auth/register')}
                  >
                    <CheckCircle className='me-2 size-5' />
                    {TRIAL_CTA_LABEL}
                  </Link>
                </Button>
                <Button variant='outline' size='lg' className='cursor-pointer px-8 py-6 text-lg font-medium group' asChild>
                  <Link href='#pricing'>
                    Ver Planos e Preços
                    <ArrowRight className='ms-2 size-4 transition-transform group-hover:translate-x-1' />
                  </Link>
                </Button>
              </div>

              <p className='text-sm text-muted-foreground'>{TRIAL_MICRO_COPY}</p>

              <div className='text-muted-foreground flex flex-wrap items-center justify-center gap-6 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-green-600 dark:bg-green-400 me-1' />
                  <span>Teste grátis por {TRIAL_DAYS} dias nos planos pagos</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-blue-600 dark:bg-blue-400 me-1' />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='size-2 rounded-full bg-purple-600 dark:bg-purple-400 me-1' />
                  <span>Suporte especializado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
