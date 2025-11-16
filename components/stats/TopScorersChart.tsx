'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface TopScorersChartProps {
  data: Array<{ name: string; goals: number }>
}

export function TopScorersChart({ data }: TopScorersChartProps) {
  const chartData = data.slice(0, 10).map((item) => ({
    name: item.name.split(' ').pop() || item.name,
    goals: item.goals,
  }))

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis
            dataKey="name"
            tick={{ fill: 'hsl(225, 25%, 65%)' }}
            axisLine={{ stroke: 'hsl(240, 20%, 15%)' }}
          />
          <YAxis
            tick={{ fill: 'hsl(225, 25%, 65%)' }}
            axisLine={{ stroke: 'hsl(240, 20%, 15%)' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(240, 25%, 8%)',
              border: '1px solid hsl(240, 20%, 15%)',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#ffffff' }}
          />
          <Bar dataKey="goals" fill="hsl(43, 96%, 56%)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

