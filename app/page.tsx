import Link from 'next/link'
import { ArrowRight, Check, ClipboardCheck, FileCheck2, FileText, IndianRupee, LockKeyhole, PackageCheck, ShieldCheck, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90">
        <div className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2" aria-label="ProofPay home">
            <span className="logo-mark"><ShieldCheck size={20} /></span>
            <span className="font-mono text-[15px] font-semibold tracking-[-0.04em]">proof<span className="text-primary">pay</span></span>
          </Link>
          <nav className="flex items-center gap-4 sm:gap-7">
            <Link href="/workspace/checks" className="nav-link hidden sm:block">Transactions</Link>
            <Link href="/workspace/checks/new" className="nav-link">New check</Link>
            <Link href="/login" className="avatar" aria-label="Go to workspace">AK</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 lg:px-8 lg:pb-24 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr] lg:gap-20">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> Built for India&apos;s MSMEs</div>
              <h1 className="display mt-6 max-w-2xl">Get paid for what you <em>delivered.</em></h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">ProofPay checks your invoice against the evidence that matters — before it gets stuck in a buyer&apos;s inbox.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/workspace/checks/new"><Button className="h-12 rounded-full px-6">Try the live demo <ArrowRight data-icon="inline-end" /></Button></Link>
                <a href="#how" className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">See how it works <ArrowRight size={15} /></a>
              </div>
              <div className="mt-12 flex flex-wrap gap-x-7 gap-y-3 text-xs text-muted-foreground"><span className="flex items-center gap-2"><LockKeyhole size={14} /> Your documents stay private</span><span className="flex items-center gap-2"><Zap size={14} /> Results in seconds</span></div>
            </div>

            <div className="relative">
              <div className="hero-card">
                <div className="flex items-center justify-between border-b border-border/70 pb-5"><div><div className="label">Payment readiness</div><div className="mt-1 text-sm font-medium">Synthetic quantity mismatch</div></div><span className="badge badge-amber">Needs attention</span></div>
                <div className="flex items-end justify-between py-7"><div><span className="score">92</span><span className="score-unit">%</span><div className="mt-2 text-sm text-muted-foreground">ready to submit</div></div><div className="score-ring"><div><span>1</span><small>flag</small></div></div></div>
                <div className="flex flex-col gap-3 border-t border-border/70 pt-5"><div className="evidence-row"><span className="evidence-icon blue"><FileText size={15} /></span><span>PO quantity</span><strong>100 units</strong></div><div className="evidence-row"><span className="evidence-icon amber"><PackageCheck size={15} /></span><span>Received quantity</span><strong className="text-primary">92 units</strong></div><div className="evidence-row"><span className="evidence-icon slate"><FileCheck2 size={15} /></span><span>Acceptance proof</span><strong>Verified</strong></div></div>
              </div>
              <div className="risk-note"><IndianRupee size={15} /><span><strong>₹4,000 at risk</strong> is linked to the GRN and invoice</span></div>
            </div>
          </div>
        </section>

        <section id="how" className="border-y border-border/70 bg-card">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
            <div className="max-w-xl"><div className="eyebrow"><span className="eyebrow-line" /> The problem</div><h2 className="section-title mt-4">Invoices don&apos;t get delayed.<br /><em>Evidence does.</em></h2><p className="mt-5 leading-7 text-muted-foreground">When your PO says 100 and the GRN says 92, the gap becomes a reason to pause payment. ProofPay catches that gap before you submit.</p></div>
            <div className="mt-12 grid gap-4 md:grid-cols-3"><div className="stat-card"><span className="stat-number">45–90</span><span className="stat-label">days waiting for payment</span></div><div className="stat-card highlighted"><span className="stat-number">100 <small>vs</small> 92</span><span className="stat-label">units ordered vs received</span></div><div className="stat-card"><span className="stat-number">₹4,000</span><span className="stat-label">value at risk in one mismatch</span></div></div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-24">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><div className="eyebrow"><span className="eyebrow-line" /> One clear answer</div><h2 className="section-title mt-4">A paper trail you can trust.</h2></div><Link href="/workspace/checks/new"><Button variant="outline" className="w-fit rounded-full">Build a transaction <ArrowRight data-icon="inline-end" /></Button></Link></div>
          <div className="mt-12 flex flex-col gap-3 md:flex-row md:items-center md:gap-0">{[['Purchase Order', FileText], ['Goods Receipt Note', PackageCheck], ['Delivery Proof', ClipboardCheck], ['Acceptance', Check]].map(([item, Icon], index) => <div key={String(item)} className="flex flex-1 items-center"><div className="chain-card"><span className="chain-number">{String(index + 1).padStart(2, '0')}</span><span>{String(item)}</span><Icon size={15} className="ml-auto text-primary" /></div>{index < 3 && <ArrowRight className="mx-3 hidden shrink-0 text-border md:block" size={18} />}</div>)}</div>
        </section>
      </main>
    </div>
  )
}
