"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxForm, ComboboxOption } from "@/components/ui/combobox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthenticatedCategories, useMutation, useAuthenticatedApi } from "@/hooks/use-authenticated-api";
import { useBackendValidation, commonFieldMappings } from "@/hooks/use-backend-validation";
import { endpoints } from "@/lib/api-client";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { ProductVariationsManager } from "@/components/product-variations-manager";
import { ProductOptionalsManager } from "@/components/product-optionals-manager";
import { ProductVariation, ProductOptional } from "@/types/product-variations";

const productFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres."),
  description: z.string().min(5, "Descrição deve ter pelo menos 5 caracteres."),
  price: z.number().min(0, "Preço deve ser maior ou igual a 0."),
  price_cost: z.number().min(0, "Preço de custo deve ser maior ou igual a 0."),
  promotional_price: z.number().min(0, "Preço promocional deve ser maior ou igual a 0.").optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  weight: z.number().min(0, "Peso deve ser maior ou igual a 0.").optional(),
  height: z.number().min(0, "Altura deve ser maior ou igual a 0.").optional(),
  width: z.number().min(0, "Largura deve ser maior ou igual a 0.").optional(),
  depth: z.number().min(0, "Profundidade deve ser maior ou igual a 0.").optional(),
  shipping_info: z.string().optional(),
  warehouse_location: z.string().optional(),
  categories: z.array(z.string()).min(1, "Por favor, selecione pelo menos uma categoria."),
  qtd_stock: z.number().min(0, "Estoque deve ser maior ou igual a 0."),
  image: z.any().optional(),
  is_active: z.boolean().optional(),
});

interface ProductFormValues {
  name: string;
  description: string;
  price: number;
  price_cost: number;
  promotional_price?: number;
  brand?: string;
  sku?: string;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  shipping_info?: string;
  warehouse_location?: string;
  categories: string[];
  qtd_stock: number;
  image?: File;
  is_active?: boolean;
}

