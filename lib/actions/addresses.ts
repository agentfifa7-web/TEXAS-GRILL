'use server'

import type { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { addressSchema } from '@/lib/validations'

export type AddressInput = z.infer<typeof addressSchema>

export async function createAddressAction(input: AddressInput) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, error: 'AUTH_REQUIRED' }

  const parsed = addressSchema.parse(input)

  if (parsed.isDefault) {
    await prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } })
  }

  await prisma.address.create({
    data: {
      userId: session.user.id,
      label: parsed.label,
      line1: parsed.line1,
      line2: parsed.line2,
      commune: parsed.commune,
      isDefault: parsed.isDefault,
    },
  })

  revalidatePath('/account/addresses')
  return { ok: true as const }
}

export async function deleteAddressAction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, error: 'AUTH_REQUIRED' }

  await prisma.address.deleteMany({ where: { id, userId: session.user.id } })
  revalidatePath('/account/addresses')
  return { ok: true as const }
}

export async function setDefaultAddressAction(id: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, error: 'AUTH_REQUIRED' }

  const address = await prisma.address.findFirst({ where: { id, userId: session.user.id } })
  if (!address) return { ok: false as const, error: 'NOT_FOUND' }

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id }, data: { isDefault: true } }),
  ])

  revalidatePath('/account/addresses')
  return { ok: true as const }
}
