"use client"

import {
  ArrowRight,
  Banknote,
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  Gift,
  Keyboard,
  Layers,
  MenuSquare,
  MessageSquare,
  Package,
  PlusCircle,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
  Utensils,
  Wallet,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Image3D } from '@/components/image-3d'

const mainFeatures = [
  {
    icon: Zap,
    title: 'PDV Touch-First',
    description: 'Layout otimizado para telas touch, feedback imediato e atalhos de teclado que reduzem cliques em até 70%.',
    badge: 'NOVO',
    color: 'from-amber-500 to-orange-500',
    benefit: 'Aumenta produtividade em até 3x'
  },
  {
    icon: Star,
    title: 'Sistema de Avaliações Moderado',
    description: 'Colete feedback dos clientes com moderação inteligente, destaque avaliações positivas e construa confiança com provas sociais.',
    badge: 'NOVO',
    color: 'from-orange-500 to-red-500',
    benefit: 'Aumenta conversão em até 35%'
  },
  {
    icon: Utensils,
    title: 'Controle de Mesas Inteligente',
    description: 'Gerencie mesas com status em tempo real, visualize ocupação e otimize a distribuição de clientes no salão automaticamente.',
    badge: 'NOVO',
    color: 'from-blue-500 to-cyan-500',
    benefit: 'Reduz tempo de espera em 40%'
  },
  {
    icon: MenuSquare,
    title: 'Cardápio Digital com Variações',
    description: 'Clientes escolhem tamanhos, sabores e opcionais com atualização de preços em tempo real. Aumente ticket médio com personalização.',
    color: 'from-purple-500 to-pink-500',
    benefit: 'Aumenta ticket médio em 25%'
  }
]

const secondaryFeatures = [
  {
    icon: ShoppingCart,
    title: 'Gestão Omnichannel de Pedidos',
    description: 'Centralize pedidos de balcão, delivery e cardápio digital em um só painel. Nunca perca um pedido.',
    color: 'from-indigo-500 to-purple-500',
    benefit: '100% dos pedidos rastreados'
  },
  {
    icon: Package,
    title: 'Controle de Estoque Inteligente',
    description: 'Acompanhe movimentos, receba alertas de baixo estoque e mantenha o custo sob controle. Reduza desperdícios.',
    color: 'from-rose-500 to-pink-500',
    benefit: 'Reduz desperdícios em 30%'
  },
  {
    icon: BarChart3,
    title: 'Relatórios em Tempo Real',
    description: 'Visualize desempenho por produto, canal de venda e operador com poucos cliques. Tome decisões baseadas em dados.',
    color: 'from-violet-500 to-purple-500',
    benefit: 'Decisões baseadas em dados'
  },
  {
    icon: Smartphone,
    title: 'Acesso Mobile Total',
    description: 'Gerencie o restaurante em qualquer dispositivo com interface responsiva. Funciona offline quando necessário.',
    color: 'from-cyan-500 to-blue-500',
    benefit: 'Acesso de qualquer lugar'
  }
]

const advancedFeatures = [
  {
    icon: DollarSign,
    title: 'Gestão Financeira Completa',
    description: 'Controle contas a pagar e receber, despesas, fornecedores e fluxo de caixa em tempo real.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    icon: Gift,
    title: 'Programa de Fidelidade',
    description: 'Crie programas de pontos personalizados com recompensas e cupons para fidelizar clientes.',
    color: 'from-amber-500 to-yellow-500'
  },
  {
    icon: Truck,
    title: 'Integração iFood',
    description: 'Centralize pedidos do iFood no mesmo painel, sincronize status e gerencie tudo em um lugar.',
    color: 'from-red-500 to-rose-500'
  },
  {
    icon: MessageSquare,
    title: 'Notificações WhatsApp',
    description: 'Envie confirmações, atualizações de pedidos e mensagens personalizadas via WhatsApp.',
    color: 'from-green-600 to-emerald-600'
  },
  {
    icon: Calendar,
    title: 'Gestão de Eventos',
    description: 'Organize eventos promocionais, happy hours e ocasiões especiais com calendário integrado.',
    color: 'from-blue-600 to-indigo-600'
  },
  {
    icon: CreditCard,
    title: 'Múltiplas Formas de Pagamento',
    description: 'Aceite PIX, cartão de crédito/débito, dinheiro e outras formas de pagamento configuráveis.',
    color: 'from-purple-600 to-violet-600'
  },
  {
    icon: Users,
    title: 'Gestão de Equipe',
    description: 'Controle de usuários com permissões granulares, perfis personalizados e auditoria de ações.',
    color: 'from-teal-500 to-cyan-500'
  }
]

