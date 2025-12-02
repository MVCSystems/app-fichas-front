import { create } from "zustand"

// Tipo mínimo para el user usado en la UI. Ajustar si existe un tipo canonical en el proyecto.
export type User = {
  id: number
  username: string
  email: string
  first_name?: string | null
  last_name?: string | null
  avatar?: string | null
  is_staff?: boolean
  is_superuser?: boolean
  grupos?: string[]
}

interface SessionStore {
  accessToken: string | null
  user: User | null
  isLoading: boolean
  
  setSession: (token: string, user: User) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  accessToken: null,
  user: null,
  isLoading: false,

  setSession: (token: string, user: User) => {
    // No almacenar el token en localStorage (se usa cookie HttpOnly)
    set({ accessToken: token, user })
    if (typeof window !== "undefined") {
      // Guardar solo el user para persistencia de UI si se desea
      try {
        localStorage.setItem("user", JSON.stringify(user))
      } catch {
        // ignore
      }
    }
  },

  clearSession: () => {
    // Limpiar estado local; no intentar manipular token HttpOnly
    set({ accessToken: null, user: null })
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("user")
      } catch {
        // ignore
      }
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
