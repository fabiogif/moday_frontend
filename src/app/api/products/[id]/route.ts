import { NextRequest, NextResponse } from 'next/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type')
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
    
    let response: Response
    
    if (contentType?.includes('multipart/form-data')) {
      // Para FormData (com arquivos), usar POST com _method=PUT
      const formData = await request.formData()
      
      // Garantir que _method=PUT está presente para Laravel method spoofing
      if (!formData.has('_method')) {
        formData.append('_method', 'PUT')
      }
      
      // Debug: Log dos dados recebidos na API Route PUT
      console.log('API Route PUT: FormData recebido:')
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value)
      }
      
      response = await fetch(`${backendUrl}/api/product/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Não definir Content-Type para FormData
        },
        body: formData,
      })
    } else {
      // Para JSON (dados simples), usar PUT direto
      const body = await request.json()
      
      response = await fetch(`${backendUrl}/api/product/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      })
    }

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Erro ao atualizar produto' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API route PUT:', error)
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Token não fornecido' }, { status: 401 })
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
    
    const response = await fetch(`${backendUrl}/api/product/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { message: error.message || 'Erro ao excluir produto' },
        { status: response.status }
      )
    }

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
