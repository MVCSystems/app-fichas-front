"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import {
  IconDots,
  IconEdit,
  IconEye,
  IconTrash,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getPageNumbers } from "@/lib/utils"
import type { Ficha } from "@/lib/api"

interface FichasTableProps {
  data: Ficha[]
  tipo?: "soporte" | "entrega"
  onRefresh: () => void
}

const estadoColors: Record<string, string> = {
  PENDIENTE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
  EN_PROCESO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  ATENDIDO: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
  CERRADO: "bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20",
}

const estadoLabels: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En Proceso",
  ATENDIDO: "Atendido",
  CERRADO: "Cerrado",
}

export function FichasTable({ data, tipo, onRefresh }: FichasTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filtrar datos según búsqueda
  const filteredData = data.filter((ficha) => {
    const searchLower = searchTerm.toLowerCase()
    const areaNombre = ficha.area_nombre || ficha.area?.nombre_area || ficha.area_antigua || ""
    return (
      ficha.nro_caso.toString().includes(searchLower) ||
      ficha.trabajador?.nombre_completo.toLowerCase().includes(searchLower) ||
      areaNombre.toLowerCase().includes(searchLower) ||
      ficha.descripcion?.toLowerCase().includes(searchLower)
    )
  })

  // Paginación
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  // Resetear a página 1 cuando cambia la búsqueda
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  // Cambiar items por página
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
    setCurrentPage(1)
  }

  return (
    <Card>
      <div className="p-4">
        {/* Buscador y selector de items por página */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por caso, trabajador, área..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabla */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">N° Caso</TableHead>
                {!tipo && <TableHead>Tipo</TableHead>}
                <TableHead>Trabajador</TableHead>
                <TableHead>Área</TableHead>
                {tipo === "soporte" && <TableHead>Cód. Patrimonial</TableHead>}
                <TableHead className="w-[400px]">Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="w-[70px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tipo === "soporte" ? 8 : tipo ? 7 : 8}
                    className="h-24 text-center"
                  >
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <IconSearch className="h-8 w-8" />
                      <p className="text-sm">No se encontraron fichas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((ficha) => (
                  <TableRow key={ficha.id_ficha}>
                    <TableCell className="font-mono font-medium">
                      #{ficha.nro_caso}
                    </TableCell>
                    {!tipo && (
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {ficha.tipo_ficha?.nombre_tipo || "Sin tipo"}
                        </Badge>
                      </TableCell>
                    )}
                    <TableCell>
                      {ficha.trabajador?.nombre_completo || (
                        <span className="text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {ficha.area_nombre || ficha.area?.nombre_area || ficha.area_antigua || (
                        <span className="text-muted-foreground">Sin área</span>
                      )}
                      {ficha.area_antigua && (
                        <Badge variant="outline" className="ml-2 text-xs bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20">
                          Histórico
                        </Badge>
                      )}
                    </TableCell>
                    {tipo === "soporte" && (
                      <TableCell>
                        {ficha.equipo_codigo ? (
                          <span className="font-mono text-sm">{ficha.equipo_codigo}</span>
                        ) : (
                          <span className="text-muted-foreground">Sin código</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {ficha.descripcion ? (
                        <div className="max-w-[400px] truncate text-sm">
                          {ficha.descripcion}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin descripción</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estadoColors[ficha.estado]}>
                        {estadoLabels[ficha.estado]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(ficha.fecha_registro), "dd MMM yyyy", {
                        locale: es,
                      })}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <IconDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <IconEye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <IconEdit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            <IconTrash className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Paginación */}
        {filteredData.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredData.length)} de{" "}
              {filteredData.length} {filteredData.length === 1 ? "ficha" : "fichas"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <IconChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <div className="flex items-center gap-1">
                {getPageNumbers(currentPage, totalPages).map((page, index) => {
                  if (page === "...") {
                    return (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    )
                  }
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(Number(page))}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <IconChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

