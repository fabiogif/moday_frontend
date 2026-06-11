"use client"

import {
  TrendingUp,
  Users,
  ShoppingCart,
  Star,
  DollarSign,
  Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { DotPattern } from '@/components/dot-pattern'

const stats = [
  {
    icon: TrendingUp,
    value: '45%',
    label: 'Aumento de Vendas',
    description: 'Em média no primeiro mês',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'from-emerald-500/10 to-teal-500/10'
  },
  {
    icon: Users,
    value: '500+',
    label: 'Restaurantes Ativos',
    description: 'Confiam no nosso sistema',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10'
  },
  {
    icon: ShoppingCart,
    value: '1M+',
    label: 'Pedidos Processados',
    description: 'Todos os meses',
    color: 'from-purple-500 to-pink-500',
    bgColor: 'from-purple-500/10 to-pink-500/10'
  },
  {
    icon: Star,
    value: '4.8',
    label: 'Avaliação Média',
    description: 'Dos nossos clientes',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'from-amber-500/10 to-orange-500/10'
  },
  {
    icon: Zap,
    value: '70%',
    label: 'Mais Rápido',
    description: 'No processo de pedidos',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'from-violet-500/10 to-purple-500/10'
  },
  {
    icon: DollarSign,
    value: 'R$ 2M+',
    label: 'Economia Gerada',
    description: 'Para nossos clientes',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10'
  }
]

export function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-[#0a0a0f] py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[100px]" />
      </div>
      <DotPattern className="opacity-10" size="md" fadeStyle="circle" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flow-reveal-up mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Números que Impressionam
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/55">
            Resultados reais de restaurantes que transformaram seus negócios com o Alba Tec
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3">
          {stats.map((stat, idx) => (
            <Card
              key={stat.label}
              className="group relative overflow-hidden border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:shadow-xl hover:shadow-violet-950/30 flow-reveal-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              
              <CardContent className="p-6 relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Icon with gradient background */}
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  
                  {/* Value */}
                <div className="space-y-1">
                    <h3 className={`text-3xl sm:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                    {stat.value}
                  </h3>
                    <p className="text-base font-semibold text-white">{stat.label}</p>
                  <p className="text-sm text-white/50">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}