import { LoginForm } from "@/components/login-form"
import Link from "next/link"

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-4">
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          ¿Olvidaste tu contraseña?{" "}
          <Link
            href="/auth/forgot-password"
            className="font-semibold text-primary hover:underline"
          >
            Recuperar
          </Link>
        </p>
      </div>
    </div>
  )
}
