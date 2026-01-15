import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/long-text'
import { niveles, statusTypes } from '../data/data'
import { type Area } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'
import { CornerDownRightIcon } from 'lucide-react'

export const areasColumns: ColumnDef<Area>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-0.5'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit] w-8 min-w-[2rem] max-w-[2.5rem] text-center p-0'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='size-4 m-auto'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'codigo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => {
      const codigo: string | undefined = row.getValue('codigo')
      if (!codigo) return <span className='block text-xs font-mono text-muted-foreground text-center'>-</span>
      return (
        <div
          className='font-mono text-xs flex items-center justify-center'
          style={{ minWidth: 60, maxWidth: 90, whiteSpace: 'pre' }}
          title={codigo}
        >
          {codigo}
        </div>
      )
    },
    meta: {
      className: cn(
        'w-28 min-w-[4rem] max-w-[7rem] drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'nombre_area',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nombre' />
    ),
    cell: ({ row }) => {
      const { nivel, nombre_area } = row.original
      const indentacion = (nivel - 1) * 16

      return (
        <div
          style={{ paddingLeft: `${(nivel - 1) * 18}px` }}
          className='flex items-center whitespace-pre-line break-words text-base font-medium leading-snug relative'
        >
          {nivel > 1 && (
            <span style={{ marginRight: 6, color: '#b0b0b0', fontSize: 18, lineHeight: 1, display: 'inline-block', verticalAlign: 'middle' }}>
              {'└─'}
            </span>
          )}
          <span>{nombre_area}</span>
        </div>
      )
    },
    meta: { className: 'min-w-[12rem] max-w-[32rem] px-2', style: { width: 'auto' } },
  },
  {
    accessorKey: 'siglas',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Siglas' />
    ),
    cell: ({ row }) => (
      <div className='min-w-[2.5rem] max-w-[4rem] ps-2 text-nowrap text-xs text-center'>{row.getValue('siglas') || '-'}</div>
    ),
    meta: { className: 'w-16 min-w-[2.5rem] max-w-[4rem] text-xs text-center' },
  },
  {
    accessorKey: 'area_padre_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Área Padre' />
    ),
    cell: ({ row }) => (
      <span className='block whitespace-pre-line break-words text-xs leading-snug' style={{wordBreak:'break-word', maxWidth:'100%'}}>{row.getValue('area_padre_nombre') || 'Área raíz'}</span>
    ),
    meta: { className: 'min-w-[10rem] max-w-[20rem] text-xs leading-snug' },
  },
  {
    accessorKey: 'nivel',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Nivel' />
    ),
    cell: ({ row }) => {
      const { nivel } = row.original
      const badgeColor = niveles.get(nivel)
      return (
        <Badge variant='outline' className={cn('capitalize', badgeColor, 'w-full text-center')}
          style={{ minWidth: 60, maxWidth: 80, fontSize: 13, padding: '2px 8px' }}>
          Nivel {nivel}
        </Badge>
      )
    },
    meta: { className: 'w-24 min-w-[3.5rem] max-w-[5.5rem] text-center' },
    filterFn: (row, id, value) => {
      const nivelValue = row.getValue(id) as number
      return value.includes(nivelValue.toString())
    },
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { activo } = row.original
      const badgeColor = statusTypes.get(activo)
      return (
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            {activo ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const activoValue = row.getValue(id) as boolean
      return value.includes(activoValue.toString())
    },
  },
  {
    id: 'actions',
    meta: {
      className: 'w-6 min-w-[1.5rem] max-w-[2rem] text-center p-0',
    },
    cell: ({ row }) => (
      <div className='flex items-center justify-center p-0 m-0'>
        <DataTableRowActions row={row} />
      </div>
    ),
  },
]
