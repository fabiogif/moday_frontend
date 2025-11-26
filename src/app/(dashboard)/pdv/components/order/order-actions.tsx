"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  MessageSquare,
  FileText,
  Split,
  ArrowRightLeft,
  Users,
  Gift,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CustomerNoteDialog } from "../dialogs/customer-note-dialog"
import { InternalNoteDialog } from "../dialogs/internal-note-dialog"
import { RefundDialog } from "../dialogs/refund-dialog"
import { SplitBillDialog } from "../dialogs/split-bill-dialog"
import { TransferOrderDialog } from "../dialogs/transfer-order-dialog"
import { GuestsDialog } from "../dialogs/guests-dialog"

interface Table {
  uuid?: string
  identify?: string
  name: string
  isOccupied?: boolean
}

interface OrderActionsProps {
  orderId?: string | number
  orderStatus?: string | null
  isFinalStatus: boolean
  onCustomerNote?: (note: string) => void
  onInternalNote?: (note: string) => void
  onRefund?: (amount: number, reason: string) => void
  onSplit?: (items: any[], amounts: number[]) => void
  onTransfer?: (targetTable: string) => void
  onGuests?: (count: number) => void
  onQuotation?: () => void
  onReward?: (rewardId: string) => void
  tables?: Table[]
  currentTable?: string | null
  className?: string
}

export function OrderActions({
  orderId,
  orderStatus,
  isFinalStatus,
  onCustomerNote,
  onInternalNote,
  onRefund,
  onSplit,
  onTransfer,
  onGuests,
  onReward,
  tables = [],
  currentTable = null,
  className,
}: OrderActionsProps) {
  const [showCustomerNote, setShowCustomerNote] = useState(false)
  const [showInternalNote, setShowInternalNote] = useState(false)
  const [showRefund, setShowRefund] = useState(false)
  const [showSplit, setShowSplit] = useState(false)
  const [showTransfer, setShowTransfer] = useState(false)
  const [showGuests, setShowGuests] = useState(false)

  const disabled = isFinalStatus && orderStatus !== "Cancelado"

  return (
    <div className={cn("space-y-2", className)}>
      <div className="grid grid-cols-2 gap-2">
        {/* Customer Note */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomerNote(true)}
          disabled={disabled}
          className="h-12 justify-start gap-2"
          title="Adicionar observação do cliente"
        >
          <MessageSquare className="h-4 w-4" />
          <span className="text-xs">Cliente</span>
        </Button>

        {/* Internal Note */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInternalNote(true)}
          disabled={disabled}
          className="h-12 justify-start gap-2"
          title="Adicionar observação interna"
        >
          <FileText className="h-4 w-4" />
          <span className="text-xs">Interna</span>
        </Button>

        {/* Split */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSplit(true)}
          disabled={disabled}
          className="h-12 justify-start gap-2"
          title="Dividir conta"
        >
          <Split className="h-4 w-4" />
          <span className="text-xs">Dividir</span>
        </Button>

        {/* Transfer */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowTransfer(true)}
          disabled={disabled}
          className="h-12 justify-start gap-2"
          title="Transferir pedido/mesa"
        >
          <ArrowRightLeft className="h-4 w-4" />
          <span className="text-xs">Transferir</span>
        </Button>

        {/* Dine-in Guests */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGuests(true)}
          disabled={disabled}
          className="h-12 justify-start gap-2"
          title="Definir quantidade de clientes"
        >
          <Users className="h-4 w-4" />
          <span className="text-xs">Clientes</span>
        </Button>

        {/* Reward */}
        {onReward && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // TODO: Implementar seleção de reward
              console.log("Aplicar reward")
            }}
            disabled={disabled}
            className="h-12 justify-start gap-2"
            title="Aplicar recompensa"
          >
            <Gift className="h-4 w-4" />
            <span className="text-xs">Recompensa</span>
          </Button>
        )}
      </div>

      {/* Modais */}
      <CustomerNoteDialog
        open={showCustomerNote}
        onOpenChange={setShowCustomerNote}
        onSave={(note) => {
          onCustomerNote?.(note)
          setShowCustomerNote(false)
        }}
      />

      <InternalNoteDialog
        open={showInternalNote}
        onOpenChange={setShowInternalNote}
        onSave={(note) => {
          onInternalNote?.(note)
          setShowInternalNote(false)
        }}
      />

      <RefundDialog
        open={showRefund}
        onOpenChange={setShowRefund}
        orderTotal={0} // TODO: Passar total do pedido
        onConfirm={(amount, reason) => {
          onRefund?.(amount, reason)
          setShowRefund(false)
        }}
      />

      <SplitBillDialog
        open={showSplit}
        onOpenChange={setShowSplit}
        items={[]} // TODO: Passar itens do pedido
        onConfirm={(items, amounts) => {
          onSplit?.(items, amounts)
          setShowSplit(false)
        }}
      />

      <TransferOrderDialog
        open={showTransfer}
        onOpenChange={setShowTransfer}
        currentTable={currentTable}
        tables={tables}
        onConfirm={(targetTable) => {
          onTransfer?.(targetTable)
          setShowTransfer(false)
        }}
      />

      <GuestsDialog
        open={showGuests}
        onOpenChange={setShowGuests}
        currentGuests={1} // TODO: Passar quantidade atual
        onConfirm={(count) => {
          onGuests?.(count)
          setShowGuests(false)
        }}
      />
    </div>
  )
}

