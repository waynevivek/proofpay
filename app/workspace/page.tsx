'use client'

import Link from 'next/link'
import { ChevronRight, Plus } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import { checkList } from '@/lib/workspace-data'

export default function WorkspaceDashboard() {
  const ready = checkList.filter((c) => c.status === 'ready').length
  const issues = checkList.filter((c) => c.status === 'review').length

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
          <strong>{checkList.length}</strong>
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
          {checkList.map((c) => (
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
              <div className={`badge ${c.status === 'review' ? 'badge-amber' : 'badge-green'}`}>{c.status === 'review' ? '⚠ Review' : '✓ Ready'}</div>
              <ChevronRight className="tx-arrow" size={18} />
            </Link>
          ))}
        </div>
      </div>
    </WorkspaceShell>
  )
}
