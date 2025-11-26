"use client"

import { Badge } from "@/components/ui/badge"
import { Lock, CheckCircle2, XCircle, Archive } from "lucide-react"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string | null | undefined
  className?: string
  showIcon?: boolean
  showDescription?: boolean
}

export function OrderStatusBadge({
  status,
  className,
  showIcon = true,
  showDescription = false,
}: OrderStatusBadgeProps) {
  if (!status) {
    return (
      <Badge variant="outline" className={className}>
        Sem status
      </Badge>
    )
  }

  const isFinal = isFinalStatus(status)
  const color = getStatusColor(status)
  const description = getStatusDescription(status)

  const getStatusIcon = () => {
    if (!showIcon) return null

    switch (status) {
      case "Entregue":
      case "Concluído":
        return <CheckCircle2 className="h-3 w-3" />
      case "Cancelado":
        return <XCircle className="h-3 w-3" />
      case "Arquivado":
        return <Archive className="h-3 w-3" />
      default:
        if (isFinal) {
          return <Lock className="h-3 w-3" />
        }
        return null
    }
  }

  const getVariant = () => {
    if (isFinal) {
      switch (status) {
        case "Entregue":
        case "Concluído":
          return "default"
        case "Cancelado":
          return "destructive"
        case "Arquivado":
          return "secondary"
        default:
          return "secondary"
      }
    }

    switch (color) {
      case "yellow":
        return "outline"
      case "blue":
        return "default"
      case "green":
        return "default"
      case "purple":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant={getVariant()}
        className={cn(
          "flex items-center gap-1.5",
          isFinal && "border-2",
          className
        )}
        title={showDescription ? undefined : description}
      >
        {getStatusIcon()}
        <span>{status}</span>
      </Badge>
      {showDescription && (
        <span className="text-xs text-muted-foreground">{description}</span>
      )}
    </div>
  )
}

// Re-exportar funções do utilitário para uso no componente
function getStatusColor(status: string | null | undefined): string {
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

function isFinalStatus(status: string | null | undefined): boolean {
  if (!status) return false
  const FINAL_STATUSES = ["Entregue", "Cancelado", "Concluído", "Arquivado"]
  return FINAL_STATUSES.includes(status)
}

function getStatusDescription(status: string | null | undefined): string {
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

