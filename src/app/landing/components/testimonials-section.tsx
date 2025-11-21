"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'

type Testimonial = {
  name: string
  role: string
  image: string
  quote: string
  rating: number
  highlight?: boolean
}

const testimonials: Testimonial[] = [
  {
    name: 'Maria Santos',
    role: 'Proprietária - Restaurante Sabor & Arte',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
    quote:
      'O Alba Tech revolucionou a gestão do meu restaurante. Agora consigo acompanhar pedidos em tempo real, controlar estoque e gerar relatórios precisos. Nossa eficiência aumentou 40%!',
    rating: 5,
    highlight: true
  },
  {
    name: 'João Silva',
    role: 'Gerente - Pizzaria Bella Napoli',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote: 'Sistema intuitivo e fácil de usar. Minha equipe se adaptou rapidamente e os clientes adoram nosso cardápio digital. As vendas aumentaram 30% no primeiro mês.',
    rating: 5,
    highlight: true
  },
  {
    name: 'Ana Costa',
    role: 'Chef - Bistrô Gourmet',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
    quote:
      'Finalmente um sistema que entende as necessidades de um restaurante. O controle de estoque é impecável e os alertas me ajudam a evitar desperdícios.',
    rating: 5
  },
  {
    name: 'Carlos Mendes',
    role: 'Proprietário - Burger House',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-2',
    quote:
      'Migrei de um sistema antigo para o Alba Tech e foi a melhor decisão. Os relatórios me ajudam a tomar decisões estratégicas baseadas em dados reais.',
    rating: 5
  },
  {
    name: 'Lucia Oliveira',
    role: 'Administradora - Rede de Lanchonetes',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote:
      'Gerencio 5 unidades com o Alba Tech. A visão consolidada de todas as lojas me permite identificar oportunidades e otimizar operações. Indispensável para nossa rede!',
    rating: 5,
    highlight: true
  },
  {
    name: 'Roberto Alves',
    role: 'Sócio - Sushi Bar Premium',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
    quote: 'O cardápio digital com fotos dos pratos aumentou nosso ticket médio significativamente. Sistema profissional e com excelente custo-benefício.',
    rating: 5
  },
  {
    name: 'Fernanda Lima',
    role: 'Proprietária - Cafeteria Aroma',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
    quote:
      'O suporte é excepcional! Sempre que preciso, a equipe está pronta para ajudar. O sistema funciona perfeitamente no celular, tablet e computador.',
    rating: 5
  },
  {
    name: 'Paulo Souza',
    role: 'Gerente - Churrascaria Gaúcha',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-4',
    quote: 'A integração com delivery facilitou muito nossa operação. Todos os pedidos centralizados em um só lugar. Sem mais bagunça!',
    rating: 5
  },
  {
    name: 'Carla Rodrigues',
    role: 'Chef - Restaurante Vegetariano',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
    quote:
      'Posso atualizar o cardápio em segundos quando algum ingrediente acaba. O sistema é rápido, confiável e me dá total controle.',
    rating: 5
  },
  {
    name: 'André Martins',
    role: 'Proprietário - Padaria & Confeitaria',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-5',
    quote: 'Os relatórios de produtos mais vendidos me ajudam a planejar melhor a produção. Reduzi desperdícios e aumentei lucros!',
    rating: 5
  },
  {
    name: 'Juliana Castro',
    role: 'Administradora - Food Truck Gourmet',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-6',
    quote:
      'Perfeito para food trucks! Simples, rápido e funciona offline quando necessário. Meu negócio ficou muito mais profissional.',
    rating: 5
  },
  {
    name: 'Ricardo Ferreira',
    role: 'Empresário - Rede de Pizzarias',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote: 'Escalei meu negócio de 1 para 8 unidades usando o Alba Tech. O sistema cresce com o negócio. Investimento que vale cada centavo!',
    rating: 5,
    highlight: true
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5">
            Depoimentos
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Milhares de restaurantes confiam no Alba Tech para gerenciar seus negócios e aumentar suas vendas.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 gap-6 md:columns-2 md:gap-8 lg:columns-3 lg:gap-6">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className={`group mb-6 break-inside-avoid lg:mb-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                testimonial.highlight
                  ? 'border-primary/40 bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-lg'
                  : 'border-border/60 bg-background/60 backdrop-blur-sm hover:border-primary/30'
              }`}
            >
              {/* Gradient overlay on hover for non-highlighted */}
              {!testimonial.highlight && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              )}
              
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className={`size-12 shrink-0 ring-2 ring-offset-2 ${
                    testimonial.highlight
                      ? 'ring-primary/30 ring-offset-background'
                      : 'ring-border/30 ring-offset-background group-hover:ring-primary/30 transition-all'
                  }`}>
                    <AvatarImage
                      alt={testimonial.name}
                      src={testimonial.image}
                      loading="lazy"
                      width="120"
                      height="120"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-purple-500/20 text-foreground font-semibold">
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {testimonial.name}
                        </h3>
                        <span className="text-muted-foreground block text-xs mt-0.5">
                      {testimonial.role}
                    </span>
                      </div>
                    </div>
                    
                    {/* Rating Stars */}
                    <div className="flex items-center gap-1 mt-2">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                          aria-hidden="true"
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <blockquote className="mt-4">
                  <p className="text-sm leading-relaxed text-balance text-muted-foreground">
                    "{testimonial.quote}"
                  </p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}