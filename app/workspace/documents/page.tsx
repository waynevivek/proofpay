'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardCheck, FileCheck2, FileText, PackageCheck, Plus } from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import { ApiError, formatDate, getTransaction, getTransactions, type Transaction } from '@/lib/api'

type DocumentRow = {
  id: string
  type: string
  linked: string
  date: string
  tone: string
  icon: typeof FileText
}

function documentsFor(transaction: Transaction): DocumentRow[] {
  const rows: DocumentRow[] = [
    { id: transaction.po.po_id, type: 'Purchase Order', linked: transaction.invoice.invoice_id, date: transaction.po.date, tone: 'blue', icon: FileText },
    { id: transaction.invoice.invoice_id, type: 'Invoice', linked: transaction.invoice.invoice_id, date: transaction.invoice.date, tone: 'red', icon: FileCheck2 },
    { id: transaction.grn.grn_id, type: 'GRN', linked: transaction.invoice.invoice_id, date: transaction.grn.date, tone: 'amber', icon: ClipboardCheck },
  ]
  if (transaction.delivery_proof) rows.push({ id: transaction.delivery_proof.proof_id, type: 'Delivery Proof', linked: transaction.invoice.invoice_id, date: transaction.delivery_proof.date, tone: 'green', icon: PackageCheck })
  if (transaction.acceptance_proof) rows.push({ id: transaction.acceptance_proof.proof_id, type: 'Customer Acceptance', linked: transaction.invoice.invoice_id, date: transaction.acceptance_proof.date, tone: 'green', icon: ClipboardCheck })
  if (transaction.gst_info) rows.push({ id: transaction.gst_info.gstin, type: 'GST Information', linked: transaction.invoice.invoice_id, date: transaction.invoice.date, tone: 'slate', icon: FileText })
  return rows
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    getTransactions()
      .then((summaries) => Promise.all(summaries.map((summary) => getTransaction(summary.transaction_id))))
      .then((transactions) => {
        if (!active) return
        const unique = new Map<string, DocumentRow>()
        transactions.flatMap(documentsFor).forEach((document) => unique.set(document.id, document))
        setDocuments([...unique.values()])
      })
      .catch((reason) => {
        if (!active) return
        setError(reason instanceof ApiError ? reason.message : 'Could not load documents.')
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
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> Evidence library</div>
          <h1 className="page-title mt-4 text-[2.6rem]">Documents</h1>
          <p className="mt-3 text-muted-foreground">Every normalized document uploaded across your acceptance checks.</p>
        </div>
        <Link href="/workspace/checks/new"><Button className="w-fit rounded-full"><Plus data-icon="inline-start" /> Upload document</Button></Link>
      </div>

      <div className="mt-10 flex flex-col gap-2">
        {loading && <p className="p-8 text-center text-sm text-muted-foreground">Loading documents…</p>}
        {error && <p className="p-6 text-sm text-destructive">{error}</p>}
        {documents.map((document) => {
          const Icon = document.icon
          return <div key={document.id} className="detail-doc"><span className={`doc-icon ${document.tone}`}><Icon size={17} /></span><span><strong>{document.id}</strong><small>{document.type} · linked to {document.linked}</small></span><span className="ml-auto font-mono text-[11px] text-muted-foreground">{formatDate(document.date)}</span></div>
        })}
        {!loading && !error && documents.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">No documents yet. Start an acceptance check to upload evidence.</p>}
      </div>
    </WorkspaceShell>
  )
}
