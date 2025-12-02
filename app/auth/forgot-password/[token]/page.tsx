"use client"

import React, { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ResetearPasswordPage(): React.ReactElement {
  const router = useRouter()
  const params = useParams()
  const token = params?.token || ''

  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const password = String(form.get('password') || '')
      const password_confirm = String(form.get('password_confirm') || '')

      const API_URL = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${API_URL}/usuarios/resetear-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password, password_confirm })
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = json?.message || json?.detail || 'Error al resetear la contraseña'
        toast.error(msg)
        setIsLoading(false)
        return
      }

      toast.success('Contraseña restablecida correctamente. Inicia sesión con tu nueva contraseña.')
      router.push('/auth/sign-in')
    } catch (err) {
      console.error('Reset error', err)
      toast.error('Error al resetear la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Restablecer contraseña</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="password">Nueva contraseña</FieldLabel>
                  <Input id="password" name="password" type="password" required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password_confirm">Confirmar contraseña</FieldLabel>
                  <Input id="password_confirm" name="password_confirm" type="password" required />
                </Field>
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Procesando...' : 'Restablecer contraseña'}</Button>
                </Field>
              </FieldGroup>
            </form>
            <p className="text-xs text-muted-foreground mt-4">Si tienes MFA habilitado, al iniciar sesión se te pedirá tu código. Si perdiste el acceso a tu app de autenticación, utiliza los códigos de respaldo o contacta al soporte.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
