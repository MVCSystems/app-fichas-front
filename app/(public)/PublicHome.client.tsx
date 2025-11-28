"use client"
import Link from "next/link";
import { LogIn, BarChart3 } from "lucide-react";

export default function PublicHome() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-muted to-muted/50">
      {/* Header */}
      <header className="px-6 py-8 lg:px-12 border-b">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl lg:text-3xl font-bold text-primary">OTIC Manager</h1>
          </div>
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-semibold shadow hover:bg-primary/90 transition"
          >
            <LogIn className="w-4 h-4" />
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20 lg:px-12">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4 flex flex-col items-center">
            <BarChart3 className="w-16 h-16 text-primary mb-2" />

            <h2 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight">
              Gestiona tus fichas y equipos
            </h2>
            <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Sistema integral para la administración de fichas técnicas, usuarios, áreas y equipos. Optimiza tu flujo de trabajo con herramientas modernas y confiables.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 py-8">
            <div className="p-6 bg-card rounded-lg shadow-sm border hover:shadow-md hover:border-primary/50 transition">
              <div className="text-4xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fichas Técnicas</h3>
              <p className="text-muted-foreground">Crea y gestiona fichas con facilidad</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-sm border hover:shadow-md hover:border-primary/50 transition">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Usuarios y Áreas</h3>
              <p className="text-muted-foreground">Administra equipos y permisos</p>
            </div>
            <div className="p-6 bg-card rounded-lg shadow-sm border hover:shadow-md hover:border-primary/50 transition">
              <div className="text-4xl mb-3">⚙️</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Equipos</h3>
              <p className="text-muted-foreground">Controla el inventario de equipos</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 lg:px-12 bg-card border-t">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 OTIC Manager. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
