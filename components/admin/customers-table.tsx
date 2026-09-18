'use client'

import { useMemo, useState } from 'react'
import { PillTabs } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatXOF, LOYALTY_TIER_CONFIG, type LoyaltyTier } from '@/lib/constants'

export interface AdminCustomerRow {
  id: string
  name: string
  email: string
  phone: string | null
  createdAt: string
  orderCount: number
  totalSpent: number
  points: number
  tier: string | null
  lastOrderAt: string | null
}

type Segment = 'ALL' | 'NEW' | 'ACTIVE' | 'VIP' | 'INACTIVE'

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'NEW', label: 'Nouveaux' },
  { value: 'ACTIVE', label: 'Actifs' },
  { value: 'VIP', label: 'VIP' },
  { value: 'INACTIVE', label: 'Inactifs' },
]

export function CustomersTable({ customers }: { customers: AdminCustomerRow[] }) {
  const [segment, setSegment] = useState<Segment>('ALL')

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const createdAgo = now - new Date(c.createdAt).getTime()
      const lastOrderAgo = c.lastOrderAt ? now - new Date(c.lastOrderAt).getTime() : null

      switch (segment) {
        case 'NEW':
          return createdAgo <= 30 * day
        case 'ACTIVE':
          return lastOrderAgo != null && lastOrderAgo <= 30 * day
        case 'VIP':
          return c.tier === 'GRILL_MASTER' || c.tier === 'TEXAS_LEGEND'
        case 'INACTIVE':
          return lastOrderAgo == null || lastOrderAgo > 60 * day
        default:
          return true
      }
    })
  }, [customers, segment, now, day])

  return (
    <div className="flex flex-col gap-4">
      <PillTabs options={SEGMENTS} value={segment} onChange={setSegment} />
      <p className="text-xs text-muted-foreground">{filtered.length} client(s)</p>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Commandes</TableHead>
            <TableHead>Total dépensé</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Dernière commande</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={c.name} />
                  <div>
                    <p className="font-bold">{c.name}</p>
                    {c.tier && (
                      <Badge variant={c.tier === 'TEXAS_LEGEND' || c.tier === 'GRILL_MASTER' ? 'amber' : 'outline'} className="mt-0.5">
                        {LOYALTY_TIER_CONFIG[c.tier as LoyaltyTier]?.label ?? c.tier}
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <p className="text-sm">{c.phone ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{c.email}</p>
              </TableCell>
              <TableCell>{c.orderCount}</TableCell>
              <TableCell className="price-tag">{formatXOF(c.totalSpent)}</TableCell>
              <TableCell>{c.points}</TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString('fr-FR') : 'Jamais'}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Aucun client dans ce segment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
