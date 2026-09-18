'use client'

import { useMemo, useState } from 'react'
import { Select } from '@/components/ui/select'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { ReservationStatusSelect } from '@/components/admin/reservation-status-select'
import { RESERVATION_STATUS } from '@/lib/constants'

export interface AdminReservationRow {
  id: string
  code: string
  restaurantId: string
  restaurantName: string
  name: string
  phone: string
  date: string
  time: string
  partySize: number
  status: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
  NO_SHOW: 'Non présenté',
}

export function ReservationsTable({ reservations, restaurants }: { reservations: AdminReservationRow[]; restaurants: { id: string; name: string }[] }) {
  const [restaurantId, setRestaurantId] = useState('ALL')
  const [status, setStatus] = useState('ALL')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (restaurantId !== 'ALL' && r.restaurantId !== restaurantId) return false
      if (status !== 'ALL' && r.status !== status) return false
      if (from && r.date < from) return false
      if (to && r.date > to) return false
      return true
    })
  }, [reservations, restaurantId, status, from, to])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-full sm:w-52">
          <Select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            <option value="ALL">Tous les restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-44">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Tous les statuts</option>
            {Object.values(RESERVATION_STATUS).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s] ?? s}
              </option>
            ))}
          </Select>
        </div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm" />
        <span className="text-xs text-muted-foreground">à</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 rounded-md border border-input bg-background px-3 text-sm" />
        <p className="ml-auto text-xs text-muted-foreground">{filtered.length} réservation(s)</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Date / Heure</TableHead>
            <TableHead>Couverts</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.code}</TableCell>
              <TableCell>
                <p className="font-bold">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </TableCell>
              <TableCell>{r.restaurantName}</TableCell>
              <TableCell>
                {new Date(r.date).toLocaleDateString('fr-FR')} — {r.time}
              </TableCell>
              <TableCell>{r.partySize}</TableCell>
              <TableCell>
                <ReservationStatusSelect id={r.id} status={r.status} />
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Aucune réservation ne correspond à ces filtres.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
