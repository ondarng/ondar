'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
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
  const router = useRouter()

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

  const handleStartCheckout = () => {
    setIsOpen(false)
    router.push(`/${store.slug}/checkout`)
  }

  return (
    <>
      {/* ── CART SLIDEOUT DRAWER ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-left">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Your Bag</h3>
                  <p className="text-[10px] text-slate-500 font-bold">
                    {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-black hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-black text-sm text-slate-800">Your bag is empty</h4>
                    <p className="text-xs text-slate-400 max-w-[200px]">
                      Add products from the store to begin checkout.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs hover:bg-slate-800"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={`${item.id}-${item.variantName || index}`} className="flex items-center gap-3 pt-3 first:pt-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-200/80 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{item.name}</h4>
                      {item.variantName && (
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">{item.variantName}</p>
                      )}
                      <p className="font-black text-xs text-slate-950 mt-1">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.variantName, -1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variantName, 1)}
                          className="w-6 h-6 rounded-lg bg-white border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95"
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

            {/* Bottom Checkout CTA */}
            {cart.length > 0 && (
              <div className="border-t border-slate-200 p-5 bg-white space-y-3 shrink-0 shadow-lg">
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-500 text-xs font-bold">Subtotal ({totalItems} items)</span>
                  <span className="text-lg font-black text-slate-950">₦{subtotal.toLocaleString()}</span>
                </div>

                <button
                  onClick={handleStartCheckout}
                  className="w-full bg-black text-white font-black py-4 rounded-2xl text-xs flex items-center justify-center gap-2 hover:bg-neutral-800 active:scale-98 transition-all shadow-md"
                >
                  <span>Proceed to Checkout →</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />
                  <span>Direct Bank Transfer • Verified Social Merchant</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
