'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, X, Plus, Minus, Trash2, MapPin, User, Phone, CheckCircle, MessageSquare, Laptop } from 'lucide-react'


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
  const directEnabled = store.enable_direct_checkout !== false
  const whatsappEnabled = store.enable_whatsapp_checkout !== false

  const [checkoutMode, setCheckoutMode] = useState<'whatsapp' | 'direct'>('direct')

  useEffect(() => {
    if (!directEnabled && whatsappEnabled) {
      setCheckoutMode('whatsapp')
    } else if (directEnabled) {
      setCheckoutMode('direct')
    }
  }, [directEnabled, whatsappEnabled, isOpen])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [instagram, setInstagram] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)



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

    // Listen for custom events to refresh cart
    const handleCartUpdate = () => {
      const updated = localStorage.getItem(key)
      if (updated) {
        setCart(JSON.parse(updated))
      }
    }

    // Allow external components (sticky bar, header badge) to open the drawer
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
    const updated = cart.map(item => {
      if (item.id === itemId && item.variantName === variantName) {
        const newQty = Math.max(1, item.quantity + delta)
        return { ...item, quantity: newQty }
      }
      return item
    })
    saveCart(updated)
  }

  const removeItem = (itemId: string, variantName: string | null) => {
    const updated = cart.filter(item => !(item.id === itemId && item.variantName === variantName))
    saveCart(updated)
  }

  const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)
  const totalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0)

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return
    setSubmitting(true)

    try {
      const orderIds: string[] = []
      let dbFailed = false
      let errorMessage = ''
      
      try {
        // Server-side validated checkout — prices are verified against the database
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            store_id: store.id,
            items: cart.map(item => ({
              product_id: item.id,
              quantity: item.quantity,
              variant_name: item.variantName || null,
            })),
            customer_name: name,
            customer_phone: phone,
            customer_instagram: instagram || null,
            delivery_address: `[${checkoutMode.toUpperCase()}] ${address}`,
            checkout_mode: checkoutMode,
          })
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Checkout failed')
        }

        orderIds.push(...(result.order_ids || []))

      } catch (dbError: any) {
        console.error("Checkout Error:", dbError)
        dbFailed = true
        errorMessage = dbError.message || 'Checkout error'
      }

      // If DB failed and it's direct checkout, we must stop here because we need an Order ID to show success.
      if (dbFailed && checkoutMode === 'direct') {
        throw new Error(errorMessage || "Failed to record order. Please try WhatsApp checkout instead.")
      }

      // Clear Cart
      saveCart([])

      if (checkoutMode === 'whatsapp') {
        // Compile WhatsApp Message
        const itemsList = cart.map(item => {
          const spec = item.variantName ? ` (${item.variantName})` : ''
          return `• ${item.quantity}x ${item.name}${spec} - ₦${(item.price * item.quantity).toLocaleString()}`
        }).join('\n')

        const deliveryDetails = []
        if (name) deliveryDetails.push(`Name: ${name}`)
        if (phone) deliveryDetails.push(`Phone: ${phone}`)
        if (address) deliveryDetails.push(`Address: ${address}`)
        if (instagram) deliveryDetails.push(`Instagram: @${instagram}`)

        const deliverySection = deliveryDetails.length > 0 
          ? `\n\n*Delivery/Contact Info:*\n${deliveryDetails.join('\n')}` 
          : '\n\n*(I will provide delivery details directly in this chat)*'

        const cleanPhone = store.whatsapp_number.replace(/[^0-9]/g, '').replace(/^0/, '234')
        const message = `Hi ${store.store_name}! I would like to place an order:\n\n${itemsList}\n\n*Total:* ₦${subtotal.toLocaleString()}${deliverySection}`
        
        setIsOpen(false)
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
      } else {
        setOrderSuccess(orderIds[0]?.slice(0, 8) || 'SUCCESS')
      }
    } catch (err: any) {
      alert("Checkout failed: " + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md p-8 rounded-3xl text-center space-y-6 animate-scale-up">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-neutral-900">Order Confirmed!</h3>
            <p className="text-sm text-neutral-500">Your order has been recorded directly. Reference: <span className="font-mono font-bold text-neutral-800">#{orderSuccess.toUpperCase()}</span></p>
          </div>

          {/* Bank Transfer Details displayed to user if direct checkout */}
          {checkoutMode === 'direct' && store.bank_account_number && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-neutral-100 text-left space-y-3">
              <p className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Make Payment via Bank Transfer</p>
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-400">Bank Name</p>
                <p className="text-xs font-bold text-neutral-800">{store.bank_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-400">Account Number</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-mono font-bold text-neutral-850">{store.bank_account_number}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(store.bank_account_number);
                      alert("Account number copied!");
                    }}
                    className="text-[10px] font-bold text-primary-600 hover:underline"
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-neutral-400">Account Name</p>
                <p className="text-xs font-bold text-neutral-800">{store.bank_account_name}</p>
              </div>
              <p className="text-[10px] text-neutral-400 italic mt-2">Please make the transfer of ₦{subtotal.toLocaleString()} and keep your receipt for delivery verification.</p>
            </div>
          )}

          <button 
            onClick={() => {
              setOrderSuccess(null)
              setIsOpen(false)
            }}
            className="w-full bg-neutral-950 text-white font-bold py-3.5 rounded-xl hover:bg-black transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Cart Button */}
      {totalItems > 0 && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: store.accent_color || '#00A859' }}
          className="fixed bottom-6 right-6 z-50 p-4 rounded-full text-white shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="bg-white text-neutral-950 font-black text-xs px-2 py-0.5 rounded-full min-w-5 text-center">
            {totalItems}
          </span>
        </button>
      )}

      {/* Cart Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-800" />
                <h2 className="font-bold text-neutral-900 text-lg">Your Cart</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 -mr-2 rounded-full hover:bg-neutral-50 text-neutral-400 hover:text-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="font-bold text-neutral-800">Your cart is empty</p>
                  <button onClick={() => setIsOpen(false)} className="text-sm font-bold text-neutral-500 underline">Add products to start</button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="w-14 h-14 bg-white rounded-lg border border-neutral-100 overflow-hidden shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-neutral-900 truncate">{item.name}</h4>
                      {item.variantName && <p className="text-[10px] text-neutral-400 mt-0.5">{item.variantName}</p>}
                      <p className="font-bold text-xs text-neutral-950 mt-1">₦{item.price.toLocaleString()}</p>
                      
                      <div className="flex items-center gap-2.5 mt-2">
                        <button onClick={() => updateQuantity(item.id, item.variantName, -1)} className="w-6 h-6 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-500"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.variantName, 1)} className="w-6 h-6 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-neutral-500"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id, item.variantName)} className="text-neutral-400 hover:text-red-600 self-start p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Checkout Form & Mode Selection */}
            {cart.length > 0 && (
              <div className="border-t border-neutral-100 p-5 bg-slate-50/50 space-y-4 shrink-0">
                <div className="flex justify-between items-baseline">
                  <span className="text-neutral-500 text-sm font-medium">Subtotal</span>
                  <span className="text-lg font-black text-neutral-950">₦{subtotal.toLocaleString()}</span>
                </div>

                {/* Checkout Mode Toggle */}
                {!directEnabled && !whatsappEnabled ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-center text-xs font-bold">
                    This store is currently not accepting orders.
                  </div>
                ) : (
                  directEnabled && whatsappEnabled && (
                    <div className="grid grid-cols-2 gap-2 bg-neutral-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setCheckoutMode('direct')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          checkoutMode === 'direct' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500'
                        }`}
                      >
                        <Laptop className="w-3.5 h-3.5" /> Direct Checkout <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ml-0.5 ${checkoutMode === 'direct' ? 'bg-[#00A859]/10 text-[#00A859]' : 'bg-neutral-200 text-neutral-400'}`}>Beta</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCheckoutMode('whatsapp')}
                        className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          checkoutMode === 'whatsapp' ? 'bg-white text-neutral-950 shadow-sm' : 'text-neutral-500'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp DM
                      </button>
                    </div>
                  )
                )}

                {/* Checkout Details Form */}
                {(directEnabled || whatsappEnabled) && (
                  <form onSubmit={handleCheckout} className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="text"
                      required={checkoutMode === 'direct'}
                      placeholder="Your Full Name (Optional for WhatsApp)"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      type="tel"
                      required={checkoutMode === 'direct'}
                      placeholder="WhatsApp Number (Optional for WhatsApp)"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
                    <textarea
                      required={checkoutMode === 'direct'}
                      rows={2}
                      placeholder="Delivery Address (Optional for WhatsApp)"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-white border border-neutral-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: store.accent_color || '#00A859' }}
                    className="w-full text-white font-extrabold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-md"
                  >
                    {submitting ? 'Placing Order...' : checkoutMode === 'whatsapp' ? 'Submit & Order on WhatsApp' : 'Place Order Now'}
                  </button>
                </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
