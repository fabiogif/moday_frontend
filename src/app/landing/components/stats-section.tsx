"use client"

import { TrendingUp, Users, ShoppingCart, Star, DollarSign, Zap } from 'lucide-react'

const stats = [
  { icon: TrendingUp, value: '45%', label: 'Aumento de Vendas', description: 'Em média no primeiro mês' },
  { icon: Users, value: '500+', label: 'Restaurantes Ativos', description: 'Confiam no nosso sistema' },
  { icon: ShoppingCart, value: '1M+', label: 'Pedidos Processados', description: 'Todos os meses' },
  { icon: Star, value: '4.8', label: 'Avaliação Média', description: 'Dos nossos clientes' },
  { icon: Zap, value: '70%', label: 'Mais Rápido', description: 'No processo de pedidos' },
  { icon: DollarSign, value: 'R$ 2M+', label: 'Economia Gerada', description: 'Para nossos clientes' },
]

export function StatsSection() {
  return (
    <section className="py-20 sm:py-24 bg-white border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-12">
          <p className="text-[11px] uppercase tracking-[0.18em] text-orange-600 font-medium mb-4">
            Resultados
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-zinc-900 mb-3">
            Números reais de restaurantes ativos
          </h2>
          <p className="text-zinc-500">
            Restaurantes que transformaram sua operação com o Alba Tec.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-zinc-200 bg-zinc-50 p-6 hover:border-zinc-300 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center mb-4">
                <stat.icon className="h-4 w-4 text-zinc-600" aria-hidden="true" />
              </div>
              <p className="text-3xl sm:text-4xl font-bold text-zinc-900 tabular-nums mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-semibold text-zinc-700">{stat.label}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{stat.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
