"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PDVMainLayoutProps {
  children: ReactNode
  className?: string
}

/**
 * Layout principal do PDV com duas colunas:
 * - Esquerda: Área do pedido (carrinho, totalizador, ações)
 * - Direita: Catálogo de produtos
 */
export function PDVMainLayout({ children, className }: PDVMainLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-[calc(100vh-4rem)] overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

interface PDVTwoColumnLayoutProps {
  leftColumn: ReactNode
  rightColumn: ReactNode
  className?: string
}

/**
 * Layout de duas colunas para o PDV
 * - Coluna Esquerda: Catálogo de produtos (60% da largura)
 * - Coluna Direita: Carrinho e pedido (40% da largura)
 */
export function PDVTwoColumnLayout({
  leftColumn,
  rightColumn,
  className,
}: PDVTwoColumnLayoutProps) {
  return (
    <div
      className={cn(
        "flex flex-1 gap-3 overflow-hidden min-h-0 p-3",
        className
      )}
    >
      {/* Coluna Esquerda: Catálogo de Produtos (60%) */}
      <section className="flex flex-col flex-[3] min-w-0 overflow-hidden min-h-0">
        {leftColumn}
      </section>

      {/* Coluna Direita: Carrinho e Pedido (40%) */}
      <aside className="flex flex-col flex-[2] min-w-0 overflow-hidden min-h-0 flex-shrink-0 border-l border-border/50 pl-3">
        {rightColumn}
      </aside>
    </div>
  )
}

