import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { LongText } from '@/components/long-text'
import { type Empleado } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const empleadosColumns: ColumnDef<Empleado>[] = [
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
    accessorKey: 'nombre_completo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Empleado' />
    ),
    cell: ({ row }) => {
      const { nombre_completo } = row.original
      const initials = nombre_completo
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
      
      return (
        <div className='flex items-center gap-2 ps-3'>
          <Avatar className='h-8 w-8'>
            <AvatarFallback className='bg-primary/10 text-primary text-xs'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <LongText className='max-w-48 font-medium'>{nombre_completo}</LongText>
        </div>
      )
    },
    meta: {
      className: cn(
        'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
        'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
      ),
    },
    enableHiding: false,
  },
  {
    accessorKey: 'codigo_empleado',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Código' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap font-mono text-sm'>
        {row.getValue('codigo_empleado')}
      </div>
    ),
  },
  {
    accessorKey: 'dni',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='DNI' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap font-mono'>{row.getValue('dni')}</div>
    ),
  },
  {
    accessorKey: 'cargo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cargo' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-36'>{row.getValue('cargo') || '-'}</LongText>
    ),
    filterFn: (row, id, value) => {
      const cargoValue = (row.getValue(id) as string)?.toLowerCase() || ''
      return value.some((v: string) => cargoValue.includes(v.toLowerCase()))
    },
  },
  {
    accessorKey: 'area_nombre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Área' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>{row.getValue('area_nombre') || 'Sin área'}</LongText>
    ),
  },
  {
    accessorKey: 'correo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Correo' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 text-muted-foreground'>{row.getValue('correo') || '-'}</LongText>
    ),
  },
  {
    accessorKey: 'celular',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Celular' />
    ),
    cell: ({ row }) => (
      <div className='w-fit ps-2 text-nowrap'>{row.getValue('celular') || '-'}</div>
    ),
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const { activo } = row.original
      return (
        <div className='flex space-x-2'>
          <Badge 
            variant='outline' 
            className={cn(
              'capitalize',
              activo 
                ? 'border-green-600/20 bg-green-50 text-green-700 dark:border-green-400/30 dark:bg-green-950 dark:text-green-400'
                : 'border-red-600/20 bg-red-50 text-red-700 dark:border-red-400/30 dark:bg-red-950 dark:text-red-400'
            )}
          >
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


