"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ComboboxForm, ComboboxOption } from "@/components/ui/combobox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Trash2, Calculator, UserPlus } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthenticatedClients, useAuthenticatedProducts, useAuthenticatedTables, useAuthenticatedActivePaymentMethods, useMutation } from "@/hooks/use-authenticated-api";
import { useProducts } from "@/hooks/use-api"; // Temporário para teste
import { endpoints } from "@/lib/api-client";
import { toast } from "sonner";
import { useOrderRefresh } from "@/hooks/use-order-refresh";
import { useAuth } from "@/contexts/auth-context";
import { useBackendValidation } from "@/hooks/use-backend-validation";
import { ClientFormDialog } from "../../clients/components/client-form-dialog";
import { StateCityFormFields } from "@/components/location/state-city-form-fields";

const orderFormSchema = z.object({
  clientId: z.string().min(1, "Por favor, selecione um cliente."),
  products: z.array(z.object({
    productId: z.string().min(1, { message: "Selecione um produto." }),
    quantity: z.number().min(1, { message: "Quantidade deve ser maior que 0." }),
    price: z.number().min(0),
  })).min(1, { message: "Adicione pelo menos um produto." }),
  status: z.string().min(1, "Por favor, selecione um status."),
  isDelivery: z.boolean(),
  tableId: z.string().optional(),
  total: z.number().min(0),
  discountValue: z.number().min(0).optional(),
  discountType: z.enum(["percentage", "fixed"]).optional(),
  paymentMethodId: z.string().min(1, "Por favor, selecione uma forma de pagamento."),
  
  // Delivery fields
  useClientAddress: z.boolean(),
  deliveryAddress: z.string().optional(),
  deliveryCity: z.string().optional(),
  deliveryState: z.string().optional(),
  deliveryZipCode: z.string().optional(),
  deliveryNeighborhood: z.string().optional(),
  deliveryNumber: z.string().optional(),
  deliveryComplement: z.string().optional(),
  deliveryNotes: z.string().optional(),
}).refine((data) => {
  if (!data.isDelivery && (!data.tableId || data.tableId === "")) {
    return false;
  }
  return true;
}, {
  message: "Por favor, selecione uma mesa.",
  path: ["tableId"],
}).refine((data) => {
  if (data.isDelivery && !data.useClientAddress) {
    if (!data.deliveryAddress || !data.deliveryCity) {
      return false;
    }
  }
  return true;
}, {
  message: "Endereço e cidade são obrigatórios para delivery.",
  path: ["deliveryAddress"],
});

interface OrderFormValues {
  clientId: string;
  products: {
    productId: string;
    quantity: number;
    price: number;
  }[];
  status: string;
  isDelivery: boolean;
  tableId?: string;
  total: number;
  discountValue?: number;
  discountType?: "percentage" | "fixed";
  paymentMethodId: string;
  useClientAddress: boolean;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
  deliveryNeighborhood?: string;
  deliveryNumber?: string;
  deliveryComplement?: string;
  deliveryNotes?: string;
}

interface Client {
  id: number;
  identify: string;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  has_complete_address?: boolean;
}

interface Product {
  id?: number
  identify: string
  uuid: string
  name: string
  description: string
  price: string | number
  price_cost?: string | number
  promotional_price?: string | number | null
  brand?: string | null
  sku?: string | null
  weight?: string | number | null
  height?: string | number | null
  width?: string | number | null
  depth?: string | number | null
  shipping_info?: string | null
  warehouse_location?: string | null
  variations?: Array<{
    type: string
    value: string
  }>
  qtd_stock: number
  is_active: boolean
  created_at: string
  categories?: Array<{
    identify: string
    name: string
    description: string
    url: string
    status: string
    created_at: string
  }>
}

interface Table {
  id: number;
  identify: string;
  uuid: string;
  name: string;
  capacity: number;
}

