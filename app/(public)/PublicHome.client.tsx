"use client"
import Link from "next/link";
import { LogIn, BarChart3, Zap, Users, Package } from "lucide-react";

export default function PublicHome() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-background via-background to-muted/30">
      {/* Header */}
      <header className="px-6 py-6 lg:px-12 border-b border-muted/40 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-linear-to-br from-primary/20 to-primary/10 ring-1 ring-primary/30">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">OTIC Manager</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
            </div>
          </div>
          <Link
            href="/auth/sign-in"
            className="flex items-center gap-2 px-6 py-2.5 bg-linear-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/70 transition duration-200 group"
          >
            <LogIn className="w-4 h-4 group-hover:translate-x-0.5 transition" />
            Iniciar sesión
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16 lg:px-12 lg:py-24">
        <div className="max-w-5xl w-full space-y-12">
          {/* Title Section */}
          <div className="space-y-6 text-center">
            <div className="flex justify-center">
              <div className="p-4 rounded-2xl bg-linear-to-br from-primary/15 to-primary/5 ring-1 ring-primary/20 backdrop-blur-sm">
                <BarChart3 className="w-12 h-12 text-primary" />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-5xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Gestiona tus <span className="bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">fichas y equipos</span>
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Plataforma integral para la administración de fichas técnicas y equipos. Simplificamos tu flujo de trabajo con herramientas diseñadas para eficiencia.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/auth/sign-in"
                className="inline-flex items-center gap-2 px-8 py-3 bg-linear-to-r from-primary to-primary/80 text-primary-foreground rounded-lg font-semibold shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/70 transition duration-200"
              >
                Comienza ahora
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="group p-8 bg-linear-to-br from-card to-card/50 rounded-xl shadow-sm border border-muted/40 hover:border-primary/30 transition duration-200 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-blue-500/20 to-blue-500/10 text-blue-500 mb-4 group-hover:from-blue-500/30 group-hover:to-blue-500/15 transition duration-200">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Fichas Técnicas</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Crea, edita y gestiona fichas técnicas de forma sencilla y organizada</p>
            </div>
            <div className="group p-8 bg-linear-to-br from-card to-card/50 rounded-xl shadow-sm border border-muted/40 hover:border-primary/30 transition duration-200 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-purple-500/20 to-purple-500/10 text-purple-500 mb-4 group-hover:from-purple-500/30 group-hover:to-purple-500/15 transition duration-200">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Control de Usuarios</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Administra usuarios, áreas y permisos con granularidad total</p>
            </div>
            <div className="group p-8 bg-linear-to-br from-card to-card/50 rounded-xl shadow-sm border border-muted/40 hover:border-primary/30 transition duration-200 hover:shadow-md">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-linear-to-br from-amber-500/20 to-amber-500/10 text-amber-500 mb-4 group-hover:from-amber-500/30 group-hover:to-amber-500/15 transition duration-200">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Gestión de Equipos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">Control total de tu inventario y seguimiento de equipos</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 lg:px-12 bg-linear-to-r from-card to-card/50 border-t border-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 mb-8 border-b border-muted/20">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <p className="font-semibold text-foreground">OTIC Manager</p>
              </div>
              <p className="text-sm text-muted-foreground">Gestión inteligente de fichas y equipos</p>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Características</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Fichas Técnicas</li>
                <li>• Gestión de Usuarios</li>
                <li>• Control de Equipos</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-2">Acciones</p>
              <ul className="space-y-1 text-sm">
                <li><Link href="/auth/sign-in" className="text-primary hover:text-primary/80 transition">Iniciar Sesión</Link></li>
                <li><Link href="/auth/sign-up" className="text-primary hover:text-primary/80 transition">Registrarse</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} OTIC Manager. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
