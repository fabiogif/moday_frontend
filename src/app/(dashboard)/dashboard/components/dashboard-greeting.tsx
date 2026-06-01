"use client"

import { useAuth } from "@/contexts/auth-context"

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

function getFormattedDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date())
}

export function DashboardGreeting() {
  const { user } = useAuth()
  const firstName = user?.name?.split(" ")[0] ?? "bem-vindo"
  const greeting = getGreeting()
  const date = getFormattedDate()

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight">
        {greeting}, {firstName}!
      </h1>
      <p className="text-muted-foreground capitalize">{date}</p>
    </div>
  )
}
