 'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Main } from '@/components/layout/main'
import api from '@/lib/axios'
import { UsersTable } from './components/users-table'
import { type Empleado } from './data/schema'

// Tipos locales para evitar `any`
type SearchState = Record<string, unknown>

type RawUserItem = {
  empleado?: Empleado | null
  id?: number
  username?: string
  email?: string
  nombre?: string
  apellido?: string
  user?: { is_active?: boolean; groups?: string[] } | null
  [key: string]: unknown
}

type NavigateSearch = true | SearchState | ((prev: SearchState) => SearchState | Partial<SearchState>)

export default function UsersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Convertir searchParams a objeto con tipos correctos
  const search = useMemo<SearchState>(() => {
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
      } else if (key === 'cargo' || key === 'activo' || key === 'con_acceso') {
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

      const queryParams = new URLSearchParams()
      // Paginación
      const page = (search.page as number) || 1
      const pageSize = (search.pageSize as number) || 10
      queryParams.set('page', page.toString())
      queryParams.set('page_size', pageSize.toString())

      // Búsqueda
      if (search.search) queryParams.set('search', search.search as string)

      // Filtros
      if (search.cargo && Array.isArray(search.cargo)) {
        search.cargo.forEach((c: string) => queryParams.append('cargo', c))
      }

      if (search.activo && Array.isArray(search.activo)) {
        search.activo.forEach((a: string) => queryParams.append('activo', a))
      }

      if (search.con_acceso && Array.isArray(search.con_acceso)) {
        search.con_acceso.forEach((ca: string) => queryParams.append('con_acceso', ca))
      }

      const response = await api.get(`/usuarios/list/?${queryParams.toString()}`)

      const mapped = (response.data.results || []).map((item: RawUserItem) => {
        if (item.empleado) {
          return {
            ...item.empleado,
            usuario: {
              id: (item.id as number) || 0,
              username: String(item.username ?? ''),
              email: String(item.email ?? ''),
              first_name: String(item.nombre ?? ''),
              last_name: String(item.apellido ?? ''),
              is_active: Boolean(item.user?.is_active ?? true),
              grupos: (item.user?.groups as string[]) ?? [],
            },
          } as Empleado
        }
        return item as unknown as Empleado
      })
      setEmpleados(mapped)
      setTotalCount(response.data.count || 0)
    } catch (err: unknown) {
      console.error('Error al cargar empleados:', err)
      setError('Error al cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchEmpleados()
  }, [fetchEmpleados])

  const navigate = useCallback((opts: { search: NavigateSearch; replace?: boolean }) => {
    let params = opts.search as NavigateSearch

    if (params === true) {
      params = {} as SearchState
    }

    if (typeof params === 'function') {
      params = (params as (prev: SearchState) => SearchState | Partial<SearchState>)(search) as SearchState // Ejecuta la función con el estado actual
    }
    const newParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach((v) => newParams.append(key, String(v)));
        } else {
          newParams.set(key, String(value));
        }
      }
    });
    router.push(`?${newParams.toString()}`);
  }, [router, search]);

  if (loading) {
    return (
      <Main title='Usuarios' fixed>
        <div className='flex h-full items-center justify-center'>
          <p className='text-muted-foreground'>Cargando usuarios...</p>
        </div>
      </Main>
    )
  }

  if (error) {
    return (
      <Main title='Usuarios' fixed>
        <div className='flex h-full items-center justify-center'>
          <p className='text-muted-foreground'>{error}</p>
        </div>
      </Main>
    )
  }

  return (
    <Main title='Usuarios' fixed>
      <UsersTable
        data={empleados}
        totalCount={totalCount}
        search={search}
        navigate={navigate}
      />
    </Main>
  )
}
