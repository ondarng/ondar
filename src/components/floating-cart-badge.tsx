'use client'

import { useCart } from '@/lib/cart'
import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'

export function FloatingCartBadge({ slug, accent }: { slug: string; accent: string }) {
  const { totalItems, totalPrice } = useCart()

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2.5rem)] max-w-md">
      <Link
        href={`/${slug}/cart`}
        className="flex items-center justify-between w-full px-5 py-4 rounded-2xl shadow-2xl text-white font-bold transition-all active:scale-[0.97] hover:opacity-95"
        style={{ backgroundColor: accent }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <ShoppingBag className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black" style={{ color: accent }}>
              {totalItems}
            </span>
          </div>
          <span className="text-sm">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
        </div>
        <span className="text-base font-display font-black">₦{totalPrice.toLocaleString()} →</span>
      </Link>
    </div>
  )
}
