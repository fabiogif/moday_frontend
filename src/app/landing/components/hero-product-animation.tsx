"use client"

import {
  BarChart3,
  CheckCircle2,
  Clock,
  ShoppingBag,
  TrendingUp,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FlowStage, GlassCard } from './landing-animation-primitives'

export function HeroProductAnimation({ className }: { className?: string }) {
  return (
    <FlowStage className={cn('max-w-lg lg:max-w-none', className)} aria-hidden="true">

        {/* Card flutuante — financeiro */}
        <GlassCard className="hero-float-delayed absolute -left-2 sm:left-0 top-8 z-20 w-[46%] max-w-[200px] p-3 sm:p-4 [animation-delay:0.8s]">
          <div className="flex items-center gap-2 text-violet-200/90">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
              <Wallet className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-white/70">Saldo do mês</p>
              <p className="text-sm sm:text-base font-bold text-white tabular-nums">R$ 12.450</p>
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-300">
            <TrendingUp className="h-3 w-3" />
            <span>+18% vs. mês anterior</span>
          </div>
        </GlassCard>

        {/* Card flutuante — cardápio */}
        <GlassCard className="hero-float absolute -right-1 sm:right-2 top-4 z-20 w-[44%] max-w-[190px] p-3 sm:p-4 [animation-delay:0.3s]">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/25">
              <UtensilsCrossed className="h-4 w-4 text-violet-200" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-medium text-white/70">Cardápio digital</p>
              <p className="text-xs sm:text-sm font-semibold text-white">48 itens ativos</p>
            </div>
          </div>
          <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-violet-100">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            QR Code publicado
          </div>
        </GlassCard>

        {/* Painel principal — pedidos */}
        <GlassCard className="hero-float-slow relative z-10 mx-auto mt-16 w-[88%] overflow-hidden border-white/20 bg-white/[0.07]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4 text-violet-300" />
              <span className="text-sm font-semibold text-white">Pedidos em tempo real</span>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Ao vivo
            </span>
          </div>

          <div className="space-y-2 p-3 sm:p-4">
            {[
              { id: '#2847', table: 'Mesa 08', total: 'R$ 89,90', status: 'Em preparo', tone: 'amber' },
              { id: '#2846', table: 'Delivery', total: 'R$ 54,00', status: 'Pronto', tone: 'emerald' },
              { id: '#2845', table: 'Balcão', total: 'R$ 32,50', status: 'Entregue', tone: 'violet' },
            ].map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2.5"
              >
                <div>
                  <p className="text-xs font-semibold text-white">{order.id}</p>
                  <p className="text-[10px] text-white/55">{order.table}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-white tabular-nums">{order.total}</p>
                  <p
                    className={cn(
                      'text-[10px] font-medium',
                      order.tone === 'amber' && 'text-amber-300',
                      order.tone === 'emerald' && 'text-emerald-300',
                      order.tone === 'violet' && 'text-violet-300',
                    )}
                  >
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 bg-white/[0.04] px-4 py-2.5">
            <div className="flex items-center justify-between text-[10px] text-white/50">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Atualizado agora
              </span>
              <span className="flex items-center gap-1 text-violet-200/80">
                <BarChart3 className="h-3 w-3" />
                23 pedidos hoje
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Card flutuante — novo pedido */}
        <GlassCard className="hero-float-delayed absolute -bottom-2 right-4 sm:right-8 z-20 w-[52%] max-w-[220px] p-3 sm:p-4 [animation-delay:1.2s]">
          <div className="flex items-start gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/30 ring-2 ring-violet-400/30">
              <CheckCircle2 className="h-4 w-4 text-violet-200" />
            </div>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wide text-violet-300/80">
                Novo pedido
              </p>
              <p className="text-sm font-bold text-white">#2848 confirmado</p>
              <p className="mt-0.5 text-[10px] text-white/55">2 itens · Mesa 12</p>
            </div>
          </div>
        </GlassCard>
    </FlowStage>
  )
}