const pdvHighlights = [
  {
    icon: Star,
    title: 'Sistema de Avaliações que Converte',
    description: 'Transforme feedback em vendas com sistema de avaliações moderado, destaque de avaliações positivas e construção de confiança.',
    bullets: [
      'Moderação inteligente com aprovação manual para controle total',
      'Destaque avaliações positivas no cardápio para aumentar confiança',
      'Métricas de satisfação em tempo real para melhorias contínuas'
    ],
    color: 'from-orange-500 to-red-500'
  },
  {
    icon: Utensils,
    title: 'Quadro de Pedidos Kanban',
    description: 'Visualize todos os pedidos em um quadro Kanban interativo com arrastar e soltar, facilitando o controle operacional.',
    bullets: [
      'Status visual por colunas (Em Preparo, Pronto, Entregue)',
      'Arraste e solte para atualizar status rapidamente',
      'Filtros por canal, status e período para gestão eficiente'
    ],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    icon: Keyboard,
    title: 'Atalhos e Experiência Touch',
    description: 'Operadores alternam entre categorias e ações críticas sem tirar a mão do teclado ou da tela.',
    bullets: [
      'Teclas 1-9 selecionam categorias instantaneamente',
      'Escape fecha modais e diálogos em qualquer etapa',
      'Botões grandes e responsivos para fluxo 100% touch'
    ],
    color: 'from-amber-500 to-orange-500'
  }
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 sm:py-32 bg-gradient-to-b from-background via-muted/20 to-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-20">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
            Recursos do Sistema
          </Badge>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">
            Tudo que você precisa para gerenciar seu restaurante
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed">
            Sistema completo com todas as ferramentas necessárias para modernizar e otimizar a gestão do seu negócio.
          </p>
        </div>

        {/* First Feature Section */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-20 mb-32">
          {/* Left Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-3xl blur-3xl -z-10" />
            <Image3D
              lightSrc="/feature-1-light.png"
              darkSrc="/feature-1-dark.png"
              alt="Painel de controle de pedidos"
              direction="left"
              className="relative rounded-2xl shadow-2xl"
            />
          </div>
          
          {/* Right Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-2 bg-gradient-to-r from-primary/10 to-purple-500/10 text-primary border-primary/20">
                Principais Recursos
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Ferramentas poderosas que geram resultados reais
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Não é apenas um sistema, é um parceiro estratégico. Cada funcionalidade foi pensada para aumentar suas vendas, 
                reduzir custos e melhorar a experiência dos seus clientes.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {mainFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-background/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3 className="text-base font-semibold text-foreground">{feature.title}</h3>
                          {feature.badge && (
                            <Badge variant="secondary" className="text-xs bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              <Sparkles className="h-2.5 w-2.5 mr-1" />
                              {feature.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{feature.description}</p>
                        {feature.benefit && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{feature.benefit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base shadow-lg shadow-primary/25" asChild>
                <a href="#pricing" className='flex items-center'>
                  Ver Planos
                  <ArrowRight className="ms-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base border-2" asChild>
                <a href="#contact">
                  Falar com Vendas
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Features Grid */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20">
              Recursos Avançados
            </Badge>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Funcionalidades que fazem a diferença
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Além das funcionalidades essenciais, oferecemos recursos avançados para impulsionar seus resultados
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advancedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-background/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                <div className="relative">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg mb-4 w-fit group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Second Feature Section - Flipped Layout */}
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-12 xl:gap-20 mb-32">
          {/* Left Content */}
          <div className="space-y-8 order-2 lg:order-1">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                Operações Diárias
              </Badge>
              <h3 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Desenvolvido por quem entende restaurantes
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Criado com base em feedback de centenas de restaurantes. Interface intuitiva que sua equipe aprende em minutos, 
                não em dias. Resultados que você vê desde o primeiro uso.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {secondaryFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-xl border border-border/60 bg-background/50 backdrop-blur-sm hover:border-primary/40 hover:bg-background/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} shadow-lg group-hover:scale-110 transition-transform`}>
                        <feature.icon className="h-5 w-5 text-white" aria-hidden="true" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-foreground mb-1.5">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-2">{feature.description}</p>
                        {feature.benefit && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{feature.benefit}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-base shadow-lg shadow-primary/25" asChild>
                <a href="/auth/register" className='flex items-center'>
                  Começar Agora
                  <ArrowRight className="ms-2 h-4 w-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-base border-2" asChild>
                <a href="#faq">
                  Perguntas Frequentes
                </a>
              </Button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute inset-0 bg-gradient-to-l from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl -z-10" />
            <Image3D
              lightSrc="/feature-2-light.png"
              darkSrc="/feature-2-dark.png"
              alt="Painel de relatórios"
              direction="right"
              className="relative rounded-2xl shadow-2xl"
            />
          </div>
        </div>

        {/* PDV Highlights */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Atualização do PDV
            </Badge>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              PDV mais rápido para o salão e delivery
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Novos recursos que transformam a experiência: sistema de avaliações que aumenta confiança, controle de mesas inteligente e atalhos que aceleram qualquer operação.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {pdvHighlights.map((highlight) => (
              <div
                key={highlight.title}
                className="group relative h-full rounded-2xl border border-border/60 bg-background/50 backdrop-blur-sm p-8 shadow-sm hover:shadow-2xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${highlight.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`} />
                <div className="relative">
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${highlight.color} shadow-xl mb-6 w-fit group-hover:scale-110 transition-transform`}>
                    <highlight.icon className="h-7 w-7 text-white" aria-hidden="true" />
                  </div>
                  <h4 className="text-xl font-bold mb-3 text-foreground">{highlight.title}</h4>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{highlight.description}</p>
                  <ul className="space-y-3">
                    {highlight.bullets.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <div className={`mt-1 h-2 w-2 rounded-full bg-gradient-to-br ${highlight.color} shrink-0`} />
                        <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Diferenciais */}
        <div className="mb-32">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
              <Sparkles className="h-3 w-3 mr-1" />
              Por Que Escolher o Alba Tech?
            </Badge>
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">
              O Diferencial que Faz a Diferença
            </h3>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Não somos apenas mais um sistema. Somos a solução completa que entende as necessidades reais do seu restaurante.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="group relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-primary/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Implementação em Minutos</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Comece a usar em menos de 5 minutos. Sem necessidade de instalação complexa ou treinamento extenso.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Setup rápido e intuitivo</span>
                </div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-purple-500/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Dados que Geram Resultados</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Relatórios inteligentes que mostram exatamente o que você precisa saber para tomar decisões estratégicas.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-purple-600 dark:text-purple-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Insights acionáveis</span>
                </div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-blue-500/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 md:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Users className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Suporte que Faz Diferença</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Equipe especializada pronta para ajudar quando você precisar. Suporte em português, rápido e eficiente.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Suporte humanizado</span>
                </div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-amber-500/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Wallet className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Custo-Benefício Incomparável</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Planos acessíveis que cabem no seu orçamento. Sem taxas escondidas ou surpresas na fatura.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>ROI comprovado</span>
                </div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-green-500/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Package className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Tudo em Um Só Lugar</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Não precisa de múltiplos sistemas. PDV, cardápio, estoque, financeiro e marketing em uma única plataforma.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Integração completa</span>
                </div>
              </div>
            </div>

            <div className="group relative p-8 rounded-2xl border border-border/60 bg-gradient-to-br from-background to-rose-500/5 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity" />
              <div className="relative">
                <div className="bg-gradient-to-br from-rose-500 to-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-3 text-foreground">Atualizações Constantes</h4>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Sistema sempre evoluindo com novas funcionalidades baseadas no feedback de restaurantes reais.
                </p>
                <div className="flex items-center gap-2 text-sm font-semibold text-rose-600 dark:text-rose-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>Melhorias contínuas</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variações e Opcionais - Enhanced */}
        <div className="relative bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10 rounded-3xl p-8 md:p-12 lg:p-16 border border-primary/20 shadow-2xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
          </div>

          <div className="relative">
            <div className="text-center mb-12">
              <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30 shadow-lg">
                <Sparkles className="h-3 w-3 mr-1" />
                Novidade em Destaque
              </Badge>
              <h3 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">
                Cardápio Inteligente com Variações e Opcionais
              </h3>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Ofereça mais opções aos seus clientes com um sistema avançado de customização de produtos. 
                Tamanhos, sabores, complementos e muito mais, tudo com cálculo automático de preços.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {/* Feature 1: Variações */}
              <div className="bg-background/90 backdrop-blur-md p-8 rounded-2xl border border-border/60 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Layers className="h-7 w-7 text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-foreground">Variações de Produto</h4>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Configure diferentes opções para o mesmo produto: tamanhos (P/M/G), tipos de massa, 
                  sabores e mais.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Escolha única (radio button)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Preços positivos ou negativos</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Exemplo: Pizza P (-R$ 5), M (incluso), G (+R$ 10)</span>
                  </li>
                </ul>
              </div>

              {/* Feature 2: Opcionais */}
              <div className="bg-background/90 backdrop-blur-md p-8 rounded-2xl border border-border/60 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <PlusCircle className="h-7 w-7 text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-foreground">Opcionais Personalizáveis</h4>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Adicione complementos, bordas recheadas, molhos extras e outros itens adicionais 
                  aos produtos.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Escolha múltipla com quantidade</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Cliente pode repetir o mesmo item</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Exemplo: 2× Bacon, 1× Borda Catupiry</span>
                  </li>
                </ul>
              </div>

              {/* Feature 3: Cálculo Automático */}
              <div className="bg-background/90 backdrop-blur-md p-8 rounded-2xl border border-border/60 shadow-xl hover:shadow-2xl hover:border-primary/40 transition-all duration-300">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Sparkles className="h-7 w-7 text-white" />
                </div>
                <h4 className="font-bold text-xl mb-3 text-foreground">Cálculo em Tempo Real</h4>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Preço total atualiza instantaneamente conforme o cliente seleciona variações 
                  e adiciona opcionais.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Atualização instantânea (0ms)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Fórmula: Base + Variação + Opcionais</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shrink-0" />
                    <span className="text-sm text-muted-foreground">Sem reload, sem espera</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Exemplo Visual Enhanced */}
            <div className="bg-background/80 backdrop-blur-md rounded-2xl p-8 md:p-10 border border-border/60 shadow-xl">
              <h4 className="font-bold text-2xl mb-8 text-center text-foreground">Exemplo Prático: Pizza Margherita</h4>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MenuSquare className="h-5 w-5 text-primary" />
                    <span className="font-semibold">Preço Base</span>
                  </div>
                  <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                    <p className="text-3xl font-bold text-primary">R$ 35,00</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <Layers className="h-5 w-5 text-purple-500" />
                    <span className="font-semibold">Variação: Grande</span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/5 rounded-xl p-6 border border-purple-500/20">
                    <p className="text-sm text-muted-foreground mb-1">Adicional</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">+R$ 10,00</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <PlusCircle className="h-5 w-5 text-amber-500" />
                    <span className="font-semibold">Opcionais</span>
                  </div>
                  <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl p-6 border border-amber-500/20 space-y-2">
                    <p className="text-xs text-muted-foreground">2× Bacon: R$ 10,00</p>
                    <p className="text-xs text-muted-foreground">1× Borda: R$ 12,00</p>
                    <div className="border-t border-border/60 pt-3 mt-3">
                      <p className="text-base font-bold text-foreground">+R$ 22,00</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t-2 border-dashed border-border/60 text-center">
                <p className="text-sm text-muted-foreground mb-3 font-medium">Total do Pedido</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  R$ 67,00
                </p>
                <p className="text-sm text-muted-foreground">
                  (Base R$ 35,00 + Variação R$ 10,00 + Opcionais R$ 22,00)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}