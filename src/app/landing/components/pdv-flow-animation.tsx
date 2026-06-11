"use client"

import { CheckCircle2, Keyboard, ShoppingBag, Zap } from 'lucide-react'
import { FlowStage, GlassCard } from './landing-animation-primitives'

export function PdvFlowAnimation() {
  return (
    <FlowStage minHeight="min-h-[360px] sm:min-h-[400px]">
      <GlassCard className="hero-float absolute left-0 top-8 z-20 max-w-[195px] p-3">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-violet-200" />
          <p className="text-xs font-semibold text-white">Atalho: tecla 3</p>
        </div>
        <p className="mt-1 text-[10px] text-white/55">Categoria Bebidas</p>
      </GlassCard>

      <GlassCard className="hero-float-delayed absolute right-2 top-4 z-20 max-w-[185px] p-3 [animation-delay:0.6s]">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-300" />
          <p className="text-xs font-semibold text-white">Touch-first</p>
        </div>
        <p className="mt-1 text-[10px] text-white/55">70% menos cliques</p>
      </GlassCard>

      <GlassCard className="hero-float-slow relative z-10 mx-auto mt-12 w-[92%] overflow-hidden border-white/20 bg-white/[0.07]">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-violet-300" />
            <span className="text-sm font-semibold text-white">PDV — Pedido #2847</span>
          </div>
          <span className="text-[10px] text-amber-300">Em preparo</span>
        </div>
        <div className="space-y-2 p-3">
          {[
            { name: 'X-Burger Especial', qty: '2×', price: 'R$ 45,80' },
            { name: 'Batata crocante G', qty: '1×', price: 'R$ 18,00' },
            { name: 'Refrigerante 2L', qty: '1×', price: 'R$ 12,00' },
          ].map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between rounded-lg border border-white/8 bg-white/5 px-3 py-2"
            >
              <div>
                <p className="text-xs font-medium text-white">{item.name}</p>
                <p className="text-[10px] text-white/50">{item.qty}</p>
              </div>
              <p className="text-xs font-semibold text-white tabular-nums">{item.price}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 bg-white/[0.04] px-4 py-2.5 flex justify-between">
          <span className="text-xs text-white/60">Total</span>
          <span className="text-sm font-bold text-lime-300">R$ 75,80</span>
        </div>
      </GlassCard>

      <GlassCard className="hero-float absolute bottom-4 left-8 z-20 max-w-[210px] p-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
          <p className="text-xs font-semibold text-white">Status: Pronto</p>
        </div>
      </GlassCard>
    </FlowStage>
  )
}
