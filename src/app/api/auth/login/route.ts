import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Fazer requisição para o backend Laravel
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'

    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    // ))

    if (!response.ok) {
      let errorMessage = 'Erro ao fazer login'
      let errors: Record<string, string[]> = {}
      
      try {
        const error = await response.json()

        // Tratar diferentes estruturas de erro do backend
        if (error.errors) {
          // Erro de validação (422) - mostrar erros específicos dos campos
          errors = error.errors
          errorMessage = 'Dados inválidos'
        } else if (error.message) {
          // Erro com mensagem específica
          errorMessage = error.message
        } else {
          errorMessage = `Erro ${response.status}: ${response.statusText}`
        }
      } catch (parseError) {

        errorMessage = `Erro ${response.status}: ${response.statusText}`
      }

      return NextResponse.json(
        { 
          message: errorMessage,
          errors: errors
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Ajustar para a estrutura de resposta do backend (ApiResponseClass)
    const responseData = {
      user: data.data.user,
      token: data.data.token,
    }
    
    return NextResponse.json(responseData)
  } catch (error) {

    return NextResponse.json(
      { 
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
