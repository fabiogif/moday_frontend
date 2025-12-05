import { render, screen } from '@testing-library/react'
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
}))

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn().mockRejectedValue(new Error('API Error')),
  },
}))

describe('LandingPageContent', () => {
  it('deve renderizar todos os componentes principais', () => {
    render(<LandingPageContent />)
    
    // Verifica se os componentes principais estão presentes
    expect(screen.getByText(/Gerencie seu Restaurante/i)).toBeInTheDocument()
    expect(screen.getByText(/Tudo que você precisa para gerenciar/i)).toBeInTheDocument()
    expect(screen.getByText(/Planos que cabem no seu bolso/i)).toBeInTheDocument()
  })

  it('deve renderizar navbar', () => {
    render(<LandingPageContent />)
    // Verifica se há links de navegação
    expect(screen.getByText(/Home/i)).toBeInTheDocument()
  })

  it('deve renderizar footer', () => {
    render(<LandingPageContent />)
    const companyNames = screen.getAllByText(/Alba Tech/i)
    expect(companyNames.length).toBeGreaterThan(0)
  })
})

