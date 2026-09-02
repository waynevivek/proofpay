'use client'

import { useState } from 'react'
import { WorkspaceShell } from '@/components/workspace/sidebar'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Bengaluru')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyWhatsapp, setNotifyWhatsapp] = useState(false)
  const [saved, setSaved] = useState(false)

  return (
    <WorkspaceShell>
      <div className="eyebrow">
        <span className="eyebrow-line" /> Settings
      </div>
      <h1 className="page-title mt-4 text-[2.4rem]">Workspace settings</h1>
      <p className="mt-3 max-w-xl text-muted-foreground">Manage your workspace name and notification preferences.</p>

      <div className="auth-card mt-9 max-w-lg">
        <div className="flex flex-col gap-6">
          <div className="field-group">
            <label className="label">Workspace name</label>
            <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="field-input" />
          </div>

          <div className="field-group">
            <label className="label">Notifications</label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              Email me when a check needs clarification
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" checked={notifyWhatsapp} onChange={(e) => setNotifyWhatsapp(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              WhatsApp updates for approved packs
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => {
                setSaved(true)
                setTimeout(() => setSaved(false), 1800)
              }}
              className="w-fit rounded-full"
            >
              Save changes
            </Button>
            {saved && <span className="text-xs font-medium text-primary">Saved</span>}
          </div>
        </div>
      </div>
    </WorkspaceShell>
  )
}
