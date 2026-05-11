'use client'

import { useCart } from '@/lib/cart'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export function CartHeaderIcon({ slug, accent }: { slug: string; accent: string }) {
  const { totalItems } = useCart()

  return (
    <Link
      href={`/${slug}/cart`}
      className="w-10 h-10 rounded-xl flex items-center justify-center border border-border shadow-sm transition-all hover:scale-105 active:scale-95 relative bg-white"
    >
      <ShoppingCart className="w-5 h-5 text-slate-700" />
      {totalItems > 0 && (
        <span 
          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-white shadow-sm"
          style={{ backgroundColor: accent }}
        >
          {totalItems}
        </span>
      )}
    </Link>
  )
}
