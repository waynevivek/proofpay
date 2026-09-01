'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Copy,
  FileCheck2,
  FileText,
  MessageSquareText,
  Pencil,
  RefreshCw,
  Sparkles,
  X,
} from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import {
  ApiError,
  formatAmount,
  formatDate,
  getAcceptancePack,
  getTransaction,
  regenerateDraft,
  reconcileTransaction,
  type ReconciliationFlag,
  type ReconciliationResult,
  type Transaction,
} from '@/lib/api'

type Action = 'idle' | 'held' | 'approved'

function valueText(value: number | string | null) {
  return value == null ? '—' : String(value)
}

function flagTitle(flag: ReconciliationFlag) {
  return flag.discrepancy_type.replaceAll('_', ' ')
}

function flagDescription(flag: ReconciliationFlag) {
  if (flag.field === 'quantity') {
    return `PO ${valueText(flag.po_value)}, GRN ${valueText(flag.grn_value)}, invoice ${valueText(flag.invoice_value)}.`
  }
  if (flag.field === 'price') {
    return `PO value ${valueText(flag.po_value)} versus invoice value ${valueText(flag.invoice_value)}.`
  }
  return `PO ${valueText(flag.po_value)}, GRN ${valueText(flag.grn_value)}, invoice ${valueText(flag.invoice_value)}.`
}

function resultFromPack(pack: Awaited<ReturnType<typeof getAcceptancePack>>): ReconciliationResult {
  return {
    transaction_id: pack.transaction_id,
    verdict: pack.summary.verdict,
    readiness_score: pack.summary.readiness_score,
    flags: pack.flags,
    missing_evidence: pack.missing_evidence,
    recommended_action: pack.recommended_action,
    draft_message: pack.draft_message,
  }
}

