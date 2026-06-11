"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MenuSquare, Sparkles, ShoppingCart, Layers, PlusCircle } from 'lucide-react'
import Link from 'next/link'
import { MenuFlowAnimation } from './menu-flow-animation'

export function DemoMenuCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32 bg-[#0a0a0f]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flow-reveal-up order-2 lg:order-1">
            <Badge className="mb-4 rounded-full border-violet-400/30 bg-violet-500/20 px-3 py-1 text-violet-200 hover:bg-violet-500/20">
              <Sparkles className="mr-1 h-3 w-3" />
              Experimente Agora
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white text-balance">
              Veja o Cardápio em Ação
            </h2>
            <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/60">
              Explore nosso cardápio interativo de demonstração e descubra como seus clientes podem
              personalizar pedidos com variações, opcionais e cálculo de preços em tempo real.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { icon: MenuSquare, title: 'Cardápio Digital', desc: 'Interface moderna' },
                { icon: Layers, title: 'Variações', desc: 'Tamanhos e sabores' },
                { icon: PlusCircle, title: 'Opcionais', desc: 'Personalização total' },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/20">
                    <item.icon className="h-4 w-4 text-violet-200" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-white/55">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full bg-white text-[#0a0a0f] hover:bg-white/90"
                asChild
              >
                <Link href="/demo/menu">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ver Cardápio de Demonstração
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10"
                asChild
              >
                <Link href="#pricing">Ver Planos e Preços</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-white/45">
              Experimente gratuitamente sem necessidade de cadastro
            </p>
          </div>

          <div className="flow-reveal-up order-1 lg:order-2 [animation-delay:150ms]">
            <MenuFlowAnimation />
          </div>
        </div>
      </div>
    </section>
  )
}
