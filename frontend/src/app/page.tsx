'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    google?: any
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''

export default function HomePage() {
  const router = useRouter()
  const [errorMessage, setErrorMessage] = useState('')
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const completeSignIn = (emailAddress: string) => {
    window.localStorage.setItem('lexguardUserEmail', emailAddress)
    router.push('/dashboard')
  }

  const parseJwt = (jwt: string) => {
    try {
      const base64Url = jwt.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const decoded = window.atob(base64)
      return JSON.parse(decodeURIComponent(escape(decoded)))
    } catch {
      return null
    }
  }

  const handleCredentialResponse = (response: { credential: string }) => {
    const payload = parseJwt(response.credential)
    const email = payload?.email

    if (!email) {
      setErrorMessage('Google sign-in returned no email address.')
      return
    }

    completeSignIn(email)
  }

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return

    const src = 'https://accounts.google.com/gsi/client'
    const existingScript = document.querySelector(`script[src="${src}"]`)
    if (!existingScript) {
      const script = document.createElement('script')
      script.src = src
      script.async = true
      script.defer = true
      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            ux_mode: 'popup',
            cancel_on_tap_outside: false,
            auto_select: false,
          })
          if (googleButtonRef.current) {
            window.google.accounts.id.renderButton(googleButtonRef.current, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              text: 'signin_with',
            })
          }
          window.google.accounts.id.disableAutoSelect()
        }
      }
      script.onerror = () => {
        setErrorMessage('Failed to load Google sign-in. Check your connection and try again.')
      }
      document.head.appendChild(script)
      return
    }

    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        ux_mode: 'popup',
        cancel_on_tap_outside: false,
        auto_select: false,
      })
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
        })
      }
      window.google.accounts.id.disableAutoSelect()
    }
  }, [])


  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-20 h-[320px] w-[320px] rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute left-10 bottom-28 h-[260px] w-[260px] rounded-full bg-violet-400/10 blur-3xl" />

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 shadow-lg shadow-emerald-500/10">
                Launch with legal confidence — designed for startups and regulated teams.
              </div>
              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-tight text-white sm:text-6xl">
                  Legal clarity for every product launch, policy review, and regulatory decision.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                  LexGuard combines AI review, policy mapping, and compliance insights into one elegant platform, so your team can move fast without losing control.
                </p>
              </div>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div ref={googleButtonRef} className="mt-1" />
                <a
                  href="#features"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10"
                >
                  Explore features
                </a>
              </div>
              <div className="mt-3 min-h-[1.5rem] text-sm">
                {errorMessage && <p className="text-rose-300">{errorMessage}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { label: 'Global compliance', value: 'Europe, USA, India, Australia' },
                  { label: 'Domain expertise', value: 'AI, fintech, healthcare, crypto' },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.75rem] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{item.label}</p>
                    <p className="mt-3 text-lg font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/40">
              <div className="absolute -right-16 top-6 h-36 w-36 rounded-full bg-emerald-400/20 blur-3xl" />
              <div className="absolute left-6 top-20 h-24 w-24 rounded-full bg-sky-400/20 blur-3xl" />
              <div className="absolute right-14 bottom-12 h-28 w-28 rounded-full bg-violet-400/10 blur-3xl" />

              <div className="relative z-10 grid gap-6">
                <div className="space-y-4 rounded-[1.75rem] bg-slate-950/95 p-6 shadow-xl shadow-slate-950/30">
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Featured Intelligence</p>
                  <h2 className="text-3xl font-semibold text-white">Policy-ready legal insights in minutes</h2>
                  <p className="text-sm leading-7 text-slate-300">
                    Upload your brief, describe your idea, and get instant compliance guidance tailored to your product and region.
                  </p>
                </div>

                <div className="overflow-hidden rounded-[1.75rem] border border-white/10 shadow-xl shadow-slate-950/30">
                  <img
                    className="h-[360px] w-full object-cover"
                    src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80"
                    alt="Team collaborating on legal strategy"
                    loading="lazy"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Strategy', value: 'Policy-first launch' },
                    { label: 'Speed', value: 'Minutes to insight' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-slate-950/95 p-4 text-sm text-slate-300">
                      <p className="uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                      <p className="mt-2 font-semibold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="mt-20 grid gap-8 lg:grid-cols-3">
            <div className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">About LexGuard</p>
              <h2 className="mt-6 text-3xl font-semibold text-white">A smoother legal workflow for modern teams.</h2>
              <p className="mt-5 text-base leading-7 text-slate-300">
                LexGuard helps founders, legal operators, and product owners collaborate around risk, policy, and compliance — with rich context, clear summaries, and a confident next step.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/5 p-10 shadow-2xl shadow-slate-950/10">
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">What you get</p>
              <ul className="mt-8 space-y-5 text-slate-300">
                {[
                  'Automated legality scoring for new product designs',
                  'Policy mapping across key jurisdictions',
                  'Clear action items for product & compliance teams',
                ].map((item) => (
                  <li key={item} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[2rem] bg-slate-900/90 p-10 shadow-2xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Built for</p>
              <div className="mt-8 space-y-5 text-slate-200">
                {[
                  { label: 'Legal teams', detail: 'Spot risk earlier and keep stakeholders aligned.' },
                  { label: 'Founders', detail: 'Get fast compliance clarity before launch.' },
                  { label: 'Product', detail: 'Design with policy context baked in.' },
                ].map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-5">
                    <p className="text-base font-semibold text-white">{item.label}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
