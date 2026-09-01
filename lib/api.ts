export type DocumentType =
  | 'po'
  | 'invoice'
  | 'grn'
  | 'delivery_proof'
  | 'acceptance_proof'
  | 'gst_info'

export interface LineItem {
  item: string
  qty: number
  rate: number
  amount: number
}

export interface GRNLineItem {
  item: string
  qty_received: number
}

export interface PurchaseOrder {
  po_id: string
  date: string
  buyer: string
  supplier: string
  line_items: LineItem[]
  total_amount: number
}

export interface Invoice {
  invoice_id: string
  po_ref: string
  date: string
  gstin: string
  line_items: LineItem[]
  total_amount: number
}

export interface GRN {
  grn_id: string
  po_ref: string
  date: string
  line_items: GRNLineItem[]
  receiving_party: string
}

export interface Proof {
  proof_id: string
  ref_id: string
  type: 'delivery' | 'acceptance'
  date: string
  signed_by: string
  status: 'present' | 'missing'
}

export interface GSTInfo {
  gstin: string
  validity_status: 'valid' | 'invalid' | 'unverified'
}

export interface Transaction {
  transaction_id: string
  po: PurchaseOrder
  invoice: Invoice
  grn: GRN
  delivery_proof: Proof | null
  acceptance_proof: Proof | null
  gst_info: GSTInfo | null
  status: 'uploaded' | 'reconciled'
}

export interface TransactionSummary {
  transaction_id: string
  status: 'uploaded' | 'reconciled'
  verdict?: 'verified' | 'risk' | 'partial'
  readiness_score?: number
}

export interface ReconciliationFlag {
  field: string
  po_value: number | string | null
  grn_value: number | string | null
  invoice_value: number | string | null
  discrepancy_type: string
  amount_at_risk: number
  source_docs: string[]
}

export interface ReconciliationResult {
  transaction_id: string
  verdict: 'verified' | 'risk' | 'partial'
  readiness_score: number
  flags: ReconciliationFlag[]
  missing_evidence: string[]
  recommended_action: string
  draft_message: string | null
}

export interface AcceptancePack {
  transaction_id: string
  summary: {
    verdict: ReconciliationResult['verdict']
    readiness_score: number
  }
  flags: ReconciliationFlag[]
  missing_evidence: string[]
  recommended_action: string
  draft_message: string | null
}

export interface FixtureTransaction {
  transaction_id: string
  po: PurchaseOrder
  invoice: Invoice
  grn: GRN
  delivery_proof: Proof | null
  acceptance_proof: Proof | null
  gst_info: GSTInfo | null
  status: 'uploaded' | 'reconciled'
}

export class ApiError extends Error {
  status: number
  code: string

  constructor(status: number, message: string, code: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000/api/v1'
).replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
    })
  } catch {
    throw new ApiError(
      0,
      'The ProofPay API is unavailable. Start the backend on port 8000 and try again.',
      'api_unavailable',
    )
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(
      response.status,
      payload?.error ?? `Request failed with status ${response.status}`,
      payload?.code ?? 'request_failed',
    )
  }
  return payload as T
}

export function getTransactions() {
  return request<TransactionSummary[]>('/transactions')
}

export interface WorkspaceCheck extends Omit<TransactionSummary, 'status'> {
  id: string
  invoice: string
  buyer: string
  amount: string
  status: 'ready' | 'review' | 'pending'
  statusLabel: string
}

export async function getWorkspaceChecks(): Promise<WorkspaceCheck[]> {
  const summaries = await getTransactions()
  const transactions = await Promise.all(
    summaries.map((summary) => getTransaction(summary.transaction_id)),
  )

  return summaries.map((summary, index) => {
    const transaction = transactions[index]
    const status =
      summary.verdict === 'verified'
        ? 'ready'
        : summary.verdict
          ? 'review'
          : 'pending'
    const statusLabel =
      status === 'ready'
        ? 'Ready'
        : status === 'review'
          ? 'Needs review'
          : 'Not reconciled'

    return {
      ...summary,
      id: transaction.transaction_id,
      invoice: transaction.invoice.invoice_id,
      buyer: transaction.po.buyer,
      amount: formatAmount(transaction.invoice.total_amount),
      status,
      statusLabel,
    }
  })
}

export function getTransaction(transactionId: string) {
  return request<Transaction>(`/transactions/${encodeURIComponent(transactionId)}`)
}

export function createTransaction(documentIds: {
  po_id: string
  invoice_id: string
  grn_id: string
  delivery_proof_id: string | null
  acceptance_proof_id: string | null
  gst_info_id: string | null
}) {
  return request<Transaction>('/transactions', {
    method: 'POST',
    body: JSON.stringify(documentIds),
  })
}

export function uploadDocument(docType: DocumentType, document: unknown) {
  return request<unknown>(`/documents/upload?doc_type=${docType}`, {
    method: 'POST',
    body: JSON.stringify(document),
  })
}

export function reconcileTransaction(transactionId: string) {
  return request<ReconciliationResult>(
    `/transactions/${encodeURIComponent(transactionId)}/reconcile`,
    { method: 'POST' },
  )
}

export function getAcceptancePack(transactionId: string) {
  return request<AcceptancePack>(
    `/transactions/${encodeURIComponent(transactionId)}/acceptance-pack`,
  )
}

export function regenerateDraft(transactionId: string, recipient?: string) {
  return request<{ draft_message: string }>(
    `/transactions/${encodeURIComponent(transactionId)}/draft-message`,
    {
      method: 'POST',
      body: JSON.stringify({ recipient: recipient || null }),
    },
  )
}

export async function createFromFixture(fixture: FixtureTransaction) {
  const documents: Array<[DocumentType, unknown]> = [
    ['po', fixture.po],
    ['invoice', fixture.invoice],
    ['grn', fixture.grn],
    ['delivery_proof', fixture.delivery_proof],
    ['acceptance_proof', fixture.acceptance_proof],
    ['gst_info', fixture.gst_info],
  ]

  for (const [docType, document] of documents) {
    if (document === null) continue
    try {
      await uploadDocument(docType, document)
    } catch (error) {
      if (!(error instanceof ApiError) || error.code !== 'document_exists') {
        throw error
      }
    }
  }

  const transaction = await createTransaction({
    po_id: fixture.po.po_id,
    invoice_id: fixture.invoice.invoice_id,
    grn_id: fixture.grn.grn_id,
    delivery_proof_id: fixture.delivery_proof?.proof_id ?? null,
    acceptance_proof_id: fixture.acceptance_proof?.proof_id ?? null,
    gst_info_id: fixture.gst_info?.gstin ?? null,
  })
  const result = await reconcileTransaction(transaction.transaction_id)
  return { transaction, result }
}

export function formatAmount(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}
