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
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'

const required = [
  { id: 'po', label: 'Purchase Order', meta: 'Confirms what was ordered', icon: FileText, tone: 'blue' },
  { id: 'invoice', label: 'Invoice', meta: 'What you\u2019re asking to be paid', icon: FileCheck2, tone: 'red' },
  { id: 'challan', label: 'Delivery Challan', meta: 'Confirms what was shipped', icon: PackageCheck, tone: 'green' },
  { id: 'grn', label: 'GRN / Acceptance', meta: 'Confirms what the buyer received', icon: ClipboardCheck, tone: 'amber' },
]

const optional = [
  { id: 'proof', label: 'Delivery Proof', meta: 'Signed POD or courier receipt' },
  { id: 'thread', label: 'Email / WhatsApp Thread', meta: 'Any written confirmation from the buyer' },
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

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_300px]">
        <div>
          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
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
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {required.map((doc) => {
                const Icon = doc.icon
                return (
                  <div key={doc.id} className="doc-select locked">
                    <span className={`doc-icon ${doc.tone}`}>
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 text-left">
                      <strong>{doc.label}</strong>
                      <small>{doc.meta}</small>
                    </span>
                    <span className="check-box checked">
                      <Check size={13} />
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-7">
            <div className="section-kicker">Optional</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {optional.map((doc) => {
                const included = optIncluded.includes(doc.id)
                return (
                  <button
                    key={doc.id}
                    onClick={() => setOptIncluded((s) => (included ? s.filter((id) => id !== doc.id) : [...s, doc.id]))}
                    className={`doc-select ${included ? 'selected' : ''}`}
                  >
                    <span className="doc-icon slate">
                      <Plus size={17} />
                    </span>
                    <span className="min-w-0 text-left">
                      <strong>{doc.label}</strong>
                      <small>{doc.meta}</small>
                    </span>
                    <span className={`check-box ${included ? 'checked' : ''}`}>{included && <Check size={13} />}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <aside className="side-summary h-fit">
          <div className="section-kicker">This check will verify</div>
          <div className="mt-5 flex flex-col gap-3">
            {required.map((doc) => (
              <div className="mini-doc" key={doc.id}>
                <doc.icon size={15} />
                <span>{doc.label}</span>
                <Check size={14} className="ml-auto text-primary" />
              </div>
            ))}
          </div>

          <div className="sample-note mt-6">
            <Sparkles size={16} />
            <span>
              This demo uses a pre-built mismatch: <strong>100 units invoiced, 80 accepted.</strong>
            </span>
          </div>

          <Button onClick={() => router.push('/workspace/checks/inv-091')} className="mt-7 w-full rounded-full">
            Start Acceptance Check <ArrowRight data-icon="inline-end" />
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">You can add optional evidence after the first pass.</p>
        </aside>
      </div>
    </WorkspaceShell>
  )
}
