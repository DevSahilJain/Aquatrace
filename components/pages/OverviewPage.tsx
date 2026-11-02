'use client'

import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, defs, stop, Area, linearGradient } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/StatCard'
import { Waves, Gauge, Droplets, Zap } from 'lucide-react'

type PipeId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
type Pipe = { id: PipeId; name: string; expected: number; observed: number; leak: number; severity: string; priority: string }

type OverviewPageProps = {
  pipes: Pipe[]
  totalExpected: number
  totalLoss: number
  observed: number
  percent: string
  threshold: string
  chartData: { name: string; expected: number; observed: number; deficit: number; estimated: number }[]
  hourlyData: { time: string; expected: number; observed: number }[]
}

export function OverviewPage({ pipes, totalExpected, totalLoss, observed, percent, threshold, chartData, hourlyData }: OverviewPageProps) {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Expected supply flow" value={totalExpected.toLocaleString()} unit="L/h" detail="Network baseline" icon={Waves} tone="blue" />
        <StatCard label="Observed flow" value={observed.toLocaleString()} unit="L/h" detail="Latest sensor pass" icon={Gauge} tone="teal" />
        <StatCard label="Estimated water loss" value={totalLoss.toLocaleString()} unit="L/h" detail="Across 5 monitored pipes" icon={Droplets} tone="amber" />
        <StatCard label="Estimated loss" value={percent} unit="%" detail={`Alert threshold ${threshold}%`} icon={Zap} tone="purple" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <Card className="shadow-none">
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Flow balance</CardTitle>
              <CardDescription>Expected versus observed network flow</CardDescription>
            </div>
            <Badge variant="secondary">Last 24 hours</Badge>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={hourlyData}>
                <defs>
                  <linearGradient id="expected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#149e9a" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#149e9a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Area type="monotone" dataKey="expected" stroke="#149e9a" fill="url(#expected)" strokeWidth={2} name="Expected" />
                <Area type="monotone" dataKey="observed" stroke="#2563eb" fill="none" strokeWidth={2} name="Observed" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Network status</CardTitle>
            <CardDescription>Live topology health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {pipes.map((pipe) => (
                <div key={pipe.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{pipe.id} — {pipe.name}</span>
                  <Badge variant={pipe.leak > 40 ? 'destructive' : pipe.leak > 20 ? 'secondary' : 'secondary'}>{pipe.severity}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
