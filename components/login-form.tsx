"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { LogIn, BarChart3 } from "lucide-react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const email = String(form.get('email') || '')
      const password = String(form.get('password') || '')

      const API_URL = process.env.NEXT_PUBLIC_API_URL
      const res = await fetch(`${API_URL}/usuarios/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      // Leer respuesta de forma robusta: intentar JSON, si falla usar texto
      let json: any = null
      let text: string | null = null
      try {
        text = await res.text()
        try {
          json = JSON.parse(text)
        } catch (_err) {
          json = null
        }
      } catch (_err) {
        // ignore
      }

      console.debug('[login] status', res.status, 'body:', text)

      if (!res.ok) {
        // Preferir mensaje JSON si existe, si no mostrar el texto crudo
        if (json?.message) toast.error(json.message)
        else if (text) toast.error(text)
        else toast.error('Credenciales inválidas')
        setIsLoading(false)
        return
      }

      if (json?.requiere_mfa) {
        const userId = json.user_id || json.data?.user?.id
        toast.info(json.message || 'Se requiere código MFA')
        router.push(`/auth/code-otp?userId=${userId}&email=${encodeURIComponent(email)}`)
        return
      }

      // Login exitoso: la cookie HTTP-only accessToken debe estar presente
      toast.success('Inicio de sesión exitoso')
      router.push('/dashboard')
    } catch (err) {
      console.error('Login error', err)
      toast.error('Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <BarChart3 className="w-12 h-12 text-primary" />
          </div>
          <CardTitle>Iniciar sesión en tu cuenta</CardTitle>
          <CardDescription>
            Ingresa tu usuario a continuación para iniciar sesión en tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Usuario</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                </div>
                <Input id="password" name="password" type="password" placeholder="********" required />
              </Field>
              <Field>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? 'Iniciando...' : 'Iniciar sesión'}
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
