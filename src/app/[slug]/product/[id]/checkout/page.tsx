'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check, Copy, Loader2, CreditCard, User, Phone, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { getContrastColor } from '@/lib/utils'

export default function CheckoutPage() {
  const params = useParams()
  const slug = params.slug as string
  const productId = params.id as string
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [instagram, setInstagram] = useState('')
  const [quantity, setQuantity] = useState(1)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from('products')
        .select('*, stores(*)')
        .eq('id', productId)
        .single()
      
      setProduct(data)
      setLoading(false)
    }
    fetchProduct()
  }, [productId])

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const totalPrice = product.price * quantity

    const { error } = await supabase.from('orders').insert({
      store_id: product.stores.id,
      product_id: product.id,
      customer_name: name,
      customer_phone: phone,
      customer_instagram: instagram,
      quantity,
      total_price: totalPrice,
      status: 'PENDING'
    })

    if (!error) {
      setOrderComplete(true)
      // Capture telemetry if available
    } else {
      alert("Error placing order: " + error.message)
    }
    setSubmitting(false)
  }

  const copyBankDetails = () => {
    const text = `${product.stores.bank_name}\n${product.stores.bank_account_number}\n${product.stores.bank_account_name}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-[#00A859] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center space-y-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center" style={{ color: product.stores.accent_color || '#00A859' }}>
          <Check className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary-900">Order Placed!</h1>
          <p className="text-secondary">Please complete your payment below to confirm your order.</p>
        </div>

        <div className="w-full max-w-sm bg-slate-50 p-6 rounded-3xl border border-border space-y-6 text-left">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Bank Transfer Details
            </h3>
            <div className="space-y-1">
              <p className="text-sm text-secondary">Bank Name</p>
              <p className="font-bold text-primary-900">{product.stores.bank_name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-secondary">Account Number</p>
              <p className="text-xl font-display font-black tracking-wider" style={{ color: product.stores.accent_color || '#00A859' }}>
                {product.stores.bank_account_number}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-secondary">Account Name</p>
              <p className="font-bold text-primary-900">{product.stores.bank_account_name}</p>
            </div>
          </div>

          <button 
            onClick={copyBankDetails}
            className="w-full py-3 bg-white border border-border rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Details"}
          </button>
        </div>

        <div className="space-y-4 w-full max-w-sm">
          <button 
            onClick={() => {
              let cleanPhone = product.stores.whatsapp_number.replace(/\D/g, '')
              if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1)
              const message = `Hi ${product.stores.store_name}, I want to buy ${product.name} (Qty: ${quantity}). \n\nTotal: ₦${(product.price * quantity).toLocaleString()}\nName: ${name}\nPhone: ${phone}${instagram ? `\nIG: @${instagram.replace('@', '')}` : ''}\n\nHere is my proof of payment.`
              window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
            }}
            className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            I have paid (WhatsApp)
          </button>
          <Link href={`/${slug}`} className="block text-sm text-secondary font-medium hover:text-primary-600">
            Return to Store
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="px-6 py-4 border-b border-border bg-white flex items-center gap-4 sticky top-0 z-10">
        <Link href={`/${slug}/product/${productId}`} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors" style={{ color: product.stores.accent_color || '#002212' }}>
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold" style={{ color: product.stores.accent_color || '#002212' }}>Checkout</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full p-6 space-y-6">
        {/* Order Summary */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4">
          <img src={product.image_url} alt={product.name} className="w-16 h-16 rounded-xl object-cover border border-border" />
          <div>
            <h3 className="font-bold text-primary-900 line-clamp-1">{product.name}</h3>
            <p className="font-bold" style={{ color: product.stores.accent_color || '#00A859' }}>₦{product.price.toLocaleString()}</p>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-secondary mb-4">Customer Info</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                <User className="w-3 h-3" /> Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-[#00A859] outline-none transition-all text-slate-900"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                <Phone className="w-3 h-3" /> Phone Number
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-[#00A859] outline-none transition-all text-slate-900"
                placeholder="e.g. 08012345678"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                <span className="text-[10px] font-black italic">IG</span> Instagram Handle (Optional)
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-[#00A859] outline-none transition-all text-slate-900"
                placeholder="@username"
              />
            </div>

            <div className="space-y-1 pt-2">
              <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                <ShoppingCart className="w-3 h-3" /> Quantity
              </label>
              <div className="flex items-center gap-4">
                <button 
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center font-bold text-lg active:bg-slate-100"
                >
                  -
                </button>
                <span className="font-display font-bold text-lg w-8 text-center">{quantity}</span>
                <button 
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border border-border flex items-center justify-center font-bold text-lg active:bg-slate-100"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-6 rounded-2xl text-white space-y-4">
            <div className="flex justify-between items-center text-slate-400 text-sm">
              <span>Total Price</span>
              <span className="text-white text-xl font-display font-black">₦{(product.price * quantity).toLocaleString()}</span>
            </div>
            
            <button
              type="submit"
              disabled={submitting}
              style={{ 
                backgroundColor: product.stores.accent_color || '#00A859',
                color: getContrastColor(product.stores.accent_color || '#00A859')
              }}
              className="w-full font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Place Order"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
