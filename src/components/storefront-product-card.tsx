'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Check, ArrowRight } from 'lucide-react'

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

  function addToCart(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
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
    <div className="group flex flex-col bg-white rounded-[26px] overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-400 transition-all duration-300 relative">
      {/* ── IMAGE SECTION ── */}
      <Link href={`/${slug}/product/${product.id}`} className="relative block overflow-hidden bg-[#F6F8FA]">
        <div className="w-full aspect-[1/1] flex items-center justify-center p-3 sm:p-4 relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-106 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>

        {/* Dynamic Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isProductNew && !isOut && (
            <span
              className="text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs"
              style={{ backgroundColor: accentColor || '#00A859' }}
            >
              New
            </span>
          )}
          {isLow && !isOut && (
            <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
              {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-2 z-10">
            <span className="bg-white text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-slate-200">
              Sold Out
            </span>
          </div>
        )}

        {/* ── QUICK ADD FLOATING BUTTON (Desktop & Mobile) ── */}
        {!isOut && !hasVariants && (
          <button
            onClick={addToCart}
            aria-label="Add to cart"
            className={`absolute bottom-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 shadow-md border z-20 ${
              added
                ? 'bg-[#00A859] text-white border-black scale-110'
                : 'bg-white text-black border-slate-200 hover:bg-black hover:text-white hover:border-black active:scale-95'
            }`}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        )}
      </Link>

      {/* ── DETAILS SECTION ── */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
        <Link href={`/${slug}/product/${product.id}`} className="block space-y-1">
          <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-[#00A859] transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-black tracking-tight" style={{ color: accentColor || '#00A859' }}>
            {hasVariants && <span className="text-[10px] font-bold text-slate-400 mr-1">from</span>}
            ₦{Number(product.price).toLocaleString()}
          </p>
        </Link>

        {/* Bottom Action Pill */}
        {hasVariants ? (
          <Link
            href={`/${slug}/product/${product.id}`}
            className="w-full py-2 px-3 rounded-xl border border-black bg-white text-black font-black text-[10px] flex items-center justify-center gap-1 hover:bg-black hover:text-white transition-all shadow-2xs"
          >
            <span>Select Options</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        ) : isOut ? (
          <div className="w-full py-1.5 text-center text-slate-400 font-bold text-[10px] uppercase">
            Out of Stock
          </div>
        ) : null}
      </div>
    </div>
  )
}
