import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'
import StoreCartWrapper from '@/components/store-cart-wrapper'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // 1. Fetch Product & Store
  const { data: product } = await supabase
    .from('products')
    .select('*, stores(*)')
    .eq('id', id)
    .single()

  if (!product || product.stores.slug !== slug) {
    notFound()
  }

  const accent = product.stores.accent_color || '#00A859'

  return (
    <StoreCartWrapper storeSlug={slug}>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Header */}
        <header className="px-6 py-4 border-b border-border flex items-center gap-4 sticky top-0 bg-white z-10">
          <Link href={`/${slug}`} className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors" style={{ color: accent }}>
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold truncate" style={{ color: accent }}>{product.name}</span>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full pb-32">
          {/* Product Image */}
          <div className="aspect-square bg-slate-100 overflow-hidden">
            <img 
              src={product.image_url} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Details */}
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-display font-extrabold text-primary-900">
                {product.name}
              </h1>
              <p className="text-3xl font-display font-black" style={{ color: accent }}>
                ₦{product.price.toLocaleString()}
              </p>
            </div>

            <div className="space-y-2 text-secondary leading-relaxed">
              <h3 className="text-xs uppercase tracking-widest font-bold text-primary-900">Description</h3>
              <p className="text-sm">
                {product.description || "No description provided."}
              </p>
            </div>



            <div className="bg-slate-50 p-4 rounded-2xl border border-border flex items-center gap-4">
               <img 
                 src={product.stores.logo_url || "/icon.png"} 
                 alt={product.stores.store_name} 
                 className="w-10 h-10 rounded-full object-cover border border-border"
               />
               <div>
                 <p className="text-xs text-secondary">Sold by</p>
                 <div className="flex items-center gap-2">
                   <p className="font-bold text-primary-900">{product.stores.store_name}</p>
                 </div>
               </div>
            </div>
          </div>
        </main>

        {/* Sticky Bottom CTA */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-border max-w-md mx-auto w-full z-20 flex gap-3">
          {product.stock_quantity > 0 ? (
            <WhatsappOrderCTA 
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image_url: product.image_url,
                store_id: product.stores.id
              }}
              store={{
                id: product.stores.id,
                whatsapp_number: product.stores.whatsapp_number,
                store_name: product.stores.store_name,
                accent_color: product.stores.accent_color
              }}
            />
          ) : (
            <button 
              disabled
              className="w-full bg-slate-100 text-slate-400 font-bold py-5 rounded-2xl flex items-center justify-center gap-2 text-lg cursor-not-allowed"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </StoreCartWrapper>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}
