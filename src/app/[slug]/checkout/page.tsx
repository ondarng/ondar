'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  CheckCircle,
  Building2,
  Copy,
  Check,
  Upload,
  X,
  User,
  Phone,
  MapPin,
  FileText,
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
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

export default function DedicatedCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
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
  const [instagram, setInstagram] = useState('')
  const [customerNote, setCustomerNote] = useState('')

  // Checkout Mode & Payment
  const [checkoutMode, setCheckoutMode] = useState<'direct' | 'whatsapp'>('direct')
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null)
  const [copiedAccount, setCopiedAccount] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{ id: string; ref: string } | null>(null)

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
        if (parsed.instagram) setInstagram(parsed.instagram)
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

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setReceiptDataUrl(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const copyAccountNumber = () => {
    if (!store?.bank_account_number) return
    navigator.clipboard.writeText(store.bank_account_number)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !phone || !address) {
      alert('Please fill in your name, phone number, and delivery address.')
      return
    }

    // Save details for next session
    try {
      localStorage.setItem('ondar-saved-customer', JSON.stringify({ name, phone, address, instagram }))
    } catch {}

    setSubmitting(true)

    try {
      if (checkoutMode === 'whatsapp') {
        // WhatsApp order flow
        const cleanPhone = store?.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
        const ref = Math.random().toString(36).substring(2, 8).toUpperCase()

        const itemsList = legacyOrder
          ? `• ${legacyOrder.quantity}x ${legacyProduct?.name || 'Item'} - ₦${Number(legacyOrder.total_price).toLocaleString()}`
          : cart
              .map((item) => `• ${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''} - ₦${(item.price * item.quantity).toLocaleString()}`)
              .join('\n')

        const message = `Hi ${store?.store_name}! I would like to place order #${ref}:\n\n${itemsList}\n\n*Total:* ₦${subtotal.toLocaleString()}\n\n*Delivery Info:*\nName: ${name}\nPhone: ${phone}\nAddress: ${address}${customerNote ? `\nNote: ${customerNote}` : ''}`

        // Clear Cart
        localStorage.removeItem(`ondar-cart-${slug}`)
        window.dispatchEvent(new Event('ondar-cart-updated'))

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
        router.push(`/${slug}`)
      } else {
        // Direct Checkout flow
        if (legacyOrder) {
          // Update legacy order
          await supabase
            .from('orders')
            .update({
              customer_name: name,
              customer_phone: phone,
              delivery_address: address,
              customer_instagram: instagram || null,
              customer_note: customerNote || null,
              payment_receipt_url: receiptDataUrl || null,
              status: 'PENDING',
            })
            .eq('id', legacyOrder.id)

          const ref = legacyOrder.id.slice(0, 8).toUpperCase()
          setCompletedOrder({ id: legacyOrder.id, ref })
        } else {
          // Send to API
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
              customer_name: name,
              customer_phone: phone,
              customer_instagram: instagram || null,
              delivery_address: address,
              checkout_mode: 'direct',
              customer_note: customerNote || null,
              payment_receipt_url: receiptDataUrl || null,
              payment_method: 'bank_transfer',
            }),
          })

          const result = await response.json()
          if (!response.ok) throw new Error(result.error || 'Checkout failed')

          const firstId = result.order_ids?.[0] || 'SUCCESS'
          const ref = firstId.slice(0, 8).toUpperCase()

          // Clear Cart
          localStorage.removeItem(`ondar-cart-${slug}`)
          window.dispatchEvent(new Event('ondar-cart-updated'))

          setCompletedOrder({ id: firstId, ref })
        }
      }
    } catch (err: any) {
      alert('Checkout error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </div>
    )
  }

  if (completedOrder) {
    const cleanPhone = store?.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
    const waText = encodeURIComponent(
      `Hi ${store?.store_name}, I just placed order #${completedOrder.ref} (₦${subtotal.toLocaleString()}). Please confirm delivery!`
    )

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl text-center space-y-6 shadow-xl border border-slate-200/80">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-900">Order Confirmed!</h2>
            <p className="text-xs text-slate-500">
              Reference:{' '}
              <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                #{completedOrder.ref}
              </span>
            </p>
          </div>

          {/* Bank Transfer Details */}
          {store?.bank_account_number && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2.5 text-xs">
              <p className="font-black text-slate-700 uppercase tracking-wider text-[10px]">Bank Transfer Details</p>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank:</span>
                <span className="font-bold text-slate-900">{store.bank_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Account No:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{store.bank_account_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Name:</span>
                <span className="font-bold text-slate-900">{store.bank_account_name}</span>
              </div>
            </div>
          )}

          {receiptFile && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-center gap-2 text-xs text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Receipt uploaded successfully!</span>
            </div>
          )}

          <div className="space-y-2 pt-2">
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                Notify Vendor on WhatsApp
              </a>
            )}

            <Link
              href={`/${slug}`}
              className="block w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-black transition-all"
            >
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/${slug}`}
            className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-black text-slate-900 text-sm tracking-tight">{store?.store_name || 'Store'}</h1>
            <p className="text-[10px] text-slate-500">Secure Checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Encrypted</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* ── 1. ORDER SUMMARY ── */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
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

        {/* ── 2. CHECKOUT METHOD TOGGLE ── */}
        <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
          <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Select Checkout Method</h2>
          <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCheckoutMode('direct')}
              className={`py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                checkoutMode === 'direct' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Direct Bank Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setCheckoutMode('whatsapp')}
              className={`py-2.5 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                checkoutMode === 'whatsapp' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp DM</span>
            </button>
          </div>
        </section>

        {/* ── 3. CUSTOMER DETAILS FORM ── */}
        <form onSubmit={handleCompleteOrder} className="space-y-4">
          <section className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3">
            <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Delivery Information</h2>

            <div className="space-y-2.5">
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Your Full Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  placeholder="WhatsApp Phone Number *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                />
              </div>

              <div className="relative">
                <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <textarea
                  required
                  rows={2}
                  placeholder="Delivery Address *"
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

          {/* ── 4. BANK DETAILS & PROOF UPLOAD (IF DIRECT CHECKOUT) ── */}
          {checkoutMode === 'direct' && (
            <section className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-200">Bank Transfer Details</h2>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  Direct Payment
                </span>
              </div>

              {store?.bank_account_number ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bank:</span>
                    <span className="font-bold text-white">{store.bank_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Account Number:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{store.bank_account_number}</span>
                      <button
                        type="button"
                        onClick={copyAccountNumber}
                        className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
                        title="Copy Account Number"
                      >
                        {copiedAccount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account Name:</span>
                    <span className="font-bold text-white">{store.bank_account_name}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300">Merchant will provide bank account details upon order confirmation.</p>
              )}

              {/* Upload Proof */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="block text-[11px] font-black text-slate-300 uppercase tracking-wider">
                  Upload Payment Proof (Optional)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/60 rounded-xl cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs font-bold text-slate-200">
                    {receiptFile ? receiptFile.name : 'Tap to attach receipt image'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                </label>

                {receiptDataUrl && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-700 aspect-[3/1] bg-black flex items-center justify-center">
                    <img src={receiptDataUrl} alt="Receipt preview" className="h-full object-contain" />
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptFile(null)
                        setReceiptDataUrl(null)
                      }}
                      className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{ backgroundColor: store?.accent_color || '#00A859' }}
            className="w-full text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md disabled:opacity-50"
          >
            {submitting
              ? 'Processing Order...'
              : checkoutMode === 'whatsapp'
              ? 'Submit & Order via WhatsApp DM →'
              : `Confirm & Submit Order (₦${subtotal.toLocaleString()}) →`}
          </button>
        </form>
      </main>
    </div>
  )
}
