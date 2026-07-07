"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlbaTecLogo } from '@/components/albatec-logo'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

const newsletterSchema = z.object({
  email: z.string().email({
    message: "Por favor, insira um endereço de e-mail válido.",
  }),
})

const footerLinks = {
  product: [
    { name: 'Recursos', href: '#features' },
    { name: 'Planos', href: '#pricing' },
  ],
  company: [
    { name: 'Contato', href: '#contact' },
    { name: 'FAQ', href: '#faq' },
  ],
}

export function LandingFooter() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof newsletterSchema>>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof newsletterSchema>) {
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao realizar inscrição')
      }

      toast.success(data.message || 'Inscrição realizada com sucesso!')
      form.reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao realizar inscrição')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Newsletter Section */}
        <div className="mb-16">
          <div className="mx-auto max-w-2xl text-center">
            <h3 className="text-2xl font-bold mb-4">Fique por dentro</h3>
            <p className="text-muted-foreground mb-6">
              Receba novidades, dicas e atualizações sobre gestão de restaurantes.
            </p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 max-w-md mx-auto sm:flex-row">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Digite seu e-mail"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="cursor-pointer rounded-md bg-zinc-900 text-white hover:bg-zinc-700 transition-colors" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Inscrever'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="col-span-2 max-w-2xl">
            <div className="mb-5 max-lg:flex max-lg:justify-center">
              <AlbaTecLogo height={64} />
            </div>
            <p className="text-muted-foreground mb-6 max-lg:text-center max-lg:flex max-lg:justify-center text-sm leading-relaxed">
              Sistema completo de gestão para restaurantes. Pedidos, cardápio, financeiro e relatórios em uma única plataforma.
            </p>
          </div>

          {/* Links Columns */}
          <div className='max-md:col-span-1 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className='max-md:col-span-1 lg:col-span-1'>
            <h4 className="font-semibold mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-2">
          <div className="text-muted-foreground text-sm text-center lg:text-left">
            © {new Date().getFullYear()} Alba Tec. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </footer>
  )
}
