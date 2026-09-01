'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    router.push('/workspace')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-9 flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-2" aria-label="ProofPay home">
          <span className="logo-mark">
            <ShieldCheck size={20} />
          </span>
          <span className="font-mono text-[16px] font-semibold tracking-[-0.04em]">
            proof<span className="text-primary">pay</span>
          </span>
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">Check before you chase.</p>
      </div>

      <div className="auth-card">
        <h1 className="text-2xl font-semibold tracking-[-0.03em]">Welcome back</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Sign in to your ProofPay workspace</p>

        <form onSubmit={handleSignIn} className="mt-7 flex flex-col gap-5">
          <div className="field-group">
            <label htmlFor="email" className="label">
              Work email
            </label>
            <input
              id="email"
              type="email"
              required
              placeholder="priya@mehtaparts.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input"
            />
          </div>
          <div className="field-group">
            <div className="field-row-top">
              <label htmlFor="password" className="label">
                Password
              </label>
              <button type="button" className="text-xs font-medium text-primary">
                Forgot?
              </button>
            </div>
            <input
              id="password"
              type="password"
              required
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input"
            />
          </div>
          <Button type="submit" className="mt-1 h-11 w-full rounded-full">
            Sign in <ArrowRight data-icon="inline-end" />
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <button onClick={() => router.push('/workspace')} className="font-medium text-foreground underline decoration-border underline-offset-4 hover:decoration-primary">
            Create account
          </button>
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
    </main>
  )
}
