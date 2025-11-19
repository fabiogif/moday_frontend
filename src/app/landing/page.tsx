import type { Metadata } from 'next'
import { LandingPageContent } from './landing-page-content'

// Metadata for the landing page
export const metadata: Metadata = {
  title: 'Alba Tech - Sistema de Gestão para Restaurantes',
  description: 'Sistema completo de gestão para restaurantes. Gerencie pedidos, cardápio, estoque e muito mais em uma única plataforma moderna e intuitiva.',
  keywords: ['gestão de restaurante', 'sistema de pedidos', 'cardápio digital', 'gestão de estoque', 'delivery', 'controle de vendas'],
  openGraph: {
    title: 'Alba Tech - Sistema de Gestão para Restaurantes',
    description: 'Sistema completo de gestão para restaurantes. Gerencie pedidos, cardápio, estoque e muito mais em uma única plataforma.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Alba Tech - Sistema de Gestão para Restaurantes',
    description: 'Sistema completo de gestão para restaurantes. Gerencie pedidos, cardápio, estoque e muito mais.',
  },
}

export default function LandingPage() {
  return <LandingPageContent />
}
