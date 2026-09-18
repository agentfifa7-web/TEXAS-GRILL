'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface StatusSlice {
  status: string
  label: string
  count: number
}

const COLORS = ['#ef4c19', '#f0a63f', '#2fa768', '#b81f2b', '#34302c', '#6b6154', '#d63c10', '#ffb27a']

export function StatusChart({ data }: { data: StatusSlice[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
          {data.map((entry, i) => (
            <Cell key={entry.status} fill={COLORS[i % COLORS.length]} stroke="var(--card)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
        <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
