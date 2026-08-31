'use client'

import { FileCheck2, FileText, PackageCheck, Plus, ClipboardCheck } from 'lucide-react'
import { WorkspaceShell } from '@/proofpay/components/workspace/sidebar'
import { Button } from '@/proofpay/components/ui/button'

const documents = [
  { name: 'PO-2024-118.pdf', type: 'Purchase Order', linked: 'INV-091', date: '20 Aug 2026', icon: FileText, tone: 'blue' },
  { name: 'DC-772.pdf', type: 'Delivery Challan', linked: 'INV-091', date: '20 Aug 2026', icon: PackageCheck, tone: 'green' },
  { name: 'GRN-51.pdf', type: 'GRN / Acceptance', linked: 'INV-091', date: '22 Aug 2026', icon: ClipboardCheck, tone: 'amber' },
  { name: 'INV-091.pdf', type: 'Invoice', linked: 'INV-091', date: '23 Aug 2026', icon: FileCheck2, tone: 'red' },
  { name: 'PO-2024-090.pdf', type: 'Purchase Order', linked: 'INV-090', date: '14 Aug 2026', icon: FileText, tone: 'blue' },
  { name: 'INV-090.pdf', type: 'Invoice', linked: 'INV-090', date: '15 Aug 2026', icon: FileCheck2, tone: 'red' },
]

export default function DocumentsPage() {
  return (
    <WorkspaceShell>
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-line" /> Evidence library
          </div>
          <h1 className="page-title mt-4 text-[2.6rem]">Documents</h1>
          <p className="mt-3 text-muted-foreground">Every file uploaded across your acceptance checks.</p>
        </div>
        <Button className="w-fit rounded-full">
          <Plus data-icon="inline-start" /> Upload document
        </Button>
      </div>

      <div className="mt-10 flex flex-col gap-2">
        {documents.map((doc) => {
          const Icon = doc.icon
          return (
            <div key={doc.name} className="detail-doc">
              <span className={`doc-icon ${doc.tone}`}>
                <Icon size={17} />
              </span>
              <span>
                <strong>{doc.name}</strong>
                <small>
                  {doc.type} · linked to {doc.linked}
                </small>
              </span>
              <span className="ml-auto font-mono text-[11px] text-muted-foreground">{doc.date}</span>
            </div>
          )
        })}
      </div>
    </WorkspaceShell>
  )
}
