import type { Metadata } from 'next'
import { COMPANY_EMAILS } from '@/lib/company-emails'
import { LANDING_FAQ_ITEMS } from '@/lib/landing-faq'
import {
  LANDING_TITLE,
  SITE_DESCRIPTION,
  SITE_LOCALE,
  SITE_NAME,
  SITE_URL,
} from '@/lib/site-config'

const LANDING_OG_IMAGE = '/landing/sistema-gestao-restaurantes-painel.webp'
const LANDING_OG_IMAGE_FALLBACK = '/landing/dashboard-painel.png'
const LANDING_OG_IMAGE_ALT =
  'Painel do sistema de gestão para restaurantes Alba Tec com receita, pedidos e gráficos em tempo real'

export function buildLandingMetadata(canonicalPath = '/'): Metadata {
  const title = LANDING_TITLE
  const description = SITE_DESCRIPTION

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    applicationName: SITE_NAME,
    keywords: [
      'sistema de gestão para restaurantes',
      'PDV para restaurante',
      'cardápio digital',
      'sistema para restaurante',
      'gestão de pedidos',
      'controle de mesas',
      'Alba Tec',
    ],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
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
          width: 1024,
          height: 474,
          alt: LANDING_OG_IMAGE_ALT,
        },
        {
          url: LANDING_OG_IMAGE_FALLBACK,
          width: 1024,
          height: 474,
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
      email: COMPANY_EMAILS.contact,
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: COMPANY_EMAILS.support,
          availableLanguage: ['Portuguese'],
        },
        {
          '@type': 'ContactPoint',
          contactType: 'sales',
          email: COMPANY_EMAILS.contact,
          availableLanguage: ['Portuguese'],
        },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: 'pt-BR',
      description: SITE_DESCRIPTION,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: LANDING_TITLE,
      description: SITE_DESCRIPTION,
      inLanguage: 'pt-BR',
      isPartOf: {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
      },
      about: {
        '@type': 'SoftwareApplication',
        name: SITE_NAME,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Restaurant Management Software',
      operatingSystem: 'Web, Android, iOS',
      url: pageUrl,
      description: SITE_DESCRIPTION,
      image: `${SITE_URL}${LANDING_OG_IMAGE_FALLBACK}`,
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '0',
        highPrice: '99.90',
        priceCurrency: 'BRL',
        offerCount: '3',
        description: 'Plano gratuito e planos pagos com teste de 7 dias',
      },
      featureList: [
        'PDV touch-first',
        'Cardápio digital',
        'Controle de mesas',
        'Gestão financeira',
        'App mobile de pedidos',
        'Relatórios em tempo real',
      ],
      provider: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
      },
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
