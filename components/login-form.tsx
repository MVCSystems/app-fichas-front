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
  const [showResend, setShowResend] = useState(false)
  const [resendEmail, setResendEmail] = useState('')
  const [resendLoading, setResendLoading] = useState(false)
  const [step, setStep] = useState<'email'|'password'|'inactive'|'unknown'>('email')
  const [emailValue, setEmailValue] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const email = String(form.get('email') || '')
      const password = String(form.get('password') || '')

      const API_URL = process.env.NEXT_PUBLIC_API_URL

      if (step === 'email') {
        // Check email status
        const res = await fetch(`${API_URL}/usuarios/check-email/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })

        const data = await res.json().catch(() => null)
        if (!res.ok) {
          const msg = data?.detail || data?.message || 'Error verificando email'
          toast.error(msg)
          setIsLoading(false)
          return
        }

        // Handle responses
        if (!data.exists) {
          setStep('unknown')
          toast.info('No se encontró una cuenta con ese correo. Puedes registrarte.')
          setResendEmail(email)
          setEmailValue(email)
          setIsLoading(false)
          return
        }

        if (data.cuenta_activada) {
          setStep('password')
          setEmailValue(email)
          setIsLoading(false)
          return
        }

        // exists && not activated
        setStep('inactive')
        setShowResend(true)
        setResendEmail(email)
        setEmailValue(email)
        toast.info('La cuenta no está activada. Puedes enviar el enlace de activación.')
        setIsLoading(false)
        return
      }

      // If step === 'password' proceed to login
      const res = await fetch(`${API_URL}/usuarios/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: emailValue || email, password, no_session: true }),
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
        const msg = json?.message ?? text
        if (msg) {
          toast.error(msg)
        } else {
          toast.error('Credenciales inválidas')
        }
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
                  onChange={(e) => setResendEmail(String(e.target.value || ''))}
                />
              </Field>
              {step === 'password' && (
                <>
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
                </>
              )}
              {step !== 'password' && (
                <Field>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Procesando...' : 'Continuar'}
                  </Button>
                </Field>
              )}
              {showResend && (
                <Field>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    disabled={resendLoading || !resendEmail}
                    onClick={async () => {
                      try {
                        setResendLoading(true)
                        const API_URL = process.env.NEXT_PUBLIC_API_URL
                        const res = await fetch(`${API_URL}/usuarios/enviar-magic-link/`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: resendEmail }),
                        })
                        const text = await res.text()
                        let json = null
                        try { json = JSON.parse(text) } catch (_e) { json = null }

                        if (!res.ok) {
                          if (json?.message) toast.error(json.message)
                          else if (text) toast.error(text)
                          else toast.error('Error al reenviar enlace')
                          return
                        }

                        toast.success(json?.message || 'Enlace de activación reenviado. Revisa tu correo.')
                        // Redirigir al login después de reenviar el enlace
                        const isEdge = typeof navigator !== 'undefined' && (/Edg\//.test(navigator.userAgent) || /Edge\//.test(navigator.userAgent))
                        const delay = isEdge ? 2000 : 700
                        // Resetear estado local para evitar que el formulario quede en modo reenvío
                        setShowResend(false)
                        setStep('email')
                        setResendEmail('')
                        setEmailValue('')
                        setTimeout(() => {
                          // Usar router.push (Next navigation) para navegar de forma SPA
                          router.push('/auth/sign-in')
                        }, delay)
                      } catch (err) {
                        console.error('Resend error', err)
                        toast.error('Error al reenviar enlace')
                      } finally {
                        setResendLoading(false)
                      }
                    }}
                  >
                    {resendLoading ? 'Enviando...' : 'Enviar enlace de activación'}
                  </Button>
                </Field>
              )}
              {step === 'unknown' && (
                <Field>
                  <div className="text-center text-sm text-muted-foreground">
                    No existe una cuenta con ese correo.{' '}
                    <Link href="/auth/sign-up" className="font-semibold text-primary hover:underline">Crear cuenta</Link>
                  </div>
                </Field>
              )}
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
