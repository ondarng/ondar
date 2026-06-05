import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Fetch Product & Store
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
    <div className="min-h-screen bg-slate-50 flex flex-col pb-32">
      {/* Header */}
      <header className="px-4 py-3 bg-white/95 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between border-b border-slate-100 shadow-sm shadow-slate-100/50">
        <Link href={`/${slug}`} className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-[15px] truncate max-w-[200px] text-slate-800">
          {product.stores.store_name}
        </span>
        <div className="w-10 h-10"></div> {/* Spacer for centering */}
      </header>

      <main className="flex-1 max-w-lg mx-auto w-full bg-white">
        {/* Large Product Image */}
        <div className="w-full aspect-square bg-slate-100 relative">
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-black" style={{ color: accent }}>
              ₦{product.price.toLocaleString()}
            </p>
          </div>

          {product.description && (
            <p className="text-[15px] text-slate-600 leading-relaxed max-w-none line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Optional Metadata */}
          {product.stock_quantity > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-green-50 text-green-700 text-xs font-bold border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              In Stock
            </div>
          )}
        </div>
      </main>

      {/* Primary Action (Sticky Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 max-w-lg mx-auto w-full z-40 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        {product.stock_quantity > 0 ? (
          <WhatsappOrderCTA product={product} store={product.stores} />
        ) : (
          <button 
            disabled
            className="w-full bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl flex items-center justify-center text-lg cursor-not-allowed"
          >
            Out of Stock
          </button>
        )}
      </div>
    </div>
  )
}
