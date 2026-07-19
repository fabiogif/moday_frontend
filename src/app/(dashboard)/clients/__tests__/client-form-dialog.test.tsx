import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClientFormDialog } from '../components/client-form-dialog'

jest.mock('@/hooks/use-location', () => ({
  useStates: () => ({ states: [], loading: false, error: null, refresh: jest.fn() }),
  useCitiesByState: () => ({ cities: [], loading: false, error: null, refresh: jest.fn() }),
  useSearchCities: () => ({ cities: [], loading: false, error: null }),
}))

jest.mock('@/hooks/use-viacep', () => ({
  useViaCEP: () => ({ loading: false, searchCEP: jest.fn() }),
}))

describe('ClientFormDialog - wizard de passos', () => {
  const setup = () => {
    const onAddClient = jest.fn().mockResolvedValue(undefined)
    const onOpenChange = jest.fn()
    render(
      <ClientFormDialog
        onAddClient={onAddClient}
        onEditClient={jest.fn()}
        editingClient={null}
        open={true}
        onOpenChange={onOpenChange}
        hideTrigger
      />
    )
    return { onAddClient, onOpenChange }
  }

  test('renders only step 1 fields on open', () => {
    setup()

    expect(screen.getByLabelText(/Nome Completo/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/Logradouro/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/Cliente Ativo/i)).not.toBeInTheDocument()
  })

  test('does not advance to step 2 when required fields are invalid', async () => {
    const user = userEvent.setup()
    setup()

    await user.click(screen.getByRole('button', { name: /Continuar/i }))

    expect(await screen.findAllByText(/obrigatório/i)).not.toHaveLength(0)
    expect(screen.queryByLabelText(/Logradouro/i)).not.toBeInTheDocument()
  })

  test('advances to step 2 and submits collected data', async () => {
    const user = userEvent.setup()
    const { onAddClient } = setup()

    await user.type(screen.getByLabelText(/Nome Completo/i), 'Maria Souza')
    await user.type(screen.getByLabelText(/^CPF \*/i), '52998224725')
    await user.type(screen.getByLabelText(/^Email \*/i), 'maria@example.com')
    await user.type(screen.getByLabelText(/^Telefone \*/i), '11987654321')
    await user.click(screen.getByRole('button', { name: /Continuar/i }))

    expect(await screen.findByText(/Cliente Ativo/i)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /Criar Cliente/i }))

    expect(onAddClient).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Maria Souza',
        email: 'maria@example.com',
      })
    )
  })

  test('goes back to step 1 preserving data', async () => {
    const user = userEvent.setup()
    setup()

    await user.type(screen.getByLabelText(/Nome Completo/i), 'Carlos Lima')
    await user.type(screen.getByLabelText(/^CPF \*/i), '52998224725')
    await user.type(screen.getByLabelText(/^Email \*/i), 'carlos@example.com')
    await user.type(screen.getByLabelText(/^Telefone \*/i), '11987654321')
    await user.click(screen.getByRole('button', { name: /Continuar/i }))

    expect(await screen.findByText(/Cliente Ativo/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Voltar/i }))

    const nameInput = await screen.findByLabelText(/Nome Completo/i)
    expect(nameInput).toHaveValue('Carlos Lima')
  })
})
