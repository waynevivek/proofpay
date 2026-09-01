'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { checkList } from '@/lib/workspace-data'

export default function AcceptancePacksPage() {
  return (
    <WorkspaceShell>
      <div className="eyebrow">
        <span className="eyebrow-line" /> Generated packs
      </div>
      <h1 className="page-title mt-4 text-[2.6rem]">Acceptance packs</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Each pack bundles a check&apos;s evidence, reconciliation result, and AI draft into one shareable record.
      </p>

      <div className="transaction-table mt-8">
        {checkList.map((c) => (
          <Link key={c.id} href={`/workspace/checks/${c.id}`} className="transaction-row">
            <div className="tx-id">
              {c.invoice}
              <small>Pack</small>
            </div>
            <div className="tx-buyer">
              <strong>{c.buyer}</strong>
              <small>{c.amount}</small>
            </div>
            <div className="tx-readiness">
              <span className={`readiness ${c.status === 'review' ? 'amber' : 'green'}`}>{c.status === 'review' ? '80%' : '100%'}</span>
              <small>readiness</small>
            </div>
            <div className={`badge ${c.status === 'review' ? 'badge-amber' : 'badge-green'}`}>{c.status === 'review' ? '⚠ Needs clarification' : '✓ Ready'}</div>
            <ChevronRight className="tx-arrow" size={18} />
          </Link>
        ))}
      </div>
    </WorkspaceShell>
  )
}