interface PaymentMethod {
  id?: number;
  uuid: string;
  name: string;
  description?: string;
  status: string;
  is_active: boolean;
  tenant_id?: number;
  created_at: string;
  updated_at: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { triggerRefresh } = useOrderRefresh();
  const auth = useAuth();
  const { data: clientsData, loading: clientsLoading, refetch: refetchClients } = useAuthenticatedClients();
  const { data: productsData, loading: productsLoading } = useProducts(); // Teste não autenticado
  const { data: tablesData, loading: tablesLoading } = useAuthenticatedTables();
  const { data: paymentMethodsData, loading: paymentMethodsLoading } = useAuthenticatedActivePaymentMethods();
  const { mutate: createOrder, loading: creating } = useMutation();
  const { mutate: createClient } = useMutation();
  
  // Hook autenticado para produtos (inicializado após os outros)
  const { data: productsDataAuth, loading: productsLoadingAuth } = useAuthenticatedProducts();
  
  // Estado para controlar modal de adicionar cliente
  const [clientDialogOpen, setClientDialogOpen] = useState(false);

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      clientId: "",
      products: [{ productId: "", quantity: 1, price: 0 }],
      status: "Pendente",
      isDelivery: false,
      tableId: "",
      total: 0,
      discountValue: 0,
      discountType: "percentage",
      paymentMethodId: "",
      useClientAddress: false,
      deliveryAddress: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryZipCode: "",
      deliveryNeighborhood: "",
      deliveryNumber: "",
      deliveryComplement: "",
      deliveryNotes: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  const { handleBackendErrors } = useBackendValidation(form.setError);

  const isDelivery = form.watch("isDelivery");
  const useClientAddress = form.watch("useClientAddress");
  const selectedClientId = form.watch("clientId");
  const watchProducts = form.watch("products");
  const discountValue = form.watch("discountValue");
  const discountType = form.watch("discountType");

  // Debug dos hooks após todas as declarações
  console.log('=== COMPARAÇÃO DE HOOKS ===');
  console.log('Hook NÃO autenticado:');
  console.log('  - loading:', productsLoading);
  console.log('  - data:', productsData);
  console.log('Hook AUTENTICADO:');
  console.log('  - loading:', productsLoadingAuth);
  console.log('  - data:', productsDataAuth);
  console.log('===========================');

  // Transformar dados da API com logs mais detalhados
  const getArrayFromData = (data: any) => {
    console.log('getArrayFromData entrada:', data);
    console.log('tipo:', typeof data);
    console.log('é array?', Array.isArray(data));
    
    if (!data) {
      console.log('data é null/undefined');
      return [];
    }
    
    if (Array.isArray(data)) {
      console.log('data é array direto, length:', data.length);
      console.log('primeiros itens:', data.slice(0, 2));
      return data;
    }
    
    if (data.data && Array.isArray(data.data)) {
      console.log('data.data é array, length:', data.data.length);
      console.log('primeiros itens:', data.data.slice(0, 2));
      return data.data;
    }
    
    if (data.success && data.data && Array.isArray(data.data)) {
      console.log('data.success.data é array, length:', data.data.length);
      console.log('primeiros itens:', data.data.slice(0, 2));
      return data.data;
    }
    
    // Tentar extrair se for Laravel Resource Collection
    if (data.data && data.data.data && Array.isArray(data.data.data)) {
      console.log('Laravel Resource Collection detectada, length:', data.data.data.length);
      return data.data.data;
    }
    
    console.log('Não conseguiu extrair array, estrutura completa:', JSON.stringify(data, null, 2));
    return [];
  };

  const clients = getArrayFromData(clientsData).filter((c: any) => c && c.id);
  // Usar dados de qualquer hook que funcionar e filtrar apenas produtos ativos
  const finalProductsData = productsDataAuth || productsData;
  const finalProductsLoading = productsLoadingAuth && productsLoading;
  const products = getArrayFromData(finalProductsData)
    .filter((p: any) => {
      // Verificar se produto tem os campos necessários e está ativo
      const hasRequiredFields = p && p.identify && p.name;
      const isActive = p.is_active === true || p.is_active === 1;
      const hasStock = p.qtd_stock > 0;
      
      console.log('Filtrando produto:', {
        name: p?.name,
        identify: p?.identify,
        hasRequiredFields,
        isActive,
        hasStock,
        shouldInclude: hasRequiredFields && isActive && hasStock
      });
      
      return hasRequiredFields && isActive && hasStock;
    });
  const tables = getArrayFromData(tablesData).filter((t: any) => t && t.id);
  const paymentMethods = getArrayFromData(paymentMethodsData).filter((pm: any) => pm && pm.uuid && pm.is_active);

