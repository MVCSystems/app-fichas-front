'use client'

import { useEffect, useState, useRef } from 'react'
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

  // helper to pad codigo segments to two digits (shared)
  const padCodigo = (raw: string | undefined | null) => {
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

  // compare codes by numeric segments (tolerant to leading zeros and spacing)
  const compareCodesNormalized = (a?: string | null, b?: string | null) => {
    if (!a || !b) return false
    const segA = a.split('.').map(s => s.trim()).filter(Boolean).map(s => parseInt(s,10))
    const segB = b.split('.').map(s => s.trim()).filter(Boolean).map(s => parseInt(s,10))
    if (segA.length !== segB.length) return false
    for (let i = 0; i < segA.length; i++) {
      if (isNaN(segA[i]) || isNaN(segB[i]) || segA[i] !== segB[i]) return false
    }
    return true
  }

  // Watches to auto-generate child code when user types parent code or changes nivel
  const codigoValue = form.watch('codigo')
  const nivelValue = form.watch('nivel')
  const lastAutoGen = useRef<string | null>(null)

  useEffect(() => {
    // Do not auto-generate when editing an existing area
    if (isEditing) return

    const rawCodigo = (codigoValue || '').trim()
    if (!rawCodigo) return
    const segments = rawCodigo.split('.').filter(Boolean)
    if (!nivelValue || nivelValue <= 1) return

    // If user provided the parent code (segments length == nivel - 1), auto-generate child
    if (segments.length === nivelValue - 1) {
      const parentCodigo = rawCodigo
      // avoid repeated auto-generation
      if (lastAutoGen.current === parentCodigo) return
      let mounted = true
      ;(async () => {
        try {
          const resp = await api.get('/areas/activas/', { withCredentials: true })
          if (!mounted) return
          const active = resp.data?.data || []
          const parent = active.find((a: any) => padCodigo(a.codigo) === padCodigo(parentCodigo))
          if (!parent) return
          const subResp = await api.get(`/areas/${parent.id_area}/subareas/`, { withCredentials: true })
          if (!mounted) return
          const subareas = subResp.data?.data || []
          let maxSuffix = 0
          subareas.forEach((s: any) => {
            const childCodigo = s.codigo || ''
            if (childCodigo.startsWith(parentCodigo + '.')) {
              const suffix = childCodigo.slice(parentCodigo.length + 1)
              const last = suffix.split('.').pop()
              const n = parseInt(last || '0', 10)
              if (!isNaN(n) && n > maxSuffix) maxSuffix = n
            }
          })
          const paddedParent = padCodigo(parentCodigo)
          const newCodigo = `${paddedParent}.${String(maxSuffix + 1).padStart(2, '0')}`
          lastAutoGen.current = parentCodigo
          form.setValue('codigo', newCodigo)
        } catch (e) {
          // ignore errors silently for auto-gen
          console.error('auto-gen child code error', e)
        }
      })()
      return () => { mounted = false }
    }

    // If user types a full child code (segments >= nivel), clear lastAutoGen to allow future gens
    if (segments.length >= nivelValue) {
      lastAutoGen.current = null
    }
  }, [codigoValue, nivelValue, isEditing, form])

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

        // helper to fetch active areas list once
        const fetchActive = async () => {
          const resp = await api.get('/areas/activas/', { withCredentials: true })
          return resp.data?.data || []
        }

        // If user entered only the parent code (segments.length === nivel - 1),
        // auto-generate the child suffix and set codigoToSend accordingly.
        if (segments.length === data.nivel - 1) {
          const parentCodigo = codigoToSend
          try {
            const active = await fetchActive()
            const parent = active.find((a: any) => padCodigo(a.codigo) === padCodigo(parentCodigo))
            if (!parent) {
              form.setError('codigo' as any, { type: 'manual', message: `No se encontró área padre con código ${parentCodigo}` })
              setIsSubmitting(false)
              return
            }
            // fetch subareas to compute next index
            const subResp = await api.get(`/areas/${parent.id_area}/subareas/`, { withCredentials: true })
            const subareas = subResp.data?.data || []
            let maxSuffix = 0
            subareas.forEach((s: any) => {
              const childCodigo = s.codigo || ''
              if (childCodigo.startsWith(parentCodigo + '.')) {
                const suffix = childCodigo.slice(parentCodigo.length + 1)
                const last = suffix.split('.').pop()
                const n = parseInt(last || '0', 10)
                if (!isNaN(n) && n > maxSuffix) maxSuffix = n
              }
            })
            // pad parent and suffix
            const pad = (s: string) => s.split('.').map(seg => String(parseInt(seg,10)).padStart(2,'0')).join('.')
            const parentP = pad(parentCodigo)
            codigoToSend = `${parentP}.${String(maxSuffix + 1).padStart(2,'0')}`
            areaPadreId = parent.id_area
          } catch (e) {
            console.error('Error buscando/creando código hijo:', e)
            form.setError('codigo' as any, { type: 'manual', message: 'Error calculando código hijo. Intenta nuevamente.' })
            setIsSubmitting(false)
            return
          }

        } else if (segments.length >= data.nivel) {
          // user provided full child code (or more), parent is all but last segment
          const parentCodigo = segments.slice(0, -1).join('.')
          try {
            const active = await fetchActive()
            let parent = active.find((a: any) => padCodigo(a.codigo) === padCodigo(parentCodigo) || compareCodesNormalized(a.codigo, parentCodigo))
            if (!parent) {
              // fallback: try all areas (including inactive)
              try {
                const allResp = await api.get('/areas/', { withCredentials: true })
                const allAreas = allResp.data?.data || []
                parent = allAreas.find((a: any) => padCodigo(a.codigo) === padCodigo(parentCodigo) || compareCodesNormalized(a.codigo, parentCodigo))
                if (parent) {
                  // parent exists but not active
                  areaPadreId = parent.id_area
                  // warn user but allow proceeding
                  toast(`Área padre encontrada pero no está activa: ${padCodigo(parentCodigo)} (se asociará)`)
                }
              } catch (e) {
                // ignore fallback error
                console.error('fallback search error', e)
              }
            }

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

        } else {
          // too few segments provided
          form.setError('codigo' as any, { type: 'manual', message: `Código insuficiente para nivel ${data.nivel}. Indica el código del padre o el código completo del hijo.` })
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
