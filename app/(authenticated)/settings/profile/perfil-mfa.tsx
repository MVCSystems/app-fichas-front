'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Lock, CheckCircle2, AlertCircle, QrCode, ShieldCheck, Download } from 'lucide-react'
import api from '@/lib/axios'
import { type PerfilUsuario, activarMFASchema, type ActivarMFA } from './schema'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

type PerfilMFAProps = {
  perfil: PerfilUsuario
  onUpdate: () => void
}

export function PerfilMFA({ perfil, onUpdate }: PerfilMFAProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showActivarDialog, setShowActivarDialog] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [codigosRespaldo, setCodigosRespaldo] = useState<string[]>([])
  const [showCodigosDialog, setShowCodigosDialog] = useState(false)
  const router = useRouter()

  // Auto-iniciar descarga cuando los códigos se generen y el diálogo esté abierto
  useEffect(() => {
    if (!showCodigosDialog) return
    if (!codigosRespaldo || codigosRespaldo.length === 0) return

    const isEdge = typeof navigator !== 'undefined' && (/Edg\//.test(navigator.userAgent) || /Edge\//.test(navigator.userAgent))
    const autoDelay = isEdge ? 900 : 300

    const t = setTimeout(() => {
      try {
        descargarYRedirigir()
      } catch (e) {
        console.error('Auto-download failed:', e)
      }
    }, autoDelay)

    return () => clearTimeout(t)
  }, [codigosRespaldo, showCodigosDialog])

  const form = useForm<ActivarMFA>({
    resolver: zodResolver(activarMFASchema),
    defaultValues: {
      codigo_verificacion: '',
    },
  })

  const iniciarActivacion = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/usuarios/mfa/iniciar/', {})

      setQrCode(response.data.qr_code)
      setShowActivarDialog(true)
    } catch (err: unknown) {
      console.error('Error al iniciar MFA:', err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Error al iniciar MFA'
        : 'Error al iniciar MFA'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const confirmarActivacion = async (data: ActivarMFA) => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/usuarios/mfa/confirmar/', data)

      setCodigosRespaldo(response.data.codigos_respaldo || [])
      setShowActivarDialog(false)
      setShowCodigosDialog(true)
      setSuccess(true)
      form.reset()
      setTimeout(() => setSuccess(false), 3000)
      onUpdate()
    } catch (err: unknown) {
      console.error('Error al confirmar MFA:', err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Código inválido'
        : 'Código inválido'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const desactivarMFA = async () => {
    if (!confirm('¿Estás seguro de desactivar MFA? Esto reducirá la seguridad de tu cuenta.')) return

    try {
      setLoading(true)
      setError(null)

      await api.post('/usuarios/mfa/desactivar/', {})

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      onUpdate()
    } catch (err: unknown) {
      console.error('Error al desactivar MFA:', err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Error al desactivar MFA'
        : 'Error al desactivar MFA'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const regenerarCodigos = async () => {
    if (!confirm('¿Regenerar códigos de respaldo? Los códigos actuales dejarán de funcionar.')) return

    try {
      setLoading(true)
      setError(null)

      const response = await api.post('/usuarios/mfa/regenerar-codigos/', {})

      setCodigosRespaldo(response.data.codigos_respaldo || [])
      setShowCodigosDialog(true)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      console.error('Error al regenerar códigos:', err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Error al regenerar códigos'
        : 'Error al regenerar códigos'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const descargarYRedirigir = () => {
    try {
      const content = codigosRespaldo.join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'codigos_respaldo.txt'
      document.body.appendChild(a)
      a.click()

      // En algunos navegadores (Edge) la descarga puede necesitar tiempo
      // No removemos ni revocamos inmediatamente para evitar cancelación
      const isEdge = typeof navigator !== 'undefined' && (/Edg\//.test(navigator.userAgent) || /Edge\//.test(navigator.userAgent))
      const revokeDelay = isEdge ? 2000 : 600

      setTimeout(() => {
        try { a.remove() } catch (e) { /* ignore */ }
        try { URL.revokeObjectURL(url) } catch (e) { /* ignore */ }
      }, revokeDelay)

      // Cerrar dialog y redirigir al login después del mismo delay
      setShowCodigosDialog(false)
      setTimeout(() => router.push('/auth/sign-in'), revokeDelay + 100)
    } catch (err) {
      console.error('Error al descargar códigos:', err)
      alert('No se pudo descargar los códigos. Intenta copiar manualmente.')
    }
  }

  return (
    <div className='space-y-6'>
      {/* Estado MFA */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldCheck className='h-5 w-5' />
            Autenticación de Dos Factores (MFA)
          </CardTitle>
          <CardDescription>
            Agrega una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center justify-between rounded-lg border p-4'>
            <div className='space-y-1'>
              <Label className='text-base font-semibold'>Estado de MFA</Label>
              <p className='text-sm text-muted-foreground'>
                {perfil.mfa_habilitado 
                  ? 'Tu cuenta está protegida con autenticación de dos factores' 
                  : 'Activa MFA para mayor seguridad'}
              </p>
            </div>
            <div>
              {perfil.mfa_habilitado ? (
                <Badge variant='default' className='bg-green-500'>Activo</Badge>
              ) : (
                <Badge variant='secondary'>Inactivo</Badge>
              )}
            </div>
          </div>

          {perfil.mfa_requerido && (
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Tu cargo requiere MFA obligatorio por seguridad.
              </AlertDescription>
            </Alert>
          )}

          {perfil.mfa_habilitado && perfil.fecha_activacion_mfa && (
            <div className='space-y-2'>
              <Label>Fecha de activación</Label>
              <Input
                value={new Date(perfil.fecha_activacion_mfa).toLocaleString('es-PE')}
                disabled
              />
            </div>
          )}

          {perfil.mfa_habilitado && (
            <div className='flex items-center justify-between rounded-lg border p-4'>
              <div className='space-y-1'>
                <Label className='text-base font-semibold'>Códigos de respaldo</Label>
                <p className='text-sm text-muted-foreground'>
                  {perfil.tiene_codigos_respaldo 
                    ? 'Tienes códigos de respaldo disponibles' 
                    : 'No tienes códigos de respaldo'}
                </p>
              </div>
              <div>
                {perfil.tiene_codigos_respaldo ? (
                  <Badge variant='default' className='bg-green-500'>Disponibles</Badge>
                ) : (
                  <Badge variant='destructive'>Sin códigos</Badge>
                )}
              </div>
            </div>
          )}

          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className='border-green-500 bg-green-50 text-green-900'>
              <CheckCircle2 className='h-4 w-4 text-green-600' />
              <AlertDescription>Operación exitosa</AlertDescription>
            </Alert>
          )}

          <div className='flex flex-wrap gap-3'>
            {!perfil.mfa_habilitado ? (
              <Button onClick={iniciarActivacion} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className='mr-2 h-4 w-4' />
                    Activar MFA
                  </>
                )}
              </Button>
            ) : (
              <>
                {!perfil.mfa_requerido && (
                  <Button
                    variant='destructive'
                    onClick={desactivarMFA}
                    disabled={loading}
                  >
                    <Lock className='mr-2 h-4 w-4' />
                    Desactivar MFA
                  </Button>
                )}
                <Button
                  variant='outline'
                  onClick={regenerarCodigos}
                  disabled={loading}
                >
                  <Copy className='mr-2 h-4 w-4' />
                  Regenerar Códigos
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para activar MFA */}
      <Dialog open={showActivarDialog} onOpenChange={setShowActivarDialog}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <QrCode className='h-5 w-5' />
              Configurar Autenticación de Dos Factores
            </DialogTitle>
            <DialogDescription>
              Escanea el código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            {qrCode && (
              <div className='flex justify-center rounded-lg border p-4'>
                <img src={qrCode} alt='QR Code MFA' className='h-64 w-64' />
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(confirmarActivacion)} className='space-y-4'>
                <FormField
                  control={form.control}
                  name='codigo_verificacion'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código de Verificación</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder='Ingresa el código de 6 dígitos'
                          maxLength={6}
                          autoComplete='off'
                        />
                      </FormControl>
                      <FormDescription>
                        Ingresa el código generado por tu aplicación
                      </FormDescription>
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

                <DialogFooter>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => setShowActivarDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type='submit' disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        Verificando...
                      </>
                    ) : (
                      'Activar MFA'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para mostrar códigos de respaldo */}
      <Dialog open={showCodigosDialog} onOpenChange={setShowCodigosDialog}>
        <DialogContent className='sm:max-w-[500px]'>
          <DialogHeader>
            <DialogTitle>Códigos de Respaldo</DialogTitle>
            <DialogDescription>
              Guarda estos códigos en un lugar seguro. Puedes usarlos si pierdes acceso a tu aplicación de autenticación.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <Alert>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>
                Cada código solo se puede usar una vez. Guárdalos de forma segura.
              </AlertDescription>
            </Alert>

            <div className='rounded-lg border p-4'>
              <div className='grid grid-cols-2 gap-2 font-mono text-sm'>
                {codigosRespaldo.map((codigo, index) => (
                  <div key={index} className='rounded bg-muted p-2 text-center'>
                    {codigo}
                  </div>
                ))}
              </div>
            </div>

            <div className='text-sm text-muted-foreground'>
              La descarga de los códigos se iniciará automáticamente. Una vez descargados, serás redirigido al login.
            </div>
          </div>

          <DialogFooter>
            <div className='w-full text-center text-sm text-muted-foreground'>
              Si la descarga no inicia automáticamente, espera unos segundos o revisa las descargas del navegador.
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
