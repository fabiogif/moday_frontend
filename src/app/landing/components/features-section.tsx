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
  Smartphone,
  Layers,
  PlusCircle,
  Sparkles
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
    title: 'Cardápio Digital Inteligente',
    description: 'Cardápio online com variações de produtos e opcionais personalizáveis.',
    badge: 'NOVO'
  },
  {
    icon: Layers,
    title: 'Variações e Opcionais',
    description: 'Configure tamanhos, sabores e complementos. Preços atualizados em tempo real.',
    badge: 'NOVO'
  },
  {
    icon: Package,
    title: 'Controle de Estoque',
    description: 'Monitore produtos, alertas de baixo estoque e histórico de movimentações.'
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
              {mainFeatures.map((feature) => (
                <li key={feature.title} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center">
                    <feature.icon className="size-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                    <h3 className="text-foreground font-medium">{feature.title}</h3>
                      {feature.badge && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                          <Sparkles className="h-3 w-3 mr-1" />
                          {feature.badge}
                        </Badge>
                      )}
                    </div>
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
              {secondaryFeatures.map((feature) => (
                <li key={feature.title} className="group hover:bg-accent/5 flex items-start gap-3 p-2 rounded-lg transition-colors">
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

        {/* Nova Seção: Destaque para Variações e Opcionais */}
        <div className="mt-24 bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Novidade
            </Badge>
            <h3 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Cardápio Inteligente com Variações e Opcionais
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Ofereça mais opções aos seus clientes com um sistema avançado de customização de produtos. 
              Tamanhos, sabores, complementos e muito mais, tudo com cálculo automático de preços.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1: Variações */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Variações de Produto</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Configure diferentes opções para o mesmo produto: tamanhos (P/M/G), tipos de massa, 
                sabores e mais.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Escolha única (radio button)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Preços positivos ou negativos</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Exemplo: Pizza P (-R$ 5), M (incluso), G (+R$ 10)</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Opcionais */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Opcionais Personalizáveis</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Adicione complementos, bordas recheadas, molhos extras e outros itens adicionais 
                aos produtos.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Escolha múltipla com quantidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Cliente pode repetir o mesmo item</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Exemplo: 2× Bacon, 1× Borda Catupiry</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Cálculo Automático */}
            <div className="bg-background/80 backdrop-blur-sm p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all hover:shadow-lg">
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h4 className="font-semibold text-lg mb-2">Cálculo em Tempo Real</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Preço total atualiza instantaneamente conforme o cliente seleciona variações 
                e adiciona opcionais.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Atualização instantânea (0ms)</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Fórmula: Base + Variação + Opcionais</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0"></div>
                  <span className="text-muted-foreground">Sem reload, sem espera</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Exemplo Visual */}
          <div className="mt-8 bg-background rounded-2xl p-6 md:p-8 border border-border/50">
            <h4 className="font-semibold text-lg mb-4 text-center">Exemplo Prático: Pizza Margherita</h4>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <MenuSquare className="h-4 w-4" />
                  <span className="font-medium">Preço Base</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">R$ 35,00</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Layers className="h-4 w-4" />
                  <span className="font-medium">Variação: Grande</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Adicional</p>
                  <p className="text-xl font-bold text-green-600">+R$ 10,00</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <PlusCircle className="h-4 w-4" />
                  <span className="font-medium">Opcionais</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-1">
                  <p className="text-xs text-muted-foreground">2× Bacon: R$ 10,00</p>
                  <p className="text-xs text-muted-foreground">1× Borda: R$ 12,00</p>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-sm font-semibold">+R$ 22,00</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-dashed text-center">
              <p className="text-sm text-muted-foreground mb-2">Total do Pedido</p>
              <p className="text-4xl font-bold text-primary">R$ 67,00</p>
              <p className="text-xs text-muted-foreground mt-2">
                (Base R$ 35,00 + Variação R$ 10,00 + Opcionais R$ 22,00)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
