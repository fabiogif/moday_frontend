"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Trash2, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { resolveImageUrl } from "@/lib/resolve-image-url"

type Product = {
  uuid?: string
  identify?: string
  name: string
  price?: number | string | null
  promotional_price?: number | string | null
  observation_templates?: string[]
  observation_suggestions?: string[]
  [key: string]: any
}

type ProductVariation = {
  id?: string
  identify?: string
  name: string
  price?: number | string | null
  [key: string]: any
}

type ProductOptional = {
  id?: string
  identify?: string
  name: string
  price?: number | string | null
  quantity: number
  [key: string]: any
}

export interface CartItem {
  signature: string
  product: Product
  quantity: number
  observation: string
  selectedVariation?: ProductVariation | null
  selectedOptionals?: Array<ProductOptional>
  [key: string]: any
}

interface OrderItemCardProps {
  item: CartItem
  unitPrice: number
  totalPrice: number
  isAdding?: boolean
  isRemoving?: boolean
  onIncrease: () => void
  onDecrease: () => void
  onRemove: () => void
  onObservationChange: (observation: string) => void
  formatCurrency: (value: number) => string
}

export function OrderItemCard({
  item,
  unitPrice,
  totalPrice,
  isAdding = false,
  isRemoving = false,
  onIncrease,
  onDecrease,
  onRemove,
  onObservationChange,
  formatCurrency,
}: OrderItemCardProps) {
  const productImage =
    resolveImageUrl(item.product.image_url) ||
    resolveImageUrl(item.product.image) ||
    resolveImageUrl(item.product.url)

  const templates =
    item.product.observation_templates?.length
      ? item.product.observation_templates
      : item.product.observation_suggestions ?? []

  return (
    <div
      data-testid={`cart-item-${item.signature}`}
      className={cn(
        "rounded-lg border bg-card p-3 transition-all duration-150",
        isAdding && "ring-2 ring-emerald-400 ring-offset-1",
        isRemoving && "opacity-40 scale-[0.98]",
        !isAdding && !isRemoving && "hover:border-primary/40 hover:shadow-sm"
      )}
    >
      {/* Linha principal */}
      <div className="flex items-start gap-2.5">
        {/* Thumbnail */}
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-muted border">
          {productImage ? (
            <Image
              src={productImage}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="48px"
              loading="lazy"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Nome + variação + opcionais */}
        <div className="flex-1 min-w-0 space-y-0.5">
          <p className="text-sm font-semibold leading-tight truncate text-foreground">
            {item.product.name}
          </p>

          {item.selectedVariation && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-4 font-normal"
            >
              {item.selectedVariation.name}
            </Badge>
          )}

          {item.selectedOptionals && item.selectedOptionals.length > 0 && (
            <div className="space-y-px">
              {item.selectedOptionals.map((optional, idx) => {
                const key = optional.id || optional.identify || optional.name || `opt-${idx}`
                return (
                  <div
                    key={`${item.signature}-${key}-${idx}`}
                    className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground"
                  >
                    <span className="truncate">
                      + {optional.name} × {optional.quantity}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatCurrency(
                        (typeof optional.price === "number"
                          ? optional.price
                          : parseFloat(String(optional.price || 0))) * optional.quantity
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {item.observation && (
            <p className="text-[10px] text-muted-foreground italic truncate">
              {item.observation}
            </p>
          )}

          <p className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(unitPrice)} cada
          </p>
        </div>

        {/* Controles de quantidade */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md"
            aria-label={`Diminuir ${item.product.name}`}
            onClick={onDecrease}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span
            data-testid={`cart-item-qty-${item.signature}`}
            className="min-w-[28px] h-7 flex items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold tabular-nums px-1.5"
          >
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 rounded-md"
            aria-label={`Aumentar ${item.product.name}`}
            onClick={onIncrease}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Total do item + remover */}
        <div className="flex flex-col items-end gap-1 shrink-0 min-w-[72px]">
          <p className="text-sm font-bold text-foreground tabular-nums">
            {formatCurrency(totalPrice)}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
            aria-label={`Remover ${item.product.name}`}
            onClick={onRemove}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Observação + templates */}
      <div className="mt-2 space-y-1.5">
        <Input
          value={item.observation}
          onChange={(e) => onObservationChange(e.target.value)}
          placeholder="Observação (ex: sem cebola)"
          className="h-8 text-xs rounded-md"
        />
        {templates.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {templates.map((template: string) => (
              <button
                key={template}
                type="button"
                className="rounded-full border border-border/70 bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => {
                  const current = item.observation
                  onObservationChange(current ? `${current}, ${template}` : template)
                }}
              >
                {template}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function parsePrice(value?: number | string | null): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}
