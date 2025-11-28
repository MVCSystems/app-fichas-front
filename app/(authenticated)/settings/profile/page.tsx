 'use client'

import { useEffect, useState } from 'react'
import { Main } from '@/components/layout/main'
import api from '@/lib/axios'
import { type PerfilUsuario } from './schema'
import { PerfilTabs } from './perfil-tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function PerfilPage() {
  const [perfil, setPerfil] = useState<PerfilUsuario | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPerfil = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get('/usuarios/perfil/')
      setPerfil(response.data)
    } catch (err: unknown) {
      console.error('Error al cargar perfil:', err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as {response?: {data?: {message?: string}}}).response?.data?.message || 'Error al cargar el perfil'
        : 'Error al cargar el perfil'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPerfil()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (status === 'loading' || loading) {
    return (
      <Main title='Mi Perfil'>
        <div className='space-y-6'>
          <Skeleton className='h-32 w-full' />
          <Skeleton className='h-96 w-full' />
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main title='Mi Perfil'>
        <Alert variant='destructive'>
          <AlertCircle className='h-4 w-4' />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Main>
    )
  }

  if (!perfil) {
    return (
      <Main title='Mi Perfil'>
        <Card>
          <CardHeader>
            <CardTitle>Perfil no encontrado</CardTitle>
            <CardDescription>
              No se pudo cargar la informacion del perfil.
            </CardDescription>
          </CardHeader>
        </Card>
      </Main>
    )
  }

  return (
    <Main title='Mi Perfil'>
      <PerfilTabs perfil={perfil} onUpdate={fetchPerfil} />
    </Main>
  )
}
