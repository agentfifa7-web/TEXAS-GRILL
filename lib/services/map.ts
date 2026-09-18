// MapProvider abstraction — swap NEXT_PUBLIC_MAP_PROVIDER between
// "GOOGLE" and "MAPBOX" without touching page code. Both real adapters need
// an API key (MAP_API_KEY / NEXT_PUBLIC_MAP_API_KEY) that isn't available in
// this environment, so a static adapter renders a lightweight, dependency-
// free map placeholder (restaurant pin, distance line) that keeps every page
// using it fully functional. Swap the adapter body for `@vis.gl/react-google-maps`
// or `react-map-gl` once a key is issued — the component contract below is
// what real adapters should implement.

export interface LatLng {
  lat: number
  lng: number
}

export interface MapProviderConfig {
  provider: 'GOOGLE' | 'MAPBOX' | 'STATIC'
  apiKeyConfigured: boolean
}

export function getMapProviderConfig(): MapProviderConfig {
  const provider = (process.env.NEXT_PUBLIC_MAP_PROVIDER as MapProviderConfig['provider']) ?? 'STATIC'
  const apiKeyConfigured = Boolean(process.env.NEXT_PUBLIC_MAP_API_KEY)
  // TODO(maps): once NEXT_PUBLIC_MAP_API_KEY is set, swap
  // components/shared/RestaurantMap.tsx's body for the real Google Maps /
  // Mapbox GL embed. Until then we fall back to STATIC regardless of the
  // requested provider so the UI never silently pretends to be live.
  return { provider: apiKeyConfigured ? provider : 'STATIC', apiKeyConfigured }
}

/** Haversine distance in km — used for delivery ETA estimates without a live routing API. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

export function estimateDeliveryMinutes(km: number): number {
  const prepTime = 12
  const travelMinutes = (km / 28) * 60 // ~28km/h average urban delivery speed
  return Math.round(prepTime + travelMinutes)
}