  console.log('=== DADOS FINAIS ===');
  console.log('finalProductsData:', finalProductsData);
  console.log('finalProductsLoading:', finalProductsLoading);
  console.log('produtos após filtro:', products.length);
  console.log('produtos brutos antes do filtro:', getArrayFromData(finalProductsData).length);
  console.log('primeiro produto filtrado:', products[0]);
  console.log('==================');

  console.log('=== COMPARAÇÃO DE HOOKS ===');
  console.log('Hook NÃO autenticado:');
  console.log('  - loading:', productsLoading);
  console.log('  - data:', productsData);
  console.log('Hook AUTENTICADO:');
  console.log('  - loading:', productsLoadingAuth);
  console.log('  - data:', productsDataAuth);
  console.log('===========================');

  const clientOptions: ComboboxOption[] = clients.map((client: Client) => ({
    value: client.uuid || client.identify || client.id.toString(),
    label: client.phone ? `${client.name} - ${client.phone}` : client.name,
  }));

  const productOptions: ComboboxOption[] = products.map((product: Product) => {
    console.log('Mapeando produto para opção:', product);
    
    // Converter price de string para number se necessário
    const price = typeof product.price === 'string' 
      ? parseFloat(product.price) || 0 
      : product.price || 0;
    
    const promotionalPrice = product.promotional_price 
      ? (typeof product.promotional_price === 'string' 
          ? parseFloat(product.promotional_price) 
          : product.promotional_price)
      : null;
    
    const uuid = product.uuid || product.identify;
    const name = product.name || 'Produto sem nome';
    
    // Usar preço promocional se disponível, senão preço normal
    const displayPrice = promotionalPrice || price;
    const priceText = promotionalPrice 
      ? `R$ ${displayPrice.toFixed(2)} (promo)`
      : `R$ ${displayPrice.toFixed(2)}`;
    
    return {
      value: uuid,
      label: `${name} - ${priceText}`,
    };
  });

  console.log('=== PRODUTO OPTIONS FINAL ===');
  console.log('Total de options:', productOptions.length);
  console.log('Primeiras 3 options:', productOptions.slice(0, 3));
  console.log('============================');

  const tableOptions: ComboboxOption[] = tables.map((table: Table) => ({
    value: table.uuid || table.identify || table.id.toString(),
    label: `${table.name} (${table.capacity} pessoas)`,
  }));

  const paymentMethodOptions: ComboboxOption[] = paymentMethods.map((paymentMethod: PaymentMethod) => ({
    value: paymentMethod.uuid,
    label: paymentMethod.name,
  }));

  // Buscar dados do cliente selecionado
  const selectedClient = clients.find((c: Client) => 
    c.uuid === selectedClientId || c.identify === selectedClientId || c.id.toString() === selectedClientId
  );

  // Preencher endereço do cliente automaticamente
  useEffect(() => {
    if (isDelivery && useClientAddress && selectedClient && selectedClient.has_complete_address) {
      form.setValue("deliveryAddress", selectedClient.address || "");
      form.setValue("deliveryCity", selectedClient.city || "");
      form.setValue("deliveryState", selectedClient.state || "");
      form.setValue("deliveryZipCode", selectedClient.zip_code || "");
      form.setValue("deliveryNeighborhood", selectedClient.neighborhood || "");
      form.setValue("deliveryNumber", selectedClient.number || "");
      form.setValue("deliveryComplement", selectedClient.complement || "");
    } else if (isDelivery && !useClientAddress) {
      form.setValue("deliveryAddress", "");
      form.setValue("deliveryCity", "");
      form.setValue("deliveryState", "");
      form.setValue("deliveryZipCode", "");
      form.setValue("deliveryNeighborhood", "");
      form.setValue("deliveryNumber", "");
      form.setValue("deliveryComplement", "");
    }
  }, [useClientAddress, selectedClient, isDelivery, form]);

