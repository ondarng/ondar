'use client'

import { Phone } from 'lucide-react'

interface Variant {
  name: string
  price: number | null
}

export function ProductWhatsappButton({ 
  product, 
  store, 
  selectedVariant 
}: { 
  product: any
  store: any
  selectedVariant: Variant | null 
}) {
  const currentPrice = selectedVariant?.price ?? product.price
  
  // Format the text for WhatsApp
  const storeName = store.store_name
  const productName = product.name
  const variantText = selectedVariant ? ` - ${selectedVariant.name}` : ''
  const priceText = `₦${currentPrice.toLocaleString()}`
  const imageUrl = product.image_url ? `\n\nImage: ${product.image_url}` : ''

  const message = `Hi ${storeName}, I'm interested in ${productName}${variantText} for ${priceText}. Is it available?${imageUrl}`
  
  // Clean phone number (remove everything except numbers and +, ensure it has country code if needed)
  let phone = store.whatsapp_number || ''
  phone = phone.replace(/[^0-9+]/g, '')
  if (phone.startsWith('0')) {
    phone = '234' + phone.substring(1) // naive assumption for NG if 0 is used, better to rely on vendor input but this is a fallback
  }

  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

  return (
    <a 
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full bg-[#25D366] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#20bd5a] active:scale-95 transition-all shadow-lg shadow-[#25D366]/20 text-[15px]"
    >
      <Phone className="w-5 h-5 fill-current" />
      Chat on WhatsApp
    </a>
  )
}
