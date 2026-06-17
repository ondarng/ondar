'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { posthog } from '@/lib/posthog'
import { Loader2 } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'

interface WhatsappOrderCTAProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string
    store_id: string
  }
  store: {
    id: string
    whatsapp_number: string
    store_name: string
    accent_color?: string
  }
  label?: string
  className?: string
  selectedVariant?: { name: string, price: number | null } | null
}

export function WhatsappOrderCTA({ product, store, label = "Continue on WhatsApp", className, selectedVariant }: WhatsappOrderCTAProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const accent = store.accent_color || '#00A859'
  const textColor = getContrastColor(accent)

  const handleWhatsappOrder = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    setLoading(true)

    try {
      const finalPrice = selectedVariant?.price || product.price
      const variantText = selectedVariant ? ` (${selectedVariant.name})` : ''

      // 1. Record the order in Supabase as PENDING
      await supabase.from('orders').insert({
        store_id: store.id,
        product_id: product.id,
        quantity: 1,
        total_price: finalPrice,
        customer_name: 'WhatsApp Lead',
        status: 'PENDING'
      })

      // 2. Capture analytics event
      posthog.capture('whatsapp_order_initiated', {
        product_id: product.id,
        product_name: product.name,
        variant_name: selectedVariant?.name,
        store_id: store.id,
        store_name: store.store_name,
        price: finalPrice
      })

      let phone = store.whatsapp_number.replace(/[^0-9]/g, '')
      if (phone.startsWith('0')) {
        phone = '234' + phone.slice(1)
      } else if (!phone.startsWith('234') && phone.length <= 10) {
        phone = '234' + phone
      }

      const message = `Hi ${store.store_name}, I want to buy this product from your Ondar store:\n\n📦 *${product.name}${variantText}*\n💰 ₦${finalPrice.toLocaleString()}\n\nImage: ${product.image_url}\n\nIs it still available?`
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`

      // 4. Open WhatsApp
      window.open(whatsappUrl, '_blank')
    } catch (err) {
      console.error('Error initiating WhatsApp order:', err)
      const finalPrice = selectedVariant?.price || product.price
      const variantText = selectedVariant ? ` (${selectedVariant.name})` : ''
      let phone = store.whatsapp_number.replace(/[^0-9]/g, '')
      if (phone.startsWith('0')) phone = '234' + phone.slice(1)
      const message = `Hi ${store.store_name}, I want to buy: ${product.name}${variantText} (₦${finalPrice})`
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleWhatsappOrder}
      disabled={loading}
      style={{ 
        backgroundColor: accent,
        color: textColor
      }}
      className={className || "w-full font-medium py-4 rounded-none flex items-center justify-center gap-3 hover:opacity-90 active:bg-black/90 transition-all text-[15px] uppercase tracking-widest disabled:opacity-70"}
    >
      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          {label}
        </>
      )}
    </button>
  )
}
