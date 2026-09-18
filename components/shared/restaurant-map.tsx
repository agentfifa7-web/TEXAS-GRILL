import { MapPin } from 'lucide-react'
import { getMapProviderConfig } from '@/lib/services/map'

/**
 * RestaurantMap — renders a real embed once NEXT_PUBLIC_MAP_PROVIDER +
 * NEXT_PUBLIC_MAP_API_KEY are configured (see lib/services/map.ts). Falls
 * back to a lightweight static representation so every page using it stays
 * fully functional without a live Maps API key.
 */
export function RestaurantMap({
  points,
}: {
  points: { label: string; lat: number; lng: number; variant?: 'restaurant' | 'destination' | 'driver' }[]
}) {
  const { provider } = getMapProviderConfig()

  if (provider !== 'STATIC') {
    // TODO(maps): render the real Google Maps / Mapbox embed here.
    return null
  }

  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)
  const minLat = Math.min(...lats) - 0.01
  const maxLat = Math.max(...lats) + 0.01
  const minLng = Math.min(...lngs) - 0.01
  const maxLng = Math.max(...lngs) + 0.01

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-xl border border-border bg-[radial-gradient(circle_at_1px_1px,var(--border)_1px,transparent_0)] [background-size:16px_16px]">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {points.length > 1 && (
          <polyline
            points={points.map((p) => `${((p.lng - minLng) / (maxLng - minLng)) * 100},${100 - ((p.lat - minLat) / (maxLat - minLat)) * 100}`).join(' ')}
            fill="none"
            stroke="var(--fire)"
            strokeWidth="0.8"
            strokeDasharray="2,2"
          />
        )}
      </svg>
      {points.map((p, i) => {
        const x = ((p.lng - minLng) / (maxLng - minLng)) * 100
        const y = 100 - ((p.lat - minLat) / (maxLat - minLat)) * 100
        return (
          <div key={i} className="absolute -translate-x-1/2 -translate-y-full" style={{ left: `${x}%`, top: `${y}%` }}>
            <div className={`grid size-8 place-items-center rounded-full text-white shadow-lg ${p.variant === 'destination' ? 'bg-ink' : 'bg-fire'}`}>
              <MapPin size={16} fill="currentColor" />
            </div>
            <p className="mt-1 whitespace-nowrap rounded bg-card px-1.5 py-0.5 text-[10px] font-bold shadow">{p.label}</p>
          </div>
        )
      })}
      <p className="absolute bottom-2 right-2 rounded bg-card/80 px-2 py-1 text-[9px] text-muted-foreground">
        Carte statique (démo) — configurez NEXT_PUBLIC_MAP_API_KEY pour la carte live
      </p>
    </div>
  )
}
