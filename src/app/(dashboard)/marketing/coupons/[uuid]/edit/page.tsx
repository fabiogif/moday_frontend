"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useAuthenticatedApi, useMutation } from "@/hooks/use-authenticated-api"
import { endpoints } from "@/lib/api-client"
import { CouponForm, CouponFormValues } from "../../components/coupon-form"

interface CouponResponse {
  uuid: string
  code: string
  name: string
  description?: string | null
  discount_type: "percentage" | "fixed"
  discount_value: number
  max_discount_amount?: number | null
  minimum_order_amount?: number | null
  usage_limit?: number | null
  usage_limit_per_client?: number | null
  start_at?: string | null
  end_at?: string | null
  is_active: boolean
  is_featured: boolean
  image_url?: string | null
}

export default function EditCouponPage() {
  const params = useParams<{ uuid: string }>()
  const router = useRouter()
  const couponUuid = params?.uuid

  const endpoint = couponUuid ? endpoints.marketing.coupons.show(couponUuid) : ""
  const {
    data: couponResponse,
    loading: loadingCoupon,
    error: couponError,
    refetch,
  } = useAuthenticatedApi<any>(endpoint, { immediate: false })

  useEffect(() => {
    if (couponUuid) {
      refetch()
    }
  }, [couponUuid, refetch])

  const { mutate: mutateCoupon, loading: saving } = useMutation<any, Partial<CouponFormValues>>()
  const { mutate: mutateUpload, loading: uploading } = useMutation()
  const [redirecting, setRedirecting] = useState(false)

  const coupon: CouponResponse | null = useMemo(() => {
    if (!couponResponse) return null
    if ("data" in couponResponse && couponResponse.data) {
      return couponResponse.data as CouponResponse
    }
    return couponResponse as CouponResponse
  }, [couponResponse])

  const initialValues = useMemo<Partial<CouponFormValues>>(() => {
    if (!coupon) return {}
    return {
      code: coupon.code,
      name: coupon.name,
      description: coupon.description ?? "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value?.toString() ?? "0",
      max_discount_amount: coupon.max_discount_amount != null ? coupon.max_discount_amount.toString() : "",
      minimum_order_amount: coupon.minimum_order_amount != null ? coupon.minimum_order_amount.toString() : "",
      usage_limit: coupon.usage_limit != null ? coupon.usage_limit.toString() : "",
      usage_limit_per_client: coupon.usage_limit_per_client != null ? coupon.usage_limit_per_client.toString() : "",
      start_at: coupon.start_at ?? "",
      end_at: coupon.end_at ?? "",
      is_active: coupon.is_active,
      is_featured: coupon.is_featured,
    }
  }, [coupon])

  const handleSubmit = async ({
    values,
    imageFile,
    removeImage,
  }: {
    values: CouponFormValues
    imageFile: File | null
    removeImage: boolean
  }) => {
    if (!couponUuid) return

    const payload: any = {
      code: values.code.trim(),
      name: values.name.trim(),
      description: values.description.trim() || null,
      discount_type: values.discount_type,
      discount_value: Number(values.discount_value) || 0,
      max_discount_amount: parseNumber(values.max_discount_amount) ?? null,
      minimum_order_amount: parseNumber(values.minimum_order_amount) ?? null,
      usage_limit: parseNumber(values.usage_limit) ?? null,
      usage_limit_per_client: parseNumber(values.usage_limit_per_client) ?? null,
      start_at: values.start_at || null,
      end_at: values.end_at || null,
      is_active: values.is_active,
      is_featured: values.is_featured,
    }

    try {
      await mutateCoupon(endpoints.marketing.coupons.update(couponUuid), "PUT", payload)

      if (imageFile) {
        const formData = new FormData()
        formData.append("image", imageFile)
        await mutateUpload(endpoints.marketing.coupons.uploadImage(couponUuid), "POST", formData)
      }

      toast.success("Cupom atualizado com sucesso!")
      setRedirecting(true)
      router.push("/marketing/coupons")
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível atualizar o cupom")
    }
  }

  const busy = saving || uploading || redirecting

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={busy}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar cupom</h1>
          <p className="text-muted-foreground">Atualize informações e regras do cupom selecionado</p>
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Detalhes do cupom</CardTitle>
          <CardDescription>Edite valores, limites e período de disponibilidade.</CardDescription>
        </CardHeader>
        <CardContent>
          <CouponForm
            mode="edit"
            busy={busy || loadingCoupon}
            initialValues={initialValues}
            initialImageUrl={coupon?.image_url ?? null}
            onCancel={() => router.push("/marketing/coupons")}
            onSubmit={handleSubmit}
          />
        </CardContent>
      </Card>

      {couponError && (
        <p className="text-sm text-destructive">Não foi possível carregar os dados do cupom.</p>
      )}
    </div>
  )
}

function parseNumber(value: string) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

