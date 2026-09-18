'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { eventRequestSchema, corporateRequestSchema, type EventRequestInput, type CorporateRequestInput } from '@/lib/validations'

export async function submitEventRequestAction(input: EventRequestInput) {
  const parsed = eventRequestSchema.parse(input)
  await prisma.event.create({
    data: {
      type: parsed.type,
      date: new Date(parsed.date),
      guestCount: parsed.guestCount,
      budget: parsed.budget,
      restaurantId: parsed.restaurantId || undefined,
      message: parsed.message,
      name: parsed.name,
      phone: parsed.phone,
      email: parsed.email,
      status: 'NEW',
    },
  })
  return { ok: true as const }
}

export async function submitCorporateRequestAction(input: CorporateRequestInput) {
  const parsed = corporateRequestSchema.parse(input)
  const session = await getServerSession(authOptions)
  await prisma.corporateRequest.create({
    data: {
      companyName: parsed.companyName,
      contactName: parsed.contactName,
      phone: parsed.phone,
      email: parsed.email,
      employeeCount: parsed.employeeCount,
      deliveryFrequency: parsed.deliveryFrequency,
      budget: parsed.budget,
      message: parsed.message,
      status: 'NEW',
      userId: session?.user?.id,
    },
  })
  return { ok: true as const }
}
