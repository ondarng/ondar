'use client'

import { useState, useEffect } from 'react'
import { getInquiry, removeFromInquiry, clearInquiry, type InquiryItem } from '@/lib/inquiry-store'
import { Trash2, ArrowLeft, Loader2, Package } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

interface InquiryListClientProps {
  slug: string
  storeId: string
  storeName: string
  waPhone: string
  accentColor?: string
}

export function InquiryListClient({ slug, storeId, storeName, waPhone, accentColor = '#00A859' }: InquiryListClientProps) {
  const [items, setItems] = useState<InquiryItem[]>([])
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    setItems(getInquiry(storeId))
    setMounted(true)
  }, [storeId])

  const handleRemove = (itemId: string, variant?: string) => {
    const updated = removeFromInquiry(storeId, itemId, variant)
    setItems(updated)
    window.dispatchEvent(new Event('inquiry-updated'))
  }

  const handleContinueOnWhatsApp = async () => {
    if (items.length === 0) return
    setLoading(true)

    try {
      // Create lead in the database
      await supabase.from('leads').insert({
        store_id: storeId,
        products: items,
        status: 'NEW'
      })

      // Generate WhatsApp message
      let phone = waPhone.replace(/[^0-9]/g, '')
      if (phone.startsWith('0')) phone = '234' + phone.slice(1)
      if (!phone.startsWith('234') && phone.length <= 10) phone = '234' + phone

      let message = `Hello ${storeName},\n\nI'm interested in the following products:\n\n`
      items.forEach(item => {
        const variantText = item.variant ? ` (${item.variant})` : ''
        message += `• ${item.name}${variantText}\n`
      })
      message += `\nCould you confirm availability and pricing?`

      const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      
      // Clear inquiry list after sending
      clearInquiry(storeId)
      setItems([])
      window.dispatchEvent(new Event('inquiry-updated'))

      window.open(whatsappUrl, '_blank')
    } catch (error) {
      console.error('Failed to create lead:', error)
      // Fallback
      let phone = waPhone.replace(/[^0-9]/g, '')
      if (phone.startsWith('0')) phone = '234' + phone.slice(1)
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${storeName}, I have an inquiry.`)}`, '_blank')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-[#F5F5F5] font-sans pb-32">
      <header className="bg-white px-4 py-4 sticky top-0 z-40 border-b border-neutral-100 flex items-center gap-3">
        <Link href={`/${slug}`} className="w-8 h-8 flex items-center justify-center bg-neutral-100 text-neutral-600 rounded-full hover:bg-neutral-200 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-[16px] font-extrabold text-neutral-900">Inquiry List</h1>
      </header>

      <main className="p-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-neutral-100 shadow-inner mb-2">
              <Package className="w-8 h-8 text-neutral-300" />
            </div>
            <p className="text-[15px] text-neutral-900 font-bold">Your list is empty</p>
            <p className="text-[13px] text-neutral-500">Tap the message icon on products to add them here.</p>
            <Link href={`/${slug}`} className="mt-2 text-[13px] font-bold text-[#00A859] underline underline-offset-2">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {items.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-3 bg-white p-3 rounded-2xl shadow-sm border border-neutral-100">
                <div className="w-20 h-20 bg-neutral-50 rounded-xl overflow-hidden shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1 flex flex-col justify-center min-w-0">
                  <h3 className="text-[13px] font-bold text-neutral-800 leading-snug truncate">{item.name}</h3>
                  {item.variant && (
                    <p className="text-[11px] text-neutral-500 truncate mt-0.5">{item.variant}</p>
                  )}
                  <p className="text-[13px] font-extrabold text-neutral-900 mt-1">₦{item.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => handleRemove(item.id, item.variant)}
                  className="w-10 h-10 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors self-center shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-100 px-4 py-3 pb-[env(safe-area-inset-bottom)]">
          <button
            onClick={handleContinueOnWhatsApp}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#00A859] text-white rounded-full py-3.5 font-bold text-[15px] shadow-sm active:scale-[0.98] transition-all disabled:opacity-70"
            style={{ backgroundColor: accentColor }}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Continue on WhatsApp
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
