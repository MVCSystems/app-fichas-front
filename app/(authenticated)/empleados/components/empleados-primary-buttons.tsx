import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEmpleados } from './empleados-provider'

export function EmpleadosPrimaryButtons() {
  const { setOpen } = useEmpleados()

  return (
    <div className='flex gap-2'>
      <Button onClick={() => setOpen('add')} size='sm' className='h-8 gap-1'>
        <Plus className='size-3.5' />
        <span className='sr-only sm:not-sr-only sm:whitespace-nowrap'>
          Agregar Empleado
        </span>
      </Button>
    </div>
  )
}


