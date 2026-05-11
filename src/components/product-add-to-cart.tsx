'use client'

import { useCart, CartItem } from '@/lib/cart'
import { ShoppingCart, Plus, Check } from 'lucide-react'
import { useState } from 'react'

export function ProductAddToCart({ product, accent }: { product: CartItem; accent: string }) {
  const { addItem, items } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  const isInCart = items.some(i => i.id === product.id)

  return (
    <button
      onClick={() => {
        addItem(product)
        setJustAdded(true)
        setTimeout(() => setJustAdded(false), 1500)
      }}
      className="w-16 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-95 border border-border bg-white"
      style={{ 
        backgroundColor: justAdded ? '#22c55e' : 'white',
        color: justAdded ? 'white' : '#1e293b'
      }}
    >
      {justAdded ? (
        <Check className="w-6 h-6" />
      ) : (
        <div className="relative">
          <ShoppingCart className="w-6 h-6" />
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: accent }}>
            <Plus className="w-2.5 h-2.5" />
          </div>
        </div>
      )}
    </button>
  )
}
