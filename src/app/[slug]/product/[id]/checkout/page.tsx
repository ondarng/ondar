'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Check, Copy, Loader2, CreditCard, User, Phone, ShoppingCart, AtSign } from 'lucide-react'
import Link from 'next/link'
import { getContrastColor } from '@/lib/utils'

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.877 9.888-9.877 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.446-4.435 9.877-9.888 9.877m8.415-18.3c-2.251-2.25-5.244-3.487-8.427-3.487-6.559 0-11.9 5.341-11.9 11.9 0 2.09.544 4.132 1.577 5.942L0 24l6.302-1.654a11.852 11.852 0 005.591 1.41h.005c6.56 0 11.9-5.341 11.9-11.9 0-3.184-1.24-6.179-3.492-8.432" />
  </svg>
)

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

export default function CheckoutPage() {
  const params = useParams()
  const slug = params.slug as string
  const productId = params.id as string
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [fullOrderId, setFullOrderId] = useState<string | null>(null)
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

    const { data: orderData, error: orderError } = await supabase.from('orders').insert({
      store_id: product.stores.id,
      product_id: product.id,
      customer_name: name,
      customer_phone: phone,
      customer_instagram: instagram,
      quantity,
      total_price: totalPrice,
      status: 'PENDING'
    }).select().single()

    if (!orderError) {
      // 1. Instant Stock Sync: Decrement stock immediately
      const { data: productData } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', product.id)
        .single()
      
      if (productData) {
        await supabase
          .from('products')
          .update({ stock_quantity: Math.max(0, productData.stock_quantity - quantity) })
          .eq('id', product.id)
      }

      // 2. Basic CRM Upsert: Remember this customer
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('instagram_handle')
        .eq('store_id', product.stores.id)
        .eq('phone', phone)
        .single();

      await supabase.from('customers').upsert({
        store_id: product.stores.id,
        phone: phone,
        name: name,
        instagram_handle: instagram || existingCustomer?.instagram_handle || null,
        last_order_at: new Date().toISOString()
      }, { onConflict: 'store_id,phone' })

      setOrderId(orderData.id.slice(0, 6).toUpperCase())
      setFullOrderId(orderData.id)
      setOrderComplete(true)
    } else {
      alert("Error placing order: " + orderError.message)
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

  const acceptWA = product?.stores?.accept_whatsapp ?? true;
  const acceptIG = (product?.stores?.accept_instagram !== false) && !!product?.stores?.instagram_handle;

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center space-y-8">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center" style={{ color: product.stores.accent_color || '#00A859' }}>
          <Check className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold text-primary-900">Order #{orderId} Placed!</h1>
          <p className="text-secondary font-medium">Your order has been reserved pending payment confirmation.</p>
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
          {acceptWA && (
            <button 
              onClick={async () => {
                if (fullOrderId) {
                  await supabase.from('orders').update({ checkout_channel: 'WA' }).eq('id', fullOrderId);
                }
                let cleanPhone = product.stores.whatsapp_number.replace(/\D/g, '')
                if (cleanPhone.startsWith('0')) cleanPhone = '234' + cleanPhone.slice(1)
                const message = `Hi, I just placed Order #${orderId} for ${product.name} (Qty: ${quantity}). I've made payment and will send proof shortly.\n\nName: ${name}\nTotal: ₦${(product.price * quantity).toLocaleString()}`
                window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
              }}
              style={{ backgroundColor: '#25D366' }}
              className="w-full text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90"
            >
              <WhatsAppIcon className="w-5 h-5" />
              Send Proof via WhatsApp
            </button>
          )}

          {acceptIG && (
            <button 
              onClick={async () => {
                  if (fullOrderId) {
                    await supabase.from('orders').update({ checkout_channel: 'IG' }).eq('id', fullOrderId);
                  }
                  const message = `Hi, I just placed Order #${orderId} for ${product.name} (Qty: ${quantity}). I've made payment and will send proof shortly.\n\nName: ${name}\nTotal: ₦${(product.price * quantity).toLocaleString()}`
                  window.open(`https://ig.me/m/${product.stores.instagram_handle.replace('@', '')}`, '_blank')
                }}
                style={{ background: 'linear-gradient(135deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' }}
                className="w-full text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:opacity-90"
              >
                <InstagramIcon className="w-5 h-5" />
                Send Proof via Instagram
              </button>
            )}

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
                <span className="text-[10px] font-black italic">IG</span> Instagram Handle (Required if confirming via IG)
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
            
            {(!product.stores.bank_name || !product.stores.bank_account_number) ? (
              <div className="bg-amber-900/20 border border-amber-900/30 p-4 rounded-xl text-center">
                <p className="text-xs font-bold text-amber-200">This store is not accepting orders yet.</p>
              </div>
            ) : (
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
            )}
          </div>
        </form>
      </main>
    </div>
  )
}
