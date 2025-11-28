'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { type Area } from '../data/schema'
import { useAreas } from './areas-provider'
import { niveles, statusTypes } from '../data/data'

interface AreasMobileCardProps {
  area: Area
  isSelected: boolean
  onSelectChange: (selected: boolean) => void
}

export function AreasMobileCard({ area, isSelected, onSelectChange }: AreasMobileCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { setOpen, setCurrentRow } = useAreas()

  const nivelColor = niveles.get(area.nivel)
  const statusColor = statusTypes.get(area.activo)
  const indentacion = (area.nivel - 1) * 16

  // Formatear fechas de forma simple para evitar problemas de hidratación
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <div
      style={{ marginLeft: `${indentacion}px` }}
      className={cn(
        'border-b bg-background p-4 transition-colors',
        isSelected && 'bg-muted'
      )}
    >
      {/* Header - Siempre visible */}
      <div className='flex items-start gap-3'>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectChange}
          className='mt-1'
        />

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-2'>
            <div className='flex-1 min-w-0'>
              <div className='flex items-center gap-2 mb-1'>
                {area.nivel > 1 && (
                  <span className='text-muted-foreground text-sm'>└─</span>
                )}
                <h3 className='font-semibold text-sm truncate'>
                  {area.nombre_area}
                </h3>
              </div>
              
              <div className='flex items-center gap-2 flex-wrap'>
                {area.codigo && (
                  <span className='text-xs text-muted-foreground font-mono'>
                    {area.codigo}
                  </span>
                )}
                {area.siglas && (
                  <Badge variant='outline' className='text-xs'>
                    {area.siglas}
                  </Badge>
                )}
              </div>
            </div>

            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0'
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronDown className='h-4 w-4' />
                ) : (
                  <ChevronRight className='h-4 w-4' />
                )}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                    <MoreVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => {
                      setCurrentRow(area)
                      setOpen('edit')
                    }}
                  >
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className='text-destructive'
                    onClick={() => {
                      setCurrentRow(area)
                      setOpen('delete')
                    }}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido expandible */}
      {isExpanded && (
        <div className='mt-3 ml-8 space-y-2 text-sm'>
          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Nivel:</span>
            <Badge variant='outline' className={cn('capitalize', nivelColor)}>
              Nivel {area.nivel}
            </Badge>
          </div>

          {area.area_padre_nombre && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Área Padre:</span>
              <span className='text-xs font-medium truncate max-w-[60%] text-right'>
                {area.area_padre_nombre}
              </span>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <span className='text-muted-foreground'>Estado:</span>
            <Badge variant='outline' className={cn('capitalize', statusColor)}>
              {area.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>

          {area.created_at && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Creado:</span>
              <span className='text-xs'>
                {formatDate(area.created_at)}
              </span>
            </div>
          )}

          {area.updated_at && (
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Actualizado:</span>
              <span className='text-xs'>
                {formatDate(area.updated_at)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
