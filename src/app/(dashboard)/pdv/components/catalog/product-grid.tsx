"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductCard } from "./product-card"
import { cn } from "@/lib/utils"

type Product = {
  uuid?: string
  identify?: string
  name: string
  price?: number | string | null
  promotional_price?: number | string | null
  image?: string | null
  image_url?: string | null
  url?: string | null
  [key: string]: any
}

interface ProductGridProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  getProductPrice: (product: Product) => number
  getProductId: (product: Product) => string
  formatCurrency: (value: number) => string
  selectedCategory?: string | null
  emptyMessage?: string
  className?: string
}

export function ProductGrid({
  products,
  onProductSelect,
  getProductPrice,
  getProductId,
  formatCurrency,
  selectedCategory,
  emptyMessage,
  className,
}: ProductGridProps) {
  const defaultEmptyMessage = selectedCategory
    ? "Nenhum produto nesta categoria."
    : "Selecione uma categoria para ver os produtos."

  return (
    <Card
      id="products-section"
      className={cn(
        "flex-1 flex flex-col border-green-200 bg-green-50/30 dark:border-green-800 dark:bg-green-950/10 min-h-0 h-full",
        className
      )}
    >
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-base text-green-900 dark:text-green-100">
          Produtos
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0 min-h-0 flex flex-col">
        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            {emptyMessage || defaultEmptyMessage}
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-auto">
            <div
              className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 pb-4"
              data-testid="touch-grid-products"
              style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
            >
              {products.map((product) => {
                const price = getProductPrice(product)
                return (
                  <ProductCard
                    key={getProductId(product)}
                    product={product}
                    price={price}
                    formatCurrency={formatCurrency}
                    getProductId={getProductId}
                    onSelect={onProductSelect}
                  />
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

