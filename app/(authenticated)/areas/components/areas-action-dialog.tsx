'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useAreas } from './areas-provider'
import { toast } from 'sonner'
import { api } from '@/lib/axios'

interface AreasActionDialogProps {
  open: boolean
}

const areaFormSchema = z.object({
  codigo: z.string().min(1, 'El código es obligatorio'),
  nombre_area: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  siglas: z.string().optional(),
  area_padre: z.number().nullable().optional(),
  nivel: z.number().int().min(1).max(4),
  activo: z.boolean(),
})

type AreaFormValues = z.infer<typeof areaFormSchema>

export function AreasActionDialog({ open }: AreasActionDialogProps) {
  const { setOpen, currentRow, refetch } = useAreas()
  const isEditing = open && currentRow
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<AreaFormValues>({
    resolver: zodResolver(areaFormSchema),
    defaultValues: {
      codigo: '',
      nombre_area: '',
      siglas: '',
      area_padre: null,
      nivel: 1,
      activo: true,
    },
  })

  useEffect(() => {
    if (isEditing) {
      form.reset({
        codigo: currentRow.codigo || '',
        nombre_area: currentRow.nombre_area,
        siglas: currentRow.siglas || '',
        area_padre: currentRow.area_padre,
        nivel: currentRow.nivel,
        activo: currentRow.activo,
      })
    } else {
      form.reset({
        codigo: '',
        nombre_area: '',
        siglas: '',
        area_padre: null,
        nivel: 1,
        activo: true,
      })
    }
  }, [isEditing, currentRow, form])

  // control whether nivel select is editable
  const [nivelEditable, setNivelEditable] = useState(true)

  async function onSubmit(data: AreaFormValues) {
    setIsSubmitting(true)
    
    try {
      // Build payload, but if creating a new area under a parent and the user
      // provided the parent's code (or left codigo empty), auto-generate the
      // next child código (e.g. parent "06.2.5" -> child "06.2.5.1").
      let codigoToSend = data.codigo

      // helper: pad codigo segments to two digits
      const padCodigoForSend = (raw: string | undefined | null) => {
        if (!raw) return ''
        return raw
          .split('.')
          .map((seg) => seg.trim())
          .filter(Boolean)
          .map((seg) => {
            const n = parseInt(seg, 10)
            return isNaN(n) ? seg.padStart(2, '0') : String(n).padStart(2, '0')
          })
          .join('.')
      }

      // If creating a new area, and nivel > 1, we'll derive area_padre from the codigo later.
      // If the user left codigo empty for nivel > 1 we cannot auto-compute parent without a selector,
      // so we keep codigoToSend as-is and validation will run before sending.
      // Always pad the codigo before sending
      codigoToSend = padCodigoForSend(codigoToSend)

      // derive area_padre from codigo when nivel > 1
      let areaPadreId: number | null = null
      if (data.nivel && data.nivel > 1) {
        const segments = codigoToSend.split('.').filter(Boolean)
        if (segments.length < 2) {
          form.setError('codigo' as any, { type: 'manual', message: 'Para crear un nivel > 1 debes indicar el código completo incluyendo el padre (ej: 06.02.05.01)' })
          setIsSubmitting(false)
          return
        }
        const parentCodigo = segments.slice(0, -1).join('.')
        try {
          const resp = await api.get('/areas/activas/', { withCredentials: true })
          const active = resp.data?.data || []
          const parent = active.find((a: any) => a.codigo === parentCodigo)
          if (!parent) {
            form.setError('codigo' as any, { type: 'manual', message: `No se encontró área padre con código ${parentCodigo}` })
            setIsSubmitting(false)
            return
          }
          areaPadreId = parent.id_area
        } catch (e) {
          console.error('Error buscando áreas activas para derivar padre:', e)
          form.setError('codigo' as any, { type: 'manual', message: 'Error buscando el área padre. Intenta nuevamente.' })
          setIsSubmitting(false)
          return
        }
      }

      const payload = {
        codigo: codigoToSend,
        nombre_area: data.nombre_area,
        siglas: data.siglas || null,
        area_padre: areaPadreId,
        nivel: data.nivel,
        activo: data.activo,
      }

      console.log('Payload a enviar:', payload)

      if (isEditing) {
        // Actualizar área existente (usar cookies)
        await api.patch(`/areas/${currentRow.id_area}/`, payload, {
          withCredentials: true,
        })
        toast.success('Área actualizada correctamente')
      } else {
        // Crear nueva área
        await api.post('/areas/', payload, {
          withCredentials: true,
        })
        toast.success('Área creada correctamente')
      }

      // Refrescar los datos
      if (refetch) {
        refetch()
      }
      setOpen(null)
    } catch (error) {
      console.error('Error al guardar el área:', error)
      console.error('Error completo:', JSON.stringify(error, null, 2))
      const responseData = (error as any)?.response?.data
      console.error('Response data:', responseData)
      console.error('Errores detallados:', responseData?.errors)
      
      let errorMessage = 'Error al guardar el área'
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        errorMessage = axiosError.response?.data?.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      
        // If backend returned field errors, map them to form fields so the UI
        // highlights the exact problem (eg. codigo uniqueness).
        const fieldErrors = responseData?.errors
        if (fieldErrors && typeof form.setError === 'function') {
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            const msg = Array.isArray(messages) ? (messages[0] as string) : (messages as string)
            try {
              form.setError(field as any, { type: 'server', message: msg })
            } catch (e) {
              // ignore setError failures for unknown fields
              console.error('Failed to set form error for', field, e)
            }
          })
        }

        toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        if (!state) {
          setOpen(null)
          form.reset()
        }
      }}
    >
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Agregar'} Área</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del área.'
              : 'Completa los datos para crear una nueva área.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='area-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className='flex items-center gap-4 flex-nowrap'>
              <div className='flex-shrink-0'>
                <FormField
                  control={form.control}
                  name='codigo'
                  render={({ field }) => (
                    <FormItem className='m-0'>
                      <FormLabel className='text-sm'>Código *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='01.01.01'
                          {...field}
                          className='w-52 h-10'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex-shrink-0'>
                <FormField
                  control={form.control}
                  name='nivel'
                  render={({ field }) => (
                    <FormItem className='m-0'>
                      <FormLabel className='text-sm mb-0'>Nivel</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={(value) => field.onChange(Number(value))}
                          value={field.value?.toString() || '1'}
                          disabled={!nivelEditable}
                        >
                          <SelectTrigger className='w-52 h-10'>
                            <SelectValue placeholder='Nivel' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='1'>1</SelectItem>
                            <SelectItem value='2'>2</SelectItem>
                            <SelectItem value='3'>3</SelectItem>
                            <SelectItem value='4'>4</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className='mt-1'>
              <FormDescription className='text-sm'>Código jerárquico del área (ej: 01.01.01)</FormDescription>
            </div>

            <FormField
              control={form.control}
              name='nombre_area'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Gerencia General'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='siglas'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Siglas</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='GG'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='activo'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Estado Activo</FormLabel>
                    <FormDescription>
                      El área estará disponible en el sistema
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type='button' variant='outline' disabled={isSubmitting}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type='submit' form='area-form' disabled={isSubmitting}>
            {isSubmitting 
              ? 'Guardando...' 
              : isEditing ? 'Guardar Cambios' : 'Crear Área'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
