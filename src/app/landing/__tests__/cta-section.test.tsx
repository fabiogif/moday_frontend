import { render, screen } from '@testing-library/react'
import { CTASection } from '../components/cta-section'
import { RegisterModalProvider } from '@/contexts/register-modal-context'

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>
  }
})

describe('CTASection', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(<RegisterModalProvider>{component}</RegisterModalProvider>)
  }

  it('deve renderizar o título principal', () => {
    renderWithProvider(<CTASection />)
    expect(screen.getByText(/Pronto para transformar seu restaurante/i)).toBeInTheDocument()
  })

  it('deve renderizar os botões de CTA', () => {
    renderWithProvider(<CTASection />)
    expect(screen.getByText(/Teste grátis por 7 dias/i)).toBeInTheDocument()
    expect(screen.getByText(/Agendar demonstração/i)).toBeInTheDocument()
  })

  it('deve renderizar trust indicators', () => {
    renderWithProvider(<CTASection />)
    expect(screen.getByText(/Sem cartão de crédito/i)).toBeInTheDocument()
    expect(screen.getByText(/Ativação instantânea/i)).toBeInTheDocument()
    expect(screen.getByText(/Suporte em português/i)).toBeInTheDocument()
  })

  it('deve ter botão que abre o modal de registro', () => {
    renderWithProvider(<CTASection />)
    const registerButton = screen.getByRole('button', { name: /Teste grátis por 7 dias/i })
    expect(registerButton.tagName).toBe('BUTTON')
    // Verifica que não é um link
    expect(registerButton).not.toHaveAttribute('href', '/auth/register')
  })
})

