"use client"

import { OrderItemCard, type CartItem } from "./order-item-card"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

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
          "rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground flex-shrink-0",
          className
        )}
      >
        Nenhum item no pedido.
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

