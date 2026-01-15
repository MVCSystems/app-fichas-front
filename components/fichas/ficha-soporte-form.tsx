"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { IconLoader2, IconX } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api"

// Tipos para las opciones
interface TipoFicha {
  id_tipo_ficha: number
  nombre_tipo: string
}

interface Empleado {
  id_empleado: number
  nombre_completo: string
}

interface Area {
  id_area: number
  nombre_area: string
}

// Schema de validación
const fichaSoporteSchema = z.object({
  // Ficha principal
  nro_caso: z.number().int().positive("El número de caso debe ser positivo"),
  tipo_ficha_id: z.number().int().positive("Seleccione un tipo de ficha"),
  trabajador_id: z.number().int().positive("Seleccione un trabajador").optional().nullable(),
  area_id: z.number().int().positive("Seleccione un área").optional().nullable(),
  descripcion: z.string().min(1, "La descripción es requerida"),
  recomendacion: z.string().optional(),
  estado: z.enum(["PENDIENTE", "EN_PROCESO", "ATENDIDO", "CERRADO"]),
  
  // FichaSoporte específico
  nombre_ficha: z.string().min(1, "El nombre de la ficha es requerido"),
  dependencia: z.string().min(1, "La dependencia es requerida"),
  responsable_patrimonial: z.string().optional(),
  responsable_funcional: z.string().optional(),
  codigo_patrimonial: z.string().min(1, "El código patrimonial es requerido"),
  lugar_atencion: z.string().optional(),
  componente: z.string().optional(),
  tipo_falla: z.string().optional(),
  descripcion_falla: z.string().optional(),
  recomendacion_soporte: z.string().optional(),
})

type FichaSoporteFormData = z.infer<typeof fichaSoporteSchema>

interface FichaSoporteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  fichaId?: number
}

