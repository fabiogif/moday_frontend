"use client"

import { OrderItemCard, type CartItem } from "./order-item-card"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Package } from "lucide-react"

interface OrderItemsListProps {
  items: CartItem[]
  getUnitPrice: (item: any) => number // Usa any para compatibilidade com diferentes tipos CartItem
  formatCurrency: (value: number) => string
  onIncrease: (signature: string) => void
  onDecrease: (signature: string) => void
  onRemove: (signature: string) => void
  onObservationChange: (signature: string, observation: string) => void
  addingItem?: string | null
  removingItem?: string | null
  className?: string
}

export function OrderItemsList({
  items,
  getUnitPrice,
  formatCurrency,
  onIncrease,
  onDecrease,
  onRemove,
  onObservationChange,
  addingItem,
  removingItem,
  className,
}: OrderItemsListProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn(
          "rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/50 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/20 p-6 text-center flex-shrink-0",
          className
        )}
      >
        <Package className="h-8 w-8 mx-auto mb-2 text-blue-400 dark:text-blue-500" />
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
          Nenhum item no pedido
        </p>
        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
          Adicione produtos ao carrinho
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className={cn("max-h-[60vh] pr-3", className)}>
      <div className="space-y-2">
        {items.map((item) => {
          const unitPrice = getUnitPrice(item)
          const totalPrice = unitPrice * item.quantity
          const isAdding = addingItem === item.signature
          const isRemoving = removingItem === item.signature

          return (
            <OrderItemCard
              key={item.signature}
              item={item}
              unitPrice={unitPrice}
              totalPrice={totalPrice}
              isAdding={isAdding}
              isRemoving={isRemoving}
              onIncrease={() => onIncrease(item.signature)}
              onDecrease={() => onDecrease(item.signature)}
              onRemove={() => onRemove(item.signature)}
              onObservationChange={(observation) =>
                onObservationChange(item.signature, observation)
              }
              formatCurrency={formatCurrency}
            />
          )
        })}
      </div>
    </ScrollArea>
  )
}

