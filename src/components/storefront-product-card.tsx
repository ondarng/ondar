'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Check } from 'lucide-react'

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
      className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/80 transition-all duration-300 hover:shadow-lg"
      style={{ '--accent': accentColor } as React.CSSProperties}
    >
      {/* Image */}
      <Link href={`/${slug}/product/${product.id}`} className="relative block overflow-hidden">
        <div className="w-full aspect-square bg-slate-50 flex items-center justify-center p-3 relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>

        {/* NEW Badge */}
        {isProductNew && !isOut && (
          <span
            className="absolute top-2 left-2 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow"
            style={{ backgroundColor: accentColor }}
          >
            New
          </span>
        )}

        {/* Low Stock Badge */}
        {isLow && !isOut && (
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow">
            Only {product.stock_quantity} left!
          </span>
        )}

        {/* Out of Stock overlay */}
        {isOut && (
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Card Body */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <Link href={`/${slug}/product/${product.id}`} className="block flex-1">
          <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 uppercase tracking-wide group-hover:text-slate-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm font-black mt-1 tracking-tight" style={{ color: accentColor }}>
            {hasVariants && <span className="text-[10px] font-bold text-slate-400 mr-1">from</span>}
            ₦{Number(product.price).toLocaleString()}
          </p>
        </Link>

        {/* Add to Cart / Select Options */}
        {hasVariants ? (
          <Link
            href={`/${slug}/product/${product.id}`}
            className="w-full text-white text-xs font-bold py-2.5 rounded-xl text-center transition-all active:scale-95 hover:opacity-90"
            style={{ backgroundColor: accentColor }}
          >
            Select options
          </Link>
        ) : (
          <button
            onClick={addToCart}
            disabled={isOut || added}
            className="w-full text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-95 hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: added ? '#16a34a' : isOut ? '#94a3b8' : accentColor }}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Added!
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                {isOut ? 'Out of Stock' : 'Add to Cart'}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
