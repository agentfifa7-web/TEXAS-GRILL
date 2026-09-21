import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { AccountSidebar } from '@/components/shared/account-sidebar'

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession()
  // proxy.ts already guarantees a session on /account/*, but redirect gracefully
  // in case this layout is ever reached without one (e.g. an expired token).
  if (!session?.user?.id) redirect('/login?callbackUrl=/account')

  const userName = session.user.name ?? session.user.email ?? 'Client'

  return (
    <div className="container-grill section-py grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
      <AccountSidebar userName={userName} />
      <div>{children}</div>
    </div>
  )
}
