import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ADMIN_ROLES } from '@/lib/constants'
import { ADMIN_NAV, can } from '@/lib/rbac'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const metadata: Metadata = {
  title: 'Administration',
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user || !(ADMIN_ROLES as string[]).includes(session.user.role)) {
    redirect('/login?callbackUrl=/admin')
  }

  const role = session.user.role
  const nav = ADMIN_NAV.filter((item) => can(role, item.permission)).map(({ label, href }) => ({ label, href }))

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr]">
        <AdminSidebar nav={nav} userName={session.user.name ?? session.user.email ?? 'Admin'} role={role} />
        <main className="min-w-0 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
