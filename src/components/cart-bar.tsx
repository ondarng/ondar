'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag } from 'lucide-react'

interface CartBarProps {
  accentColor: string
  storeSlug: string
}

export function CartBar({ accentColor, storeSlug }: CartBarProps) {
  const [totalItems, setTotalItems] = useState(0)
  const [total, setTotal] = useState(0)

  function syncCart() {
    const stored = localStorage.getItem(`ondar-cart-${storeSlug}`)
    if (stored) {
      try {
        const cart = JSON.parse(stored)
        setTotalItems(cart.reduce((a: number, i: any) => a + i.quantity, 0))
        setTotal(cart.reduce((a: number, i: any) => a + i.price * i.quantity, 0))
      } catch {
        setTotalItems(0)
        setTotal(0)
      }
    } else {
      setTotalItems(0)
      setTotal(0)
    }
  }

  useEffect(() => {
    syncCart()
    window.addEventListener('ondar-cart-updated', syncCart)
    return () => window.removeEventListener('ondar-cart-updated', syncCart)
  }, [storeSlug])

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-5 pt-2 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <button
          onClick={() => window.dispatchEvent(new Event('ondar-open-cart'))}
          className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-white shadow-2xl active:scale-98 transition-all"
          style={{ backgroundColor: accentColor }}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center" style={{ color: accentColor }}>
                {totalItems}
              </span>
            </div>
            <span className="text-sm font-bold">
              {totalItems} item{totalItems !== 1 ? 's' : ''} in cart
            </span>
          </div>
          <div className="text-right">
            <p className="text-sm font-black">₦{total.toLocaleString()}</p>
            <p className="text-[10px] font-bold opacity-80">View Cart →</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// Header cart badge
export function CartBadge({ accentColor, storeSlug }: CartBarProps) {
  const [totalItems, setTotalItems] = useState(0)

  function syncCart() {
    const stored = localStorage.getItem(`ondar-cart-${storeSlug}`)
    if (stored) {
      try {
        const cart = JSON.parse(stored)
        setTotalItems(cart.reduce((a: number, i: any) => a + i.quantity, 0))
      } catch {
        setTotalItems(0)
      }
    } else {
      setTotalItems(0)
    }
  }

  useEffect(() => {
    syncCart()
    window.addEventListener('ondar-cart-updated', syncCart)
    return () => window.removeEventListener('ondar-cart-updated', syncCart)
  }, [storeSlug])

  return (
    <button
      onClick={() => window.dispatchEvent(new Event('ondar-open-cart'))}
      className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors"
      aria-label="Open cart"
    >
      <ShoppingBag className="w-5 h-5" />
      {totalItems > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow"
          style={{ backgroundColor: accentColor }}
        >
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </button>
  )
}
