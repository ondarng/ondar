import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Search, ShieldCheck, Truck, Zap, Instagram, Facebook, Twitter, MessageCircle } from 'lucide-react'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']

export const revalidate = 0

// Simplified trust icons inline
function getInlineIcon(badge: string) {
  const lower = badge.toLowerCase()
  if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('fast')) return <Truck className="w-3 h-3 text-[#00A859]" />
  if (lower.includes('warranty') || lower.includes('original') || lower.includes('guarantee')) return <ShieldCheck className="w-3 h-3 text-[#00A859]" />
  return <BadgeCheck className="w-3 h-3 text-[#00A859]" />
}

export default async function PublicStorePage(props: { 
  params: Promise<{ slug: string }>,
  searchParams: Promise<{ category?: string, q?: string }>
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { slug } = params;
  const activeCategory = searchParams.category || 'All';
  const searchQuery = searchParams.q || '';

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

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`)
    }

    const { data: products, error: prodError } = await query
    
    if (prodError) throw prodError;

    const { data: allProducts } = await supabase
      .from('products')
      .select('category')
      .eq('store_id', store.id)
      .gt('stock_quantity', 0)
    
    const categories = ['All', ...Array.from(new Set(allProducts?.map(p => p.category).filter(Boolean)))];
    const trustBadges = store.trust_badges || ['Nationwide Delivery', '100% Original', 'Warranty']

    return (
      <div className="min-h-screen bg-white flex flex-col font-sans">
        
        {/* Top Minimal Search Bar (Only appears if needed, otherwise clean) */}
        <div className="border-b border-neutral-100 bg-white sticky top-0 z-50">
           <div className="max-w-4xl mx-auto px-4 py-2 flex justify-end">
              <form action={`/${slug}`} method="GET" className="relative flex items-center">
                  {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
                  <input 
                    type="search" 
                    name="q" 
                    defaultValue={searchQuery}
                    placeholder="Search..." 
                    className="pl-8 pr-3 py-1.5 bg-neutral-100 border-none rounded-full text-[13px] outline-none w-[140px] focus:w-[200px] transition-all"
                  />
                  <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400" />
              </form>
           </div>
        </div>

        <div className="max-w-4xl mx-auto w-full px-4">
          
          {/* Integrated Seller Profile */}
          <div className="py-8 md:py-10 flex flex-col items-center text-center">
            {store.logo_url ? (
              <img src={store.logo_url} alt="Logo" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover shadow-sm mb-4 border border-neutral-100" />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neutral-100 flex items-center justify-center mb-4 border border-neutral-200">
                <span className="text-2xl font-semibold text-neutral-400">{store.store_name.charAt(0)}</span>
              </div>
            )}
            
            <h1 className="text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight flex items-center justify-center gap-2 mb-2">
              {store.store_name}
              <BadgeCheck className="w-6 h-6 text-[#00A859]" />
            </h1>
            
            <p className="text-[15px] md:text-base text-neutral-500 max-w-lg mb-5 leading-relaxed">
              Authorized reseller of high-performance gadgets and premium accessories. Experience seamless shopping with direct WhatsApp support.
            </p>

            {/* Inline Trust Signals attached to identity */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
               {trustBadges.map((badge: string, i: number) => (
                  <div key={i} className="flex items-center gap-1.5">
                     {getInlineIcon(badge)}
                     <span className="text-[12px] font-bold text-neutral-700 uppercase tracking-wide">{badge}</span>
                  </div>
               ))}
            </div>
          </div>

          {/* Categories Strip */}
          <div className="pb-6 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 justify-start md:justify-center w-max md:w-full mx-auto">
              {categories.map((cat: any) => {
                const isActive = activeCategory === cat;
                return (
                  <Link
                    key={cat}
                    href={`/${slug}${cat === 'All' ? '' : `?category=${encodeURIComponent(cat)}`}`}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-bold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-black text-white shadow-sm' 
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* High-Density Product Grid */}
          <main className="pb-20">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col bg-white rounded-xl border border-neutral-200 overflow-hidden group hover:border-neutral-300 transition-colors">
                    <Link href={`/${slug}/product/${product.id}`} className="relative block">
                      {/* Subtle category label on image */}
                      {product.category && (
                         <div className="absolute top-2 left-2 z-10 bg-black/70 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                           {product.category}
                         </div>
                      )}
                      <div className="w-full aspect-[4/5] bg-neutral-50 overflow-hidden relative">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                    
                    <div className="p-2.5 md:p-3 flex flex-col flex-1">
                      <Link href={`/${slug}/product/${product.id}`} className="flex flex-col gap-0.5 mb-3 flex-1">
                        <h3 className="text-[13px] md:text-[14px] text-neutral-800 font-semibold leading-snug line-clamp-2 min-h-[38px]">
                          {product.name}
                        </h3>
                        <p className="text-[14px] md:text-[15px] text-black font-extrabold tracking-tight mt-0.5">
                          ₦{product.price.toLocaleString()}
                        </p>
                      </Link>
                      
                      <div className="mt-auto">
                        <WhatsappOrderCTA 
                          product={product} 
                          store={store} 
                          label="Ask on WhatsApp" 
                          className="w-full font-bold py-2 bg-neutral-100 text-black hover:bg-[#00A859] hover:text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors text-[12px] tracking-wide"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 flex flex-col items-center border border-dashed border-neutral-200 rounded-2xl">
                <p className="text-sm text-neutral-500 font-medium">No products found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                {searchQuery && (
                  <Link href={`/${slug}`} className="mt-4 text-black text-sm font-bold underline">
                    Clear Search
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-neutral-50 py-12 px-4 flex flex-col items-center text-center mt-auto border-t border-neutral-100">
          <h3 className="text-black font-bold text-base mb-1">{store.store_name}</h3>
          <p className="text-[12px] text-neutral-400 mb-6 font-medium">Powered by Ondar</p>
          <div className="flex gap-5 text-neutral-400">
            {store.instagram_handle && (
              <a href={store.instagram_handle.startsWith('http') ? store.instagram_handle : `https://instagram.com/${store.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            )}
            {store.facebook_handle && (
              <a href={store.facebook_handle.startsWith('http') ? store.facebook_handle : `https://facebook.com/${store.facebook_handle}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            )}
            {store.twitter_handle && (
              <a href={store.twitter_handle.startsWith('http') ? store.twitter_handle : `https://x.com/${store.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            )}
          </div>
        </footer>

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
