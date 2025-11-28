import { EmpleadosActionDialog } from './empleados-action-dialog'
import { EmpleadosDeleteDialog } from './empleados-delete-dialog'
import { useEmpleados } from './empleados-provider'

export function EmpleadosDialogs() {
  const { open } = useEmpleados()

  return (
    <>
      <EmpleadosActionDialog key='Empleado-add' open={open === 'add'} />
      <EmpleadosActionDialog key='Empleado-edit' open={open === 'edit'} />
      <EmpleadosDeleteDialog />
    </>
  )
}


