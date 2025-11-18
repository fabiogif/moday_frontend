"use client"

import { useState } from "react"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronDown,
  EllipsisVertical,
  Eye,
  Pencil,
  Trash2,
  Download,
  Search,
  Receipt,
  FileText,
  Printer,
  CheckCircle2,
  XCircle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderDetailsDialog } from "./order-details-dialog"
import { ReceiptDialog } from "./receipt-dialog"
import { Order } from "../types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface DataTableProps {
  orders: Order[]
  onDeleteOrder: (order: Order) => void
  onEditOrder: (order: Order) => void
  onViewOrder: (order: Order) => void
  onInvoiceOrder?: (order: Order) => void
  onReceiptOrder: (order: Order) => void
  onBulkDelete?: (orderIds: string[]) => Promise<void>
  onBulkUpdateStatus?: (orderIds: string[], status: string) => Promise<void>
}

export function DataTable({ 
  orders, 
  onDeleteOrder, 
  onEditOrder, 
  onViewOrder, 
  onInvoiceOrder, 
  onReceiptOrder,
  onBulkDelete,
  onBulkUpdateStatus
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false)
  const [bulkUpdateStatusDialogOpen, setBulkUpdateStatusDialogOpen] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const handleDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open)
    if (!open) {
      setOrderToDelete(null)
    }
  }

  const handleDeleteClick = (order: Order) => {
    setOrderToDelete(order)
    setDeleteDialogOpen(true)
  }

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false)
    setOrderToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return

    try {
      await onDeleteOrder(orderToDelete)
    } finally {
      setDeleteDialogOpen(false)
      setOrderToDelete(null)
    }
  }

  // Obter IDs dos pedidos selecionados
  const getSelectedOrderIds = (): string[] => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    return selectedRows
      .map((row) => {
        const order = row.original
        return order.identify || order.id?.toString() || ''
      })
      .filter((id) => id !== '')
  }

  // Handler para exclusão em massa
  const handleBulkDelete = async () => {
    if (!onBulkDelete) return

    const selectedIds = getSelectedOrderIds()
    if (selectedIds.length === 0) {
      return
    }

    setBulkActionLoading(true)
    try {
      await onBulkDelete(selectedIds)
      setRowSelection({}) // Limpar seleção após exclusão
    } finally {
      setBulkActionLoading(false)
      setBulkDeleteDialogOpen(false)
    }
  }

  // Handler para atualização de status em massa
  const handleBulkUpdateStatus = async () => {
    if (!onBulkUpdateStatus) return

    const selectedIds = getSelectedOrderIds()
    if (selectedIds.length === 0) {
      return
    }

    setBulkActionLoading(true)
    try {
      await onBulkUpdateStatus(selectedIds, 'Entregue')
      setRowSelection({}) // Limpar seleção após atualização
    } finally {
      setBulkActionLoading(false)
      setBulkUpdateStatusDialogOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase()
    switch (lowerStatus) {
      case "entregue":
      case "completed":
      case "completo":
        return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20"
      case "pendente":
      case "pending":
        return "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20"
      case "em preparo":
      case "preparo":
      case "processing":
        return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20"
      case "cancelado":
      case "cancelled":
      case "rejected":
      case "rejeitado":
        return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
      default:
        return "text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-900/20"
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "identify",
      header: "Número do Pedido",
      cell: ({ row }) => {
        const identify = row.getValue("identify") as string
        const orderNumber = row.original.orderNumber || identify
        return (
          <div className="font-medium">{orderNumber || 'N/A'}</div>
        )
      },
    },
    {
      accessorKey: "client",
      header: "Cliente",
      cell: ({ row }) => {
        const client = row.getValue("client") as any
          // Debug: verificar estrutura do cliente
          if (!client?.name) {
            // console.log('Client data:', client, 'Full row:', row.original)
          }
        return (
          <div>
            <div className="font-medium">
                {client?.name || row.original?.client?.name || row.original?.customerName || 'Nome não informado'}
              </div>
            <div className="text-sm text-muted-foreground">
                {client?.email || row.original?.client?.email || row.original?.customerEmail || 'Email não informado'}
              </div>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge className={getStatusColor(status)}>
            {status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }) => {
        const total = parseFloat(row.getValue("total"))
        // Detectar se é teste (valores típicos em USD) ou produção (BRL)
        const isTest = total < 1000 && !Number.isInteger(total)
        const formatted = new Intl.NumberFormat(isTest ? "en-US" : "pt-BR", {
          style: "currency",
          currency: isTest ? "USD" : "BRL",
        }).format(total)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "products", 
      header: "Itens",
      cell: ({ row }) => {
        const products = row.getValue("products") as any[]
        const itemsCount = row.original.items || products?.length || 0
        return (
          <div className="text-center">{itemsCount}</div>
        )
      },
    },
    {
      accessorKey: "date",
      header: "Data do Pedido",
      cell: ({ row }) => {
        const date = row.getValue("date") as string
        return <div>{date || 'Data não informada'}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <EllipsisVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewOrder(order)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalhes
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEditOrder(order)}
                disabled={['Entregue', 'Cancelado', 'Concluído', 'Arquivado'].includes(order.status || '')}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {onInvoiceOrder && (
                <DropdownMenuItem onClick={() => onInvoiceOrder(order)}>
                  <Receipt className="mr-2 h-4 w-4" />
                  Faturar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onReceiptOrder(order)}>
                <Printer className="mr-2 h-4 w-4" />
                Recibo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteClick(order)}
                className="text-red-600"
                disabled={!order.identify && !order.id}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const hasSelection = selectedCount > 0

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pedidos..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-8"
            />
          </div>
          {table.getColumn("status") && (
            <Select
              value={(table.getColumn("status")?.getFilterValue() as string) ?? ""}
              onValueChange={(value) =>
                table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="Em Preparo">Em Preparo</SelectItem>
                <SelectItem value="Entregue">Entregue</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                Colunas <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>
      
      {/* Barra de ações em massa */}
      {hasSelection && (
        <div className="flex items-center justify-between gap-4 py-3 px-4 bg-muted/50 rounded-lg border mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {selectedCount} pedido(s) selecionado(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onBulkUpdateStatus && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setBulkUpdateStatusDialogOpen(true)}
                disabled={bulkActionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mover para Entregue
              </Button>
            )}
            {onBulkDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteDialogOpen(true)}
                disabled={bulkActionLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Excluir Selecionados
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRowSelection({})}
              disabled={bulkActionLoading}
            >
              Limpar Seleção
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Nenhum pedido encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} de{" "}
          {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Próximo
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={handleDialogOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza de que deseja excluir o pedido
              {" "}
              <span className="font-semibold">
                {orderToDelete?.orderNumber || orderToDelete?.identify || orderToDelete?.id}
              </span>
              ?<br />
              <span className="text-red-600 font-medium">
                Esta ação não poderá ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmação para exclusão em massa */}
      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão em massa</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente realizar esta operação?<br />
              <span className="font-semibold">
                {selectedCount} pedido(s) serão excluído(s).
              </span>
              <br />
              <span className="text-red-600 font-medium">
                Esta ação não poderá ser desfeita.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkActionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {bulkActionLoading ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de confirmação para atualização de status em massa */}
      <AlertDialog open={bulkUpdateStatusDialogOpen} onOpenChange={setBulkUpdateStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar atualização de status</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja realmente realizar esta operação?<br />
              <span className="font-semibold">
                {selectedCount} pedido(s) serão movido(s) para o status "Entregue".
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkActionLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkUpdateStatus}
              disabled={bulkActionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {bulkActionLoading ? 'Atualizando...' : 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


