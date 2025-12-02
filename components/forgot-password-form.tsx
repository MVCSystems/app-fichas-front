"use client"

import React, { useState } from 'react'
import { Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '')

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${API_URL}/usuarios/recuperar-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = json?.message || json?.detail || 'Error al solicitar recuperación'
        toast.error(msg)
        setIsLoading(false)
        return
      }

      toast.success('Se ha enviado un enlace de recuperación a tu email (si existe).')
      // Redirigir al login después de enviar el enlace
      const isEdge = typeof navigator !== 'undefined' && (/Edg\//.test(navigator.userAgent) || /Edge\//.test(navigator.userAgent))
      setTimeout(() => router.push('/auth/sign-in'), isEdge ? 2000 : 700)
    } catch (error) {
      console.error('Error al enviar email:', error)
      toast.error('Error al enviar el email. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="text-center space-y-4">
        <div className="flex justify-center">
          <Mail className="w-12 h-12 text-primary" />
        </div>
        <CardTitle>¿Olvidaste tu contraseña?</CardTitle>
        <CardDescription>
          Ingresa tu email y te enviaremos un enlace para recuperar tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                required
              />
            </Field>
            <Field>
              <Button type="submit" className="w-full" disabled={isLoading}>
                <Mail className="w-4 h-4 mr-2" />
                {isLoading ? 'Enviando...' : 'Enviar enlace de recuperación'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
