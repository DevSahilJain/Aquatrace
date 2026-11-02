'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Database, Clock, AlertTriangle } from 'lucide-react'

type HistoryEntry = { time: string; loss: number; rate: string; status: string }

type HistoryPageProps = { history: HistoryEntry[] }

export function HistoryPage({ history }: HistoryPageProps) {
  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="flex-row items-start justify-between">
          <div>
            <CardTitle>Simulation history</CardTitle>
            <CardDescription>Previous simulation results from this session</CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><Clock size={14} />Frontend memory</div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Loss (L/h)</TableHead>
                <TableHead>Loss rate</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-xs text-muted-foreground">No simulation records yet. Run a simulation from the Simulation page to add results.</TableCell>
                </TableRow>
              ) : (
                history.map((entry, index) => (
                  <TableRow key={`${entry.time}-${index}`}>
                    <TableCell className="text-sm">{entry.time}</TableCell>
                    <TableCell>{entry.loss} L/h</TableCell>
                    <TableCell>{entry.rate}</TableCell>
                    <TableCell>
                      <Badge variant={entry.status.includes('Alert') ? 'destructive' : 'secondary'}>{entry.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">Frontend (session)</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border border-slate-200/50 rounded-xl bg-slate-50 p-5 shadow-none">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-slate-400" size={16} />
          <div>
            <p className="text-sm font-semibold text-slate-900">Persistence</p>
            <p className="text-xs text-slate-600 mt-1">
              History is kept in frontend memory only for this session. No backend persistence or database is implemented, so records are cleared on refresh and no historical records are invented.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
