"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { CalendarIcon, Download, FileText, Users, TrendingUp, DollarSign, LayoutGrid } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { apiClient, endpoints } from "@/lib/api-client"
import { toast } from "sonner"

interface ReportFilters {
  format: 'pdf' | 'excel' | 'csv'
  date?: Date
  startDate?: Date
  endDate?: Date
  month?: number
  year?: number
  limit?: number
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(false)

  // Estados para filtros de cada relatório
  const [dailySalesFilters, setDailySalesFilters] = useState<ReportFilters>({
    format: 'csv',
    date: new Date(),
  })

  const [clientsFilters, setClientsFilters] = useState<ReportFilters>({
    format: 'csv',
  })

  const [topProductsFilters, setTopProductsFilters] = useState<ReportFilters>({
    format: 'csv',
    startDate: new Date(new Date().setDate(1)), // Primeiro dia do mês
    endDate: new Date(),
    limit: 20,
  })

  const [monthlyFinancialFilters, setMonthlyFinancialFilters] = useState<ReportFilters>({
    format: 'csv',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  const [tableOccupancyFilters, setTableOccupancyFilters] = useState<ReportFilters>({
    format: 'csv',
    startDate: new Date(new Date().setDate(1)),
    endDate: new Date(),
  })

  /**
   * Função genérica para gerar e baixar relatório
   */
  const generateReport = async (endpoint: string, filters: any, reportName: string) => {
    try {
      setLoading(true)
      
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
      const fullUrl = `${API_URL}${endpoint}`
      const token = apiClient.getToken()
      
      // console.log('🔍 Gerando relatório:')
      // console.log('  URL:', fullUrl)
      // console.log('  Token:', token ? 'Presente' : 'Ausente')
      // console.log('  Filtros:', filters)
      
      if (!token) {
        throw new Error('Você precisa estar logado para gerar relatórios')
      }
      
      // Fazer requisição para o backend usando fetch
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      // console.log('📡 Resposta:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Erro na resposta:', errorText)
        let errorMessage = 'Erro ao gerar relatório'
        
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.message || errorMessage
        } catch (e) {
          console.error('Erro ao parsear resposta:', errorText)
        }
        
        throw new Error(errorMessage)
      }

      // Pegar o blob do arquivo
      const blob = await response.blob()
      
      // Criar URL temporária
      const url = window.URL.createObjectURL(blob)
      
      // Criar link para download
      const link = document.createElement('a')
      link.href = url
      link.download = `${reportName}_${Date.now()}.${filters.format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL temporária
      window.URL.revokeObjectURL(url)
      
      toast.success('Relatório gerado com sucesso!')
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      toast.error(error.message || 'Erro ao gerar relatório')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Gera relatório de vendas diário
   */
  const handleDailySales = () => {
    const filters: any = {
      format: dailySalesFilters.format,
    }

    if (dailySalesFilters.date) {
      filters.date = format(dailySalesFilters.date, 'yyyy-MM-dd')
    }

    generateReport(endpoints.reports.dailySales, filters, 'vendas_diario')
  }

  /**
   * Gera relatório de clientes
   */
  const handleClients = () => {
    const filters: any = {
      format: clientsFilters.format,
    }

    generateReport(endpoints.reports.clients, filters, 'clientes')
  }

  /**
   * Gera relatório de top produtos
   */
  const handleTopProducts = () => {
    const filters: any = {
      format: topProductsFilters.format,
      limit: topProductsFilters.limit || 20,
    }

    if (topProductsFilters.startDate) {
      filters.start_date = format(topProductsFilters.startDate, 'yyyy-MM-dd')
    }

    if (topProductsFilters.endDate) {
      filters.end_date = format(topProductsFilters.endDate, 'yyyy-MM-dd')
    }

    generateReport(endpoints.reports.topProducts, filters, 'top_produtos')
  }

  /**
   * Gera relatório financeiro mensal
   */
  const handleMonthlyFinancial = () => {
    const filters: any = {
      format: monthlyFinancialFilters.format,
      month: monthlyFinancialFilters.month || new Date().getMonth() + 1,
      year: monthlyFinancialFilters.year || new Date().getFullYear(),
    }

    generateReport(endpoints.reports.monthlyFinancial, filters, 'financeiro_mensal')
  }

  /**
   * Gera relatório de ocupação de mesas
   */
  const handleTableOccupancy = () => {
    const filters: any = {
      format: tableOccupancyFilters.format,
    }

    if (tableOccupancyFilters.startDate) {
      filters.start_date = format(tableOccupancyFilters.startDate, 'yyyy-MM-dd')
    }

    if (tableOccupancyFilters.endDate) {
      filters.end_date = format(tableOccupancyFilters.endDate, 'yyyy-MM-dd')
    }

    generateReport(endpoints.reports.tableOccupancy, filters, 'ocupacao_mesas')
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <p className="text-muted-foreground">Gere relatórios detalhados do sistema</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Relatório de Vendas Diário */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Vendas Diário
            </CardTitle>
            <CardDescription>
              Relatório detalhado de vendas por dia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dailySalesFilters.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dailySalesFilters.date ? format(dailySalesFilters.date, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dailySalesFilters.date}
                    onSelect={(date) => setDailySalesFilters({ ...dailySalesFilters, date: date! })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={dailySalesFilters.format}
                onValueChange={(value: any) => setDailySalesFilters({ ...dailySalesFilters, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleDailySales}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes
            </CardTitle>
            <CardDescription>
              Estatísticas e informações de clientes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={clientsFilters.format}
                onValueChange={(value: any) => setClientsFilters({ ...clientsFilters, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleClients}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Produtos Mais Vendidos
            </CardTitle>
            <CardDescription>
              Ranking dos produtos mais vendidos no período
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {topProductsFilters.startDate ? format(topProductsFilters.startDate, "dd/MM/yy") : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={topProductsFilters.startDate}
                      onSelect={(date) => setTopProductsFilters({ ...topProductsFilters, startDate: date! })}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {topProductsFilters.endDate ? format(topProductsFilters.endDate, "dd/MM/yy") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={topProductsFilters.endDate}
                      onSelect={(date) => setTopProductsFilters({ ...topProductsFilters, endDate: date! })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={topProductsFilters.format}
                onValueChange={(value: any) => setTopProductsFilters({ ...topProductsFilters, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleTopProducts}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        {/* Relatório Financeiro Mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Financeiro Mensal
            </CardTitle>
            <CardDescription>
              Análise financeira detalhada do mês
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Mês</Label>
                <Select
                  value={monthlyFinancialFilters.month?.toString() || ''}
                  onValueChange={(value) => setMonthlyFinancialFilters({ ...monthlyFinancialFilters, month: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {format(new Date(2025, i), 'MMMM', { locale: ptBR })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ano</Label>
                <Select
                  value={monthlyFinancialFilters.year?.toString() || ''}
                  onValueChange={(value) => setMonthlyFinancialFilters({ ...monthlyFinancialFilters, year: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - i
                      return (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={monthlyFinancialFilters.format}
                onValueChange={(value: any) => setMonthlyFinancialFilters({ ...monthlyFinancialFilters, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleMonthlyFinancial}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>

        {/* Relatório de Ocupação de Mesas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Ocupação de Mesas
            </CardTitle>
            <CardDescription>
              Análise de ocupação e faturamento por mesa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tableOccupancyFilters.startDate ? format(tableOccupancyFilters.startDate, "dd/MM/yy") : "Início"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tableOccupancyFilters.startDate}
                      onSelect={(date) => setTableOccupancyFilters({ ...tableOccupancyFilters, startDate: date! })}
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {tableOccupancyFilters.endDate ? format(tableOccupancyFilters.endDate, "dd/MM/yy") : "Fim"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={tableOccupancyFilters.endDate}
                      onSelect={(date) => setTableOccupancyFilters({ ...tableOccupancyFilters, endDate: date! })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Formato</Label>
              <Select
                value={tableOccupancyFilters.format}
                onValueChange={(value: any) => setTableOccupancyFilters({ ...tableOccupancyFilters, format: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Excel)</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full" 
              onClick={handleTableOccupancy}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
