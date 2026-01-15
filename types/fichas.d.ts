export interface TipoFicha {
  id_tipo_ficha: number
  nombre_tipo: string
  descripcion?: string
}

export interface Ficha {
  id_ficha: number
  nro_caso: number
  tipo_ficha: TipoFicha
  trabajador?: {
    id_empleado: number
    nombre_completo: string
  }
  area?: {
    id_area: number
    nombre_area: string
  }
  area_nombre?: string  // Nombre del área (actual o antigua) - desde serializer
  area_antigua?: string  // Nombre histórico para fichas migradas
  equipo?: {
    id_equipo: number
    nombre_equipo: string
  }
  equipo_codigo?: string  // Código patrimonial del equipo
  descripcion?: string
  recomendacion?: string
  fecha_registro: string
  estado: 'PENDIENTE' | 'EN_PROCESO' | 'ATENDIDO' | 'CERRADO'
  creado_por?: {
    id: number
    username: string
  }
}

export interface FichaSoporte {
  id_soporte: number
  ficha: Ficha
  nombre_ficha: string
  dependencia: string
  responsable_patrimonial?: string
  responsable_funcional?: string
  codigo_patrimonial: string
  lugar_atencion?: string
  componente?: string
  tipo_falla?: string
  descripcion_falla?: string
  recomendacion?: string
  fecha_intervencion: string
}

export interface FichaEntrega {
  id_entrega: number
  ficha: Ficha
  recibe_nombre?: string
  entrega_nombre?: string
  software: string[]
  observaciones?: string
  acta_entregada: boolean
  fecha_acta: string
}

export interface FichaCompleta extends Ficha {
  ficha_soporte?: Omit<FichaSoporte, 'ficha'>
  ficha_entrega?: Omit<FichaEntrega, 'ficha'>
}

export interface FichasResponse {
  count: number
  next: string | null
  previous: string | null
  results: Ficha[]
}
