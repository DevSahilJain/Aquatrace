'use client'

import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pipe } from '@/components/StatCard'
import { LineChart, Waves, Zap, Database } from 'lucide-react'

type LeakAnalysisPageProps = { pipes: Pipe[]; totalExpected: number; totalLoss: number }

type ChartEntry = { name: string; expected: number; observed: number; deficit: number; estimated: number }

export function LeakAnalysisPage({ pipes, totalExpected, totalLoss }: LeakAnalysisPageProps) {
  const chartData: ChartEntry[] = pipes.map((pipe) => ({ name: pipe.id, expected: pipe.expected, observed: pipe.observed, deficit: pipe.leak, estimated: pipe.leak * 0.97 }))
  const percent = ((totalLoss / totalExpected) * 100).toFixed(1)
  const critical = pipes.filter((p) => p.leak > 40)

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Leak localization</CardTitle>
            <CardDescription>Estimated leak location and severity by pipe segment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pipes.map((pipe) => (
                <div key={pipe.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white/50">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-sm">{pipe.id}</span>
                      <Badge variant={pipe.leak > 40 ? 'destructive' : pipe.leak > 20 ? 'secondary' : 'secondary'}>{pipe.leak > 40 ? 'High' : pipe.leak > 20 ? 'Medium' : 'Low'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{pipe.name} · {pipe.severity} severity · {pipe.priority}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-semibold text-slate-900">{pipe.leak.toLocaleString()} L/h</p>
                    <p className="text-[10px] text-muted-foreground">estimated leak</p>
                  </div>
                </div>
              ))}
              {critical.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No high-severity leaks localized.</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Flow deficit by segment</CardTitle>
            <CardDescription>Measured flow deficit per sensor segment</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="deficit" name="Deficit (L/h)" radius={[5, 5, 0, 0]}>{chartData.map((entry) => <Cell key={entry.name} fill={entry.deficit > 40 ? '#f59e0b' : '#2dd4bf'} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle>Analysis results</CardTitle>
            <CardDescription>Estimated aggregate leakage from the current sensor pass</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 border border-slate-200 rounded-xl p-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Total estimated leakage</p>
                <p className="text-xl font-semibold text-slate-900">{totalLoss.toLocaleString()} L/h</p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Loss share of supply</p>
                <p className="text-xl font-semibold text-slate-900">{percent}%</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Pipes flagged</p>
                <p className="text-xl font-semibold text-slate-900">{critical.length}</p>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Estimated recoverable</p>
                <p className="text-xl font-semibold text-slate-900">{(totalLoss * 0.97).toFixed(1)} L/h</p>
              </div>
            </div>
            <p className="text-xs text-teal-800/80">Results are estimates from the illustrative network model; they do not confirm real-world leaks.</p>
          </CardContent>
        </Card>

        <Card className="border-[#b8deda] bg-[#eefaf8] shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#115e59]"><Database className="text-[#115e59]" />Mathematical model</CardTitle>
            <CardDescription className="text-teal-800/70">Equations powering the FastAPI solver.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 text-sm text-teal-950 md:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-teal-100 bg-white/60 p-4 font-mono text-sm leading-8">r = q − y<br />r = Hℓ + ε<br />ℓ̂ = argmin<sub>ℓ ≥ 0</sub> ‖Hℓ − r‖²</div>
            <div className="space-y-2 leading-6">
              <p><strong>q</strong> expected flow · <strong>y</strong> observed flow · <strong>H</strong> leak-signature matrix</p>
              <p><strong>ℓ</strong> leak-rate vector · <strong>ε</strong> sensor noise · <strong>r</strong> flow residual</p>
              <p className="text-teal-800/80">Solver: <code className="rounded bg-white px-1.5 py-0.5 text-xs">scipy.optimize.nnls</code> · Units: L/s · Results are estimates, not confirmation.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
