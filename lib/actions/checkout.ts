'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateCart } from '@/lib/cart-session'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations'
import { validateCoupon } from '@/lib/coupons'
import { getPaymentProvider } from '@/lib/services/payment'
import { distanceKm, estimateDeliveryMinutes } from '@/lib/services/map'
import { awardPointsForOrder } from '@/lib/loyalty'
import { sendNotification } from '@/lib/services/notifications'
import { generateOrderNumber } from '@/lib/constants'
import { computeOrderTotal } from '@/lib/pricing'
import { revalidatePath } from 'next/cache'

const BASE_DELIVERY_FEE = 1000

export async function submitCheckoutAction(input: CheckoutInput) {
  const parsed = checkoutSchema.parse(input)
  const session = await getServerSession(authOptions)
  const cart = await getOrCreateCart()

  const items = await prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: true } })
  if (items.length === 0) return { ok: false as const, error: 'Votre panier est vide' }

  const restaurant = await prisma.restaurant.findUnique({ where: { id: parsed.restaurantId } })
  if (!restaurant || restaurant.status !== 'OPEN') {
    return { ok: false as const, error: 'Ce restaurant est actuellement fermé' }
  }

  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0)

  let addressId = parsed.addressId
  let deliveryFee = 0
  let distance: number | null = null
  let etaMinutes: number | null = null

  if (parsed.orderType === 'DELIVERY') {
    if (!addressId && parsed.newAddress && session?.user?.id) {
      const created = await prisma.address.create({
        data: { userId: session.user.id, ...parsed.newAddress },
      })
      addressId = created.id
    }
    const address = addressId ? await prisma.address.findUnique({ where: { id: addressId } }) : null
    if (address?.lat && address.lng && restaurant.lat && restaurant.lng) {
      distance = Math.round(distanceKm({ lat: address.lat, lng: address.lng }, { lat: restaurant.lat, lng: restaurant.lng }) * 10) / 10
      etaMinutes = estimateDeliveryMinutes(distance)
      deliveryFee = Math.max(BASE_DELIVERY_FEE, Math.round(distance * 250))
    } else {
      deliveryFee = BASE_DELIVERY_FEE
      etaMinutes = 35
    }
  }

  const coupon = await validateCoupon(parsed.couponCode, subtotal, session?.user?.id)
  const discount = coupon.discount
  if (coupon.freeDelivery) deliveryFee = 0

  const total = computeOrderTotal(subtotal, deliveryFee, discount)

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      userId: session?.user?.id,
      restaurantId: restaurant.id,
      type: parsed.orderType,
      status: 'RECEIVED',
      tableId: parsed.tableId,
      addressId: parsed.orderType === 'DELIVERY' ? addressId : undefined,
      scheduledFor: parsed.scheduledFor ? new Date(parsed.scheduledFor) : undefined,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode: coupon.valid ? coupon.code : undefined,
      notes: parsed.notes,
      contactName: parsed.contactName,
      contactPhone: parsed.contactPhone,
      contactEmail: parsed.contactEmail || undefined,
      items: {
        create: items.map((item) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selectedOptionsJson: item.selectedOptionsJson,
          selectedAddonsJson: item.selectedAddonsJson,
          subtotal: item.subtotal,
          note: item.note,
        })),
      },
    },
  })

  if (coupon.valid) {
    await prisma.coupon.update({ where: { code: coupon.code }, data: { usedCount: { increment: 1 } } }).catch(() => null)
  }

  const paymentProvider = getPaymentProvider()
  const paymentResult = await paymentProvider.createPayment({
    orderId: order.id,
    amount: total,
    currency: 'XOF',
    method: parsed.paymentMethod,
    customerPhone: parsed.contactPhone,
    customerEmail: parsed.contactEmail || undefined,
  })

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: paymentResult.provider,
      method: parsed.paymentMethod,
      status: paymentResult.status,
      amount: total,
      transactionRef: paymentResult.transactionRef,
      rawResponseJson: JSON.stringify(paymentResult.raw ?? {}),
    },
  })

  if (parsed.orderType === 'DELIVERY') {
    await prisma.delivery.create({
      data: { orderId: order.id, status: 'PENDING', distanceKm: distance ?? undefined, estimatedMinutes: etaMinutes ?? undefined },
    })
  }

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })

  if (session?.user?.id) {
    await awardPointsForOrder(session.user.id, order.id, total)
    await sendNotification({
      userId: session.user.id,
      type: 'ORDER_RECEIVED',
      title: 'Commande reçue',
      message: `Votre commande ${order.orderNumber} a bien été reçue par ${restaurant.name}.`,
      channels: ['IN_APP', 'EMAIL'],
    })
  }

  revalidatePath('/cart')
  revalidatePath('/account/orders')
  return { ok: true as const, orderId: order.id, orderNumber: order.orderNumber }
}
