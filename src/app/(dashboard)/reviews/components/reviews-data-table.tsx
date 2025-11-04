'use client'

import { useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ChevronDown,
  Check,
  X,
  Trash2,
  Award,
  Search,
  Star,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Review } from '../page'

interface ReviewsDataTableProps {
  reviews: Review[]
  onApprove: (uuid: string) => void
  onReject: (uuid: string, reason: string) => void
  onToggleFeatured: (uuid: string) => void
  onDelete: (uuid: string) => void
  statusFilter: string
  onStatusFilterChange: (status: string) => void
}

export function ReviewsDataTable({
  reviews,
  onApprove,
  onReject,
  onToggleFeatured,
  onDelete,
  statusFilter,
  onStatusFilterChange,
}: ReviewsDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [globalFilter, setGlobalFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  
  // Modal de aprovação
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [reviewToApprove, setReviewToApprove] = useState<Review | null>(null)
  
  // Modal de rejeição
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [reviewToReject, setReviewToReject] = useState<Review | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const handleApproveClick = (review: Review) => {
    setReviewToApprove(review)
    setApproveModalOpen(true)
  }

  const handleApproveConfirm = () => {
    if (!reviewToApprove) return
    onApprove(reviewToApprove.uuid)
    setApproveModalOpen(false)
    setReviewToApprove(null)
  }

  const handleRejectClick = (review: Review) => {
    setReviewToReject(review)
    setRejectReason('')
    setRejectModalOpen(true)
  }

  const handleRejectConfirm = () => {
    if (!reviewToReject) return
    onReject(reviewToReject.uuid, rejectReason)
    setRejectModalOpen(false)
    setReviewToReject(null)
    setRejectReason('')
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: { variant: 'default' as const, text: 'Aprovada' },
      pending: { variant: 'secondary' as const, text: 'Pendente' },
      rejected: { variant: 'destructive' as const, text: 'Rejeitada' }
    }

    const config = variants[status as keyof typeof variants]
    return <Badge variant={config.variant}>{config.text}</Badge>
  }

  const columns: ColumnDef<Review>[] = [
    {
      accessorKey: 'customer_name',
      header: 'Cliente',
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {row.original.customer_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{row.original.customer_name}</p>
              {row.original.order && (
                <p className="text-xs text-muted-foreground">
                  Pedido #{row.original.order.identify}
                </p>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'rating',
      header: 'Avaliação',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {renderStars(row.original.rating)}
          {row.original.is_featured && (
            <Award className="h-4 w-4 text-amber-500" />
          )}
        </div>
      ),
    },
    {
      accessorKey: 'comment',
      header: 'Comentário',
      cell: ({ row }) => (
        <div className="max-w-xs">
          {row.original.comment ? (
            <p className="text-sm truncate">{row.original.comment}</p>
          ) : (
            <span className="text-muted-foreground text-sm">Sem comentário</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: 'created_at_human',
      header: 'Data',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.created_at_human}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => {
        const review = row.original

        return (
          <div className="flex items-center justify-end gap-2">
            {review.status === 'pending' && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleApproveClick(review)}
                  title="Aprovar"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectClick(review)}
                  title="Rejeitar"
                >
                  <X className="h-4 w-4 text-red-600" />
                </Button>
              </>
            )}
            
            {review.status === 'approved' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onToggleFeatured(review.uuid)}
                title={review.is_featured ? 'Remover destaque' : 'Destacar'}
              >
                <Award className={`h-4 w-4 ${review.is_featured ? 'text-amber-500 fill-amber-500' : ''}`} />
              </Button>
            )}

            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm('Tem certeza que deseja deletar esta avaliação?')) {
                  onDelete(review.uuid)
                }
              }}
              title="Deletar"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )
      },
    },
  ]

  // Filtro customizado para rating
  const filteredReviews = reviews.filter((review) => {
    if (ratingFilter !== 'all') {
      return review.rating === parseInt(ratingFilter)
    }
    return true
  })

  const table = useReactTable({
    data: filteredReviews,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <>
      <div className="space-y-4">
        {/* Filtros */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center space-x-2">
            {/* Busca */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por cliente, comentário..."
                value={globalFilter ?? ''}
                onChange={(event) => setGlobalFilter(String(event.target.value))}
                className="pl-8"
              />
            </div>

            {/* Filtro de Status */}
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="approved">Aprovadas</SelectItem>
                <SelectItem value="rejected">Rejeitadas</SelectItem>
              </SelectContent>
            </Select>

            {/* Filtro de Rating */}
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Avaliação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as estrelas</SelectItem>
                <SelectItem value="5">5 estrelas</SelectItem>
                <SelectItem value="4">4 estrelas</SelectItem>
                <SelectItem value="3">3 estrelas</SelectItem>
                <SelectItem value="2">2 estrelas</SelectItem>
                <SelectItem value="1">1 estrela</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botões de controle */}
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
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
          </div>
        </div>

        {/* Tabela */}
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
                    data-state={row.getIsSelected() && 'selected'}
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
                    Nenhuma avaliação encontrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} de{' '}
            {table.getFilteredRowModel().rows.length} linha(s) selecionada(s).
          </div>
          <div className="flex items-center space-x-2">
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
              Próxima
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Aprovação */}
      <Dialog open={approveModalOpen} onOpenChange={setApproveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprovar Avaliação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja aprovar esta avaliação?
            </DialogDescription>
          </DialogHeader>
          
          {reviewToApprove && (
            <div className="space-y-4 py-4">
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                    {reviewToApprove.customer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{reviewToApprove.customer_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(reviewToApprove.rating)}
                    </div>
                  </div>
                </div>
                
                {reviewToApprove.comment && (
                  <p className="text-sm text-muted-foreground">
                    "{reviewToApprove.comment}"
                  </p>
                )}
                
                {reviewToApprove.order && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Pedido #{reviewToApprove.order.identify}
                  </p>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Ao aprovar, esta avaliação será publicada e ficará visível para todos os clientes na página pública.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="default"
              onClick={handleApproveConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Aprovar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Rejeição */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Avaliação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição (será visível para o administrador)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Rejeição</Label>
              <Textarea
                id="reason"
                placeholder="Ex: Conteúdo inadequado, linguagem ofensiva, spam..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
            >
              Rejeitar Avaliação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

