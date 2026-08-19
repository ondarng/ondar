'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Check, ArrowRight } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  image_url: string
  stock_quantity: number
  variants: { name: string; price?: number | null }[] | null
  created_at: string
}

interface StorefrontProductCardProps {
  product: Product
  slug: string
  accentColor: string
  storeSlug: string
}

function isNew(createdAt: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  return new Date(createdAt) > sevenDaysAgo
}

export function StorefrontProductCard({ product, slug, accentColor, storeSlug }: StorefrontProductCardProps) {
  const [added, setAdded] = useState(false)
  const variants: { name: string; price?: number | null }[] = Array.isArray(product.variants) ? product.variants : []
  const hasVariants = variants.length > 0
  const isProductNew = isNew(product.created_at)
  const isLow = product.stock_quantity > 0 && product.stock_quantity <= 5
  const isOut = product.stock_quantity <= 0

  function addToCart() {
    if (hasVariants || isOut) return
    const key = `ondar-cart-${storeSlug}`
    const stored = localStorage.getItem(key)
    const cart = stored ? JSON.parse(stored) : []

    const existingIndex = cart.findIndex((i: any) => i.id === product.id && i.variantName === null)
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.image_url,
        quantity: 1,
        variantName: null,
      })
    }

    localStorage.setItem(key, JSON.stringify(cart))
    window.dispatchEvent(new Event('ondar-cart-updated'))
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div
      className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-300 relative"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Product Image Area */}
      <Link href={`/${slug}/product/${product.id}`} className="relative block overflow-hidden bg-[#F8FAFC]">
        <div className="w-full aspect-square flex items-center justify-center p-3.5 relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>

        {/* NEW Badge */}
        {isProductNew && !isOut && (
          <span
            className="absolute top-3 left-3 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-white/20"
            style={{ backgroundColor: accentColor || '#00A859' }}
          >
            New
          </span>
        )}

        {/* Low Stock Badge */}
        {isLow && !isOut && (
          <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            {product.stock_quantity} left
          </span>
        )}

        {/* Out of Stock Overlay */}
        {isOut && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-2">
            <span className="bg-white text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-slate-200">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Details & Actions */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 bg-white">
        <Link href={`/${slug}/product/${product.id}`} className="block space-y-1">
          <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 uppercase tracking-wide group-hover:text-[#00A859] transition-colors">
            {product.name}
          </h3>
          <p className="text-sm md:text-base font-black tracking-tight" style={{ color: accentColor || '#00A859' }}>
            {hasVariants && <span className="text-[10px] font-bold text-slate-400 mr-1">from</span>}
            ₦{Number(product.price).toLocaleString()}
          </p>
        </Link>

        {/* Action Button */}
        {hasVariants ? (
          <Link
            href={`/${slug}/product/${product.id}`}
            className="w-full py-2.5 px-3 rounded-xl border border-black bg-white text-black font-extrabold text-[11px] flex items-center justify-center gap-1.5 hover:bg-neutral-100 transition-colors shadow-2xs"
          >
            <span>Choose Option</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
          </Link>
        ) : isOut ? (
          <button
            disabled
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-[11px] cursor-not-allowed text-center"
          >
            Unavailable
          </button>
        ) : (
          <button
            onClick={addToCart}
            style={{ backgroundColor: added ? '#00A859' : accentColor || '#00A859' }}
            className="w-full py-2.5 px-3 rounded-xl text-white font-extrabold text-[11px] flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-97 transition-all shadow-2xs border border-black/10"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
