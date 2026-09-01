'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Check,
  Copy,
  FileCheck2,
  MessageSquareText,
  Pencil,
  Sparkles,
  X,
} from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import { getCheckDetail } from '@/lib/workspace-data'

type Action = 'idle' | 'held' | 'sent'

const severityLabel: Record<string, string> = { high: 'HIGH', medium: 'MEDIUM', none: 'NONE' }

export default function CheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const check = getCheckDetail(id)
  const [action, setAction] = useState<Action>('idle')
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(check.aiDraft)
  const [copied, setCopied] = useState(false)

  const hasIssues = check.status === 'review' && action !== 'sent'

  return (
    <WorkspaceShell>
      <Link href="/workspace/checks" className="back-link">
        ← Back to checks
      </Link>

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> Acceptance check
          </div>
          <h1 className="page-title mt-3 text-[2.3rem]">{check.invoice}</h1>
          <p className="mt-2 text-muted-foreground">{check.buyer}</p>
        </div>
        <span className={`badge ${action === 'held' ? 'badge-slate' : action === 'sent' ? 'badge-green' : hasIssues ? 'badge-amber' : 'badge-green'}`}>
          {action === 'held' ? 'Held for clarification' : action === 'sent' ? 'Sent to buyer' : hasIssues ? '⚠ Needs clarification' : '✓ Ready to send'}
        </span>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          {/* AI Reconciliation */}
          <section>
            <div className="section-kicker">AI reconciliation</div>
            <div className="recon-grid mt-3">
              {check.recon.map((r) => (
                <div key={r.label} className={`recon-card ${r.state !== 'ok' ? r.state : ''}`}>
                  <span className="label">{r.label}</span>
                  <div className="recon-value-row">
                    <span className="recon-value">{r.value}</span>
                    <span className={`recon-status ${r.state}`}>
                      {r.state === 'ok' && <Check size={13} />}
                      {r.state === 'warn' && <AlertTriangle size={12} />}
                      {r.state === 'bad' && <X size={13} />}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {hasIssues && (
              <div className="mt-4 finding finding-warn">
                <div className="finding-top">
                  <span className="finding-icon">!</span>
                  <strong>Mismatch detected</strong>
                </div>
                <p>
                  {check.invoiced} invoiced ≠ {check.accepted} accepted — {check.invoiced - check.accepted} units require clarification.
                </p>
              </div>
            )}
          </section>

          {/* Risk breakdown */}
          {check.status === 'review' && (
            <section>
              <div className="section-kicker">Risk breakdown</div>
              <div className="mt-3 border border-border bg-[#fffefa] px-4">
                {check.risks.map((r) => (
                  <div key={r.label} className="risk-row">
                    <span>{r.label}</span>
                    <span className={`sev-badge sev-${r.severity}`}>{severityLabel[r.severity]}</span>
                  </div>
                ))}
              </div>
              <div className="sample-note mt-4">
                <Sparkles size={16} />
                <span>
                  <strong>AI recommendation.</strong> {check.recommendation}
                </span>
              </div>
            </section>
          )}

          {/* Evidence */}
          <section>
            <div className="section-kicker">Evidence</div>
            <div className="mt-3 flex flex-col gap-2">
              {check.evidence.map((e) => (
                <div key={e.label} className={`detail-doc ${!e.ok ? 'missing' : ''}`}>
                  <span className={`doc-icon ${e.ok ? 'green' : 'amber'}`}>
                    <FileCheck2 size={16} />
                  </span>
                  <span>
                    <strong>{e.label}</strong>
                  </span>
                  {e.ok ? (
                    <span className="source-tag">
                      <Check size={13} /> Verified
                    </span>
                  ) : (
                    <span className="missing-tag">Needs review</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Issues detected */}
          {check.issues.length > 0 && (
            <section>
              <div className="section-kicker">Issues detected</div>
              <div className="mt-3 flex flex-col gap-2">
                {check.issues.map((issue) => (
                  <div key={issue} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <AlertTriangle size={14} className="shrink-0 text-primary" /> {issue}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* AI draft / acceptance pack action */}
          {check.status === 'review' && draft && action !== 'sent' && (
            <section className="draft-card">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="draft-label">
                    <MessageSquareText size={15} /> AI draft — clarification message
                  </div>
                  <h2 className="mt-2 text-lg font-semibold">Acceptance pack</h2>
                </div>
                <span className="not-sent">{action === 'held' ? 'HELD' : 'NOT SENT'}</span>
              </div>

              {editing ? (
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={6}
                  className="field-input mt-5 whitespace-pre-line"
                />
              ) : (
                <div className="draft-body mt-5 whitespace-pre-line">{draft}</div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button onClick={() => setEditing((v) => !v)} className="back-link flex items-center gap-1.5">
                  <Pencil size={13} /> {editing ? 'Done editing' : 'Edit draft'}
                </button>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard?.writeText(draft)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="rounded-full"
                >
                  {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
                  {copied ? 'Copied' : 'Copy draft'}
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 border-t border-border/70 pt-5">
                <Button variant="outline" onClick={() => setAction('held')} className="rounded-full">
                  Hold &amp; Clarify
                </Button>
                <Button onClick={() => setAction('sent')} className="rounded-full">
                  Approve &amp; Send
                </Button>
              </div>
            </section>
          )}

          {action === 'sent' && (
            <section className="finding" style={{ borderColor: '#bcd8c4', background: '#f1f7f2' }}>
              <div className="finding-top">
                <span className="finding-icon" style={{ background: '#39734e' }}>
                  <Check size={13} />
                </span>
                <strong>Clarification sent to {check.buyer}</strong>
              </div>
              <p>ProofPay will notify you once the buyer responds with updated acceptance evidence.</p>
            </section>
          )}

          {check.status === 'ready' && (
            <section className="draft-card" style={{ borderColor: '#bcd8c4', background: '#f1f7f2' }}>
              <div className="draft-label" style={{ color: '#2f714b' }}>
                <Check size={15} /> All evidence reconciled
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{check.recommendation}</p>
              <div className="mt-5">
                <Button onClick={() => setAction('sent')} disabled={action === 'sent'} className="rounded-full">
                  {action === 'sent' ? 'Sent to buyer' : 'Approve & Send'}
                </Button>
              </div>
            </section>
          )}
        </div>

        {/* Transaction summary sidebar */}
        <aside className="detail-score">
          <div className="section-kicker">Transaction summary</div>
          <div className="mt-2">
            <div className="summary-line">
              <span>PO</span>
              <strong>{check.po} units</strong>
            </div>
            <div className="summary-line">
              <span>Delivered</span>
              <strong>{check.delivered} units</strong>
            </div>
            <div className={`summary-line ${check.accepted !== check.invoiced ? 'flag' : ''}`}>
              <span>Accepted</span>
              <strong>{check.accepted} units</strong>
            </div>
            <div className="summary-line">
              <span>Invoiced</span>
              <strong>{check.invoiced} units</strong>
            </div>
          </div>
        </aside>
      </div>
    </WorkspaceShell>
  )
}
