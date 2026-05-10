'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { posthog } from '@/lib/posthog'
import { Check, Copy, Share2, Rocket, ExternalLink, ArrowRight } from 'lucide-react'

export default function ShareStorePage() {
  const [slug, setSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getStore() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: store } = await supabase
        .from('stores')
        .select('slug')
        .eq('vendor_id', user.id)
        .single()

      if (!store) {
        router.push('/onboarding/create-store')
        return
      }
      setSlug(store.slug)
    }
    getStore()
  }, [])

  const storeUrl = slug ? `localhost:3000/${slug}` : ''
  const fullUrl = slug ? `${window.location.origin}/${slug}` : ''

  const handleCopy = () => {
    navigator.clipboard.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    posthog.capture('store_shared', { method: 'copy_link', slug })
  }

  const handleShareWhatsApp = () => {
    const text = `Hey! I just launched my online store on Ondar. Check out my products here: ${fullUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    posthog.capture('store_shared', { method: 'whatsapp', slug })
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 px-6 py-12 justify-center">
      <div className="w-full max-w-md mx-auto space-y-8 text-center">
        <div className="flex items-center justify-center gap-2 text-primary-600 font-bold mb-8">
          <div className="w-8 h-1 bg-primary-600 rounded-full" />
          <div className="w-8 h-1 bg-primary-600 rounded-full" />
          <div className="w-8 h-1 bg-primary-600 rounded-full" />
          <span className="ml-2 text-xs uppercase tracking-widest">Final Step</span>
        </div>

        <div className="flex justify-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 animate-bounce">
            <Rocket className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary-900">
            You're live!
          </h1>
          <p className="text-secondary font-sans">
            Your store is ready. Now share it with your customers on WhatsApp or Instagram to start getting orders.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-border flex items-center justify-between group">
            <span className="text-primary-900 font-medium truncate pr-4">
              {storeUrl}
            </span>
            <button 
              onClick={handleCopy}
              className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-primary-600"
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          <button
            onClick={handleShareWhatsApp}
            className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            Share on WhatsApp
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Go to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <button 
          onClick={() => window.open(fullUrl, '_blank')}
          className="inline-flex items-center gap-1 text-sm text-secondary font-medium hover:text-primary-600 transition-colors"
        >
          View your store as a customer
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
