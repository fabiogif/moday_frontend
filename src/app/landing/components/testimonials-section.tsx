"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

type Testimonial = {
  name: string
  role: string
  image: string
  quote: string
}

const testimonials: Testimonial[] = [
  {
    name: 'Maria Santos',
    role: 'Proprietária - Restaurante Sabor & Arte',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-1',
    quote:
      'O Tahan revolucionou a gestão do meu restaurante. Agora consigo acompanhar pedidos em tempo real, controlar estoque e gerar relatórios precisos. Nossa eficiência aumentou 40%!',
  },
  {
    name: 'João Silva',
    role: 'Gerente - Pizzaria Bella Napoli',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-1',
    quote: 'Sistema intuitivo e fácil de usar. Minha equipe se adaptou rapidamente e os clientes adoram nosso cardápio digital. As vendas aumentaram 30% no primeiro mês.',
  },
  {
    name: 'Ana Costa',
    role: 'Chef - Bistrô Gourmet',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-2',
    quote:
      'Finalmente um sistema que entende as necessidades de um restaurante. O controle de estoque é impecável e os alertas me ajudam a evitar desperdícios.',
  },
  {
    name: 'Carlos Mendes',
    role: 'Proprietário - Burger House',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-2',
    quote:
      'Migrei de um sistema antigo para o Tahan e foi a melhor decisão. Os relatórios me ajudam a tomar decisões estratégicas baseadas em dados reais.',
  },
  {
    name: 'Lucia Oliveira',
    role: 'Administradora - Rede de Lanchonetes',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-3',
    quote:
      'Gerencio 5 unidades com o Tahan. A visão consolidada de todas as lojas me permite identificar oportunidades e otimizar operações. Indispensável para nossa rede!',
  },
  {
    name: 'Roberto Alves',
    role: 'Sócio - Sushi Bar Premium',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-3',
    quote: 'O cardápio digital com fotos dos pratos aumentou nosso ticket médio significativamente. Sistema profissional e com excelente custo-benefício.',
  },
  {
    name: 'Fernanda Lima',
    role: 'Proprietária - Cafeteria Aroma',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-4',
    quote:
      'O suporte é excepcional! Sempre que preciso, a equipe está pronta para ajudar. O sistema funciona perfeitamente no celular, tablet e computador.',
  },
  {
    name: 'Paulo Souza',
    role: 'Gerente - Churrascaria Gaúcha',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-4',
    quote: 'A integração com delivery facilitou muito nossa operação. Todos os pedidos centralizados em um só lugar. Sem mais bagunça!',
  },
  {
    name: 'Carla Rodrigues',
    role: 'Chef - Restaurante Vegetariano',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-5',
    quote:
      'Posso atualizar o cardápio em segundos quando algum ingrediente acaba. O sistema é rápido, confiável e me dá total controle.',
  },
  {
    name: 'André Martins',
    role: 'Proprietário - Padaria & Confeitaria',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-5',
    quote: 'Os relatórios de produtos mais vendidos me ajudam a planejar melhor a produção. Reduzi desperdícios e aumentei lucros!',
  },
  {
    name: 'Juliana Castro',
    role: 'Administradora - Food Truck Gourmet',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=female-6',
    quote:
      'Perfeito para food trucks! Simples, rápido e funciona offline quando necessário. Meu negócio ficou muito mais profissional.',
  },
  {
    name: 'Ricardo Ferreira',
    role: 'Empresário - Rede de Pizzarias',
    image: 'https://notion-avatars.netlify.app/api/avatar?preset=male-6',
    quote: 'Escalei meu negócio de 1 para 8 unidades usando o Tahan. O sistema cresce com o negócio. Investimento que vale cada centavo!',
  },
]

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 sm:py-32">
      <div className="container mx-auto px-8 sm:px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Depoimentos</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            O Que Nossos Clientes Dizem
          </h2>
          <p className="text-lg text-muted-foreground">
            Milhares de restaurantes confiam no Tahan para gerenciar seus negócios e aumentar suas vendas.
          </p>
        </div>

        {/* Testimonials Masonry Grid */}
        <div className="columns-1 gap-4 md:columns-2 md:gap-6 lg:columns-3 lg:gap-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="mb-6 break-inside-avoid shadow-none lg:mb-4">
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar className="bg-muted size-12 shrink-0">
                    <AvatarImage
                      alt={testimonial.name}
                      src={testimonial.image}
                      loading="lazy"
                      width="120"
                      height="120"
                    />
                    <AvatarFallback>
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <a href="#" onClick={e => e.preventDefault()} className="cursor-pointer">
                      <h3 className="font-medium hover:text-primary transition-colors">{testimonial.name}</h3>
                    </a>
                    <span className="text-muted-foreground block text-sm tracking-wide">
                      {testimonial.role}
                    </span>
                  </div>
                </div>

                <blockquote className="mt-4">
                  <p className="text-sm leading-relaxed text-balance">{testimonial.quote}</p>
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
