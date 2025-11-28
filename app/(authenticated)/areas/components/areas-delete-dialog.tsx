'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAreas } from './areas-provider'
import { toast } from 'sonner'
import api from '@/lib/axios'

export function AreasDeleteDialog() {
  const { open, setOpen, currentRow, refetch } = useAreas()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!currentRow) {
      toast.error('No hay selección')
      return
    }

    setIsDeleting(true)

    try {
      await api.delete(`/areas/${currentRow.id_area}/`, {
        withCredentials: true,
      })
      
      toast.success('Área eliminada correctamente')
      
      // Refrescar los datos
      if (refetch) {
        refetch()
      }
      setOpen(null)
    } catch (error) {
      console.error('Error al eliminar el área:', error)
      const errorMessage = (error as any)?.response?.data?.message || 
                          (error as Error)?.message || 
                          'Error al eliminar el área'
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog
      open={open === 'delete'}
      onOpenChange={(state) => !state && setOpen(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. Esto eliminará permanentemente el área
            {currentRow && (
              <span className='font-medium'>
                {' '}&quot;{currentRow.nombre_area}&quot;
              </span>
            )}
            .
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant='outline' disabled={isDeleting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button 
            variant='destructive' 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
