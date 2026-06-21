'use client'

import { useState, useEffect } from 'react'
import { getInquiry, addToInquiry, type InquiryItem } from '@/lib/inquiry-store'
import { MessageSquare } from 'lucide-react'

interface AddToInquiryButtonProps {
  product: {
    id: string
    name: string
    price: number
    image_url: string
    store_id: string
  }
  storeName: string
}

export function AddToInquiryButton({ product, storeName }: AddToInquiryButtonProps) {
  const [added, setAdded] = useState(false)

  useEffect(() => {
    const list = getInquiry(product.store_id)
    setAdded(list.some(i => i.id === product.id))
  }, [product.id, product.store_id])

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const item: InquiryItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url,
      store_id: product.store_id,
    }
    addToInquiry(product.store_id, item)
    setAdded(true)
    // Dispatch a custom event so the bottom bar badge can update
    window.dispatchEvent(new Event('inquiry-updated'))
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Add to inquiry"
      className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
        added
          ? 'bg-[#00A859] text-white'
          : 'bg-white text-neutral-600 hover:bg-neutral-50'
      }`}
    >
      <MessageSquare className="w-4 h-4" />
    </button>
  )
}
