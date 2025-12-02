import { z } from "zod"
import axios from "axios"

// Esquemas de validación
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es requerida"),
})

export const resetPasswordSchema = z.object({
  email: z.string().email("Email inválido"),
})

export const verifyMFASchema = z.object({
  user_id: z.number(),
  codigo: z.string().length(6, "El código debe tener 6 dígitos"),
})

export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type VerifyMFAInput = z.infer<typeof verifyMFASchema>

// Configuración de Axios
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:9001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enviar cookies HTTP-only automáticamente
})

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado, limpiar y redirigir
      if (typeof window !== "undefined") {
        window.location.href = "/auth/sign-in"
      }
    }
    return Promise.reject(error)
  }
)

// Servicios de autenticación
export const authService = {
  // Login
  login: async (credentials: LoginInput) => {
    const response = await apiClient.post("/usuarios/login/", {
      email: credentials.email,
      password: credentials.password,
    })
    return response.data
  },

  // Logout
  logout: async () => {
    await apiClient.post("/usuarios/logout/")
  },

  // Obtener datos del usuario actual
  me: async () => {
    const response = await apiClient.get("/usuarios/me/")
    return response.data
  },

  // Recuperar contraseña
  resetPassword: async (email: string) => {
    const response = await apiClient.post("/usuarios/recuperar-password/", {
      email,
    })
    return response.data
  },

  // Verificar MFA
  verifyMFA: async (userId: number, codigo: string) => {
    const response = await apiClient.post("/usuarios/verificar-mfa/", {
      user_id: userId,
      codigo_mfa: codigo,
    })
    return response.data
  },

  // Cambiar contraseña
  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post("/usuarios/cambiar-password/", {
      password_actual: currentPassword,
      password_nueva: newPassword,
    })
    return response.data
  },
}

// Tipos de usuario
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  perfil?: {
    avatar?: string
    tema: string
    idioma: string
    mfa_habilitado: boolean
    cuenta_activada: boolean
  }
}

export interface AuthResponse {
  success: boolean
  message?: string
  token?: string
  data?: {
    token: string
    user: User
  }
  requiere_mfa?: boolean
  user_id?: number
}
