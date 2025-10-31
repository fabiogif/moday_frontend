"use client"

import * as React from "react"
import {
  Users,
  ShoppingCart,
  Tag,
  Package,
  Table,
  UserCheck,
  BarChart3,
  Shield,
  UserCog,
  Settings,
  CreditCard,
  Building2,
  CalendarDays,
  Wallet,
  TrendingDown,
  TrendingUp,
  FileText,
  Truck,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Logo } from "@/components/logo"
import { useAuth } from "@/contexts/auth-context"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navGroups = [
  {
    label: "Sistema",
    items: [
      {
        title: "Pedidos",
        url: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Quadro de Pedidos",
        url: "/orders/board",
        icon: ShoppingCart,
      },
      {
        title: "Categorias",
        url: "/categories",
        icon: Tag,
      },
      {
        title: "Produtos",
        url: "/products",
        icon: Package,
      },
      {
        title: "Mesas",
        url: "/tables",
        icon: Table,
      },
      {
        title: "Clientes",
        url: "/clients",
        icon: UserCheck,
      },
      {
        title: "Formas de Pagamento",
        url: "/payment-methods",
        icon: CreditCard,
      },
      {
        title: "Eventos",
        url: "/events",
        icon: CalendarDays,
      },
      {
        title: "Relatórios",
        url: "/reports",
        icon: BarChart3,
      },
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        title: "Informações Financeiras",
        url: "/financial/dashboard",
        icon: Wallet,
      },
      {
        title: "Despesas",
        url: "/financial/expenses",
        icon: TrendingDown,
      },
      {
        title: "Contas a Pagar",
        url: "/financial/accounts-payable",
        icon: CreditCard,
      },
      {
        title: "Contas a Receber",
        url: "/financial/accounts-receivable",
        icon: TrendingUp,
      },
      {
        title: "Fornecedores",
        url: "/financial/suppliers",
        icon: Truck,
      },
      {
        title: "Categorias",
        url: "/financial/categories",
        icon: FileText,
      },
    ],
  },
  {
    label: "Controle de Acesso",
    items: [
      {
        title: "Usuários",
        url: "/users",
        icon: Users,
      },
      {
        title: "Perfis",
        url: "/profiles",
        icon: Settings,
      },
      {
        title: "Permissões",
        url: "/permissions",
        icon: Shield,
      },
      // {
      //   title: "Funções",
      //   url: "/roles",
      //   icon: UserCog,
      // },
     
    ],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth()

  // Dados do usuário para exibir no sidebar
  const userData = {
    name: user?.name || "Usuário",
    email: user?.email || "user@example.com",
    avatar: "",
  }

  // Dados do tenant para exibir logo
  const tenantData = (user as any)?.tenant

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                {tenantData?.logo ? (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border border-border">
                    <Image 
                      src={tenantData.logo} 
                      alt={tenantData.name || "Logo"} 
                      width={32} 
                      height={32} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Logo size={24} className="text-current" />
                  </div>
                )}
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {tenantData?.name || "Moday"}
                  </span>
                  <span className="truncate text-xs">Sistema de Gestão</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated ? (
          <NavUser user={userData} />
        ) : (
          <div className="p-2 text-center text-sm text-muted-foreground">
            Faça login para continuar
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