export function FichaSoporteForm({
  open,
  onOpenChange,
  onSuccess,
  fichaId,
}: FichaSoporteFormProps) {
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [tiposFicha, setTiposFicha] = useState<TipoFicha[]>([])
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [areas, setAreas] = useState<Area[]>([])

  const isEdit = !!fichaId

  const form = useForm<FichaSoporteFormData>({
    resolver: zodResolver(fichaSoporteSchema),
    defaultValues: {
      nro_caso: 0,
      tipo_ficha_id: 0,
      trabajador_id: null,
      area_id: null,
      descripcion: "",
      recomendacion: "",
      estado: "PENDIENTE",
      nombre_ficha: "",
      dependencia: "",
      responsable_patrimonial: "",
      responsable_funcional: "",
      codigo_patrimonial: "",
      lugar_atencion: "",
      componente: "",
      tipo_falla: "",
      descripcion_falla: "",
      recomendacion_soporte: "",
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  // Cargar ficha para edición
  useEffect(() => {
    if (open && isEdit) {
      loadFichaData()
    }
  }, [open, isEdit, fichaId])

  async function loadInitialData() {
    try {
      setLoadingData(true)
      
      const [tiposRes, empleadosRes, areasRes] = await Promise.all([
        api.get('/fichas/tipos-ficha/'),
        api.get('/empleados/'),
        api.get('/areas/')
      ])

      setTiposFicha(tiposRes.data.data || tiposRes.data.results || tiposRes.data)
      setEmpleados(empleadosRes.data.data || empleadosRes.data.results || empleadosRes.data)
      setAreas(areasRes.data.data || areasRes.data.results || areasRes.data)

      // Si es nuevo, buscar el tipo "Soporte Técnico" y asignarlo por defecto
      if (!isEdit) {
        const tipoSoporte = (tiposRes.data.data || tiposRes.data.results || tiposRes.data).find(
          (t: TipoFicha) => t.nombre_tipo === "Soporte Técnico"
        )
        if (tipoSoporte) {
          form.setValue('tipo_ficha_id', tipoSoporte.id_tipo_ficha)
        }

        // Generar número de caso automático
        const fichasRes = await api.get('/fichas/')
        const maxCaso = Math.max(
          0,
          ...(fichasRes.data.results || []).map((f: any) => f.nro_caso || 0)
        )
        form.setValue('nro_caso', maxCaso + 1)
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error)
    } finally {
      setLoadingData(false)
    }
  }

  async function loadFichaData() {
    try {
      setLoadingData(true)
      const { data } = await api.get(`/fichas/${fichaId}/`)
      const ficha = data.data || data

      // Cargar datos de la ficha principal
      form.setValue('nro_caso', ficha.nro_caso)
      form.setValue('tipo_ficha_id', ficha.tipo_ficha.id_tipo_ficha)
      form.setValue('trabajador_id', ficha.trabajador?.id_empleado || null)
      form.setValue('area_id', ficha.area?.id_area || null)
      form.setValue('descripcion', ficha.descripcion || "")
      form.setValue('recomendacion', ficha.recomendacion || "")
      form.setValue('estado', ficha.estado)

      // Cargar datos de FichaSoporte
      if (ficha.ficha_soporte) {
        const soporte = ficha.ficha_soporte
        form.setValue('nombre_ficha', soporte.nombre_ficha || "")
        form.setValue('dependencia', soporte.dependencia || "")
        form.setValue('responsable_patrimonial', soporte.responsable_patrimonial || "")
        form.setValue('responsable_funcional', soporte.responsable_funcional || "")
        form.setValue('codigo_patrimonial', soporte.codigo_patrimonial || "")
        form.setValue('lugar_atencion', soporte.lugar_atencion || "")
        form.setValue('componente', soporte.componente || "")
        form.setValue('tipo_falla', soporte.tipo_falla || "")
        form.setValue('descripcion_falla', soporte.descripcion_falla || "")
        form.setValue('recomendacion_soporte', soporte.recomendacion || "")
      }
    } catch (error) {
      console.error("Error cargando ficha:", error)
    } finally {
      setLoadingData(false)
    }
  }

  async function onSubmit(data: FichaSoporteFormData) {
    try {
      setLoading(true)

      // Preparar datos de la ficha principal
      const fichaData = {
        nro_caso: data.nro_caso,
        tipo_ficha_id: data.tipo_ficha_id,
        trabajador_id: data.trabajador_id,
        area_id: data.area_id,
        descripcion: data.descripcion,
        recomendacion: data.recomendacion,
        estado: data.estado,
      }

      let fichaId: number

      if (isEdit) {
        // Actualizar ficha existente
        const fichaRes = await api.put(`/fichas/${fichaId}/`, fichaData)
        fichaId = (fichaRes.data.data || fichaRes.data).id_ficha
      } else {
        // Crear nueva ficha
        const fichaRes = await api.post('/fichas/', fichaData)
        fichaId = (fichaRes.data.data || fichaRes.data).id_ficha
      }

      // Preparar datos de FichaSoporte
      const soporteData = {
        ficha_id: fichaId,
        nombre_ficha: data.nombre_ficha,
        dependencia: data.dependencia,
        responsable_patrimonial: data.responsable_patrimonial,
        responsable_funcional: data.responsable_funcional,
        codigo_patrimonial: data.codigo_patrimonial,
        lugar_atencion: data.lugar_atencion,
        componente: data.componente,
        tipo_falla: data.tipo_falla,
        descripcion_falla: data.descripcion_falla,
        recomendacion: data.recomendacion_soporte,
      }

      if (isEdit) {
        // Actualizar FichaSoporte existente
        const soporteExistente = await api.get(`/fichas/${fichaId}/`)
        const idSoporte = (soporteExistente.data.data || soporteExistente.data).ficha_soporte?.id_soporte
        
        if (idSoporte) {
          await api.put(`/fichas/fichas-soporte/${idSoporte}/`, soporteData)
        } else {
          await api.post('/fichas/fichas-soporte/', soporteData)
        }
      } else {
        // Crear nuevo FichaSoporte
        await api.post('/fichas/fichas-soporte/', soporteData)
      }

      onSuccess()
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error("Error guardando ficha:", error)
      alert(error.response?.data?.message || "Error al guardar la ficha")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar" : "Nueva"} Ficha de Soporte Técnico
          </DialogTitle>
          <DialogDescription>
            Complete la información de la ficha de soporte técnico
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="flex items-center justify-center py-8">
            <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Información General */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Información General</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nro_caso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Caso</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            disabled={isEdit}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_ficha_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Ficha</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {tiposFicha.map((tipo) => (
                              <SelectItem
                                key={tipo.id_tipo_ficha}
                                value={tipo.id_tipo_ficha.toString()}
                              >
                                {tipo.nombre_tipo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="trabajador_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trabajador Asignado</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione trabajador" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {empleados.map((emp) => (
                              <SelectItem
                                key={emp.id_empleado}
                                value={emp.id_empleado.toString()}
                              >
                                {emp.nombre_completo}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="area_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Área</FormLabel>
                        <Select
                          value={field.value?.toString() || ""}
                          onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione área" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {areas.map((area) => (
                              <SelectItem
                                key={area.id_area}
                                value={area.id_area.toString()}
                              >
                                {area.nombre_area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                          <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                          <SelectItem value="ATENDIDO">Atendido</SelectItem>
                          <SelectItem value="CERRADO">Cerrado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Información de Soporte */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Información de Soporte</h3>

                <FormField
                  control={form.control}
                  name="nombre_ficha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre de la Ficha</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Título o nombre del formato de soporte" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dependencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dependencia</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Área o dependencia solicitante" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="codigo_patrimonial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Patrimonial</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Código del bien o equipo" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="responsable_patrimonial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable Patrimonial</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="responsable_funcional"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsable Funcional</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="componente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Componente</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione componente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="CPU">CPU / Torre</SelectItem>
                            <SelectItem value="MONITOR">Monitor</SelectItem>
                            <SelectItem value="TECLADO">Teclado</SelectItem>
                            <SelectItem value="MOUSE">Mouse</SelectItem>
                            <SelectItem value="IMPRESORA">Impresora</SelectItem>
                            <SelectItem value="MULTIFUNCIONAL">Multifuncional</SelectItem>
                            <SelectItem value="RED">Conexión de Red</SelectItem>
                            <SelectItem value="SOFTWARE">Software</SelectItem>
                            <SelectItem value="SISTEMA">Sistema Operativo</SelectItem>
                            <SelectItem value="OTRO">Otro Componente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tipo_falla"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Falla</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione tipo de falla" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="HARDWARE">Falla de Hardware</SelectItem>
                            <SelectItem value="SOFTWARE">Falla de Software</SelectItem>
                            <SelectItem value="RED">Problema de Red</SelectItem>
                            <SelectItem value="CONFIGURACION">Problema de Configuración</SelectItem>
                            <SelectItem value="MANTENIMIENTO">Mantenimiento Preventivo</SelectItem>
                            <SelectItem value="OTRO">Otro Tipo de Falla</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="lugar_atencion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lugar de Atención</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ubicación donde se realizó la atención" />
                      </FormControl>
                      <FormDescription>
                        Ej: OTIC, área técnica, oficina del usuario
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcion_falla"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción de la Falla</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Detalle específico del problema encontrado" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recomendacion_soporte"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recomendación Técnica</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Observaciones o sugerencias técnicas" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEdit ? "Actualizar" : "Crear"} Ficha
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
