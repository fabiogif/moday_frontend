"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, Package } from "lucide-react"
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api"
import { endpoints } from "@/lib/api-client"

interface OrdersVolumeData {
  date: string
  orders: number
  completed: number
}

const chartConfig = {
  orders: {
    label: "Total de Pedidos",
    color: "hsl(217, 91%, 60%)", // Azul vibrante
  },
  completed: {
    label: "Pedidos Concluídos",
    color: "hsl(142, 71%, 45%)", // Verde sucesso
  },
}

export function OrdersVolumeChart() {
  const [chartData, setChartData] = useState<OrdersVolumeData[]>([])
  const [loading, setLoading] = useState(true)
  
  // Buscar dados dos pedidos
  const { data: orders } = useAuthenticatedApi<any[]>(endpoints.orders.list)
  
  useEffect(() => {
    if (orders) {
      // Agrupar pedidos por data dos últimos 7 dias
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - i))
        return {
          dateString: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        }
      })
      
     // // 
      
      const groupedData = last7Days.map(({ dateString, label }) => {
        const dateOrders = Array.isArray(orders) ? orders.filter((order: any) => {
          const dateValue = order.created_at || order.createdAt || order.date
          if (!dateValue) return false
          
          try {
            // Extrair apenas a data (ignorar hora)
            let orderDateString: string
            
            if (typeof dateValue === 'string') {
              // Se já é string, extrair a parte da data
              orderDateString = dateValue.split(' ')[0].split('T')[0]
              
              // Converter formato brasileiro (dd/mm/yyyy) para ISO (yyyy-mm-dd)
              if (orderDateString.includes('/')) {
                const [day, month, year] = orderDateString.split('/')
                orderDateString = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
              }
            } else {
              orderDateString = new Date(dateValue).toISOString().split('T')[0]
            }
            
           // // 
            return orderDateString === dateString
          } catch (error) {

            return false
          }
        }) : []
        
        const completed = dateOrders.filter((order: any) => 
          order.status === 'Entregue' || order.status === 'completed'
        ).length
        
        //// :`, dateOrders.length, 'orders,', completed, 'completed')
        
        return {
          date: label,
          orders: dateOrders.length,
          completed: completed
        }
      })
      
      setChartData(groupedData)
      setLoading(false)
    }
  }, [orders])
  
  // Calcular crescimento
  const growth = chartData.length >= 2 
    ? ((chartData[chartData.length - 1].orders - chartData[chartData.length - 2].orders) / 
       (chartData[chartData.length - 2].orders || 1) * 100).toFixed(1)
    : 0
  
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Volume de Pedidos</CardTitle>
          <CardDescription>Últimos 7 dias</CardDescription>
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
              <Package className="h-5 w-5" />
              Volume de Pedidos
            </CardTitle>
            <CardDescription>Últimos 7 dias</CardDescription>
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
                dataKey="date" 
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
                dataKey="orders" 
                fill="var(--color-orders)" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="completed" 
                fill="var(--color-completed)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(217, 91%, 60%)" }}></div>
            <span className="text-muted-foreground">Total de Pedidos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: "hsl(142, 71%, 45%)" }}></div>
            <span className="text-muted-foreground">Pedidos Concluídos</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

