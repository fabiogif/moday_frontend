'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAdminAuth } from '@/contexts/admin-auth-context'
import {
  LayoutDashboard,
  Building2,
  BarChart3,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Activity,
  LogOut,
  Shield,
  Users,
  CreditCard,
} from 'lucide-react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Empresas',
    href: '/admin/empresas',
    icon: Building2,
  },
  {
    title: 'Planos',
    href: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: 'Métricas',
    icon: BarChart3,
    children: [
      { title: 'Faturamento', href: '/admin/metricas/faturamento', icon: DollarSign },
      { title: 'Uso', href: '/admin/metricas/uso', icon: Activity },
      { title: 'Crescimento', href: '/admin/metricas/crescimento', icon: TrendingUp },
      { title: 'Mensagens', href: '/admin/metricas/mensagens', icon: MessageSquare },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { admin, logout } = useAdminAuth()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* Header */}
      <div className="flex h-16 items-center border-b px-6">
        <Shield className="h-6 w-6 text-primary mr-2" />
        <span className="font-semibold text-lg">Admin Tahan</span>
      </div>

      {/* Admin Info */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{admin?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{admin?.role?.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-3">
          {menuItems.map((item) => {
            if (item.children) {
              return (
                <div key={item.title} className="space-y-1">
                  <div className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground">
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </div>
                  <div className="ml-4 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href
                      return (
                        <Link key={child.href} href={child.href}>
                          <Button
                            variant={isActive ? 'secondary' : 'ghost'}
                            className={cn(
                              'w-full justify-start text-sm',
                              isActive && 'bg-secondary'
                            )}
                            size="sm"
                          >
                            <child.icon className="mr-2 h-4 w-4" />
                            {child.title}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            }

            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    isActive && 'bg-secondary'
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  )
}

