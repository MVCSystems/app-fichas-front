import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { type NavigateFn, useTableUrlState } from '@/hooks/use-table-url-state'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTablePagination } from '@/components/data-table/pagination'
import { DataTableToolbar } from '@/components/data-table/toolbar'
import { type Area } from '../data/schema'
import { DataTableBulkActions } from './data-table-bulk-actions'
import { areasColumns as columns } from './areas-columns'
import { AreasMobileCard } from './areas-mobile-card'

type DataTableProps = {
  data: Area[]
  totalCount: number
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function AreasTable({ data, totalCount, search, navigate }: DataTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

  // Synced with URL states
  const {
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search,
    navigate,
    pagination: { 
      pageKey: 'page',
      pageSizeKey: 'pageSize', 
      defaultPage: 1, 
      defaultPageSize: 10 
    },
    globalFilter: { enabled: false },
    columnFilters: [
      { columnId: 'codigo', searchKey: 'codigo', type: 'string' },
      { columnId: 'nombre_area', searchKey: 'nombre_area', type: 'string' },
      { columnId: 'nivel', searchKey: 'nivel', type: 'array' },
      { columnId: 'activo', searchKey: 'activo', type: 'array' },
    ],
  })

  // Resetear selección cuando cambia la página
  useEffect(() => {
    setRowSelection({})
  }, [pagination.pageIndex])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      pagination,
      rowSelection,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: true,
    manualPagination: true,
    manualFiltering: true,
    onPaginationChange,
    onColumnFiltersChange,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16',
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar áreas...'
        searchKey='nombre_area'
        filters={[
          {
            columnId: 'nivel',
            title: 'Nivel',
            options: [
              { label: 'Nivel 1', value: '1' },
              { label: 'Nivel 2', value: '2' },
              { label: 'Nivel 3', value: '3' },
              { label: 'Nivel 4', value: '4' },
            ],
          },
          {
            columnId: 'activo',
            title: 'Estado',
            options: [
              { label: 'Activo', value: 'true' },
              { label: 'Inactivo', value: 'false' },
            ],
          },
        ]}
      />
      
      {/* Vista Desktop - Tabla */}
      <div className='hidden md:block overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        header.column.columnDef.meta?.className,
                        header.column.columnDef.meta?.thClassName
                      )}
                    >
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
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
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
                  className='h-24 text-center'
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Vista Mobile - Cards */}
      <div className='md:hidden overflow-hidden rounded-md border'>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <AreasMobileCard
              key={row.id}
              area={row.original}
              isSelected={row.getIsSelected()}
              onSelectChange={(selected) => row.toggleSelected(selected)}
            />
          ))
        ) : (
          <div className='p-8 text-center text-muted-foreground'>
            No hay resultados.
          </div>
        )}
      </div>

      <DataTablePagination table={table} className='mt-auto' />
      <DataTableBulkActions table={table} />
    </div>
  )
}
