"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { IconChevronRight, IconHome } from '@tabler/icons-react'

function buildCrumbs(pathname: string | null) {
  const path = pathname || '/'
  const parts = path.split('/').filter(Boolean)
  const crumbs = [{ title: 'Dashboard', href: '/dashboard' }]
  let accum = ''

  parts.forEach((p) => {
    accum += `/${p}`
    // Avoid duplicating the Dashboard crumb when path is exactly '/dashboard'
    if (p === 'dashboard') return
    // Capitalize and replace dashes
    const title = p
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    crumbs.push({ title, href: accum })
  })

  return crumbs
}

export function SiteHeader() {
  const pathname = usePathname()
  const crumbs = buildCrumbs(pathname)
  const parents = crumbs.slice(0, Math.max(0, crumbs.length - 1))
  const current = crumbs[crumbs.length - 1]

  return (
    <header className="flex h-12 mt-2 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-3 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4" />

        <div className="flex items-center gap-3">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              {parents.map((c, i) => (
                <li key={c.href} className="flex items-center gap-2">
                  {i > 0 && <IconChevronRight className="h-3 w-3 text-muted-foreground" />}
                  <Link
                    href={c.href}
                    className="hover:underline flex items-center gap-1"
                    aria-label={c.title === 'Dashboard' ? 'Inicio' : undefined}
                  >
                    {c.title === 'Dashboard' ? (
                      <>
                        <IconHome className="h-4 w-4 text-muted-foreground" aria-hidden />
                        <span className="sr-only">Inicio</span>
                      </>
                    ) : (
                      c.title
                    )}
                  </Link>
                </li>
              ))}
            </ol>
          </nav>

          <h1 className="text-base font-medium flex items-center gap-2">
            {current?.title === 'Dashboard' ? (
              <>
                <IconHome className="h-5 w-5" aria-hidden />
                <span className="sr-only">Inicio</span>
              </>
            ) : (
              current?.title || 'Dashboard'
            )}
          </h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
            <a
              href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
              rel="noopener noreferrer"
              target="_blank"
              className="dark:text-foreground"
            >
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </header>
  )
}
