export type OrderTrackerStatus =
  | 'Pendente'
  | 'Aceito'
  | 'Preparo'
  | 'Entrega'
  | 'Concluído'
  | 'Cancelado'
  | string

/** Índices alinhados ao tracker: Pendente → Aceito → Preparo → Entrega → Concluído */
const STATUS_STEP_INDEX: Record<string, number> = {
  Pendente: 0,
  'Pedido Recebido': 0,
  Aceito: 1,
  Confirmado: 1,
  Preparo: 2,
  'Em Preparo': 2,
  'Em Preparação': 2,
  Preparando: 2,
  Entrega: 3,
  Pronto: 3,
  'Pronto para Expedição': 3,
  'Saiu para entrega': 3,
  'Aguardando Entregador': 3,
  'A Caminho': 3,
  'Em Entrega': 3,
  Concluído: 4,
  Entregue: 4,
}

export function resolveOrderStatusStepIndex(status: string): number {
  const exact = STATUS_STEP_INDEX[status]
  if (exact !== undefined) {
    return exact
  }

  const normalized = status.toLowerCase()

  if (normalized.includes('cancel')) {
    return -1
  }
  if (normalized.includes('conclu') || normalized === 'entregue') {
    return 4
  }
  if (
    normalized.includes('entrega') ||
    normalized.includes('caminho') ||
    normalized.includes('rota') ||
    normalized.includes('expedi') ||
    normalized.includes('pronto') ||
    normalized.includes('aguardando')
  ) {
    return 3
  }
  if (normalized.includes('prepar')) {
    return 2
  }
  if (normalized.includes('aceit') || normalized.includes('confirm')) {
    return 1
  }
  if (normalized.includes('pendente') || normalized.includes('receb')) {
    return 0
  }

  return 0
}

export function isCancelledOrderStatus(status: string): boolean {
  return status.toLowerCase().includes('cancel')
}

export function isTerminalOrderStatus(status: string): boolean {
  const normalized = status.toLowerCase()
  return (
    normalized.includes('conclu') ||
    normalized === 'entregue' ||
    normalized.includes('cancel') ||
    normalized.includes('arquiv')
  )
}
