import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Truck } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'
import StoreCartWrapper from '@/components/store-cart-wrapper'

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
            <Link 
              href={`/${slug}/product/${product.id}/checkout`}
              style={{ 
                backgroundColor: accent,
                color: getContrastColor(accent)
              }}
              className="w-full py-3 rounded-2xl shadow-xl shadow-primary-600/10 flex flex-col items-center justify-center hover:opacity-95 active:scale-95 transition-all tracking-tight"
            >
              <div className="flex items-center gap-2 font-bold text-lg">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Reserve Order
              </div>
              <span className="text-[10px] font-medium opacity-90 mt-0.5">Takes less than 10 seconds</span>
            </Link>
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
