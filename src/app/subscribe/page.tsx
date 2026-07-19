"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { apiClient, endpoints } from "@/lib/api-client"
import { useMercadoPagoBrick } from "@/hooks/use-mercadopago-brick"
import { CheckCircle, Loader2, ArrowLeft, Shield, Zap, Users, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { showErrorToast, showSuccessToast } from "@/components/ui/error-toast"
import { useAuth } from "@/contexts/auth-context"

interface Plan {
  id: number
  name: string
  price: string
  description: string | null
  max_users: number | null
  max_products: number | null
  max_orders_per_month: number | null
  has_marketing: boolean
  has_reports: boolean
  details?: { id: number; name: string }[]
}

type Step = "plans" | "payment" | "success"

// ── Payment step ──────────────────────────────────────────────────────────────

function PaymentStep({
  plan,
  onBack,
  onSuccess,
}: {
  plan: Plan
  onBack: () => void
  onSuccess: () => void
}) {
  const [submitting, setSubmitting] = useState(false)
  const [brickReady, setBrickReady] = useState(false)
  const [brickError, setBrickError] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (formData: any, additionalData: any) => {
      setSubmitting(true)
      try {
        const userRaw = typeof window !== "undefined" ? localStorage.getItem("auth-user") : null
        const user = userRaw ? JSON.parse(userRaw) : null

        await apiClient.post(endpoints.subscription.payment, {
          plan_id:            plan.id,
          token:              formData.token,
          payment_method_id:  formData.payment_method_id,
          payment_type_id:    additionalData?.paymentTypeId ?? "credit_card",
          transaction_amount: formData.transaction_amount,
          installments:       formData.installments ?? 1,
          payer_email:        formData.payer?.email ?? user?.email ?? "",
        })

        showSuccessToast("Pagamento aprovado! Sua assinatura está ativa.")
        onSuccess()
      } catch (err: any) {
        showErrorToast(err?.message ?? "Pagamento recusado. Verifique os dados do cartão.")
        throw err
      } finally {
        setSubmitting(false)
      }
    },
    [plan.id, onSuccess]
  )

  useMercadoPagoBrick(
    process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY!,
    { amount: Number(plan.price), containerId: "mp-card-payment-brick" },
    {
      onSubmit: handleSubmit,
      onReady: () => setBrickReady(true),
      onError: (err) => {
        const causes = err?.cause ?? []
        const detail = Array.isArray(causes) && causes.length > 0
          ? causes.map((c: any) => `${c.code ?? ''} ${c.description ?? ''}`.trim()).join('; ')
          : (err?.message ?? JSON.stringify(err))
        setBrickError(detail || 'unknown')
      },
    }
  )

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para os planos
        </button>

        <div className="text-center">
          <h1 className="text-2xl font-bold">Finalizar assinatura</h1>
          <p className="text-muted-foreground mt-1">
            Plano <strong>{plan.name}</strong> —{" "}
            <strong>R$ {Number(plan.price).toFixed(2).replace(".", ",")}/mês</strong>
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Pagamento seguro
            </CardTitle>
            <CardDescription className="text-xs">
              Seus dados são criptografados pelo Mercado Pago
            </CardDescription>
          </CardHeader>
          <CardContent>
            {brickError && (
              <div className="py-6 space-y-3">
                <p className="text-sm text-destructive font-medium text-center">
                  Não foi possível carregar o formulário de pagamento.
                </p>
                {brickError !== 'unknown' && (
                  <p className="text-xs text-muted-foreground bg-muted rounded p-2 font-mono break-all">
                    {brickError}
                  </p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  Se o erro mencionar "domain" ou "origin", adicione{" "}
                  <strong>rest.albatec.com.br</strong> nos domínios permitidos no{" "}
                  painel do Mercado Pago → Suas integrações → Credenciais.
                </p>
                <div className="flex justify-center">
                  <Button variant="outline" size="sm" onClick={onBack}>
                    Voltar e tentar novamente
                  </Button>
                </div>
              </div>
            )}
            {!brickReady && !submitting && brickError === null && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Carregando formulário seguro…</p>
              </div>
            )}
            {submitting && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Processando pagamento…</p>
              </div>
            )}
            <div
              id="mp-card-payment-brick"
              className={submitting || brickError !== null ? "hidden" : undefined}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Plans step ────────────────────────────────────────────────────────────────

function PlansStep({ onSelect }: { onSelect: (plan: Plan) => void }) {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const { trialStatus } = useAuth()

  useEffect(() => {
    apiClient
      .get<Plan[]>(endpoints.subscription.plans)
      .then((res) => setPlans(res.data ?? []))
      .catch(() => showErrorToast("Erro ao carregar planos"))
      .finally(() => setLoading(false))
  }, [])

  const isExpired = trialStatus?.is_expired || trialStatus?.needs_payment
  const daysRemaining = trialStatus?.days_remaining ?? 0

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          {isExpired ? (
            <Badge variant="destructive" className="text-xs px-3 py-1">
              Período de teste encerrado
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs px-3 py-1 border-blue-500 text-blue-600">
              <Clock className="h-3 w-3 mr-1" />
              {daysRemaining > 0 ? `${daysRemaining} dias restantes no trial` : "Trial ativo"}
            </Badge>
          )}
          <h1 className="text-3xl font-bold">Escolha seu plano</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {isExpired
              ? "Seu período de teste gratuito expirou. Selecione um plano para continuar usando o Alba Tec."
              : "Assine agora e garanta acesso contínuo sem interrupções. Cancele quando quiser."}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <p className="text-center text-muted-foreground">Nenhum plano disponível no momento.</p>
        ) : (
          <div
            className={`grid gap-6 ${
              plans.length === 1
                ? "max-w-sm mx-auto"
                : plans.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-2xl mx-auto"
                : "grid-cols-1 md:grid-cols-3"
            }`}
          >
            {plans.map((plan, idx) => {
              const isHighlighted = idx === Math.floor(plans.length / 2) && plans.length > 1
              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col transition-shadow hover:shadow-lg ${
                    isHighlighted ? "border-primary shadow-md" : ""
                  }`}
                >
                  {isHighlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="text-xs px-3">Mais popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="mt-2">
                      <span className="text-4xl font-bold">
                        R$ {Number(plan.price).toFixed(2).replace(".", ",")}
                      </span>
                      <span className="text-muted-foreground text-sm">/mês</span>
                    </div>
                    {plan.description && (
                      <CardDescription className="mt-1 text-xs">{plan.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1 gap-4">
                    <ul className="space-y-2 flex-1">
                      {plan.max_users && (
                        <li className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-primary flex-shrink-0" />
                          Até {plan.max_users} usuários
                        </li>
                      )}
                      {plan.max_orders_per_month && (
                        <li className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                          Até {plan.max_orders_per_month} pedidos/mês
                        </li>
                      )}
                      {plan.has_reports && (
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          Relatórios avançados
                        </li>
                      )}
                      {plan.has_marketing && (
                        <li className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          Módulo marketing
                        </li>
                      )}
                      {plan.details?.map((d) => (
                        <li key={d.id} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {d.name}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isHighlighted ? "default" : "outline"}
                      onClick={() => onSelect(plan)}
                    >
                      Assinar agora
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">
          Pagamento processado com segurança pelo Mercado Pago · Cancele quando quiser
        </p>
      </div>
    </div>
  )
}

// ── Success step ──────────────────────────────────────────────────────────────

function SuccessStep({ planName, onContinue }: { planName: string; onContinue: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-6">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Assinatura ativada!</h1>
          <p className="text-muted-foreground mt-2">
            Bem-vindo ao plano <strong>{planName}</strong>. Seu acesso completo está liberado.
          </p>
        </div>
        <Button className="w-full" onClick={onContinue}>
          Acessar o sistema
        </Button>
      </div>
    </div>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

function SubscribePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>("plans")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  useEffect(() => {
    const planId = searchParams.get("plan_id")
    if (!planId) return

    apiClient
      .get<Plan[]>(endpoints.subscription.plans)
      .then((res) => {
        const plan = (res.data ?? []).find((p) => p.id === Number(planId))
        if (plan) {
          setSelectedPlan(plan)
          setStep("payment")
        }
      })
      .catch(() => {/* fallback: stay on plans step */})
  }, [searchParams])

  return (
    <>
      {step === "plans" && (
        <PlansStep
          onSelect={(plan) => {
            setSelectedPlan(plan)
            setStep("payment")
          }}
        />
      )}
      {step === "payment" && selectedPlan && (
        <PaymentStep
          plan={selectedPlan}
          onBack={() => setStep("plans")}
          onSuccess={() => setStep("success")}
        />
      )}
      {step === "success" && selectedPlan && (
        <SuccessStep
          planName={selectedPlan.name}
          onContinue={() => router.push("/dashboard")}
        />
      )}
    </>
  )
}

export default function SubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <SubscribePageContent />
    </Suspense>
  )
}
