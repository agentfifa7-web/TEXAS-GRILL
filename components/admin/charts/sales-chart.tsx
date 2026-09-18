'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export interface SalesPoint {
  date: string
  label: string
  total: number
}

export function SalesChart({ data }: { data: SalesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={{ stroke: 'var(--border)' }} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} width={40} />
        <Tooltip
          formatter={(value: number) => [`${new Intl.NumberFormat('fr-FR').format(value)} FCFA`, 'Ventes']}
          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
        />
        <Line type="monotone" dataKey="total" stroke="#ef4c19" strokeWidth={2.5} dot={{ r: 3, fill: '#ef4c19' }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
