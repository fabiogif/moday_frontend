import React from 'react'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import PlansPage from '../page'
import { api } from '@/lib/api-client'

// Mock do api-client
jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  endpoints: {
    plans: {
      list: '/api/plan',
      create: '/api/plan',
      show: (id: string | number) => `/api/plan/${id}`,
      update: (id: string | number) => `/api/plan/${id}`,
      delete: (id: string | number) => `/api/plan/${id}`,
      details: (id: string | number) => `/api/plan/${id}/details`,
    },
  },
}))

// Mock do useRouter
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))

// Mock do useAuthenticatedPlans
jest.mock('@/hooks/use-authenticated-api', () => ({
  useAuthenticatedPlans: () => ({
    data: [],
    loading: false,
    error: null,
    refetch: jest.fn(),
  }),
}))

const mockPlans = [
  {
    id: 1,
    name: 'Grátis',
    url: 'gratis',
    price: '0.00',
    description: 'Plano gratuito para testes',
    is_active: true,
    max_users: 1,
    max_products: 50,
    max_orders_per_month: 30,
    has_marketing: false,
    has_reports: false,
    details: [
      { id: 1, name: '1 usuário', plan_id: 1 },
      { id: 2, name: '50 produtos', plan_id: 1 },
      { id: 3, name: '30 pedidos/mês', plan_id: 1 },
    ],
  },
  {
    id: 2,
    name: 'Básico',
    url: 'basico',
    price: '49.90',
    description: 'Plano básico para pequenos negócios',
    is_active: true,
    max_users: 5,
    max_products: 100,
    max_orders_per_month: 100,
    has_marketing: true,
    has_reports: true,
    details: [
      { id: 4, name: '5 usuários', plan_id: 2 },
      { id: 5, name: '100 produtos', plan_id: 2 },
      { id: 6, name: '100 pedidos/mês', plan_id: 2 },
    ],
  },
  {
    id: 3,
    name: 'Premium',
    url: 'premium',
    price: '99.90',
    description: 'Plano premium ilimitado',
    is_active: true,
    max_users: 999999,
    max_products: 999999,
    max_orders_per_month: null,
    has_marketing: true,
    has_reports: true,
    details: [
      { id: 7, name: 'Usuários ilimitados', plan_id: 3 },
      { id: 8, name: 'Produtos ilimitados', plan_id: 3 },
      { id: 9, name: 'Pedidos ilimitados', plan_id: 3 },
    ],
  },
]

