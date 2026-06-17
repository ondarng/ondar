import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ProductGallery } from '@/components/product-gallery'
import { ProductShareButton } from '@/components/product-share-button'
import { ProductClientSidePricing } from '@/components/product-client-pricing'
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
        </div>

        <ProductClientSidePricing product={product} store={product.stores} />

        {/* Minimal Divider */}
        <div className="w-8 h-[1px] bg-neutral-200" />

        {/* Description */}
        {product.description && (
          <div className="prose prose-neutral prose-sm font-light text-neutral-500 leading-relaxed">
            <p>{product.description}</p>
          </div>
        )}

      </main>
    </div>
  )
}
