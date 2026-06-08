export type OrderTrackerStatus =
  | 'Em Preparo'
  | 'Pronto'
  | 'Saiu para entrega'
  | 'A Caminho'
  | 'Entregue'
  | 'Concluído'
  | 'Cancelado'
  | string

const STATUS_STEP_INDEX: Record<string, number> = {
  'Pedido Recebido': 0,
  Confirmado: 0,
  'Em Preparo': 0,
  'Em Preparação': 0,
  Pronto: 1,
  'Pronto para Expedição': 1,
  'Saiu para entrega': 2,
  'Aguardando Entregador': 2,
  'A Caminho': 3,
  'Em Entrega': 3,
  Entregue: 4,
  Concluído: 4,
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
  if (normalized.includes('entreg') || normalized.includes('conclu')) {
    return 4
  }
  if (normalized.includes('caminho') || normalized.includes('rota') || normalized.includes('expedi')) {
    return 3
  }
  if (normalized.includes('aguardando')) {
    return 2
  }
  if (normalized.includes('pronto')) {
    return 1
  }
  if (normalized.includes('prepar') || normalized.includes('receb') || normalized.includes('confirm')) {
    return 0
  }

  return 0
}

export function isCancelledOrderStatus(status: string): boolean {
  return resolveOrderStatusStepIndex(status) === -1
}
