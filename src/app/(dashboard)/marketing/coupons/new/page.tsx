"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useMutation } from "@/hooks/use-authenticated-api"
import { endpoints } from "@/lib/api-client"
import { CouponForm, CouponFormValues } from "../components/coupon-form"

export default function NewCouponPage() {
  const router = useRouter()
  const { mutate: mutateCoupon, loading: saving } = useMutation<any, Partial<CouponFormValues>>()
  const { mutate: mutateUpload, loading: uploading } = useMutation()
  const [redirecting, setRedirecting] = useState(false)

  const handleSubmit = async ({
    values,
    imageFile,
    removeImage: _removeImage,
  }: {
    values: CouponFormValues
    imageFile: File | null
    removeImage: boolean
  }) => {
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
      const savedCoupon = await mutateCoupon(endpoints.marketing.coupons.create, "POST", payload)

      const targetUuid =
        savedCoupon?.uuid ??
        savedCoupon?.data?.uuid ??
        savedCoupon?.coupon?.uuid

      if (imageFile && targetUuid) {
        const formData = new FormData()
        formData.append("image", imageFile)
        await mutateUpload(endpoints.marketing.coupons.uploadImage(targetUuid), "POST", formData)
      }

      toast.success("Cupom criado com sucesso!")
      setRedirecting(true)
      router.push("/marketing/coupons")
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível criar o cupom")
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} disabled={saving || uploading || redirecting}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo cupom</h1>
          <p className="text-muted-foreground">Cadastre uma nova campanha promocional</p>
        </div>
      </div>

      <Card className="border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Detalhes do cupom</CardTitle>
          <CardDescription>Defina valores, limites e período de disponibilidade.</CardDescription>
        </CardHeader>
        <CardContent>
          <CouponForm
            mode="create"
            busy={saving || uploading || redirecting}
            onCancel={() => router.push("/marketing/coupons")}
            onSubmit={async ({ values, imageFile, removeImage }) => handleSubmit({ values, imageFile, removeImage })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function parseNumber(value: string) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

