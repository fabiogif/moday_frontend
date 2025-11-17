"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Printer, X } from "lucide-react"
// Função helper para formatar moeda
function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  })
}

interface OrderConfirmationModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  onPrint?: () => void
  orderData: {
    orderId?: string
    table?: string
    client?: string
    items: Array<{
      name: string
      quantity: number
      price: number
    }>
    total: number
    paymentMethod: string
    isDelivery: boolean
  }
}

export function OrderConfirmationModal({
  open,
  onClose,
  onConfirm,
  onPrint,
  orderData,
}: OrderConfirmationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <DialogTitle className="text-center text-2xl">
            Confirmar Pedido?
          </DialogTitle>
          <DialogDescription className="text-center">
            Revise os detalhes antes de finalizar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Informações do Pedido */}
          <div className="rounded-xl border bg-muted/50 p-4">
            <div className="space-y-2">
              {orderData.table && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mesa:</span>
                  <span className="font-semibold">{orderData.table}</span>
                </div>
              )}
              {orderData.client && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-semibold">{orderData.client}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-semibold">
                  {orderData.isDelivery ? "Delivery" : "Retirada no Local"}
                </span>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="max-h-[200px] space-y-2 overflow-y-auto rounded-xl border p-4">
            {orderData.items.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="font-semibold">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total e Pagamento */}
          <div className="rounded-xl border-2 border-primary bg-primary/5 p-4">
            <div className="flex items-center justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-2xl text-primary">
                {formatCurrency(orderData.total)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>Pagamento:</span>
              <span className="font-medium">{orderData.paymentMethod}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </Button>
          {onPrint && (
            <Button
              variant="outline"
              onClick={onPrint}
              className="w-full sm:w-auto"
            >
              <Printer className="mr-2 h-4 w-4" />
              Imprimir
            </Button>
          )}
          <Button
            onClick={onConfirm}
            className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
            size="lg"
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Confirmar Pedido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

