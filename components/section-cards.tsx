"use client"

import { useEffect, useState } from "react"
import { IconTrendingDown, IconTrendingUp, IconLoader2 } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { api, type EstadisticasAreas, type EstadisticasEmpleados } from "@/lib/api"

interface Stats {
  areas: EstadisticasAreas
  empleados: EstadisticasEmpleados
}

export function SectionCards() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    async function fetchStats() {
      try {
        const [areasRes, empleadosRes] = await Promise.all([
          api.get('/areas/estadisticas/'),
          api.get('/empleados/estadisticas/')
        ])
        
        setStats({
          areas: areasRes.data.data,
          empleados: empleadosRes.data.data
        })
      } catch (err) {
        console.error("Error al cargar estadísticas:", err)
        setError("Error al cargar estadísticas")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  // Evitar hydration mismatch renderizando solo en el cliente
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="px-4 py-8 text-center text-sm text-muted-foreground lg:px-6">
        {error || "No se pudieron cargar las estadísticas"}
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {/* Total de Áreas */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Áreas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.areas.total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.areas.porcentaje_activas >= 80 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.areas.porcentaje_activas.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.areas.activas} activas{" "}
            {stats.areas.porcentaje_activas >= 80 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Estructura organizacional
          </div>
        </CardFooter>
      </Card>

      {/* Total de Empleados */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total de Empleados</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.empleados.total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.empleados.porcentaje_activos >= 80 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.empleados.porcentaje_activos.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.empleados.activos} empleados activos{" "}
            {stats.empleados.porcentaje_activos >= 80 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Personal de la empresa</div>
        </CardFooter>
      </Card>

      {/* Acceso al Sistema */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Acceso al Sistema</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.empleados.con_acceso_sistema}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {stats.empleados.porcentaje_con_acceso >= 50 ? (
                <IconTrendingUp />
              ) : (
                <IconTrendingDown />
              )}
              {stats.empleados.porcentaje_con_acceso.toFixed(1)}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Usuarios con acceso{" "}
            {stats.empleados.porcentaje_con_acceso >= 50 ? (
              <IconTrendingUp className="size-4" />
            ) : (
              <IconTrendingDown className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">Del total de empleados activos</div>
        </CardFooter>
      </Card>
    </div>
  )
}

