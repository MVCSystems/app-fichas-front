"use client"

import React from "react"
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { Main } from './main'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { SiteHeader } from '@/components/site-header'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

// Lógica de construcción de las migas de pan
function buildCrumbs(path: string | null) {
  const finalPath = path || "/";
  const parts = finalPath.split('/').filter(Boolean);
  
  // 1. Inicializa con el punto de partida (Home o Dashboard)
  let crumbs = [{ title: 'Dashboard', href: '/dashboard' }];
  let accum = '/';

  // 2. Procesa cada segmento de la URL
  parts.forEach((p) => {
    // Si el primer segmento es 'dashboard', lo omitimos para evitar la duplicidad
    if (crumbs.length === 1 && p.toLowerCase() === 'dashboard') {
        return;
    }

    // Acumula la ruta. Previene '//' si accum empieza en '/'
    accum = `${accum.endsWith('/') ? accum.slice(0, -1) : accum}/${p}`;
    
    // Capitalización simple de slugs (ej: 'admin-settings' -> 'Admin Settings')
    const title = p.split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      
    crumbs.push({ title: title, href: accum });
  });

  return crumbs;
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const pathname = usePathname()

  // 🔑 CORRECCIÓN #1: Memoizar la función para rendimiento
  // La miga de pan solo debe recalcularse cuando pathname realmente cambie.
  const crumbs = React.useMemo(() => buildCrumbs(pathname), [pathname])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <Main className="p-0 flex-1">{children}</Main>
      </SidebarInset>
    </SidebarProvider>
  )
}