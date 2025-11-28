'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Key, CheckCircle2, AlertCircle, Shield } from 'lucide-react'
import api from '@/lib/axios'
import { type PerfilUsuario, cambiarPasswordSchema, type CambiarPassword } from './schema'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/password-input'

type PerfilSeguridadProps = {
  perfil: PerfilUsuario
  onUpdate: () => void
}

export function PerfilSeguridad({ perfil, onUpdate }: PerfilSeguridadProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<CambiarPassword>({
    resolver: zodResolver(cambiarPasswordSchema),
    defaultValues: {
      password_actual: '',
      password_nueva: '',
      password_nueva_confirm: '',
    },
  })

  const onSubmit = async (data: CambiarPassword) => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      await api.post('/usuarios/cambiar-password/', data)

      setSuccess(true)
      form.reset()
      setTimeout(() => setSuccess(false), 3000)
      onUpdate()
    } catch (err: unknown) {
      console.error('Error al cambiar contraseña:', err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Error al cambiar la contraseña'
        : 'Error al cambiar la contraseña'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Información de seguridad */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Información de Seguridad
          </CardTitle>
          <CardDescription>
            Estado actual de tu seguridad de cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4'>
            <div className='space-y-2'>
              <Label>Último acceso</Label>
              <Input
                value={perfil.ultimo_acceso ? new Date(perfil.ultimo_acceso).toLocaleString('es-PE') : 'N/A'}
                disabled
              />
            </div>
            <div className='space-y-2'>
              <Label>Último cambio de contraseña</Label>
              <Input
                value={perfil.fecha_ultimo_cambio_password ? new Date(perfil.fecha_ultimo_cambio_password).toLocaleString('es-PE') : 'N/A'}
                disabled
              />
            </div>
          </div>

          {perfil.requiere_cambio_password && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Se requiere que cambies tu contraseña por seguridad.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cambiar contraseña */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Key className='h-5 w-5' />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña periódicamente para mayor seguridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
              <FormField
                control={form.control}
                name='password_actual'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder='Ingresa tu contraseña actual'
                        autoComplete='current-password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password_nueva'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder='Ingresa tu nueva contraseña'
                        autoComplete='new-password'
                      />
                    </FormControl>
                    <FormDescription>
                      Mínimo 8 caracteres
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password_nueva_confirm'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar Nueva Contraseña</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder='Confirma tu nueva contraseña'
                        autoComplete='new-password'
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className='border-green-500 bg-green-50 text-green-900'>
                  <CheckCircle2 className='h-4 w-4 text-green-600' />
                  <AlertDescription>Contraseña cambiada correctamente</AlertDescription>
                </Alert>
              )}

              <Button type='submit' disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Cambiando...
                  </>
                ) : (
                  <>
                    <Key className='mr-2 h-4 w-4' />
                    Cambiar Contraseña
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
