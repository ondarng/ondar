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
  CheckCircle,
  MessageSquare,
  Building2,
  Copy,
  Check,
  Upload,
  FileText,
  ArrowLeft,
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
  const [step, setStep] = useState<'cart' | 'details' | 'payment'>('cart')

  const directEnabled = store.enable_direct_checkout !== false
  const whatsappEnabled = store.enable_whatsapp_checkout !== false

  const [checkoutMode, setCheckoutMode] = useState<'whatsapp' | 'direct'>('direct')

  // Form State
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [instagram, setInstagram] = useState('')
  const [customerNote, setCustomerNote] = useState('')

  // Payment state
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptDataUrl, setReceiptDataUrl] = useState<string | null>(null)
  const [copiedAccount, setCopiedAccount] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<{ id: string; ref: string } | null>(null)

  // Auto-load saved customer details from localStorage
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
      console.error('Failed to load saved customer details:', e)
    }
  }, [])

  // Auto-save customer details
  const saveCustomerDetails = () => {
    try {
      localStorage.setItem(
        'ondar-saved-customer',
        JSON.stringify({ name, phone, address, instagram })
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

  // Handle receipt image upload & convert to Data URL
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setReceiptDataUrl(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const copyAccountNumber = () => {
    if (!store.bank_account_number) return
    navigator.clipboard.writeText(store.bank_account_number)
    setCopiedAccount(true)
    setTimeout(() => setCopiedAccount(false), 2000)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) return

    saveCustomerDetails()
    setSubmitting(true)

    try {
      const orderIds: string[] = []
      let dbFailed = false
      let errorMessage = ''

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
            customer_name: name,
            customer_phone: phone,
            customer_instagram: instagram || null,
            delivery_address: `[${checkoutMode.toUpperCase()}] ${address}`,
            checkout_mode: checkoutMode,
            customer_note: customerNote || null,
            payment_receipt_url: receiptDataUrl || null,
            payment_method: 'bank_transfer',
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Checkout failed')
        }

        orderIds.push(...(result.order_ids || []))
      } catch (dbError: any) {
        console.error('Checkout Error:', dbError)
        dbFailed = true
        errorMessage = dbError.message || 'Checkout error'
      }

      if (dbFailed && checkoutMode === 'direct') {
        throw new Error(errorMessage || 'Failed to record order. Please try WhatsApp checkout instead.')
      }

      // Clear Cart
      const ref = orderIds[0] ? orderIds[0].slice(0, 8).toUpperCase() : Math.random().toString(36).substring(2, 8).toUpperCase()
      saveCart([])

      if (checkoutMode === 'whatsapp') {
        const itemsList = cart
          .map((item) => {
            const spec = item.variantName ? ` (${item.variantName})` : ''
            return `• ${item.quantity}x ${item.name}${spec} - ₦${(item.price * item.quantity).toLocaleString()}`
          })
          .join('\n')

        const deliveryDetails = []
        if (name) deliveryDetails.push(`Name: ${name}`)
        if (phone) deliveryDetails.push(`Phone: ${phone}`)
        if (address) deliveryDetails.push(`Address: ${address}`)
        if (instagram) deliveryDetails.push(`Instagram: @${instagram}`)
        if (customerNote) deliveryDetails.push(`Note: ${customerNote}`)
        if (receiptDataUrl) deliveryDetails.push(`Payment Receipt: Attached/Uploaded`)

        const deliverySection =
          deliveryDetails.length > 0
            ? `\n\n*Delivery & Order Details:*\n${deliveryDetails.join('\n')}`
            : '\n\n*(I will provide delivery details directly in this chat)*'

        const cleanPhone = store.whatsapp_number?.replace(/[^0-9]/g, '').replace(/^0/, '234') || ''
        const message = `Hi ${store.store_name}! I placed order #${ref}:\n\n${itemsList}\n\n*Total:* ₦${subtotal.toLocaleString()}${deliverySection}`

        setIsOpen(false)
        setStep('cart')
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
      } else {
        setOrderSuccess({ id: orderIds[0] || 'SUCCESS', ref })
        setStep('cart')
      }
    } catch (err: any) {
      alert('Checkout failed: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // Success Modal Screen
  if (orderSuccess) {
    const cleanPhone = store.whatsapp_number?.replace(/[^0-9]/g, '').replace(/^0/, '234') || ''
    const waText = encodeURIComponent(
      `Hi ${store.store_name}, I just paid for Order #${orderSuccess.ref}. Please confirm delivery!`
    )

    return (
      <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white w-full max-w-md p-6 rounded-3xl text-center space-y-5 animate-scale-up max-h-[90vh] overflow-y-auto">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900">Order Placed Successfully!</h3>
            <p className="text-xs text-slate-500">
              Order Reference:{' '}
              <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                #{orderSuccess.ref}
              </span>
            </p>
          </div>

          {/* Bank Account Summary */}
          {store.bank_account_number && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left space-y-2.5">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                Bank Transfer Details
              </p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Bank:</span>
                <span className="font-bold text-slate-900">{store.bank_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Account No:</span>
                <div className="flex items-center gap-1.5 font-mono font-bold text-slate-900">
                  <span>{store.bank_account_number}</span>
                  <button onClick={copyAccountNumber} className="text-emerald-600 hover:text-emerald-700">
                    {copiedAccount ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Account Name:</span>
                <span className="font-bold text-slate-900">{store.bank_account_name}</span>
              </div>
            </div>
          )}

          {receiptFile && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 font-bold">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payment Receipt Uploaded ({receiptFile.name})</span>
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

            <button
              onClick={() => {
                setOrderSuccess(null)
                setReceiptFile(null)
                setReceiptDataUrl(null)
                setCustomerNote('')
                setIsOpen(false)
              }}
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl text-xs hover:bg-black transition-all"
            >
              Back to Store
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Floating Cart Button (Always visible suspended directly above WhatsApp button) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{ backgroundColor: store.accent_color || '#00A859' }}
          className="fixed bottom-22 right-5 z-40 w-13 h-13 rounded-full text-white shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative border border-black/20"
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
                {step !== 'cart' && (
                  <button
                    onClick={() => setStep(step === 'payment' ? 'details' : 'cart')}
                    className="p-1 -ml-1 text-slate-500 hover:text-slate-900"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <ShoppingBag className="w-5 h-5 text-slate-800" />
                <h2 className="font-bold text-slate-900 text-base">
                  {step === 'cart' && 'Your Cart'}
                  {step === 'details' && 'Delivery Details'}
                  {step === 'payment' && 'Bank Transfer & Payment'}
                </h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: CART ITEMS & SUMMARY */}
            {step === 'cart' && (
              <>
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
                        className="flex gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
                      >
                        <div className="w-14 h-14 bg-white rounded-xl border border-slate-200/80 overflow-hidden shrink-0">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                          {item.variantName && (
                            <p className="text-[10px] text-slate-400 mt-0.5">{item.variantName}</p>
                          )}
                          <p className="font-black text-xs text-slate-950 mt-1">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.variantName, -1)}
                              className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.variantName, 1)}
                              className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100"
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

                {cart.length > 0 && (
                  <div className="border-t border-slate-100 p-5 bg-white space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-slate-500 text-xs font-bold">Subtotal ({totalItems} items)</span>
                      <span className="text-base font-black text-slate-900">₦{subtotal.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => {
                        setIsOpen(false)
                        window.location.href = `/${store.slug}/checkout`
                      }}
                      style={{ backgroundColor: store.accent_color || '#00A859' }}
                      className="w-full text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md"
                    >
                      Proceed to Checkout (₦{subtotal.toLocaleString()}) →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* STEP 2: DELIVERY DETAILS & NOTE TO SELLER */}
            {step === 'details' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                    Customer & Shipping Info
                  </h3>

                  <div className="space-y-2">
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
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
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium"
                      />
                    </div>

                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        required
                        rows={2}
                        placeholder="Complete Delivery Address *"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium resize-none"
                      />
                    </div>

                    <div className="relative">
                      <FileText className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        rows={2}
                        placeholder="Note to Seller (e.g. Call before delivery, gate code...)"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900/10 font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Checkout Mode Toggle */}
                {directEnabled && whatsappEnabled && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setCheckoutMode('direct')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        checkoutMode === 'direct'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" /> Bank Transfer
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutMode('whatsapp')}
                      className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                        checkoutMode === 'whatsapp'
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp DM
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!name || !phone || !address) {
                      alert('Please fill in your name, phone, and delivery address.')
                      return
                    }
                    saveCustomerDetails()
                    if (checkoutMode === 'whatsapp') {
                      handleCheckout({ preventDefault: () => {} } as any)
                    } else {
                      setStep('payment')
                    }
                  }}
                  style={{ backgroundColor: store.accent_color || '#00A859' }}
                  className="w-full text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md"
                >
                  {checkoutMode === 'whatsapp' ? 'Submit & Order on WhatsApp' : 'Proceed to Payment →'}
                </button>
              </div>
            )}

            {/* STEP 3: BANK TRANSFER DETAILS & RECEIPT UPLOAD */}
            {step === 'payment' && (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Bank Account Details */}
                {store.bank_account_number ? (
                  <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                        Bank Transfer Details
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                        Verified Account
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bank:</span>
                        <span className="font-bold text-white">{store.bank_name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Number:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {store.bank_account_number}
                          </span>
                          <button
                            onClick={copyAccountNumber}
                            className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded-md transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedAccount ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Account Name:</span>
                        <span className="font-bold text-white">{store.bank_account_name}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-800 pt-2 font-bold">
                        <span className="text-slate-300">Amount to Transfer:</span>
                        <span className="text-emerald-400 text-sm">₦{subtotal.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-bold">
                    This store accepts manual bank transfers. Complete your order below and the merchant will provide transfer details.
                  </div>
                )}

                {/* Upload Payment Receipt */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5">
                  <label className="block text-xs font-black text-slate-800 uppercase tracking-wider">
                    Upload Payment Receipt (Optional)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Upload a screenshot or photo of your transfer receipt for faster verification.
                  </p>

                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-slate-400 bg-white rounded-xl cursor-pointer transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700">
                      {receiptFile ? receiptFile.name : 'Choose receipt image'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                    />
                  </label>

                  {receiptDataUrl && (
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 aspect-[3/1] bg-slate-900 flex items-center justify-center">
                      <img
                        src={receiptDataUrl}
                        alt="Receipt preview"
                        className="h-full object-contain"
                      />
                      <button
                        onClick={() => {
                          setReceiptFile(null)
                          setReceiptDataUrl(null)
                        }}
                        className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleCheckout}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ backgroundColor: store.accent_color || '#00A859' }}
                    className="w-full text-white font-extrabold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'Confirming Order...' : `Confirm Order (₦${subtotal.toLocaleString()})`}
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
