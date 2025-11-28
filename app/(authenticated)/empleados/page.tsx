 'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Main } from '@/components/layout/main'
import api from '@/lib/axios'
import { EmpleadosDialogs } from './components/empleados-dialogs'
import { EmpleadosPrimaryButtons } from './components/empleados-primary-buttons'
import { EmpleadosProvider } from './components/empleados-provider'
import { EmpleadosTable } from './components/empleados-table'
import { type Empleado } from './data/schema'

export default function EmpleadosPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [Empleados, setEmpleados] = useState<Empleado[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Convertir searchParams a objeto con tipos correctos
  const search = useMemo(() => {
    const params: Record<string, unknown> = {}
    
    // Obtener todas las claves Ãºnicas
    const keys = new Set<string>()
    searchParams.forEach((_, key) => keys.add(key))
    
    keys.forEach((key) => {
      const allValues = searchParams.getAll(key)
      
      if (key === 'page' || key === 'pageSize') {
        // Convertir a nÃºmero
        const num = parseInt(allValues[0], 10)
        if (!isNaN(num)) {
          params[key] = num
        }
      } else if (key === 'nivel' || key === 'activo') {
        // Para filtros, siempre devolver como array
        params[key] = allValues
      } else {
        // Para otros campos, usar el primer valor
        params[key] = allValues[0]
      }
    })
    
    return params
  }, [searchParams])

  const fetchEmpleados = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Construir parámetros de consulta
      const params = new URLSearchParams()

      // Paginación
      const page = searchParams.get('page') || '1'
      const pageSize = searchParams.get('pageSize') || '10'
      params.set('page', page)
      params.set('page_size', pageSize)

      // Filtros
      const cargo = searchParams.getAll('cargo')
      if (cargo.length > 0) cargo.forEach((c) => params.append('cargo', c))

      const activo = searchParams.getAll('activo')
      if (activo.length > 0) activo.forEach((a) => params.append('activo', a))

      // Búsqueda
      const nombreEmpleado = searchParams.get('nombre_completo')
      if (nombreEmpleado) params.set('search', nombreEmpleado)

      const response = await api.get(`/empleados/?${params.toString()}`)

      // El backend puede devolver paginado o no
      if (response.data.results) {
        const EmpleadosData = response.data.results
        const EmpleadosOrdenadas = EmpleadosData.sort((a: Empleado, b: Empleado) => {
          const codigoA = a.codigo_empleado || ''
          const codigoB = b.codigo_empleado || ''
          return codigoA.localeCompare(codigoB, undefined, { numeric: true })
        })
        setEmpleados(EmpleadosOrdenadas)
        setTotalCount(response.data.count)
      } else {
        const EmpleadosData = response.data.data || response.data
        const EmpleadosOrdenadas = EmpleadosData.sort((a: Empleado, b: Empleado) => {
          const codigoA = a.codigo_empleado || ''
          const codigoB = b.codigo_empleado || ''
          return codigoA.localeCompare(codigoB, undefined, { numeric: true })
        })
        setEmpleados(EmpleadosOrdenadas)
        setTotalCount(response.data.count || EmpleadosData.length)
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      console.error('Error al cargar empleados:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setError('Error al cargar los empleados: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchEmpleados()
  }, [fetchEmpleados, searchParams])

  const navigate = useCallback(
    (opts: { search: true | Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>) }) => {
      const currentParams = Object.fromEntries(searchParams.entries())
      
      let updates: Record<string, unknown>
      if (typeof opts.search === 'function') {
        updates = opts.search(currentParams)
      } else if (opts.search === true) {
        updates = currentParams
      } else {
        updates = opts.search
      }

      const params = new URLSearchParams()
      
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach((v) => params.append(key, String(v)))
          } else {
            params.set(key, String(value))
          }
        }
      })
      
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  return (
    <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
      <EmpleadosProvider refetch={fetchEmpleados}>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Empleados</h2>
            <p className='text-muted-foreground'>
              Gestiona los empleados de la organización.
            </p>
          </div>
          <EmpleadosPrimaryButtons />
        </div>
        
        {loading && (
          <div className='flex items-center justify-center p-8'>
            <p className='text-muted-foreground'>Cargando empleados...</p>
          </div>
        )}
        
        {error && (
          <div className='flex items-center justify-center p-8'>
            <p className='text-red-500'>{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <EmpleadosTable 
            data={Empleados} 
            totalCount={totalCount}
            search={search} 
            navigate={navigate} 
          />
        )}
        
        <EmpleadosDialogs />
      </EmpleadosProvider>
    </Main>
  )
}

