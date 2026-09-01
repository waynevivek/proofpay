'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import { checkList } from '@/lib/workspace-data'

const filters = ['All', 'Ready', 'Review'] as const

export default function ChecksListPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')

  const filtered = checkList.filter((c) => {
    if (filter === 'All') return true
    if (filter === 'Ready') return c.status === 'ready'
    return c.status === 'review'
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

      <div className="mt-9 filter-tabs">
        {filters.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-tab ${filter === f ? 'active' : ''}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="transaction-table mt-1">
        {filtered.map((c) => (
          <Link key={c.id} href={`/workspace/checks/${c.id}`} className="transaction-row">
            <div className="tx-id">
              {c.invoice}
              <small>{c.status === 'review' ? 'Review' : 'Verified'}</small>
            </div>
            <div className="tx-buyer">
              <strong>{c.buyer}</strong>
              <small>{c.amount}</small>
            </div>
            <div className="tx-readiness">
              <span className={`readiness ${c.status === 'review' ? 'amber' : 'green'}`}>{c.status === 'review' ? '80%' : '100%'}</span>
              <small>readiness</small>
            </div>
            <div className={`badge ${c.status === 'review' ? 'badge-amber' : 'badge-green'}`}>{c.statusLabel}</div>
            <ChevronRight className="tx-arrow" size={18} />
          </Link>
        ))}
        {filtered.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No checks in this filter.</p>}
      </div>
    </WorkspaceShell>
  )
}
