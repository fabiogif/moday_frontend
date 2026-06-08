import { render, screen, waitFor } from '@testing-library/react'
import { LandingPageContent } from '../landing-page-content'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return ({ src, alt }: { src: string; alt: string }) => {
    return <img src={src} alt={alt} />
  }
})

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockRejectedValue(new Error('API Error')),
  },
}))

describe('LandingPageContent', () => {
  it('deve renderizar componentes principais com nova proposta de valor', async () => {
    render(<LandingPageContent />)

    expect(
      screen.getByText(/Venda mais e cometa menos erros no seu restaurante/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/Tudo que você precisa para gerenciar/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/Simples, transparente e sem surpresas/i)).toBeInTheDocument()
    })
  })

  it('deve renderizar seção de stats', () => {
    render(<LandingPageContent />)
    expect(screen.getByText(/Aumento de Vendas/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Restaurantes Ativos/i).length).toBeGreaterThan(0)
  })

  it('deve renderizar trust badges', () => {
    render(<LandingPageContent />)
    expect(screen.getByText(/Dados protegidos \(LGPD\)/i)).toBeInTheDocument()
  })

  it('deve renderizar navbar com CTA de trial', () => {
    render(<LandingPageContent />)
    const trialLinks = screen.getAllByRole('link', { name: /Teste grátis por 7 dias/i })
    expect(trialLinks.length).toBeGreaterThan(0)
  })

  it('deve renderizar footer', () => {
    render(<LandingPageContent />)
    const companyNames = screen.getAllByText(/Alba Tec/i)
    expect(companyNames.length).toBeGreaterThan(0)
  })
})
