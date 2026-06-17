import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'
import { ProductGallery } from '@/components/product-gallery'
import { ProductShareButton } from '@/components/product-share-button'
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative pb-32">
      
      {/* Floating Back Button */}
      <Link 
        href={`/${slug}`} 
        className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-neutral-900 shadow-sm border border-white/20 transition-transform active:scale-90"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      {/* Hero Image Gallery */}
      <ProductGallery 
        images={[
          product.image_url, 
          ...(Array.isArray(product.additional_images) ? product.additional_images : [])
        ].filter(Boolean)} 
      />

      {/* Product Information (Pure Content) */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pt-8 pb-10 space-y-6">
        
        {/* Title, Share & Price */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-normal text-neutral-900 tracking-tight leading-snug">
              {product.name}
            </h1>
            <ProductShareButton productName={product.name} storeName={product.stores.store_name} />
          </div>
          <p className="text-xl md:text-2xl font-medium text-neutral-900 tracking-tight">
            ₦{product.price.toLocaleString()}
          </p>
        </div>

        {/* Minimal Divider */}
        <div className="w-8 h-[1px] bg-neutral-200" />

        {/* Description */}
        {product.description && (
          <div className="prose prose-neutral prose-sm font-light text-neutral-500 leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

      </main>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 px-4 py-4 md:py-6 z-40 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-[0_-20px_40px_-20px_rgba(0,0,0,0.05)]">
        <div className="max-w-2xl mx-auto w-full">
          {product.stock_quantity > 0 ? (
            <WhatsappOrderCTA product={product} store={product.stores} />
          ) : (
            <button 
              disabled
              className="w-full bg-neutral-100 text-neutral-400 font-medium tracking-wide py-4 rounded-none flex items-center justify-center text-[15px] cursor-not-allowed uppercase"
            >
              Out of Stock
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
