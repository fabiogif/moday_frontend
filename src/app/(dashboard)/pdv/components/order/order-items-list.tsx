"use client"

import { OrderItemCard, type CartItem } from "./order-item-card"
import { cn } from "@/lib/utils"
import { ShoppingCart } from "lucide-react"

interface OrderItemsListProps {
  items: CartItem[]
  getUnitPrice: (item: any) => number
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
          "flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center",
          className
        )}
      >
        <ShoppingCart className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium text-muted-foreground">Carrinho vazio</p>
        <p className="text-xs text-muted-foreground/70">
          Adicione produtos para iniciar o pedido
        </p>
      </div>
    )
  }

  return (
    <div className={cn("min-h-0 flex-1 overflow-y-auto pr-1", className)}>
      <div className="space-y-2 pb-2">
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
    </div>
  )
}
