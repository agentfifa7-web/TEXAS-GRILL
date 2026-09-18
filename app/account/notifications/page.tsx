import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BellOff } from 'lucide-react'
import { NotificationItem } from './notification-item'

export default async function AccountNotificationsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/notifications')
  const userId = session.user.id

  const notifications = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <p className="eyebrow">Alertes</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Mes <span className="text-fire">notifications.</span>
      </h1>

      {notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <BellOff size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground">Aucune notification.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  )
}
