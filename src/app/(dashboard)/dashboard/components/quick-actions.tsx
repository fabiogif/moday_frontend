"use client"

import { Plus, Store, MonitorSmartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function QuickActions() {
  const router = useRouter()
  const { user } = useAuth()

  const tenantSlug = (user as any)?.tenant?.slug || "empresa-dev"

  return (
    <div className="flex items-center gap-2">
      <Button size="sm" onClick={() => router.push("/orders/new")}>
        <Plus className="h-4 w-4" />
        Novo Pedido
      </Button>
      <Button size="sm" variant="outline" onClick={() => router.push("/pdv")}>
        <MonitorSmartphone className="h-4 w-4" />
        PDV
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => window.open(`/store/${tenantSlug}`, "_blank")}
      >
        <Store className="h-4 w-4" />
        <span className="hidden sm:inline">Cardápio</span>
      </Button>
    </div>
  )
}
