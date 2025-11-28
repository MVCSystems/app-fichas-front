'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// removed next-auth session usage — using cookie-based auth via `api`
import { toast } from 'sonner'
import { Loader2, User, Mail, Calendar, Settings } from 'lucide-react'
import api from '@/lib/axios'
import { type PerfilUsuario, actualizarPerfilSchema } from './schema'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'

type PerfilGeneralProps = {
  perfil: PerfilUsuario
  onUpdate: () => void
}

export function PerfilGeneral({ perfil, onUpdate }: PerfilGeneralProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(actualizarPerfilSchema),
    defaultValues: {
      tema: perfil.tema,
      idioma: perfil.idioma,
      notificaciones_email: perfil.notificaciones_email,
      notificaciones_push: perfil.notificaciones_push,
    },
  })

  const onSubmit = async (data: any) => {
    try {
      setLoading(true)

      await api.put('/usuarios/perfil/actualizar/', data)

      toast.success('Perfil actualizado correctamente')
      onUpdate()
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error)
      toast.error(error.response?.data?.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Informacion Personal</CardTitle>
          <CardDescription>
            Informacion de tu cuenta (solo lectura)
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <User className='h-4 w-4' />
                Usuario
              </label>
              <Input value={perfil.username} disabled />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <Mail className='h-4 w-4' />
                Correo Electronico
              </label>
              <Input value={perfil.email} disabled />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Nombre</label>
              <Input value={perfil.first_name} disabled />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium'>Apellido</label>
              <Input value={perfil.last_name} disabled />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Fecha de Registro
              </label>
              <Input
                value={new Date(perfil.date_joined).toLocaleDateString('es-ES')}
                disabled
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Ultimo Acceso
              </label>
              <Input
                value={
                  perfil.last_login
                    ? new Date(perfil.last_login).toLocaleDateString('es-ES')
                    : 'Nunca'
                }
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Settings className='h-5 w-5' />
            Preferencias
          </CardTitle>
          <CardDescription>
            Personaliza tu experiencia en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='tema'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tema</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona un tema' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='light'>Claro</SelectItem>
                        <SelectItem value='dark'>Oscuro</SelectItem>
                        <SelectItem value='auto'>Automatico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Apariencia de la interfaz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='idioma'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder='Selecciona un idioma' />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value='es'>Espanol</SelectItem>
                        <SelectItem value='en'>Ingles</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Idioma de la interfaz
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div className='space-y-4'>
                <h3 className='text-sm font-medium'>Notificaciones</h3>

                <FormField
                  control={form.control}
                  name='notificaciones_email'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Notificaciones por Email
                        </FormLabel>
                        <FormDescription>
                          Recibir notificaciones en tu correo electronico
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

                <FormField
                  control={form.control}
                  name='notificaciones_push'
                  render={({ field }) => (
                    <FormItem className='flex items-center justify-between rounded-lg border p-4'>
                      <div className='space-y-0.5'>
                        <FormLabel className='text-base'>
                          Notificaciones Push
                        </FormLabel>
                        <FormDescription>
                          Recibir notificaciones en tiempo real
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
              </div>

              <div className='flex justify-end'>
                <Button type='submit' disabled={loading}>
                  {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                  Guardar Cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
