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
    <section className="py-20 sm:py-24 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
      <DotPattern className="opacity-30" size="md" fadeStyle="circle" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Números que Impressionam
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Resultados reais de restaurantes que transformaram seus negócios com o Alba Tech
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {stats.map((stat, idx) => (
            <Card
              key={stat.label}
              className="group relative overflow-hidden bg-background/60 backdrop-blur-sm border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
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
                    <p className="font-semibold text-foreground text-base">{stat.label}</p>
                    <p className="text-sm text-muted-foreground">{stat.description}</p>
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