"use client"

import { useEffect } from "react"
import { useStates, useCitiesByState } from "@/hooks/use-location"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface StateCitySelectProps {
  stateValue?: string
  cityValue?: string
  onStateChange: (value: string) => void
  onCityChange: (value: string) => void
  stateError?: string
  cityError?: string
  disabled?: boolean
  required?: boolean
}

export function StateCitySelect({
  stateValue,
  cityValue,
  onStateChange,
  onCityChange,
  stateError,
  cityError,
  disabled = false,
  required = false,
}: StateCitySelectProps) {
  const { states, loading: loadingStates } = useStates()
  const { cities, loading: loadingCities } = useCitiesByState(stateValue || null)

  // Limpar cidade quando estado mudar (apenas se a cidade não pertence ao novo estado)
  useEffect(() => {
    if (stateValue && cityValue && cities.length > 0) {
      const cityExists = cities.some(city => city.name === cityValue)
      if (!cityExists) {
        // Aguardar um pouco antes de limpar para dar tempo do CEP setar os valores
        const timer = setTimeout(() => {
          const stillNotExists = cities.some(city => city.name === cityValue)
          if (!stillNotExists) {
            onCityChange("")
          }
        }, 100)
        return () => clearTimeout(timer)
      }
    }
  }, [stateValue, cities])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Select de Estado */}
      <div className="space-y-2">
        <label className="text-sm font-medium">
          Estado {required && <span className="text-red-500">*</span>}
        </label>
        {loadingStates ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={stateValue}
            onValueChange={onStateChange}
            disabled={disabled || loadingStates}
          >
            <SelectTrigger className={stateError ? "border-red-500" : ""}>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              {!states || states.length === 0 ? (
                <SelectItem value="_empty" disabled>
                  Nenhum estado disponível
                </SelectItem>
              ) : (
                states.map((state) => (
                  <SelectItem key={state.id} value={state.uf}>
                    {state.name} ({state.uf})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
        {stateError && (
          <p className="text-sm text-red-500">{stateError}</p>
        )}
      </div>

      {/* Select de Cidade */}
      <div className="md:col-span-2 space-y-2">
        <label className="text-sm font-medium">
          Cidade {required && <span className="text-red-500">*</span>}
        </label>
        {loadingCities ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <Select
            value={cityValue}
            onValueChange={onCityChange}
            disabled={disabled || !stateValue || loadingCities}
          >
            <SelectTrigger className={cityError ? "border-red-500" : ""}>
              <SelectValue 
                placeholder={
                  !stateValue 
                    ? "Primeiro selecione um estado" 
                    : cities.length === 0 
                    ? "Carregando..." 
                    : "Selecione a cidade"
                } 
              />
            </SelectTrigger>
            <SelectContent>
              {!cities || cities.length === 0 ? (
                <SelectItem value="_empty" disabled>
                  Nenhuma cidade disponível
                </SelectItem>
              ) : (
                cities.map((city) => (
                  <SelectItem key={city.id} value={city.name}>
                    {city.name}
                    {city.is_capital && " (Capital)"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
        {cityError && (
          <p className="text-sm text-red-500">{cityError}</p>
        )}
      </div>
    </div>
  )
}

