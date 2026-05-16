'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { posthog } from '@/lib/posthog'
import { ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleGoogleSignup = async () => {
    setGoogleLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding/create-store`,
      },
    })
    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/create-store`,
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    posthog.capture('signup_completed', { email: email.trim() })
    router.push('/onboarding/create-store')
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12 justify-center">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="space-y-2">
          <img src="/icon.png" alt="Ondar" className="w-12 h-12 mb-4" />
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary-900">
            Create your store
          </h1>
          <p className="text-secondary font-sans">
            Join thousands of Nigerian vendors selling simply.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignup}
            disabled={googleLoading || loading}
            className="w-full bg-white border-2 border-slate-200 text-primary-900 font-bold py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {googleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-primary-900" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900"
                placeholder="name@example.com"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-primary-900" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-slate-900 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-accent text-sm font-medium bg-accent/5 p-3 rounded-lg border border-accent/10">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create My Account
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-secondary text-sm">
          Already have a store?{' '}
          <Link href="/login" className="text-primary-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}
