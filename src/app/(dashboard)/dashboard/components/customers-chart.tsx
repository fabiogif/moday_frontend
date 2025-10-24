"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Users, TrendingUp } from "lucide-react"
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api"
import { endpoints } from "@/lib/api-client"

interface CustomersData {
  month: string
  newCustomers: number
  returningCustomers: number
  total: number
}

const chartConfig = {
  newCustomers: {
    label: "Novos Clientes",
    color: "hsl(262, 83%, 58%)", // Roxo vibrante
  },
  returningCustomers: {
    label: "Clientes Recorrentes",
    color: "hsl(37, 90%, 51%)", // Laranja/dourado
  },
}

export function CustomersChart() {
  const [chartData, setChartData] = useState<CustomersData[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCustomers, setTotalCustomers] = useState(0)
  
  // Buscar dados dos clientes
  const { data: clients } = useAuthenticatedApi<any[]>(endpoints.clients.list)
  
  useEffect(() => {
    if (clients) {
      // Agrupar clientes por mês dos últimos 6 meses
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - (5 - i))
        return {
          month: date.toLocaleDateString('pt-BR', { month: 'short' }),
          year: date.getFullYear(),
          monthIndex: date.getMonth()
        }
      })
      
      const clientsArray = Array.isArray(clients) ? clients : []
      setTotalCustomers(clientsArray.length)
      
      const groupedData = last6Months.map(({ month, year, monthIndex }) => {
        const monthClients = clientsArray.filter((client: any) => {
          const dateValue = client.created_at || client.createdAt
          if (!dateValue) return false
          
          try {
            const clientDate = new Date(dateValue)
            return clientDate.getMonth() === monthIndex && clientDate.getFullYear() === year
          } catch {
            return false
          }
        })
        
        // Simular clientes recorrentes (baseado em pedidos múltiplos - pode ser ajustado com dados reais)
        const newCustomers = monthClients.length
        const returningCustomers = Math.floor(newCustomers * 0.3) // 30% estimado
        
        return {
          month: month.charAt(0).toUpperCase() + month.slice(1),
          newCustomers: newCustomers,
          returningCustomers: returningCustomers,
          total: newCustomers + returningCustomers
        }
      })
      
      setChartData(groupedData)
      setLoading(false)
    }
  }, [clients])
  
  // Calcular crescimento mensal
  const growth = chartData.length >= 2 
    ? ((chartData[chartData.length - 1].total - chartData[chartData.length - 2].total) / 
       (chartData[chartData.length - 2].total || 1) * 100).toFixed(1)
    : 0
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Número de Clientes</CardTitle>
          <CardDescription>Últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Número de Clientes
            </CardTitle>
            <CardDescription>Últimos 6 meses • {totalCustomers} clientes totais</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className={`h-4 w-4 ${Number(growth) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`font-medium ${Number(growth) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {growth}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                className="text-xs"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="newCustomers" 
                fill="var(--color-newCustomers)" 
                radius={[4, 4, 0, 0]}
                stackId="customers"
              />
              <Bar 
                dataKey="returningCustomers" 
                fill="var(--color-returningCustomers)" 
                radius={[4, 4, 0, 0]}
                stackId="customers"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(262, 83%, 58%)" }}></div>
            <span className="text-muted-foreground">Novos Clientes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(37, 90%, 51%)" }}></div>
            <span className="text-muted-foreground">Clientes Recorrentes</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

