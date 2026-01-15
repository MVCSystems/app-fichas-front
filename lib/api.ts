import { api } from './axios'
import type { EstadisticasAreas, EstadisticasEmpleados } from '@/types/estadisticas'
import type { 
  Ficha, 
  FichaCompleta, 
  FichaSoporte, 
  FichaEntrega, 
  FichasResponse, 
  TipoFicha 
} from '@/types/fichas'

export default api
export { api }

// Re-exportar tipos para compatibilidad
export type { 
  EstadisticasAreas, 
  EstadisticasEmpleados,
  Ficha,
  FichaCompleta,
  FichaSoporte,
  FichaEntrega,
  FichasResponse,
  TipoFicha
}

