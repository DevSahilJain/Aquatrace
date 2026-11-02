'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Droplets } from 'lucide-react'

export type PipeId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
export type Pipe = { id: PipeId; name: string; expected: number; observed: number; leak: number; severity: string; priority: string }

export function StatCard({ label, value, unit, detail, icon: Icon, tone = 'blue' }: { label: string; value: string; unit: string; detail: string; icon: React.ElementType; tone?: 'blue' | 'teal' | 'amber' | 'purple' }) {
  const tones = { blue: 'bg-blue-50 text-blue-600', teal: 'bg-teal-50 text-teal-600', amber: 'bg-amber-50 text-amber-600', purple: 'bg-violet-50 text-violet-600' }
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-start justify-between p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}<span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span></p>
          <p className="mt-2 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`flex size-10 items-center justify-center rounded-xl ${tones[tone]}`}><Icon data-icon="inline-start" /></div>
      </CardContent>
    </Card>
  )
}

export function NetworkMap({ pipes }: { pipes: Pipe[] }) {
  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="absolute inset-x-12 top-1/2 h-1 -translate-y-1/2 rounded bg-slate-200" />
      <div className="absolute left-1/2 top-1/2 h-32 w-1 -translate-y-1/2 rounded bg-slate-200" />
      <div className="absolute left-1/2 top-[22%] h-20 w-1 -translate-x-1/2 rounded bg-slate-200" />
      <div className="absolute left-1/2 top-[78%] h-20 w-1 -translate-x-1/2 rounded bg-slate-200" />
      <div className="relative flex h-[260px] items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-[#102a43] text-xs font-semibold text-white">IN</div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Reservoir</span>
        </div>
        {pipes.map((pipe) => {
          const leaking = pipe.leak > 20
          const critical = pipe.leak > 40
          return (
            <div key={pipe.id} className="flex flex-col items-center gap-2 animate-pulse">
              <div className={`relative flex size-14 items-center justify-center rounded-full border-6 bg-white text-xs font-bold shadow-lg ${critical ? 'border-amber-500 text-amber-800' : leaking ? 'border-blue-500 text-blue-700' : 'border-teal-500 text-teal-700'}`}>
                {pipe.id}
                {critical && <span className="absolute -right-1 -top-1 size-2.5 rounded-full bg-amber-500 ring-1 ring-white" />}
              </div>
              <span className="text-[9px] font-semibold text-slate-600 leading-none">{pipe.name}</span>
              <div className="flex items-center gap-1 text-[10px]">
                <Droplets className={`${critical ? 'text-amber-600' : leaking ? 'text-blue-600' : 'text-teal-600'}`} size={10} />
                <span className={`font-medium ${critical ? 'text-amber-700' : leaking ? 'text-blue-700' : 'text-teal-700'}`}>{pipe.leak.toLocaleString()} L/h</span>
              </div>
              <Badge variant={critical ? 'destructive' : leaking ? 'secondary' : 'secondary'} className="text-[10px]">{critical ? 'LEAK' : leaking ? 'Review' : 'Normal'}</Badge>
            </div>
          )
        })}
        <div className="flex flex-col items-center gap-2">
          <div className="flex size-12 items-center justify-center rounded-full bg-teal-600 text-xs font-semibold text-white">OUT</div>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Campus</span>
        </div>
      </div>
      <div className="absolute bottom-3 left-4 flex items-center gap-4 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-teal-400" />Normal</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-blue-400" />Review</span>
        <span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" />Leaking</span>
      </div>
    </div>
  )
}
