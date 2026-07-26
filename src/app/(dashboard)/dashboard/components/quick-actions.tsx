"use client"

import { useEffect } from "react"
import {
  Plus,
  Store,
  MonitorSmartphone,
  UserPlus,
  Wallet,
  FileBarChart,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface QuickAction {
  key: string
  label: string
  icon: typeof Plus
  onClick: (ctx: { router: ReturnType<typeof useRouter>; tenantSlug: string }) => void
  variant?: "default" | "outline" | "ghost"
  shortcut?: string
}

const ACTIONS: QuickAction[] = [
  {
    key: "novo-pedido",
    label: "Novo Pedido",
    icon: Plus,
    onClick: ({ router }) => router.push("/orders/new"),
    variant: "default",
    shortcut: "Alt+P",
  },
  {
    key: "novo-cliente",
    label: "Novo Cliente",
    icon: UserPlus,
    onClick: ({ router }) => router.push("/clients"),
    variant: "outline",
    shortcut: "Alt+C",
  },
  {
    key: "pdv",
    label: "Abrir PDV",
    icon: MonitorSmartphone,
    onClick: ({ router }) => router.push("/pdv"),
    variant: "outline",
    shortcut: "Alt+D",
  },
  {
    key: "financeiro",
    label: "Financeiro",
    icon: Wallet,
    onClick: ({ router }) => router.push("/financial/dashboard"),
    variant: "outline",
    shortcut: "Alt+F",
  },
  {
    key: "relatorio",
    label: "Gerar Relatório",
    icon: FileBarChart,
    onClick: ({ router }) => router.push("/reports"),
    variant: "ghost",
  },
  {
    key: "cardapio",
    label: "Cardápio",
    icon: Store,
    onClick: ({ tenantSlug }) => window.open(`/store/${tenantSlug}`, "_blank"),
    variant: "ghost",
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: Megaphone,
    onClick: ({ router }) => router.push("/marketing/coupons"),
    variant: "ghost",
  },
]

const SHORTCUT_KEY_MAP: Record<string, string> = {
  p: "novo-pedido",
  c: "novo-cliente",
  d: "pdv",
  f: "financeiro",
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable
}

export function QuickActions() {
  const router = useRouter()
  const { user } = useAuth()

  const tenantSlug = (user as any)?.tenant?.slug || "empresa-dev"

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (!e.altKey || isTypingTarget(e.target)) return
      const actionKey = SHORTCUT_KEY_MAP[e.key.toLowerCase()]
      if (!actionKey) return
      const action = ACTIONS.find((a) => a.key === actionKey)
      if (!action) return
      e.preventDefault()
      action.onClick({ router, tenantSlug })
    }
    document.addEventListener("keydown", handleKeydown)
    return () => document.removeEventListener("keydown", handleKeydown)
  }, [router, tenantSlug])

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden md:flex-wrap md:overflow-visible">
      {ACTIONS.map((action) => (
        <Tooltip key={action.key}>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant={action.variant}
              className="shrink-0 transition-transform active:scale-95"
              onClick={() => action.onClick({ router, tenantSlug })}
              aria-label={action.variant === "ghost" ? action.label : undefined}
            >
              <action.icon className="h-4 w-4" />
              <span className={action.variant === "ghost" ? "hidden sm:inline" : ""}>
                {action.label}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              {action.label}
              {action.shortcut && (
                <span className="ml-2 text-muted-foreground">({action.shortcut})</span>
              )}
            </p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
