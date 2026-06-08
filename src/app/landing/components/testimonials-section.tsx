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
}

const testimonials: Testimonial[] = [
  {
    name: 'Maria Santos',
    role: 'Proprietária - Restaurante Sabor & Arte',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
    quote:
      'O Alba Tec revolucionou a gestão do meu restaurante. Nossa eficiência aumentou 40% no primeiro mês com pedidos em tempo real e relatórios precisos.',
    rating: 5,
  },
  {
    name: 'João Silva',
    role: 'Gerente - Pizzaria Bella Napoli',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote:
      'Sistema intuitivo e fácil de usar. Minha equipe se adaptou em dias e as vendas aumentaram 30% no primeiro mês com o cardápio digital.',
    rating: 5,
  },
  {
    name: 'Lucia Oliveira',
    role: 'Administradora - Rede de Lanchonetes',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote:
      'Gerencio 5 unidades com o Alba Tec. A visão consolidada me permite identificar oportunidades e reduzir custos operacionais em 25%.',
    rating: 5,
  },
  {
    name: 'Ricardo Ferreira',
    role: 'Empresário - Rede de Pizzarias',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote:
      'Escalei de 1 para 8 unidades usando o Alba Tec. O sistema cresce com o negócio — investimento que vale cada centavo.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 relative overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm font-medium border-primary/20 bg-primary/5">
            Depoimentos
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/90 to-foreground bg-clip-text">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Restaurantes de todo o Brasil confiam no Alba Tec para gerenciar seus negócios e aumentar suas vendas.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5 shadow-lg"
            >
              <CardContent className="p-6 relative">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="size-12 shrink-0 ring-2 ring-primary/30 ring-offset-2 ring-offset-background">
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
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {testimonial.name}
                    </h3>
                    <span className="text-muted-foreground block text-xs mt-0.5">
                      {testimonial.role}
                    </span>
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

                <blockquote>
                  <p className="text-sm leading-relaxed text-balance text-muted-foreground">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Avatares ilustrativos. Depoimentos baseados em feedback real de clientes.
        </p>
      </div>
    </section>
  )
}
