"use client"

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

type FaqItem = {
  value: string
  question: string
  answer: string
}

const faqItems: FaqItem[] = [
  {
    value: 'item-1',
    question: 'Como funciona o sistema de gestão de pedidos?',
    answer:
      'Nosso sistema permite gerenciar pedidos em tempo real, desde o recebimento até a entrega. Você pode acompanhar o status de cada pedido, gerenciar filas de produção, enviar notificações aos clientes e gerar relatórios completos de vendas. Tudo de forma integrada e intuitiva.',
  },
  {
    value: 'item-2',
    question: 'Como funcionam as variações e opcionais dos produtos?',
    answer:
      'O sistema permite configurar variações (escolha única) como tamanhos P/M/G, tipos de massa ou sabores, onde o cliente escolhe apenas uma opção. Também suporta opcionais (múltipla escolha) como bacon, queijo extra, bordas recheadas, onde o cliente pode adicionar múltiplos itens e até repetir o mesmo várias vezes. O preço total é calculado automaticamente em tempo real.',
  },
  {
    value: 'item-2b',
    question: 'Posso personalizar o cardápio digital?',
    answer:
      'Sim! Você tem total controle sobre seu cardápio digital. Adicione produtos com variações e opcionais, organize por categorias, defina preços (incluindo descontos e acréscimos), adicione imagens e descrições detalhadas. Seu cardápio fica disponível online com um link único que pode ser compartilhado com seus clientes via QR Code ou redes sociais.',
  },
  {
    value: 'item-3',
    question: 'Como funciona o controle de estoque?',
    answer:
      'O sistema oferece controle completo de estoque com alertas automáticos quando produtos estão acabando. Você pode acompanhar entradas e saídas, definir quantidades mínimas, gerenciar fornecedores e ter relatórios detalhados sobre movimentação de produtos.',
  },
  {
    value: 'item-4',
    question: 'O sistema oferece suporte e treinamento?',
    answer:
      'Sim! Oferecemos suporte técnico via chat e email, além de documentação completa e vídeos tutoriais. Todos os planos incluem treinamento inicial para sua equipe, garantindo que você aproveite ao máximo todas as funcionalidades do sistema.',
  },
  {
    value: 'item-5',
    question: 'Posso gerenciar múltiplos restaurantes?',
    answer:
      'Sim! Nossos planos Pro e Enterprise permitem gerenciar múltiplos estabelecimentos a partir de uma única conta. Você pode ter diferentes cardápios, equipes e relatórios para cada local, mantendo tudo organizado em um só lugar.',
  },
  {
    value: 'item-6',
    question: 'Como funciona a integração com pagamentos?',
    answer:
      'O sistema se integra com as principais plataformas de pagamento do mercado. Seus clientes podem pagar online via cartão de crédito, PIX, carteiras digitais ou optar por pagamento na entrega. Todas as transações são rastreadas e incluídas nos relatórios financeiros.',
  },
  {
    value: 'item-7',
    question: 'Posso acessar o sistema de qualquer lugar?',
    answer:
      'Sim! Nosso sistema é 100% em nuvem, permitindo acesso de qualquer dispositivo com internet - computador, tablet ou smartphone. Seus dados estão sempre seguros e sincronizados em tempo real.',
  },
  {
    value: 'item-8',
    question: 'Quais relatórios o sistema oferece?',
    answer:
      'Oferecemos relatórios completos de vendas, produtos mais vendidos, desempenho por período, clientes frequentes, análise de estoque e muito mais. Todos os relatórios podem ser exportados em PDF ou Excel para facilitar sua gestão.',
  },
]

const FaqSection = () => {
  return (
    <section id="faq" className="py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">Perguntas Frequentes</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Tire suas dúvidas sobre nosso sistema de gestão para restaurantes. Precisa de mais informações? Entre em contato conosco!
          </p>
        </div>

        {/* FAQ Content */}
        <div className="max-w-4xl mx-auto">
          <div className='bg-transparent'>
            <div className='p-0'>
              <Accordion type='single' collapsible className='space-y-5'>
                {faqItems.map(item => (
                  <AccordionItem key={item.value} value={item.value} className='rounded-md !border bg-transparent'>
                    <AccordionTrigger className='cursor-pointer items-center gap-4 rounded-none bg-transparent py-2 ps-3 pe-4 hover:no-underline data-[state=open]:border-b'>
                      <div className='flex items-center gap-4'>
                        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-full'>
                          <CircleHelp className='size-5' />
                        </div>
                        <span className='text-start font-semibold'>{item.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className='p-4 bg-transparent'>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Support CTA */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Ainda tem dúvidas? Estamos aqui para ajudar.
            </p>
            <Button className='cursor-pointer' asChild>
              <a href="#contact">
                Fale Conosco
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { FaqSection }
