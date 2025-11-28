export interface UserArea {
  id: number
  isActive: boolean
  assignedAt: string
  notes?: string | null
  user: {
    name: string
    email: string
    role: string
  }
  area: {
    name: string
  }
  assignedBy?: {
    name: string
  } | null
}