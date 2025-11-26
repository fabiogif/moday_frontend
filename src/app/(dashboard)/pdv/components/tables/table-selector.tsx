"use client"

import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Utensils, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { TableStatusIndicator } from "./table-status-indicator"

type Table = {
  uuid?: string
  identify?: string
  name: string
  [key: string]: any
}

interface TableSelectorProps {
  tables: Table[]
  selectedTable: string | null
  onTableSelect: (tableKey: string | null) => void
  tablesWithOpenOrders: Set<string>
  editingOrder?: { table?: Table } | null
  currentOrder?: { table?: Table } | null
  className?: string
  disabled?: boolean
  showOccupiedWarning?: boolean
}

export function TableSelector({
  tables,
  selectedTable,
  onTableSelect,
  tablesWithOpenOrders,
  editingOrder,
  currentOrder,
  className,
  disabled = false,
  showOccupiedWarning = true,
}: TableSelectorProps) {
  const sortedTables = useMemo(() => {
    const occupied: Table[] = []
    const empty: Table[] = []

    tables.forEach((table) => {
      const key = table.uuid || table.identify || table.name
      if (tablesWithOpenOrders.has(key)) {
        occupied.push(table)
      } else {
        empty.push(table)
      }
    })

    return [...occupied, ...empty]
  }, [tables, tablesWithOpenOrders])

  const isTableOccupiedByOther = useMemo(() => {
    if (!selectedTable || !tablesWithOpenOrders.has(selectedTable)) {
      return false
    }

    const selectedTableObj = tables.find(
      (t) => (t.uuid || t.identify || t.name) === selectedTable
    )

    if (!selectedTableObj) return false

    // Verificar se está editando o pedido desta mesa
    if (editingOrder) {
      const editingTableKey =
        editingOrder.table?.uuid ||
        editingOrder.table?.identify ||
        editingOrder.table?.name

      if (editingTableKey === selectedTable) {
        return false // Não é ocupada por outro pedido, é o pedido sendo editado
      }
    }

    if (currentOrder) {
      const currentTableKey =
        currentOrder.table?.uuid ||
        currentOrder.table?.identify ||
        currentOrder.table?.name

      if (currentTableKey === selectedTable) {
        return false // Não é ocupada por outro pedido, é o pedido atual
      }
    }

    return true
  }, [selectedTable, tablesWithOpenOrders, editingOrder, currentOrder, tables])

  const selectedTableData = useMemo(() => {
    if (!selectedTable) return null
    return tables.find(
      (t) => (t.uuid || t.identify || t.name) === selectedTable
    )
  }, [selectedTable, tables])

  const orderCount = useMemo(() => {
    if (!selectedTable) return 0
    // TODO: Contar pedidos da mesa selecionada
    return tablesWithOpenOrders.has(selectedTable) ? 1 : 0
  }, [selectedTable, tablesWithOpenOrders])

  const handleTableChange = (value: string) => {
    const table = tables.find(
      (t) => (t.uuid || t.identify || t.name) === value
    )
    if (!table) return

    const key = table.uuid || table.identify || table.name
    const hasOpenOrders = tablesWithOpenOrders.has(key)

    // Verificar se está ocupada por outro pedido
    const isOccupiedByOther =
      hasOpenOrders &&
      (!editingOrder ||
        (editingOrder.table?.uuid !== key &&
          editingOrder.table?.identify !== key &&
          editingOrder.table?.name !== key))

    if (isOccupiedByOther) {
      // Não permitir seleção se estiver ocupada por outro pedido
      return
    }

    onTableSelect(key)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-2">
        <p className="text-xs font-medium">Mesa</p>
        <Select
          value={selectedTable || ""}
          onValueChange={handleTableChange}
          disabled={disabled}
        >
          <SelectTrigger className="h-10 w-full text-sm">
            <SelectValue placeholder="Selecione uma mesa..." />
          </SelectTrigger>
          <SelectContent>
            {sortedTables.map((table) => {
              const key = table.uuid || table.identify || table.name
              const hasOpenOrders = tablesWithOpenOrders.has(key)
              const isOccupiedByOther =
                hasOpenOrders &&
                (!editingOrder ||
                  (editingOrder.table?.uuid !== key &&
                    editingOrder.table?.identify !== key &&
                    editingOrder.table?.name !== key))

              return (
                <SelectItem
                  key={key}
                  value={key}
                  disabled={isOccupiedByOther && !editingOrder}
                  className={cn(
                    isOccupiedByOther && "text-red-600 dark:text-red-400"
                  )}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      <Utensils className="h-4 w-4" />
                      <span>{table.name}</span>
                    </div>
                    <TableStatusIndicator
                      isOccupied={hasOpenOrders}
                      orderCount={hasOpenOrders ? 1 : 0}
                      size="sm"
                    />
                    {isOccupiedByOther && (
                      <Badge variant="destructive" className="text-xs ml-auto">
                        Ocupada
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Aviso se mesa está ocupada por outro pedido */}
      {showOccupiedWarning && selectedTable && isTableOccupiedByOther && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-2.5 dark:border-red-800 dark:bg-red-950/30">
          <div className="flex items-start gap-2">
            <div className="rounded-full bg-red-100 p-1.5 dark:bg-red-900/50">
              <X className="h-4 w-4 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                Mesa Ocupada
              </p>
              <p className="mt-0.5 text-[10px] text-red-700 dark:text-red-300">
                Esta mesa possui pedidos em aberto. Finalize os pedidos existentes
                antes de criar novos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status da mesa selecionada */}
      {selectedTableData && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Status da mesa:</span>
          <TableStatusIndicator
            isOccupied={selectedTable ? tablesWithOpenOrders.has(selectedTable) : false}
            orderCount={orderCount}
            size="sm"
          />
        </div>
      )}
    </div>
  )
}

