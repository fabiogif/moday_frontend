/**
 * Utilitários para gerenciamento de status de pedidos
 */

// Status finais que não podem ser editados
export const FINAL_STATUSES = [
  "Entregue",
  "Cancelado",
  "Concluído",
  "Arquivado",
] as const

export type FinalStatus = (typeof FINAL_STATUSES)[number]

// Status intermediários
export const INTERMEDIATE_STATUSES = [
  "Pendente",
  "Preparando",
  "Pronto",
  "Em Entrega",
] as const

export type IntermediateStatus = (typeof INTERMEDIATE_STATUSES)[number]

export type OrderStatus = FinalStatus | IntermediateStatus | string

/**
 * Verifica se um status é final (não pode ser editado)
 */
export function isFinalStatus(
  status: string | null | undefined
): status is FinalStatus {
  if (!status) return false
  return FINAL_STATUSES.includes(status as FinalStatus)
}

/**
 * Verifica se um status permite edição
 */
export function canEditOrder(
  status: string | null | undefined
): boolean {
  return !isFinalStatus(status)
}

/**
 * Verifica se um status permite avançar
 */
export function canAdvanceStatus(
  status: string | null | undefined
): boolean {
  if (!status) return false
  if (isFinalStatus(status)) return false
  if (status === "Entregue") return false
  return true
}

/**
 * Verifica se um status permite finalizar
 */
export function canFinalizeOrder(
  status: string | null | undefined
): boolean {
  if (!status) return false
  const allowedStatuses: string[] = ["Pronto", "Em Entrega"]
  return allowedStatuses.includes(status) && !isFinalStatus(status)
}

/**
 * Verifica se um status permite cancelar
 */
export function canCancelOrder(
  status: string | null | undefined
): boolean {
  if (!status) return true
  // Pode cancelar se não for final, ou se já estiver cancelado (para reabrir)
  return !isFinalStatus(status) || status === "Cancelado"
}

/**
 * Obtém a cor do badge baseado no status
 */
export function getStatusColor(status: string | null | undefined): string {
  if (!status) return "default"

  switch (status) {
    case "Pendente":
      return "yellow"
    case "Preparando":
      return "blue"
    case "Pronto":
      return "green"
    case "Em Entrega":
      return "purple"
    case "Entregue":
    case "Concluído":
      return "emerald"
    case "Cancelado":
      return "red"
    case "Arquivado":
      return "gray"
    default:
      return "default"
  }
}

/**
 * Obtém a descrição do status
 */
export function getStatusDescription(
  status: string | null | undefined
): string {
  if (!status) return "Status desconhecido"

  const descriptions: Record<string, string> = {
    Pendente: "Aguardando processamento",
    Preparando: "Em preparação",
    Pronto: "Pronto para entrega/retirada",
    "Em Entrega": "Saiu para entrega",
    Entregue: "Pedido entregue",
    Concluído: "Pedido concluído",
    Cancelado: "Pedido cancelado",
    Arquivado: "Pedido arquivado",
  }

  return descriptions[status] || status
}

/**
 * Obtém o próximo status possível baseado no status atual
 */
export function getNextStatus(
  currentStatus: string | null | undefined,
  isDelivery: boolean = false
): string | null {
  if (!currentStatus) return null
  if (isFinalStatus(currentStatus)) return null

  const statusFlow: Record<string, string> = {
    Pendente: "Preparando",
    Preparando: "Pronto",
    Pronto: isDelivery ? "Em Entrega" : "Entregue",
    "Em Entrega": "Entregue",
  }

  return statusFlow[currentStatus] || null
}

/**
 * Obtém o nome amigável do próximo status
 */
export function getNextStatusName(
  currentStatus: string | null | undefined,
  isDelivery: boolean = false
): string | null {
  const nextStatus = getNextStatus(currentStatus, isDelivery)
  if (!nextStatus) return null

  const statusNames: Record<string, string> = {
    Preparando: "Preparando",
    Pronto: "Pronto",
    "Em Entrega": "Em Entrega",
    Entregue: "Entregue",
  }

  return statusNames[nextStatus] || nextStatus
}

