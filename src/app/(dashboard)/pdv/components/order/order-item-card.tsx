"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Minus, Trash2, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { resolveImageUrl } from "@/lib/resolve-image-url"

// Tipos genéricos para compatibilidade
type Product = {
  uuid?: string
  identify?: string
  name: string
  price?: number | string | null
  promotional_price?: number | string | null
  observation_templates?: string[]
  observation_suggestions?: string[]
  [key: string]: any // Permite propriedades adicionais para compatibilidade
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
  [key: string]: any // Permite propriedades adicionais
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

  return (
    <div
      data-testid={`cart-item-${item.signature}`}
      className={cn(
        "rounded-lg border-2 p-3 transition-all shadow-sm relative",
        isAdding && "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 scale-105 shadow-lg ring-2 ring-green-300 dark:ring-green-700",
        isRemoving && "border-red-500 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 opacity-50 scale-95",
        !isAdding && !isRemoving && "border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-blue-950/30 dark:via-gray-900 dark:to-purple-950/20 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg hover:scale-[1.02]"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Foto miniatura do produto */}
        {productImage ? (
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border bg-muted">
            <Image
              src={productImage}
              alt={item.product.name}
              fill
              className="object-cover"
              sizes="64px"
              loading="lazy"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        
        {/* Informações do produto */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate mb-1 text-blue-900 dark:text-blue-100">{item.product.name}</p>
          {item.observation && (
            <p className="text-xs text-purple-600 dark:text-purple-400 truncate mb-1 font-medium">
              {item.observation}
            </p>
          )}
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            {formatCurrency(unitPrice)} cada
          </p>
          {item.selectedVariation && (
            <Badge variant="outline" className="mt-0.5 text-[10px] px-1.5 py-0.5 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50">
              {item.selectedVariation.name}
            </Badge>
          )}
          {item.selectedOptionals && item.selectedOptionals.length > 0 && (
            <div className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
              {item.selectedOptionals.map((optional, optionalIndex) => {
                const optionalKey =
                  optional.id ||
                  optional.identify ||
                  optional.name ||
                  `optional-${optionalIndex}`
                return (
                  <div
                    key={`${item.signature}-${optionalKey}-${optionalIndex}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>
                      {optional.name} × {optional.quantity}
                    </span>
                    <span>
                      {formatCurrency(
                        (typeof optional.price === "number" ? optional.price : parseFloat(String(optional.price || 0))) * optional.quantity
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        
        {/* Quantidade com botões + e - */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/50"
            aria-label={`Diminuir ${item.product.name}`}
            onClick={onDecrease}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span
            data-testid={`cart-item-qty-${item.signature}`}
            className="min-w-[40px] rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white px-2 py-1 text-center text-sm font-bold shadow-md"
          >
            {item.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-lg border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-950/50"
            aria-label={`Aumentar ${item.product.name}`}
            onClick={onIncrease}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Preço individual e total */}
        <div className="text-right min-w-[100px]">
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-medium">
            {formatCurrency(unitPrice)}
          </p>
          <p className="text-base font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            {formatCurrency(totalPrice)}
          </p>
        </div>
        
        {/* Ícone de remover */}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remover ${item.product.name}`}
          onClick={onRemove}
          className="h-8 w-8 shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50"
          title="Remover item"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>

      <div className="mt-2 space-y-1.5">
        <Input
          value={item.observation}
          onChange={(e) => onObservationChange(e.target.value)}
          placeholder="Observações (ex: sem cebola)"
          className="h-9 rounded-lg text-sm"
        />
        {/* Templates de observações do produto */}
        {(item.product.observation_templates && item.product.observation_templates.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {item.product.observation_templates.map((template: string) => (
              <Button
                key={template}
                variant="outline"
                size="sm"
                className="h-7 text-[10px] px-2"
                onClick={() => {
                  const currentObs = item.observation
                  const newObs = currentObs
                    ? `${currentObs}, ${template}`
                    : template
                  onObservationChange(newObs)
                }}
              >
                {template}
              </Button>
            ))}
          </div>
        )}
        {/* Fallback para observation_suggestions */}
        {(!item.product.observation_templates || item.product.observation_templates.length === 0) &&
          item.product.observation_suggestions &&
          item.product.observation_suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.product.observation_suggestions.map((template: string) => (
                <Button
                  key={template}
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] px-2"
                  onClick={() => {
                    const currentObs = item.observation
                    const newObs = currentObs
                      ? `${currentObs}, ${template}`
                      : template
                    onObservationChange(newObs)
                  }}
                >
                  {template}
                </Button>
              ))}
            </div>
          )}
      </div>
    </div>
  )
}

function parsePrice(value?: number | string | null): number {
  if (typeof value === "number") {
    return value
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

