'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { CheckCircle, Clock, MapPin, User, Phone, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function CustomCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')
  
  const [order, setOrder] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [instagram, setInstagram] = useState('')

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    async function fetchOrderData() {
      try {
        // Fetch order
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*, products(*), stores(*)')
          .eq('id', orderId)
          .single()

        if (orderErr || !orderData) {
          console.error(orderErr)
          setLoading(false)
          return
        }

        setOrder(orderData)
        setProduct(orderData.products)
        setStore(orderData.stores)
        
        // Pre-fill form if customer already existed in order
        setName(orderData.customer_name || '')
        setPhone(orderData.customer_phone || '')
        setAddress(orderData.delivery_address || '')
        setInstagram(orderData.customer_instagram || '')
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [orderId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!order) return
    setSubmitting(true)

    try {
      // 1. Update order with customer details
      const { error: updateErr } = await supabase
        .from('orders')
        .update({
          customer_name: name,
          customer_phone: phone,
          customer_instagram: instagram || null,
          delivery_address: address,
          status: 'PENDING' // Ensure it's active
        })
        .eq('id', order.id)

      if (updateErr) throw updateErr

      // 2. Log/Update customer in CRM (customers table)
      await supabase.from('customers').insert({
        store_id: store.id,
        name: name,
        phone: phone,
        instagram: instagram || undefined,
        address: address
      }).select()

      setSuccess(true)
    } catch (err: any) {
      alert("Error confirming checkout: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!orderId || !order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center">
          <XCircleIcon className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-900">Checkout Link Invalid</h2>
          <p className="text-sm text-neutral-500 mt-1">This checkout link is broken or does not exist.</p>
        </div>
        <Link href={`/${slug}`} className="bg-neutral-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
          Go to Storefront
        </Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center items-center px-6 text-center text-white relative overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-green-500/25 text-green-400 rounded-2xl flex items-center justify-center mx-auto border border-green-500/30 animate-pulse">
            <CheckCircle className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Order Details Captured!</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Your details have been successfully sent to <span className="font-bold text-white">{store.store_name}</span>. The merchant has been notified and will verify your transfer shortly.
            </p>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-neutral-500">
              Reference Code: <span className="font-mono font-bold text-neutral-300">#{order.id.slice(0, 8).toUpperCase()}</span>
            </p>
          </div>

          <Link 
            href={`/${slug}`}
            className="block w-full bg-neutral-800 text-neutral-300 py-3.5 rounded-2xl font-bold text-xs border border-white/5 hover:bg-neutral-700 transition-all"
          >
            Return to Store
          </Link>
        </div>
      </div>
    )
  }

  const cleanPhone = store.whatsapp_number.replace(/[^0-9]/g, '').replace(/^0/, '234')

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-sans pb-16 flex flex-col">
      <header className="bg-white border-b border-neutral-100 px-4 py-3.5 sticky top-0 z-10 flex items-center gap-3">
        <Link href={`/${slug}`} className="p-2 -ml-2 rounded-full hover:bg-neutral-50 text-neutral-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-neutral-900 text-sm">Negotiated Checkout</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-6">
        
        {/* Negotiated Pricing & Product Card */}
        <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-sm space-y-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-neutral-50 rounded-lg border border-neutral-100 overflow-hidden shrink-0">
              <img src={product?.image_url} alt={product?.name} className="w-full h-full object-cover p-1" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="bg-amber-50 text-amber-800 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-amber-100">Special Discount Price</span>
              <h4 className="font-bold text-sm text-neutral-900 truncate mt-1.5">{product?.name}</h4>
              {order.specification && <p className="text-xs text-neutral-500 mt-0.5">{order.specification}</p>}
            </div>
          </div>

          <div className="flex justify-between items-baseline border-t border-neutral-100 pt-3">
            <span className="text-xs text-neutral-500 font-medium">Negotiated Price ({order.quantity}x)</span>
            <span className="text-lg font-black text-neutral-950">₦{order.total_price.toLocaleString()}</span>
          </div>
        </div>

        {/* Customer Information Form */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-100 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-neutral-900 text-sm">Delivery Information</h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed">Fill in your exact details. The storefront vendor will use this to dispatch your items and issue a receipt.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-800">Your Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Simi Cole"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-800">Phone Number (WhatsApp)</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="tel"
                  required
                  placeholder="e.g. 08031234567"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-800">Instagram Handle (Optional)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-semibold">@</span>
                <input
                  type="text"
                  placeholder="e.g. simi_cole"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value.replace('@', ''))}
                  className="w-full pl-8 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-neutral-800">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-neutral-400" />
                <textarea
                  required
                  rows={3}
                  placeholder="Street Address, City, State"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{ backgroundColor: store.accent_color || '#00A859' }}
              className="w-full text-white font-extrabold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md mt-4"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Order Details'}
            </button>
          </form>
        </div>

      </main>
    </div>
  )
}

function XCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}
