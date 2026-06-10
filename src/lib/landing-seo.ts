import type { Metadata } from 'next'
import { LANDING_FAQ_ITEMS } from '@/lib/landing-faq'
import { LANDING_HEADLINE_VARIANTS } from '@/lib/landing-variants'
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_URL } from '@/lib/site-config'

const LANDING_OG_IMAGE = '/landing/dashboard-painel.png'
const LANDING_OG_IMAGE_ALT =
  'Painel do Alba Tec com receita, pedidos, clientes e gráficos em tempo real'

export function buildLandingMetadata(canonicalPath = '/'): Metadata {
  const title = `${SITE_NAME} — Sistema de Gestão para Restaurantes`
  const description = `${LANDING_HEADLINE_VARIANTS.a.subtitle} Teste grátis por 7 dias, sem cartão.`

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type: 'website',
      locale: SITE_LOCALE,
      url: `${SITE_URL}${canonicalPath}`,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: LANDING_OG_IMAGE,
          width: 1400,
          height: 900,
          alt: LANDING_OG_IMAGE_ALT,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [LANDING_OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    category: 'technology',
  }
}

export function buildLandingJsonLd(canonicalPath = '/') {
  const pageUrl = `${SITE_URL}${canonicalPath}`

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-alba-tec-sem-fundo.png`,
      description: SITE_DESCRIPTION,
      email: 'contato@albatec.com.br',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'pt-BR',
      description: SITE_DESCRIPTION,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: pageUrl,
      description: SITE_DESCRIPTION,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
        description: 'Plano gratuito e teste de 7 dias nos planos pagos',
      },
      featureList: [
        'PDV touch-first',
        'Cardápio digital',
        'Controle de mesas',
        'Gestão financeira',
        'Relatórios em tempo real',
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ]
}
