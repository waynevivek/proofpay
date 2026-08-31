'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  FileCheck2,
  FileText,
  PackageCheck,
  Plus,
  Sparkles,
  Upload,
} from 'lucide-react'
import { WorkspaceShell } from '@/proofpay/components/workspace/sidebar'
import { Button } from '@/proofpay/components/ui/button'

const required = [
  { id: 'po', label: 'Purchase Order', icon: FileText },
  { id: 'invoice', label: 'Invoice', icon: FileCheck2 },
  { id: 'challan', label: 'Delivery Challan', icon: PackageCheck },
  { id: 'grn', label: 'GRN / Acceptance', icon: ClipboardCheck },
]

const optional = [
  { id: 'proof', label: 'Delivery Proof' },
  { id: 'thread', label: 'Email / WhatsApp Thread' },
]

export default function NewCheckPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<string[]>([])
  const [optIncluded, setOptIncluded] = useState<string[]>([])

  function addFiles(list: FileList | null) {
    if (!list) return
    setFiles((f) => [...f, ...Array.from(list).map((file) => file.name)])
  }

  return (
    <WorkspaceShell>
      <div className="eyebrow">
        <span className="eyebrow-line" /> New acceptance check
      </div>
      <h1 className="page-title mt-4 text-[2.4rem]">Upload transaction evidence.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Drop in the documents for this transaction and ProofPay will reconcile them automatically.</p>

      <div
        className={`dropzone mt-9 ${dragActive ? 'active' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <span className="dropzone-icon">
          <Upload size={20} />
        </span>
        <strong className="text-base font-semibold">Upload documents</strong>
        <span className="text-sm text-muted-foreground">Drag &amp; drop or browse files</span>
        <span className="font-mono text-[11px] uppercase tracking-[.08em] text-muted-foreground">PDF · PNG · JPG · XLSX</span>
        <input ref={inputRef} type="file" multiple hidden onChange={(e) => addFiles(e.target.files)} />
      </div>

      {files.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {files.map((name, i) => (
            <div key={i} className="uploaded-file">
              <FileText size={14} className="text-primary" /> {name}
            </div>
          ))}
        </div>
      )}

      <div className="mt-9">
        <div className="section-kicker">Required documents</div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {required.map((r) => (
            <span key={r.id} className="req-chip done">
              <Check size={13} /> {r.label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="section-kicker">Optional</div>
        <div className="mt-3 flex flex-wrap gap-2.5">
          {optional.map((o) => {
            const included = optIncluded.includes(o.id)
            return (
              <button
                key={o.id}
                onClick={() => setOptIncluded((s) => (included ? s.filter((id) => id !== o.id) : [...s, o.id]))}
                className={`opt-chip ${included ? 'done' : ''}`}
              >
                {included ? <Check size={13} /> : <Plus size={13} />} {o.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="sample-note mt-8">
        <Sparkles size={16} />
        <span>
          This demo uses a pre-built mismatch: <strong>100 units invoiced, 80 accepted.</strong>
        </span>
      </div>

      <div className="mt-8 flex justify-end">
        <Button onClick={() => router.push('/workspace/checks/inv-091')} className="rounded-full">
          Start Acceptance Check <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </WorkspaceShell>
  )
}
