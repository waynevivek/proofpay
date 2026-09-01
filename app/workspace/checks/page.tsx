'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import { ApiError, getWorkspaceChecks, type WorkspaceCheck } from '@/lib/api'

const filters = ['All', 'Ready', 'Review', 'Pending'] as const

export default function ChecksListPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
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
        setError(reason instanceof ApiError ? reason.message : 'Could not load checks.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = checks.filter((check) => {
    if (filter === 'All') return true
    if (filter === 'Ready') return check.status === 'ready'
    if (filter === 'Review') return check.status === 'review'
    return check.status === 'pending'
  })

  return (
    <WorkspaceShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> Acceptance checks
          </div>
          <h1 className="page-title mt-4 text-[2.6rem]">Checks</h1>
          <p className="mt-3 text-muted-foreground">Every invoice you&apos;ve run through ProofPay.</p>
        </div>
        <Link href="/workspace/checks/new">
          <Button className="w-fit rounded-full">
            <Plus data-icon="inline-start" /> New Acceptance Check
          </Button>
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {filters.map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`req-chip ${filter === option ? 'done' : ''}`}
            style={{ borderRadius: 999 }}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="transaction-table mt-6">
        {loading && <p className="p-8 text-center text-sm text-muted-foreground">Loading checks…</p>}
        {error && <p className="p-6 text-sm text-destructive">{error}</p>}
        {filtered.map((check) => (
          <Link key={check.id} href={`/workspace/checks/${check.id}`} className="transaction-row">
            <div className="tx-id">
              {check.invoice}
              <small>{check.statusLabel}</small>
            </div>
            <div className="tx-buyer">
              <strong>{check.buyer}</strong>
              <small>{check.amount}</small>
            </div>
            <div className="tx-readiness">
              <span className={`readiness ${check.status === 'review' ? 'amber' : check.status === 'pending' ? 'slate' : 'green'}`}>
                {check.readiness_score != null ? `${check.readiness_score}%` : '—'}
              </span>
              <small>readiness</small>
            </div>
            <div className={`badge ${check.status === 'review' ? 'badge-amber' : check.status === 'pending' ? 'badge-slate' : 'badge-green'}`}>
              {check.statusLabel}
            </div>
            <ChevronRight className="tx-arrow" size={18} />
          </Link>
        ))}
        {!loading && !error && filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No checks in this filter.</p>}
      </div>
    </WorkspaceShell>
  )
}
