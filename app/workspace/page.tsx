'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import { ApiError, getWorkspaceChecks, type WorkspaceCheck } from '@/lib/api'

export default function WorkspaceDashboard() {
  const [checks, setChecks] = useState<WorkspaceCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getWorkspaceChecks()
      .then((loaded) => {
        if (active) setChecks(loaded)
      })
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof ApiError ? reason.message : 'Could not load transactions.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const ready = checks.filter((c) => c.status === 'ready').length
  const issues = checks.filter((c) => c.status === 'review').length

  return (
    <WorkspaceShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="page-title text-[2.6rem]">Good morning!</h1>
          <p className="mt-3 text-muted-foreground">Here&apos;s your invoice acceptance overview.</p>
        </div>
        <Link href="/workspace/checks/new">
          <Button className="w-fit rounded-full">
            <Plus data-icon="inline-start" /> New Acceptance Check
          </Button>
        </Link>
      </div>

      <div className="mt-10 grid gap-3 sm:grid-cols-3">
        <div className="metric-card">
          <span>Checks</span>
          <strong>{loading ? '—' : checks.length}</strong>
          <small>total this month</small>
        </div>
        <div className="metric-card">
          <span>Ready</span>
          <strong className="text-primary">{ready}</strong>
          <small>ready to send</small>
        </div>
        <div className="metric-card">
          <span>Issues</span>
          <strong>{issues}</strong>
          <small>need clarification</small>
        </div>
      </div>

      <div className="mt-12">
        <div className="section-kicker">Recent checks</div>
        <div className="transaction-table mt-3">
          {error && <p className="p-6 text-sm text-destructive">{error}</p>}
          {!loading && !error && checks.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No transactions yet. Load a synthetic scenario to create your first check.
            </div>
          )}
          {checks.map((c) => (
            <Link key={c.id} href={`/workspace/checks/${c.id}`} className="transaction-row">
              <div className="tx-id">
                {c.invoice}
                <small>{c.statusLabel}</small>
              </div>
              <div className="tx-buyer">
                <strong>{c.buyer}</strong>
                <small>{c.amount}</small>
              </div>
              <div className="tx-readiness">
                <span className={`readiness ${c.status === 'review' ? 'amber' : c.status === 'pending' ? 'slate' : 'green'}`}>
                  {c.readiness_score != null ? `${c.readiness_score}%` : '—'}
                </span>
                <small>readiness</small>
              </div>
              <div className={`badge ${c.status === 'review' ? 'badge-amber' : c.status === 'pending' ? 'badge-slate' : 'badge-green'}`}>
                {c.status === 'review' ? '⚠ Review' : c.status === 'pending' ? 'Pending' : '✓ Ready'}
              </div>
              <ChevronRight className="tx-arrow" size={18} />
            </Link>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  )
}
