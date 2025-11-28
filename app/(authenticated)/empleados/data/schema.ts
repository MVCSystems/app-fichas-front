import { z } from 'zod'

const empleadoSchema = z.object({
  id_empleado: z.number(),
  codigo_empleado: z.string(),
  dni: z.string(),
  nombre_completo: z.string(),
  cargo: z.string(),
  correo: z.string(),
  celular: z.string().nullable(),
  id_area: z.number(),
  area_nombre: z.string().nullable(),
  activo: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  // Relación con usuario
  user: z.object({
    id: z.number(),
    username: z.string(),
    email: z.string().nullable(),
  }).nullable(),
})

export type Empleado = z.infer<typeof empleadoSchema>

export const empleadoListSchema = z.array(empleadoSchema)

// Schema para formularios
export const empleadoFormSchema = z.object({
  dni: z.string().min(8, 'DNI debe tener 8 dígitos').max(8, 'DNI debe tener 8 dígitos'),
  nombre_completo: z.string().min(1, 'Nombre completo es requerido'),
  cargo: z.string().min(1, 'Cargo es requerido'),
  correo: z.string().email('Correo inválido').min(1, 'Correo es requerido'),
  celular: z.string().optional(),
  area_id: z.number().min(1, 'Área es requerida'),
  activo: z.boolean().default(true),
})

export type EmpleadoFormValues = z.infer<typeof empleadoFormSchema>

// Opciones de cargos según el backend (CARGO_CHOICES)
export const cargoOptions = [
  { label: 'Jefe de Área', value: 'JEFE_AREA' },
  { label: 'Subjefe', value: 'SUBJEFE' },
  { label: 'Supervisor', value: 'SUPERVISOR' },
  { label: 'Coordinador', value: 'COORDINADOR' },
  { label: 'Analista Senior', value: 'ANALISTA_SENIOR' },
  { label: 'Analista', value: 'ANALISTA' },
  { label: 'Analista Junior', value: 'ANALISTA_JUNIOR' },
  { label: 'Asistente', value: 'ASISTENTE' },
  { label: 'Auxiliar', value: 'AUXILIAR' },
  { label: 'Especialista', value: 'ESPECIALISTA' },
  { label: 'Técnico', value: 'TECNICO' },
  { label: 'Operador', value: 'OPERADOR' },
  { label: 'Practicante', value: 'PRACTICANTE' },
  { label: 'Otro', value: 'OTRO' },
]

export const estadoOptions = [
  { label: 'Activo', value: 'true' },
  { label: 'Inactivo', value: 'false' },
]
