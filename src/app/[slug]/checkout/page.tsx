'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
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
  Upload,
  CheckCircle2,
  Building2,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
} from 'lucide-react'
import { compressImage } from '@/lib/image-compression'

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  variantName: string | null
}

export default function StoreCheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const searchParams = useSearchParams()
  const orderId = searchParams.get('order_id')

  const [store, setStore] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // 3-Step Flow (Step 1: Delivery, Step 2: Payment, Step 3: Order Complete)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [paymentMode, setPaymentMode] = useState<'transfer' | 'negotiate'>('transfer')

  // Form state
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  
  // Payment Proof Preference
  const [proofPreference, setProofPreference] = useState<'whatsapp' | 'upload'>('whatsapp')
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null)
  const [receiptSizeKb, setReceiptSizeKb] = useState<number | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)
  const [createdOrderRef, setCreatedOrderRef] = useState<string>('')
  const [createdOrderId, setCreatedOrderId] = useState<string>('')

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
        if (parsed.city) setCity(parsed.city)
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

        // 2. Load cart items from localStorage
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

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  // Receipt Handler with Client Compression
  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingReceipt(true)

    try {
      const compressed = await compressImage(file, 1000, 1000, 0.72)
      setReceiptDataUrl(compressed.dataUrl)
      setReceiptSizeKb(compressed.sizeKb)
    } catch (err) {
      console.warn('Fallback to FileReader:', err)
      const reader = new FileReader()
      reader.onload = (event) => {
        setReceiptDataUrl(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingReceipt(false)
    }
  }

  const copyBankNumber = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedBank(true)
    setTimeout(() => setCopiedBank(false), 2000)
  }

  // Step 1 Validation
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim()) {
      alert('Please provide your name and phone number.')
      return
    }
    // Save to localStorage
    try {
      localStorage.setItem('ondar-saved-customer', JSON.stringify({ name, phone, address, city }))
    } catch {}

    setStep(2)
  }

  // Step 2 Submission -> Step 3
  const handleCompleteOrder = async () => {
    setSubmitting(true)

    try {
      let refCode = 'ONDR-' + Math.random().toString(36).substring(2, 7).toUpperCase()
      let orderDbId = ''

      // Record in Supabase Backend
      try {
        const fullAddress = [address, city].filter(Boolean).join(', ') || '[WHATSAPP] In Chat'
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
            customer_name: name || 'Customer',
            customer_phone: phone || 'WhatsApp Order',
            delivery_address: fullAddress,
            checkout_mode: 'whatsapp',
            customer_note: customerNote || null,
            payment_receipt_url: proofPreference === 'upload' ? receiptDataUrl : null,
            payment_method: paymentMode === 'transfer' ? 'bank_transfer' : 'negotiate_dm',
          }),
        })

        const res = await response.json()
        if (res.order_ids?.[0]) {
          orderDbId = res.order_ids[0]
          refCode = 'ONDR-' + orderDbId.slice(0, 6).toUpperCase()
        }
      } catch (err) {
        console.warn('Backend order insert skipped:', err)
      }

      setCreatedOrderRef(refCode)
      setCreatedOrderId(orderDbId)

      // Clear Cart
      localStorage.removeItem(`ondar-cart-${slug}`)
      window.dispatchEvent(new Event('ondar-cart-updated'))

      // Move to Step 3
      setStep(3)
    } catch (err: any) {
      alert('Checkout error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Open WhatsApp with prefilled message
  const handleOpenWhatsApp = () => {
    const itemsList = cart.length > 0
      ? cart.map((item) => `• ${item.quantity}x ${item.name}${item.variantName ? ` (${item.variantName})` : ''} - ₦${(item.price * item.quantity).toLocaleString()}`).join('\n')
      : 'Items from cart'

    const detailsList = [
      `Name: ${name}`,
      `Phone: ${phone}`,
      address ? `Address: ${address}${city ? `, ${city}` : ''}` : '',
      customerNote ? `Note: ${customerNote}` : '',
      paymentMode === 'transfer'
        ? (proofPreference === 'upload' && receiptDataUrl
            ? 'Payment Proof: Uploaded to your Ondar dashboard ✓'
            : 'Payment Proof: Attaching screenshot in this chat')
        : 'Payment: Let us negotiate/discuss in chat 💬',
    ].filter(Boolean)

    const cleanPhone = store?.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
    const trackingLink = createdOrderId ? `https://${window.location.host}/track/${createdOrderId}` : ''

    const message = paymentMode === 'negotiate'
      ? `Hi ${store?.store_name}! I am interested in order #${createdOrderRef}:\n\n${itemsList}\n\n*Listed Total:* ₦${subtotal.toLocaleString()}\n\n*Customer Info:*\n${detailsList.join('\n')}\n\nCan we discuss the final price?`
      : `Hi ${store?.store_name}! I have placed order #${createdOrderRef}:\n\n${itemsList}\n\n*Total Paid:* ₦${subtotal.toLocaleString()}\n\n*Customer Info:*\n${detailsList.join('\n')}${trackingLink ? `\n\n*Tracking Link:*\n${trackingLink}` : ''}`

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 selection:bg-[#00A859] selection:text-white">
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
            <p className="text-[10px] text-slate-500 font-bold">Secure Checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
          <span>Verified Checkout</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-4 pt-4 space-y-4">
        
        {/* Step Progress Bar */}
        <div className="flex items-center gap-2 py-1">
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 1 ? 'bg-black' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 2 ? 'bg-black' : 'bg-slate-200'}`} />
          <div className={`h-1.5 flex-1 rounded-full transition-all ${step >= 3 ? 'bg-black' : 'bg-slate-200'}`} />
        </div>

        {/* ════════════════════ STEP 1: DELIVERY DETAILS ════════════════════ */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            {/* Order Summary Card */}
            <section className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4 text-slate-600" />
                  <span>Order Summary ({totalItems} item{totalItems !== 1 ? 's' : ''})</span>
                </h2>
                <Link href={`/${slug}`} className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline">
                  Edit Cart
                </Link>
              </div>

              {cart.length > 0 ? (
                <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
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
                <p className="text-xs text-slate-500 py-2 text-center">Your cart is empty.</p>
              )}

              <div className="border-t border-slate-100 pt-2.5 flex justify-between items-baseline font-black text-sm">
                <span className="text-slate-600 text-xs">Subtotal</span>
                <span className="text-slate-900 text-base">₦{subtotal.toLocaleString()}</span>
              </div>
            </section>

            {/* Delivery Details Form */}
            <form onSubmit={handleProceedToPayment} className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                1. Delivery & Contact Details
              </h2>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tunde Balogun"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">WhatsApp Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 08012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Street Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      rows={2}
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black font-semibold resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">City / Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Lekki / Ikeja"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">State</label>
                    <input
                      type="text"
                      defaultValue="Lagos"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black font-semibold text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">Delivery Note (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Deliver before 4pm / Ring bell"
                    value={customerNote}
                    onChange={(e) => setCustomerNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-black font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={cart.length === 0}
                className="w-full mt-3 bg-black text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all shadow-sm disabled:opacity-50"
              >
                <span>Continue to Payment →</span>
              </button>
            </form>
          </div>
        )}

        {/* ════════════════════ STEP 2: PAYMENT & BANK TRANSFER ════════════════════ */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <section className="bg-white rounded-3xl border border-slate-200 p-4 shadow-2xs space-y-3">
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                2. Choose Payment Mode
              </h2>

              {/* Payment Mode Selector */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('transfer')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMode === 'transfer'
                      ? 'border-2 border-black bg-black text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-black">Bank Transfer</strong>
                    {paymentMode === 'transfer' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />}
                  </div>
                  <small className={paymentMode === 'transfer' ? 'text-slate-300 text-[10px]' : 'text-slate-500 text-[10px]'}>
                    Direct Account Payment
                  </small>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('negotiate')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    paymentMode === 'negotiate'
                      ? 'border-2 border-black bg-black text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-black">Negotiate in DM</strong>
                    {paymentMode === 'negotiate' && <CheckCircle2 className="w-3.5 h-3.5 text-[#00A859]" />}
                  </div>
                  <small className={paymentMode === 'negotiate' ? 'text-slate-300 text-[10px]' : 'text-slate-500 text-[10px]'}>
                    Haggle / Custom Order
                  </small>
                </button>
              </div>

              {/* Bank Account Display (Visible in transfer mode) */}
              {paymentMode === 'transfer' && (
                <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200/90 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                      {store?.store_name || 'Store'} Bank Details:
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Direct Transfer
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5 shadow-2xs">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Bank Name:</span>
                      <span className="font-extrabold text-slate-900">{store?.bank_name || 'Guaranty Trust Bank (GTB)'}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-0.5">
                      <span className="text-slate-500 font-bold">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-950 text-sm">
                          {store?.bank_account_number || '0123456789'}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyBankNumber(store?.bank_account_number || '0123456789')}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-200 transition-colors"
                        >
                          {copiedBank ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Account Name:</span>
                      <span className="font-extrabold text-slate-900">{store?.bank_account_name || store?.store_name || 'Merchant Account'}</span>
                    </div>
                  </div>

                  {/* Proof of payment option */}
                  <div className="pt-1 space-y-2">
                    <label className="font-black text-slate-800 block text-[11px]">
                      Proof of Payment:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setProofPreference('whatsapp')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          proofPreference === 'whatsapp'
                            ? 'bg-[#00A859] text-white border-black shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        Send in WhatsApp DM
                      </button>
                      <button
                        type="button"
                        onClick={() => setProofPreference('upload')}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                          proofPreference === 'upload'
                            ? 'bg-[#00A859] text-white border-black shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                        }`}
                      >
                        Upload to Dashboard
                      </button>
                    </div>

                    {proofPreference === 'upload' && (
                      <div className="pt-1 space-y-1.5 animate-fade-in">
                        {receiptDataUrl ? (
                          <div className="flex items-center justify-between p-2 bg-white rounded-xl border border-slate-200">
                            <div className="flex items-center gap-2">
                              <img src={receiptDataUrl} alt="Receipt" className="w-8 h-8 object-cover rounded-lg border border-slate-200" />
                              <div>
                                <span className="text-[10px] font-bold text-emerald-700 block">Receipt Attached ✓</span>
                                {receiptSizeKb && (
                                  <span className="text-[9px] text-slate-400 font-mono">Optimized ({receiptSizeKb} KB)</span>
                                )}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setReceiptDataUrl(null)
                                setReceiptSizeKb(null)
                              }}
                              className="text-red-500 text-[10px] font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 p-2.5 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                            <Upload className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-[11px] font-bold text-slate-700">
                              {uploadingReceipt ? 'Compressing receipt...' : 'Choose Receipt Screenshot'}
                            </span>
                            <input type="file" accept="image/*" onChange={handleReceiptFileChange} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {paymentMode === 'negotiate' && (
                <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1 font-medium leading-relaxed">
                  <p className="font-bold">💬 Negotiate in WhatsApp DM:</p>
                  <p className="text-[11px] opacity-80">
                    Your order details will be sent directly to {store?.store_name} on WhatsApp so you can negotiate discounts or agree on custom terms.
                  </p>
                </div>
              )}

              <div className="border-t border-slate-100 pt-3 flex justify-between items-baseline font-black text-sm">
                <span className="text-slate-600 text-xs">Total Amount</span>
                <span className="text-slate-900 text-base">₦{subtotal.toLocaleString()}</span>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleCompleteOrder}
                  disabled={submitting}
                  className="w-full bg-[#00A859] text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-[#008746] active:scale-98 transition-all shadow-md disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{submitting ? 'Confirming Order...' : `Confirm Order (₦${subtotal.toLocaleString()}) →`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full py-2 text-slate-500 font-bold text-xs hover:text-black transition-colors"
                >
                  ← Edit Delivery Details
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ════════════════════ STEP 3: ORDER CONFIRMED & RECEIPT ════════════════════ */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <section className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs text-center space-y-4">
              <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-[#00A859] rounded-full mx-auto flex items-center justify-center shadow-xs">
                <Check className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900">Thank you!</h2>
                <p className="text-xs text-slate-500 font-medium">Your order has been recorded.</p>
              </div>

              {/* Receipt Summary Box */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-bold">Order Reference:</span>
                  <span className="font-mono font-black text-slate-900">{createdOrderRef}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-bold">Customer:</span>
                  <span className="font-bold text-slate-900">{name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500 font-bold">Payment Method:</span>
                  <span className="font-bold text-slate-900">
                    {paymentMode === 'transfer' ? 'Bank Transfer' : 'Negotiate in DM'}
                  </span>
                </div>
                <div className="flex justify-between pt-0.5 font-black text-sm">
                  <span className="text-slate-700">Total:</span>
                  <span className="text-[#00A859]">₦{subtotal.toLocaleString()}</span>
                </div>
              </div>

              {/* 1-Tap WhatsApp Button */}
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="w-full bg-[#25D366] text-white font-extrabold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-md"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Notify {store?.store_name || 'Seller'} on WhatsApp</span>
              </button>

              {/* Public Tracking Link */}
              {createdOrderId && (
                <Link
                  href={`/track/${createdOrderId}`}
                  className="w-full py-3 rounded-2xl bg-black text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors shadow-2xs"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00A859]" />
                  <span>View Live Order Tracking →</span>
                </Link>
              )}

              <Link
                href={`/${slug}`}
                className="block text-xs font-bold text-slate-400 hover:text-slate-700 pt-1"
              >
                Return to Storefront
              </Link>
            </section>
          </div>
        )}

      </main>
    </div>
  )
}
