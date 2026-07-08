export type LandingFaqItem = {
  id: string
  question: string
  answer: string
}

export const LANDING_FAQ_ITEMS: LandingFaqItem[] = [
  {
    id: 'pedidos',
    question: 'Como funciona o sistema de gestão de pedidos?',
    answer:
      'O Alba Tec permite gerenciar pedidos em tempo real, desde o recebimento até a entrega. Você acompanha o status de cada pedido, organiza a produção, notifica clientes e gera relatórios de vendas em um só lugar.',
  },
  {
    id: 'variacoes',
    question: 'Como funcionam as variações e opcionais dos produtos?',
    answer:
      'Configure variações de escolha única, como tamanhos e sabores, e opcionais de múltipla escolha, como adicionais e bordas. O preço final é calculado automaticamente no PDV e no cardápio digital.',
  },
  {
    id: 'cardapio',
    question: 'Posso personalizar o cardápio digital?',
    answer:
      'Sim. Você controla produtos, categorias, preços, imagens e descrições. O cardápio fica online com link exclusivo para compartilhar por QR Code, WhatsApp e redes sociais.',
  },
  {
    id: 'estoque',
    question: 'Como funciona o controle de estoque?',
    answer:
      'O sistema registra entradas e saídas, alerta quando itens estão acabando e ajuda a acompanhar a movimentação de produtos com relatórios por período.',
  },
  {
    id: 'suporte',
    question: 'O sistema oferece suporte e treinamento?',
    answer:
      'Sim. Há suporte por chat e e-mail, documentação e materiais de treinamento para sua equipe começar a usar o sistema com segurança.',
  },
  {
    id: 'multiplas-unidades',
    question: 'Posso gerenciar múltiplos restaurantes?',
    answer:
      'Planos avançados permitem administrar mais de um estabelecimento na mesma conta, com cardápios, equipes e relatórios separados por unidade.',
  },
  {
    id: 'pagamentos',
    question: 'Como funciona a integração com pagamentos?',
    answer:
      'O Alba Tec integra formas de pagamento usadas no dia a dia do restaurante e registra as transações nos relatórios financeiros para facilitar o fechamento.',
  },
  {
    id: 'acesso',
    question: 'Posso acessar o sistema de qualquer lugar?',
    answer:
      'Sim. O sistema é em nuvem e funciona em computador, tablet e smartphone, com dados sincronizados em tempo real.',
  },
  {
    id: 'app-mobile',
    question: 'Existe app mobile para gerenciar pedidos?',
    answer:
      'Sim. O Alba Tec Restaurante permite receber push com som quando chega um pedido, aceitar e avançar o status no mesmo fluxo do painel, consultar histórico e ajustar os horários de funcionamento pelo celular.',
  },
  {
    id: 'relatorios',
    question: 'Quais relatórios o sistema oferece?',
    answer:
      'Há relatórios de vendas, produtos mais vendidos, desempenho por período, clientes frequentes, estoque e indicadores financeiros, com exportação quando necessário.',
  },
]
