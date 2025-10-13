"use client"

import {
  BarChart3,
  Zap,
  Users,
  ArrowRight,
  Database,
  Package,
  ShoppingCart,
  MenuSquare,
  Smartphone
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'

const mainFeatures = [
  {
    icon: ShoppingCart,
    title: 'Gestão de Pedidos',
    description: 'Controle completo de pedidos em tempo real, do recebimento à entrega.'
  },
  {
    icon: MenuSquare,
    title: 'Cardápio Digital',
    description: 'Crie e gerencie seu cardápio online com fotos e descrições detalhadas.'
  },
  {
    icon: Package,
    title: 'Controle de Estoque',
    description: 'Monitore produtos, alertas de baixo estoque e histórico de movimentações.'
  },
  {
    icon: BarChart3,
    title: 'Relatórios em Tempo Real',
    description: 'Acompanhe vendas, produtos mais vendidos e performance do negócio.'
  }
]

const secondaryFeatures = [
  {
    icon: Smartphone,
    title: 'Acesso Mobile',
    description: 'Gerencie seu restaurante de qualquer lugar, em qualquer dispositivo.'
  },
  {
    icon: Zap,
    title: 'Rápido e Eficiente',
    description: 'Sistema otimizado para velocidade e facilidade de uso no dia a dia.'
  },
  {
    icon: Users,
    title: 'Gestão de Equipe',
    description: 'Controle de usuários com diferentes níveis de permissão e acesso.'
  },
  {
    icon: Database,
    title: 'Dados Seguros',
    description: 'Armazenamento em nuvem com backup automático e segurança avançada.'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Recursos do Sistema</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Tudo que você precisa para gerenciar seu restaurante
          </h2>
          <p className="text-lg text-muted-foreground">
            Sistema completo com todas as ferramentas necessárias para modernizar e otimizar a gestão do seu negócio.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16 mb-24">
          {/* Left Image */}
          <Image3D
            lightSrc="/feature-1-light.png"
            darkSrc="/feature-1-dark.png"
            alt="Painel de controle de pedidos"
            direction="left"
          />
          {/* Right Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Ferramentas poderosas para gestão eficiente
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Gerencie todos os aspectos do seu restaurante em uma única plataforma integrada, 
                desde pedidos até relatórios de vendas.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <a href="#pricing" className='flex items-center'>
                  Ver Planos
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href="#contact">
                  Falar com Vendas
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8 xl:gap-16">
          {/* Left Content */}
          <div className="space-y-6 order-2 lg:order-1">
            <div className="space-y-4">
              <h3 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Desenvolvido para o dia a dia do seu restaurante
              </h3>
              <p className="text-muted-foreground text-base text-pretty">
                Interface intuitiva e moderna, pensada para facilitar o trabalho da sua equipe 
                e melhorar a experiência dos seus clientes.
              </p>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature, index) => (
                <li key={index} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm">{feature.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col sm:flex-row gap-4 pe-4 pt-2">
              <Button size="lg" className="cursor-pointer" asChild>
                <a href="/auth/register" className='flex items-center'>
                  Começar Agora
                  <ArrowRight className="ms-2 size-4" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="cursor-pointer" asChild>
                <a href="#faq">
                  Perguntas Frequentes
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <Image3D
            lightSrc="/feature-2-light.png"
            darkSrc="/feature-2-dark.png"
            alt="Painel de relatórios"
            direction="right"
            className="order-1 lg:order-2"
          />
        </div>
      </div>
    </section>
  )
}
