"use client"

import { Mail, ArrowLeft } from "lucide-react"
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

export function ForgotPasswordForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email")
    
    try {
      // Aquí iría la llamada al backend para enviar el email de recuperación
      console.log("Enviando email de recuperación a:", email)
      // Mostrar mensaje de éxito
      alert("Se ha enviado un enlace de recuperación a tu email")
    } catch (error) {
      console.error("Error al enviar email:", error)
      alert("Error al enviar el email. Intenta de nuevo.")
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
              <Button type="submit" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Enviar enlace de recuperación
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
