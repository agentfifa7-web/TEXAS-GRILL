'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { registerSchema, type RegisterInput } from '@/lib/validations'

export async function registerAction(input: RegisterInput) {
  const parsed = registerSchema.parse(input)

  const existing = await prisma.user.findUnique({ where: { email: parsed.email } })
  if (existing) return { ok: false as const, error: 'Un compte existe déjà avec cet email' }

  const passwordHash = await bcrypt.hash(parsed.password, 10)
  const user = await prisma.user.create({
    data: {
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone || undefined,
      passwordHash,
      role: 'CUSTOMER',
    },
  })

  await prisma.loyaltyAccount.create({
    data: { userId: user.id, referralCode: `TG-${user.id.slice(0, 6).toUpperCase()}` },
  })

  return { ok: true as const }
}
