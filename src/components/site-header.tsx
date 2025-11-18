"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { CommandSearch, SearchTrigger } from "@/components/command-search"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationsButton } from "@/components/notifications/notifications-button"
import { Clock } from "lucide-react"
import { usePOSHeader } from "@/contexts/pos-header-context"

interface SiteHeaderProps {
  onNotificationsClick?: () => void
}

export function SiteHeader({ onNotificationsClick }: SiteHeaderProps = {}) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const pathname = usePathname()
  const isPOSPage = pathname?.includes('/pdv')
  
  // Usar o contexto do PDV (sempre disponível pois o Provider está no layout)
  const { onTodayOrdersClick, todayOrdersCount } = usePOSHeader()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setSearchOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  return (
    <>
      <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
        <div className="flex w-full items-center gap-1 px-4 py-3 lg:gap-2 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <div className="flex-1 max-w-sm">
            <SearchTrigger onClick={() => setSearchOpen(true)} />
          </div>
          <div className="ml-auto flex items-center gap-2">
            {onNotificationsClick && (
              <NotificationsButton onClick={onNotificationsClick} />
            )}
            {/* Botão de Pedidos de Hoje - apenas na página do PDV */}
            {isPOSPage && onTodayOrdersClick && (
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onTodayOrdersClick}
                aria-label="Pedidos de Hoje"
              >
                <Clock className="h-5 w-5" />
                {todayOrdersCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {todayOrdersCount > 99 ? '99+' : todayOrdersCount}
                  </span>
                )}
              </Button>
            )}
            <ModeToggle />
          </div>
        </div>
      </header>
      <CommandSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
