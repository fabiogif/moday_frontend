"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Percent, DollarSign, Package, Truck, Save, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api-client"
import { PageLoading } from "@/components/ui/loading-progress"

interface DeliveryPickupSettings {
  // Retirada no Local
  pickup_enabled: boolean
  pickup_time_minutes: number
  pickup_discount_enabled: boolean
  pickup_discount_percent: number
  
  // Delivery
  delivery_enabled: boolean
  delivery_minimum_order_enabled: boolean
  delivery_minimum_order_value: number
  delivery_free_above_enabled: boolean
  delivery_free_above_value: number
}

const defaultSettings: DeliveryPickupSettings = {
  pickup_enabled: true,
  pickup_time_minutes: 35,
  pickup_discount_enabled: false,
  pickup_discount_percent: 0,
  delivery_enabled: true,
  delivery_minimum_order_enabled: true,
  delivery_minimum_order_value: 20.00,
  delivery_free_above_enabled: false,
  delivery_free_above_value: 300.00,
}

export default function DeliverySettingsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [settings, setSettings] = useState<DeliveryPickupSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Carregar configurações atuais
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        
        // Buscar dados do tenant
        const response = await apiClient.get('/api/auth/me')
        
        if (response.success && response.data) {
          const userData = response.data as any
          const tenantSettings = userData.tenant?.settings || {}
          
          // Mesclar com defaults
          setSettings({
            ...defaultSettings,
            ...tenantSettings.delivery_pickup
          })
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao carregar configurações",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [toast])

  // Detectar mudanças
  useEffect(() => {
    setHasChanges(true)
  }, [settings])

  const handleSave = async () => {
    try {
      setSaving(true)

      // Buscar tenant UUID
      const userResponse = await apiClient.get('/api/auth/me')
      const tenantUuid = userResponse.data?.tenant?.uuid

      if (!tenantUuid) {
        throw new Error('Tenant não encontrado')
      }

      // Atualizar tenant com novas configurações
      const response = await apiClient.put(`/api/tenant/${tenantUuid}`, {
        settings: {
          delivery_pickup: settings
        }
      })

      if (response.success) {
        toast({
          title: "Sucesso!",
          description: "Configurações de delivery e retirada salvas com sucesso",
        })
        setHasChanges(false)
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar configurações",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <PageLoading isLoading={loading} message="Carregando configurações..." />
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Delivery e Retirada</h1>
        <p className="text-muted-foreground">
          Configure como os clientes podem receber seus pedidos
        </p>
      </div>

      {/* Alerta de Mudanças */}
      {hasChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Você tem alterações não salvas. Clique em "Salvar Configurações" para aplicar.
          </AlertDescription>
        </Alert>
      )}

      {/* Retirada no Local */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            <CardTitle>Retirada no Local</CardTitle>
          </div>
          <CardDescription>
            Configure as opções de retirada no estabelecimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ativar Retirada */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="pickup_enabled" className="text-base font-medium">
                Permitir Retirada no Local
              </Label>
              <p className="text-sm text-muted-foreground">
                Clientes poderão escolher retirar o pedido no estabelecimento
              </p>
            </div>
            <Switch
              id="pickup_enabled"
              checked={settings.pickup_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, pickup_enabled: checked })
              }
            />
          </div>

          {/* Tempo de Retirada */}
          <div className={`space-y-2 transition-opacity ${settings.pickup_enabled ? 'opacity-100' : 'opacity-50'}`}>
            <Label htmlFor="pickup_time_minutes" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tempo para Retirada (minutos)
            </Label>
            <Input
              id="pickup_time_minutes"
              type="number"
              min="0"
              value={settings.pickup_time_minutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  pickup_time_minutes: Number(e.target.value) || 0
                })
              }
              placeholder="35"
              disabled={!settings.pickup_enabled}
              className={!settings.pickup_enabled ? 'bg-muted cursor-not-allowed' : ''}
            />
            <p className="text-xs text-muted-foreground">
              Tempo estimado para o cliente retirar o pedido (padrão: 35 minutos)
            </p>
          </div>

          {/* Desconto para Retirada */}
          <div className={`space-y-4 transition-opacity ${settings.pickup_enabled ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="pickup_discount_enabled" className="text-base font-medium">
                  Desconto para Retirada no Local
                </Label>
                <p className="text-sm text-muted-foreground">
                  Oferecer desconto percentual para quem retirar no local
                </p>
              </div>
              <Switch
                id="pickup_discount_enabled"
                checked={settings.pickup_discount_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, pickup_discount_enabled: checked })
                }
                disabled={!settings.pickup_enabled}
              />
            </div>

            <div className={`space-y-2 pl-6 border-l-2 transition-opacity ${
              settings.pickup_enabled && settings.pickup_discount_enabled ? 'opacity-100' : 'opacity-50'
            }`}>
              <Label htmlFor="pickup_discount_percent" className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                Percentual de Desconto (%)
              </Label>
              <Input
                id="pickup_discount_percent"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={settings.pickup_discount_percent}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    pickup_discount_percent: Number(e.target.value) || 0
                  })
                }
                placeholder="0"
                disabled={!settings.pickup_enabled || !settings.pickup_discount_enabled}
                className={!settings.pickup_enabled || !settings.pickup_discount_enabled ? 'bg-muted cursor-not-allowed' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Desconto aplicado no total do pedido para retirada (ex: 10 = 10% off)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <CardTitle>Delivery (Entrega)</CardTitle>
          </div>
          <CardDescription>
            Configure as opções de entrega em domicílio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Ativar Delivery */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="delivery_enabled" className="text-base font-medium">
                Permitir Delivery
              </Label>
              <p className="text-sm text-muted-foreground">
                Clientes poderão escolher receber o pedido em casa
              </p>
            </div>
            <Switch
              id="delivery_enabled"
              checked={settings.delivery_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, delivery_enabled: checked })
              }
            />
          </div>

          {/* Pedido Mínimo */}
          <div className={`space-y-4 transition-opacity ${settings.delivery_enabled ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="delivery_minimum_order_enabled" className="text-base font-medium">
                  Exigir Pedido Mínimo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Definir valor mínimo para aceitar pedidos de delivery
                </p>
              </div>
              <Switch
                id="delivery_minimum_order_enabled"
                checked={settings.delivery_minimum_order_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, delivery_minimum_order_enabled: checked })
                }
                disabled={!settings.delivery_enabled}
              />
            </div>

            <div className={`space-y-2 pl-6 border-l-2 transition-opacity ${
              settings.delivery_enabled && settings.delivery_minimum_order_enabled ? 'opacity-100' : 'opacity-50'
            }`}>
              <Label htmlFor="delivery_minimum_order_value" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor Mínimo do Pedido (R$)
              </Label>
              <Input
                id="delivery_minimum_order_value"
                type="number"
                min="0"
                step="0.01"
                value={settings.delivery_minimum_order_value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery_minimum_order_value: Number(e.target.value) || 0
                  })
                }
                placeholder="20.00"
                disabled={!settings.delivery_enabled || !settings.delivery_minimum_order_enabled}
                className={!settings.delivery_enabled || !settings.delivery_minimum_order_enabled ? 'bg-muted cursor-not-allowed' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Pedidos abaixo deste valor não poderão escolher delivery (padrão: R$ 20,00)
              </p>
            </div>
          </div>

          {/* Entrega Grátis */}
          <div className={`space-y-4 transition-opacity ${settings.delivery_enabled ? 'opacity-100' : 'opacity-50'}`}>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="delivery_free_above_enabled" className="text-base font-medium">
                  Entrega Grátis Acima de
                </Label>
                <p className="text-sm text-muted-foreground">
                  Oferecer frete grátis para pedidos grandes
                </p>
              </div>
              <Switch
                id="delivery_free_above_enabled"
                checked={settings.delivery_free_above_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, delivery_free_above_enabled: checked })
                }
                disabled={!settings.delivery_enabled}
              />
            </div>

            <div className={`space-y-2 pl-6 border-l-2 transition-opacity ${
              settings.delivery_enabled && settings.delivery_free_above_enabled ? 'opacity-100' : 'opacity-50'
            }`}>
              <Label htmlFor="delivery_free_above_value" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Valor para Entrega Grátis (R$)
              </Label>
              <Input
                id="delivery_free_above_value"
                type="number"
                min="0"
                step="0.01"
                value={settings.delivery_free_above_value}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    delivery_free_above_value: Number(e.target.value) || 0
                  })
                }
                placeholder="300.00"
                disabled={!settings.delivery_enabled || !settings.delivery_free_above_enabled}
                className={!settings.delivery_enabled || !settings.delivery_free_above_enabled ? 'bg-muted cursor-not-allowed' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Pedidos acima deste valor terão entrega gratuita (padrão: R$ 300,00)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Configurações</CardTitle>
          <CardDescription>
            Veja como as configurações aparecerão para os clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Retirada */}
          {settings.pickup_enabled ? (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Package className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Retirada no Local</p>
                <p className="text-sm text-muted-foreground">
                  Pronto em aproximadamente {settings.pickup_time_minutes} minutos
                </p>
                {settings.pickup_discount_enabled && settings.pickup_discount_percent > 0 && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    🎉 {settings.pickup_discount_percent}% de desconto
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg opacity-50">
              <Package className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Retirada no Local</p>
                <p className="text-sm text-muted-foreground">Desabilitada</p>
              </div>
            </div>
          )}

          {/* Delivery */}
          {settings.delivery_enabled ? (
            <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
              <Truck className="w-5 h-5 mt-0.5 text-primary" />
              <div className="flex-1">
                <p className="font-medium">Delivery (Entrega)</p>
                {settings.delivery_minimum_order_enabled && settings.delivery_minimum_order_value > 0 && (
                  <p className="text-sm text-muted-foreground">
                    Pedido mínimo: R$ {settings.delivery_minimum_order_value.toFixed(2)}
                  </p>
                )}
                {settings.delivery_free_above_enabled && settings.delivery_free_above_value > 0 && (
                  <p className="text-sm text-green-600 font-medium">
                    🎉 Frete grátis acima de R$ {settings.delivery_free_above_value.toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg opacity-50">
              <Truck className="w-5 h-5 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">Delivery (Entrega)</p>
                <p className="text-sm text-muted-foreground">Desabilitado</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botão de Salvar */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          disabled={saving || !hasChanges}
          className="cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="cursor-pointer"
          size="lg"
        >
          <Save className="w-4 h-4 mr-2" />
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  )
}

