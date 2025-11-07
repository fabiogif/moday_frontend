import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TablesPage from '@/app/(dashboard)/tables/page'

jest.mock('@/hooks/use-authenticated-api', () => ({
  useAuthenticatedTables: jest.fn(),
  useMutation: jest.fn(),
}))

jest.mock('@/app/(dashboard)/tables/components/stat-cards', () => ({
  StatCards: () => <div data-testid="stat-cards" />,
}))

jest.mock('@/app/(dashboard)/tables/components/table-form-dialog', () => ({
  TableFormDialog: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock('@/app/(dashboard)/tables/components/success-alert', () => ({
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

const { useAuthenticatedTables, useMutation } = jest.requireMock('@/hooks/use-authenticated-api')

describe('TablesPage - conflito de exclusão', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('exibe alerta amigável quando exclusão retorna 409', async () => {
    const refetch = jest.fn()
    ;(useAuthenticatedTables as jest.Mock).mockReturnValue({
      data: [
        {
          id: 1,
          uuid: 'table-uuid',
          name: 'Mesa 1',
          identify: 'T1',
          capacity: 4,
          description: 'Perto da janela',
          created_at: new Date().toISOString(),
          created_at_formatted: '07/11/2025',
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
      message: 'Mesa não pode ser excluída, existe um pedido ativo ou não arquivado vinculado.',
    })

    ;(useMutation as jest.Mock)
      .mockReturnValueOnce({ mutate: mutateCreate, loading: false })
      .mockReturnValueOnce({ mutate: mutateUpdate, loading: false })
      .mockReturnValueOnce({ mutate: mutateDelete, loading: false })

    render(<TablesPage />)

    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /open menu/i }))
    await user.click(screen.getByText('Excluir'))
    await user.click(screen.getByRole('button', { name: /Excluir/i }))

    await waitFor(() => {
      expect(screen.getByText('Ação não permitida')).toBeInTheDocument()
      expect(
        screen.getByText('Mesa não pode ser excluída, existe um pedido ativo ou não arquivado vinculado.')
      ).toBeInTheDocument()
    })
  })
})


