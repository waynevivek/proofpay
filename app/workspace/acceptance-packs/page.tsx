'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { ApiError, getWorkspaceChecks, type WorkspaceCheck } from '@/lib/api'

export default function AcceptancePacksPage() {
  const [checks, setChecks] = useState<WorkspaceCheck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getWorkspaceChecks()
      .then((loaded) => {
        if (active) setChecks(loaded.filter((check) => check.status !== 'pending'))
      })
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof ApiError ? reason.message : 'Could not load acceptance packs.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <WorkspaceShell>
      <div className="eyebrow"><span className="eyebrow-line" /> Generated packs</div>
      <h1 className="page-title mt-4 text-[2.6rem]">Acceptance packs</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Each pack bundles a check&apos;s evidence, reconciliation result, and draft into one shareable record.</p>

      <div className="transaction-table mt-8">
        {loading && <p className="p-8 text-center text-sm text-muted-foreground">Loading acceptance packs…</p>}
        {error && <p className="p-6 text-sm text-destructive">{error}</p>}
        {checks.map((check) => (
          <Link key={check.id} href={`/workspace/checks/${check.id}`} className="transaction-row">
            <div className="tx-id">{check.invoice}<small>Pack</small></div>
            <div className="tx-buyer"><strong>{check.buyer}</strong><small>{check.amount}</small></div>
            <div className="tx-readiness"><span className={`readiness ${check.status === 'review' ? 'amber' : 'green'}`}>{check.readiness_score != null ? `${check.readiness_score}%` : '—'}</span><small>readiness</small></div>
            <div className={`badge ${check.status === 'review' ? 'badge-amber' : 'badge-green'}`}>{check.status === 'review' ? '⚠ Needs clarification' : '✓ Ready'}</div>
            <ChevronRight className="tx-arrow" size={18} />
          </Link>
        ))}
        {!loading && !error && checks.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No reconciled transactions yet.</p>}
      </div>
    </WorkspaceShell>
  )
}
