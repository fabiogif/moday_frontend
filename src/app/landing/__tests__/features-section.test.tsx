import { render, screen } from '@testing-library/react'
import { FeaturesSection } from '../components/features-section'

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

describe('FeaturesSection', () => {
  it('deve renderizar o título da seção', () => {
    render(<FeaturesSection />)
    expect(screen.getByText(/Tudo que você precisa para gerenciar seu restaurante/i)).toBeInTheDocument()
  })

  it('deve renderizar todos os 8 cards de features', () => {
    render(<FeaturesSection />)
    expect(screen.getByText(/PDV Touch-First/i)).toBeInTheDocument()
    expect(screen.getByText(/Sistema de Avaliações/i)).toBeInTheDocument()
    expect(screen.getByText(/Controle de Mesas/i)).toBeInTheDocument()
    expect(screen.getByText(/Cardápio Digital/i)).toBeInTheDocument()
    expect(screen.getByText(/Relatórios em Tempo Real/i)).toBeInTheDocument()
    expect(screen.getByText(/Controle de Estoque/i)).toBeInTheDocument()
    expect(screen.getByText(/Gestão de Equipe/i)).toBeInTheDocument()
    expect(screen.getByText(/Integrações/i)).toBeInTheDocument()
  })

  it('deve renderizar badges NOVO nos 3 primeiros cards', () => {
    render(<FeaturesSection />)
    const novoBadges = screen.getAllByText(/NOVO/i)
    expect(novoBadges.length).toBeGreaterThanOrEqual(3)
  })

  it('deve renderizar métricas de benefício', () => {
    render(<FeaturesSection />)
    expect(screen.getByText(/\+3x produtividade/i)).toBeInTheDocument()
    expect(screen.getByText(/\+35% conversão/i)).toBeInTheDocument()
  })
})

