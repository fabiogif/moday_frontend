"use client"

import { FormEvent, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, parseISO } from "date-fns"

export type CouponFormValues = {
  code: string
  name: string
  description: string
  discount_type: "percentage" | "fixed"
  discount_value: string
  max_discount_amount: string
  minimum_order_amount: string
  usage_limit: string
  usage_limit_per_client: string
  start_at: string
  end_at: string
  is_active: boolean
  is_featured: boolean
}

const defaultValues: CouponFormValues = {
  code: "",
  name: "",
  description: "",
  discount_type: "percentage",
  discount_value: "10",
  max_discount_amount: "",
  minimum_order_amount: "",
  usage_limit: "",
  usage_limit_per_client: "",
  start_at: "",
  end_at: "",
  is_active: true,
  is_featured: false,
}

type CouponFormSubmitPayload = {
  values: CouponFormValues
  imageFile: File | null
  removeImage: boolean
}

interface CouponFormProps {
  mode: "create" | "edit"
  busy?: boolean
  initialValues?: Partial<CouponFormValues>
  initialImageUrl?: string | null
  onCancel?: () => void
  onSubmit: (payload: CouponFormSubmitPayload) => Promise<void>
}

export function CouponForm({
  mode,
  busy,
  initialValues,
  initialImageUrl = null,
  onCancel,
  onSubmit,
}: CouponFormProps) {
  const [formState, setFormState] = useState<CouponFormValues>({ ...defaultValues })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(initialImageUrl)
  const [removeImage, setRemoveImage] = useState(false)
  const [timeInputs, setTimeInputs] = useState({ start_at: "", end_at: "" })

  const parseDateValue = (value: string) => {
    if (!value) return undefined
    try {
      return parseISO(value)
    } catch (error) {
      return undefined
    }
  }

  useEffect(() => {
    const normalized = normalizeValues(initialValues)
    setFormState(normalized)

    const startDate = normalized.start_at ? parseDateValue(normalized.start_at) : undefined
    const endDate = normalized.end_at ? parseDateValue(normalized.end_at) : undefined

    setTimeInputs({
      start_at: startDate ? format(startDate, "HH:mm") : "",
      end_at: endDate ? format(endDate, "HH:mm") : "",
    })
  }, [initialValues])

  useEffect(() => {
    setImagePreview(initialImageUrl ?? null)
    setRemoveImage(false)
    setImageFile(null)
  }, [initialImageUrl])

  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleInputChange = (field: keyof CouponFormValues, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleDateSelection = (
    field: keyof Pick<CouponFormValues, "start_at" | "end_at">,
    date: Date | undefined
  ) => {
    if (!date) {
      handleInputChange(field, "")
      setTimeInputs((prev) => ({ ...prev, [field]: "" }))
      return
    }

    const fallbackTime =
      timeInputs[field] && timeInputs[field].includes(":") ? timeInputs[field] : "00:00"

    const [hours, minutes] = fallbackTime.split(":").map((value) => Number(value) || 0)

    const updated = new Date(date)
    updated.setHours(hours, minutes, 0, 0)
    handleInputChange(field, updated.toISOString())
    setTimeInputs((prev) => ({ ...prev, [field]: fallbackTime }))
  }

  const handleTimeChange = (
    field: keyof Pick<CouponFormValues, "start_at" | "end_at">,
    value: string
  ) => {
    let input = value.replace(/[^0-9]/g, "").slice(0, 4);
    if (input.length > 2) {
      input = `${input.slice(0, 2)}:${input.slice(2)}`;
    }
    setTimeInputs(prev => ({...prev, [field]: input}));
  };

  const handleTimeBlur = (
    field: keyof Pick<CouponFormValues, "start_at" | "end_at">,
  ) => {
    const time = timeInputs[field];
    let [hoursStr, minutesStr] = time.split(":");

    let hours = parseInt(hoursStr, 10);
    let minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || hours < 0 || hours > 23) hours = 0;
    if (isNaN(minutes) || minutes < 0 || minutes > 59) minutes = 0;

    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    setTimeInputs(prev => ({...prev, [field]: formattedTime}));

    const current = parseDateValue(formState[field]) ?? new Date();
    const updated = new Date(current);
    updated.setHours(hours, minutes, 0, 0);
    handleInputChange(field, updated.toISOString());
  };

  const handleImageReset = () => {
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(true)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await onSubmit({
      values: formState,
      imageFile,
      removeImage,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label htmlFor="code">Código *</Label>
          <Input
            id="code"
            value={formState.code}
            onChange={(event) => handleInputChange("code", event.target.value.toUpperCase())}
            placeholder="PROMO2024"
            maxLength={40}
            className="h-10 uppercase tracking-wide"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome *</Label>
          <Input
            id="name"
            value={formState.name}
            onChange={(event) => handleInputChange("name", event.target.value)}
            placeholder="Desconto de Primavera"
            className="h-10"
            disabled={busy}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formState.description}
          onChange={(event) => handleInputChange("description", event.target.value)}
          placeholder="Detalhe regras adicionais ou canais de divulgação"
          rows={2}
          className="min-h-[80px] max-h-[120px]"
          disabled={busy}
        />
      </div>

      <div className="space-y-2">
        <Label>Imagem promocional</Label>
        <p className="text-[11px] text-muted-foreground">
          Exibida no cardápio no slider (380 x 220). Prefira JPG/PNG otimizados.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-[110px] w-[190px] overflow-hidden rounded-lg border border-dashed border-border/70 bg-muted/30">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Pré-visualização do cupom"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                Prévia 380x220
              </div>
            )}
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <Input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) {
                  if (imagePreview && imagePreview.startsWith("blob:")) {
                    URL.revokeObjectURL(imagePreview)
                  }
                  setImageFile(null)
                  setImagePreview(initialImageUrl ?? null)
                  setRemoveImage(false)
                  return
                }

                if (imagePreview && imagePreview.startsWith("blob:")) {
                  URL.revokeObjectURL(imagePreview)
                }

                setImageFile(file)
                setImagePreview(URL.createObjectURL(file))
                setRemoveImage(false)
              }}
            />
            {(imageFile || imagePreview) && (
              <Button type="button" variant="outline" size="sm" onClick={handleImageReset} disabled={busy}>
                Remover imagem
              </Button>
            )}
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)]">
        <div className="space-y-2">
          <Label>Tipo de desconto *</Label>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant={formState.discount_type === "percentage" ? "default" : "outline"}
              onClick={() => handleInputChange("discount_type", "percentage")}
              size="sm"
              className="flex-1 min-w-[140px] sm:flex-none"
              disabled={busy}
            >
              Percentual (%)
            </Button>
            <Button
              type="button"
              variant={formState.discount_type === "fixed" ? "default" : "outline"}
              onClick={() => handleInputChange("discount_type", "fixed")}
              size="sm"
              className="flex-1 min-w-[140px] sm:flex-none"
              disabled={busy}
            >
              Valor fixo (R$)
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount_value">Valor *</Label>
          <Input
            id="discount_value"
            type="number"
            min="0"
            step="0.01"
            value={formState.discount_value}
            onChange={(event) => handleInputChange("discount_value", event.target.value)}
            className="h-10 sm:max-w-[180px]"
            disabled={busy}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="max_discount_amount">Limite de desconto</Label>
          <Input
            id="max_discount_amount"
            type="number"
            min="0"
            step="0.01"
            value={formState.max_discount_amount}
            onChange={(event) => handleInputChange("max_discount_amount", event.target.value)}
            placeholder="Opcional"
            className="h-10 sm:max-w-[170px]"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimum_order_amount">Pedido mínimo</Label>
          <Input
            id="minimum_order_amount"
            type="number"
            min="0"
            step="0.01"
            value={formState.minimum_order_amount}
            onChange={(event) => handleInputChange("minimum_order_amount", event.target.value)}
            placeholder="Opcional"
            className="h-10 sm:max-w-[170px]"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage_limit">Limite total de uso</Label>
          <Input
            id="usage_limit"
            type="number"
            min="0"
            step="1"
            value={formState.usage_limit}
            onChange={(event) => handleInputChange("usage_limit", event.target.value)}
            placeholder="Ilimitado"
            className="h-10 sm:max-w-[150px]"
            disabled={busy}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usage_limit_per_client">Limite por cliente</Label>
          <Input
            id="usage_limit_per_client"
            type="number"
            min="0"
            step="1"
            value={formState.usage_limit_per_client}
            onChange={(event) => handleInputChange("usage_limit_per_client", event.target.value)}
            placeholder="Ilimitado"
            className="h-10 sm:max-w-[150px]"
            disabled={busy}
          />
        </div>
        {(["start_at", "end_at"] as const).map((field) => {
          const parsedDate = parseDateValue(formState[field])
          const timeValue = timeInputs[field]

          return (
            <div key={field} className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {field === "start_at" ? "Início" : "Fim"}
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Popover modal={false}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !parsedDate && "text-muted-foreground"
                      )}
                      disabled={busy}
                    >
                      {parsedDate ? format(parsedDate, "dd/MM/yyyy") : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={parsedDate}
                      onSelect={(date) => handleDateSelection(field, date ?? undefined)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Input
                  type="text"
                  placeholder="HH:MM"
                  value={timeValue}
                  onChange={(event) => handleTimeChange(field, event.target.value)}
                  onBlur={() => handleTimeBlur(field)}
                  maxLength={5}
                  disabled={busy}
                  className="h-10 sm:max-w-[120px]"
                />
              </div>
            </div>
          )
        })}
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <div>
            <p className="font-medium">Cupom ativo</p>
            <p className="text-xs text-muted-foreground">Clientes poderão utilizar imediatamente.</p>
          </div>
          <Switch
            checked={formState.is_active}
            onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            disabled={busy}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <div>
            <p className="font-medium">Destacar cupom</p>
            <p className="text-xs text-muted-foreground">Evidencie na vitrine pública e nas comunicações.</p>
          </div>
          <Switch
            checked={formState.is_featured}
            onCheckedChange={(checked) => handleInputChange("is_featured", checked)}
            disabled={busy}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {mode === "edit" ? (busy ? "Salvando..." : "Salvar alterações") : busy ? "Criando..." : "Criar cupom"}
        </Button>
      </div>
    </form>
  )
}

function normalizeValues(values?: Partial<CouponFormValues>): CouponFormValues {
  if (!values) {
    return { ...defaultValues }
  }

  const convert = (value: string | number | null | undefined, fallback = ""): string => {
    if (value === null || value === undefined) return fallback
    return String(value)
  }

  return {
    code: values.code ?? defaultValues.code,
    name: values.name ?? defaultValues.name,
    description: values.description ?? defaultValues.description,
    discount_type: values.discount_type ?? defaultValues.discount_type,
    discount_value: convert(values.discount_value ?? defaultValues.discount_value, defaultValues.discount_value),
    max_discount_amount: convert(values.max_discount_amount ?? defaultValues.max_discount_amount),
    minimum_order_amount: convert(values.minimum_order_amount ?? defaultValues.minimum_order_amount),
    usage_limit: convert(values.usage_limit ?? defaultValues.usage_limit),
    usage_limit_per_client: convert(values.usage_limit_per_client ?? defaultValues.usage_limit_per_client),
    start_at: values.start_at ?? defaultValues.start_at,
    end_at: values.end_at ?? defaultValues.end_at,
    is_active: values.is_active ?? defaultValues.is_active,
    is_featured: values.is_featured ?? defaultValues.is_featured,
  }
}

