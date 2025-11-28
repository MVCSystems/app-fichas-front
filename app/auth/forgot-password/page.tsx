import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <ForgotPasswordForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Recuerdas tu contraseña?{' '}
          <Link href="/auth/sign-in" className="font-semibold text-primary hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </div>
  )
}
