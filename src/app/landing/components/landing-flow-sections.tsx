"use client"

import { Mail, ShoppingCart, UserPlus, Wallet, BarChart3, FileText } from 'lucide-react'
import { LandingFlowSection } from './landing-flow-section'
import { OperationFlowAnimation } from './operation-flow-animation'
import { FinanceFlowAnimation } from './finance-flow-animation'

export function OperationFlowSection() {
  return (
    <LandingFlowSection
      id="operacao-flow"
      eyebrow="Operação Flow"
      title="Venda em todos os canais sem perder o controle"
      description="Automatize pedidos do salão, delivery e cardápio digital. Quando um pedido chega, o Alba Tec organiza a cozinha, atualiza o estoque e mantém sua equipe sincronizada."
      ctaLabel="Explorar Operação"
      ctaHref="/auth/register"
      ctaEvent="cta_operacao_flow_click"
      animation={<OperationFlowAnimation />}
      features={[
        {
          icon: UserPlus,
          title: 'Captura instantânea de clientes',
          description:
            'Registre clientes no PDV ou pelo cardápio digital. Histórico de pedidos e preferências sempre à mão.',
        },
        {
          icon: ShoppingCart,
          title: 'Pedidos unificados',
          description:
            'Balcão, mesas, delivery e iFood em um único painel. Menos erros, mais velocidade no pico de movimento.',
        },
        {
          icon: Mail,
          title: 'Comunicação automática',
          description:
            'Status do pedido atualizado em tempo real para equipe e cliente. Cozinha e salão sempre alinhados.',
        },
      ]}
    />
  )
}

export function FinanceFlowSection() {
  return (
    <LandingFlowSection
      id="financeiro-flow"
      eyebrow="Financeiro Flow"
      title="Seja proativo com os números do restaurante"
      description="Configure automações que convertem dados em decisão. Contas a pagar, receber, despesas e fluxo de caixa projetado — tudo visível antes que vire problema."
      ctaLabel="Explorar Financeiro"
      ctaHref="/auth/register"
      ctaEvent="cta_financeiro_flow_click"
      reverse
      animation={<FinanceFlowAnimation />}
      features={[
        {
          icon: Wallet,
          title: 'Fluxo de caixa em tempo real',
          description:
            'Acompanhe saldo projetado, contas vencidas e receitas do mês em um painel financeiro integrado ao PDV.',
        },
        {
          icon: FileText,
          title: 'Contas a pagar e receber',
          description:
            'Organize fornecedores, categorias e vencimentos. Saiba exatamente quanto entra e quanto sai.',
        },
        {
          icon: BarChart3,
          title: 'Relatórios que orientam',
          description:
            'Gráficos de receita, despesas e margem para tomar decisões com dados — não com achismo.',
        },
      ]}
    />
  )
}
