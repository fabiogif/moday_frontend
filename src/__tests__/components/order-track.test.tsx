import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { OrderTrack } from '@/app/store/[slug]/components/order-track'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

// Mock dependencies
jest.mock('@/lib/api-client')
jest.mock('sonner')

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>

describe('OrderTrack Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the component correctly', () => {
    render(<OrderTrack slug="test-store" />)
    
    expect(screen.getByText('Acompanhar Pedido')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('000.000.000-00')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('(00) 00000-0000')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Consultar Pedido/i })).toBeInTheDocument()
  })

  it('validates that at least CPF or phone is provided', async () => {
    render(<OrderTrack slug="test-store" />)
    
    const searchButton = screen.getByRole('button', { name: /Consultar Pedido/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Informe o CPF ou telefone para consultar')
    })
  })

  it('masks CPF input correctly', () => {
    render(<OrderTrack slug="test-store" />)
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00') as HTMLInputElement
    
    fireEvent.change(cpfInput, { target: { value: '12345678900' } })
    
    expect(cpfInput.value).toMatch(/\d{3}\.\d{3}\.\d{3}-\d{2}/)
  })

  it('masks phone input correctly', () => {
    render(<OrderTrack slug="test-store" />)
    
    const phoneInput = screen.getByPlaceholderText('(00) 00000-0000') as HTMLInputElement
    
    fireEvent.change(phoneInput, { target: { value: '11987654321' } })
    
    expect(phoneInput.value).toMatch(/\(\d{2}\) \d{5}-\d{4}/)
  })

  it('displays order data when found', async () => {
    const mockOrderData = {
      client_name: 'João',
      order_identify: 'abc123',
      order_date: '06/11/2025',
      order_time: '14:30',
      status: 'Em Preparo',
      is_delivery: true,
      total: 45.50,
      payment_method: 'Dinheiro',
      products: [
        { name: 'Pizza', quantity: 1, price: 35.00 },
        { name: 'Refrigerante', quantity: 1, price: 10.50 },
      ]
    }

    mockApiClient.get.mockResolvedValue({
      success: true,
      message: 'Pedido encontrado',
      data: mockOrderData,
    } as any)

    render(<OrderTrack slug="test-store" />)
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00')
    fireEvent.change(cpfInput, { target: { value: '12345678900' } })
    
    const searchButton = screen.getByRole('button', { name: /Consultar Pedido/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('#abc123')).toBeInTheDocument()
      expect(screen.getByText(/Olá, João!/)).toBeInTheDocument()
      expect(screen.getByText('Em Preparo')).toBeInTheDocument()
      expect(screen.getByText('Pizza')).toBeInTheDocument()
      expect(screen.getByText('Refrigerante')).toBeInTheDocument()
      expect(screen.getByText('Dinheiro')).toBeInTheDocument()
    })
  })

  it('displays error message when order not found', async () => {
    mockApiClient.get.mockRejectedValue({
      response: {
        data: {
          message: 'Nenhum pedido em andamento foi encontrado para este CPF/telefone.'
        }
      }
    })

    render(<OrderTrack slug="test-store" />)
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00')
    fireEvent.change(cpfInput, { target: { value: '12345678900' } })
    
    const searchButton = screen.getByRole('button', { name: /Consultar Pedido/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        'Nenhum pedido em andamento foi encontrado para este CPF/telefone.'
      )
    })
  })

  it('shows loading state during search', async () => {
    mockApiClient.get.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        success: true,
        data: null,
      } as any), 100))
    )

    render(<OrderTrack slug="test-store" />)
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00')
    fireEvent.change(cpfInput, { target: { value: '12345678900' } })
    
    const searchButton = screen.getByRole('button', { name: /Consultar Pedido/i })
    fireEvent.click(searchButton)

    expect(screen.getByText('Consultando...')).toBeInTheDocument()
  })

  it('displays delivery badge when order is for delivery', async () => {
    const mockOrderData = {
      client_name: 'Maria',
      order_identify: 'xyz789',
      order_date: '06/11/2025',
      order_time: '15:00',
      status: 'Pronto',
      is_delivery: true,
      total: 30.00,
      payment_method: 'Cartão',
      products: []
    }

    mockApiClient.get.mockResolvedValue({
      success: true,
      data: mockOrderData,
    } as any)

    render(<OrderTrack slug="test-store" />)
    
    const cpfInput = screen.getByPlaceholderText('000.000.000-00')
    fireEvent.change(cpfInput, { target: { value: '12345678900' } })
    
    const searchButton = screen.getByRole('button', { name: /Consultar Pedido/i })
    fireEvent.click(searchButton)

    await waitFor(() => {
      expect(screen.getByText('Pedido com entrega')).toBeInTheDocument()
    })
  })
})

