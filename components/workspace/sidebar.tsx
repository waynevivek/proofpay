'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardCheck, FileText, LayoutDashboard, Menu, Package, Settings, ShieldCheck, X } from 'lucide-react'

const navItems = [
  { href: '/workspace', label: 'Dashboard', icon: LayoutDashboard, match: (p: string) => p === '/workspace' },
  { href: '/workspace/checks', label: 'Checks', icon: ClipboardCheck, match: (p: string) => p.startsWith('/workspace/checks') },
  { href: '/workspace/documents', label: 'Documents', icon: FileText, match: (p: string) => p.startsWith('/workspace/documents') },
  { href: '/workspace/acceptance-packs', label: 'Acceptance Packs', icon: Package, match: (p: string) => p.startsWith('/workspace/acceptance-packs') },
  { href: '/workspace/settings', label: 'Settings', icon: Settings, match: (p: string) => p.startsWith('/workspace/settings') },
]

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar-top">
          <Link href="/" className="app-sidebar-logo" aria-label="ProofPay home">
            <span className="logo-mark">
              <ShieldCheck size={17} />
            </span>
            <span className="font-mono text-[14px] font-semibold tracking-[-0.04em]">
              proof<span className="text-primary">pay</span>
            </span>
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="icon-button app-menu-toggle"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        <nav className={`app-nav ${menuOpen ? 'open' : ''}`}>
          {navItems.map((item) => {
            const active = item.match(pathname)
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={`app-nav-link ${active ? 'active' : ''}`}>
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            )
          })}
          <div className="app-sidebar-footer app-sidebar-footer-mobile">
            <div className="avatar">AK</div>
            <span>Signed in as Aarav K.</span>
          </div>
        </nav>
        <div className="app-sidebar-footer app-sidebar-footer-desktop">
          <div className="avatar">AK</div>
          <span>Signed in as Aarav K.</span>
        </div>
      </aside>
      <div className="app-main-wrap">
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
