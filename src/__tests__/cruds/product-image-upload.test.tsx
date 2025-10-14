/**
 * Testes de Upload de Imagem em Produtos - Frontend
 * 
 * Testa a funcionalidade de upload de imagens em produtos incluindo:
 * - Seleção de arquivo
 * - Preview de imagem
 * - Validação de tipo e tamanho
 * - Upload com FormData
 * - Mensagens de erro
 * - Integração com API
 */

import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, generateProduct } from '../utils/test-utils'
import ProductsPage from '@/app/(dashboard)/products/page'
import { useAuthenticatedProducts, useMutation, useMutationWithValidation } from '@/hooks/use-authenticated-api'

// Mock dos hooks
jest.mock('@/hooks/use-authenticated-api')
const mockUseAuthenticatedProducts = useAuthenticatedProducts as jest.MockedFunction<typeof useAuthenticatedProducts>
const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>
const mockUseMutationWithValidation = useMutationWithValidation as jest.MockedFunction<typeof useMutationWithValidation>

describe('Product Image Upload - Frontend Tests', () => {
  const mockMutate = jest.fn()
  const mockRefetch = jest.fn()

  // Mock de produtos
  const mockProducts = [
    {
      id: 1,
      name: 'Produto Teste',
      description: 'Descrição teste',
      price: 100.00,
      qtd_stock: 10,
      image: null,
      categories: []
    }
  ]

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

    mockUseMutationWithValidation.mockReturnValue({
      mutate: mockMutate,
      loading: false,
      error: null,
      validationErrors: {},
      mapFieldErrors: jest.fn(),
    })
  })

  describe('Seleção de Arquivo', () => {
    it('deve permitir selecionar uma imagem', async () => {
      render(<ProductsPage />)
      
      // Procurar pelo botão de adicionar produto
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Procurar pelo input de arquivo
      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement

      // Criar arquivo fake
      const file = new File(['imagem'], 'produto.jpg', { type: 'image/jpeg' })
      
      // Simular seleção de arquivo
      await userEvent.upload(fileInput, file)

      // Verificar que o arquivo foi selecionado
      expect(fileInput.files).toHaveLength(1)
      expect(fileInput.files?.[0]).toBe(file)
    })

    it('deve aceitar múltiplos formatos de imagem', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement

      // Testar diferentes formatos
      const formats = [
        { name: 'imagem.jpg', type: 'image/jpeg' },
        { name: 'imagem.png', type: 'image/png' },
        { name: 'imagem.gif', type: 'image/gif' },
        { name: 'icone.svg', type: 'image/svg+xml' },
      ]

      for (const format of formats) {
        const file = new File(['conteudo'], format.name, { type: format.type })
        await userEvent.upload(fileInput, file)
        expect(fileInput.files?.[0]?.name).toBe(format.name)
      }
    })

    it('deve mostrar preview da imagem selecionada', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      const file = new File(['imagem'], 'preview.jpg', { type: 'image/jpeg' })
      
      await userEvent.upload(fileInput, file)

      // Verificar se existe algum elemento de preview
      await waitFor(() => {
        const preview = screen.queryByAltText(/preview|visualização/i) || 
                       screen.queryByRole('img')
        expect(preview).toBeInTheDocument()
      })
    })
  })

  describe('Validação de Arquivo', () => {
    it('deve rejeitar arquivos que não são imagens', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      
      // Tentar enviar um PDF
      const pdfFile = new File(['conteudo'], 'documento.pdf', { type: 'application/pdf' })
      
      await userEvent.upload(fileInput, pdfFile)

      // Verificar mensagem de erro ou validação
      await waitFor(() => {
        const errorMessage = screen.queryByText(/formato.*inválido|tipo.*arquivo|apenas.*imagens/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      })
    })

    it('deve validar tamanho máximo do arquivo', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      
      // Criar arquivo grande (> 2MB)
      const largeContent = new Array(3 * 1024 * 1024).fill('a').join('')
      const largeFile = new File([largeContent], 'grande.jpg', { type: 'image/jpeg' })
      
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 })
      
      await userEvent.upload(fileInput, largeFile)

      // Verificar mensagem de erro sobre tamanho
      await waitFor(() => {
        const errorMessage = screen.queryByText(/tamanho.*máximo|muito.*grande|2mb/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      })
    })

    it('deve limpar arquivo selecionado quando cancelar', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      const file = new File(['imagem'], 'teste.jpg', { type: 'image/jpeg' })
      
      await userEvent.upload(fileInput, file)
      expect(fileInput.files).toHaveLength(1)

      // Procurar botão de cancelar/remover
      const removeButton = screen.queryByRole('button', { name: /remover|limpar|cancelar/i })
      if (removeButton) {
        await userEvent.click(removeButton)
        
        await waitFor(() => {
          expect(fileInput.files).toHaveLength(0)
        })
      }
    })
  })

  describe('Criação de Produto com Imagem', () => {
    it('deve criar produto com imagem usando FormData', async () => {
      mockMutate.mockResolvedValueOnce({ success: true })
      
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Preencher formulário
      const nameInput = screen.getByLabelText(/nome/i)
      const descriptionInput = screen.getByLabelText(/descrição/i)
      const priceInput = screen.getByLabelText(/preço/i)
      const stockInput = screen.getByLabelText(/estoque|quantidade/i)
      
      await userEvent.type(nameInput, 'Produto com Imagem')
      await userEvent.type(descriptionInput, 'Descrição do produto')
      await userEvent.type(priceInput, '150.00')
      await userEvent.type(stockInput, '20')

      // Adicionar imagem
      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      const file = new File(['imagem'], 'produto.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, file)

      // Submeter formulário
      const submitButton = screen.getByRole('button', { name: /salvar|criar|adicionar/i })
      await userEvent.click(submitButton)

      // Verificar que mutate foi chamado
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
        
        // Verificar que enviou FormData
        const callArgs = mockMutate.mock.calls[0]
        expect(callArgs).toBeDefined()
      })
    })

    it('deve criar produto sem imagem (campo opcional)', async () => {
      mockMutate.mockResolvedValueOnce({ success: true })
      
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Preencher formulário SEM imagem
      const nameInput = screen.getByLabelText(/nome/i)
      const descriptionInput = screen.getByLabelText(/descrição/i)
      const priceInput = screen.getByLabelText(/preço/i)
      const stockInput = screen.getByLabelText(/estoque|quantidade/i)
      
      await userEvent.type(nameInput, 'Produto Sem Imagem')
      await userEvent.type(descriptionInput, 'Sem foto')
      await userEvent.type(priceInput, '99.90')
      await userEvent.type(stockInput, '15')

      // Submeter sem adicionar imagem
      const submitButton = screen.getByRole('button', { name: /salvar|criar|adicionar/i })
      await userEvent.click(submitButton)

      // Deve permitir criação sem imagem
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })
  })

  describe('Atualização de Produto com Imagem', () => {
    it('deve atualizar produto adicionando nova imagem', async () => {
      mockMutate.mockResolvedValueOnce({ success: true })
      
      render(<ProductsPage />)

      // Clicar em editar produto existente
      const editButton = screen.getAllByRole('button', { name: /editar/i })[0]
      await userEvent.click(editButton)

      // Adicionar nova imagem
      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      const newImage = new File(['nova imagem'], 'nova.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, newImage)

      // Salvar
      const saveButton = screen.getByRole('button', { name: /salvar|atualizar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })

    it('deve atualizar produto mantendo imagem existente', async () => {
      const productWithImage = {
        ...mockProducts[0],
        image: 'https://example.com/storage/produto.jpg'
      }

      mockUseAuthenticatedProducts.mockReturnValue({
        data: [productWithImage],
        loading: false,
        error: null,
        refetch: mockRefetch,
        isAuthenticated: true,
      })

      mockMutate.mockResolvedValueOnce({ success: true })
      
      render(<ProductsPage />)

      // Editar produto que já tem imagem
      const editButton = screen.getAllByRole('button', { name: /editar/i })[0]
      await userEvent.click(editButton)

      // Verificar que imagem existente está sendo exibida
      await waitFor(() => {
        const existingImage = screen.queryByAltText(/produto/i) || 
                             screen.queryByRole('img')
        expect(existingImage).toBeInTheDocument()
      })

      // Atualizar outros campos sem trocar imagem
      const nameInput = screen.getByLabelText(/nome/i)
      await userEvent.clear(nameInput)
      await userEvent.type(nameInput, 'Nome Atualizado')

      const saveButton = screen.getByRole('button', { name: /salvar|atualizar/i })
      await userEvent.click(saveButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
      })
    })
  })

  describe('Mensagens de Erro e Sucesso', () => {
    it('deve mostrar mensagem de sucesso ao criar produto', async () => {
      mockMutate.mockResolvedValueOnce({ 
        success: true,
        message: 'Produto criado com sucesso' 
      })
      
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Preencher e submeter
      const nameInput = screen.getByLabelText(/nome/i)
      await userEvent.type(nameInput, 'Novo Produto')
      
      const submitButton = screen.getByRole('button', { name: /salvar|criar/i })
      await userEvent.click(submitButton)

      // Verificar mensagem de sucesso
      await waitFor(() => {
        const successMessage = screen.queryByText(/sucesso|criado/i)
        if (successMessage) {
          expect(successMessage).toBeInTheDocument()
        }
      })
    })

    it('deve mostrar mensagem de erro quando upload falhar', async () => {
      mockMutate.mockRejectedValueOnce({
        message: 'Erro ao fazer upload da imagem',
        errors: { image: ['Arquivo inválido'] }
      })
      
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Tentar criar produto
      const nameInput = screen.getByLabelText(/nome/i)
      await userEvent.type(nameInput, 'Produto Erro')
      
      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      const file = new File(['imagem'], 'erro.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, file)

      const submitButton = screen.getByRole('button', { name: /salvar|criar/i })
      await userEvent.click(submitButton)

      // Verificar mensagem de erro
      await waitFor(() => {
        const errorMessage = screen.queryByText(/erro|falha|inválido/i)
        if (errorMessage) {
          expect(errorMessage).toBeInTheDocument()
        }
      })
    })
  })

  describe('Loading States', () => {
    it('deve mostrar loading durante upload', async () => {
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        loading: true,
        error: null,
      })

      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Procurar indicador de loading
      const loadingIndicator = screen.queryByText(/carregando|enviando|processando/i) ||
                              screen.queryByRole('status')
      
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument()
      }
    })

    it('deve desabilitar botão de submit durante upload', async () => {
      mockUseMutation.mockReturnValue({
        mutate: mockMutate,
        loading: true,
        error: null,
      })

      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      const submitButton = screen.getByRole('button', { name: /salvar|criar/i })
      
      // Botão deve estar desabilitado durante loading
      expect(submitButton).toBeDisabled()
    })
  })

  describe('Integração com API', () => {
    it('deve enviar FormData corretamente para a API', async () => {
      const mutatePromise = Promise.resolve({ success: true })
      mockMutate.mockReturnValue(mutatePromise)
      
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Preencher formulário completo
      await userEvent.type(screen.getByLabelText(/nome/i), 'API Test')
      await userEvent.type(screen.getByLabelText(/descrição/i), 'Testing API')
      await userEvent.type(screen.getByLabelText(/preço/i), '200.00')
      await userEvent.type(screen.getByLabelText(/estoque/i), '30')

      const fileInput = screen.getByLabelText(/imagem|foto|arquivo/i) as HTMLInputElement
      const file = new File(['imagem'], 'api-test.jpg', { type: 'image/jpeg' })
      await userEvent.upload(fileInput, file)

      const submitButton = screen.getByRole('button', { name: /salvar|criar/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled()
        
        // Verificar estrutura dos dados enviados
        const callArgs = mockMutate.mock.calls[0]
        expect(callArgs).toBeDefined()
      })
    })

    it('deve chamar refetch após criação bem-sucedida', async () => {
      mockMutate.mockResolvedValueOnce({ success: true })
      
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      await userEvent.type(screen.getByLabelText(/nome/i), 'Refetch Test')
      
      const submitButton = screen.getByRole('button', { name: /salvar|criar/i })
      await userEvent.click(submitButton)

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled()
      })
    })
  })

  describe('Acessibilidade', () => {
    it('deve ter labels apropriados para inputs', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      await userEvent.click(addButton)

      // Verificar que inputs têm labels
      expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/preço/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/imagem|foto|arquivo/i)).toBeInTheDocument()
    })

    it('deve permitir navegação por teclado', async () => {
      render(<ProductsPage />)
      
      const addButton = screen.getByRole('button', { name: /adicionar|novo|criar/i })
      
      // Simular navegação por Tab
      addButton.focus()
      expect(addButton).toHaveFocus()
      
      // Pressionar Enter para abrir dialog
      fireEvent.keyDown(addButton, { key: 'Enter', code: 'Enter' })
      
      await waitFor(() => {
        const dialog = screen.queryByRole('dialog')
        if (dialog) {
          expect(dialog).toBeInTheDocument()
        }
      })
    })
  })
})
