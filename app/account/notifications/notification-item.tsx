'use client'

import { useTransition } from 'react'
import { Bell, BellRing } from 'lucide-react'
import { cn } from '@/lib/utils'
import { markNotificationReadAction } from '@/lib/actions/notifications'

interface NotificationData {
  id: string
  title: string
  message: string
  isRead: boolean
  createdAt: string | Date
}

export function NotificationItem({ notification }: { notification: NotificationData }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    if (notification.isRead) return
    startTransition(() => {
      markNotificationReadAction(notification.id)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors',
        notification.isRead ? 'border-border bg-card' : 'border-fire/40 bg-fire/5'
      )}
    >
      {notification.isRead ? (
        <Bell size={18} className="mt-0.5 shrink-0 text-muted-foreground" />
      ) : (
        <BellRing size={18} className="mt-0.5 shrink-0 text-fire" />
      )}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-bold">{notification.title}</p>
          {!notification.isRead && <span className="size-2 shrink-0 rounded-full bg-fire" />}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{notification.message}</p>
        <p className="mt-1.5 text-[11px] text-muted-foreground">
          {new Date(notification.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </button>
  )
}
