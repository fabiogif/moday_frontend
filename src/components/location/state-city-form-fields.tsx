"use client"

import { Control, FieldValues, Path, useWatch } from "react-hook-form"
import { useEffect } from "react"
import { useStates, useCitiesByState } from "@/hooks/use-location"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"

interface StateCityFormFieldsProps<T extends FieldValues> {
  control: Control<T>
  stateFieldName: Path<T>
  cityFieldName: Path<T>
  stateLabel?: string
  cityLabel?: string
  required?: boolean
  disabled?: boolean
  onStateChange?: (value: string) => void
  gridCols?: "equal" | "state-small" // equal: 1-1, state-small: 1-2
}

export function StateCityFormFields<T extends FieldValues>({
  control,
  stateFieldName,
  cityFieldName,
  stateLabel = "Estado",
  cityLabel = "Cidade",
  required = false,
  disabled = false,
  onStateChange,
  gridCols = "state-small",
}: StateCityFormFieldsProps<T>) {
  const { states, loading: loadingStates } = useStates()

  // Observar mudanças no campo de estado usando useWatch (reativo)
  const stateField = useWatch({
    control,
    name: stateFieldName,
  })
  
  const cityField = useWatch({
    control,
    name: cityFieldName,
  })
  
  const { cities, loading: loadingCities } = useCitiesByState(stateField || null)

  // Debug
  useEffect(() => {
    console.log('StateCityFormFields - Debug:', {
      stateField,
      citiesCount: cities?.length || 0,
      loadingCities,
      cities: cities?.slice(0, 3).map(c => c.name)
    })
  }, [stateField, cities, loadingCities])

  // Notificar quando estado mudar
  useEffect(() => {
    if (stateField && onStateChange) {
      onStateChange(stateField)
    }
  }, [stateField, onStateChange])

  // Limpar cidade quando estado mudar
  useEffect(() => {
    if (stateField && cityField) {
      const cityExists = cities.some(city => city.name === cityField)
      if (!cityExists && cities.length > 0) {
        control._formState.dirtyFields[cityFieldName as string] = true
        // Não limpa automaticamente para não perder o valor durante carregamento
      }
    }
  }, [stateField, cities, cityField, cityFieldName, control])

  return (
    <>
      {/* Campo de Estado */}
      <FormField
        control={control}
        name={stateFieldName}
        render={({ field }) => (
            <FormItem className={gridCols === "state-small" ? "" : ""}>
              <FormLabel>
                {stateLabel} {required && <span className="text-red-500">*</span>}
              </FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled || loadingStates}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-[300px]">
                  {loadingStates ? (
                    <SelectItem value="_loading" disabled>
                      Carregando...
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
              <FormMessage />
            </FormItem>
        )}
      />

      {/* Campo de Cidade */}
      <FormField
        control={control}
        name={cityFieldName}
        render={({ field }) => (
          <FormItem className={gridCols === "state-small" ? "md:col-span-2" : ""}>
            <FormLabel>
              {cityLabel} {required && <span className="text-red-500">*</span>}
            </FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled || !stateField || loadingCities}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !stateField
                        ? "Selecione um estado primeiro"
                        : loadingCities
                        ? "Carregando..."
                        : "Selecione"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-[300px]">
                {loadingCities ? (
                  <SelectItem value="_loading" disabled>
                    Carregando...
                  </SelectItem>
                ) : !cities || cities.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    Nenhuma cidade encontrada
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
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  )
}

