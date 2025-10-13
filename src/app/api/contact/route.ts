import { NextRequest, NextResponse } from 'next/server'
import { apiClient } from '@/lib/api-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { firstName, lastName, email, subject, message } = body

    // Validação básica
    if (!firstName || !lastName || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      )
    }

    // Enviar para o backend Laravel
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: `${firstName} ${lastName}`,
        email,
        subject,
        message,
        to_email: 'fabiosantana@gmail.com',
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao enviar mensagem')
    }

    return NextResponse.json(
      { message: 'Mensagem enviada com sucesso!' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Erro ao processar contato:', error)
    return NextResponse.json(
      { message: error.message || 'Erro ao enviar mensagem' },
      { status: 500 }
    )
  }
}
