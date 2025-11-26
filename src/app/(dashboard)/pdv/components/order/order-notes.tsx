"use client"

import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface OrderNotesProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  className?: string
}

export function OrderNotes({
  value,
  onChange,
  placeholder = "Instruções adicionais",
  label = "Observações do pedido",
  className,
}: OrderNotesProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-xs font-medium">{label}</Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[50px] rounded-lg text-sm resize-none"
      />
    </div>
  )
}

