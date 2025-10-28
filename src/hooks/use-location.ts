import { useState, useEffect } from 'react'
import { apiClient, endpoints } from '@/lib/api-client'

export interface State {
  id: number
  uf: string
  name: string
}

export interface City {
  id: number
  name: string
  is_capital: boolean
  state?: {
    id: number
    uf: string
    name: string
  }
}

export function useStates() {
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStates()
  }, [])

  async function loadStates() {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ success: boolean; data: { success: boolean; data: State[] } }>(endpoints.states.list)
      
      if (response.success && response.data?.data) {
        setStates(Array.isArray(response.data.data) ? response.data.data : [])
      } else {
        setError('Erro ao carregar estados')
        setStates([])
      }
    } catch (err) {
      console.error('Error loading states:', err)
      setError('Erro ao carregar estados')
      setStates([])
    } finally {
      setLoading(false)
    }
  }

  return { states: states || [], loading, error, refresh: loadStates }
}

export function useCitiesByState(uf: string | null) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (uf) {
      loadCities(uf)
    } else {
      setCities([])
    }
  }, [uf])

  async function loadCities(stateUf: string) {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ 
        success: boolean
        data: { 
          success: boolean
          data: {
            state: State
            cities: City[] 
          }
        } 
      }>(endpoints.states.cities(stateUf))
      
      if (response.success && response.data?.data && 'cities' in response.data.data) {
        setCities(Array.isArray((response.data.data as any).cities) ? (response.data.data as any).cities : [])
      } else {
        setError('Erro ao carregar cidades')
        setCities([])
      }
    } catch (err) {
      console.error('Error loading cities:', err)
      setError('Erro ao carregar cidades')
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  return { cities: cities || [], loading, error, refresh: () => uf && loadCities(uf) }
}

export function useSearchCities(searchTerm: string, minLength = 2) {
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (searchTerm && searchTerm.length >= minLength) {
      const timer = setTimeout(() => {
        searchCities(searchTerm)
      }, 300) // Debounce

      return () => clearTimeout(timer)
    } else {
      setCities([])
    }
  }, [searchTerm, minLength])

  async function searchCities(query: string) {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get<{ 
        success: boolean
        data: {
          success: boolean
          data: City[]
        }
      }>(
        `${endpoints.cities.search}?q=${encodeURIComponent(query)}`
      )
      
      if (response.success && response.data?.data) {
        setCities(Array.isArray(response.data.data) ? response.data.data : [])
      } else {
        setError('Erro ao pesquisar cidades')
        setCities([])
      }
    } catch (err) {
      console.error('Error searching cities:', err)
      setError('Erro ao pesquisar cidades')
      setCities([])
    } finally {
      setLoading(false)
    }
  }

  return { cities: cities || [], loading, error }
}

