'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Pipe } from '@/components/StatCard'
import { Gauge, Waves, Activity, ShieldCheck } from 'lucide-react'

type SensorRatingPageProps = { pipes: Pipe[]; updateLeak: (id: Pipe['id'], value: string) => void }

export function SensorRatingPage({ pipes, updateLeak }: SensorRatingPageProps) {
  const normalCount = pipes.filter((p) => p.leak <= 20).length
  const reviewCount = pipes.filter((p) => p.leak > 20 && p.leak <= 40).length
  const alertCount = pipes.filter((p) => p.leak > 40).length
  const reliability = pipes.length ? Math.round((normalCount / pipes.length) * 100) : 100

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-4">
        <Card className="shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2"><Gauge className="text-teal-500" size={18} /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sensors online</p></div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{pipes.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2"><ShieldCheck className="text-teal-500" size={18} /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Reliability</p></div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{reliability}%</p>
            <p className="text-xs text-muted-foreground">Share of pipes within normal threshold</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2"><Activity className="text-blue-500" size={18} /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Under review</p></div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{reviewCount}</p>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center gap-2"><Waves className="text-amber-500" size={18} /><p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Alerts</p></div>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{alertCount}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Sensor readings</CardTitle>
          <CardDescription>Per-pipe flow readings, leak deficit, and status. Edit a leak rate to adjust observed flow.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipe</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Expected (L/h)</TableHead>
                <TableHead>Observed (L/h)</TableHead>
                <TableHead>Leak rate (L/h)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipes.map((pipe) => (
                <TableRow key={pipe.id}>
                  <TableCell className="font-mono text-sm font-medium">{pipe.id}</TableCell>
                  <TableCell className="text-sm">{pipe.name}</TableCell>
                  <TableCell className="text-sm">{pipe.expected.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{pipe.observed.toLocaleString()}</TableCell>
                  <TableCell>
                    <label className="flex items-center gap-1.5">
                      <input type="number" min="0" step="1" value={pipe.leak} onChange={(event) => updateLeak(pipe.id, event.target.value)} className="h-8 w-16 rounded-md border border-slate-200 bg-white px-2 text-sm font-normal text-slate-900 outline-none ring-teal-500 focus:ring-2" />
                    </label>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pipe.leak > 40 ? 'destructive' : 'secondary'}>{pipe.leak > 40 ? 'Alert' : pipe.leak > 20 ? 'Review' : 'Normal'}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
