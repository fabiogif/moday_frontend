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
  "Aceito",
  "Preparo",
  "Entrega",
] as const

export type IntermediateStatus = (typeof INTERMEDIATE_STATUSES)[number]

export type OrderStatus = FinalStatus | IntermediateStatus | string

function normalizeStatusName(statusName: string | null | undefined): string {
  if (!statusName) return ""
  const normalized = statusName.trim()
  if (normalized.includes("/")) {
    return normalized.split("/")[0].trim()
  }
  return normalized
}

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
  const allowedStatuses: string[] = [
    "Entrega",
    "Em Entrega",
    "Pronto",
    "Pronto para Expedição",
    "Aguardando Entregador",
  ]
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
    case "Aceito":
      return "indigo"
    case "Preparo":
    case "Preparando":
    case "Em Preparação":
      return "blue"
    case "Entrega":
    case "Pronto":
    case "Pronto para Expedição":
    case "Aguardando Entregador":
    case "Em Entrega":
      return "violet"
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
    Pendente: "Aguardando aceite",
    Aceito: "Pedido aceito",
    Preparo: "Em preparação",
    Entrega: "Em entrega ou aguardando retirada",
    Preparando: "Em preparação",
    "Em Preparação": "Em preparação",
    Pronto: "Pronto para entrega/retirada",
    "Pronto para Expedição": "Pronto para expedição ou retirada",
    "Aguardando Entregador": "Aguardando coleta pelo entregador",
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

  const normalized = normalizeStatusName(currentStatus)

  const flowPatterns: Record<string, string[]> = {
    Pendente: ["Aceito"],
    Aceito: ["Preparo"],
    Preparo: ["Entrega"],
    Entrega: ["Concluído"],
    "Pedido Recebido": ["Aceito", "Confirmado"],
    Confirmado: ["Preparo", "Em Preparação"],
    "Em Preparação": ["Entrega", "Pronto para Expedição"],
    "Pronto para Expedição": isDelivery
      ? ["Entrega", "Aguardando Entregador"]
      : ["Concluído"],
    Pronto: isDelivery
      ? ["Entrega", "Em Entrega"]
      : ["Concluído"],
    "Aguardando Entregador": ["Entrega", "Em Entrega"],
    "Em Entrega": ["Concluído"],
  }

  const candidates = flowPatterns[normalized]
  if (candidates?.length) {
    return candidates[0]
  }

  const legacyFlow: Record<string, string> = {
    Pendente: "Aceito",
    Aceito: "Preparo",
    Preparo: "Entrega",
    Entrega: "Concluído",
    Preparando: "Preparo",
    Pronto: isDelivery ? "Entrega" : "Concluído",
    "Em Entrega": "Concluído",
  }

  return legacyFlow[currentStatus] || legacyFlow[normalized] || null
}

/**
 * Obtém o nome amigável do próximo status
 */
export function getNextStatusName(
  currentStatus: string | null | undefined,
  isDelivery: boolean = false
): string | null {
  const nextStatus = getNextStatus(currentStatus, isDelivery)
  return nextStatus
}
