"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Play, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DotPattern } from '@/components/dot-pattern'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 pt-20 sm:pt-32 pb-16">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        {/* Dot pattern overlay using reusable component */}
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-4xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center">
            <Badge variant="outline" className="px-4 py-2 border-foreground">
              <Star className="w-3 h-3 mr-2 fill-current" />
              Novo: Sistema completo em nuvem
              <ArrowRight className="w-3 h-3 ml-2" />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Gerencie seu
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {" "}Restaurante{" "}
            </span>
            com Eficiência e Simplicidade
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Controle completo de pedidos, cardápio digital, gestão de estoque e relatórios em tempo real. 
            Tudo em uma única plataforma moderna, segura e fácil de usar.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" className="text-base cursor-pointer" asChild>
              <Link href="/auth/register">
                Começar Agora
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-base cursor-pointer" asChild>
              <Link href="/auth/login">
                Fazer Login
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="mx-auto mt-20 max-w-6xl">
          <div className="relative group">
            {/* Top background glow effect - positioned above the image */}
            <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-primary/50 rounded-full blur-3xl"></div>

            <div className="relative rounded-xl border bg-card shadow-2xl">
              {/* Light mode dashboard image */}
              <Image
                src="/dashboard-light.png"
                alt="Dashboard Preview - Light Mode"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover block dark:hidden"
                priority
              />

              {/* Dark mode dashboard image */}
              <Image
                src="/dashboard-dark.png"
                alt="Dashboard Preview - Dark Mode"
                width={1200}
                height={800}
                className="w-full rounded-xl object-cover hidden dark:block"
                priority
              />

              {/* Bottom fade effect - gradient overlay that fades the image to background */}
              <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 lg:h-48 bg-gradient-to-b from-background/0 via-background/70 to-background rounded-b-xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
