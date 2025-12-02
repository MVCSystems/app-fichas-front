"use client"

import React, { useState, useEffect } from "react"
import Image from 'next/image'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner'
import api from '@/lib/axios'

export default function ActivateAccountPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token || ''

  const [isLoading, setIsLoading] = useState(false)
  const [mfaSetup, setMfaSetup] = useState<any | null>(null)
  const [mfaCode, setMfaCode] = useState('')
  const [isConfirming, setIsConfirming] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null)

  const descargarYRedirigir = () => {
    try {
      const text = (backupCodes || []).join('\n')
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'backup-codes.txt'
      document.body.appendChild(a)
      a.click()

      const isEdge = typeof navigator !== 'undefined' && (/Edg\//.test(navigator.userAgent) || /Edge\//.test(navigator.userAgent))
      const revokeDelay = isEdge ? 2000 : 600
      setTimeout(() => {
        try { a.remove() } catch (e) { /* ignore */ }
        try { URL.revokeObjectURL(url) } catch (e) { /* ignore */ }
      }, revokeDelay)

      setTimeout(() => router.push('/auth/sign-in'), revokeDelay + 100)
    } catch (e) {
      console.error('No se pudo descargar códigos automáticamente', e)
      // fallback: solo redirigir
      router.push('/auth/sign-in')
    }
  }

  useEffect(() => {
    if (!backupCodes || backupCodes.length === 0) return
    // iniciar descarga automática cuando se generan los códigos
    const isEdge = typeof navigator !== 'undefined' && (/Edg\//.test(navigator.userAgent) || /Edge\//.test(navigator.userAgent))
    const autoDelay = isEdge ? 900 : 300
    const t = setTimeout(() => {
      descargarYRedirigir()
    }, autoDelay)
    return () => clearTimeout(t)
  }, [backupCodes])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    try {
      const form = new FormData(e.currentTarget)
      const password = String(form.get('password') || '')
      const password_confirm = String(form.get('password_confirm') || '')

      // Usar cliente axios (`api`) para enviar cookies y header CSRF automáticamente
      const res = await api.post('/usuarios/activar-cuenta/', { token, password, password_confirm })
      const json = res.data

      // Si el backend devuelve mfa_setup, mostramos QR y permitimos confirmar
      if (json?.data?.mfa_setup) {
        setMfaSetup(json.data.mfa_setup)
        toast.success('Cuenta activada. Configure MFA escaneando el QR.')
        setIsLoading(false)
        return
      }

      toast.success('Cuenta activada. Ya puedes iniciar sesión.')
      router.push('/auth/sign-in')
    } catch (err) {
      console.error('Activar error', err)
      toast.error('Error al activar la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleConfirmMfa(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!mfaSetup) return
    setIsConfirming(true)
    try {
      // Usar axios para confirmar MFA (envía cookies y CSRF header)
      const res = await api.post('/usuarios/mfa/confirmar/', { setup_id: mfaSetup.setup_id, codigo_verificacion: mfaCode })
      const json = res.data
      toast.success('MFA activado correctamente.')
      // Mostrar códigos de respaldo si vienen
      if (json?.data?.codigos_respaldo) setBackupCodes(json.data.codigos_respaldo)

      // Mostrar los códigos de respaldo y permitir al usuario avanzar manualmente
      // El botón "Ir a iniciar sesión" está disponible en la UI.
    } catch (err) {
      console.error('Confirmar MFA error', err)
      toast.error('Error al confirmar MFA')
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-4">
        {!mfaSetup && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Activar cuenta</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor="password">Contraseña</FieldLabel>
                    <Input id="password" name="password" type="password" required />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password_confirm">Confirmar contraseña</FieldLabel>
                    <Input id="password_confirm" name="password_confirm" type="password" required />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Activando...' : 'Activar cuenta'}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        )}

        {mfaSetup && !backupCodes && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Configurar MFA</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground text-center">Escanea este código con tu app de autenticación (Google Authenticator, Authy, etc.)</p>
                <Image src={mfaSetup.qr_code} alt="QR MFA" className="mx-auto" width={200} height={200} unoptimized />
                <p className="text-xs wrap-break-word">Código secreto: <strong>{mfaSetup.secret}</strong></p>
                <form onSubmit={handleConfirmMfa} className="w-full">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="mfa_code">Código de verificación</FieldLabel>
                      <Input id="mfa_code" name="mfa_code" value={mfaCode} onChange={(e) => setMfaCode(e.target.value)} required />
                    </Field>
                    <Field>
                      <Button type="submit" className="w-full" disabled={isConfirming}>{isConfirming ? 'Confirmando...' : 'Confirmar MFA'}</Button>
                    </Field>
                  </FieldGroup>
                </form>
                <p className="text-xs text-muted-foreground text-center">Al confirmar recibirás códigos de respaldo. Guarda los códigos que se muestren.</p>
            </CardContent>
          </Card>
        )}

        {backupCodes && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Códigos de respaldo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <p className="text-sm">Guarda estos códigos en un lugar seguro. Se verán solo una vez.</p>
                <ul className="list-disc pl-6">
                  {backupCodes.map((c, idx) => (
                    <li key={idx} className="font-mono">{c}</li>
                  ))}
                </ul>
                <div className="pt-2">
                  <div className="text-sm text-muted-foreground">La descarga de los códigos se iniciará automáticamente y luego serás redirigido al inicio de sesión.</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
