'use client'

import { type ColumnDef } from '@tanstack/react-table'
import { type Empleado } from '../data/schema'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTableColumnHeader } from '@/components/data-table/column-header'
import { cn } from '@/lib/utils'

export const columns: ColumnDef<Empleado>[] = [
  {
    accessorKey: 'nombre_completo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Empleado' />
    ),
    cell: ({ row }) => {
      const empleado = row.original;
      const initials = empleado.nombre_completo
        ? empleado.nombre_completo.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
        : '';
      return (
        <div className='flex items-center gap-3'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback className='text-sm bg-primary/10 text-primary font-semibold'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='space-y-1'>
            <div className='font-medium text-base'>{empleado.nombre_completo}</div>
            <div className='flex items-center gap-2 text-xs text-muted-foreground'>
              <span className='font-mono'>DNI: {empleado.dni}</span>
              {empleado.usuario && (
                <>
                  <span>•</span>
                  <span className='font-mono'>@{empleado.usuario.username}</span>
                </>
              )}
            </div>
          </div>
        </div>
      );
    },
    meta: {
      className: cn('min-w-64'),
    },
    enableSorting: true,
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
    accessorKey: 'cargo_display',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Cargo' />
    ),
    cell: ({ row }) => (
      <div className='flex flex-col gap-1'>
        <span className='font-medium text-sm'>
          {row.getValue('cargo_display')}
        </span>
        {row.original.area?.nombre_area && (
          <span className='text-xs text-muted-foreground'>
            {row.original.area.nombre_area}
          </span>
        )}
      </div>
    ),
    meta: {
      className: cn('min-w-40'),
    },
  },
  {
    accessorKey: 'correo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Contacto' />
    ),
    cell: ({ row }) => {
      const correo = row.getValue('correo') as string
      const celular = row.original.celular
      
      return (
        <div className='space-y-1'>
          <div className='text-sm'>{correo}</div>
          {celular && (
            <div className='text-xs text-muted-foreground font-mono'>{celular}</div>
          )}
        </div>
      )
    },
    meta: {
      className: cn('min-w-48'),
    },
  },
  {
    accessorKey: 'tiene_acceso_sistema',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Acceso Sistema' />
    ),
    cell: ({ row }) => {
      const tieneAcceso = row.getValue('tiene_acceso_sistema') as boolean
      const usuario = row.original.usuario

      if (!tieneAcceso || !usuario) {
        return (
          <div className='flex flex-col gap-1'>
            <Badge variant='secondary' className='font-normal w-fit'>
              Sin acceso
            </Badge>
          </div>
        )
      }

      return (
        <div className='space-y-1.5'>
          <div className='flex items-center gap-2'>
            <Badge className='font-normal bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20'>
              ✓ Activo
            </Badge>
            {!usuario.is_active && (
              <Badge variant='destructive' className='font-normal'>
                Bloqueado
              </Badge>
            )}
          </div>
          {usuario.grupos.length > 0 && (
            <div className='flex flex-wrap gap-1'>
              {usuario.grupos.map((grupo) => (
                <Badge
                  key={grupo}
                  variant='outline'
                  className='text-xs font-normal'
                >
                  {grupo}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )
    },
    meta: {
      className: cn('min-w-40'),
    },
  },
  {
    accessorKey: 'activo',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Estado' />
    ),
    cell: ({ row }) => {
      const activo = row.getValue('activo') as boolean
      return (
        <Badge
          variant={activo ? 'default' : 'destructive'}
          className={cn(
            'font-normal',
            activo && 'bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20'
          )}
        >
          {activo ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    },
  },
]
