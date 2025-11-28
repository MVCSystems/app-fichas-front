import { create } from "zustand"

interface SessionStore {
  accessToken: string | null
  user: any | null
  isLoading: boolean
  
  setSession: (token: string, user: any) => void
  clearSession: () => void
  setLoading: (loading: boolean) => void
}

export const useSessionStore = create<SessionStore>((set) => ({
  accessToken: null,
  user: null,
  isLoading: false,

  setSession: (token: string, user: any) => {
    set({ accessToken: token, user })
    // Guardar en localStorage para persistencia
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", token)
      localStorage.setItem("user", JSON.stringify(user))
    }
  },

  clearSession: () => {
    set({ accessToken: null, user: null })
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))
