'use client'

import { Share2 } from 'lucide-react'

export function ProductShareButton({ productName, storeName }: { productName: string, storeName: string }) {
  const handleShare = async () => {
    const url = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${productName} on ${storeName}`,
          text: `Check out ${productName} on ${storeName}`,
          url: url,
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      try {
        await navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  return (
    <button 
      onClick={handleShare}
      className="p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors text-neutral-600 flex-shrink-0"
      aria-label="Share product"
    >
      <Share2 className="w-5 h-5" />
    </button>
  )
}