  // Função helper para converter preço para número
  const getPriceAsNumber = (price: string | number | undefined): number => {
    if (typeof price === 'number') {
      return price;
    }
    if (typeof price === 'string') {
      return parseFloat(price) || 0;
    }
    return 0;
  };

  // Calcular total automaticamente
  useEffect(() => {
    const subtotal = watchProducts.reduce((sum, item) => {
      const product = products.find((p: Product) => 
        p.uuid === item.productId || p.identify === item.productId
      );
      if (product) {
        // Usar preço promocional se disponível, senão preço normal
        const price = product.promotional_price 
          ? getPriceAsNumber(product.promotional_price)
          : getPriceAsNumber(product.price);
        return sum + (price * item.quantity);
      }
      return sum + (item.price * item.quantity); // Usar preço do item se produto não encontrado
    }, 0);
    
    let discount = 0;
    if (discountValue && discountValue > 0) {
      if (discountType === "percentage") {
        discount = (subtotal * discountValue) / 100;
      } else {
        discount = discountValue;
      }
    }
    
    const total = Math.max(0, subtotal - discount);
    form.setValue("total", total);
  }, [watchProducts, products, discountValue, discountType, form]);

  const handleProductChange = (index: number, productId: string) => {
    const product = products.find((p: Product) => 
      p.uuid === productId || p.identify === productId
    );
    if (product) {
      // Usar preço promocional se disponível, senão preço normal
      const price = product.promotional_price 
        ? getPriceAsNumber(product.promotional_price)
        : getPriceAsNumber(product.price);
      
      console.log('Produto selecionado:', {
        name: product.name,
        uuid: product.uuid,
        priceOriginal: product.price,
        promotionalPrice: product.promotional_price,
        finalPrice: price
      });
      
      form.setValue(`products.${index}.price`, price);
    } else {
      form.setValue(`products.${index}.price`, 0);
    }
  };

  // Função para adicionar cliente
  const handleAddClient = async (clientData: any) => {
    const result = await createClient(
      endpoints.clients.create,
      'POST',
      clientData
    )
    
    if (result?.data?.id) {
      // Recarregar lista de clientes
      await refetchClients()
      
      // Selecionar automaticamente o cliente criado
      form.setValue('clientId', result.data.uuid || result.data.identify || result.data.id.toString())
      
      // Mostrar sucesso
      toast.success(`${result.data.name} foi cadastrado e selecionado com sucesso!`)
    }
    // Se houver erro, o createClient vai lançar e o ClientFormDialog vai capturar
  };

