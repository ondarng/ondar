import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Search, ShieldCheck, Truck, Zap, Instagram, Facebook, Twitter } from 'lucide-react'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']

export const revalidate = 0

// Map trust badges to icons based on keywords
function getBadgeIcon(badge: string) {
  const lower = badge.toLowerCase()
  if (lower.includes('delivery') || lower.includes('shipping') || lower.includes('fast')) return <Truck className="w-5 h-5 text-[#004D29]" />
  if (lower.includes('warranty') || lower.includes('original') || lower.includes('guarantee')) return <ShieldCheck className="w-5 h-5 text-[#004D29]" />
  if (lower.includes('quick') || lower.includes('support') || lower.includes('reply') || lower.includes('24/7')) return <Zap className="w-5 h-5 text-[#004D29]" />
  return <BadgeCheck className="w-5 h-5 text-[#004D29]" />
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
    
    const categories = ['All Products', ...Array.from(new Set(allProducts?.map(p => p.category).filter(Boolean)))];
    const trustBadges = store.trust_badges || ['Fast Delivery', 'Warranty', 'Quick Reply']

    return (
      <div className="min-h-screen bg-[#F9FAFB] flex flex-col font-sans">
        
        {/* Header - Desktop/Tablet Optimized */}
        <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {store.logo_url ? (
                <img src={store.logo_url} alt="Logo" className="w-9 h-9 rounded-xl object-cover shadow-sm" />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-neutral-200 flex items-center justify-center">
                  <span className="text-sm font-medium text-neutral-500">{store.store_name.charAt(0)}</span>
                </div>
              )}
              <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-1.5">
                {store.store_name}
                <BadgeCheck className="w-5 h-5 text-neutral-400" />
              </h1>
            </div>

            {/* Tablet/Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-10">
              <nav className="flex items-center gap-8 text-[13px] font-bold tracking-wide uppercase text-neutral-500">
                <Link href={`/${slug}`} className="text-[#004D29]">Catalog</Link>
              </nav>
              <form action={`/${slug}`} method="GET" className="relative flex items-center">
                {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
                <input 
                  type="search" 
                  name="q" 
                  defaultValue={searchQuery}
                  placeholder="Search products..." 
                  className="pl-9 pr-4 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#004D29]/20 focus:border-[#004D29] transition-all w-[220px]"
                />
                <Search className="w-4 h-4 absolute left-3 text-neutral-400" />
              </form>
            </div>

            {/* Mobile Search Input */}
            <form action={`/${slug}`} method="GET" className="md:hidden relative flex items-center">
                {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
                <input 
                  type="search" 
                  name="q" 
                  defaultValue={searchQuery}
                  placeholder="Search..." 
                  className="pl-8 pr-3 py-2 bg-neutral-100 border border-neutral-200 rounded-full text-[13px] outline-none w-[130px]"
                />
                <Search className="w-4 h-4 absolute left-2.5 text-neutral-400" />
            </form>
          </div>
        </header>

        <div className="max-w-6xl mx-auto w-full px-4">
          {/* Hero & Trust Section */}
          <div className="py-6 md:py-8">
            <div className="bg-white rounded-[20px] border border-neutral-200 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 shadow-sm">
              <div className="flex-1 max-w-lg">
                <h2 className="text-2xl md:text-[22px] font-bold text-[#004D29] tracking-tight leading-tight mb-3">
                  Your Premium Tech Partner
                </h2>
                <p className="text-[15px] text-neutral-600 leading-relaxed font-normal">
                  Authorized reseller of high-performance gadgets and premium accessories. Experience seamless shopping with direct WhatsApp support.
                </p>
              </div>
              
              {/* Trust Badges - Tablet/Desktop Cards */}
              <div className="flex flex-wrap md:flex-nowrap gap-3 shrink-0">
                {trustBadges.slice(0, 3).map((badge: string, i: number) => (
                  <div key={i} className="flex flex-col items-center justify-center gap-3 px-6 py-5 bg-[#F9FAFB] rounded-xl border border-neutral-100 min-w-[130px]">
                    {getBadgeIcon(badge)}
                    <span className="text-[11px] font-bold text-neutral-800 tracking-wide text-center">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Categories Strip */}
          <div className="pb-6 overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2.5 w-max">
              {categories.map((cat: any) => {
                const isActive = activeCategory === cat || (activeCategory === 'All' && cat === 'All Products');
                const catValue = cat === 'All Products' ? 'All' : cat;
                return (
                  <Link
                    key={cat}
                    href={`/${slug}${catValue === 'All' ? '' : `?category=${encodeURIComponent(catValue)}`}`}
                    className={`px-5 py-2 rounded-full text-[13px] font-bold tracking-wide transition-all ${
                      isActive 
                        ? 'bg-[#004D29] text-white shadow-md' 
                        : 'bg-[#E5E7EB] text-neutral-600 hover:bg-neutral-300'
                    }`}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Product Grid */}
          <main className="pb-24">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="flex flex-col bg-white rounded-none border border-neutral-200 overflow-hidden shadow-sm group">
                    <Link href={`/${slug}/product/${product.id}`} className="relative">
                      {/* Placeholder Badge for New/Sale */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-[#004D29] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">New</span>
                      </div>
                      <div className="w-full aspect-[4/3] bg-neutral-100 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                    </Link>
                    
                    <div className="p-5 flex flex-col flex-1">
                      <Link href={`/${slug}/product/${product.id}`} className="flex flex-col gap-1 mb-4 flex-1">
                        <h3 className="text-[17px] text-neutral-900 font-bold leading-snug line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-[15px] text-[#004D29] font-bold tracking-tight">
                          ₦{product.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 text-neutral-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                          <span className="text-xs font-bold uppercase tracking-wide">{product.stock_quantity} Ready</span>
                        </div>
                      </Link>
                      
                      <div className="mt-auto">
                        <WhatsappOrderCTA 
                          product={product} 
                          store={store} 
                          label="Ask on WhatsApp" 
                          className="w-full font-bold py-3 bg-[#004D29] text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-[13px] tracking-wide"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 px-4 flex flex-col items-center bg-white rounded-[20px] border border-neutral-200">
                <p className="text-sm text-neutral-500 font-medium">No products found{searchQuery ? ` matching "${searchQuery}"` : ''}.</p>
                {searchQuery && (
                  <Link href={`/${slug}`} className="mt-4 text-[#004D29] text-sm font-bold underline">
                    Clear Search
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="bg-[#E5E7EB] py-16 px-4 flex flex-col items-center text-center mt-auto">
          <h3 className="text-[#004D29] font-bold text-lg mb-2">{store.store_name}</h3>
          <p className="text-[13px] text-neutral-500 mb-6 font-medium">Powered by Ondar - Your conversation starts here</p>
          <div className="flex gap-6 text-neutral-400">
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
          <p className="text-[11px] text-neutral-400 mt-6 font-medium">© {new Date().getFullYear()} {store.store_name}. All rights reserved.</p>
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
