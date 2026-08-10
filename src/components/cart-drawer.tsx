'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  User,
  Phone,
  MessageSquare,
  FileText,
} from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
  variantName: string | null
}

export function CartDrawer({ store }: { store: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])

  // Customer Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [customerNote, setCustomerNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Auto-load saved customer details from localStorage
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
      console.error('Failed to load saved customer details:', e)
    }
  }, [])

  // Auto-save customer details
  const saveCustomerDetails = () => {
    try {
      localStorage.setItem(
        'ondar-saved-customer',
        JSON.stringify({ name, phone, address })
      )
    } catch (e) {
      console.error('Failed to save customer details:', e)
    }
  }

  // Load cart from localStorage
  useEffect(() => {
    const key = `ondar-cart-${store.slug}`
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        setCart(JSON.parse(stored))
      } catch (e) {
        console.error(e)
      }
    }

    const handleCartUpdate = () => {
      const updated = localStorage.getItem(key)
      if (updated) {
        setCart(JSON.parse(updated))
      }
    }

    const handleOpenCart = () => setIsOpen(true)

    window.addEventListener('ondar-cart-updated', handleCartUpdate)
    window.addEventListener('ondar-open-cart', handleOpenCart)
    return () => {
      window.removeEventListener('ondar-cart-updated', handleCartUpdate)
      window.removeEventListener('ondar-open-cart', handleOpenCart)
    }
  }, [store.slug])

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart)
    localStorage.setItem(`ondar-cart-${store.slug}`, JSON.stringify(newCart))
    window.dispatchEvent(new Event('ondar-cart-updated'))
  }

  const updateQuantity = (itemId: string, variantName: string | null, delta: number) => {
    const updated = cart.map((item) => {
      if (item.id === itemId && item.variantName === variantName) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    saveCart(updated)
  }

  const removeItem = (itemId: string, variantName: string | null) => {
    const updated = cart.filter((item) => !(item.id === itemId && item.variantName === variantName))
    saveCart(updated)
  }

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0)
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0)

  // WhatsApp DM Checkout Flow
  const handleWhatsAppCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    saveCustomerDetails()
    setSubmitting(true)

    try {
      // 1. Record order in database (best-effort)
      let refCode = Math.random().toString(36).substring(2, 8).toUpperCase()
      try {
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
            delivery_address: address || '[WHATSAPP] To Be Provided in Chat',
            checkout_mode: 'whatsapp',
            customer_note: customerNote || null,
          }),
        })
        const res = await response.json()
        if (res.order_ids?.[0]) {
          refCode = res.order_ids[0].slice(0, 8).toUpperCase()
        }
      } catch (err) {
        console.warn('Backend order recording skipped:', err)
      }

      // 2. Format pre-filled WhatsApp message
      const itemsList = cart
        .map((item) => {
          const spec = item.variantName ? ` (${item.variantName})` : ''
          return `• ${item.quantity}x ${item.name}${spec} - ₦${(item.price * item.quantity).toLocaleString()}`
        })
        .join('\n')

      const customerDetails = []
      if (name) customerDetails.push(`Name: ${name}`)
      if (phone) customerDetails.push(`Phone: ${phone}`)
      if (address) customerDetails.push(`Address: ${address}`)
      if (customerNote) customerDetails.push(`Note: ${customerNote}`)

      const detailsSection =
        customerDetails.length > 0
          ? `\n\n*Customer Info:*\n${customerDetails.join('\n')}`
          : '\n\n*(I will provide delivery address directly in this chat)*'

      const cleanPhone = store.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
      const message = `Hi ${store.store_name}! I would like to place an order (#${refCode}):\n\n${itemsList}\n\n*Total:* ₦${subtotal.toLocaleString()}${detailsSection}`

      // 3. Clear cart & open WhatsApp
      saveCart([])
      setIsOpen(false)
      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
    } catch (err: any) {
      alert('Checkout error: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating Tiny Cart Icon — ALWAYS FLOATING AT EXACTLY 90px FROM BOTTOM (DIRECTLY ABOVE WHATSAPP BUTTON) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            backgroundColor: store.accent_color || '#00A859',
            bottom: '90px',
            right: '20px',
          }}
          className="fixed z-40 w-13 h-13 rounded-full text-white shadow-2xl hover:scale-110 active:scale-95 transition-transform flex items-center justify-center border border-black/20"
          aria-label="Open shopping cart"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-white text-slate-900 font-black text-[10px] rounded-full w-5 h-5 flex items-center justify-center shadow-md border border-slate-200">
            {totalItems}
          </span>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <h2 className="font-black text-slate-900 text-base">Your Cart</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-slate-800 text-sm">Your cart is empty</p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-bold text-slate-500 underline"
                  >
                    Add products to start
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.variantName && (
                        <p className="text-[10px] text-slate-500 mt-0.5">{item.variantName}</p>
                      )}
                      <p className="font-black text-xs text-slate-950 mt-1">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.variantName, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variantName, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeItem(item.id, item.variantName)}
                      className="text-slate-400 hover:text-red-600 self-start p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form & Button */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 p-5 bg-white space-y-4 shrink-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 text-xs font-bold">Subtotal ({totalItems} items)</span>
                  <span className="text-base font-black text-slate-950">₦{subtotal.toLocaleString()}</span>
                </div>

                <form onSubmit={handleWhatsAppCheckout} className="space-y-2.5">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Your Full Name (Optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="WhatsApp Phone Number (Optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <textarea
                      rows={2}
                      placeholder="Delivery Address (Optional)"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-slate-900 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-[#25D366] text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>{submitting ? 'Preparing WhatsApp Order...' : `Order on WhatsApp (₦${subtotal.toLocaleString()})`}</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
