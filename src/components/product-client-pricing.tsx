'use client'

import { useState, useEffect } from 'react'
import { ShoppingBag, Check } from 'lucide-react'

interface Variant {
  name: string
  price: number | null
}

const COLOR_MAP: Record<string, string> = {
  red: '#EF4444',
  blue: '#3B82F6',
  green: '#10B981',
  yellow: '#EAB308',
  black: '#000000',
  white: '#FFFFFF',
  pink: '#EC4899',
  purple: '#8B5CF6',
  orange: '#F97316',
  gray: '#6B7280',
  grey: '#6B7280',
  brown: '#78350F',
  navy: '#1E3A8A',
  gold: '#D97706',
  silver: '#C0C0C0',
  beige: '#F5F5DC',
  cream: '#FFFDD0',
}

const isColorValue = (val: string) => {
  const clean = val.toLowerCase().trim()
  return clean.startsWith('#') || COLOR_MAP[clean] !== undefined
}

const getColorHex = (val: string) => {
  const clean = val.toLowerCase().trim()
  if (clean.startsWith('#')) return clean
  return COLOR_MAP[clean] || '#CCCCCC'
}

export function ProductClientSidePricing({ product, store }: { product: any, store: any }) {
  const variants: Variant[] = Array.isArray(product.variants) ? product.variants : []
  const [added, setAdded] = useState(false)

  // 1. Parse variant combinations (e.g., "Red / M" -> ["Red", "M"])
  const variantParts = variants.map(v => v.name.split(/\s*[\/\-]\s*/).map(p => p.trim()))
  const maxDimensions = Math.max(...variantParts.map(parts => parts.length), 0)

  // Get unique options for each dimension
  const dimensions: string[][] = Array.from({ length: maxDimensions }, (_, dimIndex) => {
    const values = variantParts.map(parts => parts[dimIndex]).filter(Boolean)
    return Array.from(new Set(values))
  })

  // Guess label for each dimension
  const getDimensionLabel = (values: string[], index: number) => {
    if (values.some(isColorValue)) return 'Color'
    if (values.some(v => ['s', 'm', 'l', 'xl', 'xxl', 'xs', 'free'].includes(v.toLowerCase()) || !isNaN(Number(v)))) return 'Size'
    return `Option ${index + 1}`
  }

  // Manage selections for each dimension
  const [selectedOptions, setSelectedOptions] = useState<string[]>(() => {
    if (variantParts.length > 0) return variantParts[0]
    return []
  })

  // Update selection for a single dimension
  const handleSelectOption = (dimIndex: number, value: string) => {
    const nextSelections = [...selectedOptions]
    nextSelections[dimIndex] = value

    // If the exact combination doesn't exist, try to find a valid combination containing this new option
    const exactMatchExists = variants.some(v => {
      const parts = v.name.split(/\s*[\/\-]\s*/).map(p => p.trim())
      return nextSelections.every((sel, idx) => parts[idx] === sel)
    })

    if (!exactMatchExists) {
      // Find the first variant that matches our newly selected option at dimIndex
      const alternative = variants.find(v => {
        const parts = v.name.split(/\s*[\/\-]\s*/).map(p => p.trim())
        return parts[dimIndex] === value
      })
      if (alternative) {
        setSelectedOptions(alternative.name.split(/\s*[\/\-]\s*/).map(p => p.trim()))
        return
      }
    }

    setSelectedOptions(nextSelections)
  }

  // Resolve the active variant based on current selections
  const activeVariant = variants.find(v => {
    const parts = v.name.split(/\s*[\/\-]\s*/).map(p => p.trim())
    return parts.every((part, idx) => selectedOptions[idx] === part)
  }) || (variants.length > 0 ? variants[0] : null)

  const currentPrice = activeVariant?.price ?? product.price

  // Helper to check if selection combination is valid
  const isOptionAvailable = (dimIndex: number, val: string) => {
    const testSelections = [...selectedOptions]
    testSelections[dimIndex] = val
    return variants.some(v => {
      const parts = v.name.split(/\s*[\/\-]\s*/).map(p => p.trim())
      return testSelections.every((sel, idx) => parts[idx] === sel)
    })
  }

  const handleAddToCart = () => {
    const key = `ondar-cart-${store.slug}`
    const stored = localStorage.getItem(key)
    let cart: any[] = []
    if (stored) {
      try {
        cart = JSON.parse(stored)
      } catch (e) {
        console.error(e)
      }
    }

    const variantName = activeVariant?.name || null
    const itemIndex = cart.findIndex(item => item.id === product.id && item.variantName === variantName)
    if (itemIndex > -1) {
      cart[itemIndex].quantity += 1
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: currentPrice,
        imageUrl: product.image_url,
        quantity: 1,
        variantName: variantName
      })
    }

    localStorage.setItem(key, JSON.stringify(cart))
    window.dispatchEvent(new Event('ondar-cart-updated'))
    
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <>
      <div className="flex flex-col gap-1.5 mt-1">
        <p className="text-xl md:text-2xl font-medium text-neutral-900 tracking-tight">
          {activeVariant?.price && activeVariant.price !== product.price ? (
            <span className="flex items-baseline gap-2">
              <span>₦{activeVariant.price.toLocaleString()}</span>
              <span className="text-xs text-neutral-400 font-normal line-through">₦{Number(product.price).toLocaleString()}</span>
            </span>
          ) : (
            <span>₦{Number(product.price).toLocaleString()}</span>
          )}
        </p>
        {product.stock_quantity > 5 ? (
          <div className="flex items-center gap-1.5 text-[#00A859] text-[13px] font-bold">
            <span>✓</span> Available
          </div>
        ) : product.stock_quantity > 0 ? (
          <div className="flex items-center gap-1.5 text-[#eab308] text-[13px] font-bold">
            <span>⚠</span> Limited Stock
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-neutral-400 text-[13px] font-bold">
            <span>⛔</span> Out of Stock
          </div>
        )}
      </div>

      {dimensions.map((options, dimIndex) => {
        const label = getDimensionLabel(options, dimIndex)
        const isColor = label === 'Color'

        return (
          <div key={dimIndex} className="space-y-3 mt-6">
            <h3 className="text-sm font-bold text-neutral-900">{label}</h3>
            <div className="flex flex-wrap gap-2.5 items-center">
              {options.map((val, idx) => {
                const isSelected = selectedOptions[dimIndex] === val
                const isAvailable = isOptionAvailable(dimIndex, val)

                // Try to find price context for this specific option if it's the only dimension
                let optionPriceLabel = ''
                if (maxDimensions === 1) {
                  const matchedVariant = variants.find(v => v.name === val)
                  if (matchedVariant?.price && matchedVariant.price !== product.price) {
                    optionPriceLabel = ` (₦${matchedVariant.price.toLocaleString()})`
                  }
                }

                if (isColor) {
                  const hex = getColorHex(val)
                  const isWhite = hex.toLowerCase() === '#ffffff'
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(dimIndex, val)}
                      disabled={!isAvailable}
                      style={{ backgroundColor: hex }}
                      title={`${val}${optionPriceLabel}`}
                      className={`w-9 h-9 rounded-full relative transition-all duration-200 border flex items-center justify-center ${
                        isSelected 
                          ? 'ring-2 ring-offset-2 ring-neutral-900 scale-105 shadow-sm' 
                          : 'border-neutral-200 hover:scale-105'
                      } ${!isAvailable ? 'opacity-20 cursor-not-allowed' : ''}`}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 ${isWhite ? 'text-neutral-900' : 'text-white'}`} />
                      )}
                    </button>
                  )
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(dimIndex, val)}
                    disabled={!isAvailable}
                    className={`px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected 
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                        : isAvailable 
                          ? 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                          : 'border-neutral-100 bg-neutral-50 text-neutral-300 cursor-not-allowed line-through'
                    }`}
                  >
                    {val}{optionPriceLabel}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-4 md:py-6 z-40 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto w-full">
          {product.stock_quantity > 0 ? (
            <button 
              onClick={handleAddToCart}
              style={{ backgroundColor: store.accent_color || '#00A859' }}
              className="w-full text-white font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-[15px] shadow-lg shadow-black/5"
            >
              {added ? (
                <>
                  <Check className="w-5 h-5" />
                  Added to Cart!
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart • ₦{currentPrice.toLocaleString()}
                </>
              )}
            </button>
          ) : (
            <button 
              disabled
              className="w-full bg-neutral-100 text-neutral-400 font-medium tracking-wide py-4 rounded-none flex items-center justify-center text-[15px] cursor-not-allowed uppercase"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </>
  )
}
