import { NextRequest, NextResponse } from 'next/server'

// Rutas de autenticación, activación y recuperación de contraseña (públicas)
const authRoutes = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/otp',
  '/auth/activate-account',
]

// Rutas protegidas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/areas',
  '/empleados',
  '/equipos',
  '/fichas',
  '/tickets',
  '/reportes',
  '/users',
  '/settings',
]

/**
 * Middleware principal para proteger rutas.
 * - Lee la cookie `accessToken` (HTTP-only)
 * - Valida el token contra el backend llamando a `/usuarios/me/`
 * - Redirige a `/auth/sign-in` si no está autenticado
 *
 * Nota: esta middleware está escrita como `async` y usa `fetch`.
 * Asegúrate de que tu versión de Next soporta async middleware en el runtime que usas.
 */
export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Obtener token de las cookies HTTP-only (nombre configurable)
  const accessCookieName = process.env.NEXT_PUBLIC_ACCESS_TOKEN_COOKIE_NAME || 'fichas_accessToken'
  const token = req.cookies.get(accessCookieName)?.value

  // Función para validar token en backend
  async function validarToken(): Promise<boolean> {
    if (!token) return false
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9001/api'
      const res = await fetch(`${API_URL}/usuarios/me/`, {
        method: 'GET',
        headers: {
          // DRF Token auth
          Authorization: `Token ${token}`,
        },
      })
      return res.ok
    } catch (_err) {
      return false
    }
  }

  // Rutas de autenticación: si ya hay token válido, redirigir al dashboard
  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      const valid = await validarToken()
      if (valid) return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  // Raíz: permitir que Next.js maneje la ruta raíz (mostrará `app/page.tsx`)
  if (pathname === '/') {
    return NextResponse.next()
  }

  // Rutas protegidas: exigir autenticación válida
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const signInUrl = new URL('/auth/sign-in', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }

    const valid = await validarToken()
    if (!valid) {
      const signInUrl = new URL('/auth/sign-in', req.url)
      signInUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  // Permitir la solicitud continuar
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|images).*)',
  ],
}

// Export default to satisfy runtimes that expect a default export
export default proxy
