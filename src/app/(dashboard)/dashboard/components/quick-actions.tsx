"use client"

import { Plus, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function QuickActions() {
  const router = useRouter()
  const { user } = useAuth()

  const handleNewOrder = () => {
    router.push('/orders/new')
  }

  const handleOpenStore = () => {
    // Usar o slug do tenant se disponível, senão usar 'empresa-dev'
    const tenantSlug = (user as any)?.tenant?.slug || 'empresa-dev'
    window.open(`/store/${tenantSlug}`, '_blank')
  }

  return (
    <div className="flex items-center space-x-2">
      <Button className="cursor-pointer" onClick={handleNewOrder}>
        <Plus className="h-4 w-4 mr-2" />
        Novo Pedido
      </Button>
      <Button variant="outline" className="cursor-pointer" onClick={handleOpenStore}>
        <Store className="h-4 w-4 mr-2" />
        Cardápio
      </Button>
    </div>
  )
}
