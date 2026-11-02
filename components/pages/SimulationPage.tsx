'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pipe } from '@/components/StatCard'
import { Play, RotateCcw, Download, AlertTriangle, Zap } from 'lucide-react'

type SimulationPageProps = {
  pipes: Pipe[]
  API_URL: string
  noise: string
  seed: string
  threshold: string
  status: 'idle' | 'running' | 'success' | 'error'
  errorMessage: string
  setNoise: (v: string) => void
  setSeed: (v: string) => void
  setThreshold: (v: string) => void
  updateLeak: (id: Pipe['id'], value: string) => void
  runSimulation: () => Promise<void>
  reset: () => void
  exportCsv: () => void
}

export function SimulationPage({ pipes, API_URL, noise, seed, threshold, status, errorMessage, setNoise, setSeed, setThreshold, updateLeak, runSimulation, reset, exportCsv }: SimulationPageProps) {
  const totalExpected = pipes.reduce((sum, p) => sum + p.expected, 0)
  const [localError, setLocalError] = useState('')

  return (
    <div className="space-y-6">
      <AlertBanner error={errorMessage} status={status} />

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Run simulation</CardTitle>
          <CardDescription>Configure sensor readings and run the FastAPI leak solver at <code className="rounded bg-white px-1 py-0 text-[10px]">{API_URL}</code>.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            {pipes.map((pipe) => (
              <label key={pipe.id} className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">
                {pipe.id} leak rate
                <input type="number" min="0" step="1" value={pipe.leak} onChange={(event) => updateLeak(pipe.id, event.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-900 outline-none ring-teal-500 focus:ring-2" />
              </label>
            ))}
          </div>
          <Separator />
          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">Noise σ (L/h)
              <Input type="number" min="0" step="0.1" value={noise} onChange={(e) => setNoise(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">Random seed
              <Input value={seed} onChange={(e) => setSeed(e.target.value)} />
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-slate-600">Threshold %
              <Input type="number" min="0" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={runSimulation} disabled={status === 'running'}><Play data-icon="inline-start" />{status === 'running' ? 'Running…' : 'Run simulation'}</Button>
            <Button variant="outline" onClick={reset}><RotateCcw data-icon="inline-start" />Reset</Button>
            <Button variant="ghost" onClick={exportCsv}><Download data-icon="inline-start" />Export CSV</Button>
          </div>
          <p className="text-xs text-muted-foreground">POST {API_URL}/api/simulate · Solver: scipy.optimize.nnls · Units: L/s · Results are estimates, not confirmation.</p>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Current pipe configuration</CardTitle>
          <CardDescription>Baseline and observed flows used for the simulation request.</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pipe</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Expected (L/h)</TableHead>
                <TableHead>Observed (L/h)</TableHead>
                <TableHead>Leak (L/h)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pipes.map((pipe) => (
                <TableRow key={pipe.id}>
                  <TableCell className="font-mono text-sm">{pipe.id}</TableCell>
                  <TableCell className="text-sm">{pipe.name}</TableCell>
                  <TableCell className="text-sm">{pipe.expected.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{pipe.observed.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{pipe.leak.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        {localError && <p className="text-destructive">{localError}</p>}
        <p>Baseline supply: {totalExpected.toLocaleString()} L/h across {pipes.length} monitored pipes.</p>
      </div>
    </div>
  )
}

function AlertBanner({ error, status }: { error: string; status: 'idle' | 'running' | 'success' | 'error' }) {
  if (status === 'error') {
    return (
      <div className="rounded-lg border border-destructive/20 bg-destructive/50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-destructive" size={16} />
          <div>
            <p className="text-sm font-medium text-destructive">Simulation failed</p>
            <p className="text-xs text-destructive/80 mt-1">{error || 'Check backend connection.'}</p>
          </div>
        </div>
      </div>
    )
  }
  if (status === 'success') {
    return (
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
        <div className="flex items-start gap-3">
          <Zap className="text-teal-600" size={16} />
          <div>
            <p className="text-sm font-medium text-teal-900">Simulation complete</p>
            <p className="text-xs text-teal-800/80 mt-1">Dashboard values updated from backend. History refreshed.</p>
          </div>
        </div>
      </div>
    )
  }
  return null
}
