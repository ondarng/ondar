import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']

export const revalidate = 0

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (RESERVED_SLUGS.includes(slug)) {
    notFound()
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  try {
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (storeError) throw storeError;
    if (!store) notFound()

    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
    
    if (prodError) throw prodError;

    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        {/* Minimal Editorial Header */}
        <header className="w-full pt-12 pb-8 px-4 flex flex-col items-center justify-center text-center">
          {store.logo_url && (
            <img 
              src={store.logo_url} 
              alt={store.store_name} 
              className="w-16 h-16 rounded-full object-cover mb-4"
            />
          )}
          <h1 className="text-2xl font-normal tracking-tight text-neutral-900 mb-2">
            {store.store_name}
          </h1>
          <p className="text-sm text-neutral-500 font-light tracking-wide">
            Browse products and continue on WhatsApp
          </p>
        </header>

        {/* Product Catalog Grid */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-24">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 gap-y-10 md:gap-x-6 md:gap-y-12">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/${slug}/product/${product.id}`}
                  className="group flex flex-col cursor-pointer"
                >
                  {/* Premium Image Presentation (4:5 Aspect Ratio) */}
                  <div className="w-full aspect-[4/5] bg-neutral-100 overflow-hidden mb-3">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  
                  {/* Clean Typography */}
                  <div className="flex flex-col gap-1 px-1">
                    <h3 className="text-[13px] text-neutral-600 font-light leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[14px] text-neutral-900 font-medium tracking-tight">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 px-4 flex flex-col items-center">
              <p className="text-sm text-neutral-400 font-light tracking-wide uppercase">Catalog Empty</p>
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading public store:', error)
    return (
      <div className="min-h-screen flex items-center justify-center text-neutral-400 bg-white font-light">
        <p>Could not load catalog.</p>
      </div>
    )
  }
}
