'use client'

import { useCart, CartItem } from '@/lib/cart'
import { ShoppingCart, Check } from 'lucide-react'
import { useState } from 'react'
import { getContrastColor } from '@/lib/utils'

export function AddToCartButton({ product, accent }: { product: CartItem; accent: string }) {
  const { addItem } = useCart()
  const [justAdded, setJustAdded] = useState(false)
  
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem(product)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  const contrastColor = getContrastColor(accent)

  return (
    <button
      onClick={handleAdd}
      className="w-full py-2.5 px-2 rounded-xl font-black text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 transition-all duration-300 active:scale-95 whitespace-nowrap"
      style={{ 
        backgroundColor: justAdded ? '#16a34a' : accent, 
        color: justAdded ? 'white' : contrastColor,
        boxShadow: justAdded 
          ? '0 4px 14px rgba(22,163,74,0.35)' 
          : `0 4px 14px ${accent}40`
      }}
    >
      {justAdded ? (
        <>
          <Check className="w-3.5 h-3.5 shrink-0" strokeWidth={3} />
          <span>Added!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
          <span>Add to Cart</span>
        </>
      )}
    </button>
  )
}

