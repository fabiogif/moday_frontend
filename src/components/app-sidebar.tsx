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
  Clock,
  Gift,
  Store,
  Receipt,
  LayoutDashboard,
  Utensils,
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
    label: "Principal",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Pedidos",
        url: "/orders",
        icon: ShoppingCart,
        items: [
          {
            title: "Todos os Pedidos",
            url: "/orders",
          },
          {
            title: "Quadro de Pedidos",
            url: "/orders/board",
          },
        ],
      },
      {
        title: "Clientes",
        url: "/clients",
        icon: UserCheck,
      },
    ],
  },
  {
    label: "Cardápio",
    items: [
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
    ],
  },
  {
    label: "Financeiro",
    items: [
      {
        title: "Dashboard Financeiro",
        url: "/financial/dashboard",
        icon: Wallet,
      },
      {
        title: "Contas a Receber",
        url: "/financial/accounts-receivable",
        icon: TrendingUp,
      },
      {
        title: "Contas a Pagar",
        url: "/financial/accounts-payable",
        icon: TrendingDown,
      },
      {
        title: "Despesas",
        url: "/financial/expenses",
        icon: Receipt,
      },
      {
        title: "Fornecedores",
        url: "/financial/suppliers",
        icon: Truck,
      },
      {
        title: "Categorias Financeiras",
        url: "/financial/categories",
        icon: FileText,
      },
      {
        title: "Dados Bancários",
        url: "/contas-bancarias",
        icon: Building2,
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Programa de Fidelidade",
        url: "/loyalty/program",
        icon: Gift,
        items: [
          {
            title: "Configuração",
            url: "/loyalty/program",
          },
          {
            title: "Recompensas",
            url: "/loyalty/rewards",
          },
        ],
      },
      {
        title: "Eventos",
        url: "/events",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        title: "Relatórios",
        url: "/reports",
        icon: BarChart3,
      },
      {
        title: "Formas de Pagamento",
        url: "/payment-methods",
        icon: CreditCard,
      },
    ],
  },
  {
    label: "Administração",
    items: [
      {
        title: "Usuários",
        url: "/users",
        icon: Users,
      },
      {
        title: "Perfis",
        url: "/profiles",
        icon: UserCog,
      },
      {
        title: "Permissões",
        url: "/permissions",
        icon: Shield,
      },
    ],
  },
  {
    label: "Configurações",
    items: [
      {
        title: "Dados da Empresa",
        url: "/settings/company",
        icon: Building2,
      },
      {
        title: "Horários",
        url: "/settings/store-hours",
        icon: Clock,
      },
      {
        title: "Delivery e Retirada",
        url: "/settings/delivery",
        icon: Truck,
      },
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
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg overflow-hidden border border-border">
                
                     <Utensils className="h-4 w-4 text-primary" />
                  </div>
                 
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {/* {tenantData?.name || "Tahan"} */}
                    Tahan
                  </span>
                  <span className="truncate text-xs">Gestão de Restaurante</span>
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

