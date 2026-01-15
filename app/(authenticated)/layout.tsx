import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div suppressHydrationWarning>
      <AuthenticatedLayout>{children}</AuthenticatedLayout>
    </div>
  )
}
