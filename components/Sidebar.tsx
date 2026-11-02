'use client'

import { useState } from 'react'
import { LayoutDashboard, Gauge, LineChart, Play, Database } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Droplets, Sparkles, ChevronRight } from 'lucide-react'

const navItems = [
  { label: 'Overview', icon: LayoutDashboard },
  { label: 'Sensor Rating', icon: Gauge },
  { label: 'Leak Analysis', icon: LineChart },
  { label: 'Simulation', icon: Play },
  { label: 'History', icon: Database },
]

export function Sidebar({ active, setActive, API_URL }: { active: string; setActive: (label: string) => void; API_URL: string }) {
  return (
    <aside className="w-full shrink-0 bg-[#102a43] text-slate-300 md:min-h-screen md:w-64">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex size-9 items-center justify-center rounded-xl bg-teal-400 text-[#102a43]"><Droplets data-icon="inline-start" /></div>
        <div>
          <p className="text-base font-bold tracking-tight text-white">AquaTrace</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Engineering lab</p>
        </div>
      </div>
      <Separator className="bg-white/10" />
      <nav className="flex gap-1 overflow-x-auto p-3 md:flex-col md:gap-1 md:overflow-visible" aria-label="Primary navigation">
        {navItems.map(({ label, icon: Icon }) => (
          <button key={label} onClick={() => setActive(label)} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${active === label ? 'bg-teal-400/15 text-teal-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
            <Icon data-icon="inline-start" />{label}{active === label && <ChevronRight className="ml-auto hidden md:block" />}
          </button>
        ))}
      </nav>
      <div className="mx-5 mt-5 hidden rounded-xl border border-white/10 bg-white/5 p-4 md:block">
        <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-300"><Sparkles className="text-teal-300" />Backend connected</div>
        <p className="text-xs leading-5 text-slate-400">Leak estimates from FastAPI solver at <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">{API_URL}</code>.</p>
      </div>
      <div className="mt-auto hidden p-5 md:block">
        <p className="text-[10px] uppercase tracking-widest text-slate-500">CAT-2 project</p>
        <p className="mt-1 text-xs text-slate-400">Linear Algebra + Data Foundations</p>
      </div>
    </aside>
  )
}
