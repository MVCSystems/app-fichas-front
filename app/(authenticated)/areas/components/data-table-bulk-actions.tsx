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
import type { Area } from '../data/schema'
import { useAreas } from './areas-provider'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { refetch } = useAreas()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('No hay selección')
      return
    }

    setIsDeleting(true)

    try {
      const idsToDelete = selectedRows.map((row) => (row.original as Area).id_area)
      
      // Eliminar todas las áreas seleccionadas (usar cookies)
      await Promise.all(
        idsToDelete.map((id) =>
          api.delete(`/areas/${id}/`, {
            withCredentials: true,
          })
        )
      )

      toast.success(`${idsToDelete.length} área(s) eliminada(s) correctamente`)

      // Refrescar los datos
      refetch?.()
      
      // Limpiar selección
      table.resetRowSelection()
    } catch (error) {
      console.error('Error al eliminar las áreas:', error)
      toast.error('Error al eliminar las áreas')
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='áreas'>
        <div className='flex items-center gap-2'>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setShowDeleteDialog(true)}
                disabled={selectedRows.length === 0}
                aria-label={`Eliminar ${selectedRows.length} áreas seleccionadas`}
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Eliminar ({selectedRows.length})
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Eliminar áreas seleccionadas
            </TooltipContent>
          </Tooltip>
        </div>
      </BulkActionsToolbar>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Esto eliminará permanentemente{' '}
              <span className='font-semibold'>{selectedRows.length}</span> área(s).
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
