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
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[50px] rounded-lg text-sm resize-none border-2 border-pink-200 dark:border-pink-800 bg-pink-50/50 dark:bg-pink-950/30 focus:border-pink-400 dark:focus:border-pink-600 focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-700"
      />
    </div>
  )
}

