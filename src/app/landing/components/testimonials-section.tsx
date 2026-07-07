"use client"

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    quote: 'O Alba Tec revolucionou a gestão do meu restaurante. Nossa eficiência aumentou 40% no primeiro mês com pedidos em tempo real e relatórios precisos.',
    rating: 5,
  },
  {
    name: 'João Silva',
    role: 'Gerente - Pizzaria Bella Napoli',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote: 'Sistema intuitivo e fácil de usar. Minha equipe se adaptou em dias e as vendas aumentaram 30% no primeiro mês com o cardápio digital.',
    rating: 5,
  },
  {
    name: 'Lucia Oliveira',
    role: 'Administradora - Rede de Lanchonetes',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote: 'Gerencio 5 unidades com o Alba Tec. A visão consolidada me permite identificar oportunidades e reduzir custos operacionais em 25%.',
    rating: 5,
  },
  {
    name: 'Ricardo Ferreira',
    role: 'Empresário - Rede de Pizzarias',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote: 'Escalei de 1 para 8 unidades usando o Alba Tec. O sistema cresce com o negócio — investimento que vale cada centavo.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32 bg-stone-50 border-t border-zinc-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <p className="text-[11px] uppercase tracking-[0.18em] text-orange-600 font-medium mb-4">
            Depoimentos
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-zinc-900 mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-lg text-zinc-500 leading-relaxed">
            Restaurantes de todo o Brasil confiam no Alba Tec para gerenciar seus negócios e aumentar suas vendas.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 max-w-5xl">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="rounded-xl border border-zinc-200 bg-white p-6 hover:border-zinc-300 transition-colors"
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="size-11 shrink-0 ring-1 ring-zinc-200 ring-offset-2 ring-offset-white">
                  <AvatarImage alt={testimonial.name} src={testimonial.image} loading="lazy" width="120" height="120" />
                  <AvatarFallback className="bg-zinc-100 text-zinc-700 font-semibold text-sm">
                    {testimonial.name.split(' ').map((n) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-zinc-900 text-sm">{testimonial.name}</h3>
                  <span className="text-zinc-500 block text-xs mt-0.5">{testimonial.role}</span>
                  <div className="flex items-center gap-0.5 mt-2">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    ))}
                  </div>
                </div>
              </div>
              <blockquote>
                <p className="text-sm leading-relaxed text-zinc-500">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </blockquote>
            </div>
          ))}
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          Avatares ilustrativos. Depoimentos baseados em feedback real de clientes.
        </p>
      </div>
    </section>
  )
}
