'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { Sidebar } from '@/components/Sidebar'
import { OverviewPage } from '@/components/pages/OverviewPage'
import { SensorRatingPage } from '@/components/pages/SensorRatingPage'
import { LeakAnalysisPage } from '@/components/pages/LeakAnalysisPage'
import { SimulationPage } from '@/components/pages/SimulationPage'
import { HistoryPage } from '@/components/pages/HistoryPage'

type PipeId = 'P1' | 'P2' | 'P3' | 'P4' | 'P5'
type Pipe = { id: PipeId; name: string; expected: number; observed: number; leak: number; severity: string; priority: string }

const defaultPipes: Pipe[] = [
  { id: 'P1', name: 'North main', expected: 2380, observed: 2372, leak: 8, severity: 'Low', priority: 'Monitor' },
  { id: 'P2', name: 'East branch', expected: 1940, observed: 1878, leak: 62, severity: 'High', priority: 'Inspect now' },
  { id: 'P3', name: 'Campus loop', expected: 1660, observed: 1634, leak: 26, severity: 'Medium', priority: 'Schedule' },
  { id: 'P4', name: 'South return', expected: 1210, observed: 1200, leak: 10, severity: 'Low', priority: 'Monitor' },
  { id: 'P5', name: 'Lab spur', expected: 890, observed: 876, leak: 14, severity: 'Low', priority: 'Monitor' },
]

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

const pageTitles: Record<string, string> = {
  Overview: 'Dashboard overview',
  'Pipe Network': 'Pipe network',
  'Sensor Rating': 'Sensor rating',
  'Leak Analysis': 'Leak analysis',
  Simulation: 'Simulation',
  History: 'History',
}

export default function Page() {
  const [active, setActive] = useState('Overview')
  const [pipes, setPipes] = useState(defaultPipes)
  const [noise, setNoise] = useState('2.5')
  const [seed, setSeed] = useState('42')
  const [threshold, setThreshold] = useState('5')
  const [status, setStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [history, setHistory] = useState([
    { time: 'Today, 10:42', loss: 120, rate: '4.7%', status: 'Alert detected' },
    { time: 'Today, 09:15', loss: 88, rate: '3.4%', status: 'Within threshold' },
    { time: 'Yesterday, 16:30', loss: 64, rate: '2.5%', status: 'Within threshold' },
  ])

  const totalExpected = pipes.reduce((sum, pipe) => sum + pipe.expected, 0)
  const totalLoss = pipes.reduce((sum, pipe) => sum + pipe.leak, 0)
  const observed = totalExpected - totalLoss
  const percent = ((totalLoss / totalExpected) * 100).toFixed(1)
  const chartData = pipes.map((pipe) => ({ name: pipe.id, expected: pipe.expected, observed: pipe.observed, deficit: pipe.leak, estimated: pipe.leak * 0.97 }))
  const hourlyData = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7].map((hour) => ({ time: `${hour * 3}:00`, expected: totalExpected + hour * 5, observed: observed - (hour % 3) * 9 })), [totalExpected, observed])

  function updateLeak(id: PipeId, value: string) {
    const numeric = Math.max(0, Number(value) || 0)
    setPipes((current) => current.map((pipe) => pipe.id === id ? { ...pipe, leak: numeric, observed: pipe.expected - numeric } : pipe))
  }

  async function runSimulation() {
    if (Number(noise) < 0 || Number(threshold) < 0 || !seed.trim()) {
      setStatus('error')
      setErrorMessage('Enter a seed and non-negative values before running.')
      return
    }
    setStatus('running')
    setErrorMessage('')

    try {
      const baseline = pipes.map((p) => p.expected / 3600)
      const observedFlows = pipes.map((p) => p.observed / 3600)
      const sensorNoise = Array(5).fill(Number(noise) / 3600)

      const response = await fetch(`${API_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseline, observed: observedFlows, sensor_noise: sensorNoise }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${response.status}`)
      }

      const data = await response.json()

      const estimatedLeaksLph = data.estimated_leak_rates.map((r: { pipe: string; estimated_rate_lps: number }) => r.estimated_rate_lps * 3600)
      const totalEstimatedLeakageLph = data.total_estimated_leakage_lps * 3600
      const percentEstimated = ((totalEstimatedLeakageLph / totalExpected) * 100).toFixed(1)

      setPipes((current) =>
        current.map((pipe, index) => ({
          ...pipe,
          leak: Math.round(estimatedLeaksLph[index] * 10) / 10,
          observed: Math.round((pipe.expected - estimatedLeaksLph[index]) * 10) / 10,
          severity: estimatedLeaksLph[index] > 40 ? 'High' : estimatedLeaksLph[index] > 20 ? 'Medium' : 'Low',
          priority: estimatedLeaksLph[index] > 40 ? 'Inspect now' : estimatedLeaksLph[index] > 20 ? 'Schedule' : 'Monitor',
        }))
      )

      setStatus('success')
      setHistory((current) => [
        {
          time: 'Just now',
          loss: Math.round(totalEstimatedLeakageLph),
          rate: `${percentEstimated}%`,
          status: totalEstimatedLeakageLph / totalExpected * 100 >= Number(threshold) ? 'Alert detected' : 'Within threshold',
        },
        ...current,
      ].slice(0, 4))
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Simulation failed. Check backend connection.')
    }
  }

  function reset() {
    setPipes(defaultPipes)
    setNoise('2.5')
    setSeed('42')
    setThreshold('5')
    setStatus('idle')
    setErrorMessage('')
  }

  function exportCsv() {
    const rows = [['Pipe', 'Expected Flow (L/h)', 'Observed Flow (L/h)', 'Deficit (L/h)', 'Estimated Leak (L/h)'], ...pipes.map((p) => [p.id, p.expected, p.observed, p.leak, (p.leak * .97).toFixed(1)])]
    const csv = rows.map((row) => row.join(',')).join('\n')
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    link.download = 'aquatrace-sensor-readings.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-900 md:flex">
      <Sidebar active={active} setActive={setActive} API_URL={API_URL} />
      <main className="min-w-0 flex-1">
        <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">University engineering demonstrator</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{pageTitles[active]}</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 border-teal-200 bg-teal-50 text-teal-700"><span className="size-1.5 rounded-full bg-teal-500" />Simulation online</Badge>
            <Button variant="outline" size="sm" onClick={exportCsv}><Download data-icon="inline-start" />Export CSV</Button>
          </div>
        </header>
        <div className="mx-auto max-w-[1480px] space-y-6 p-5 sm:p-8">
          {active === 'Overview' && <OverviewPage pipes={pipes} totalExpected={totalExpected} totalLoss={totalLoss} observed={observed} percent={percent} threshold={threshold} chartData={chartData} hourlyData={hourlyData} />}
          {active === 'Sensor Rating' && <SensorRatingPage pipes={pipes} updateLeak={updateLeak} />}
          {active === 'Leak Analysis' && <LeakAnalysisPage pipes={pipes} totalExpected={totalExpected} totalLoss={totalLoss} />}
          {active === 'Simulation' && <SimulationPage pipes={pipes} API_URL={API_URL} noise={noise} seed={seed} threshold={threshold} status={status} errorMessage={errorMessage} setNoise={setNoise} setSeed={setSeed} setThreshold={setThreshold} updateLeak={updateLeak} runSimulation={runSimulation} reset={reset} exportCsv={exportCsv} />}
          {active === 'History' && <HistoryPage history={history} />}
        </div>
      </main>
    </div>
  )
}
