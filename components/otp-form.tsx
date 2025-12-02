"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"

export function OTPForm({ ...props }: React.ComponentProps<typeof Card>) {
  const searchParams = useSearchParams()
  const sim = searchParams?.get('sim') === '1'
  const email = searchParams?.get('email')
  const userId = searchParams?.get('userId')
  const [useBackup, setUseBackup] = useState(false)
  const [backupValue, setBackupValue] = useState('')
  
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      let codigo = ''
      if (!useBackup) {
        const otpInput = document.getElementById('otp') as HTMLInputElement | null
        codigo = otpInput?.value || ''
      } else {
        // Normalizar código de respaldo: quitar no-dígitos, uppercase, insertar guion XXXX-XXXX
        const raw = (backupValue || '').toString().toUpperCase()
        const digits = raw.replace(/[^0-9A-Z]/g, '')
        // aceptar códigos numéricos (generador actual) o alfanuméricos
        if (digits.length === 8) {
          codigo = digits.slice(0,4) + '-' + digits.slice(4)
        } else {
          codigo = backupValue
        }
      }
      if (!userId) {
        toast.error('Falta userId en la URL.')
        return
      }
      // Validaciones básicas
      if (!codigo) {
        toast.error(useBackup ? 'Ingrese el código de respaldo.' : 'Ingrese el código de 6 dígitos.')
        return
      }

      // Llamar al endpoint verificar-mfa
      const API_URL = process.env.NEXT_PUBLIC_API_URL
      // Leer nombre de cookie CSRF configurado en frontend (coincide con backend)
      const CSRF_COOKIE_NAME = process.env.NEXT_PUBLIC_CSRF_COOKIE_NAME || 'fichas_csrftoken'
      const getCookie = (name: string) => {
        if (typeof document === 'undefined') return ''
        const v = `; ${document.cookie}`
        const parts = v.split(`; ${name}=`)
        if (parts.length === 2) return parts.pop()!.split(';').shift() || ''
        return ''
      }
      const payload: any = { user_id: Number(userId) }
      if (useBackup) payload.codigo_respaldo = codigo
      else payload.codigo_mfa = codigo

      // Enviar no_session para evitar sobrescribir sessiones existentes en el navegador
      payload.no_session = true
      const csrf = getCookie(CSRF_COOKIE_NAME)
      const res = await fetch(`${API_URL}/usuarios/verificar-mfa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(csrf ? { 'X-CSRFToken': csrf } : {}) },
        credentials: 'include',
        body: JSON.stringify(payload)
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) {
        const msg = json?.message || json?.detail || 'Código inválido'
        toast.error(msg)
        return
      }

      toast.success(json?.message || 'Verificado correctamente')
      // Redirigir al dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('OTP submit error', err)
      toast.error('Error verificando el código')
    }
  }

  useEffect(() => {
    if (sim && email) {
      toast.success(`Simulación: se envió un código a ${email}`)
    }
  }, [sim, email])

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Ingrese el código de verificación</CardTitle>
        <CardDescription>
          Ingresa el código de 6 dígitos desde tu app de autenticación o usa un código de respaldo.
          {sim && email ? (
            <div className="mt-2 text-sm text-muted-foreground">
              Simulación: código enviado a {email}
            </div>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <div className="flex items-center justify-between">
                <FieldLabel htmlFor="otp">Código de verificación</FieldLabel>
                <label className="text-sm flex items-center gap-2">
                  <input type="checkbox" className="rounded" checked={useBackup} onChange={(e) => setUseBackup(e.target.checked)} />
                  <span className="text-xs">Usar código de respaldo</span>
                </label>
              </div>

              {!useBackup ? (
                <InputOTP maxLength={6} id="otp" required>
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              ) : (
                <input
                  id="backup_code"
                  name="backup_code"
                  className="w-full rounded-md border-input px-3 py-2"
                  placeholder="XXXX-XXXX"
                  value={backupValue}
                  onChange={(e) => setBackupValue(e.target.value)}
                  required
                />
              )}
              <FieldDescription>
                {useBackup ? 'Introduce uno de tus códigos de respaldo.' : 'Ingresa el código de 6 dígitos desde tu app de autenticación.'}
              </FieldDescription>
            </Field>
            <FieldGroup>
              <Button type="submit">Verificar</Button>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
