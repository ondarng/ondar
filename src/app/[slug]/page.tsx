import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Store, PackageX } from 'lucide-react'
import { getContrastColor } from '@/lib/utils'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']

export const revalidate = 0 // Disable cache for MVP so settings update instantly

export default async function PublicStorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Skip reserved app routes — let Next.js handle them normally
  if (RESERVED_SLUGS.includes(slug)) {
    notFound()
  }
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  try {
    // 1. Fetch Store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (storeError) throw storeError;
    if (!store) {
      notFound()
    }

    // 2. Fetch Products
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
    
    if (prodError) throw prodError;

    return (
      <div className="min-h-screen bg-slate-50 bg-dot-pattern flex flex-col">
        {/* Immersive Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
          <div className="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {store.logo_url ? (
                  <img 
                    src={store.logo_url} 
                    alt={store.store_name} 
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md border-2 border-white" style={{ backgroundColor: store.accent_color || '#00A859', color: getContrastColor(store.accent_color || '#00A859') }}>
                    <Store className="w-6 h-6" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                  <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: store.accent_color || '#00A859' }}>
                    <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <h1 className="font-display font-extrabold text-xl tracking-tight text-primary-900">
                  {store.store_name}
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: store.accent_color || '#00A859' }}></span>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Accepting Orders</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-md mx-auto w-full px-5 py-8 space-y-8">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {products.map((product) => (
                <Link key={product.id} href={`/${slug}/product/${product.id}`} className="group flex flex-col space-y-3">
                  <div className="aspect-[4/5] bg-white rounded-3xl border border-border overflow-hidden shadow-sm group-active:scale-[0.98] transition-all relative">
                    <img 
                      src={product.image_url} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3">
                       <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-primary-900 shadow-sm border border-white/20">
                         New
                       </div>
                    </div>
                  </div>
                  <div className="px-1 space-y-1">
                    <h3 className="font-bold text-primary-900 text-sm line-clamp-1 leading-tight group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="font-display font-black text-base" style={{ color: store.accent_color || '#00A859' }}>
                        ₦{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-slate-300 shadow-sm border border-border">
                <PackageX className="w-10 h-10" />
              </div>
              <div>
                <p className="font-bold text-primary-900 text-lg">Empty Catalog</p>
                <p className="text-sm text-secondary px-8">This vendor hasn't added any products to their store yet.</p>
              </div>
            </div>
          )}
        </main>

        <footer className="py-12 flex flex-col items-center gap-4">
          <div className="h-px w-12 bg-slate-200"></div>
          <a href="https://ondar.ng" className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
            <img src="/icon.png" alt="Ondar" className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-black text-primary-900">
              Powered by Ondar
            </span>
          </a>
        </footer>
      </div>
    )
  } catch (error) {
    console.error('Store Page Error:', error)
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-primary-900">Something went wrong</h1>
        <p className="text-secondary mt-2">We couldn't load this store. Please make sure the database is set up correctly.</p>
        <Link href="/" className="mt-6 text-[#00A859] font-bold">Back to Home</Link>
      </div>
    )
  }
}