describe('PlanCrudTest - Admin Plans CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.get as jest.Mock).mockResolvedValue({
      data: { data: mockPlans },
    })
  })

  /**
   * TESTE 1: Renderizar a página de listagem de planos
   */
  test('should render plans list page correctly', async () => {
    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Gestão de Planos')).toBeInTheDocument()
      expect(screen.getByText('Novo Plano')).toBeInTheDocument()
    })
  })

  /**
   * TESTE 2: Listar todos os planos na tabela
   */
  test('should display all plans in the table', async () => {
    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
      expect(screen.getByText('Básico')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    // Verificar preços
    expect(screen.getByText('R$ 0,00')).toBeInTheDocument()
    expect(screen.getByText('R$ 49,90')).toBeInTheDocument()
    expect(screen.getByText('R$ 99,90')).toBeInTheDocument()
  })

  /**
   * TESTE 3: Abrir modal de criar plano
   */
  test('should open create plan dialog when clicking "Novo Plano"', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    await waitFor(() => {
      expect(screen.getByText('Criar Novo Plano')).toBeInTheDocument()
      expect(screen.getByLabelText(/Nome do Plano/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/URL/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Preço/i)).toBeInTheDocument()
    })
  })

  /**
   * TESTE 4: Criar um novo plano com sucesso
   */
  test('should create a new plan successfully', async () => {
    const user = userEvent.setup()
    const newPlan = {
      id: 4,
      name: 'Plano Teste',
      url: 'plano-teste',
      price: '79.90',
      description: 'Plano criado para teste',
      is_active: true,
      max_users: 10,
      max_products: 200,
      max_orders_per_month: 500,
      has_marketing: true,
      has_reports: true,
      details: [],
    }

    ;(api.post as jest.Mock).mockResolvedValue({
      data: { success: true, data: newPlan },
    })

    render(<PlansPage />)

    // Abrir modal
    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    // Preencher formulário
    const nameInput = screen.getByLabelText(/Nome do Plano/i)
    const urlInput = screen.getByLabelText(/URL/i)
    const priceInput = screen.getByLabelText(/Preço/i)
    const descriptionInput = screen.getByLabelText(/Descrição/i)

    await user.clear(nameInput)
    await user.type(nameInput, 'Plano Teste')

    await user.clear(urlInput)
    await user.type(urlInput, 'plano-teste')

    await user.clear(priceInput)
    await user.type(priceInput, '79.90')

    await user.clear(descriptionInput)
    await user.type(descriptionInput, 'Plano criado para teste')

    // Salvar
    const saveButton = screen.getByRole('button', { name: /Criar Plano/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/plan',
        expect.objectContaining({
          name: 'Plano Teste',
          url: 'plano-teste',
          price: 79.90,
          description: 'Plano criado para teste',
        })
      )
    })
  })

  /**
   * TESTE 5: Validação de campos obrigatórios ao criar plano
   */
  test('should validate required fields when creating plan', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    // Abrir modal
    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    // Tentar salvar sem preencher
    const saveButton = screen.getByRole('button', { name: /Criar Plano/i })
    await user.click(saveButton)

    // Verificar mensagens de erro
    await waitFor(() => {
      expect(screen.getByText(/Nome é obrigatório/i)).toBeInTheDocument()
      expect(screen.getByText(/URL é obrigatória/i)).toBeInTheDocument()
      expect(screen.getByText(/Preço é obrigatório/i)).toBeInTheDocument()
    })
  })

  /**
   * TESTE 6: Abrir modal de editar plano
   */
  test('should open edit plan dialog when clicking edit button', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
    })

    // Encontrar o botão de editar do primeiro plano
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Editar Plano')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Grátis')).toBeInTheDocument()
    })
  })

  /**
   * TESTE 7: Editar um plano existente
   */
  test('should update an existing plan successfully', async () => {
    const user = userEvent.setup()
    const updatedPlan = {
      ...mockPlans[0],
      name: 'Grátis Atualizado',
      description: 'Descrição atualizada',
    }

    ;(api.put as jest.Mock).mockResolvedValue({
      data: { success: true, data: updatedPlan },
    })

    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
    })

    // Abrir edição
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    // Editar nome
    const nameInput = await screen.findByDisplayValue('Grátis')
    await user.clear(nameInput)
    await user.type(nameInput, 'Grátis Atualizado')

    // Salvar
    const saveButton = screen.getByRole('button', { name: /Salvar Alterações/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith(
        '/api/plan/1',
        expect.objectContaining({
          name: 'Grátis Atualizado',
        })
      )
    })
  })

  /**
   * TESTE 8: Excluir um plano
   */
  test('should delete a plan successfully', async () => {
    const user = userEvent.setup()
    
    ;(api.delete as jest.Mock).mockResolvedValue({
      data: { success: true },
    })

    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
    })

    // Encontrar o botão de deletar
    const deleteButtons = screen.getAllByRole('button', { name: /trash/i })
    await user.click(deleteButtons[0])

    // Confirmar exclusão
    const confirmButton = await screen.findByRole('button', { name: /Confirmar/i })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/api/plan/1')
    })
  })

  /**
   * TESTE 9: Adicionar detalhes ao plano
   */
  test('should add details to a plan', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    // Abrir modal de criar
    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    // Encontrar seção de detalhes
    const addDetailButton = screen.getByRole('button', { name: /Adicionar Feature/i })
    
    // Adicionar 3 features
    await user.click(addDetailButton)
    await user.click(addDetailButton)
    await user.click(addDetailButton)

    // Verificar que 3 campos foram adicionados
    const detailInputs = screen.getAllByPlaceholderText(/Nome da feature/i)
    expect(detailInputs).toHaveLength(3)
  })

  /**
   * TESTE 10: Remover detalhes do plano
   */
  test('should remove details from a plan', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    // Abrir modal de criar
    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    // Adicionar 2 features
    const addDetailButton = screen.getByRole('button', { name: /Adicionar Feature/i })
    await user.click(addDetailButton)
    await user.click(addDetailButton)

    let detailInputs = screen.getAllByPlaceholderText(/Nome da feature/i)
    expect(detailInputs).toHaveLength(2)

    // Remover uma feature
    const removeButtons = screen.getAllByRole('button', { name: /X/i })
    await user.click(removeButtons[0])

    // Verificar que sobrou apenas 1
    detailInputs = screen.queryAllByPlaceholderText(/Nome da feature/i)
    expect(detailInputs).toHaveLength(1)
  })

  /**
   * TESTE 11: Exibir detalhes do plano na tabela
   */
  test('should display plan details correctly in the table', async () => {
    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
    })

    // Verificar se a coluna de features está presente (desktop)
    const featuresColumn = screen.queryAllByText(/features/i)
    expect(featuresColumn.length).toBeGreaterThan(0)
  })

  /**
   * TESTE 12: Filtrar/buscar planos
   */
  test('should filter plans by name', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
      expect(screen.getByText('Básico')).toBeInTheDocument()
      expect(screen.getByText('Premium')).toBeInTheDocument()
    })

    // Buscar por "Básico"
    const searchInput = screen.getByPlaceholderText(/Buscar/i)
    await user.type(searchInput, 'Básico')

    // Verificar que apenas Básico aparece
    await waitFor(() => {
      expect(screen.getByText('Básico')).toBeInTheDocument()
      expect(screen.queryByText('Grátis')).not.toBeInTheDocument()
      expect(screen.queryByText('Premium')).not.toBeInTheDocument()
    })
  })

  /**
   * TESTE 13: Exibir badge de status ativo/inativo
   */
  test('should display active/inactive status badge', async () => {
    render(<PlansPage />)

    await waitFor(() => {
      expect(screen.getByText('Grátis')).toBeInTheDocument()
    })

    // Verificar badges de status
    const activeBadges = screen.getAllByText('Ativo')
    expect(activeBadges.length).toBeGreaterThan(0)
  })

  /**
   * TESTE 14: Fechar modal ao clicar em cancelar
   */
  test('should close modal when clicking cancel', async () => {
    const user = userEvent.setup()
    render(<PlansPage />)

    // Abrir modal
    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    expect(screen.getByText('Criar Novo Plano')).toBeInTheDocument()

    // Clicar em cancelar
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i })
    await user.click(cancelButton)

    // Verificar que o modal fechou
    await waitFor(() => {
      expect(screen.queryByText('Criar Novo Plano')).not.toBeInTheDocument()
    })
  })

  /**
   * TESTE 15: Exibir mensagem de sucesso após criar plano
   */
  test('should show success message after creating plan', async () => {
    const user = userEvent.setup()
    
    ;(api.post as jest.Mock).mockResolvedValue({
      data: { success: true, data: mockPlans[0] },
    })

    render(<PlansPage />)

    // Criar plano
    const newPlanButton = await screen.findByText('Novo Plano')
    await user.click(newPlanButton)

    // Preencher e salvar (simplificado)
    const nameInput = screen.getByLabelText(/Nome do Plano/i)
    await user.type(nameInput, 'Novo Plano')
    
    const saveButton = screen.getByRole('button', { name: /Criar Plano/i })
    await user.click(saveButton)

    // Verificar mensagem de sucesso
    await waitFor(() => {
      expect(screen.getByText(/Plano criado com sucesso/i)).toBeInTheDocument()
    })
  })
})

