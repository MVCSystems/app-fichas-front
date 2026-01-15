"use client"

import { useEffect, useState } from "react"
import { IconPlus, IconLoader2 } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { api, type Ficha } from "@/lib/api"
import { FichasTable } from "@/components/fichas/fichas-table"
import { FichaSoporteForm } from "@/components/fichas/ficha-soporte-form"

export default function FichasPage() {
  const [allFichas, setAllFichas] = useState<Ficha[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todas")
  const [showFormSoporte, setShowFormSoporte] = useState(false)

  useEffect(() => {
    loadFichas()
  }, [])

  async function loadFichas() {
    try {
      setLoading(true)
      
      // Cargar todas las páginas
      let allData: Ficha[] = []
      let page = 1
      let hasMore = true
      
      while (hasMore) {
        const { data } = await api.get('/fichas/', {
          params: { page_size: 100, page }
        })
        
        allData = [...allData, ...data.results]
        hasMore = data.next !== null
        page++
      }
      
      // Filtrar fichas válidas con tipo_ficha definido
      const fichasValidas = allData.filter((f) => f.tipo_ficha && f.tipo_ficha.nombre_tipo)
      setAllFichas(fichasValidas)
      
      console.log(`Fichas cargadas: ${fichasValidas.length}`)
    } catch (error) {
      console.error("Error al cargar fichas:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar por tipo de ficha
  const fichasSoporte = allFichas.filter(
    (f) => f.tipo_ficha?.nombre_tipo === "Soporte Técnico"
  )
  const fichasEntrega = allFichas.filter(
    (f) => f.tipo_ficha?.nombre_tipo === "Entrega/Recepción"
  )

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestión de Fichas</h1>
          <p className="text-sm text-muted-foreground">
            Administra las fichas de soporte técnico y entrega de equipos
          </p>
        </div>
        <Button onClick={() => setShowFormSoporte(true)}>
          <IconPlus className="mr-2 h-4 w-4" />
          Nueva Ficha
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="todas">
            Todas ({allFichas.length})
          </TabsTrigger>
          <TabsTrigger value="soporte">
            Soporte Técnico ({fichasSoporte.length})
          </TabsTrigger>
          <TabsTrigger value="entrega">
            Entrega/Recepción ({fichasEntrega.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todas" className="mt-4">
          <FichasTable data={allFichas} onRefresh={loadFichas} />
        </TabsContent>

        <TabsContent value="soporte" className="mt-4">
          <FichasTable data={fichasSoporte} tipo="soporte" onRefresh={loadFichas} />
        </TabsContent>

        <TabsContent value="entrega" className="mt-4">
          <FichasTable data={fichasEntrega} tipo="entrega" onRefresh={loadFichas} />
        </TabsContent>
      </Tabs>

      {/* Formulario de Ficha de Soporte */}
      <FichaSoporteForm
        open={showFormSoporte}
        onOpenChange={setShowFormSoporte}
        onSuccess={loadFichas}
      />
    </div>
  )
}
