"use client"

import { useEffect, useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  BarChart3,
} from "lucide-react"
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/auth-context"
import { useRealtimeDashboard } from "@/hooks/use-realtime-dashboard"
import { useAuthenticatedApi } from "@/hooks/use-authenticated-api"
import { apiClient } from "@/lib/api-client"
import { Area, AreaChart, ResponsiveContainer } from "recharts"

interface MetricData {
  value: number
  formatted?: string
  growth: number
  trend: "up" | "down"
  subtitle: string
  description: string
  chart_data?: Array<{ month: string; revenue: number }>
}

interface MetricsData {
  total_revenue: MetricData
  active_clients: MetricData
  total_orders: MetricData
  conversion_rate: MetricData
}

function MiniSparkline({ data, trend }: { data?: Array<{ month: string; revenue: number }>; trend: "up" | "down" }) {
  if (!data || data.length < 2) return null
  const color = trend === "up" ? "var(--chart-2)" : "var(--chart-5)"
  return (
    <div className="h-10 w-full opacity-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`sparkGrad-${trend}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#sparkGrad-${trend})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const iconColors = [
  "text-primary bg-primary/10",
  "text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400",
  "text-violet-600 bg-violet-50 dark:bg-violet-950 dark:text-violet-400",
  "text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400",
]

export function MetricsOverview() {
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth()
  const [metrics, setMetrics] = useState<MetricsData | null>(null)

  const { data: metricsData, loading, error, refetch } = useAuthenticatedApi<MetricsData>(
    "/api/dashboard/metrics",
    { immediate: false }
  )

  useEffect(() => {
    if (token) {
      apiClient.setToken(token)
      apiClient.reloadToken()
    }
  }, [token])

  const { isConnected } = useRealtimeDashboard({
    tenantId: user?.tenant_id ? parseInt(user.tenant_id) : 0,
    enabled: isAuthenticated && !!user?.tenant_id,
    onMetricsUpdate: () => {
      refetch()
    },
  })

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.tenant_id) {
      refetch()
    }
  }, [authLoading, isAuthenticated, user?.tenant_id, refetch])

  useEffect(() => {
    if (metricsData) {
      setMetrics(metricsData)
    }
  }, [metricsData])

  if (authLoading || loading || !metrics) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-6 w-20" />
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const metricsConfig = [
    {
      title: "Receita Total",
      value: metrics.total_revenue.formatted || `R$ ${metrics.total_revenue.value.toFixed(2)}`,
      change: `${metrics.total_revenue.growth >= 0 ? "+" : ""}${metrics.total_revenue.growth.toFixed(1)}%`,
      trend: metrics.total_revenue.trend,
      icon: DollarSign,
      footer: metrics.total_revenue.subtitle,
      subfooter: metrics.total_revenue.description,
      chartData: metrics.total_revenue.chart_data,
    },
    {
      title: "Clientes Ativos",
      value: metrics.active_clients.value.toString(),
      change: `${metrics.active_clients.growth >= 0 ? "+" : ""}${metrics.active_clients.growth.toFixed(1)}%`,
      trend: metrics.active_clients.trend,
      icon: Users,
      footer: metrics.active_clients.subtitle,
      subfooter: metrics.active_clients.description,
      chartData: metrics.active_clients.chart_data,
    },
    {
      title: "Total de Pedidos",
      value: metrics.total_orders.value.toString(),
      change: `${metrics.total_orders.growth >= 0 ? "+" : ""}${metrics.total_orders.growth.toFixed(1)}%`,
      trend: metrics.total_orders.trend,
      icon: ShoppingCart,
      footer: metrics.total_orders.subtitle,
      subfooter: metrics.total_orders.description,
      chartData: metrics.total_orders.chart_data,
    },
    {
      title: "Taxa de Conversão",
      value: metrics.conversion_rate.formatted || `${metrics.conversion_rate.value.toFixed(1)}%`,
      change: `${metrics.conversion_rate.growth >= 0 ? "+" : ""}${metrics.conversion_rate.growth.toFixed(1)}%`,
      trend: metrics.conversion_rate.trend,
      icon: BarChart3,
      footer: metrics.conversion_rate.subtitle,
      subfooter: metrics.conversion_rate.description,
      chartData: metrics.conversion_rate.chart_data,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 @5xl:grid-cols-4">
      {metricsConfig.map((metric, index) => {
        const TrendIcon = metric.trend === "up" ? TrendingUp : TrendingDown
        const trendColor = metric.trend === "up"
          ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400"
          : "text-rose-600 border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-400"

        return (
          <Card key={metric.title} className="cursor-pointer overflow-hidden transition-shadow hover:shadow-md">
            {isConnected && index === 0 && (
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm font-medium">{metric.title}</CardDescription>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColors[index]}`}>
                  <metric.icon className="h-4 w-4" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold tabular-nums @[250px]/card:text-3xl mt-1">
                {metric.value}
              </CardTitle>
              <CardAction>
                <Badge variant="outline" className={`text-xs font-medium ${trendColor}`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  {metric.change}
                </Badge>
              </CardAction>
            </CardHeader>

            {metric.chartData && metric.chartData.length > 1 && (
              <div className="px-6 pb-0">
                <MiniSparkline data={metric.chartData} trend={metric.trend} />
              </div>
            )}

            <CardFooter className="flex-col items-start gap-1 text-sm pt-2">
              <div className="line-clamp-1 flex gap-2 font-medium text-foreground/80">
                {metric.footer}
              </div>
              <div className="text-xs text-muted-foreground">{metric.subfooter}</div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
