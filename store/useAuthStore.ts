import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User, authService } from "@/lib/auth"

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          const response = await authService.login({ email, password })

          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({
              error: response.message || "Error al iniciar sesión",
              isLoading: false,
            })
          }
        } catch (err: unknown) {
          const errorMessage =
            err && typeof err === "object" && "response" in err
              ? (err as { response?: { data?: { message?: string } } })
                  .response?.data?.message || "Error al iniciar sesión"
              : "Error al iniciar sesión"

          set({
            error: errorMessage,
            isLoading: false,
          })
        }
      },

      logout: async () => {
        set({ isLoading: true })
        try {
          await authService.logout()
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (err) {
          console.error("Error al cerrar sesión:", err)
          set({ isLoading: false })
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          const user = await authService.me()
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (err) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-storage",
    }
  )
)
