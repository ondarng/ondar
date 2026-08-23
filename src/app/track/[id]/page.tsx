'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  Package,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  MessageCircle,
  Copy,
  Check,
  ShieldCheck,
  Building2,
  CreditCard,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from 'lucide-react'

export default function OrderTrackingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [order, setOrder] = useState<any>(null)
  const [store, setStore] = useState<any>(null)
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedBank, setCopiedBank] = useState(false)
  const [copiedOrderRef, setCopiedOrderRef] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadOrder() {
      try {
        setLoading(true)
        setError('')

        const cleanId = decodeURIComponent(id).trim()

        // 1. Try finding by exact ID or partial ID
        let query = supabase.from('orders').select('*, stores(*), products(*)')

        if (cleanId.length === 36 && cleanId.includes('-')) {
          // UUID lookup
          query = query.eq('id', cleanId)
        } else {
          // Lookup by prefix or ID containing string
          const rawSuffix = cleanId.replace(/^(ORD-|ONDR-|ON-)/i, '').toLowerCase()
          query = query.or(`id.ilike.%${rawSuffix}%`)
        }

        const { data, error: fetchErr } = await query.maybeSingle()

        if (fetchErr || !data) {
          setError('Order not found. Please check your order reference and try again.')
          return
        }

        setOrder(data)
        if (data.stores) setStore(data.stores)
        if (data.products) setProduct(data.products)
      } catch (err: any) {
        setError(err.message || 'Error loading order tracking details.')
      } finally {
        setLoading(false)
      }
    }

    loadOrder()
  }, [id])

  const copyToClipboard = (text: string, type: 'bank' | 'ref') => {
    navigator.clipboard.writeText(text)
    if (type === 'bank') {
      setCopiedBank(true)
      setTimeout(() => setCopiedBank(false), 2000)
    } else {
      setCopiedOrderRef(true)
      setTimeout(() => setCopiedOrderRef(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 space-y-3">
        <Loader2 className="w-8 h-8 text-[#00A859] animate-spin" />
        <p className="text-xs font-bold text-slate-500">Locating order tracking details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-4">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-3xl mx-auto flex items-center justify-center">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Order Not Found</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            {error || 'We could not find an order matching this reference. It may have expired or been removed.'}
          </p>
          <Link
            href="/track"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-black text-white font-bold text-xs hover:bg-slate-800 transition-colors w-full"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Try Another Order Number</span>
          </Link>
        </div>
      </div>
    )
  }

  const orderRef = order.id ? 'ORD-' + order.id.slice(0, 8).toUpperCase() : 'ORD-N/A'
  const isPaid = order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED'
  const isShipped = order.status === 'SHIPPED' || order.status === 'DELIVERED'
  const isDelivered = order.status === 'DELIVERED'

  // Current milestone index (0 to 4)
  let currentStep = 0
  if (order.status === 'PENDING') currentStep = 0
  else if (order.status === 'PAID') currentStep = 2 // In Prep
  else if (order.status === 'SHIPPED') currentStep = 3 // Dispatched
  else if (order.status === 'DELIVERED') currentStep = 4 // Delivered

  const cleanStorePhone = store?.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-24 selection:bg-[#00A859] selection:text-white">
      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/track" className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-black">
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="text-center">
            <h1 className="font-black text-slate-900 text-xs md:text-sm tracking-tight">{store?.store_name || 'Store'}</h1>
            <p className="text-[10px] text-slate-500 font-bold">{orderRef}</p>
          </div>

          {store?.slug ? (
            <Link
              href={`/${store.slug}`}
              className="text-[11px] font-bold text-[#00A859] hover:underline"
            >
              Visit Store →
            </Link>
          ) : (
            <div className="w-8" />
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl mx-auto px-4 pt-5 space-y-4">
        
        {/* Status Highlight Banner */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Live Order Status
            </span>
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                isDelivered
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isShipped
                  ? 'bg-purple-50 text-purple-800 border-purple-200'
                  : isPaid
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
            >
              {isDelivered
                ? 'Delivered ✓'
                : isShipped
                ? 'Out for Delivery 🛵'
                : isPaid
                ? 'Processing / Packing'
                : 'Payment Verifying ⏳'}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="pt-2 space-y-5">
            {/* Step 1 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  currentStep >= 0 ? 'bg-[#00A859] text-white shadow-xs' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900">Order Placed</h4>
                <p className="text-[11px] text-slate-500">Order logged into merchant system.</p>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">
                {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  currentStep >= 1 || isPaid
                    ? 'bg-[#00A859] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold ${isPaid ? 'text-slate-900' : 'text-slate-500'}`}>
                  Payment Verification
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isPaid ? 'Bank transfer confirmed by vendor ✓' : 'Seller is verifying payment receipt & bank alert.'}
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  currentStep >= 2 || isPaid
                    ? 'bg-[#00A859] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold ${currentStep >= 2 ? 'text-slate-900' : 'text-slate-500'}`}>
                  Preparing & Quality Check
                </h4>
                <p className="text-[11px] text-slate-500">Items being boxed and prepared for dispatch.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  isShipped ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold ${isShipped ? 'text-slate-900' : 'text-slate-500'}`}>
                  Handed to Dispatch Courier
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isShipped ? 'Dispatched with delivery rider.' : 'Awaiting dispatch pickup.'}
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                  isDelivered ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold ${isDelivered ? 'text-slate-900' : 'text-slate-500'}`}>
                  Delivered
                </h4>
                <p className="text-[11px] text-slate-500">Package handed over to customer.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Verification Reminder (If still pending vendor confirmation) */}
        {!isPaid && store?.bank_account_number && (
          <section className="bg-amber-50 rounded-3xl border border-amber-200 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-amber-700" />
              <span>Payment Verification in Progress</span>
            </div>

            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Please ensure you have completed your bank transfer of <strong>₦{Number(order.total_price).toLocaleString()}</strong> to the vendor account below so the seller can verify and dispatch your order. If you already transferred, the seller will update this status shortly!
            </p>

            <div className="bg-white rounded-2xl p-4 border border-amber-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Bank Name:</span>
                <span className="font-extrabold text-slate-900">{store.bank_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Account Number:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-slate-900 text-sm">{store.bank_account_number}</span>
                  <button
                    onClick={() => copyToClipboard(store.bank_account_number, 'bank')}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold"
                  >
                    {copiedBank ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Account Name:</span>
                <span className="font-extrabold text-slate-900">{store.bank_account_name || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-amber-800 pt-1">
              <span>Order Reference: <strong>{orderRef}</strong></span>
              <button
                onClick={() => copyToClipboard(orderRef, 'ref')}
                className="text-amber-900 font-black underline"
              >
                {copiedOrderRef ? 'Copied ✓' : 'Copy Reference'}
              </button>
            </div>
          </section>
        )}

        {/* Order Details & Summary */}
        <section className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Items in this Order
          </h3>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-2.5">
                {product?.image_url && (
                  <img src={product.image_url} alt="" className="w-10 h-10 object-cover rounded-xl bg-slate-50 border border-slate-200" />
                )}
                <div>
                  <h4 className="font-bold text-slate-900">
                    {order.quantity}x {product?.name || 'Item'}
                  </h4>
                  {order.specification && (
                    <span className="text-[10px] text-slate-400 font-bold">Variant: {order.specification}</span>
                  )}
                </div>
              </div>
              <span className="font-black text-slate-900">₦{Number(order.total_price).toLocaleString()}</span>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between font-bold">
              <span>Customer:</span>
              <span className="text-slate-900">{order.customer_name || 'Customer'}</span>
            </div>
            {order.delivery_address && (
              <div className="flex justify-between font-bold">
                <span>Delivery Destination:</span>
                <span className="text-slate-900 text-right max-w-[200px] truncate">{order.delivery_address}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-sm text-slate-900 pt-1 border-t border-slate-100">
              <span>Total:</span>
              <span className="text-[#00A859]">₦{Number(order.total_price).toLocaleString()}</span>
            </div>
          </div>
        </section>

        {/* Direct WhatsApp Support */}
        {cleanStorePhone && (
          <a
            href={`https://wa.me/${cleanStorePhone}?text=${encodeURIComponent(
              `Hi ${store?.store_name}! I am checking on my order ${orderRef}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-md"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat with {store?.store_name || 'Seller'} on WhatsApp</span>
          </a>
        )}
      </main>
    </div>
  )
}