  const onSubmit = async (data: OrderFormValues) => {
    try {
      console.log('=== DEBUG onSubmit ===');
      console.log('auth object:', auth);
      console.log('auth.user:', auth.user);
      
      // Obter token da empresa do usuário autenticado
      const user = auth.user;
      console.log('user from auth:', user);
      console.log('user?.tenant:', user?.tenant);
      console.log('user?.tenant_id:', user?.tenant_id);
      
      const tenantId = user?.tenant?.uuid || user?.tenant_id;
      console.log('tenantId calculated:', tenantId);
      
      if (!tenantId) {
        console.error('tenantId is falsy:', tenantId);
        toast.error('Usuário não possui empresa associada. Por favor, faça login novamente.');
        return;
      }
      
      // Converter dados para o formato esperado pelo backend
      const orderData = {
        token_company: tenantId,
        client_id: data.clientId || null,
        table: data.isDelivery ? null : data.tableId,
        is_delivery: data.isDelivery,
        use_client_address: data.useClientAddress,
        delivery_address: data.deliveryAddress,
        delivery_city: data.deliveryCity,
        delivery_state: data.deliveryState,
        delivery_zip_code: data.deliveryZipCode,
        delivery_neighborhood: data.deliveryNeighborhood,
        delivery_number: data.deliveryNumber,
        delivery_complement: data.deliveryComplement,
        delivery_notes: data.deliveryNotes,
        comment: '', // Campo comentário se necessário
        products: data.products.map(product => ({
          identify: product.productId, // Este já será o UUID agora
          qty: product.quantity,
          price: product.price
        }))
      };
      
      console.log('=== DADOS CONVERTIDOS PARA O BACKEND ===');
      console.log('orderData:', orderData);
      console.log('token_company:', orderData.token_company);
      console.log('table:', orderData.table);
      console.log('products:', orderData.products);
      
      const result = await createOrder(endpoints.orders.create, 'POST', orderData);
      
      if (result) {
        toast.success('Pedido criado com sucesso!');
        router.push('/orders');
          triggerRefresh();
      }
    } catch (error: any) {
      console.error('Erro ao criar pedido:', error);
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
      
      // Mapeamento de campos específicos para pedidos
      const orderFieldMappings: Record<string, string> = {
        'client_id': 'clientId',
        'table': 'tableId',
        'products': 'products',
        'products.*.qty': 'products',
        'products.*.identify': 'products',
        'delivery_address': 'deliveryAddress',
        'delivery_city': 'deliveryCity',
        'delivery_state': 'deliveryState',
        'delivery_zip_code': 'deliveryZipCode',
        'delivery_neighborhood': 'deliveryNeighborhood',
        'delivery_number': 'deliveryNumber',
        'payment_method_id': 'paymentMethodId',
        'is_delivery': 'isDelivery',
      };
      
      const handled = handleBackendErrors(error, orderFieldMappings as any);
      
      if (!handled) {
        const errorMsg = error.data?.message || error.message || 'Erro ao criar pedido';
        toast.error(errorMsg);
      }
    }
  };

  // Calcular subtotal para exibição
  const subtotal = watchProducts.reduce((sum, item) => {
    const product = products.find((p: Product) => 
      p.uuid === item.productId || p.identify === item.productId
    );
    if (product) {
      // Usar preço promocional se disponível, senão preço normal
      const price = product.promotional_price 
        ? getPriceAsNumber(product.promotional_price)
        : getPriceAsNumber(product.price);
      return sum + (price * item.quantity);
    }
    return sum + (item.price * item.quantity); // Usar preço do item se produto não encontrado
  }, 0);

