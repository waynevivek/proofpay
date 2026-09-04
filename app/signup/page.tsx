'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ShieldCheck, Lock, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    router.push('/workspace')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* ── Logo ── */}
      <header style={{ padding: '28px 64px' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }} aria-label="ProofPay home">
          <span className="logo-mark"><ShieldCheck size={18} /></span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: '15px', fontWeight: 600, letterSpacing: '-0.04em', color: 'var(--foreground)' }}>
            proof<span style={{ color: 'var(--primary)' }}>pay</span>
          </span>
        </Link>
      </header>

      {/* ── Two-column content ── */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 64px 40px' }}>
        <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '64px' }}>

          {/* Left – headline */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: 'clamp(3rem, 6.5vw, 5.2rem)',
              fontWeight: 750,
              lineHeight: 0.97,
              letterSpacing: '-0.055em',
              margin: 0,
            }}>
              Stop chasing.<br />
              Start verifying with{' '}
              <em>proof.</em>
            </h1>
            <p style={{ marginTop: '24px', fontSize: '15px', lineHeight: 1.65, color: 'var(--muted-foreground)', maxWidth: '340px' }}>
              Upload your documents, let ProofPay reconcile the details, and know exactly where every payment stands.
            </p>
            <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                <Lock size={13} strokeWidth={2} /> Your documents stay private
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--muted-foreground)' }}>
                <Zap size={13} strokeWidth={2} /> Results in under 30 seconds
              </span>
            </div>
          </div>

          {/* Right – auth card */}
          <div style={{ width: '360px', flexShrink: 0 }}>
            <div className="auth-card">
              <p className="label">Get Started Free</p>
              <h2 style={{ marginTop: '8px', fontSize: '1.7rem', fontWeight: 600, letterSpacing: '-0.03em', lineHeight: 1.2 }}>Create your account</h2>
              <p style={{ marginTop: '6px', fontSize: '14px', color: 'var(--muted-foreground)' }}>Start verifying payments in minutes.</p>

              <form onSubmit={handleCreateAccount} style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="field-group">
                  <label htmlFor="full-name" className="label">Full name</label>
                  <input
                    id="full-name"
                    type="text"
                    required
                    placeholder="Priya Mehta"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="email" className="label">Work email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="priya@mehtaparts.in"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="field-input"
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="password" className="label">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="field-input"
                  />
                </div>
                <Button type="submit" className="mt-1 h-11 w-full rounded-full">
                  Create account <ArrowRight data-icon="inline-end" />
                </Button>
              </form>

              <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: 'var(--muted-foreground)' }}>
                Already have an account?{' '}
                <Link href="/login" style={{ fontWeight: 500, color: 'var(--foreground)', textDecoration: 'underline', textDecorationColor: 'var(--border)', textUnderlineOffset: '4px' }}>
                  Sign in
                </Link>
              </p>

              <div className="divider-row">or</div>

              <button onClick={() => router.push('/workspace')} className="google-btn">
                <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
                  <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6 29.6 4 24 4c-7.4 0-13.8 4.2-17.7 10.7z" />
                  <path fill="#4CAF50" d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36.3 24 36.3c-5.2 0-9.6-3.4-11.2-8.1l-6.6 5.1C9.9 39.7 16.4 44 24 44z" />
                  <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.4l6.6 5.4C41.4 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z" />
                </svg>
                Continue with Google
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          header { padding: 20px 24px !important; }
          main { padding: 0 24px 40px !important; }
          main > div { flex-direction: column !important; gap: 32px !important; }
          main > div > div:last-child { width: 100% !important; }
        }
      `}</style>
    </div>
  )
}
