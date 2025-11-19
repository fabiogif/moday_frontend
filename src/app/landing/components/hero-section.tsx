"use client"

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DotPattern } from '@/components/dot-pattern'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background via-primary/5 to-background pt-20 sm:pt-32 pb-20">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <DotPattern className="opacity-100" size="md" fadeStyle="ellipse" />
      </div>

      {/* Animated gradient backgrounds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="mx-auto max-w-5xl text-center">
          {/* Announcement Badge */}
          <div className="mb-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Badge 
              variant="outline" 
              className="px-5 py-2.5 text-sm font-medium border-primary/30 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 hover:from-primary/20 hover:via-purple-500/20 hover:to-pink-500/20 transition-all shadow-lg hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-primary animate-pulse" />
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent font-semibold">
                Novo: Sistema de Avaliações e Controle de Mesas Inteligente
              </span>
              <ArrowRight className="w-3.5 h-3.5 ml-2 text-primary group-hover:translate-x-1 transition-transform" />
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="mb-8 text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-tight animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Gerencie seu
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                Restaurante
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 blur-xl rounded-full" />
            </span>
            <br />
            com Eficiência e Simplicidade
          </h1>

          {/* Subheading */}
          <p className="mx-auto mb-12 max-w-3xl text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1200">
            PDV touch-first com sistema de avaliações que aumenta confiança, controle de mesas inteligente e 
            cardápio digital inteligente com variações e opcionais. Controle completo de pedidos, estoque 
            e relatórios em tempo real em uma única plataforma que gera resultados.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-in fade-in slide-in-from-bottom-10 duration-1400">
            <Button 
              size="lg" 
              className="group text-base sm:text-lg px-8 py-7 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105 transition-all duration-300" 
              asChild
            >
              <Link href="/auth/register" className="flex items-center gap-2">
                Começar Agora
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-base sm:text-lg px-8 py-7 border-2 border-border/60 hover:border-primary/40 hover:bg-primary/5 hover:scale-105 transition-all duration-300" 
              asChild
            >
              <Link href="/login">
                Fazer Login
              </Link>
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground animate-in fade-in duration-1600">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">4.8 de 5 estrelas</span>
            </div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="font-medium">500+ restaurantes ativos</div>
            <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
            <div className="font-medium">1M+ pedidos processados</div>
          </div>
        </div>

        {/* Hero Image/Visual */}
        <div className="mx-auto mt-20 sm:mt-24 max-w-7xl animate-in fade-in slide-in-from-bottom-12 duration-1800">
          <div className="relative group">
            {/* Enhanced glow effects */}
            <div className="absolute top-4 lg:-top-12 left-1/2 transform -translate-x-1/2 w-[95%] mx-auto h-32 lg:h-96 bg-gradient-to-r from-primary/40 via-purple-500/40 to-pink-500/40 rounded-full blur-3xl animate-pulse group-hover:blur-[100px] transition-all duration-700" />
            <div className="absolute top-8 lg:-top-6 left-1/2 transform -translate-x-1/2 w-[80%] mx-auto h-24 lg:h-64 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-full blur-2xl opacity-75" />

            <div className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 group-hover:scale-[1.01] overflow-hidden">
              {/* Gradient border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
              
              {/* Light mode dashboard image */}
              <Image
                src="/dashboard-light.png"
                alt="Dashboard Preview - Light Mode"
                width={1400}
                height={900}
                className="w-full rounded-2xl object-cover block dark:hidden"
                priority
              />

              {/* Dark mode dashboard image */}
              <Image
                src="/dashboard-dark.png"
                alt="Dashboard Preview - Dark Mode"
                width={1400}
                height={900}
                className="w-full rounded-2xl object-cover hidden dark:block"
                priority
              />

              {/* Bottom fade effect - gradient overlay */}
              <div className="absolute bottom-0 left-0 w-full h-40 md:h-56 lg:h-64 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-b-2xl" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </section>
  )
}