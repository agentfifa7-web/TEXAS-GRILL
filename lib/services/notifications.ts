// NotificationService — extensible across EMAIL / SMS / PUSH / WHATSAPP /
// IN_APP channels. Every call always writes an IN_APP row (via
// lib/data/notifications.ts) so the customer's account page works without
// any external provider configured. The outbound channels below are dev
// adapters that log to the server console — replace the `send()` bodies
// with real provider calls once EMAIL_PROVIDER / SMS_PROVIDER credentials
// exist (see .env.example). Never call these directly from client
// components — route through server actions / route handlers only.

import { prisma } from '@/lib/prisma'
import type { NOTIFICATION_TYPES } from '@/lib/constants'

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES]
export type NotificationChannel = 'EMAIL' | 'SMS' | 'PUSH' | 'WHATSAPP' | 'IN_APP'

export interface SendNotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  channels?: NotificationChannel[]
  metadata?: Record<string, unknown>
}

interface ChannelAdapter {
  send(to: string, title: string, message: string): Promise<void>
}

class ConsoleEmailAdapter implements ChannelAdapter {
  async send(to: string, title: string, message: string) {
    // TODO(notifications): wire EMAIL_PROVIDER (Resend/SendGrid/SES) here.
    console.info(`[email:dev-adapter] -> ${to} :: ${title} — ${message}`)
  }
}
class ConsoleSMSAdapter implements ChannelAdapter {
  async send(to: string, _title: string, message: string) {
    // TODO(notifications): wire SMS_PROVIDER (local telco aggregator / Twilio) here.
    console.info(`[sms:dev-adapter] -> ${to} :: ${message}`)
  }
}
class ConsoleWhatsAppAdapter implements ChannelAdapter {
  async send(to: string, _title: string, message: string) {
    // TODO(notifications): wire WhatsApp Business Cloud API here.
    console.info(`[whatsapp:dev-adapter] -> ${to} :: ${message}`)
  }
}
class ConsolePushAdapter implements ChannelAdapter {
  async send(to: string, title: string, message: string) {
    // TODO(notifications): wire web-push (PWA) subscriptions here.
    console.info(`[push:dev-adapter] -> ${to} :: ${title} — ${message}`)
  }
}

const adapters: Record<Exclude<NotificationChannel, 'IN_APP'>, ChannelAdapter> = {
  EMAIL: new ConsoleEmailAdapter(),
  SMS: new ConsoleSMSAdapter(),
  WHATSAPP: new ConsoleWhatsAppAdapter(),
  PUSH: new ConsolePushAdapter(),
}

export async function sendNotification(input: SendNotificationInput) {
  const channels = input.channels ?? ['IN_APP']

  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      channel: channels[0] ?? 'IN_APP',
      title: input.title,
      message: input.message,
      metadataJson: JSON.stringify(input.metadata ?? {}),
    },
  })

  const user = await prisma.user.findUnique({ where: { id: input.userId } })
  if (!user) return

  for (const channel of channels) {
    if (channel === 'IN_APP') continue
    const adapter = adapters[channel]
    const to = channel === 'EMAIL' ? user.email : user.phone
    if (adapter && to) await adapter.send(to, input.title, input.message)
  }
}
