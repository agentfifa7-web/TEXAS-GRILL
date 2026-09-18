import { cn } from '@/lib/utils'

export function Avatar({ name, src, className }: { name: string; src?: string | null; className?: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn('size-9 rounded-full object-cover border border-border', className)} />
  }

  return (
    <div
      className={cn(
        'size-9 rounded-full grid place-items-center bg-gradient-to-br from-fire to-bbq-red text-white text-xs font-bold',
        className
      )}
    >
      {initials || '?'}
    </div>
  )
}
