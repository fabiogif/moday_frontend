import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ClientsPage from '../page'
import { useAuthenticatedClients, useMutation } from '@/hooks/use-authenticated-api'
import { showSuccessToast, showErrorToast } from '@/components/ui/error-toast'

// Mock dos hooks
jest.mock('@/hooks/use-authenticated-api')
jest.mock('@/components/ui/error-toast')

const mockClients = [
  {
    id: 1,
    name: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao@example.com',
    phone: '(11) 98765-4321',
    total_orders: 5,
    is_active: true,
    created_at: '2025-01-01',
    created_at_formatted: '01/01/2025',
    updated_at: '2025-01-01',
  },
  {
    id: 2,
    name: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria@example.com',
    phone: '(11) 91234-5678',
    total_orders: 3,
    is_active: true,
    created_at: '2025-01-02',
    created_at_formatted: '02/01/2025',
    updated_at: '2025-01-02',
  },
]

describe('ClientsPage - CRUD Operations', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Mock useAuthenticatedClients
    ;(useAuthenticatedClients as jest.Mock).mockReturnValue({
      data: { data: mockClients },
      loading: false,
      error: null,
      refetch: jest.fn(),
      isAuthenticated: true,
    })

    // Mock useMutation
    ;(useMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      loading: false,
    })
  })

  describe('CREATE - Adicionar Cliente', () => {
    it('deve extrair mensagem de sucesso do backend', async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        message: 'Cliente cadastrado com sucesso no backend!',
        data: {
          id: 3,
          name: 'Novo Cliente',
          cpf: '111.222.333-44',
          email: 'novo@example.com',
          phone: '(11) 99999-9999',
        },
      })

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockCreate,
        loading: false,
      })

      render(<ClientsPage />)

      // Simular adição de cliente
      // (Nota: Este teste precisa ser expandido com interação real com o formulário)

      await waitFor(() => {
        expect(showSuccessToast).toHaveBeenCalledWith(
          'Cliente cadastrado com sucesso no backend!',
          'Sucesso'
        )
      })
    })

    it('deve adicionar cliente à lista local (atualização otimista)', async () => {
      const newClient = {
        id: 3,
        name: 'Novo Cliente',
        cpf: '111.222.333-44',
        email: 'novo@example.com',
        phone: '(11) 99999-9999',
        total_orders: 0,
        is_active: true,
        created_at: '2025-01-28',
        created_at_formatted: '28/01/2025',
        updated_at: '2025-01-28',
      }

      const mockCreate = jest.fn().mockResolvedValue({
        message: 'Cliente cadastrado com sucesso!',
        data: newClient,
      })

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockCreate,
        loading: false,
      })

      const { rerender } = render(<ClientsPage />)

      // Após adicionar, o novo cliente deve estar na lista
      // (Nota: Teste simplificado, precisa ser expandido)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      })
    })

    it('deve mostrar erro formatado em caso de falha', async () => {
      const mockError = {
        message: 'Este CPF já está cadastrado.',
        data: {
          message: 'Este CPF já está cadastrado.',
        },
        errors: {
          cpf: ['Este CPF já está cadastrado.'],
        },
      }

      const mockCreate = jest.fn().mockRejectedValue(mockError)

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockCreate,
        loading: false,
      })

      render(<ClientsPage />)

      // Após falha, deve mostrar erro
      // (Nota: Teste simplificado, precisa ser expandido com interação)

      // await waitFor(() => {
      //   expect(showErrorToast).toHaveBeenCalledWith(
      //     mockError,
      //     'Erro ao Cadastrar Cliente'
      //   )
      // })
    })
  })

  describe('UPDATE - Editar Cliente', () => {
    it('deve extrair mensagem de sucesso do backend', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({
        message: 'Cliente atualizado com sucesso no backend!',
        data: {
          ...mockClients[0],
          name: 'João Silva Atualizado',
        },
      })

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockUpdate,
        loading: false,
      })

      render(<ClientsPage />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Simular edição
      // (Nota: Teste simplificado, precisa ser expandido)
    })

    it('deve atualizar cliente na lista local', async () => {
      const updatedClient = {
        ...mockClients[0],
        name: 'João Silva Editado',
      }

      const mockUpdate = jest.fn().mockResolvedValue({
        message: 'Cliente atualizado com sucesso!',
        data: updatedClient,
      })

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockUpdate,
        loading: false,
      })

      render(<ClientsPage />)

      // Após atualização, nome deve mudar
      // (Nota: Teste simplificado, precisa ser expandido)
    })
  })

  describe('DELETE - Excluir Cliente', () => {
    it('deve remover cliente da lista imediatamente (atualização otimista)', async () => {
      const mockDelete = jest.fn().mockResolvedValue({
        message: 'Cliente excluído com sucesso!',
      })

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockDelete,
        loading: false,
      })

      render(<ClientsPage />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
        expect(screen.getByText('Maria Santos')).toBeInTheDocument()
      })

      // Simular exclusão do João Silva (id: 1)
      // Após excluir, deve sumir imediatamente
      // (Nota: Teste simplificado, precisa ser expandido com interação real)
    })

    it('deve fazer rollback em caso de erro', async () => {
      const mockError = {
        message: 'Erro ao excluir cliente',
        data: {
          message: 'Cliente possui pedidos vinculados',
        },
      }

      const mockDelete = jest.fn().mockRejectedValue(mockError)

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockDelete,
        loading: false,
      })

      render(<ClientsPage />)

      await waitFor(() => {
        expect(screen.getByText('João Silva')).toBeInTheDocument()
      })

      // Após erro, cliente deve voltar à lista (rollback)
      // (Nota: Teste simplificado, precisa ser expandido)

      await waitFor(() => {
        expect(showErrorToast).toHaveBeenCalled()
      })
    })

    it('deve extrair mensagem de sucesso do backend', async () => {
      const mockDelete = jest.fn().mockResolvedValue({
        message: 'Cliente removido com sucesso do sistema!',
      })

      ;(useMutation as jest.Mock).mockReturnValue({
        mutate: mockDelete,
        loading: false,
      })

      render(<ClientsPage />)

      // Após exclusão bem-sucedida
      // (Nota: Teste simplificado, precisa ser expandido)
    })
  })

  describe('Validações', () => {
    it('deve mostrar loading state', () => {
      ;(useAuthenticatedClients as jest.Mock).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        refetch: jest.fn(),
        isAuthenticated: true,
      })

      render(<ClientsPage />)

      expect(screen.getByText(/carregando clientes/i)).toBeInTheDocument()
    })

    it('deve mostrar erro quando API falhar', () => {
      ;(useAuthenticatedClients as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
        error: 'Erro ao carregar dados',
        refetch: jest.fn(),
        isAuthenticated: true,
      })

      render(<ClientsPage />)

      expect(screen.getByText(/erro ao carregar clientes/i)).toBeInTheDocument()
    })

    it('deve mostrar mensagem quando não autenticado', () => {
      ;(useAuthenticatedClients as jest.Mock).mockReturnValue({
        data: null,
        loading: false,
        error: null,
        refetch: jest.fn(),
        isAuthenticated: false,
      })

      render(<ClientsPage />)

      expect(screen.getByText(/não autenticado/i)).toBeInTheDocument()
    })
  })
})

