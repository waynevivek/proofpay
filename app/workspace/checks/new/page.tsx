'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  FileCheck2,
  FileText,
  PackageCheck,
  Sparkles,
  Upload,
} from 'lucide-react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'
import {
  ApiError,
  createFromFixture,
  type FixtureTransaction,
} from '@/lib/api'
import cleanFixture from '@/data/synthetic/clean/txn_1.json'
import quantityFixture from '@/data/synthetic/qty_mismatch/txn_1.json'
import priceFixture from '@/data/synthetic/price_mismatch/txn_1.json'
import dateFixture from '@/data/synthetic/date_mismatch/txn_1.json'
import missingEvidenceFixture from '@/data/synthetic/missing_evidence/txn_1.json'

const scenarios = {
  clean: { label: 'Clean match', fixture: cleanFixture as FixtureTransaction },
  qty_mismatch: { label: 'Quantity mismatch', fixture: quantityFixture as FixtureTransaction },
  price_mismatch: { label: 'Price mismatch', fixture: priceFixture as FixtureTransaction },
  date_mismatch: { label: 'Date mismatch', fixture: dateFixture as FixtureTransaction },
  missing_evidence: { label: 'Missing acceptance evidence', fixture: missingEvidenceFixture as FixtureTransaction },
} as const

type Scenario = keyof typeof scenarios

export default function NewCheckPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [scenario, setScenario] = useState<Scenario>('qty_mismatch')
  const [importedFixture, setImportedFixture] = useState<FixtureTransaction | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function readFixture(file: File | null) {
    if (!file) return
    setError(null)
    setFileName(file.name)
    if (!file.name.toLowerCase().endsWith('.json')) {
      setImportedFixture(null)
      setError('The current API contract accepts normalized JSON documents. Choose a .json fixture.')
      return
    }

    try {
      const parsed = JSON.parse(await file.text()) as FixtureTransaction
      if (!parsed.po || !parsed.invoice || !parsed.grn) {
        throw new Error('A transaction fixture must include po, invoice, and grn documents.')
      }
      setImportedFixture(parsed)
    } catch (reason) {
      setImportedFixture(null)
      setError(reason instanceof Error ? reason.message : 'Could not read that JSON fixture.')
    }
  }

  async function runFixture(fixture: FixtureTransaction) {
    setRunning(true)
    setError(null)
    try {
      const { transaction } = await createFromFixture(fixture)
      router.push(`/workspace/checks/${transaction.transaction_id}`)
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : 'Could not create this acceptance check.')
      setRunning(false)
    }
  }

  const selectedFixture = importedFixture ?? scenarios[scenario].fixture
  const selectedLabel = importedFixture ? fileName ?? 'Imported fixture' : scenarios[scenario].label
  const documentCount = [
    selectedFixture.po,
    selectedFixture.invoice,
    selectedFixture.grn,
    selectedFixture.delivery_proof,
    selectedFixture.acceptance_proof,
    selectedFixture.gst_info,
  ].filter(Boolean).length

  return (
    <WorkspaceShell>
      <div className="eyebrow">
        <span className="eyebrow-line" /> New acceptance check
      </div>
      <h1 className="page-title mt-4 text-[2.4rem]">Run a real evidence check.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">
        Choose a synthetic transaction or import a normalized JSON fixture. ProofPay uploads each document, creates the transaction, and runs reconciliation through the live API.
      </p>

      <div
        className={`dropzone mt-9 ${dragActive ? 'active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragActive(false)
          void readFixture(event.dataTransfer.files[0] ?? null)
        }}
      >
        <span className="dropzone-icon"><Upload size={20} /></span>
        <strong className="text-base font-semibold">Import normalized JSON</strong>
        <span className="text-sm text-muted-foreground">Drag &amp; drop or browse a transaction fixture</span>
        <span className="font-mono text-[11px] uppercase tracking-[.08em] text-muted-foreground">JSON · API contract v1</span>
        <input ref={inputRef} type="file" accept=".json,application/json" hidden onChange={(event) => void readFixture(event.target.files?.[0] ?? null)} />
      </div>

      <div className="mt-9">
        <div className="section-kicker">Or run a synthetic scenario</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.keys(scenarios) as Scenario[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setScenario(key)
                setImportedFixture(null)
                setFileName(null)
                setError(null)
              }}
              className={`doc-select ${!importedFixture && scenario === key ? 'selected' : ''}`}
            >
              <span className="doc-icon blue"><FileText size={18} /></span>
              <span className="min-w-0 text-left"><strong>{scenarios[key].label}</strong><small>{scenarios[key].fixture.transaction_id}</small></span>
              <span className={`check-box ${!importedFixture && scenario === key ? 'checked' : ''}`}>{!importedFixture && scenario === key && <Check size={13} />}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="sample-note mt-6">
        <Sparkles size={16} />
        <span>
          Selected: <strong>{selectedLabel}</strong> · {documentCount} document{documentCount === 1 ? '' : 's'} will be uploaded. No email or WhatsApp message is sent automatically.
        </span>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 flex justify-end">
        <Button disabled={running} onClick={() => void runFixture(selectedFixture)} className="rounded-full">
          {running ? 'Running check…' : 'Start acceptance check'}
          {!running && <ArrowRight data-icon="inline-end" />}
        </Button>
      </div>
    </WorkspaceShell>
  )
}
