'use client'

import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table/bulk-actions'
import { toast } from 'sonner'
import api from '@/lib/axios'
import type { Empleado } from '../data/schema'
import { useEmpleados } from './empleados-provider'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { refetch } = useEmpleados()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('No hay filas seleccionadas')
      return
    }

    setIsDeleting(true)

    try {
      const idsToDelete = selectedRows.map((row) => (row.original as Empleado).id_empleado)

      await Promise.all(
        idsToDelete.map((id) => api.delete(`/empleados/${id}/`))
      )

      toast.success(`${idsToDelete.length} empleado(s) eliminado(s) correctamente`)

      if (refetch) refetch()
      table.resetRowSelection()
    } catch (error) {
      console.error('Error al eliminar los empleados:', error)
      toast.error('Error al eliminar los empleados')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='Ã¡reas'>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDeleteDialog(true)}
                disabled={selectedRows.length === 0}
              >
                <Trash2 className='mr-2 size-4' />
                Eliminar ({selectedRows.length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Eliminar Ã¡reas seleccionadas
            </TooltipContent>
          </Tooltip>
        </div>
      </BulkActionsToolbar>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Â¿EstÃ¡s seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acciÃ³n no se puede deshacer. Esto eliminarÃ¡ permanentemente{' '}
              <span className='font-semibold'>{selectedRows.length}</span> Ã¡rea(s).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isDeleting}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}


