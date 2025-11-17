"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { 
  UtensilsCrossed, 
  ChefHat, 
  Coffee, 
  IceCream, 
  Pizza, 
  Salad,
  Layers,
  PlusCircle,
  ShoppingCart,
  Sparkles,
  ArrowLeft,
  X,
  Plus,
  Minus,
  Clock,
  CreditCard,
  Image as ImageIcon,
  Store,
  Menu,
  Package,
  MessageCircle,
  MapPin,
  Check,
  Loader2,
  Search
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'
import { SiteFooter } from '@/components/site-footer'
import { maskPhone, maskCPF, maskZipCode } from '@/lib/masks'

interface DemoProduct {
  id: string
  name: string
  description: string
  price: number
  promotionalPrice?: number
  image: string
  category: string
  variations?: Array<{
    id: string
    name: string
    price: number
  }>
  optionals?: Array<{
    id: string
    name: string
    price: number
  }>
}

interface CartItem {
  product: DemoProduct
  quantity: number
  selectedVariation?: { id: string; name: string; price: number }
  selectedOptionals?: Array<{ id: string; name: string; price: number; quantity: number }>
}

const demoProducts: DemoProduct[] = [
  // PIZZAS (3 itens)
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, mussarela e manjericão fresco',
    price: 35.00,
    promotionalPrice: 29.90,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop',
    category: 'Pizzas',
    variations: [
      { id: 'p', name: 'Pequena', price: -5.00 },
      { id: 'm', name: 'Média', price: 0 },
      { id: 'g', name: 'Grande', price: 10.00 }
    ],
    optionals: [
      { id: 'bacon', name: 'Bacon', price: 5.00 },
      { id: 'borda', name: 'Borda Recheada', price: 12.00 },
      { id: 'azeitona', name: 'Azeitona', price: 3.00 }
    ]
  },
  {
    id: '2',
    name: 'Pizza Calabresa',
    description: 'Molho de tomate, mussarela, calabresa fatiada e cebola',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop',
    category: 'Pizzas',
    variations: [
      { id: 'p', name: 'Pequena', price: -5.00 },
      { id: 'm', name: 'Média', price: 0 },
      { id: 'g', name: 'Grande', price: 10.00 }
    ],
    optionals: [
      { id: 'ovo', name: 'Ovo', price: 2.00 },
      { id: 'borda', name: 'Borda Recheada', price: 12.00 },
      { id: 'azeitona', name: 'Azeitona', price: 3.00 }
    ]
  },
  {
    id: '3',
    name: 'Pizza Quatro Queijos',
    description: 'Mussarela, provolone, parmesão e gorgonzola',
    price: 42.00,
    promotionalPrice: 36.90,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop',
    category: 'Pizzas',
    variations: [
      { id: 'p', name: 'Pequena', price: -5.00 },
      { id: 'm', name: 'Média', price: 0 },
      { id: 'g', name: 'Grande', price: 10.00 }
    ],
    optionals: [
      { id: 'bacon', name: 'Bacon', price: 5.00 },
      { id: 'borda', name: 'Borda Recheada', price: 12.00 },
      { id: 'rucula', name: 'Rúcula', price: 3.00 }
    ]
  },
  // LANCHES (3 itens)
  {
    id: '4',
    name: 'Hambúrguer Artesanal',
    description: 'Pão brioche, carne 180g, queijo, alface, tomate e molho especial',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop',
    category: 'Lanches',
    variations: [
      { id: 'simples', name: 'Simples', price: 0 },
      { id: 'duplo', name: 'Duplo', price: 15.00 }
    ],
    optionals: [
      { id: 'ovo', name: 'Ovo', price: 2.00 },
      { id: 'bacon', name: 'Bacon', price: 5.00 },
      { id: 'cheddar', name: 'Cheddar', price: 4.00 }
    ]
  },
  {
    id: '5',
    name: 'X-Bacon',
    description: 'Pão, hambúrguer, queijo, bacon crocante e molho especial',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&h=600&fit=crop',
    category: 'Lanches',
    variations: [
      { id: 'simples', name: 'Simples', price: 0 },
      { id: 'duplo', name: 'Duplo', price: 15.00 }
    ],
    optionals: [
      { id: 'ovo', name: 'Ovo', price: 2.00 },
      { id: 'cheddar', name: 'Cheddar', price: 4.00 },
      { id: 'batata', name: 'Batata Palha', price: 3.00 }
    ]
  },
  {
    id: '6',
    name: 'X-Salada Premium',
    description: 'Pão artesanal, hambúrguer 200g, queijo, alface, tomate, cebola e molhos',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1553979459-d2229ba7433f?w=800&h=600&fit=crop',
    category: 'Lanches',
    variations: [
      { id: 'simples', name: 'Simples', price: 0 },
      { id: 'duplo', name: 'Duplo', price: 15.00 }
    ],
    optionals: [
      { id: 'ovo', name: 'Ovo', price: 2.00 },
      { id: 'bacon', name: 'Bacon', price: 5.00 },
      { id: 'cheddar', name: 'Cheddar', price: 4.00 }
    ]
  },
  // SALADAS (3 itens)
  {
    id: '7',
    name: 'Salada Caesar',
    description: 'Alface romana, croutons, parmesão e molho caesar',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&h=600&fit=crop',
    category: 'Saladas',
    optionals: [
      { id: 'frango', name: 'Frango Grelhado', price: 8.00 },
      { id: 'bacon', name: 'Bacon', price: 5.00 }
    ]
  },
  {
    id: '8',
    name: 'Salada Mediterrânea',
    description: 'Rúcula, tomate cereja, queijo feta, azeitonas e molho balsâmico',
    price: 26.00,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    category: 'Saladas',
    optionals: [
      { id: 'frango', name: 'Frango Grelhado', price: 8.00 },
      { id: 'atum', name: 'Atum', price: 7.00 },
      { id: 'nozes', name: 'Nozes', price: 4.00 }
    ]
  },
  {
    id: '9',
    name: 'Salada Tropical',
    description: 'Mix de folhas, manga, abacate, queijo coalho e molho especial',
    price: 28.00,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    category: 'Saladas',
    optionals: [
      { id: 'frango', name: 'Frango Grelhado', price: 8.00 },
      { id: 'camarao', name: 'Camarão', price: 12.00 },
      { id: 'granola', name: 'Granola', price: 3.00 }
    ]
  },
  // BEBIDAS (3 itens)
  {
    id: '10',
    name: 'Cappuccino Especial',
    description: 'Café expresso, leite vaporizado e espuma de leite',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop',
    category: 'Bebidas',
    variations: [
      { id: 'p', name: 'Pequeno (200ml)', price: 0 },
      { id: 'm', name: 'Médio (300ml)', price: 2.00 },
      { id: 'g', name: 'Grande (400ml)', price: 4.00 }
    ],
    optionals: [
      { id: 'chantilly', name: 'Chantilly', price: 3.00 },
      { id: 'canela', name: 'Canela', price: 0 },
      { id: 'chocolate', name: 'Chocolate', price: 2.50 }
    ]
  },
  {
    id: '11',
    name: 'Suco Natural',
    description: 'Suco de frutas frescas, sem açúcar adicionado',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&h=600&fit=crop',
    category: 'Bebidas',
    variations: [
      { id: 'laranja', name: 'Laranja', price: 0 },
      { id: 'abacaxi', name: 'Abacaxi', price: 0 },
      { id: 'maracuja', name: 'Maracujá', price: 1.00 },
      { id: 'acerola', name: 'Acerola', price: 1.00 }
    ],
    optionals: [
      { id: 'gelo', name: 'Gelo Extra', price: 0 },
      { id: 'acucar', name: 'Açúcar', price: 0 },
      { id: 'mel', name: 'Mel', price: 2.00 }
    ]
  },
  {
    id: '12',
    name: 'Refrigerante',
    description: 'Refrigerante gelado em lata',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&h=600&fit=crop',
    category: 'Bebidas',
    variations: [
      { id: 'coca', name: 'Coca-Cola', price: 0 },
      { id: 'pepsi', name: 'Pepsi', price: 0 },
      { id: 'guarana', name: 'Guaraná', price: 0 },
      { id: 'fanta', name: 'Fanta', price: 0 }
    ],
    optionals: [
      { id: 'gelo', name: 'Gelo Extra', price: 0 },
      { id: 'limao', name: 'Limão', price: 1.00 }
    ]
  },
  // SOBREMESAS (3 itens)
  {
    id: '13',
    name: 'Açaí na Tigela',
    description: 'Açaí cremoso com granola, banana e mel',
    price: 15.00,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4e0016a5?w=800&h=600&fit=crop',
    category: 'Sobremesas',
    variations: [
      { id: 'p', name: '300ml', price: 0 },
      { id: 'm', name: '500ml', price: 5.00 },
      { id: 'g', name: '700ml', price: 10.00 }
    ],
    optionals: [
      { id: 'morango', name: 'Morango', price: 3.00 },
      { id: 'leite-condensado', name: 'Leite Condensado', price: 2.00 },
      { id: 'paçoca', name: 'Paçoca', price: 2.50 }
    ]
  },
  {
    id: '14',
    name: 'Brownie com Sorvete',
    description: 'Brownie quente com sorvete de creme e calda de chocolate',
    price: 18.00,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&h=600&fit=crop',
    category: 'Sobremesas',
    optionals: [
      { id: 'chantilly', name: 'Chantilly', price: 3.00 },
      { id: 'calda-chocolate', name: 'Calda de Chocolate', price: 2.00 },
      { id: 'calda-morango', name: 'Calda de Morango', price: 2.00 },
      { id: 'castanha', name: 'Castanha de Caju', price: 3.00 }
    ]
  },
  {
    id: '15',
    name: 'Petit Gateau',
    description: 'Bolinho de chocolate com recheio cremoso, servido quente',
    price: 22.00,
    image: 'https://images.unsplash.com/photo-1606312619070-d48b4e0016a5?w=800&h=600&fit=crop',
    category: 'Sobremesas',
    optionals: [
      { id: 'sorvete', name: 'Sorvete de Creme', price: 4.00 },
      { id: 'chantilly', name: 'Chantilly', price: 3.00 },
      { id: 'calda-chocolate', name: 'Calda de Chocolate', price: 2.00 },
      { id: 'frutas', name: 'Frutas Vermelhas', price: 5.00 }
    ]
  },
  // PRATOS PRINCIPAIS (3 itens)
  {
    id: '16',
    name: 'Risotto de Camarão',
    description: 'Arroz arbóreo cremoso com camarões frescos e ervas',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&h=600&fit=crop',
    category: 'Pratos Principais',
    optionals: [
      { id: 'parmesao', name: 'Parmesão Extra', price: 3.00 },
      { id: 'trufa', name: 'Óleo de Trufa', price: 8.00 }
    ]
  },
  {
    id: '17',
    name: 'Filé Mignon ao Molho Madeira',
    description: 'Filé mignon grelhado com molho madeira e batatas rústicas',
    price: 58.00,
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop',
    category: 'Pratos Principais',
    variations: [
      { id: '200g', name: '200g', price: 0 },
      { id: '300g', name: '300g', price: 15.00 },
      { id: '400g', name: '400g', price: 25.00 }
    ],
    optionals: [
      { id: 'bacon', name: 'Bacon', price: 5.00 },
      { id: 'cogumelos', name: 'Cogumelos', price: 6.00 },
      { id: 'queijo', name: 'Queijo Gorgonzola', price: 7.00 }
    ]
  },
  {
    id: '18',
    name: 'Salmão Grelhado',
    description: 'Salmão grelhado com legumes salteados e arroz integral',
    price: 52.00,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop',
    category: 'Pratos Principais',
    variations: [
      { id: '200g', name: '200g', price: 0 },
      { id: '300g', name: '300g', price: 12.00 }
    ],
    optionals: [
      { id: 'molho-tartaro', name: 'Molho Tartaro', price: 3.00 },
      { id: 'legumes-extra', name: 'Legumes Extra', price: 5.00 },
      { id: 'arroz-integral', name: 'Arroz Integral', price: 0 }
    ]
  }
]

