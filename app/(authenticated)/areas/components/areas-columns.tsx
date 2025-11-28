import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/long-text'
import { niveles, statusTypes } from '../data/data'
import { type Area } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

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
        className='translate-y-[2px]'
      />
    ),
    meta: {
      className: cn('max-md:sticky start-0 z-10 rounded-tl-[inherit]'),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
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
    cell: ({ row }) => (
      <LongText className='max-w-24 ps-3'>{row.getValue('codigo') || '-'}</LongText>
    ),
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
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
      // Calcular indentación: (nivel - 1) * 20px
      const indentacion = (nivel - 1) * 20
      
      return (
        <div style={{ paddingLeft: `${indentacion}px` }} className='flex items-center'>
          {nivel > 1 && (
            <span className='mr-2 text-muted-foreground'>└─</span>
          )}
          <LongText className='max-w-48'>{nombre_area}</LongText>
        </div>
      )
    },
    meta: { className: 'w-48' },
  },
  {
    accessorKey: 'siglas',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Siglas' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('siglas') || '-'}</div>
    ),
  },
  {
    accessorKey: 'area_padre_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Área Padre' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('area_padre_nombre') || 'Área raíz'}</LongText>
    ),
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
        <div className='flex space-x-2'>
          <Badge variant='outline' className={cn('capitalize', badgeColor)}>
            Nivel {nivel}
          </Badge>
        </div>
      )
    },
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
      className: 'w-10 pe-0.5',
    },
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
]
