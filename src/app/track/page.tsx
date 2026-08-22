'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, Package, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'

export default function PublicTrackLookupPage() {
  const [orderRef, setOrderRef] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanRef = orderRef.trim()
    if (!cleanRef) {
      setError('Please enter your Order Reference or Order ID (e.g. ONDR-1042 or ORD-ABC123)')
      return
    }

    // Direct to tracking result
    router.push(`/track/${encodeURIComponent(cleanRef)}${phone ? `?phone=${encodeURIComponent(phone.trim())}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-[#00A859] selection:text-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-black text-sm tracking-tight text-slate-900">
            <div className="w-7 h-7 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs">
              O
            </div>
            <span>Ondar Track</span>
          </Link>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
            <span>Live Tracking</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-10 w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-3xl bg-emerald-50 border border-emerald-200 text-[#00A859] mx-auto flex items-center justify-center shadow-xs">
            <Package className="w-7 h-7" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Track Your Order
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Enter your order reference code or order ID sent to you by the vendor to view live delivery status.
          </p>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleSearch} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-bold">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Order Reference / ID:
            </label>
            <div className="relative">
              <Package className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={orderRef}
                onChange={(e) => setOrderRef(e.target.value)}
                placeholder="e.g. ONDR-1042 or ORD-A1B2C3"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 uppercase placeholder:normal-case placeholder:font-medium placeholder:text-slate-400 outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
              Phone Number (Optional Verification):
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 08012345678"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-black focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-black text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-98 transition-all shadow-sm"
          >
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Help Card */}
        <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-800">💡 Can't find your order number?</p>
          <p className="leading-relaxed">
            Check the WhatsApp message or payment receipt sent to you by the merchant. The reference code starts with <strong>ORD-</strong> or <strong>ONDR-</strong>.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400">
        <p>© 2026 Ondar Commerce. Verified merchant fulfillment tracking.</p>
      </footer>
    </div>
  )
}
