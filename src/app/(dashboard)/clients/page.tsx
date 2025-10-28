"use client";

import { useState, useEffect } from "react";
import { StatCards } from "./components/stat-cards";
import { DataTable } from "./components/data-table";
import { ClientFormDialog } from "./components/client-form-dialog";
import { SuccessAlert } from "./components/success-alert";
import {
  useAuthenticatedClients,
  useMutation,
} from "@/hooks/use-authenticated-api";
import { endpoints } from "@/lib/api-client";
import { PageLoading } from "@/components/ui/loading-progress";
import { showErrorToast, showSuccessToast } from "@/components/ui/error-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface Client {
  id: number;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  full_address?: string;
  has_complete_address?: boolean;
  total_orders: number;
  last_order?: string;
  last_order_raw?: string;
  is_active: boolean;
  created_at: string;
  created_at_formatted: string;
  updated_at: string;
}

interface ClientFormValues {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  neighborhood?: string;
  number?: string;
  complement?: string;
  isActive: boolean;
}

export default function ClientsPage() {
  const {
    data: clientsData,
    loading,
    error,
    refetch,
    isAuthenticated,
  } = useAuthenticatedClients();
  const { mutate: createClient, loading: creating } = useMutation();
  const { mutate: updateClient, loading: updating } = useMutation();
  const { mutate: deleteClient, loading: deleting } = useMutation();

  // Estados para o modal de edição
  const [editingClient, setEditingClient] = useState<
    (ClientFormValues & { id: number }) | null
  >(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Estados para o alert de sucesso
  const [successAlert, setSuccessAlert] = useState({
    open: false,
    title: "",
    message: "",
  });

  // Transformar dados da API
  const getArrayFromData = (data: any) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  const clients: Client[] = getArrayFromData(clientsData);

  const handleAddClient = async (clientData: ClientFormValues) => {
    try {
      const result = await createClient(
        endpoints.clients.create,
        "POST",
        clientData
      );

      if (result) {
        // Mostrar sucesso
        showSuccessToast("Cliente cadastrado com sucesso!", "Sucesso");
        
        // Recarregar dados
        setTimeout(async () => {
          await refetch();
        }, 100);
      }
    } catch (error: any) {
      // Log organizado em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Erro ao Criar Cliente')
        console.log('Error:', error)
        console.log('Message:', error?.message)
        console.log('Data:', error?.data)
        console.log('Errors:', error?.errors)
        console.groupEnd()
      }
      
      // Mostrar erro formatado
      showErrorToast(error, "Erro ao Cadastrar Cliente");
      
      // Re-lançar erro para o ClientFormDialog capturar e marcar campos
      throw error;
    }
  };

  const handleDeleteClient = async (id: number) => {
    try {
      const result = await deleteClient(
        endpoints.clients.delete(id.toString()),
        "DELETE"
      );

      if (result) {
        showSuccessToast("Cliente excluído com sucesso!", "Sucesso");
        // Recarregar dados após exclusão
        await refetch();
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Erro ao Excluir Cliente')
        console.log('Error:', error)
        console.groupEnd()
      }
      
      showErrorToast(error, "Erro ao Excluir Cliente");
    }
  };

  const handleShowSuccessAlert = (title: string, message: string) => {
    setSuccessAlert({
      open: true,
      title,
      message,
    });
  };

  const handleCloseDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingClient(null);
    }
  };

  const handleEditClient = async (id: number, clientData: ClientFormValues) => {
    try {
      const result = await updateClient(
        endpoints.clients.update(id),
        "PUT",
        clientData
      );

      if (result) {
        showSuccessToast("Cliente atualizado com sucesso!", "Sucesso");
        setEditingClient(null);
        
        // Recarregar dados
        setTimeout(async () => {
          await refetch();
        }, 100);
      }
    } catch (error: any) {
      if (process.env.NODE_ENV === 'development') {
        console.group('🔴 Erro ao Atualizar Cliente')
        console.log('Error:', error)
        console.log('Message:', error?.message)
        console.log('Data:', error?.data)
        console.log('Errors:', error?.errors)
        console.groupEnd()
      }
      
      showErrorToast(error, "Erro ao Atualizar Cliente");
      
      // Re-lançar erro para o ClientFormDialog capturar
      throw error;
    }
  };

  const handleStartEdit = (id: number, clientData: ClientFormValues) => {
    setEditingClient({ ...clientData, id });
    setIsDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">
          Usuário não autenticado. Faça login para continuar.
        </div>
      </div>
    );
  }

  if (loading) {
    return <PageLoading isLoading={loading} message="Carregando clientes..." />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-destructive">
          Erro ao carregar clientes: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="@container/main px-4 lg:px-6">
        <StatCards />
      </div>
      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <ClientFormDialog
          onAddClient={handleAddClient}
          onEditClient={handleEditClient}
          editingClient={editingClient}
          open={isDialogOpen}
          onOpenChange={handleCloseDialog}
        />
      </div>

      <div className="@container/main px-4 lg:px-6 mt-8 lg:mt-12">
        <DataTable
          clients={clients}
          onDeleteClient={handleDeleteClient}
          onEditClient={handleStartEdit}
          onAddClient={handleAddClient}
          onOpenDialog={() => setIsDialogOpen(true)}
          onShowSuccessAlert={handleShowSuccessAlert}
        />
      </div>

      {/* Modal de formulário - para criar e editar */}

      {/* Alert de sucesso */}
      <SuccessAlert
        open={successAlert.open}
        onOpenChange={(open) => setSuccessAlert((prev) => ({ ...prev, open }))}
        title={successAlert.title}
        message={successAlert.message}
      />
    </div>
  );
}
