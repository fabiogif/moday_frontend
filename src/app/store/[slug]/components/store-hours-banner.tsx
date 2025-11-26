'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface StoreHoursData {
  is_open: boolean
  is_always_open: boolean
  current_time: string
  current_day: string
  store_hours: Record<string, Array<{ start: string; end: string; delivery_type: string }>>
}

interface StoreHoursBannerProps {
  slug: string
  onStatusChange?: (isOpen: boolean) => void
}

export function StoreHoursBanner({ slug, onStatusChange }: StoreHoursBannerProps) {
  const [hoursData, setHoursData] = useState<StoreHoursData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStoreHours = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost'
        const response = await fetch(`${apiUrl}/api/store/${slug}/is-open`)
        const data = await response.json()

        if (data.success) {
          setHoursData(data.data)
          // Notificar componente pai sobre o status
          if (onStatusChange) {
            onStatusChange(data.data.is_open || data.data.is_always_open)
          }
        }
      } catch (error) {

        // Em caso de erro, assumir que está aberto (não bloquear loja)
        if (onStatusChange) {
          onStatusChange(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchStoreHours()
    
    // Atualizar a cada 5 minutos
    const interval = setInterval(fetchStoreHours, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [slug])

  if (loading || !hoursData) {
    return null
  }

  // Sempre aberto
  if (hoursData.is_always_open) {
    return (
      <div className="bg-green-500 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Clock className="h-5 w-5" />
          <span className="font-medium">
            🟢 Estamos abertos! Aceitamos pedidos 24 horas
          </span>
        </div>
      </div>
    )
  }

  // Loja aberta
  if (hoursData.is_open) {
    const todayHours = hoursData.store_hours[hoursData.current_day] || []
    
    return (
      <div className="bg-green-500 text-white py-3 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-medium">
                🟢 Estamos abertos!
              </span>
            </div>
            {todayHours.length > 0 && (
              <span className="text-sm">
                Horários de hoje: {todayHours.map((h, i) => (
                  <span key={i}>
                    {i > 0 && ' e '}
                    {h.start} às {h.end}
                  </span>
                ))}
              </span>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Loja fechada
  const allHours = hoursData.store_hours
  const hasHours = Object.keys(allHours).length > 0

  return (
    <div className="bg-red-500 text-white py-4 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-6 w-6" />
            <span className="text-lg font-bold">
              🔴 Loja fechada no momento
            </span>
          </div>
          
          <p className="text-sm opacity-90">
            Atualmente estamos fora do horário de atendimento.
          </p>

          {hasHours && (
            <div className="mt-2 bg-white/10 rounded-lg p-3 max-w-2xl">
              <p className="font-semibold mb-2">Nossos horários de funcionamento:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {Object.entries(allHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center">
                    <span className="font-medium">{day}:</span>
                    <span>
                      {hours.map((h, i) => (
                        <span key={i}>
                          {i > 0 && ', '}
                          {h.start}-{h.end}
                        </span>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs opacity-75 mt-2">
            Você pode adicionar produtos ao carrinho, mas só poderá finalizar quando estivermos abertos.
          </p>
        </div>
      </div>
    </div>
  )
}

