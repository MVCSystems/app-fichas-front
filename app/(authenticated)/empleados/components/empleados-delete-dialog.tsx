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
import { useEmpleados } from './empleados-provider'
import { toast } from 'sonner'
import api from '@/lib/axios'

export function EmpleadosDeleteDialog() {
  const { open, setOpen, currentRow, refetch } = useEmpleados()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!currentRow) {
      toast.error('No hay empleado seleccionado')
      return
    }

    setIsDeleting(true)

    try {
      await api.delete(`/empleados/${currentRow.id_empleado}/`)

      toast.success('Empleado eliminado correctamente')

      if (refetch) {
        refetch()
      }
      setOpen(null)
    } catch (error) {
      console.error('Error al eliminar el empleado:', error)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any)?.response?.data?.message || 
                          (error as Error)?.message || 
                          'Error al eliminar el empleado'
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
            Esta acción no se puede deshacer. Esto eliminará permanentemente el empleado
            {currentRow && (
              <span className='font-medium'>
                {' '}&quot;{currentRow.nombre_completo}&quot;
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


