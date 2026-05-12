'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowRight, Loader2, Mail, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      setError(loginError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  const handleMagicLink = async () => {
    if (!email) {
      setError('Please enter your email first')
      return
    }
    setMagicLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }
    setMagicLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-white px-6 py-12 justify-center">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="space-y-2 text-center">
          <img src="/icon.png" alt="Ondar" className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary-900">
            Welcome back
          </h1>
          <p className="text-secondary font-sans">
            Manage your store and orders.
          </p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-primary-900" htmlFor="password">
                  Password
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs font-bold text-primary-600 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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

            {message && (
              <p className="text-[#00A859] text-sm font-medium bg-[#00A859]/5 p-3 rounded-lg border border-[#00A859]/10">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || magicLoading}
              className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Login to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs font-bold text-secondary uppercase tracking-widest">Or</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          <button
            onClick={handleMagicLink}
            disabled={loading || magicLoading}
            className="w-full bg-white border-2 border-slate-200 text-primary-900 font-bold py-3.5 rounded-xl hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {magicLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Mail className="w-5 h-5" />
                Sign in with Magic Link
              </>
            )}
          </button>
        </div>

        <p className="text-center text-secondary text-sm">
          Don't have a store yet?{' '}
          <Link href="/signup" className="text-primary-600 font-bold hover:underline">
            Start selling
          </Link>
        </p>
      </div>
    </div>
  )
}
