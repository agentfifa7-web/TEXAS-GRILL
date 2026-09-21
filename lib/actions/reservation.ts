'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { reservationSchema, type ReservationInput } from '@/lib/validations'
import { generateReservationCode } from '@/lib/constants'
import { sendNotification } from '@/lib/services/notifications'
import { revalidatePath } from 'next/cache'

export async function submitReservationAction(input: ReservationInput) {
  const parsed = reservationSchema.parse(input)
  const session = await getServerSession()

  const reservation = await prisma.reservation.create({
    data: {
      code: generateReservationCode(),
      userId: session?.user?.id,
      restaurantId: parsed.restaurantId,
      date: new Date(parsed.date),
      time: parsed.time,
      partySize: parsed.partySize,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email || undefined,
      specialRequest: parsed.specialRequest,
      status: 'PENDING',
    },
  })

  if (session?.user?.id) {
    await sendNotification({
      userId: session.user.id,
      type: 'RESERVATION_CONFIRMED',
      title: 'Réservation reçue',
      message: `Votre demande de réservation ${reservation.code} a été transmise au restaurant.`,
      channels: ['IN_APP'],
    })
  }

  revalidatePath('/account/reservations')
  return { ok: true as const, code: reservation.code }
}
