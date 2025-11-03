import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BankAccountForm } from '@/app/dashboard/contas-bancarias/components/bank-account-form'
import api from '@/lib/api-client'
import { toast } from 'sonner'

jest.mock('@/lib/api-client')
jest.mock('sonner')

const mockBanks = [
  { code: '001', name: 'Banco do Brasil', full_name: 'Banco do Brasil S.A.', supports_pix: true },
  { code: '260', name: 'Nubank', full_name: 'Nu Pagamentos S.A.', supports_pix: true },
]

describe('BankAccountForm', () => {
  const mockOnClose = jest.fn()
  const mockOnSuccess = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.get as jest.Mock).mockResolvedValue({
      success: true,
      data: mockBanks,
    })
  })

  it('renders form title for new account', () => {
    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('Nova Conta Bancária')).toBeInTheDocument()
  })

  it('renders form title for editing account', () => {
    const mockAccount = {
      uuid: '123',
      account_type: 'checking',
      bank_name: 'Banco do Brasil',
      is_primary: false,
    } as any

    render(
      <BankAccountForm
        open={true}
        account={mockAccount}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByText('Editar Conta Bancária')).toBeInTheDocument()
  })

  it('loads banks on mount', async () => {
    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/api/bank-accounts/banks')
    })
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Cadastrar')).toBeInTheDocument()
    })

    const submitButton = screen.getByText('Cadastrar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockResolvedValue({ success: true })

    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByLabelText(/Banco/)).toBeInTheDocument()
    })

    // Preencher formulário
    const bankSelect = screen.getByRole('combobox', { name: /Banco/ })
    await user.click(bankSelect)
    await user.click(screen.getByText('001 - Banco do Brasil'))

    const agencyInput = screen.getByPlaceholderText('0001')
    await user.type(agencyInput, '1234')

    const accountInput = screen.getByPlaceholderText('12345678')
    await user.type(accountInput, '87654321')

    const digitInput = screen.getByPlaceholderText('0')
    await user.type(digitInput, '9')

    const holderInput = screen.getByPlaceholderText(/Nome completo/)
    await user.type(holderInput, 'Restaurant ABC')

    const docInput = screen.getByPlaceholderText(/00.000/)
    await user.type(docInput, '12345678000101')

    // Submeter
    const submitButton = screen.getByText('Cadastrar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith(
        '/api/bank-accounts',
        expect.objectContaining({
          bank_code: '001',
          agency: '1234',
          account_number: '87654321',
          account_digit: '9',
        })
      )
      expect(toast.success).toHaveBeenCalledWith('Conta bancária cadastrada com sucesso!')
      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  it('formats CPF/CNPJ with mask', async () => {
    const user = userEvent.setup()
    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/00.000/)).toBeInTheDocument()
    })

    const docInput = screen.getByPlaceholderText(/00.000/)
    await user.type(docInput, '12345678000101')

    expect(docInput).toHaveValue('12.345.678/0001-01')
  })

  it('disables PIX key input when type not selected', () => {
    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const pixKeyInput = screen.getByPlaceholderText('Digite a chave PIX')
    expect(pixKeyInput).toBeDisabled()
  })

  it('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    const cancelButton = screen.getByText('Cancelar')
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalled()
  })

  it('handles API error gracefully', async () => {
    const user = userEvent.setup()
    ;(api.post as jest.Mock).mockRejectedValue({
      message: 'Erro de validação',
    })

    render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      expect(screen.getByText('Cadastrar')).toBeInTheDocument()
    })

    // Preencher e submeter
    const submitButton = screen.getByText('Cadastrar')
    await user.click(submitButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })

  it('shows primary checkbox for new accounts only', () => {
    const { rerender } = render(
      <BankAccountForm
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.getByLabelText(/Definir como conta principal/)).toBeInTheDocument()

    // Rerender com account (edição)
    rerender(
      <BankAccountForm
        open={true}
        account={mockAccounts[0]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    expect(screen.queryByLabelText(/Definir como conta principal/)).not.toBeInTheDocument()
  })

  it('disables bank/account fields when editing', async () => {
    (api.get as jest.Mock).mockImplementation((url: string) => {
      if (url === '/api/bank-accounts/banks') {
        return Promise.resolve({ success: true, data: mockBanks })
      }
      if (url.includes('/api/bank-accounts/123-456')) {
        return Promise.resolve({ 
          success: true, 
          data: {
            ...mockAccounts[0],
            account_number: '12345678',
            account_digit: '9',
            account_holder_document: '12345678000101',
          }
        })
      }
      return Promise.resolve({ success: true, data: [] })
    })

    render(
      <BankAccountForm
        open={true}
        account={mockAccounts[0]}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    )

    await waitFor(() => {
      const agencyInput = screen.getByPlaceholderText('0001')
      expect(agencyInput).toBeDisabled()
    })
  })
})

