"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, MenuSquare, Sparkles, ShoppingCart, Layers, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export function DemoMenuCTA() {
  return (
    <section className="py-24 sm:py-32 bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="max-w-4xl mx-auto border-2 border-primary/20 shadow-xl">
          <CardHeader className="text-center pb-4">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20 mx-auto w-fit">
              <Sparkles className="h-3 w-3 mr-1" />
              Experimente Agora
            </Badge>
            <CardTitle className="text-3xl sm:text-4xl font-bold mb-4">
              Veja o Cardápio em Ação
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Explore nosso cardápio interativo de demonstração e descubra como seus clientes podem 
              personalizar pedidos com variações, opcionais e cálculo de preços em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Features Grid */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <MenuSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Cardápio Digital</h3>
                  <p className="text-xs text-muted-foreground">
                    Interface moderna e intuitiva
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Variações</h3>
                  <p className="text-xs text-muted-foreground">
                    Tamanhos, sabores e opções
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <PlusCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">Opcionais</h3>
                  <p className="text-xs text-muted-foreground">
                    Personalização completa
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link href="/demo/menu">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Ver Cardápio de Demonstração
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
                <Link href="#pricing">
                  Ver Planos e Preços
                </Link>
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground pt-2">
              ✨ Experimente gratuitamente sem necessidade de cadastro
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

