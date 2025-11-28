import { AreasActionDialog } from './areas-action-dialog'
import { AreasDeleteDialog } from './areas-delete-dialog'
import { useAreas } from './areas-provider'

export function AreasDialogs() {
  const { open } = useAreas()

  return (
    <>
      <AreasActionDialog key='area-add' open={open === 'add'} />
      <AreasActionDialog key='area-edit' open={open === 'edit'} />
      <AreasDeleteDialog />
    </>
  )
}
