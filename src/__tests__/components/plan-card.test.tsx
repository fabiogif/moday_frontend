/**
 * Testes para o componente PlanCard
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { PlanCard, type Plan } from '@/components/plan-card'

const mockPlan: Plan = {
  id: 1,
  name: 'Básico',
  url: 'basico',
  price: 49.90,
  description: 'Plano básico',
  max_users: 5,
  max_products: 100,
  max_orders_per_month: 100,
  has_marketing: true,
  has_reports: true,
  details: [
    { name: 'Suporte por email' },
    { name: 'Cardápio digital' },
  ],
}

describe('PlanCard', () => {
  it('deve renderizar informações do plano corretamente', () => {
    const onMigrate = jest.fn()

    render(<PlanCard plan={mockPlan} isCurrentPlan={false} onMigrate={onMigrate} />)

    expect(screen.getByText('Básico')).toBeInTheDocument()
    expect(screen.getByText('R$ 49,90')).toBeInTheDocument()
    expect(screen.getByText('/mês')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument() // max_users
    expect(screen.getByText('100')).toBeInTheDocument() // max_products
  })

  it('deve exibir badge "Plano Atual" quando isCurrentPlan é true', () => {
    const onMigrate = jest.fn()

    render(<PlanCard plan={mockPlan} isCurrentPlan={true} onMigrate={onMigrate} />)

    expect(screen.getByText('Plano Atual')).toBeInTheDocument()
  })

  it('deve desabilitar botão quando isCurrentPlan é true', () => {
    const onMigrate = jest.fn()

    render(<PlanCard plan={mockPlan} isCurrentPlan={true} onMigrate={onMigrate} />)

    const button = screen.getByText('Plano Atual')
    expect(button.closest('button')).toBeDisabled()
  })

  it('deve chamar onMigrate ao clicar no botão', () => {
    const onMigrate = jest.fn()

    render(<PlanCard plan={mockPlan} isCurrentPlan={false} onMigrate={onMigrate} />)

    const button = screen.getByText('Migrar para este Plano')
    fireEvent.click(button)

    expect(onMigrate).toHaveBeenCalledWith(mockPlan.id)
  })

  it('deve exibir "Ilimitado" para limites null ou >= 999999', () => {
    const unlimitedPlan: Plan = {
      ...mockPlan,
      max_users: 999999,
      max_products: null,
      max_orders_per_month: null,
    }

    const onMigrate = jest.fn()

    render(<PlanCard plan={unlimitedPlan} isCurrentPlan={false} onMigrate={onMigrate} />)

    expect(screen.getAllByText('Ilimitado').length).toBeGreaterThan(0)
  })

  it('deve exibir ícone de coroa para planos premium', () => {
    const premiumPlan: Plan = {
      ...mockPlan,
      max_users: 999999,
      max_products: 999999,
      max_orders_per_month: null,
    }

    const onMigrate = jest.fn()

    const { container } = render(
      <PlanCard plan={premiumPlan} isCurrentPlan={false} onMigrate={onMigrate} />
    )

    // Verificar se há um ícone de coroa (Crown)
    const crownIcon = container.querySelector('svg')
    expect(crownIcon).toBeInTheDocument()
  })

  it('deve exibir detalhes do plano quando disponíveis', () => {
    const onMigrate = jest.fn()

    render(<PlanCard plan={mockPlan} isCurrentPlan={false} onMigrate={onMigrate} />)

    expect(screen.getByText('Suporte por email')).toBeInTheDocument()
    expect(screen.getByText('Cardápio digital')).toBeInTheDocument()
  })

  it('deve exibir checkmarks para has_marketing e has_reports', () => {
    const onMigrate = jest.fn()

    render(<PlanCard plan={mockPlan} isCurrentPlan={false} onMigrate={onMigrate} />)

    expect(screen.getByText('Marketing')).toBeInTheDocument()
    expect(screen.getByText('Relatórios')).toBeInTheDocument()
  })

  it('deve desabilitar botão durante migração', () => {
    const onMigrate = jest.fn()

    render(
      <PlanCard 
        plan={mockPlan} 
        isCurrentPlan={false} 
        onMigrate={onMigrate} 
        isMigrating={true}
      />
    )

    const button = screen.getByText('Migrando...')
    expect(button.closest('button')).toBeDisabled()
  })
})

