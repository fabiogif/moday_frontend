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
      {/* Produto */}
      <div className="flex items-start gap-3">
        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border bg-muted sm:h-12 sm:w-12">
          {productImage ? (
            <Image
              src={productImage}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="56px"
              loading="lazy"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-semibold leading-snug text-foreground sm:truncate">
            {item.product.name}
          </p>

          {item.selectedVariation && (
            <Badge
              variant="secondary"
              className="h-5 px-2 py-0 text-[11px] font-normal"
            >
              {item.selectedVariation.name}
            </Badge>
          )}

          {item.selectedOptionals && item.selectedOptionals.length > 0 && (
            <div className="space-y-0.5">
              {item.selectedOptionals.map((optional, idx) => {
                const key = optional.id || optional.identify || optional.name || `opt-${idx}`
                return (
                  <div
                    key={`${item.signature}-${key}-${idx}`}
                    className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground"
                  >
                    <span className="min-w-0 break-words">
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
            <p className="text-[11px] italic text-muted-foreground break-words">
              {item.observation}
            </p>
          )}

          <p className="text-xs text-muted-foreground tabular-nums">
            {formatCurrency(unitPrice)} cada
          </p>
        </div>
      </div>

      {/* Quantidade, preço e remoção — abaixo do produto no mobile */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3 sm:mt-2 sm:border-t-0 sm:pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md sm:h-8 sm:w-8"
            aria-label={`Diminuir ${item.product.name}`}
            onClick={onDecrease}
          >
            <Minus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
          <span
            data-testid={`cart-item-qty-${item.signature}`}
            className="flex h-10 min-w-[40px] items-center justify-center rounded-md bg-primary px-2 text-sm font-bold tabular-nums text-primary-foreground sm:h-8 sm:min-w-[32px] sm:text-xs"
          >
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md sm:h-8 sm:w-8"
            aria-label={`Aumentar ${item.product.name}`}
            onClick={onIncrease}
          >
            <Plus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-base font-bold tabular-nums text-foreground sm:text-sm">
            {formatCurrency(totalPrice)}
          </p>
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive sm:h-8 sm:w-8"
            aria-label={`Remover ${item.product.name}`}
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </div>

      {/* Observação + templates */}
      <div className="mt-2 space-y-1.5">
        <Input
          value={item.observation}
          onChange={(e) => onObservationChange(e.target.value)}
          placeholder="Observação (ex: sem cebola)"
          className="h-10 rounded-md text-sm sm:h-8 sm:text-xs"
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
