import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, generateProduct } from '../utils/test-utils'
import ProductsPage from '@/app/(dashboard)/products/page'
import { useAuthenticatedProducts, useMutation } from '@/hooks/use-authenticated-api'

// Mock the hooks
const mockUseAuthenticatedProducts = useAuthenticatedProducts as jest.MockedFunction<typeof useAuthenticatedProducts>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>

describe('Product Edit Operations', () => {
  const mockProducts = [
    generateProduct({ 
      id: 1, 
      name: 'iPhone 14', 
      price: 999.99, 
      description: 'Latest iPhone model',
      qtd_stock: 50,
      category: 'Electronics',
      sku: 'IPH14-256',
      brand: 'Apple',
      is_active: true
    }),
    generateProduct({ 
      id: 2, 
      name: 'Samsung Galaxy S23', 
      price: 899.99,
      description: 'Samsung flagship phone',
      qtd_stock: 30,
      category: 'Electronics',
      sku: 'SAM-S23',
      brand: 'Samsung',
      is_active: true
    }),
  ]

  const mockMutate = jest.fn()
  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAuthenticatedProducts.mockReturnValue({
      data: mockProducts,
      loading: false,
      error: null,
      refetch: mockRefetch,
      isAuthenticated: true,
    })

    mockUseMutation.mockReturnValue({
      mutate: mockMutate,
      loading: false,
      error: null,
    })
  })

  describe('Opening Edit Dialog', () => {
    it('should open edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      // Find and click edit button for first product
      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      // Dialog should open with product data pre-filled
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })
    })

    it('should populate form fields with existing product data', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
        expect(screen.getByDisplayValue('999.99')).toBeInTheDocument()
        expect(screen.getByDisplayValue('50')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Latest iPhone model')).toBeInTheDocument()
      })
    })

    it('should show correct dialog title for edit mode', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByText(/edit.*product/i)).toBeInTheDocument()
      })
    })
  })

  describe('Editing Product Fields', () => {
    it('should update product name successfully', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      // Clear and type new name
      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      await user.type(nameInput, 'iPhone 14 Pro Max')
      
      // Submit form
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          '/api/product/1',
          'PUT',
          expect.objectContaining({
            name: 'iPhone 14 Pro Max'
          })
        )
        expect(mockRefetch).toHaveBeenCalled()
      })
    })

    it('should update product price successfully', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('999.99')).toBeInTheDocument()
      })

      // Update price
      const priceInput = screen.getByDisplayValue('999.99')
      await user.clear(priceInput)
      await user.type(priceInput, '1099.99')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          '/api/product/1',
          'PUT',
          expect.objectContaining({
            price: 1099.99
          })
        )
      })
    })

    it('should update product stock successfully', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('50')).toBeInTheDocument()
      })

      // Update stock
      const stockInput = screen.getByDisplayValue('50')
      await user.clear(stockInput)
      await user.type(stockInput, '75')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          '/api/product/1',
          'PUT',
          expect.objectContaining({
            qtd_stock: 75
          })
        )
      })
    })

    it('should update product description successfully', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('Latest iPhone model')).toBeInTheDocument()
      })

      const descInput = screen.getByDisplayValue('Latest iPhone model')
      await user.clear(descInput)
      await user.type(descInput, 'Updated description for iPhone')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          '/api/product/1',
          'PUT',
          expect.objectContaining({
            description: 'Updated description for iPhone'
          })
        )
      })
    })

    it('should update multiple fields at once', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      // Update multiple fields
      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      await user.type(nameInput, 'iPhone 15')

      const priceInput = screen.getByDisplayValue('999.99')
      await user.clear(priceInput)
      await user.type(priceInput, '1199.99')

      const stockInput = screen.getByDisplayValue('50')
      await user.clear(stockInput)
      await user.type(stockInput, '100')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          '/api/product/1',
          'PUT',
          expect.objectContaining({
            name: 'iPhone 15',
            price: 1199.99,
            qtd_stock: 100
          })
        )
      })
    })
  })

  describe('Image Update', () => {
    it('should update product with new image', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      // Upload new image
      const fileInput = screen.getByLabelText(/image/i)
      const file = new File(['new image'], 'new-product.jpg', { type: 'image/jpeg' })
      await user.upload(fileInput, file)
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          '/api/product/1',
          'PUT',
          expect.any(FormData)
        )
      })
    })

    it('should keep existing image when not uploading new one', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      // Just update name, no new image
      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      await user.type(nameInput, 'iPhone 14 Updated')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })
  })

  describe('Validation on Edit', () => {
    it('should not allow empty product name', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      // Clear name
      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/name.*required/i) || screen.getByText(/campo obrigatório/i)).toBeInTheDocument()
      })
    })

    it('should not allow negative price', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('999.99')).toBeInTheDocument()
      })

      // Enter negative price
      const priceInput = screen.getByDisplayValue('999.99')
      await user.clear(priceInput)
      await user.type(priceInput, '-50')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/price.*positive|preço.*positivo/i) || screen.getByText(/inválido/i)).toBeInTheDocument()
      })
    })

    it('should not allow negative stock', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('50')).toBeInTheDocument()
      })

      const stockInput = screen.getByDisplayValue('50')
      await user.clear(stockInput)
      await user.type(stockInput, '-10')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/stock.*positive|estoque.*positivo/i) || screen.getByText(/inválido/i)).toBeInTheDocument()
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when update fails', async () => {
      const user = userEvent.setup()
      const errorMessage = 'Failed to update product'
      mockMutate.mockRejectedValue(new Error(errorMessage))
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Name')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument()
      })
    })

    it('should handle network error gracefully', async () => {
      const user = userEvent.setup()
      mockMutate.mockRejectedValue(new Error('Network error'))
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/network error|erro de rede/i)).toBeInTheDocument()
      })
    })
  })

  describe('Cancel Edit', () => {
    it('should close dialog when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const cancelButton = screen.getByRole('button', { name: /cancel|cancelar/i })
      await user.click(cancelButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should not save changes when dialog is closed', async () => {
      const user = userEvent.setup()
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      // Make changes
      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      await user.type(nameInput, 'Changed Name')
      
      // Cancel
      const cancelButton = screen.getByRole('button', { name: /cancel|cancelar/i })
      await user.click(cancelButton)
      
      // Should not call mutate
      expect(mockMutate).not.toHaveBeenCalled()
    })
  })

  describe('Success Feedback', () => {
    it('should show success message after successful update', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true, message: 'Product updated successfully' })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      const nameInput = screen.getByDisplayValue('iPhone 14')
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Product')
      
      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.getByText(/success|sucesso/i)).toBeInTheDocument()
      })
    })

    it('should close dialog after successful update', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      })
    })

    it('should refresh product list after update', async () => {
      const user = userEvent.setup()
      mockMutate.mockResolvedValue({ success: true })
      
      render(<ProductsPage />)
      
      await waitFor(() => {
        expect(screen.getByText('iPhone 14')).toBeInTheDocument()
      })

      const editButtons = screen.getAllByRole('button', { name: /edit/i })
      await user.click(editButtons[0])
      
      await waitFor(() => {
        expect(screen.getByDisplayValue('iPhone 14')).toBeInTheDocument()
      })

      const saveButton = screen.getByRole('button', { name: /save|update/i })
      await user.click(saveButton)
      
      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
      })
    })
  })
})
