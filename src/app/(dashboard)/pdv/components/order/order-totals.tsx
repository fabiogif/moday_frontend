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
    <div className={cn("space-y-2 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-purple-950/50 dark:via-blue-950/50 dark:to-indigo-950/50 rounded-lg p-4 border-2 border-purple-200 dark:border-purple-800 shadow-md", className)}>
      <div className="flex items-center justify-between text-sm pb-2 border-b-2 border-purple-300 dark:border-purple-700">
        <span className="text-purple-700 dark:text-purple-300 font-semibold">Subtotal:</span>
        <span className="font-bold text-purple-900 dark:text-purple-100">{formatCurrency(subtotal)}</span>
      </div>

      {discounts > 0 && (
        <div className="flex items-center justify-between text-sm text-red-600 dark:text-red-400 pb-2 border-b-2 border-red-200 dark:border-red-800">
          <span className="font-semibold">Descontos:</span>
          <span className="font-bold">-{formatCurrency(discounts)}</span>
        </div>
      )}

      {taxes > 0 && (
        <div className="flex items-center justify-between text-sm pb-2 border-b-2 border-blue-300 dark:border-blue-700">
          <span className="text-blue-700 dark:text-blue-300 font-semibold">Impostos:</span>
          <span className="font-bold text-blue-900 dark:text-blue-100">{formatCurrency(taxes)}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t-2 border-indigo-400 dark:border-indigo-600 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 -mx-2 px-2 py-2 rounded-b-lg">
        <span className="text-lg font-bold text-indigo-900 dark:text-indigo-100">Total:</span>
        <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          {formatCurrency(finalTotal)}
        </span>
      </div>
    </div>
  )
}

