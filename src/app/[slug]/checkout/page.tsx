'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  ShoppingBag,
  MessageSquare,
  User,
  Phone,
  MapPin,
  FileText,
  ArrowLeft,
  Loader2,
  ShieldCheck,
} from 'lucide-react'
import Link from 'next/link'

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  variantName: string | null
}

export default function WhatsAppCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [store, setStore] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Single order fallback mode (for negotiated checkout links)
  const [legacyOrder, setLegacyOrder] = useState<any>(null)
  const [legacyProduct, setLegacyProduct] = useState<any>(null)

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  // Load saved customer details
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ondar-saved-customer')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.name) setName(parsed.name)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.address) setAddress(parsed.address)
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Load Store & Cart / Legacy Order
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // 1. Fetch store
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('slug', slug)
          .single()

        if (storeData) setStore(storeData)

        // 2. If legacy order_id in query string
        if (orderId) {
          const { data: orderData } = await supabase
            .from('orders')
            .select('*, products(*), stores(*)')
            .eq('id', orderId)
            .single()

          if (orderData) {
            setLegacyOrder(orderData)
            setLegacyProduct(orderData.products)
            if (orderData.stores) setStore(orderData.stores)
          }
        }

        // 3. Load cart items from localStorage
        const storedCart = localStorage.getItem(`ondar-cart-${slug}`)
        if (storedCart) {
          try {
            setCart(JSON.parse(storedCart))
          } catch (e) {
            console.error(e)
          }
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [slug, orderId])

  const subtotal = legacyOrder
    ? Number(legacyOrder.total_price)
    : cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

  const totalItems = legacyOrder
    ? legacyOrder.quantity
    : cart.reduce((acc, item) => acc + item.quantity, 0)

  const handleCompleteWhatsAppOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      // Save customer details
      try {
        localStorage.setItem('ondar-saved-customer', JSON.stringify({ name, phone, address }))
      } catch {}

      let refCode = Math.random().toString(36).substring(2, 8).toUpperCase()

      // Record in backend database
      try {
        if (legacyOrder) {
          await supabase
            .from('orders')
            .update({
              customer_name: name || 'WhatsApp Customer',
              customer_phone: phone || 'WhatsApp Order',
              delivery_address: address || '[WHATSAPP] In Chat',
              customer_note: customerNote || null,
              status: 'PENDING',
            })
            .eq('id', legacyOrder.id)

          refCode = legacyOrder.id.slice(0, 8).toUpperCase()
        } else {
          const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              store_id: store.id,
              items: cart.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
                variant_name: item.variantName || null,
              })),
              customer_name: name || 'WhatsApp Customer',
              customer_phone: phone || 'WhatsApp Order',
              delivery_address: address || '[WHATSAPP] In Chat',
              checkout_mode: 'whatsapp',
              customer_note: customerNote || null,
            }),
          })
          const res = await response.json()
          if (res.order_ids?.[0]) refCode = res.order_ids[0].slice(0, 8).toUpperCase()
        }
      } catch (err) {
        console.warn('Backend order insert skipped:', err)
      }

      // Format prefilled message
      const itemsList = legacyOrder
        ? `• ${legacyOrder.quantity}x ${legacyProduct?.name || 'Item'} - ₦${Number(legacyOrder.total_price).toLocaleString()}`
        : cart
            .map((item) => `• ${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''} - ₦${(item.price * item.quantity).toLocaleString()}`)
            .join('\n')

      const detailsList = []
      if (name) detailsList.push(`Name: ${name}`)
      if (phone) detailsList.push(`Phone: ${phone}`)
      if (address) detailsList.push(`Address: ${address}`)
      if (customerNote) detailsList.push(`Note: ${customerNote}`)

      const detailsSection =
        detailsList.length > 0
          ? `\n\n*Customer Info:*\n${detailsList.join('\n')}`
          : '\n\n*(I will provide delivery details directly in this chat)*'

      const cleanPhone = store?.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
      const message = `Hi ${store?.store_name}! I would like to place order #${refCode}:\n\n${itemsList}\n\n*Total:* ₦${subtotal.toLocaleString()}${detailsSection}`

      // Clear cart & redirect
      localStorage.removeItem(`ondar-cart-${slug}`)
      window.dispatchEvent(new Event('ondar-cart-updated'))

      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
      router.push(`/${slug}`)
    } catch (err: any) {
      alert('Checkout error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/${slug}`}
            className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-black text-slate-900 text-sm tracking-tight">{store?.store_name || 'Store'}</h1>
            <p className="text-[10px] text-slate-500">WhatsApp Order Checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>WhatsApp DM</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Order Summary */}
        <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-slate-600" />
              <span>Order Summary ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
            </h2>
            <Link href={`/${slug}`} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline">
              Edit Cart
            </Link>
          </div>

          {legacyOrder ? (
            <div className="flex gap-3 items-center py-1">
              <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                <img src={legacyProduct?.image_url} alt={legacyProduct?.name} className="w-full h-full object-cover p-1" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-slate-900 truncate">{legacyProduct?.name}</h4>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">₦{subtotal.toLocaleString()}</p>
              </div>
            </div>
          ) : cart.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2 truncate pr-2">
                    <span className="font-black text-slate-400 text-[11px]">{item.quantity}x</span>
                    <span className="font-bold text-slate-800 truncate">
                      {item.name} {item.variantName ? `(${item.variantName})` : ''}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">₦{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-2 text-center">Your cart is empty. <Link href={`/${slug}`} className="underline font-bold">Return to store</Link></p>
          )}

          <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline font-black text-sm">
            <span className="text-slate-600 text-xs">Total Amount</span>
            <span className="text-slate-900 text-base">₦{subtotal.toLocaleString()}</span>
          </div>
        </section>

        {/* Customer Form */}
        <form onSubmit={handleCompleteWhatsAppOrder} className="space-y-4">
          <section className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Contact & Delivery Info</h2>

            <div className="space-y-2.5">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Your Full Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  placeholder="WhatsApp Phone Number (Optional)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows={2}
                  placeholder="Delivery Address (Optional)"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium resize-none"
                />
              </div>

              <div className="relative">
                <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  rows={2}
                  placeholder="Note to Seller (Optional, e.g. deliver after 2pm)"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium resize-none"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#25D366] text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{submitting ? 'Redirecting to WhatsApp...' : `Submit & Order on WhatsApp (₦${subtotal.toLocaleString()}) →`}</span>
          </button>
        </form>
      </main>
    </div>
  )
}
