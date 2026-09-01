'use client'

import { useState } from 'react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Bengaluru')
  const [contactEmail, setContactEmail] = useState('aarav@mehtaparts.in')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false)
  const [autoHold, setAutoHold] = useState(true)
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <WorkspaceShell>
      <div className="eyebrow">
        <span className="eyebrow-line" /> Settings
      </div>
      <h1 className="page-title mt-4 text-[2.4rem]">Workspace settings.</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Manage your workspace identity and how ProofPay notifies you.</p>

      <div className="mt-10 max-w-2xl">
        <div className="settings-section">
          <div className="section-kicker">Workspace</div>
          <div className="mt-4 flex flex-col gap-5 border border-border bg-[#fffefa] p-5">
            <div className="field-group">
              <label className="label">Workspace name</label>
              <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="field-input" />
            </div>
            <div className="field-group">
              <label className="label">Contact email</label>
              <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="field-input" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-kicker">Notifications</div>
          <div className="mt-4 border border-border bg-[#fffefa] px-5">
            <div className="settings-row">
              <div className="settings-row-label">
                <strong>Email on clarification needed</strong>
                <small>Get an email the moment a check flags a mismatch.</small>
              </div>
              <button onClick={() => setNotifyEmail((v) => !v)} className={`toggle ${notifyEmail ? 'on' : ''}`} aria-pressed={notifyEmail} aria-label="Toggle email notifications" />
            </div>
            <div className="settings-row">
              <div className="settings-row-label">
                <strong>WhatsApp updates</strong>
                <small>Get pinged on WhatsApp when a pack is approved and sent.</small>
              </div>
              <button onClick={() => setNotifyWhatsapp((v) => !v)} className={`toggle ${notifyWhatsapp ? 'on' : ''}`} aria-pressed={notifyWhatsapp} aria-label="Toggle WhatsApp notifications" />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <div className="section-kicker">Reconciliation</div>
          <div className="mt-4 border border-border bg-[#fffefa] px-5">
            <div className="settings-row">
              <div className="settings-row-label">
                <strong>Hold invoices with any mismatch</strong>
                <small>Automatically pause a check instead of marking it ready when a quantity or price mismatch is found.</small>
              </div>
              <button onClick={() => setAutoHold((v) => !v)} className={`toggle ${autoHold ? 'on' : ''}`} aria-pressed={autoHold} aria-label="Toggle auto-hold" />
            </div>
          </div>
        </div>

        <div className="mt-9 flex items-center gap-3">
          <Button onClick={save} className="w-fit rounded-full">
            Save changes
          </Button>
          {saved && <span className="text-xs font-medium text-primary">Saved</span>}
        </div>
      </div>
    </WorkspaceShell>
  )
}
