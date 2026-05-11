'use client'

import { CartProvider } from '@/lib/cart'
import { ReactNode } from 'react'

export default function StoreCartWrapper({ children, storeSlug }: { children: ReactNode; storeSlug: string }) {
  return (
    <CartProvider storeSlug={storeSlug}>
      {children}
    </CartProvider>
  )
}
