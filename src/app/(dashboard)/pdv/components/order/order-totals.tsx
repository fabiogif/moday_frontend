"use client"

import { useMemo } from "react"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface OrderTotalsProps {
  subtotal: number
  taxes?: number
  discounts?: number
  formatCurrency: (value: number) => string
  className?: string
}

export function OrderTotals({
  subtotal,
  taxes = 0,
  discounts = 0,
  formatCurrency,
  className,
}: OrderTotalsProps) {
  const finalTotal = useMemo(() => {
    return subtotal + taxes - discounts
  }, [subtotal, taxes, discounts])

  return (
    <div className={cn("space-y-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700", className)}>
      <div className="flex items-center justify-between text-sm pb-2 border-b-2 border-gray-300 dark:border-gray-600">
        <span className="text-muted-foreground font-medium">Subtotal:</span>
        <span className="font-semibold">{formatCurrency(subtotal)}</span>
      </div>

      {discounts > 0 && (
        <div className="flex items-center justify-between text-sm text-red-600 dark:text-red-400 pb-2 border-b-2 border-gray-300 dark:border-gray-600">
          <span className="font-medium">Descontos:</span>
          <span className="font-semibold">-{formatCurrency(discounts)}</span>
        </div>
      )}

      {taxes > 0 && (
        <div className="flex items-center justify-between text-sm pb-2 border-b-2 border-gray-300 dark:border-gray-600">
          <span className="text-muted-foreground font-medium">Impostos:</span>
          <span className="font-semibold">{formatCurrency(taxes)}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t-2 border-gray-400 dark:border-gray-500">
        <span className="text-lg font-bold">Total:</span>
        <span className="text-2xl font-bold text-primary">
          {formatCurrency(finalTotal)}
        </span>
      </div>
    </div>
  )
}

