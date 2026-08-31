export type CheckStatus = 'ready' | 'review'

export interface CheckSummary {
  id: string
  invoice: string
  buyer: string
  amount: string
  status: CheckStatus
  statusLabel: string
}

export const checkList: CheckSummary[] = [
  { id: 'inv-091', invoice: 'INV-091', buyer: 'ABC Industries', amount: '₹2.4L', status: 'review', statusLabel: 'Needs review' },
  { id: 'inv-090', invoice: 'INV-090', buyer: 'XYZ Textiles', amount: '₹1.8L', status: 'ready', statusLabel: 'Ready' },
  { id: 'inv-089', invoice: 'INV-089', buyer: 'Tata Components', amount: '₹3.1L', status: 'ready', statusLabel: 'Ready' },
]

export interface Evidence {
  label: string
  ok: boolean
}

export interface ReconLine {
  label: string
  value: string
  state: 'ok' | 'warn' | 'bad'
}

export interface RiskLine {
  label: string
  severity: 'high' | 'medium' | 'none'
}

export interface CheckDetail extends CheckSummary {
  po: number
  delivered: number
  accepted: number
  invoiced: number
  recon: ReconLine[]
  risks: RiskLine[]
  evidence: Evidence[]
  issues: string[]
  recommendation: string
  aiDraft: string
}

export const checkDetails: Record<string, CheckDetail> = {
  'inv-091': {
    id: 'inv-091',
    invoice: 'INV-091',
    buyer: 'ABC Industries',
    amount: '₹2.4L',
    status: 'review',
    statusLabel: 'Needs clarification',
    po: 100,
    delivered: 100,
    accepted: 80,
    invoiced: 100,
    recon: [
      { label: 'Purchase order', value: '100 units', state: 'ok' },
      { label: 'Delivery challan', value: '100 units', state: 'ok' },
      { label: 'GRN', value: '80 units', state: 'warn' },
      { label: 'Invoice', value: '100 units', state: 'bad' },
    ],
    risks: [
      { label: 'Quantity mismatch', severity: 'high' },
      { label: 'Acceptance evidence', severity: 'medium' },
      { label: 'Price mismatch', severity: 'none' },
      { label: 'Date mismatch', severity: 'none' },
    ],
    evidence: [
      { label: 'Purchase order', ok: true },
      { label: 'Delivery challan', ok: true },
      { label: 'GRN', ok: false },
      { label: 'Invoice', ok: true },
    ],
    issues: ['Quantity mismatch — 20 units', 'Acceptance confirmation required'],
    recommendation: 'Request acceptance proof for the remaining 20 units before sending the invoice.',
    aiDraft:
      'Hi ABC Industries team,\n\nOur records show 100 units delivered under DC-772, but GRN-51 reflects 80 units accepted. Could you confirm acceptance for the remaining 20 units, or share updated acceptance proof before we raise the invoice?\n\nThanks,\nProofPay on behalf of your supplier',
  },
  'inv-090': {
    id: 'inv-090',
    invoice: 'INV-090',
    buyer: 'XYZ Textiles',
    amount: '₹1.8L',
    status: 'ready',
    statusLabel: 'Ready to send',
    po: 60,
    delivered: 60,
    accepted: 60,
    invoiced: 60,
    recon: [
      { label: 'Purchase order', value: '60 units', state: 'ok' },
      { label: 'Delivery challan', value: '60 units', state: 'ok' },
      { label: 'GRN', value: '60 units', state: 'ok' },
      { label: 'Invoice', value: '60 units', state: 'ok' },
    ],
    risks: [
      { label: 'Quantity mismatch', severity: 'none' },
      { label: 'Acceptance evidence', severity: 'none' },
      { label: 'Price mismatch', severity: 'none' },
      { label: 'Date mismatch', severity: 'none' },
    ],
    evidence: [
      { label: 'Purchase order', ok: true },
      { label: 'Delivery challan', ok: true },
      { label: 'GRN', ok: true },
      { label: 'Invoice', ok: true },
    ],
    issues: [],
    recommendation: 'All evidence reconciles cleanly. This invoice is safe to send.',
    aiDraft: '',
  },
  'inv-089': {
    id: 'inv-089',
    invoice: 'INV-089',
    buyer: 'Tata Components',
    amount: '₹3.1L',
    status: 'ready',
    statusLabel: 'Ready to send',
    po: 240,
    delivered: 240,
    accepted: 240,
    invoiced: 240,
    recon: [
      { label: 'Purchase order', value: '240 units', state: 'ok' },
      { label: 'Delivery challan', value: '240 units', state: 'ok' },
      { label: 'GRN', value: '240 units', state: 'ok' },
      { label: 'Invoice', value: '240 units', state: 'ok' },
    ],
    risks: [
      { label: 'Quantity mismatch', severity: 'none' },
      { label: 'Acceptance evidence', severity: 'none' },
      { label: 'Price mismatch', severity: 'none' },
      { label: 'Date mismatch', severity: 'none' },
    ],
    evidence: [
      { label: 'Purchase order', ok: true },
      { label: 'Delivery challan', ok: true },
      { label: 'GRN', ok: true },
      { label: 'Invoice', ok: true },
    ],
    issues: [],
    recommendation: 'All evidence reconciles cleanly. This invoice is safe to send.',
    aiDraft: '',
  },
}

export function getCheckDetail(id: string): CheckDetail {
  return checkDetails[id] ?? checkDetails['inv-091']
}
