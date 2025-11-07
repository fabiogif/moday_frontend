import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClientsPage from '@/app/(dashboard)/clients/page'

jest.mock('@/hooks/use-authenticated-api', () => ({
  useAuthenticatedClients: jest.fn(),
  useMutation: jest.fn(),
}))

jest.mock('@/app/(dashboard)/clients/components/stat-cards', () => ({
  StatCards: () => <div data-testid="client-stat-cards" />,
}))

jest.mock('@/app/(dashboard)/clients/components/client-form-dialog', () => ({
  ClientFormDialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/app/(dashboard)/clients/components/success-alert', () => ({
  SuccessAlert: ({ open, title, message, onOpenChange }: any) => (
    open ? (
      <div role="alert">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={() => onOpenChange(false)}>OK</button>
      </div>
    ) : null
  ),
}))

jest.mock('@/components/ui/error-toast', () => ({
  showErrorToast: jest.fn(),
  showSuccessToast: jest.fn(),
}))

const { useAuthenticatedClients, useMutation } = jest.requireMock('@/hooks/use-authenticated-api')
const { showErrorToast } = jest.requireMock('@/components/ui/error-toast')

describe('ClientsPage - conflito de exclusão', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('usa showErrorToast com mensagem amigável quando exclusão retorna 409', async () => {
    const refetch = jest.fn()
    ;(useAuthenticatedClients as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          name: 'Cliente Teste',
          cpf: '12345678900',
          email: 'cliente@test.com',
          phone: '11999999999',
          address: 'Rua A',
          city: 'São Paulo',
          state: 'SP',
          zip_code: '01000000',
          neighborhood: 'Centro',
          number: '100',
          complement: '',
          full_address: 'Rua A, 100 - Centro',
          has_complete_address: true,
          total_orders: 1,
          last_order: '07/11/2025',
          last_order_raw: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString(),
          created_at_formatted: '07/11/2025',
          updated_at: new Date().toISOString(),
        },
      ],
      loading: false,
      error: null,
      refetch,
      isAuthenticated: true,
    })

    const mutateCreate = jest.fn()
    const mutateUpdate = jest.fn()
    const mutateDelete = jest.fn().mockRejectedValue({
      status: 409,
      message: 'Cliente não pode ser excluído, existe um pedido ativo ou não arquivado vinculado.',
    })

    ;(useMutation as jest.Mock)
      .mockReturnValueOnce({ mutate: mutateCreate, loading: false })
      .mockReturnValueOnce({ mutate: mutateUpdate, loading: false })
      .mockReturnValueOnce({ mutate: mutateDelete, loading: false })

    render(<ClientsPage />)

    const user = userEvent.setup()

    await waitFor(() => {
      expect(screen.getByText('Cliente Teste')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /abrir menu/i }))
    await user.click(screen.getByText('Excluir'))
    await user.click(screen.getByRole('button', { name: /Excluir/i }))

    await waitFor(() => {
      expect(showErrorToast).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Cliente não pode ser excluído, existe um pedido ativo ou não arquivado vinculado.',
        }),
        'Ação não permitida'
      )
    })
  })
})


