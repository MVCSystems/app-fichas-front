'use client'

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useEmpleados } from './empleados-provider'
import { empleadoFormSchema, cargoOptions } from '../data/schema'
import { toast } from 'sonner'
import api from '@/lib/axios'

interface Area {
  id_area: number
  nombre_area: string
}

interface EmpleadosActionDialogProps {
  open: boolean
}

export function EmpleadosActionDialog({ open }: EmpleadosActionDialogProps) {
  const { setOpen, currentRow, refetch } = useEmpleados()
  const isEditing = open && currentRow
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [areas, setAreas] = useState<Area[]>([])
  const [loadingAreas, setLoadingAreas] = useState(false)

  const form = useForm({
    resolver: zodResolver(empleadoFormSchema),
    defaultValues: {
      dni: '',
      nombre_completo: '',
      cargo: '',
      correo: '',
      celular: '',
      area_id: 0,
      activo: true,
    },
  })

  // Cargar áreas al abrir el diálogo
  useEffect(() => {
    if (open) {
      setLoadingAreas(true)
      api.get('/areas/activas/')
        .then((response) => {
          setAreas(response.data.data || response.data.results || response.data || [])
        })
        .catch((error) => {
          console.error('Error al cargar áreas:', error)
          toast.error('Error al cargar las áreas')
        })
        .finally(() => {
          setLoadingAreas(false)
        })
    }
  }, [open])

  useEffect(() => {
    if (isEditing) {
      // Soporta tanto id_area plano como area.id_area
      const areaId = currentRow.id_area || (currentRow.area && currentRow.area.id_area) || 0;
      form.reset({
        dni: currentRow.dni,
        nombre_completo: currentRow.nombre_completo,
        cargo: currentRow.cargo || '',
        correo: currentRow.correo || '',
        celular: currentRow.celular || '',
        area_id: areaId,
        activo: currentRow.activo,
      })
    } else {
      form.reset({
        dni: '',
        nombre_completo: '',
        cargo: '',
        correo: '',
        celular: '',
        area_id: 0,
        activo: true,
      })
    }
  }, [isEditing, currentRow, form])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(data: any) {
    setIsSubmitting(true)

    try {
      const payload = {
        dni: data.dni,
        nombre_completo: data.nombre_completo,
        cargo: data.cargo,
        correo: data.correo,
        celular: data.celular || null,
        area_id: data.area_id,
        activo: data.activo,
      }

      if (isEditing) {
        await api.patch(`/empleados/${currentRow.id_empleado}/`, payload)
        toast.success('Empleado actualizado correctamente')
      } else {
        await api.post('/empleados/', payload)
        toast.success('Empleado creado correctamente')
      }

      if (refetch) {
        refetch()
      }
      setOpen(null)
    } catch (error) {
      console.error('Error al guardar el empleado:', error)
      let errorMessage = 'Error al guardar el empleado'

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } }
        errorMessage = axiosError.response?.data?.message || errorMessage
      } else if (error instanceof Error) {
        errorMessage = error.message
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
      <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Agregar'} Empleado</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del empleado.'
              : 'Completa los datos para registrar un nuevo empleado.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='empleado-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            {/* DNI y Celular */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='dni'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DNI *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='12345678'
                        maxLength={8}
                        {...field}
                        disabled={!!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='celular'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Celular</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='987654321'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Nombre Completo */}
            <FormField
              control={form.control}
              name='nombre_completo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Juan Pérez García'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cargo y Área */}
            <div className='grid grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='cargo'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cargoOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='area_id'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Área *</FormLabel>
                    <FormControl>
                      <Combobox
                        options={areas.map((area) => ({
                          value: area.id_area.toString(),
                          label: area.nombre_area
                        }))}
                        value={field.value?.toString() || ''}
                        onValueChange={(value) => field.onChange(parseInt(value) || 0)}
                        placeholder={loadingAreas ? "Cargando áreas..." : "Selecciona un área"}
                        searchPlaceholder="Buscar área..."
                        emptyText="No se encontraron áreas"
                        disabled={loadingAreas}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Correo */}
            <FormField
              control={form.control}
              name='correo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo *</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      placeholder='empleado@empresa.com'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado Activo */}
            <FormField
              control={form.control}
              name='activo'
              render={({ field }) => (
                <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                  <div className='space-y-0.5'>
                    <FormLabel>Estado Activo</FormLabel>
                    <FormDescription>
                      El empleado estará activo en el sistema
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
          <Button type='submit' form='empleado-form' disabled={isSubmitting}>
            {isSubmitting 
              ? 'Guardando...' 
              : isEditing ? 'Guardar Cambios' : 'Crear Empleado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
