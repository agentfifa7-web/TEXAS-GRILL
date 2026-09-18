import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/json'

export async function getOrderById(id: string) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: true,
      address: true,
      table: true,
      items: true,
      payment: true,
      delivery: { include: { driver: true } },
    },
  })
  if (!order) return null
  return {
    ...order,
    items: order.items.map((item) => ({
      ...item,
      selectedOptions: parseJson<{ label: string }[]>(item.selectedOptionsJson, []),
      selectedAddons: parseJson<{ name: string; quantity: number }[]>(item.selectedAddonsJson, []),
    })),
  }
}
