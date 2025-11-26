"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { NotebookPen } from "lucide-react"

type Product = {
  uuid?: string
  identify?: string
  name: string
  description?: string
  price: number | string
  promotional_price?: number | string | null
  image?: string | null
  image_url?: string | null
  categories?: Array<{ uuid?: string; identify?: string; name: string }>
  variations?: Array<{ id?: string; identify?: string; name: string; price?: number | string | null }>
  optionals?: Array<{ id?: string; identify?: string; name: string; price?: number | string | null }>
  observation_templates?: string[]
  observation_suggestions?: string[]
}

interface ProductGridProps {
  products: Product[]
  onProductSelect: (product: Product) => void
  getProductPrice: (product: Product) => number
  getProductId: (product: Product) => string
  formatCurrency: (value: number) => string
}

export function ProductGrid({
  products,
  onProductSelect,
  getProductPrice,
  getProductId,
  formatCurrency,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <Card id="products-section" className="flex-1 flex flex-col border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 min-h-0">
        <CardHeader className="flex-shrink-0 pb-2">
          <CardTitle className="text-base text-green-900 dark:text-green-100">Produtos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden pt-0">
          <div className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
            Nenhum produto nesta categoria.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id="products-section" className="flex-1 flex flex-col border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20 min-h-0">
      <CardHeader className="flex-shrink-0 pb-2">
        <CardTitle className="text-base text-green-900 dark:text-green-100">Produtos</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden pt-0">
        <ScrollArea className="h-full" type="always">
          <div
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 pb-4"
            data-testid="touch-grid-products"
          >
            {products.map((product) => {
              const price = getProductPrice(product)
              return (
                <button
                  key={getProductId(product)}
                  data-testid={`touch-product-${getProductId(product)}`}
                  onClick={() => onProductSelect(product)}
                  className="flex h-32 flex-col rounded-xl border bg-card text-left shadow-sm transition hover:scale-[1.02] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="relative h-16 w-full overflow-hidden rounded-t-xl bg-muted">
                    {product.image_url || product.image ? (
                      <Image
                        src={product.image_url || product.image || ""}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <NotebookPen className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-2">
                    <p className="text-sm font-semibold leading-tight line-clamp-2">
                      {product.name}
                    </p>
                    <p className="text-base font-bold text-primary">
                      {formatCurrency(price)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

