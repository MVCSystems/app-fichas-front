export type TicketStatus = "PENDIENTE" | "EN_PROGRESO" | "RESUELTO" | "CERRADO";
export type TicketPriority = "BAJA" | "MEDIA" | "ALTA";
export type TicketType = "INCIDENTE" | "SOLICITUD" | "CONSULTA" | "SOPORTE";

export interface Ticket {
  id: number;
  type: TicketType; // Tipo de ticket
  title: string;  
  description?: string | null;
  status: TicketStatus;
  priority: TicketPriority;
  areaId: number;
  userId?: number | null;         // Usuario que crea el ticket
  assignedToId?: number | null;   // Técnico asignado
  createdAt: string;              // ISO date string
  updatedAt: string;              // ISO date string

  area?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;
  assignedTo?: {
    id: number;
    name?: string | null;
    email: string;
  } | null;
}