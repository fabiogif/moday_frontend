"use client"

import { Layers, MousePointer2, PlusCircle, ShoppingCart } from 'lucide-react'
import { FlowStage, GlassCard } from './landing-animation-primitives'

export function MenuFlowAnimation() {
  return (
    <FlowStage minHeight="min-h-[380px] sm:min-h-[420px]">
      <GlassCard className="hero-float absolute left-2 top-6 z-20 max-w-[175px] p-3">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-violet-200" />
          <p className="text-xs font-semibold text-white">Tamanho G +R$ 10</p>
        </div>
      </GlassCard>

      <GlassCard className="hero-float-delayed absolute right-0 top-4 z-20 max-w-[190px] p-3 [animation-delay:0.5s]">
        <div className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-amber-300" />
          <p className="text-xs font-semibold text-white">2× Bacon adicionado</p>
        </div>
      </GlassCard>

      <div className="flow-tilt-float relative z-10 mx-auto mt-14 w-[90%] max-w-sm">
        <GlassCard className="overflow-hidden border-white/20 bg-white/[0.06] p-0">
          <div className="bg-gradient-to-br from-violet-800/90 to-primary/80 p-4">
            <p className="text-sm font-bold text-white">Pizza Margherita</p>
            <p className="text-xs text-white/70">Escolha tamanho e opcionais</p>
          </div>
          <div className="space-y-2 p-4">
            {['Pequena', 'Média', 'Grande'].map((size, i) => (
              <div
                key={size}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                  i === 2
                    ? 'border-lime-400/50 bg-lime-400/10 text-white'
                    : 'border-white/10 bg-white/5 text-white/70'
                }`}
              >
                <span>{size}</span>
                <span className="font-medium">{i === 0 ? '-R$ 5' : i === 2 ? '+R$ 10' : 'Base'}</span>
              </div>
            ))}
            <div className="relative mt-3">
              <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-lime-400 py-2.5 text-sm font-bold text-[#1a1a12]">
                <ShoppingCart className="h-4 w-4" />
                Adicionar · R$ 67,00
              </div>
              <MousePointer2 className="flow-cursor-drift absolute -bottom-1 right-4 h-4 w-4 text-white" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="hero-float-slow absolute bottom-6 right-4 z-20 max-w-[200px] p-3">
        <p className="text-[10px] text-violet-300/80">Preço atualizado</p>
        <p className="text-lg font-bold text-lime-300 tabular-nums">R$ 67,00</p>
      </GlassCard>
    </FlowStage>
  )
}
