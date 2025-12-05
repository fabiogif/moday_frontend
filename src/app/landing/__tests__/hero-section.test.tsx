import { render, screen } from '@testing-library/react'
import { HeroSection } from '../components/hero-section'
import { RegisterModalProvider } from '@/contexts/register-modal-context'

// Mock Next.js Link and Image
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

describe('HeroSection', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<RegisterModalProvider>{component}</RegisterModalProvider>)
  }

  it('deve renderizar o título principal', () => {
    renderWithProvider(<HeroSection />)
    expect(screen.getByText(/Gerencie seu Restaurante/i)).toBeInTheDocument()
  })

  it('deve renderizar o badge NOVO', () => {
    renderWithProvider(<HeroSection />)
    expect(screen.getByText(/NOVO/i)).toBeInTheDocument()
  })

  it('deve renderizar o botão de teste grátis', () => {
    renderWithProvider(<HeroSection />)
    expect(screen.getByText(/Teste grátis por 7 dias/i)).toBeInTheDocument()
  })

  it('deve renderizar o card de promoção', () => {
    renderWithProvider(<HeroSection />)
    expect(screen.getByText(/Oferta Especial/i)).toBeInTheDocument()
    expect(screen.getByText(/Sistema Completo/i)).toBeInTheDocument()
  })

  it('deve ter botões que abrem o modal de registro', () => {
    renderWithProvider(<HeroSection />)
    const buttons = screen.getAllByRole('button', { name: /teste grátis por 7 dias/i })
    expect(buttons.length).toBeGreaterThan(0)
    // Os botões agora devem ser buttons, não links
    buttons.forEach(button => {
      expect(button.tagName).toBe('BUTTON')
    })
  })
})

