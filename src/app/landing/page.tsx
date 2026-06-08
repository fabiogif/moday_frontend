import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'

// Metadata for the landing page
export const metadata: Metadata = {
  title: 'Alba Tec - Sistema de Gestão para Restaurantes',
  description: 'Venda mais e cometa menos erros no seu restaurante. PDV, cardápio digital e relatórios em tempo real. Teste grátis por 7 dias, sem cartão.',
  keywords: ['gestão de restaurante', 'sistema de pedidos', 'cardápio digital', 'gestão de estoque', 'delivery', 'controle de vendas'],
  openGraph: {
    title: 'Alba Tec - Sistema de Gestão para Restaurantes',
    description: 'Venda mais e cometa menos erros no seu restaurante. Teste grátis por 7 dias, sem cartão.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alba Tec - Sistema de Gestão para Restaurantes',
    description: 'Venda mais e cometa menos erros no seu restaurante. Teste grátis por 7 dias, sem cartão.',
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
