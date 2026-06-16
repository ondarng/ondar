import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Search, ShieldCheck } from 'lucide-react'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']

export const revalidate = 0

export default async function PublicStorePage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ category?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const activeCategory = searchParams.category || 'All';

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

    let query = supabase
      .from('products')
      .select('*')
      .eq('store_id', store.id)
      .gt('stock_quantity', 0)
      .order('created_at', { ascending: false })
      
    if (activeCategory !== 'All') {
      query = query.eq('category', activeCategory)
    }

    const { data: products, error: prodError } = await query
    
    if (prodError) throw prodError;

    // Extract unique categories from all products (could be optimized later, but fine for V1)
    const { data: allProducts } = await supabase
      .from('products')
      .select('category')
      .eq('store_id', store.id)
      .gt('stock_quantity', 0)
    
    const categories = ['All', ...Array.from(new Set(allProducts?.map(p => p.category).filter(Boolean)))];
    
    // Safely parse trust_badges or use fallback
    const trustBadges = store.trust_badges || ['Nationwide Delivery', '100% Original', 'Warranty']

    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col font-sans">
        
        {/* Header */}
        <header className="bg-white px-4 py-3 flex items-center justify-between border-b border-neutral-100 sticky top-0 z-50">
          <div className="flex items-center gap-2">
            {store.logo_url ? (
              <img src={store.logo_url} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                <span className="text-xs font-medium text-neutral-500">{store.store_name.charAt(0)}</span>
              </div>
            )}
            <h1 className="text-[17px] font-semibold text-neutral-900 tracking-tight flex items-center gap-1.5">
              {store.store_name}
              <BadgeCheck className="w-4 h-4 text-[#00A859]" />
            </h1>
          </div>
          <button className="p-2 text-neutral-600">
            <Search className="w-5 h-5" />
          </button>
        </header>

        {/* Hero & Trust Section */}
        <div className="bg-white px-4 py-5 mb-2">
          <p className="text-sm text-neutral-500 mb-1">{store.store_name} Store</p>
          <h2 className="text-2xl font-bold text-[#004D29] tracking-tight leading-tight mb-4">
            High-quality gadgets for pros
          </h2>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap gap-2">
            {trustBadges.map((badge: string, i: number) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 rounded-full border border-neutral-200">
                {i === 0 || i === 1 ? <BadgeCheck className="w-3.5 h-3.5 text-[#00A859]" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#00A859]" />}
                <span className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Categories Strip */}
        <div className="bg-white px-4 py-3 border-b border-neutral-100 overflow-x-auto hide-scrollbar sticky top-[60px] z-40">
          <div className="flex items-center gap-2 w-max">
            {categories.map((cat: any) => {
              const isActive = cat === activeCategory;
              return (
                <Link
                  key={cat}
                  href={`/${slug}${cat === 'All' ? '' : `?category=${encodeURIComponent(cat)}`}`}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-[#004D29] text-white' 
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Product Grid */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6">
          {products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {products.map((product) => (
                <div key={product.id} className="flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
                  <Link href={`/${slug}/product/${product.id}`} className="group relative">
                    <div className="w-full aspect-square bg-neutral-100 overflow-hidden">
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  
                  <div className="p-3 flex flex-col flex-1">
                    <Link href={`/${slug}/product/${product.id}`} className="flex flex-col gap-1 flex-1 mb-3">
                      <h3 className="text-[13px] text-neutral-700 font-normal leading-snug line-clamp-2 min-h-[38px]">
                        {product.name}
                      </h3>
                      <p className="text-[15px] text-[#004D29] font-bold tracking-tight">
                        ₦{product.price.toLocaleString()}
                      </p>
                    </Link>
                    
                    {/* Direct WhatsApp Button on Card */}
                    <div className="mt-auto">
                      <WhatsappOrderCTA 
                        product={product} 
                        store={store} 
                        label="Ask on WhatsApp" 
                        className="w-full font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-[13px] shadow-sm disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4 flex flex-col items-center">
              <p className="text-sm text-neutral-500 font-medium">No products found in this category.</p>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-neutral-100 py-10 px-4 flex flex-col items-center text-center border-t border-neutral-200 mt-auto">
          <h3 className="text-[#004D29] font-semibold text-lg mb-2">{store.store_name}</h3>
          <p className="text-xs text-neutral-500 mb-6">Powered by Ondar - Your conversation starts here</p>
          <div className="flex gap-4 text-xs font-medium text-neutral-600 underline">
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
          </div>
        </footer>

        {/* Floating Chat Button */}
        <div className="fixed bottom-6 right-4 z-50">
          <a 
            href={`https://wa.me/${store.whatsapp_number.replace(/[^0-9]/g, '')}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3.5 bg-[#00A859] text-white rounded-full shadow-lg font-semibold text-sm hover:opacity-95 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat with Us
          </a>
        </div>

        {/* CSS to hide scrollbar for categories strip */}
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
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
