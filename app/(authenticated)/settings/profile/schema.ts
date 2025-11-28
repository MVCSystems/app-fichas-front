import { z } from 'zod'

// Schema para el perfil de usuario basado en el backend Django
const perfilUsuarioSchema = z.object({
  // Información del usuario (Django User)
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  is_active: z.boolean(),
  date_joined: z.string(),
  last_login: z.string().nullable(),
  
  // Perfil extendido
  avatar: z.string().nullable(),
  tema: z.enum(['light', 'dark', 'auto']),
  idioma: z.enum(['es', 'en']),
  
  // Notificaciones
  notificaciones_email: z.boolean(),
  notificaciones_push: z.boolean(),
  
  // Seguridad
  ultimo_acceso: z.string().nullable(),
  fecha_ultimo_cambio_password: z.string().nullable(),
  requiere_cambio_password: z.boolean(),
  
  // MFA
  mfa_habilitado: z.boolean(),
  mfa_requerido: z.boolean(),
  tiene_codigos_respaldo: z.boolean(),
  fecha_activacion_mfa: z.string().nullable(),
  
  // Activación
  cuenta_activada: z.boolean(),
  fecha_activacion: z.string().nullable(),
})

export type PerfilUsuario = z.infer<typeof perfilUsuarioSchema>

// Schema para actualizar perfil
export const actualizarPerfilSchema = z.object({
  avatar: z.string().nullable().optional(),
  tema: z.enum(['light', 'dark', 'auto']).optional(),
  idioma: z.enum(['es', 'en']).optional(),
  notificaciones_email: z.boolean().optional(),
  notificaciones_push: z.boolean().optional(),
})

export type ActualizarPerfil = z.infer<typeof actualizarPerfilSchema>

// Schema para cambiar contraseña
export const cambiarPasswordSchema = z.object({
  password_actual: z.string().min(1, 'La contraseña actual es requerida'),
  password_nueva: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_nueva_confirm: z.string().min(1, 'Confirme la nueva contraseña'),
}).refine((data) => data.password_nueva === data.password_nueva_confirm, {
  message: 'Las contraseñas no coinciden',
  path: ['password_nueva_confirm'],
})

export type CambiarPassword = z.infer<typeof cambiarPasswordSchema>

// Schema para MFA
export const activarMFASchema = z.object({
  codigo_verificacion: z.string().length(6, 'El código debe tener 6 dígitos'),
})

export type ActivarMFA = z.infer<typeof activarMFASchema>
