'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useExpenseStats } from '@/hooks/use-expenses'
import { useAccountPayableStats } from '@/hooks/use-accounts-payable'
import { useAccountReceivableStats } from '@/hooks/use-accounts-receivable'
import { 
  Wallet, TrendingDown, TrendingUp, DollarSign, 
  AlertCircle, Clock, FileText 
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function FinancialDashboardPage() {
  const router = useRouter()
  const { data: expenseStats } = useExpenseStats()
  const { data: payableStats } = useAccountPayableStats()
  const { data: receivableStats } = useAccountReceivableStats()

  // Calcular totais
  const parseAmount = (value: number | string | null | undefined): number => {
    if (value === null || value === undefined) return 0
    if (typeof value === 'number') return value

    const normalized = value
      .toString()
      .replace(/\./g, '')
      .replace(/,/g, '.')

    const parsed = Number(normalized)
    return Number.isNaN(parsed) ? 0 : parsed
  }

  const totalExpenses =
    parseAmount(expenseStats?.total_month) +
    parseAmount(payableStats?.total_pending) +
    parseAmount(payableStats?.total_overdue)

  const totalRevenues =
    parseAmount(receivableStats?.total_pending) +
    parseAmount(receivableStats?.total_received)
  const balance = parseFloat((totalRevenues - totalExpenses).toFixed(2))

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="@container/main px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Wallet className="h-8 w-8" />
              Informações Financeiro
            </h1>
            <p className="text-muted-foreground">
              Visão geral das suas finanças
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="@container/main px-4 lg:px-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Receber</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                R$ {totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pendente: R$ {(receivableStats?.total_pending || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total a Pagar</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Vencido: R$ {(payableStats?.total_overdue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={cn(
                "text-2xl font-bold",
                balance >= 0 ? "text-green-600" : "text-red-600"
              )}>
                R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {balance >= 0 ? 'Positivo ✓' : 'Negativo'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contas Vencidas</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {(payableStats?.total_overdue || 0) > 0 ? 'R$ ' + (payableStats?.total_overdue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : 'Nenhuma'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Contas a pagar vencidas
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="@container/main px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/financial/expenses')}
              >
                <TrendingDown className="h-8 w-8" />
                <span>Gerenciar Despesas</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/financial/suppliers')}
              >
                <FileText className="h-8 w-8" />
                <span>Fornecedores</span>
              </Button>

              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center gap-2"
                onClick={() => router.push('/financial/categories')}
              >
                <FileText className="h-8 w-8" />
                <span>Categorias</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informação de Em Desenvolvimento */}
      {/* <div className="@container/main px-4 lg:px-6">
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-5 w-5" />
              Em Desenvolvimento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-yellow-700">
            <p className="mb-2">Os seguintes módulos estão em desenvolvimento:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Contas a Pagar (com alertas de vencimento)</li>
              <li>Contas a Receber (com vínculo a pedidos)</li>
              <li>Relatórios e Gráficos</li>
              <li>Exportação PDF/Excel</li>
            </ul>
            <p className="mt-3 font-medium">
              Já disponíveis: Fornecedores, Categorias e Despesas ✓
            </p>
          </CardContent>
        </Card>
      </div> */}
    </div>
  )
}

