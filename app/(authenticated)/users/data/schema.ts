import { z } from 'zod'

export const empleadoSchema = z.object({
  id_empleado: z.number(),
  codigo_empleado: z.string(),
  dni: z.string(),
  nombre_completo: z.string(),
  cargo: z.string(),
  cargo_display: z.string(),
  correo: z.string().email(),
  celular: z.string().nullable(),
  activo: z.boolean(),
  tiene_acceso_sistema: z.boolean(),
  rol_sistema: z.string().nullable(),
  area: z.object({
    id_area: z.number(),
    codigo_area: z.string(),
    nombre_area: z.string(),
    nivel: z.number(),
    activo: z.boolean(),
  }).nullable(),
  usuario: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    is_active: z.boolean(),
    grupos: z.array(z.string()),
  }).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type Empleado = z.infer<typeof empleadoSchema>

export const cargoOptions = [
  { value: 'JEFE_AREA', label: 'Jefe de Area' },
  { value: 'SUBJEFE', label: 'Subjefe' },
  { value: 'SUPERVISOR', label: 'Supervisor' },
  { value: 'COORDINADOR', label: 'Coordinador' },
  { value: 'ANALISTA_SENIOR', label: 'Analista Senior' },
  { value: 'ANALISTA', label: 'Analista' },
  { value: 'ANALISTA_JUNIOR', label: 'Analista Junior' },
  { value: 'ASISTENTE', label: 'Asistente' },
  { value: 'AUXILIAR', label: 'Auxiliar' },
  { value: 'ESPECIALISTA', label: 'Especialista' },
  { value: 'TECNICO', label: 'Tecnico' },
  { value: 'OPERADOR', label: 'Operador' },
  { value: 'PRACTICANTE', label: 'Practicante' },
  { value: 'OTRO', label: 'Otro' },
] as const

export const activoOptions = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
] as const

export const accesoSistemaOptions = [
  { value: 'true', label: 'Con acceso' },
  { value: 'false', label: 'Sin acceso' },
] as const
