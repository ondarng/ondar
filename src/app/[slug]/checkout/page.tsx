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
  Upload,
  CheckCircle,
} from 'lucide-react'
import Link from 'next/link'

import { compressImage } from '@/lib/image-compression'

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
  
  // Payment Proof Preference
  const [proofPreference, setProofPreference] = useState<'whatsapp' | 'upload'>('whatsapp')
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null)
  const [receiptSizeKb, setReceiptSizeKb] = useState<number | null>(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)
  const [copiedBank, setCopiedBank] = useState(false)

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

  const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingReceipt(true)

    try {
      // Auto-compress receipt in <50ms down to ~100-150KB
      const compressed = await compressImage(file, 1000, 1000, 0.72)
      setReceiptDataUrl(compressed.dataUrl)
      setReceiptSizeKb(compressed.sizeKb)
    } catch (err) {
      console.warn('Fallback to standard filereader:', err)
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
              payment_receipt_url: proofPreference === 'upload' ? receiptDataUrl : null,
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
              payment_receipt_url: proofPreference === 'upload' ? receiptDataUrl : null,
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
      
      if (proofPreference === 'upload' && receiptDataUrl) {
        detailsList.push(`Payment Proof: Uploaded to your Ondar dashboard ✓`)
      } else {
        detailsList.push(`Payment Proof: Attaching screenshot in this chat`)
      }

      const detailsSection = `\n\n*Customer Info:*\n${detailsList.join('\n')}`

      const cleanPhone = store?.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
      const message = `Hi ${store?.store_name}! I would like to place order #${refCode}:\n\n${itemsList}\n\n*Total:* ₦${subtotal.toLocaleString()}${detailsSection}`

      // Clear cart & redirect
      localStorage.removeItem(`ondar-cart-${slug}`)
      window.dispatchEvent(new Event('ondar-cart-updated'))

      window.location.href = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
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

              {/* ── BANK TRANSFER DETAILS SECTION ── */}
              {store?.bank_account_number && (
                <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-black text-amber-900 text-[11px] uppercase tracking-wider">
                    <span>Vendor Bank Transfer Details</span>
                    <span className="text-[10px] text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                      Direct NIP Transfer
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200/60 space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-bold">Bank:</span>
                      <span className="font-extrabold text-slate-900">{store.bank_name || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-bold">Account Number:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-black text-slate-950 text-xs">{store.bank_account_number}</span>
                        <button
                          type="button"
                          onClick={() => copyBankNumber(store.bank_account_number)}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold border border-slate-200 transition-colors"
                        >
                          {copiedBank ? 'Copied ✓' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-500 font-bold">Account Name:</span>
                      <span className="font-extrabold text-slate-900">{store.bank_account_name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── PROOF OF PAYMENT PREFERENCE TOGGLE ── */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <label className="font-extrabold text-slate-800 block text-[11px]">
                  Proof of Payment Option:
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
                    Send in WhatsApp
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
                    Upload Screenshot
                  </button>
                </div>

                {proofPreference === 'upload' && (
                  <div className="pt-1.5 space-y-1.5 animate-fade-in">
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
                          {uploadingReceipt ? 'Auto-compressing receipt...' : 'Choose Receipt / Screenshot'}
                        </span>
                        <input type="file" accept="image/*" onChange={handleReceiptFileChange} className="hidden" />
                      </label>
                    )}
                  </div>
                )}
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
