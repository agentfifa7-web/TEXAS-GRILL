'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface StatusSlice {
  status: string
  label: string
  count: number
}

const COLORS = ['#e5283a', '#e0983a', '#2fa768', '#7a1420', '#2b211e', '#6b6154', '#b81f2c', '#ff9d94']

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
