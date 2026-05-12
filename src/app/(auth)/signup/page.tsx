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
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signUpError } = await supabase.auth.signUp({
      email,
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

    posthog.capture('signup_completed', { email })
    setSuccess(true)
    // Wait a bit to show success message then redirect
    setTimeout(() => {
      router.push('/onboarding/create-store')
    }, 2000)
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

        {success ? (
          <div className="bg-[#00A859]/10 border border-[#00A859]/20 p-6 rounded-2xl text-center space-y-4">
            <div className="w-16 h-16 bg-[#00A859] text-white rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h2 className="text-xl font-bold text-primary-900">Verify your email</h2>
            <p className="text-secondary">
              We've sent a confirmation link to <strong>{email}</strong>. Please check your inbox to continue.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
        )}

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
