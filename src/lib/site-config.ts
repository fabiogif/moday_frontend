export const SITE_NAME = 'Alba Tec'

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://albatec.com.br'
).replace(/\/$/, '')

export const SITE_DESCRIPTION =
  'Sistema de gestão para restaurantes com PDV, cardápio digital, controle de mesas e relatórios em tempo real. Teste grátis por 7 dias, sem cartão.'

export const SITE_LOCALE = 'pt_BR'