interface Product {
  id: number;
  identify?: string;
  name: string;
  description: string;
  price: number | string;
  price_cost: number | string;
  promotional_price?: number | string;
  brand?: string;
  sku?: string;
  weight?: number | string;
  height?: number | string;
  width?: number | string;
  depth?: number | string;
  shipping_info?: string;
  warehouse_location?: string;
  categories?: Array<{
    identify: string;
    name: string;
  }>;
  qtd_stock?: number | string;
  stock?: number | string;
  is_active?: boolean;
  isActive?: boolean;
  url?: string;
  image?: string;
  variations?: ProductVariation[];  // Formato novo
  optionals?: ProductOptional[];     // Novo campo
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  
  const [variations, setVariations] = useState<ProductVariation[]>([]);
  const [optionals, setOptionals] = useState<ProductOptional[]>([]);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  const { data: product, loading: loadingProduct, error: productError } = useAuthenticatedApi<Product>(
    endpoints.products.getById(productId)
  );
  const { data: categories, loading: categoriesLoading } = useAuthenticatedCategories();
  const { mutate: updateProduct, loading: updating } = useMutation();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      price_cost: 0,
      promotional_price: undefined,
      brand: "",
      sku: "",
      weight: undefined,
      height: undefined,
      width: undefined,
      depth: undefined,
      shipping_info: "",
      warehouse_location: "",
      categories: [],
      qtd_stock: 0,
      is_active: true,
    },
  });

  const { handleBackendErrors } = useBackendValidation(form.setError);

  // Carregar dados do produto no formulário
  useEffect(() => {
    if (product) {
      const productData = {
        name: product.name || "",
        description: product.description || "",
        price: typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price) || 0,
        price_cost: typeof product.price_cost === 'string' ? parseFloat(product.price_cost) : Number(product.price_cost) || 0,
        promotional_price: product.promotional_price ? (typeof product.promotional_price === 'string' ? parseFloat(product.promotional_price) : Number(product.promotional_price)) : undefined,
        brand: product.brand || "",
        sku: product.sku || "",
        weight: product.weight ? (typeof product.weight === 'string' ? parseFloat(product.weight) : Number(product.weight)) : undefined,
        height: product.height ? (typeof product.height === 'string' ? parseFloat(product.height) : Number(product.height)) : undefined,
        width: product.width ? (typeof product.width === 'string' ? parseFloat(product.width) : Number(product.width)) : undefined,
        depth: product.depth ? (typeof product.depth === 'string' ? parseFloat(product.depth) : Number(product.depth)) : undefined,
        shipping_info: product.shipping_info || "",
        warehouse_location: product.warehouse_location || "",
        categories: product.categories?.map(cat => cat.identify) || [],
        qtd_stock: product.qtd_stock ? (typeof product.qtd_stock === 'string' ? parseFloat(product.qtd_stock) : Number(product.qtd_stock)) : (product.stock ? (typeof product.stock === 'string' ? parseFloat(product.stock) : Number(product.stock)) : 0),
        is_active: product.is_active ?? product.isActive ?? true,
      };
      
      form.reset(productData);

      // DEBUG: Ver o que está chegando do backend
      // console.log('🔍 Produto carregado:', product);
      // console.log('🔍 Variations recebidas:', product.variations);
      // console.log('🔍 Optionals recebidos:', product.optionals);

      // Carregar variações se existirem
      if (product.variations && Array.isArray(product.variations)) {
        // console.log('✅ Carregando', product.variations.length, 'variações');
        setVariations(product.variations);
      } else {
        // console.log('⚠️ Nenhuma variação encontrada ou formato inválido');
        setVariations([]);
      }
      
      // Carregar opcionais se existirem
      if (product.optionals && Array.isArray(product.optionals)) {
        // console.log('✅ Carregando', product.optionals.length, 'opcionais');
        setOptionals(product.optionals);
      } else {
        // console.log('⚠️ Nenhum opcional encontrado ou formato inválido');
        setOptionals([]);
      }

      // Carregar imagem atual
      if (product.url || product.image) {
        const imageUrl = product.url || product.image;
        // console.log('Carregando imagem do produto:', imageUrl);
        setCurrentImage(imageUrl || null);
      } else {
        // console.log('Produto sem imagem');
        setCurrentImage(null);
      }
    }
  }, [product, form]);

  // Monitorar alterações no formulário
  useEffect(() => {
    setIsDirty(form.formState.isDirty);
  }, [form.formState.isDirty]);

  // Avisar ao sair com alterações não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const categoryOptions: ComboboxOption[] = Array.isArray(categories)
    ? categories.map((category: any) => ({
        value: category.identify,
        label: category.name,
      }))
    : [];

  const onSubmit = async (data: ProductFormValues) => {
    try {
      // console.log('Dados do formulário:', data);
      // console.log('Produto original:', product);
      
      const formData = new FormData();
      
      // Adicionar _method para Laravel reconhecer como PUT
      formData.append('_method', 'PUT');
      
      // Campos obrigatórios
      formData.append('name', data.name);
      formData.append('description', data.description);
      formData.append('price', data.price.toString());
      formData.append('price_cost', data.price_cost.toString());
      formData.append('qtd_stock', data.qtd_stock.toString());

      // Status ativo
      if (data.is_active !== undefined) {
        formData.append('is_active', data.is_active ? '1' : '0');
      } else {
        formData.append('is_active', '1'); // Default ativo
      }

      // Campos opcionais - só envia se tiver valor
      if (data.promotional_price && data.promotional_price > 0) {
        formData.append('promotional_price', data.promotional_price.toString());
      }
      if (data.brand && data.brand.trim()) {
        formData.append('brand', data.brand.trim());
      }
      if (data.sku && data.sku.trim()) {
        formData.append('sku', data.sku.trim());
      }
      if (data.weight && data.weight > 0) {
        formData.append('weight', data.weight.toString());
      }
      if (data.height && data.height > 0) {
        formData.append('height', data.height.toString());
      }
      if (data.width && data.width > 0) {
        formData.append('width', data.width.toString());
      }
      if (data.depth && data.depth > 0) {
        formData.append('depth', data.depth.toString());
      }
      if (data.shipping_info && data.shipping_info.trim()) {
        formData.append('shipping_info', data.shipping_info.trim());
      }
      if (data.warehouse_location && data.warehouse_location.trim()) {
        formData.append('warehouse_location', data.warehouse_location.trim());
      }

      // Variações como JSON
      // console.log('📤 Enviando variations:', variations);
      if (variations.length > 0) {
        formData.append('variations', JSON.stringify(variations));
      } else {
        formData.append('variations', JSON.stringify([]));
      }
      
      // Opcionais como JSON
      // console.log('📤 Enviando optionals:', optionals);
      if (optionals.length > 0) {
        formData.append('optionals', JSON.stringify(optionals));
      } else {
        formData.append('optionals', JSON.stringify([]));
      }

      // Categorias
      data.categories.forEach((categoryId, index) => {
        formData.append(`categories[${index}]`, categoryId);
      });

      // Nova imagem (se selecionada)
      if (data.image && data.image instanceof File) {
        formData.append('image', data.image);
        // console.log('Nova imagem selecionada:', data.image.name);
      } else {
        // console.log('Sem nova imagem - mantendo a atual');
      }

      // Debug: Log de tudo que está sendo enviado
      // console.log('Dados enviados para API:');
      for (const [key, value] of formData.entries()) {
        // console.log(`${key}:`, value);
      }

      // IMPORTANTE: Usar POST ao invés de PUT quando enviando FormData com _method
      // Isso é necessário porque FormData com arquivos precisa ser POST no Laravel
      const result = await updateProduct(endpoints.products.update(productId), 'POST', formData);
      
      if (result) {
        toast.success('Produto atualizado com sucesso!');
        setIsDirty(false);
        router.push('/products');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar produto:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        data: error.data,
        errors: error.errors
      });
      
      // Se houver erros de validação, mostrar no console
      if (error.data?.data) {
        console.error('Erros de validação do backend:', error.data.data);
        Object.entries(error.data.data).forEach(([field, messages]) => {
          console.error(`Campo ${field}:`, messages);
        });
      }
      
      // Tratamento especial para erro de upload de imagem
      if (error.data?.errors?.image) {
        const imageErrors = Array.isArray(error.data.errors.image) 
          ? error.data.errors.image.join(' ') 
          : error.data.errors.image;
        toast.error(`Erro no upload da imagem: ${imageErrors}`);
        form.setError('image', {
          type: 'server',
          message: imageErrors
        });
        return; // Retornar aqui para não processar mais erros
      }
      
      const handled = handleBackendErrors(error, commonFieldMappings as any);
      
      if (!handled) {
        const errorMsg = error.data?.message || error.message || 'Erro ao atualizar produto';
        toast.error(errorMsg);
      }
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm('Você tem alterações não salvas. Deseja realmente sair?');
      if (!confirm) return;
    }
    router.back();
  };

  // Loading state
  if (loadingProduct) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Carregando produto...</p>
      </div>
    );
  }

  // Error state
  if (productError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-destructive">Erro ao carregar produto</p>
        <Button variant="outline" onClick={() => router.push('/products')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header com breadcrumbs */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button 
            onClick={() => router.push('/products')}
            className="hover:text-foreground transition-colors"
          >
            Produtos
          </button>
          <span>/</span>
          <button 
            onClick={() => router.push(`/products/${productId}`)}
            className="hover:text-foreground transition-colors"
          >
            {product.name}
          </button>
          <span>/</span>
          <span className="text-foreground">Editar</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Produto</h1>
            <p className="text-muted-foreground">Atualize as informações do produto</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Dados principais do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Produto *</FormLabel>
                      <FormControl>
                        <Input placeholder="Pizza Margherita" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrição detalhada do produto"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca/Fabricante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nike, Samsung, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>SKU/Código</FormLabel>
                      <FormControl>
                        <Input placeholder="PRD-001, ABC123, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categories"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorias *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {field.value?.map((categoryId: string) => {
                              const category = Array.isArray(categories) 
                                ? categories.find((cat: any) => cat.identify === categoryId)
                                : null;
                              return (
                                <div
                                  key={categoryId}
                                  className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                                >
                                  <span>{category?.name || categoryId}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newCategories = field.value?.filter(id => id !== categoryId) || [];
                                      field.onChange(newCategories);
                                    }}
                                    className="text-primary hover:text-primary/80"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <ComboboxForm
                            field={{
                              value: "",
                              onChange: (value: string) => {
                                if (value && !field.value?.includes(value)) {
                                  const newCategories = [...(field.value || []), value];
                                  field.onChange(newCategories);
                                }
                              },
                              onBlur: field.onBlur,
                              name: field.name,
                            }}
                            options={categoryOptions}
                            placeholder="Adicionar categoria"
                            searchPlaceholder="Buscar categoria..."
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Produto Ativo</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Desmarque para desativar o produto
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Preços e Estoque */}
            <Card>
              <CardHeader>
                <CardTitle>Preços e Estoque</CardTitle>
                <CardDescription>Informações financeiras e de estoque</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price_cost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Custo (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço de Venda (R$) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="promotional_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Promocional (R$)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00 (opcional)"
                          {...field}
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qtd_stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Estoque *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Logística */}
            <Card>
              <CardHeader>
                <CardTitle>Logística</CardTitle>
                <CardDescription>Peso, dimensões e localização</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Peso (kg)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.001"
                          placeholder="0.000 (opcional)"
                          value={field.value ?? ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === '' ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Altura (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Largura (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="depth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Profundidade (cm)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={field.value ?? ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === '' ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="warehouse_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Localização no Estoque</FormLabel>
                      <FormControl>
                        <Input placeholder="A1-B2, Setor A, etc. (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shipping_info"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informações de Envio</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Prazo de entrega, restrições, métodos de envio, etc. (opcional)"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>


            {/* Imagem */}
            <Card>
              <CardHeader>
                <CardTitle>Imagem</CardTitle>
                <CardDescription>Foto do produto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Preview da imagem atual */}
                {currentImage && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                    <img
                      src={currentImage}
                      alt="Imagem atual do produto"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', currentImage);
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3ESem imagem%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge>Imagem Atual</Badge>
                    </div>
                  </div>
                )}
                
                {!currentImage && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <p>Sem imagem cadastrada</p>
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {currentImage ? 'Selecionar Nova Imagem' : 'Imagem do Produto'}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validar tamanho (máx 2MB)
                              const maxSize = 2 * 1024 * 1024; // 2MB em bytes
                              if (file.size > maxSize) {
                                toast.error('Imagem muito grande! Tamanho máximo: 2MB');
                                e.target.value = ''; // Limpar input
                                return;
                              }

                              // Validar tipo de arquivo
                              const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml'];
                              if (!validTypes.includes(file.type)) {
                                toast.error('Tipo de arquivo inválido! Use: JPG, PNG, GIF ou SVG');
                                e.target.value = ''; // Limpar input
                                return;
                              }

                              // console.log('Imagem selecionada:', {
                              //   name: file.name,
                              //   size: `${(file.size / 1024).toFixed(2)} KB`,
                              //   type: file.type
                              // });

                              field.onChange(file);
                              // Preview da nova imagem
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setCurrentImage(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </FormControl>
                      <p className="text-sm text-muted-foreground">
                        {currentImage 
                          ? 'Selecione uma nova imagem para substituir a atual' 
                          : 'Nenhuma imagem cadastrada'}
                        <br />
                        <span className="text-xs">
                          Formatos aceitos: JPG, PNG, GIF, SVG • Tamanho máximo: 2MB
                        </span>
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* Variações e Opcionais - Full Width */}
          <div className="space-y-6">
            <ProductVariationsManager
              variations={variations}
              onChange={setVariations}
            />

            <ProductOptionalsManager
              optionals={optionals}
              onChange={setOptionals}
            />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

