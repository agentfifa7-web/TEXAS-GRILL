'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { reviewSchema, type ReviewInput } from '@/lib/validations'
import { revalidatePath } from 'next/cache'

export async function submitReviewAction(input: ReviewInput) {
  const parsed = reviewSchema.parse(input)
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, error: 'AUTH_REQUIRED' }

  if (parsed.orderId) {
    const order = await prisma.order.findFirst({ where: { id: parsed.orderId, userId: session.user.id, status: 'COMPLETED' } })
    if (!order) return { ok: false as const, error: 'Seules les commandes terminées peuvent être notées' }
  }

  const overallRatings = [parsed.foodRating, parsed.serviceRating, parsed.ambianceRating, parsed.deliveryRating].filter(
    (n): n is number => typeof n === 'number'
  )
  const overallRating = Math.round(overallRatings.reduce((a, b) => a + b, 0) / overallRatings.length)

  await prisma.review.create({
    data: {
      userId: session.user.id,
      orderId: parsed.orderId,
      productId: parsed.productId,
      foodRating: parsed.foodRating,
      serviceRating: parsed.serviceRating,
      ambianceRating: parsed.ambianceRating,
      deliveryRating: parsed.deliveryRating,
      overallRating,
      comment: parsed.comment,
      status: 'PENDING',
    },
  })

  revalidatePath('/account/orders')
  return { ok: true as const }
}
