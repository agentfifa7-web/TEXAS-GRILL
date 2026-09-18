import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/json'

export function serializeRestaurant<
  T extends { servicesJson: string; deliveryZoneJson: string; galleryJson: string },
>(restaurant: T) {
  return {
    ...restaurant,
    services: parseJson<string[]>(restaurant.servicesJson, []),
    deliveryZones: parseJson<string[]>(restaurant.deliveryZoneJson, []),
    gallery: parseJson<string[]>(restaurant.galleryJson, []),
  }
}

export async function getRestaurants() {
  const restaurants = await prisma.restaurant.findMany({
    include: { hours: { orderBy: { dayOfWeek: 'asc' } } },
    orderBy: { name: 'asc' },
  })
  return restaurants.map(serializeRestaurant)
}

export async function getRestaurantBySlug(slug: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: { hours: { orderBy: { dayOfWeek: 'asc' } }, tables: true },
  })
  if (!restaurant) return null
  return serializeRestaurant(restaurant)
}

export async function getOpenRestaurantsForMap() {
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'OPEN' },
    select: { id: true, slug: true, name: true, address: true, lat: true, lng: true, status: true },
  })
  return restaurants
}

const DAY_LABELS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

export function formatHours(hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]) {
  return hours
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
    .map((h) => ({
      day: DAY_LABELS[h.dayOfWeek],
      label: h.isClosed ? 'Fermé' : `${h.openTime} – ${h.closeTime}`,
    }))
}

export function isOpenNow(hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]) {
  const now = new Date()
  const today = hours.find((h) => h.dayOfWeek === now.getDay())
  if (!today || today.isClosed) return false
  const [openH, openM] = today.openTime.split(':').map(Number)
  const [closeH, closeM] = today.closeTime.split(':').map(Number)
  const minutesNow = now.getHours() * 60 + now.getMinutes()
  return minutesNow >= openH * 60 + openM && minutesNow <= closeH * 60 + closeM
}
