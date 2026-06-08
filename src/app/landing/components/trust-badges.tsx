"use client"

import { CreditCard, Lock, Headphones, ShieldCheck } from 'lucide-react'

const badges = [
  {
    icon: CreditCard,
    label: 'Sem cartão de crédito',
  },
  {
    icon: Lock,
    label: 'Dados protegidos (LGPD)',
  },
  {
    icon: Headphones,
    label: 'Suporte em português',
  },
  {
    icon: ShieldCheck,
    label: 'Conexão segura (SSL)',
  },
]

export function TrustBadges() {
  return (
    <section className="py-8 border-y border-border/40 bg-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          {badges.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <span className="font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
