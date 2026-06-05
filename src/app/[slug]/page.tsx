import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Share2 } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'

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

    const accent = store.accent_color || '#00A859'
    const textColor = getContrastColor(accent)

    return (
      <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
        {/* Minimal Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {store.logo_url && (
                <img 
                  src={store.logo_url} 
                  alt={store.store_name} 
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              )}
              <div>
                <h1 className="font-display font-extrabold text-lg text-slate-900 leading-tight">
                  {store.store_name}
                </h1>
                <p className="text-[11px] font-medium text-slate-500 truncate max-w-[200px]">
                  Powered by Ondar
                </p>
              </div>
            </div>
            
            <button className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Hero Strip (High Clarity) */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-4xl mx-auto px-4 py-6 text-center space-y-1.5">
            <h2 className="text-base font-bold text-slate-900">Browse products → Order on WhatsApp</h2>
            <p className="text-xs text-slate-500 font-medium">Fast • Simple • No signup needed</p>
          </div>
        </div>

        {/* Product Grid */}
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/${slug}/product/${product.id}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200/60 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <div className="aspect-square bg-slate-100 overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-[13px] leading-snug line-clamp-1 text-slate-800">
                      {product.name}
                    </h3>
                    <p className="font-bold text-sm mt-1 text-slate-900">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-bold text-lg text-slate-800">No products found</h3>
              <p className="text-sm text-slate-500 mt-2">This store hasn't added any products yet or they are out of stock.</p>
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    console.error('Error loading public store:', error)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 bg-slate-50">
        <p>Could not load store. Please try again.</p>
      </div>
    )
  }
}
