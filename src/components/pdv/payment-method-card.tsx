import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CreditCard, Smartphone, Banknote, Radio, Building2, Wallet } from "lucide-react"

export type PaymentMethodType = 
  | "credit_card" 
  | "debit_card" 
  | "pix" 
  | "money" 
  | "contactless" 
  | "bank_transfer"
  | "wallet"

interface PaymentMethodCardProps {
  method: {
    uuid: string
    name: string
    type?: PaymentMethodType
    description?: string
    recommended?: boolean
  }
  selected: boolean
  onSelect: (uuid: string) => void
}

const paymentIcons: Record<PaymentMethodType, React.ReactNode> = {
  credit_card: <CreditCard className="h-5 w-5" />,
  debit_card: <CreditCard className="h-5 w-5" />,
  pix: <Smartphone className="h-5 w-5" />,
  money: <Banknote className="h-5 w-5" />,
  contactless: <Radio className="h-5 w-5" />,
  bank_transfer: <Building2 className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
}

// Mapear nomes de métodos para tipos (fallback)
function getPaymentType(name: string): PaymentMethodType {
  const nameLower = name.toLowerCase()
  if (nameLower.includes("pix")) return "pix"
  if (nameLower.includes("crédito") || nameLower.includes("credito")) return "credit_card"
  if (nameLower.includes("débito") || nameLower.includes("debito")) return "debit_card"
  if (nameLower.includes("dinheiro")) return "money"
  if (nameLower.includes("contactless") || nameLower.includes("nfc")) return "contactless"
  if (nameLower.includes("transferência") || nameLower.includes("transferencia")) return "bank_transfer"
  if (nameLower.includes("carteira") || nameLower.includes("wallet")) return "wallet"
  return "credit_card" // default
}

export function PaymentMethodCard({
  method,
  selected,
  onSelect,
}: PaymentMethodCardProps) {
  const paymentType = method.type || getPaymentType(method.name)
  const icon = paymentIcons[paymentType] || paymentIcons.credit_card

  return (
    <Button
      onClick={() => onSelect(method.uuid)}
      className={cn(
        "h-16 w-full justify-start gap-3 rounded-2xl px-4 text-left transition-all",
        selected
          ? "bg-primary text-primary-foreground shadow-lg"
          : "bg-muted text-foreground hover:bg-primary/10"
      )}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon}
        <div className="flex flex-col items-start flex-1">
          <span className="font-semibold">{method.name}</span>
          {method.description && (
            <span className={cn(
              "text-xs",
              selected ? "text-primary-foreground/80" : "text-muted-foreground"
            )}>
              {method.description}
            </span>
          )}
        </div>
      </div>
      {method.recommended && !selected && (
        <Badge variant="secondary" className="ml-auto text-xs">
          Recomendado
        </Badge>
      )}
    </Button>
  )
}

