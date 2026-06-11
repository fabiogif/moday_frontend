"use client"

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  FileText,
  Mail,
  ShoppingCart,
  UserPlus,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLandingCTAClick } from '@/hooks/use-landing-cta-click'
import type { LandingCTAEvent } from '@/lib/landing-analytics'

const FLOW_FEATURE_ICONS = {
  'user-plus': UserPlus,
  'shopping-cart': ShoppingCart,
  mail: Mail,
  wallet: Wallet,
  'file-text': FileText,
  'bar-chart-3': BarChart3,
} as const satisfies Record<string, LucideIcon>

export type FlowFeatureIcon = keyof typeof FLOW_FEATURE_ICONS

export type FlowFeature = {
  icon: FlowFeatureIcon
  title: string
  description: string
}

type LandingFlowSectionProps = {
  eyebrow: string
  badge?: string
  title: string
  description: string
  ctaLabel: string
  ctaHref: string
  ctaEvent: LandingCTAEvent
  animation: React.ReactNode
  features: FlowFeature[]
  reverse?: boolean
  id?: string
}

function FlowFeatureCard({ icon, title, description }: FlowFeature) {
  const Icon = FLOW_FEATURE_ICONS[icon]

  return (
    <div className="flex gap-4 sm:gap-5">
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-xl bg-violet-500/20 blur-md" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#1a1a22]">
          <Icon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      </div>
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/60">{description}</p>
      </div>
    </div>
  )
}

export function LandingFlowSection({
  eyebrow,
  badge = 'NOVO',
  title,
  description,
  ctaLabel,
  ctaHref,
  ctaEvent,
  animation,
  features,
  reverse = false,
  id,
}: LandingFlowSectionProps) {
  const trackCTA = useLandingCTAClick(ctaEvent)

  return (
    <section
      id={id}
      className="relative overflow-hidden bg-[#0a0a0f] py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={cn(
            'grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20',
            reverse && 'lg:[&>*:first-child]:order-2',
          )}
        >
          <div className="flow-reveal-up">{animation}</div>

          <div className="flow-reveal-up [animation-delay:150ms]">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                {eyebrow}
              </p>
              {badge ? (
                <Badge className="rounded-full border-violet-400/30 bg-violet-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-200 hover:bg-violet-500/20">
                  {badge}
                </Badge>
              ) : null}
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance leading-[1.15]">
              {title}
            </h2>

            <p className="mt-5 max-w-lg text-base sm:text-lg leading-relaxed text-white/60 text-balance">
              {description}
            </p>

            <Button
              size="lg"
              className="mt-8 h-12 rounded-full bg-white px-8 text-base font-semibold text-[#0a0a0f] hover:bg-white/90"
              asChild
            >
              <Link href={ctaHref} onClick={() => trackCTA(ctaHref)}>
                {ctaLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-16 sm:mt-20 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {features.map((feature) => (
            <FlowFeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
