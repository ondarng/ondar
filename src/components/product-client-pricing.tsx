'use client'

import { useState } from 'react'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

interface Variant {
  name: string
  price: number | null
}

export function ProductClientSidePricing({ product, store }: { product: any, store: any }) {
  const variants: Variant[] = Array.isArray(product.variants) ? product.variants : []
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(variants.length > 0 ? variants[0] : null)
  
  const currentPrice = selectedVariant?.price || product.price

  return (
    <>
      <div className="flex flex-col gap-1.5 mt-1">
        <p className="text-xl md:text-2xl font-medium text-neutral-900 tracking-tight">
          ₦{currentPrice.toLocaleString()}
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

      {variants.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="text-sm font-bold text-neutral-900">Select Option</h3>
          <div className="flex flex-wrap gap-2">
            {variants.map((v, idx) => {
              const isSelected = selectedVariant?.name === v.name
              const vPrice = v.price || product.price
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                    isSelected 
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{v.name}</span>
                    {v.price && v.price !== product.price && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/20' : 'bg-neutral-100 text-neutral-500'}`}>
                        ₦{vPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-4 md:py-6 z-40 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto w-full">
          {product.stock_quantity > 0 ? (
            <WhatsappOrderCTA product={product} store={store} selectedVariant={selectedVariant} />
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
