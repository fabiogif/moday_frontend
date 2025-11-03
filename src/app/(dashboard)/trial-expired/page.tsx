"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, CreditCard, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function TrialExpiredPage() {
  const { trialStatus, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Se o trial ainda está ativo, redireciona para dashboard
    if (trialStatus && trialStatus.is_active && !trialStatus.is_expired) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, trialStatus, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-red-100 dark:bg-red-900 p-4">
              <Lock className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            Seu Período de Teste Expirou
          </CardTitle>
          <CardDescription className="text-lg mt-2">
            Obrigado por testar o Moday! Para continuar aproveitando todos os recursos, escolha um plano.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Informações sobre os dados */}
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Seus Dados Estão Seguros
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Todas as suas informações estão preservadas e seguras. 
                  Ao ativar um plano, você terá acesso imediato a tudo novamente.
                </p>
              </div>
            </div>
          </div>

          {/* Benefícios de assinar */}
          <div>
            <h3 className="font-semibold text-lg mb-3">
              O que você ganha ao assinar:
            </h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Acesso ilimitado a todos os recursos</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Suporte prioritário via WhatsApp</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Atualizações automáticas e novas funcionalidades</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Backup diário automático dos seus dados</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Relatórios avançados e insights</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">Integração com WhatsApp e outros sistemas</span>
              </li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link href="/subscription/plans" className="flex-1">
              <Button className="w-full" size="lg">
                <CreditCard className="mr-2 h-5 w-5" />
                Ver Planos e Fazer Upgrade
              </Button>
            </Link>
            
            <Link href="/contact" className="flex-1">
              <Button variant="outline" className="w-full" size="lg">
                <Mail className="mr-2 h-5 w-5" />
                Falar com Suporte
              </Button>
            </Link>
          </div>

          {/* Texto de ajuda */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              Dúvidas sobre qual plano escolher?{" "}
              <Link href="/contact" className="text-primary hover:underline font-medium">
                Estamos aqui para ajudar
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

