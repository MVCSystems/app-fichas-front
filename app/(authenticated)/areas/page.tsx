'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Main } from '@/components/layout/main'
import { api } from '@/lib/axios'
import { AreasDialogs } from './components/areas-dialogs'
import { AreasPrimaryButtons } from './components/areas-primary-buttons'
import { AreasProvider } from './components/areas-provider'
import { AreasTable } from './components/areas-table'
import { type Area } from './data/schema'

export default function AreasPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [areas, setAreas] = useState<Area[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Convertir searchParams a objeto con tipos correctos
  const search = useMemo(() => {
    const params: Record<string, unknown> = {}
    
    // Obtener todas las claves únicas
    const keys = new Set<string>()
    searchParams.forEach((_, key) => keys.add(key))
    
    keys.forEach((key) => {
      const allValues = searchParams.getAll(key)
      
      if (key === 'page' || key === 'pageSize') {
        // Convertir a número
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

  const fetchAreas = useCallback(async () => {
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
      const nivel = searchParams.getAll('nivel')
      if (nivel.length > 0) {
        nivel.forEach(n => params.append('nivel', n))
      }

      const activo = searchParams.getAll('activo')
      if (activo.length > 0) {
        activo.forEach(a => params.append('activo', a))
      }

      // Búsqueda
      const nombreArea = searchParams.get('nombre_area')
      if (nombreArea) {
        params.set('search', nombreArea)
      }

      // Enviar cookies de autenticación (accessToken httpOnly + sessionid)
      const response = await api.get(`/areas/?${params.toString()}`, {
        withCredentials: true
      })
      
      // El backend puede devolver paginado o no
      if (response.data.results) {
        // Respuesta paginada de DRF
        const areasData = response.data.results
        // Ordenar jerárquicamente por código
        const areasOrdenadas = areasData.sort((a: Area, b: Area) => {
          const codigoA = a.codigo || ''
          const codigoB = b.codigo || ''
          return codigoA.localeCompare(codigoB, undefined, { numeric: true })
        })
        setAreas(areasOrdenadas)
        setTotalCount(response.data.count)
      } else {
        // Respuesta sin paginar {success: true, count: 39, data: [...]}
        const areasData = response.data.data || response.data
        // Ordenar jerárquicamente por código
        const areasOrdenadas = areasData.sort((a: Area, b: Area) => {
          const codigoA = a.codigo || ''
          const codigoB = b.codigo || ''
          return codigoA.localeCompare(codigoB, undefined, { numeric: true })
        })
        setAreas(areasOrdenadas)
        setTotalCount(response.data.count || areasData.length)
      }
      
      setError(null)
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any
      console.error('Error al cargar áreas:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      setError('Error al cargar las áreas: ' + (error.response?.data?.detail || error.message))
    } finally {
      setLoading(false)
    }
  }, [searchParams])

  useEffect(() => {
    fetchAreas()
  }, [fetchAreas, searchParams])

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
      <AreasProvider refetch={fetchAreas}>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Áreas</h2>
            <p className='text-muted-foreground'>
              Gestiona las áreas de la organización y su jerarquía.
            </p>
          </div>
          <AreasPrimaryButtons />
        </div>
        
        {loading && (
          <div className='flex items-center justify-center p-8'>
            <p className='text-muted-foreground'>Cargando áreas...</p>
          </div>
        )}
        
        {error && (
          <div className='flex items-center justify-center p-8'>
            <p className='text-red-500'>{error}</p>
          </div>
        )}
        
        {!loading && !error && (
          <AreasTable 
            data={areas} 
            totalCount={totalCount}
            search={search} 
            navigate={navigate} 
          />
        )}
        
        <AreasDialogs />
      </AreasProvider>
    </Main>
  )
}
