// Pure pricing helpers shared by cart/checkout server actions and covered
// by unit tests (tests/pricing.test.ts) — kept free of 'use server'/Prisma
// so it can be imported from anywhere without side effects.

export interface PricedAddon {
  price: number
  quantity: number
}

/** Unit price after option deltas, plus quantity-scaled addons. */
export function computeItemSubtotal(unitPrice: number, quantity: number, addons: PricedAddon[]): number {
  const addonsTotal = addons.reduce((sum, a) => sum + a.price * a.quantity, 0)
  return (unitPrice + addonsTotal) * quantity
}

export function computeUnitPriceWithOptions(basePrice: number, options: { priceDelta: number }[]): number {
  return basePrice + options.reduce((sum, o) => sum + o.priceDelta, 0)
}

export function computeOrderTotal(subtotal: number, deliveryFee: number, discount: number): number {
  return Math.max(0, subtotal + deliveryFee - discount)
}
