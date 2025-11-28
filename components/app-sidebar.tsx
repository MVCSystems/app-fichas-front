"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
    navMain: [
    // Reordered to follow a typical setup → operations → insights → admin workflow
    { title: 'Dashboard', url: '/dashboard', icon: IconDashboard, module: 'principal', section: 'main' },
    { title: 'Áreas', url: '/areas', icon: IconListDetails, module: 'principal', section: 'main' },
    { title: 'Equipos', url: '/equipos', icon: IconDatabase, module: 'operaciones', section: 'main' },
    { title: 'Empleados', url: '/empleados', icon: IconUsers, module: 'operaciones', section: 'main' },
    { title: 'Usuarios', url: '/users', icon: IconUsers, module: 'operaciones', section: 'main' },
    { title: 'Fichas', url: '/fichas', icon: IconFileDescription, module: 'operaciones', section: 'documents' },
    { title: 'Tickets', url: '/tickets', icon: IconFileWord, module: 'informes', section: 'secondary' },
    { title: 'Reportes', url: '/reportes', icon: IconReport, module: 'informes', section: 'documents' },
    { title: 'Ajustes', url: '/settings', icon: IconSettings, module: 'administracion', section: 'secondary' },
  ],
  navClouds: [
    {
      title: "Capture",
      icon: IconCamera,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: IconFileDescription,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: IconFileAi,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "#",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ role, allowedModules, ...props }: { role?: 'admin' | 'tecnico' | 'usuario'; allowedModules?: string[] } & React.ComponentProps<typeof Sidebar>) {
  // Compute visible nav items based on allowed modules (if provided)
  const visibleNav = allowedModules && allowedModules.length > 0
    ? data.navMain.filter((i) => allowedModules.includes(i.module))
    : data.navMain

  // Explicit per-profile arrays
  const adminItems = visibleNav.filter(i => (i.section || 'main') === 'main')
  const techItems = visibleNav.filter(i => i.section === 'documents')
  const userItems = visibleNav.filter(i => i.section === 'secondary')

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Si se pasa `role`, mostramos solo la sección correspondiente para simplificar */}
        {(!role || role === 'admin') && (
          <div className="px-2 pt-2">
            <div className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-2">Administración</div>
            <NavMain items={adminItems} showQuickCreate={true} />
          </div>
        )}

        {(!role || role === 'tecnico') && (
          <div className="px-2 mt-4 border-t pt-3">
            <div className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-2">Técnicos</div>
            <NavDocuments
              items={techItems.length ? techItems.map((i: any) => ({ name: i.title, url: i.url, icon: i.icon })) : data.documents}
            />

            {/* Mostrar NavSecondary justo debajo de Técnicos para mejor orden visual */}
            <div className="mt-3">
              <div className="text-xs font-semibold uppercase text-muted-foreground px-1 mb-2">Usuarios</div>
              <NavSecondary items={userItems.length ? userItems : data.navSecondary} />
            </div>
          </div>
        )}

        {/* Las secciones Documentos y Ayuda/Ajustes se renderizan arriba dependiendo del `role` */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
