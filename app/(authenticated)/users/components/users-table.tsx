'use client'

import { useEffect, useState } from 'react'
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
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
import { type Empleado } from '../data/schema'
import { columns } from './users-columns'

type DataTableProps = {
  data: Empleado[]
  totalCount: number
  search: Record<string, unknown>
  navigate: NavigateFn
}

export function UsersTable({ data, totalCount, search, navigate }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [sorting, setSorting] = useState<SortingState>([])

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
      { columnId: 'cargo_display', searchKey: 'cargo', type: 'array' },
      { columnId: 'activo', searchKey: 'activo', type: 'array' },
      { columnId: 'tiene_acceso_sistema', searchKey: 'con_acceso', type: 'array' },
    ],
  })

  const table = useReactTable({
    data,
    columns,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
    },
    enableRowSelection: false,
    manualPagination: true,
    manualFiltering: false, // Filtrado local para el search
    onPaginationChange,
    onColumnFiltersChange,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  useEffect(() => {
    ensurePageInRange(table.getPageCount())
  }, [table, ensurePageInRange])

  return (
    <div className='space-y-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Buscar por nombre, DNI...'
        searchKey='nombre_completo'
        filters={[
          {
            columnId: 'cargo_display',
            title: 'Cargo',
            options: [
              { value: 'JEFE_AREA', label: 'Jefe de Area' },
              { value: 'SUBJEFE', label: 'Subjefe' },
              { value: 'SUPERVISOR', label: 'Supervisor' },
              { value: 'COORDINADOR', label: 'Coordinador' },
              { value: 'ANALISTA_SENIOR', label: 'Analista Senior' },
              { value: 'ANALISTA', label: 'Analista' },
              { value: 'ANALISTA_JUNIOR', label: 'Analista Junior' },
              { value: 'ASISTENTE', label: 'Asistente' },
              { value: 'AUXILIAR', label: 'Auxiliar' },
              { value: 'ESPECIALISTA', label: 'Especialista' },
              { value: 'TECNICO', label: 'Tecnico' },
              { value: 'OPERADOR', label: 'Operador' },
              { value: 'PRACTICANTE', label: 'Practicante' },
              { value: 'OTRO', label: 'Otro' },
            ],
          },
          {
            columnId: 'activo',
            title: 'Estado',
            options: [
              { value: 'true', label: 'Activo' },
              { value: 'false', label: 'Inactivo' },
            ],
          },
          {
            columnId: 'tiene_acceso_sistema',
            title: 'Acceso Sistema',
            options: [
              { value: 'true', label: 'Con acceso' },
              { value: 'false', label: 'Sin acceso' },
            ],
          },
        ]}
      />

      <div className='overflow-x-auto rounded-md border bg-background'>
        <Table className='min-w-[600px] w-full text-xs sm:text-sm md:text-base'>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan} className='whitespace-nowrap px-2 py-2 sm:px-4 sm:py-3'>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn('cursor-default')}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className='whitespace-nowrap px-2 py-2 sm:px-4 sm:py-3'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={table.getAllColumns().length} className='h-24 text-center'>
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} />
    </div>
  )
}
