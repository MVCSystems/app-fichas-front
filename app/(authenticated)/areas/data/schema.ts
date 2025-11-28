import { z } from 'zod'

const areaSchema = z.object({
  id_area: z.number(),
  codigo: z.string().nullable(),
  nombre_area: z.string(),
  siglas: z.string().nullable(),
  area_padre: z.number().nullable(),
  area_padre_nombre: z.string().nullable(),
  nivel: z.number(),
  nombre_completo: z.string().optional(),
  ruta_jerarquica: z.string().optional(),
  tiene_subareas: z.boolean().optional(),
  activo: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})
export type Area = z.infer<typeof areaSchema>

export const areaListSchema = z.array(areaSchema)
