import { render, screen } from '@testing-library/react'
import { HeroSection } from '../components/hero-section'

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
  useSearchParams: () => new URLSearchParams(),
}))

describe('HeroSection', () => {
  it('deve renderizar o título principal com proposta de valor', () => {
    render(<HeroSection />)
    expect(
      screen.getByText(/Venda mais e cometa menos erros no seu restaurante/i)
    ).toBeInTheDocument()
  })

  it('deve renderizar informação do teste de 7 dias', () => {
    render(<HeroSection />)
    expect(screen.getByText(/7 dias grátis nos planos Básico e Premium/i)).toBeInTheDocument()
    expect(screen.getByText(/Teste grátis por 7 dias/i)).toBeInTheDocument()
  })

  it('deve renderizar micro-copy de cadastro', () => {
    render(<HeroSection />)
    expect(screen.getByText(/Cadastro em 2 min/i)).toBeInTheDocument()
  })

  it('deve ter link de cadastro com teste grátis', () => {
    render(<HeroSection />)
    const registerLink = screen.getByRole('link', { name: /teste grátis por 7 dias/i })
    expect(registerLink).toHaveAttribute('href', '/auth/register')
  })
})