export default function CheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [result, setResult] = useState<ReconciliationResult | null>(null)
  const [draft, setDraft] = useState('')
  const [recipient, setRecipient] = useState('')
  const [action, setAction] = useState<Action>('idle')
  const [editing, setEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    getTransaction(id)
      .then(async (loaded) => {
        if (!active) return
        setTransaction(loaded)
        if (loaded.status === 'reconciled') {
          const pack = await getAcceptancePack(id)
          if (!active) return
          const loadedResult = resultFromPack(pack)
          setResult(loadedResult)
          setDraft(loadedResult.draft_message ?? '')
        }
      })
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof ApiError ? reason.message : 'Could not load this transaction.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  async function runReconciliation() {
    setRunning(true)
    setError(null)
    try {
      const loadedResult = await reconcileTransaction(id)
      setResult(loadedResult)
      setDraft(loadedResult.draft_message ?? '')
      setTransaction((current) => current ? { ...current, status: 'reconciled' } : current)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Could not reconcile this transaction.')
    } finally {
      setRunning(false)
    }
  }

  async function regenerate() {
    if (!result) return
    setRegenerating(true)
    setError(null)
    try {
      const response = await regenerateDraft(id, recipient)
      setDraft(response.draft_message)
      setResult({ ...result, draft_message: response.draft_message })
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Could not regenerate the draft.')
    } finally {
      setRegenerating(false)
    }
  }

  if (loading) {
    return <WorkspaceShell><p className="text-sm text-muted-foreground">Loading transaction…</p></WorkspaceShell>
  }

  if (error || !transaction) {
    return (
      <WorkspaceShell>
        <Link href="/workspace/checks" className="back-link">← Back to checks</Link>
        <p className="mt-8 text-sm text-destructive">{error ?? 'Transaction not found.'}</p>
      </WorkspaceShell>
    )
  }

  const poQty = transaction.po.line_items[0]?.qty ?? 0
  const grnQty = transaction.grn.line_items[0]?.qty_received ?? 0
  const invoiceQty = transaction.invoice.line_items[0]?.qty ?? 0
  const evidence = [
    { label: 'Purchase order', id: transaction.po.po_id, present: true, icon: FileText },
    { label: 'Invoice', id: transaction.invoice.invoice_id, present: true, icon: FileCheck2 },
    { label: 'GRN', id: transaction.grn.grn_id, present: true, icon: FileCheck2 },
    { label: 'Delivery proof', id: transaction.delivery_proof?.proof_id, present: transaction.delivery_proof?.status === 'present', icon: FileCheck2 },
    { label: 'Customer acceptance', id: transaction.acceptance_proof?.proof_id, present: transaction.acceptance_proof?.status === 'present', icon: FileCheck2 },
    { label: 'GST information', id: transaction.gst_info?.gstin, present: transaction.gst_info?.validity_status === 'valid', icon: FileCheck2 },
  ]
  const hasIssues = Boolean(result && (result.flags.length > 0 || result.missing_evidence.length > 0))
  const displayDraft = draft || result?.draft_message || ''

  return (
    <WorkspaceShell>
      <Link href="/workspace/checks" className="back-link">← Back to checks</Link>

      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> Acceptance check</div>
          <h1 className="page-title mt-3 text-[2.3rem]">{transaction.invoice.invoice_id}</h1>
          <p className="mt-2 text-muted-foreground">{transaction.po.buyer} · {formatAmount(transaction.invoice.total_amount)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`badge ${result?.verdict === 'risk' ? 'badge-amber' : result?.verdict === 'partial' ? 'badge-slate' : result ? 'badge-green' : 'badge-slate'}`}>
            {result ? result.verdict : 'Not reconciled'}
          </span>
          <Button disabled={running} onClick={() => void runReconciliation()} variant={result ? 'outline' : 'default'} className="rounded-full">
            {result && <RefreshCw data-icon="inline-start" />}
            {running ? 'Running…' : result ? 'Run again' : 'Run reconciliation'}
          </Button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-8">
          <section>
            <div className="flex items-center justify-between">
              <div className="section-kicker">Evidence in this transaction</div>
              <span className="text-xs text-muted-foreground">{evidence.filter((item) => item.present).length} / {evidence.length} present</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {evidence.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className={`detail-doc ${!item.present ? 'missing' : ''}`}>
                    <span className={`doc-icon ${item.present ? 'green' : 'amber'}`}><Icon size={16} /></span>
                    <span><strong>{item.label}</strong><small>{item.id ? `${item.id} · ${item.present ? 'source verified' : 'marked missing'}` : 'not attached'}</small></span>
                    {item.present ? <span className="source-tag"><Check size={13} /> Verified</span> : <span className="missing-tag">Missing</span>}
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <div className="section-kicker">Reconciliation snapshot</div>
            <div className="recon-grid mt-3">
              <div className="recon-card"><span className="label">Purchase order</span><div className="recon-value-row"><span className="recon-value">{poQty} units</span><span className="recon-status ok"><Check size={13} /></span></div></div>
              <div className={`recon-card ${result?.flags.some((flag) => flag.field === 'quantity') ? 'warn' : ''}`}><span className="label">GRN received</span><div className="recon-value-row"><span className="recon-value">{grnQty} units</span><span className={`recon-status ${result?.flags.some((flag) => flag.field === 'quantity') ? 'warn' : 'ok'}`}>{result?.flags.some((flag) => flag.field === 'quantity') ? <AlertTriangle size={12} /> : <Check size={13} />}</span></div></div>
              <div className={`recon-card ${result?.flags.some((flag) => flag.field === 'quantity') ? 'bad' : ''}`}><span className="label">Invoice quantity</span><div className="recon-value-row"><span className="recon-value">{invoiceQty} units</span><span className={`recon-status ${result?.flags.some((flag) => flag.field === 'quantity') ? 'bad' : 'ok'}`}>{result?.flags.some((flag) => flag.field === 'quantity') ? <X size={13} /> : <Check size={13} />}</span></div></div>
            </div>
          </section>

          {result && hasIssues && (
            <section>
              <div className="section-kicker">Findings and source trace</div>
              <div className="mt-3 flex flex-col gap-3">
                {result.flags.map((flag, index) => (
                  <div key={`${flag.discrepancy_type}-${index}`} className="finding finding-warn">
                    <div className="finding-top"><span className="finding-icon">!</span><strong>{flagTitle(flag)}</strong><span className="badge badge-amber">{formatAmount(flag.amount_at_risk)} at risk</span></div>
                    <p>{flagDescription(flag)}</p>
                    <div className="source-trace">
                      {flag.source_docs.map((source) => <span key={source}><FileText size={13} /> {source}</span>)}
                    </div>
                  </div>
                ))}
                {result.missing_evidence.map((missing) => (
                  <div key={missing} className="finding finding-missing">
                    <div className="finding-top"><span className="finding-icon">?</span><strong>{missing.replaceAll('_', ' ')}</strong><span className="badge badge-slate">Blocks submission</span></div>
                    <p>This evidence is not attached to the transaction.</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {result && displayDraft && action !== 'approved' && (
            <section className="draft-card">
              <div className="flex items-start justify-between gap-4"><div><div className="draft-label"><MessageSquareText size={15} /> Draft clarification message</div><h2 className="mt-2 text-lg font-semibold">Review before sending</h2></div><span className="not-sent">NOT SENT</span></div>
              {editing ? <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} className="field-input mt-5 whitespace-pre-line" /> : <div className="draft-body mt-5 whitespace-pre-line">{displayDraft}</div>}
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input value={recipient} onChange={(event) => setRecipient(event.target.value)} placeholder="Recipient (optional)" className="field-input" />
                <Button disabled={regenerating} variant="outline" onClick={() => void regenerate()} className="rounded-full">{regenerating ? 'Regenerating…' : 'Regenerate draft'}</Button>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3"><button onClick={() => setEditing((value) => !value)} className="back-link flex items-center gap-1.5"><Pencil size={13} /> {editing ? 'Done editing' : 'Edit draft'}</button><Button variant="outline" onClick={() => { void navigator.clipboard?.writeText(displayDraft); setCopied(true); setTimeout(() => setCopied(false), 1500) }} className="rounded-full">{copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? 'Copied' : 'Copy draft'}</Button></div>
              <div className="mt-6 flex flex-wrap gap-3 border-t border-border/70 pt-5"><Button variant="outline" onClick={() => setAction('held')} className="rounded-full">Hold &amp; Clarify</Button><Button onClick={() => setAction('approved')} className="rounded-full">Approve draft</Button></div>
            </section>
          )}

          {action === 'approved' && <section className="finding" style={{ borderColor: '#bcd8c4', background: '#f1f7f2' }}><div className="finding-top"><span className="finding-icon" style={{ background: '#39734e' }}><Check size={13} /></span><strong>Draft approved — ready for human send</strong></div><p>No message was sent automatically. Copy the approved draft and send it through your normal channel.</p></section>}
          {result && !hasIssues && <section className="draft-card" style={{ borderColor: '#bcd8c4', background: '#f1f7f2' }}><div className="draft-label" style={{ color: '#2f714b' }}><Check size={15} /> All evidence reconciled</div><p className="mt-2 text-sm text-muted-foreground">{result.recommended_action}</p><div className="mt-5"><Button onClick={() => setAction('approved')} disabled={action === 'approved'} className="rounded-full">{action === 'approved' ? 'Approved' : 'Approve for payment'}</Button></div></section>}
        </div>

        <aside className="detail-score">
          <div className="section-kicker">Payment readiness</div>
          <div className="mt-7 flex items-end gap-1"><span className="detail-score-number">{result?.readiness_score ?? '—'}</span>{result && <span className="detail-score-percent">%</span>}</div>
          <p className="mt-2 text-sm text-muted-foreground">{result ? result.recommended_action : 'Run reconciliation to calculate readiness.'}</p>
          <div className="readiness-bar mt-6"><span style={{ width: `${result?.readiness_score ?? 0}%` }} /></div>
          <div className="mt-7 flex flex-col gap-4 border-t border-border/70 pt-5"><div className="score-line"><span className="score-dot green" /> Evidence present <strong>{evidence.filter((item) => item.present).length} / {evidence.length}</strong></div><div className="score-line"><span className="score-dot amber" /> Mismatches found <strong>{result ? result.flags.length : '—'}</strong></div><div className="score-line"><span className="score-dot slate" /> Missing evidence <strong>{result ? result.missing_evidence.length : '—'}</strong></div></div>
          {result && <div className="mt-8 rounded-lg bg-secondary p-4 text-sm leading-6 text-muted-foreground"><Sparkles size={15} className="mb-2 text-primary" />{formatDate(transaction.invoice.date)} · {result.verdict === 'verified' ? 'Ready for payment approval.' : 'Resolve the linked findings before approval.'}</div>}
        </aside>
      </div>
    </WorkspaceShell>
  )
}