  const discount = discountValue && discountValue > 0 ? 
    (discountType === "percentage" ? (subtotal * discountValue) / 100 : discountValue) : 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Novo Pedido</h1>
          <p className="text-muted-foreground">Adicione um novo pedido ao sistema</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações do Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>Selecione o cliente para este pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente *</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <ComboboxForm
                            field={field}
                            options={clientOptions}
                            placeholder="Selecionar cliente..."
                            searchPlaceholder="Buscar cliente..."
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          size="icon"
                          variant="outline"
                          onClick={() => setClientDialogOpen(true)}
                          title="Adicionar novo cliente"
                        >
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedClient && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold">{selectedClient.name}</h4>
                    {selectedClient.email && (
                      <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                    )}
                    {selectedClient.phone && (
                      <p className="text-sm text-muted-foreground">{selectedClient.phone}</p>
                    )}
                    {selectedClient.has_complete_address && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Endereço completo disponível
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tipo de Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de Pedido</CardTitle>
                <CardDescription>Delivery ou consumo no local</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="isDelivery"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Delivery</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Este pedido é para entrega
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

                {!isDelivery && (
                  <FormField
                    control={form.control}
                    name="tableId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mesa *</FormLabel>
                        <FormControl>
                          <ComboboxForm
                            field={field}
                            options={tableOptions}
                            placeholder="Selecionar mesa..."
                            searchPlaceholder="Buscar mesa..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecionar status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pendente">Pendente</SelectItem>
                          <SelectItem value="Preparando">Preparando</SelectItem>
                          <SelectItem value="Pronto">Pronto</SelectItem>
                          <SelectItem value="Entregue">Entregue</SelectItem>
                          <SelectItem value="Cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Endereço de Entrega */}
            {isDelivery && (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Endereço de Entrega</CardTitle>
                  <CardDescription>Informações para entrega do pedido</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedClient && selectedClient.has_complete_address && (
                    <FormField
                      control={form.control}
                      name="useClientAddress"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Usar endereço do cliente
                            </FormLabel>
                            <div className="text-sm text-muted-foreground">
                              Utilizar o endereço cadastrado do cliente
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
                  )}

                  {(!useClientAddress || !selectedClient?.has_complete_address) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="deliveryAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço *</FormLabel>
                            <FormControl>
                              <Input placeholder="Rua das Flores, 123" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryNeighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Centro" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Estado e Cidade */}
                      <div className="md:col-span-2">
                        <StateCityFormFields
                          control={form.control}
                          stateFieldName="deliveryState"
                          cityFieldName="deliveryCity"
                          stateLabel="Estado"
                          cityLabel="Cidade"
                          required
                          gridCols="equal"
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="deliveryZipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="01000-000" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryComplement"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Complemento</FormLabel>
                            <FormControl>
                              <Input placeholder="Apartamento 101, Bloco A" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="deliveryNotes"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Observações de Entrega</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Observações especiais para a entrega..."
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Produtos */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Produtos do Pedido</CardTitle>
                <CardDescription>Adicione os produtos para este pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg">
                    <div className="flex-1">
                      <FormField
                        control={form.control}
                        name={`products.${index}.productId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Produto</FormLabel>
                            <FormControl>
                              <ComboboxForm
                                field={{
                                  ...field,
                                  onChange: (value: string) => {
                                    field.onChange(value);
                                    handleProductChange(index, value);
                                  }
                                }}
                                options={finalProductsLoading ? 
                                  [{ value: "loading", label: "Carregando produtos...", disabled: true }] :
                                  productOptions.length > 0 ? 
                                    productOptions : 
                                    [{ value: "no-products", label: "Nenhum produto disponível", disabled: true }]
                                }
                                placeholder="Selecionar produto..."
                                searchPlaceholder="Buscar produto..."
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-24">
                      <FormField
                        control={form.control}
                        name={`products.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Qtd</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="w-32">
                      <FormField
                        control={form.control}
                        name={`products.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preço</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.01"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                                readOnly
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ productId: "", quantity: 1, price: 0 })}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </CardContent>
            </Card>

            {/* Resumo e Desconto */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
                <CardDescription>Valores e desconto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Desconto</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="percentage">Percentual (%)</SelectItem>
                            <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Desconto {discountType === "percentage" ? "(%)" : "(R$)"}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={discountType === "percentage" ? "0.01" : "0.01"}
                            min="0"
                            max={discountType === "percentage" ? "100" : undefined}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col gap-2 justify-end">
                    <div className="text-sm text-muted-foreground">Resumo</div>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Desconto:</span>
                          <span>-R$ {discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-1">
                        <span>Total:</span>
                        <span>R$ {(subtotal - discount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Forma de Pagamento */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Forma de Pagamento</CardTitle>
                <CardDescription>Selecione a forma de pagamento para este pedido</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="paymentMethodId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Forma de Pagamento *</FormLabel>
                      <FormControl>
                        <ComboboxForm
                          field={field}
                          options={paymentMethodsLoading ? 
                            [{ value: "loading", label: "Carregando formas de pagamento...", disabled: true }] :
                            paymentMethodOptions.length > 0 ? 
                              paymentMethodOptions : 
                              [{ value: "no-methods", label: "Nenhuma forma de pagamento disponível", disabled: true }]
                          }
                          placeholder="Selecionar forma de pagamento..."
                          searchPlaceholder="Buscar forma de pagamento..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? "Criando..." : "Criar Pedido"}
            </Button>
          </div>
        </form>
      </Form>

      {/* Modal de Adicionar Cliente */}
      <ClientFormDialog
        onAddClient={handleAddClient}
        onEditClient={() => {}}
        editingClient={null}
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        hideTrigger={true}
      />
    </div>
  );
}



