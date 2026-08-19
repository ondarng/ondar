'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { posthog } from '@/lib/posthog'
import { ArrowRight, Loader2, Store } from 'lucide-react'

export default function CreateStorePage() {
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // GUARD: If user already has a store, skip this page entirely
  useEffect(() => {
    async function checkExistingStore() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingStore) {
        // User already has a store — check if they have products
        const { count } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('store_id', existingStore.id)

        if ((count || 0) === 0) {
          router.push('/onboarding/add-product')
        } else {
          router.push('/dashboard')
        }
        return
      }

      setPageLoading(false)
    }
    checkExistingStore()
  }, [])

  // Auto-generate slug from store name
  const handleStoreNameChange = (name: string) => {
    setStoreName(name)
    setSlug(name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''))
  }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login')
      return
    }

    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 14)

    const { error: insertError } = await supabase.from('stores').insert({
      vendor_id: user.id,
      store_name: storeName,
      slug: slug,
      whatsapp_number: whatsapp,
      subscription_status: 'TRIAL',
      trial_ends_at: trialEnds.toISOString(),
    })

    if (insertError) {
      setError(insertError.message === 'duplicate key value violates unique constraint "stores_slug_key"' 
        ? 'This store link is already taken. Try another!' 
        : insertError.message)
      setLoading(false)
      return
    }

    posthog.capture('store_created', { store_name: storeName, slug })
    router.push('/onboarding/add-product')
  }

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="flex items-center gap-2 text-primary-600 font-bold">
          <div className="w-8 h-1 bg-primary-600 rounded-full" />
          <div className="w-8 h-1 bg-slate-200 rounded-full" />
          <div className="w-8 h-1 bg-slate-200 rounded-full" />
          <span className="ml-2 text-xs uppercase tracking-widest">Step 1 of 3</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary-900">
            Setup your store
          </h1>
          <p className="text-secondary font-sans">
            This is how customers will see your business.
          </p>
        </div>

        <form onSubmit={handleCreateStore} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-border">
          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900" htmlFor="storeName">
              Store Name
            </label>
            <input
              id="storeName"
              type="text"
              required
              value={storeName}
              onChange={(e) => handleStoreNameChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Tunde's Gadgets"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900" htmlFor="slug">
              Store Link
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-xs">
                {typeof window !== 'undefined' ? window.location.host : ''}/
              </span>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full pl-32 pr-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="my-store"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900" htmlFor="whatsapp">
              WhatsApp Number
            </label>
            <input
              id="whatsapp"
              type="tel"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. 08012345678"
            />
            <p className="text-[10px] text-secondary">Customers will contact you here to confirm payment.</p>
          </div>

          {error && (
            <p className="text-accent text-sm font-medium bg-accent/5 p-3 rounded-lg border border-accent/10">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Next: Add First Product
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