const categoryIcons: Record<string, React.ElementType> = {
  'Pizzas': Pizza,
  'Lanches': ChefHat,
  'Saladas': Salad,
  'Bebidas': Coffee,
  'Sobremesas': IceCream,
  'Pratos Principais': UtensilsCrossed
}

interface DemoPaymentMethod {
  uuid: string
  name: string
  description?: string
}

const demoPaymentMethods: DemoPaymentMethod[] = [
  { uuid: 'pix', name: 'PIX', description: 'Pagamento instantâneo' },
  { uuid: 'credit', name: 'Cartão de Crédito', description: 'Visa, Mastercard, Elo' },
  { uuid: 'debit', name: 'Cartão de Débito', description: 'Visa, Mastercard, Elo' },
  { uuid: 'money', name: 'Dinheiro', description: 'Pagamento na entrega' },
  { uuid: 'bank', name: 'Transferência Bancária', description: 'TED/DOC' }
]

export default function DemoMenuPage() {
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'checkout' | 'success'>('cart')
  const [selectedCategory, setSelectedCategory] = useState<string>('Pizzas')
  const [selectedProduct, setSelectedProduct] = useState<DemoProduct | null>(null)
  const [selectedVariation, setSelectedVariation] = useState<string>('')
  const [selectedOptionalsQty, setSelectedOptionalsQty] = useState<Record<string, number>>({})
  const [showSelectionDialog, setShowSelectionDialog] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [contactExpanded, setContactExpanded] = useState({ whatsapp: false, location: false })
  const [orderNotes, setOrderNotes] = useState('')
  const [couponCode, setCouponCode] = useState('')
  
  // Checkout states
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
  })
  const [shippingMethod, setShippingMethod] = useState<'delivery' | 'pickup'>('pickup')
  const [deliveryData, setDeliveryData] = useState({
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    complement: '',
    notes: '',
  })
  const [paymentMethod, setPaymentMethod] = useState<string>('pix')
  const [paymentMethodName, setPaymentMethodName] = useState<string>('PIX')
  const [cepLoading, setCepLoading] = useState(false)
  const [orderResult, setOrderResult] = useState<any>(null)

  const categories = Array.from(new Set(demoProducts.map(p => p.category)))
  const filteredProducts = demoProducts.filter(p => p.category === selectedCategory)

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price)
  }

  const handleProductClick = (product: DemoProduct) => {
    const hasVariations = product.variations && product.variations.length > 0
    const hasOptionals = product.optionals && product.optionals.length > 0
    
    if (hasVariations || hasOptionals) {
      setSelectedProduct(product)
      setSelectedVariation(product.variations?.[0]?.id || '')
      setSelectedOptionalsQty({})
      setShowSelectionDialog(true)
    } else {
      addToCart(product)
    }
  }

  const addToCart = (
    product: DemoProduct,
    variation?: { id: string; name: string; price: number },
    optionals?: Array<{ id: string; name: string; price: number; quantity: number }>
  ) => {
    setCart((prev) => {
      return [...prev, {
        product,
        quantity: 1,
        selectedVariation: variation,
        selectedOptionals: optionals || []
      }]
    })
    toast.success(`${product.name} adicionado ao carrinho!`)
  }

  const confirmAddToCart = () => {
    if (!selectedProduct) return
    
    const hasVariations = selectedProduct.variations && selectedProduct.variations.length > 0
    if (hasVariations && !selectedVariation) {
      toast.error('Por favor, selecione uma variação')
      return
    }
    
    const variation = selectedProduct.variations?.find(v => v.id === selectedVariation)
    const variationObj = variation ? { id: variation.id, name: variation.name, price: variation.price } : undefined
    
    const optionalsWithQty = Object.entries(selectedOptionalsQty)
      .map(([optId, qty]) => {
        const optional = selectedProduct.optionals?.find(opt => opt.id === optId)
        return optional && qty > 0 ? { ...optional, quantity: qty } : null
      })
      .filter((opt): opt is { id: string; name: string; price: number; quantity: number } => opt !== null)
    
    addToCart(selectedProduct, variationObj, optionalsWithQty)
    setShowSelectionDialog(false)
    resetSelectionState()
  }

  const resetSelectionState = () => {
    setSelectedProduct(null)
    setSelectedVariation('')
    setSelectedOptionalsQty({})
  }

  const handleOptionalQuantityChange = (optionalId: string, delta: number) => {
    setSelectedOptionalsQty((prev) => {
      const currentQty = prev[optionalId] || 0
      const newQty = Math.max(0, currentQty + delta)
      
      if (newQty === 0) {
        const { [optionalId]: _, ...rest } = prev
        return rest
      }
      
      return { ...prev, [optionalId]: newQty }
    })
  }

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const newCart = [...prev]
      const item = newCart[index]
      
      if (!item) return prev
      
      const newQty = item.quantity + delta
      
      if (newQty <= 0) {
        newCart.splice(index, 1)
        return newCart
      }
      
      newCart[index] = { ...item, quantity: newQty }
      return newCart
    })
  }

  const removeFromCart = (index: number) => {
    setCart((prev) => {
      const newCart = [...prev]
      newCart.splice(index, 1)
      return newCart
    })
    toast.success("Produto removido do carrinho")
  }

  const calculateItemTotal = (item: CartItem): number => {
    const basePrice = item.product.promotionalPrice || item.product.price
    const variationPrice = item.selectedVariation ? item.selectedVariation.price : 0
    const optionalsPrice = item.selectedOptionals?.reduce(
      (sum, opt) => sum + (opt.price * opt.quantity),
      0
    ) || 0
    
    return (basePrice + variationPrice + optionalsPrice) * item.quantity
  }

  const getCartTotal = (): number => {
    return cart.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateSelectionTotal = (): number => {
    if (!selectedProduct) return 0
    
    const basePrice = selectedProduct.promotionalPrice || selectedProduct.price
    const variation = selectedProduct.variations?.find(v => v.id === selectedVariation)
    const variationPrice = variation ? variation.price : 0
    const optionalsTotal = Object.entries(selectedOptionalsQty).reduce((sum, [optId, qty]) => {
      const optional = selectedProduct.optionals?.find(opt => opt.id === optId)
      return sum + (optional ? optional.price * qty : 0)
    }, 0)
    
    return basePrice + variationPrice + optionalsTotal
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = getCartTotal()

  const progressSteps = [
    { key: 'cart', label: 'Seleção de Itens', description: 'Escolha seus produtos favoritos' },
    { key: 'checkout', label: 'Dados de Entrega', description: 'Informe seus dados e endereço' },
    { key: 'payment', label: 'Pagamento', description: 'Revise e confirme o pagamento' },
    { key: 'success', label: 'Confirmação', description: 'Pedido finalizado com sucesso' },
  ] as const

  const currentProgressKey =
    checkoutStep === 'cart'
      ? 'cart'
      : checkoutStep === 'checkout'
        ? 'checkout'
        : 'success'

  const currentStepIndex = progressSteps.findIndex((step) => step.key === currentProgressKey)

  const handleContactToggle = (type: 'whatsapp' | 'location') => {
    setContactExpanded((prev) => ({
      ...prev,
      [type]: !prev[type],
    }))
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2')
  }

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value)
    setDeliveryData({ ...deliveryData, zip_code: formatted })
  }

  const handleSearchCEP = async () => {
    const cep = deliveryData.zip_code.replace(/\D/g, '')
    
    if (cep.length !== 8) {
      return
    }

    setCepLoading(true)
    
    // Simulação de busca de CEP (sem API real)
    setTimeout(() => {
      // Dados fictícios para demonstração
      setDeliveryData({
        ...deliveryData,
        address: 'Rua Exemplo',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      })
      setCepLoading(false)
      toast.success('CEP encontrado! Endereço preenchido automaticamente.')
    }, 1000)
  }

  const handleStateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 2)
    setDeliveryData({ ...deliveryData, state: value })
  }

  const handleStartCheckout = () => {
    if (cart.length === 0) {
      toast.error('Adicione ao menos um item ao carrinho para continuar.')
      return
    }

    setCheckoutStep('checkout')
    setMobileSummaryOpen(false)
    setTimeout(() => {
      const element = document.getElementById('order-summary')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 150)
  }

  const handleCheckout = async () => {
    // Validações básicas
    if (!clientData.name.trim() || !clientData.email.trim() || !clientData.phone.trim()) {
      toast.error('Preencha todos os dados obrigatórios do cliente')
      return
    }

    if (shippingMethod === 'delivery') {
      const requiredFields = ['address', 'number', 'neighborhood', 'city', 'state', 'zip_code']
      for (const field of requiredFields) {
        if (!deliveryData[field as keyof typeof deliveryData]?.toString().trim()) {
          toast.error(`Campo ${field} é obrigatório para entrega`)
          return
        }
      }
    }

    // Simular processamento
    toast.info('Processando pedido...')
    
    setTimeout(() => {
      setOrderResult({
        order_id: `DEMO-${Date.now()}`,
        total: formatPrice(cartTotal),
        whatsapp_link: '#'
      })
      setCheckoutStep('success')
      setCart([])
      toast.success('Pedido criado com sucesso! (Demonstração)')
    }, 1500)
  }

  const renderSummaryContent = (variant: 'cart' | 'checkout' = 'cart') => {
    if (cart.length === 0) {
      return (
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>Nenhum item no carrinho ainda.</p>
          <p>Explore o cardápio e adicione seus produtos favoritos!</p>
        </div>
      )
    }

    const buttonLabel = variant === 'cart'
      ? 'Ir para Dados de Entrega'
      : 'Confirmar Pedido'

    return (
      <div className="space-y-4">
        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
          {cart.map((item, index) => {
            const basePrice = item.product.promotionalPrice || item.product.price
            const variationPrice = item.selectedVariation ? item.selectedVariation.price : 0
            const optionalsPrice = item.selectedOptionals?.reduce(
              (sum, opt) => sum + (opt.price * opt.quantity),
              0
            ) || 0
            const unitPrice = basePrice + variationPrice + optionalsPrice
            const totalPrice = unitPrice * item.quantity

            return (
              <div key={`${item.product.id}-${index}`} className="rounded-xl border bg-card/90 p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 flex-1">
                        {item.product.name}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFromCart(index)}
                        title="Remover item"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {item.quantity}
                      </span>
                      <span>R$ {formatPrice(unitPrice)}</span>
                    </div>
                    {item.selectedVariation && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {item.selectedVariation.name}
                        </Badge>
                        <span>
                          {item.selectedVariation.price > 0 && `+R$ ${item.selectedVariation.price.toFixed(2)}`}
                          {item.selectedVariation.price === 0 && 'Incluso'}
                          {item.selectedVariation.price < 0 && `R$ ${item.selectedVariation.price.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    {item.selectedOptionals && item.selectedOptionals.length > 0 && (
                      <div className="space-y-1 border-l border-border/60 pl-2 text-xs text-muted-foreground">
                        {item.selectedOptionals.map((opt) => (
                          <div key={opt.id} className="flex items-center justify-between">
                            <span>{opt.name} × {opt.quantity}</span>
                            <span>R$ {(opt.price * opt.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="font-semibold text-base text-foreground">
                    R$ {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        <Separator />

        {variant === 'cart' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="order-notes" className="text-sm font-medium">Observações do pedido</Label>
              <Textarea
                id="order-notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Ex: Retirar ingredientes, ponto da carne, instruções especiais..."
                className="min-h-[90px] resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon-code" className="text-sm font-medium">Cupom de desconto</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="coupon-code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="DIGITE AQUI"
                  className="uppercase"
                />
                <Button type="button" variant="secondary" onClick={() => toast.info('Aplicação de cupom em demonstração')} className="whitespace-nowrap">
                  Aplicar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Itens ({cartCount})</span>
            <span>R$ {formatPrice(cartTotal)}</span>
          </div>

          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground flex items-center gap-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="font-medium text-muted-foreground/90">Tempo estimado</p>
              <p>30-45 min</p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-muted-foreground/90">
              <CreditCard className="h-4 w-4 text-primary" />
              <span className="font-medium">Formas de pagamento</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">PIX</Badge>
              <Badge variant="outline" className="text-xs">Cartão</Badge>
              <Badge variant="outline" className="text-xs">Dinheiro</Badge>
            </div>
          </div>

          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">R$ {formatPrice(cartTotal)}</span>
          </div>
        </div>

        <Button
          className="w-full rounded-full"
          size="lg"
          onClick={variant === 'cart' ? handleStartCheckout : handleCheckout}
        >
          {buttonLabel}
        </Button>

        {variant === 'cart' && (
          <Button variant="ghost" className="w-full" onClick={() => setCart([])}>
            Limpar carrinho
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Demo Banner */}
      <div className="bg-primary text-primary-foreground py-3 px-4">
        <div className="container mx-auto flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5" />
          <span className="font-medium">
            🟢 Cardápio de Demonstração - Experimente todas as funcionalidades!
          </span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur shadow-md">
        <div className="border-b">
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-3">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Abrir menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full p-0 sm:max-w-sm">
                  <div className="space-y-6 p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Store className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold">Cardápio Demo</h2>
                        <p className="text-sm text-muted-foreground">Demonstração interativa</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full gap-2"
                        onClick={() => {
                          setMobileSummaryOpen(true)
                          setMobileMenuOpen(false)
                        }}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Ver carrinho ({cartCount})
                      </Button>
                      <Button variant="outline" className="w-full gap-2" asChild>
                        <Link href="/landing" onClick={() => setMobileMenuOpen(false)}>
                          <ArrowLeft className="h-4 w-4" />
                          Voltar para Landing
                        </Link>
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/50 px-4 py-2">
                        <MessageCircle className="h-4 w-4 text-primary" />
                        <span>WhatsApp: (00) 00000-0000</span>
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-4 py-2">
                        <MapPin className="mt-1 h-4 w-4 text-primary" />
                        <span>Endereço de demonstração</span>
                      </div>
                      <div className="flex items-center gap-2 rounded-lg bg-muted/40 px-4 py-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Atendimento disponível durante a demonstração</span>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-muted sm:flex">
                <Store className="h-6 w-6 text-muted-foreground" />
              </div>

              <div>
                <h1 className="text-lg font-semibold sm:text-xl">Cardápio Demo</h1>
                <p className="hidden text-xs text-muted-foreground sm:block">Demonstração interativa</p>
              </div>
            </div>

            <div className="hidden items-center gap-3 lg:flex">
              <Button variant="ghost" className="relative gap-2" onClick={() => {
                const element = document.getElementById('order-summary')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              }}>
                <ShoppingCart className="h-4 w-4" />
                <span>Carrinho</span>
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
              </Button>

              <Button variant="ghost" className="gap-2" asChild>
                <Link href="/landing">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Link>
              </Button>
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setMobileSummaryOpen(true)}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 items-center justify-center p-0">
                    {cartCount}
                  </Badge>
                )}
                <span className="sr-only">Abrir resumo do carrinho</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="border-b bg-muted/50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <button
                    type="button"
                    onClick={() => handleContactToggle('whatsapp')}
                    className="flex w-full items-center justify-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>WhatsApp</span>
                    <span className="text-xs text-muted-foreground">(toque para ver detalhes)</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all ${contactExpanded.whatsapp ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="rounded-lg border bg-background/95 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">(00) 00000-0000</p>
                      <p className="mt-1">Atendimento disponível durante a demonstração</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <button
                    type="button"
                    onClick={() => handleContactToggle('location')}
                    className="flex w-full items-center justify-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium shadow-sm transition hover:border-primary hover:text-primary"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Localização</span>
                    <span className="text-xs text-muted-foreground">(toque para ver detalhes)</span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all ${contactExpanded.location ? 'max-h-32 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="rounded-lg border bg-background/95 px-4 py-3 text-xs text-muted-foreground shadow-sm">
                      <p className="font-medium text-foreground">Endereço de demonstração</p>
                      <p className="mt-1">Atendimento disponível durante a demonstração</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-b bg-background/90">
          <div className="container mx-auto px-4 py-2 sm:py-3">
            <div className="flex items-stretch gap-3 overflow-x-auto pb-2 pt-1 md:gap-4">
              {progressSteps.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isActive = index === currentStepIndex

                return (
                  <div
                    key={step.key}
                    className={`flex flex-none items-center gap-3 rounded-2xl border border-border/60 bg-background px-3 py-2 text-xs shadow-sm transition md:flex-1 md:px-5 md:py-3 md:text-sm ${
                      isActive ? 'ring-1 ring-primary/30' : ''
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all md:h-10 md:w-10 md:text-sm ${
                        isActive
                          ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                          : isCompleted
                            ? 'border-primary/60 bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 md:h-5 md:w-5" /> : index + 1}
                    </div>
                    <div className="min-w-[110px] md:min-w-0">
                      <span
                        className={`block font-semibold ${
                          isActive ? 'text-foreground' : isCompleted ? 'text-primary' : 'text-muted-foreground'
                        }`}
                      >
                        {step.label}
                      </span>
                      <span className="hidden text-xs text-muted-foreground sm:block">{step.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          {checkoutStep === "cart" && (
            <section className="container mx-auto space-y-10 px-4 py-10">
            <div className="flex flex-col gap-10 lg:flex-row">
              <div className="flex-1 space-y-6">
                <ScrollArea className="w-full whitespace-nowrap">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full">
                    {categories.map((category) => {
                      const Icon = categoryIcons[category] || UtensilsCrossed
                      return (
                        <TabsTrigger key={category} value={category} className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{category}</span>
                        </TabsTrigger>
                      )
                    })}
                  </TabsList>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                <TabsContent value={selectedCategory} className="mt-0">
                  {filteredProducts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-muted p-12 text-center">
                      <p className="text-lg text-muted-foreground">Nenhum produto encontrado nesta categoria.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                      {filteredProducts.map((product) => {
                        const price = product.promotionalPrice || product.price
                        const hasDiscount = product.promotionalPrice && product.promotionalPrice < product.price
                        const hasVariations = product.variations && product.variations.length > 0
                        const hasOptionals = product.optionals && product.optionals.length > 0

                        return (
                          <Card
                            key={product.id}
                            className="flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card/90 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                          >
                            <div className="relative aspect-square bg-muted">
                              {product.image ? (
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted">
                                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" />
                                </div>
                              )}
                              {hasDiscount && (
                                <Badge className="absolute right-2 top-2 rounded-full bg-red-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                                  {Math.round((1 - (product.promotionalPrice! / product.price)) * 100)}% OFF
                                </Badge>
                              )}
                              <Badge className="absolute bottom-2 left-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
                                {product.category}
                              </Badge>
                            </div>
                            <CardHeader className="flex-1 space-y-2 p-4">
                              <CardTitle className="line-clamp-2 text-base font-semibold leading-tight sm:text-lg">
                                {product.name}
                              </CardTitle>
                              <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                                {product.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4 pt-0">
                              <div className="space-y-1">
                                {hasDiscount && (
                                  <p className="text-xs text-muted-foreground line-through">
                                    R$ {formatPrice(product.price)}
                                  </p>
                                )}
                                <p className="text-lg font-semibold text-primary sm:text-2xl">
                                  R$ {formatPrice(price)}
                                </p>
                              </div>
                              <Button
                                onClick={() => handleProductClick(product)}
                                className="w-full rounded-full py-5 text-sm font-semibold sm:text-base"
                              >
                                Adicionar
                              </Button>
                              {((hasVariations) || (hasOptionals)) && (
                                <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-muted-foreground sm:text-xs">
                                  {hasVariations && (
                                    <Badge variant="outline" className="rounded-full px-3 py-1">
                                      {product.variations!.length} {product.variations!.length === 1 ? 'variação' : 'variações'}
                                    </Badge>
                                  )}
                                  {hasOptionals && (
                                    <Badge variant="outline" className="rounded-full px-3 py-1">
                                      {product.optionals!.length} {product.optionals!.length === 1 ? 'opcional' : 'opcionais'}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>
              </div>

              <aside className="hidden w-full max-w-sm lg:block" id="order-summary">
                <Card className="sticky top-32 space-y-0 rounded-3xl border border-border/60 shadow-2xl">
                  <CardHeader className="space-y-1 pb-0">
                    <CardTitle className="flex items-center justify-between text-xl">
                      <span>Resumo do Pedido</span>
                      <Badge variant="outline" className="rounded-full text-xs">
                        {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Revise os itens selecionados antes de prosseguir.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-4">
                    {renderSummaryContent('cart')}
                  </CardContent>
                </Card>
              </aside>
            </div>
          </section>
          )}

          {checkoutStep === "checkout" && (
            <section className="container mx-auto px-4 py-10">
              <Button variant="outline" onClick={() => setCheckoutStep("cart")} className="mb-6">
                ← Voltar para o carrinho
              </Button>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Client Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nome Completo *</Label>
                          <Input
                            id="name"
                            value={clientData.name}
                            onChange={(e) => setClientData({ ...clientData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={clientData.email}
                            onChange={(e) => setClientData({ ...clientData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            value={clientData.phone}
                            onChange={(e) => setClientData({ ...clientData, phone: maskPhone(e.target.value) })}
                            placeholder="(11) 99999-9999"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="cpf">CPF</Label>
                          <Input
                            id="cpf"
                            value={clientData.cpf}
                            onChange={(e) => setClientData({ ...clientData, cpf: maskCPF(e.target.value) })}
                            placeholder="000.000.000-00"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Shipping Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Método de Entrega</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup value={shippingMethod} onValueChange={(value) => setShippingMethod(value as 'delivery' | 'pickup')}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="delivery" id="delivery" />
                          <Label htmlFor="delivery">Entrega no endereço</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="pickup" id="pickup" />
                          <Label htmlFor="pickup">Retirar no local</Label>
                        </div>
                      </RadioGroup>
                    </CardContent>
                  </Card>

                  {/* Delivery Address */}
                  {shippingMethod === "delivery" && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Endereço de Entrega</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="md:col-span-2">
                            <Label htmlFor="address">Endereço *</Label>
                            <Input
                              id="address"
                              value={deliveryData.address}
                              onChange={(e) => setDeliveryData({ ...deliveryData, address: e.target.value })}
                              required={shippingMethod === "delivery"}
                              placeholder="Rua, Avenida, etc."
                            />
                          </div>
                          <div>
                            <Label htmlFor="number">Número *</Label>
                            <Input
                              id="number"
                              value={deliveryData.number}
                              onChange={(e) => setDeliveryData({ ...deliveryData, number: e.target.value })}
                              required={shippingMethod === "delivery"}
                              placeholder="123"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="neighborhood">Bairro *</Label>
                            <Input
                              id="neighborhood"
                              value={deliveryData.neighborhood}
                              onChange={(e) => setDeliveryData({ ...deliveryData, neighborhood: e.target.value })}
                              required={shippingMethod === "delivery"}
                              placeholder="Centro, Jardins, etc."
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="state">Estado *</Label>
                            <Input
                              id="state"
                              value={deliveryData.state}
                              onChange={handleStateChange}
                              required={shippingMethod === "delivery"}
                              placeholder="SP"
                              maxLength={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">Cidade *</Label>
                            <Input
                              id="city"
                              value={deliveryData.city}
                              onChange={(e) => setDeliveryData({ ...deliveryData, city: e.target.value })}
                              required={shippingMethod === "delivery"}
                              placeholder="São Paulo"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="zip_code">CEP *</Label>
                            <div className="flex gap-2">
                              <Input
                                id="zip_code"
                                value={deliveryData.zip_code}
                                onChange={handleCEPChange}
                                onBlur={handleSearchCEP}
                                maxLength={9}
                                required={shippingMethod === "delivery"}
                                placeholder="01234-567"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleSearchCEP}
                                disabled={cepLoading || deliveryData.zip_code.replace(/\D/g, '').length !== 8}
                              >
                                {cepLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                              </Button>
                            </div>
                            {cepLoading && (
                              <p className="text-sm text-muted-foreground mt-1">Buscando CEP...</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="complement">Complemento</Label>
                          <Input
                            id="complement"
                            value={deliveryData.complement}
                            onChange={(e) => setDeliveryData({ ...deliveryData, complement: e.target.value })}
                            placeholder="Apto, Bloco, etc."
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea
                            id="notes"
                            value={deliveryData.notes}
                            onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                            placeholder="Ex: Ponto de referência, instruções de entrega..."
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Payment Method */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Forma de Pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <RadioGroup 
                        value={paymentMethod} 
                        onValueChange={(uuid) => {
                          setPaymentMethod(uuid)
                          const selected = demoPaymentMethods.find(m => m.uuid === uuid)
                          setPaymentMethodName(selected?.name || uuid)
                        }}
                      >
                        {demoPaymentMethods.map((method) => (
                          <div key={method.uuid} className="flex items-center space-x-2">
                            <RadioGroupItem value={method.uuid} id={method.uuid} />
                            <Label htmlFor={method.uuid} className="flex items-center gap-2 cursor-pointer">
                              {method.name}
                              {method.description && (
                                <Badge variant="outline" className="text-xs">
                                  {method.description}
                                </Badge>
                              )}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:max-w-sm" id="order-summary">
                  <Card className="sticky top-24 space-y-0 rounded-3xl border border-border/60 shadow-2xl">
                    <CardHeader className="space-y-1 pb-0">
                      <CardTitle className="flex items-center justify-between text-xl">
                        <span>Resumo do Pedido</span>
                        <Badge variant="outline" className="rounded-full text-xs">
                          {cartCount} {cartCount === 1 ? 'item' : 'itens'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-sm">
                        Confira os valores antes de finalizar.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      {renderSummaryContent('checkout')}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          )}

          {checkoutStep === "success" && orderResult && (
            <section className="container mx-auto flex justify-center px-4 py-12">
              <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <CardTitle className="text-2xl">Pedido Realizado com Sucesso!</CardTitle>
                  <CardDescription>
                    Seu pedido <strong>#{orderResult.order_id}</strong> foi criado com sucesso.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-5 rounded-xl border border-blue-100 dark:border-blue-900">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100">Dados do Cliente</h3>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{clientData.name}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{clientData.email}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{clientData.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/30 dark:to-teal-900/30 p-6 rounded-xl border-2 border-green-300 dark:border-green-700 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500 dark:bg-green-600 rounded-xl shadow-md">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-green-700 dark:text-green-300">Total do Pedido</p>
                          <p className="text-4xl font-black text-green-700 dark:text-green-300 tracking-tight">
                            {orderResult.total}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-900/30 dark:to-gray-900/30 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <Sparkles className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">Esta é uma Demonstração</h3>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Em um cardápio real, você receberia um link do WhatsApp para confirmar o pedido e acompanhar o status.
                    </p>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full border-2 hover:bg-gray-50 dark:hover:bg-gray-900/50" 
                    size="lg"
                    onClick={() => {
                      setCheckoutStep("cart")
                      setOrderResult(null)
                      setClientData({ name: '', email: '', phone: '', cpf: '' })
                      setDeliveryData({ address: '', number: '', neighborhood: '', city: '', state: '', zip_code: '', complement: '', notes: '' })
                      setShippingMethod('pickup')
                      setPaymentMethod('pix')
                      setPaymentMethodName('PIX')
                    }}
                  >
                    Fazer Novo Pedido
                  </Button>
                </CardContent>
              </Card>
            </section>
          )}
        </Tabs>
      </main>

      {/* Mobile Cart Button */}
      {cartCount > 0 && (
        <Button
          onClick={() => setMobileSummaryOpen(true)}
          size="icon"
          className="fixed bottom-6 right-6 z-[60] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-xl transition hover:scale-105 lg:hidden"
        >
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <Badge className="absolute -top-3 -right-3 h-6 min-w-[1.5rem] rounded-full px-1 text-xs">
                {cartCount}
              </Badge>
            )}
          </div>
          <span className="sr-only">Abrir resumo do pedido</span>
        </Button>
      )}

      {/* Mobile Cart Sheet */}
      <Sheet open={mobileSummaryOpen} onOpenChange={setMobileSummaryOpen}>
        <SheetContent side="bottom" className="w-full max-h-[85vh] overflow-y-auto px-6 py-6 sm:mx-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Resumo do Pedido</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {renderSummaryContent('cart')}
          </div>
        </SheetContent>
      </Sheet>

      {/* Product Selection Dialog */}
      <Dialog
        open={showSelectionDialog}
        onOpenChange={(open) => {
          setShowSelectionDialog(open)
          if (!open) {
            resetSelectionState()
          }
        }}
      >
        <DialogContent className="max-w-2xl rounded-3xl border border-border/50 bg-background/95 p-0 shadow-2xl backdrop-blur">
          {selectedProduct && (
            <div className="space-y-6 overflow-y-auto p-6 sm:p-8">
              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="text-xl font-semibold sm:text-2xl">{selectedProduct.name}</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Personalize o pedido antes de adicionar ao carrinho.
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-muted sm:h-24 sm:w-24">
                  {selectedProduct.image ? (
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-muted-foreground">
                    {selectedProduct.description || 'Selecione as opções disponíveis e adicione ao seu pedido.'}
                  </p>
                  <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Preço base: <span className="text-primary font-semibold whitespace-nowrap">R$ {formatPrice(selectedProduct.promotionalPrice || selectedProduct.price)}</span>
                  </div>
                </div>
              </div>

              {selectedProduct.variations && selectedProduct.variations.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Variações</p>
                    <p className="text-sm text-muted-foreground">Escolha uma opção</p>
                  </div>
                  <RadioGroup value={selectedVariation} onValueChange={setSelectedVariation} className="grid gap-2">
                    {selectedProduct.variations.map((variation) => {
                      const isSelected = selectedVariation === variation.id
                      return (
                        <div
                          key={variation.id}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 transition ${
                            isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:bg-muted/40'
                          }`}
                        >
                          <RadioGroupItem value={variation.id} id={`variation-${variation.id}`} className="sr-only" />
                          <label htmlFor={`variation-${variation.id}`} className="flex flex-1 cursor-pointer items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-foreground">{variation.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {variation.price > 0 ? `+ R$ ${formatPrice(variation.price)}` : 'Sem custo adicional'}
                              </p>
                            </div>
                            <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}>
                              {isSelected ? <Check className="h-3 w-3" /> : null}
                            </div>
                          </label>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </div>
              )}

              {selectedProduct.optionals && selectedProduct.optionals.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opcionais</p>
                    <p className="text-sm text-muted-foreground">Adicione itens extras ao seu pedido</p>
                  </div>
                  <div className="space-y-3">
                    {selectedProduct.optionals.map((optional) => {
                      const qty = selectedOptionalsQty[optional.id] || 0
                      return (
                        <div
                          key={optional.id}
                          className="flex items-center justify-between rounded-2xl border border-dashed border-border/80 bg-muted/30 px-4 py-3"
                        >
                          <div>
                            <p className="text-sm font-medium text-foreground">{optional.name}</p>
                            <p className="text-xs text-muted-foreground">+ R$ {formatPrice(optional.price)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleOptionalQuantityChange(optional.id, -1)}
                              disabled={qty === 0}
                            >
                              <Minus className="h-4 w-4" />
                              <span className="sr-only">Remover opcional</span>
                            </Button>
                            <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleOptionalQuantityChange(optional.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                              <span className="sr-only">Adicionar opcional</span>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
                
              <Separator />

              <DialogFooter className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-full flex-col sm:w-auto">
                  <span className="text-[14px] font-medium uppercase tracking-wide text-muted-foreground">Total estimado</span>
                  <span className="text-xl font-semibold text-primary sm:text-2xl whitespace-nowrap">R$ {formatPrice(calculateSelectionTotal())}</span>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                  <Button
                    type="button"
                    variant="outline"
                    className="sm:min-w-[140px]"
                    onClick={() => {
                      setShowSelectionDialog(false)
                      resetSelectionState()
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="button"
                    className="sm:min-w-[180px]"
                    onClick={confirmAddToCart}
                    disabled={selectedProduct.variations && selectedProduct.variations.length > 0 && !selectedVariation}
                  >
                    <span className="whitespace-nowrap text-sm sm:text-base">Adicionar • R$ {formatPrice(calculateSelectionTotal())}</span>
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <SiteFooter />
    </div>
  )
}
