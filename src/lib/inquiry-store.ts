'use client'

// Lightweight localStorage-backed inquiry list.
// Keeps track of products a customer is interested in across the storefront.

export interface InquiryItem {
  id: string
  name: string
  price: number
  image_url: string
  store_id: string
  variant?: string
}

const KEY = 'ondar_inquiry'

export function getInquiry(storeId: string): InquiryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(`${KEY}_${storeId}`)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function addToInquiry(storeId: string, item: InquiryItem): InquiryItem[] {
  const list = getInquiry(storeId)
  const exists = list.some(i => i.id === item.id && i.variant === item.variant)
  if (exists) return list
  const updated = [...list, item]
  localStorage.setItem(`${KEY}_${storeId}`, JSON.stringify(updated))
  return updated
}

export function removeFromInquiry(storeId: string, itemId: string, variant?: string): InquiryItem[] {
  const list = getInquiry(storeId)
  const updated = list.filter(i => !(i.id === itemId && i.variant === variant))
  localStorage.setItem(`${KEY}_${storeId}`, JSON.stringify(updated))
  return updated
}

export function clearInquiry(storeId: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${KEY}_${storeId}`)
}
