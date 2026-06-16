import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { BadgeCheck, Search, ShieldCheck, Truck, Zap } from 'lucide-react'
import { WhatsappOrderCTA } from '@/components/whatsapp-order-cta'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']
export const revalidate = 0

function TrustIcon({ badge }: { badge: string }) {
  const l = badge.toLowerCase()
  if (l.includes('delivery') || l.includes('shipping') || l.includes('fast')) return <Truck className="w-3.5 h-3.5 shrink-0" />
  if (l.includes('warranty') || l.includes('guarantee')) return <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
  if (l.includes('quick') || l.includes('reply') || l.includes('support')) return <Zap className="w-3.5 h-3.5 shrink-0" />
  return <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
}

export default async function PublicStorePage(props: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { slug } = await props.params
  const { category, q } = await props.searchParams
  const activeCategory = category || 'All'
  const searchQuery = q || ''

  if (RESERVED_SLUGS.includes(slug)) notFound()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  try {
    const { data: store, error: storeError } = await supabase
      .from('stores').select('*').eq('slug', slug).maybeSingle()
    if (storeError) throw storeError
    if (!store) notFound()

    // Fetch all categories for filter strip
    const { data: allProds } = await supabase
      .from('products').select('category').eq('store_id', store.id).gt('stock_quantity', 0)
    const categories = ['All', ...Array.from(new Set(allProds?.map(p => p.category).filter(Boolean)))]

    // Fetch products with filters
    let query = supabase
      .from('products').select('*').eq('store_id', store.id)
      .gt('stock_quantity', 0).order('created_at', { ascending: false })
    if (activeCategory !== 'All') query = query.eq('category', activeCategory)
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
    const { data: products, error: prodError } = await query
    if (prodError) throw prodError

    const trustBadges: string[] = store.trust_badges || ['Nationwide Delivery', '100% Original', 'Warranty']
    const waPhone = store.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''

    return (
      <div className="min-h-screen bg-[#FAFAFA] font-sans">

        {/* ── SEARCH BAR – sticky, ultra-minimal ── */}
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-neutral-100">
          <form
            action={`/${slug}`}
            method="GET"
            className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3"
          >
            {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
            {/* Store name in header on mobile */}
            <span className="md:hidden text-[14px] font-bold text-neutral-900 truncate max-w-[130px]">
              {store.store_name}
            </span>
            <div className="relative flex items-center ml-auto">
              <Search className="absolute left-3 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search products…"
                className="pl-9 pr-4 py-2 bg-neutral-100 rounded-full text-[13px] outline-none
                           w-[160px] focus:w-[220px] transition-all duration-300
                           focus:ring-2 focus:ring-neutral-300"
              />
            </div>
          </form>
        </div>

        <div className="max-w-5xl mx-auto px-4">

          {/* ── SELLER IDENTITY BLOCK ── */}
          {/*
            Layout:
            Mobile  → centered column  (logo → name → desc → trust)
            Tablet+ → left-aligned row (logo | name + desc + trust)
            This is the PRIMARY TRUST signal. Everything else is secondary.
          */}
          <div className="py-8 md:py-10">
            <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-8">

              {/* Logo */}
              <div className="flex justify-center md:justify-start shrink-0">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={store.store_name}
                    className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-neutral-200 flex items-center justify-center border-2 border-white shadow-md">
                    <span className="text-2xl font-extrabold text-neutral-500">{store.store_name.charAt(0)}</span>
                  </div>
                )}
              </div>

              {/* Text Stack */}
              <div className="text-center md:text-left flex-1">
                {/* 1. Store Name — strongest element */}
                <h1 className="text-[28px] md:text-[34px] font-extrabold text-neutral-900 leading-tight tracking-tight flex items-center justify-center md:justify-start gap-2 mb-2">
                  {store.store_name}
                  <BadgeCheck className="w-6 h-6 md:w-7 md:h-7 text-[#00A859] shrink-0" />
                </h1>

                {/* 2. Description */}
                <p className="text-[14px] md:text-[15px] text-neutral-500 leading-relaxed mb-5 max-w-lg mx-auto md:mx-0">
                  {store.description || 'Your trusted vendor on Ondar. Browse the catalog and start a conversation.'}
                </p>

                {/* 3. Trust signals — attached to identity, not the page */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2">
                  {trustBadges.map((badge: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 text-[12px] font-semibold text-neutral-700">
                      <TrustIcon badge={badge} />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Sticky WhatsApp CTA in hero row */}
              <div className="hidden md:flex shrink-0 self-center">
                <a
                  href={`https://wa.me/${waPhone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[#00A859] text-white px-6 py-3 rounded-full font-bold text-[14px] hover:bg-[#008f4a] transition-colors shadow-sm whitespace-nowrap"
                >
                  <svg className="w-4.5 h-4.5 fill-current w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat with Us
                </a>
              </div>
            </div>
          </div>

          {/* ── DIVIDER ── */}
          <div className="border-t border-neutral-200 mb-5" />

          {/* ── CATEGORY FILTER ── */}
          <div className="overflow-x-auto hide-scrollbar mb-6">
            <div className="flex items-center gap-2 w-max">
              {categories.map((cat: string) => {
                const isActive = activeCategory === cat
                return (
                  <Link
                    key={cat}
                    href={`/${slug}${cat === 'All' ? (searchQuery ? `?q=${searchQuery}` : '') : `?category=${encodeURIComponent(cat)}${searchQuery ? `&q=${searchQuery}` : ''}`}`}
                    className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {cat}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── SEARCH INDICATOR ── */}
          {searchQuery && (
            <div className="flex items-center justify-between bg-neutral-100/80 border border-neutral-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-[13px] text-neutral-700">
                Search results for <span className="font-bold text-neutral-900">"{searchQuery}"</span>
              </p>
              <Link 
                href={`/${slug}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`}
                className="text-[12px] font-bold text-neutral-500 hover:text-neutral-900 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg shadow-sm transition-all"
              >
                Clear Search
              </Link>
            </div>
          )}

          {/* ── PRODUCT GRID ── */}
          {/*
            Responsive grid:
            Mobile  → 2 columns, compact cards
            Tablet  → 3 columns
            Desktop → 4 columns
          */}
          <main className="pb-28">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col bg-white rounded-2xl overflow-hidden border border-neutral-150 hover:border-neutral-300 hover:shadow-md transition-all duration-200 group"
                    style={{ borderColor: '#EBEBEB' }}
                  >
                    {/* Image */}
                    <Link href={`/${slug}/product/${product.id}`} className="relative block">
                      <div className="w-full aspect-square bg-neutral-100 overflow-hidden">
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-in-out"
                          loading="lazy"
                        />
                      </div>
                      {/* Category badge on image for scannability */}
                      {product.category && (
                        <span className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {product.category}
                        </span>
                      )}
                    </Link>

                    {/* Card Info */}
                    <div className="p-3 flex flex-col flex-1 gap-2">
                      <Link href={`/${slug}/product/${product.id}`} className="flex flex-col gap-0.5">
                        <h3 className="text-[13px] text-neutral-800 font-semibold leading-snug line-clamp-2 min-h-[36px]">
                          {product.name}
                        </h3>
                        <p className="text-[15px] text-neutral-900 font-extrabold tracking-tight">
                          ₦{product.price.toLocaleString()}
                        </p>
                      </Link>

                      {/* Single standardized CTA — identical on every card */}
                      <div className="mt-auto pt-1">
                        <WhatsappOrderCTA
                          product={product}
                          store={store}
                          label="Ask on WhatsApp"
                          className="w-full text-[11px] font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 bg-[#00A859] text-white hover:bg-[#008f4a] active:scale-95 transition-all tracking-wide uppercase"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-neutral-200 rounded-2xl text-center gap-3">
                <p className="text-[14px] text-neutral-500 font-medium">
                  {searchQuery ? `No products found for "${searchQuery}"` : 'No products in this category yet.'}
                </p>
                {searchQuery && (
                  <Link href={`/${slug}`} className="text-[13px] font-bold text-neutral-900 underline underline-offset-2">
                    Clear search
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>

        {/* ── FLOATING WHATSAPP BUTTON (mobile/tablet) ── */}
        <div className="fixed bottom-5 left-0 right-0 z-50 flex justify-center md:hidden pointer-events-none">
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto flex items-center gap-2 bg-[#00A859] text-white px-6 py-3.5 rounded-full font-bold text-[14px] shadow-xl hover:bg-[#008f4a] active:scale-95 transition-all"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Chat with {store.store_name}
          </a>
        </div>

        {/* ── FOOTER ── */}
        <footer className="border-t border-neutral-200 bg-white py-10 px-4">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-4 text-center">
            <p className="text-[13px] font-bold text-neutral-900">{store.store_name}</p>
            <p className="text-[11px] text-neutral-400">
              Powered by <a href="https://ondar.ng" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-900 transition-colors underline underline-offset-2">Ondar.ng</a>
            </p>
            {(store.instagram_handle || store.facebook_handle || store.twitter_handle) && (
              <div className="flex items-center gap-5 text-neutral-400 mt-1">
                {store.instagram_handle && (
                  <a
                    href={store.instagram_handle.startsWith('http') ? store.instagram_handle : `https://instagram.com/${store.instagram_handle.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                  </a>
                )}
                {store.facebook_handle && (
                  <a
                    href={store.facebook_handle.startsWith('http') ? store.facebook_handle : `https://facebook.com/${store.facebook_handle}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {store.twitter_handle && (
                  <a
                    href={store.twitter_handle.startsWith('http') ? store.twitter_handle : `https://x.com/${store.twitter_handle.replace('@', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-neutral-900 transition-colors"
                    aria-label="Twitter / X"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
              </div>
            )}
            <p className="text-[11px] text-neutral-300">© {new Date().getFullYear()} {store.store_name}. All rights reserved.</p>
          </div>
        </footer>

        <style dangerouslySetInnerHTML={{ __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}} />
      </div>
    )
  } catch (error) {
    console.error('Error loading store:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-neutral-400">
        <p className="text-sm">Could not load catalog.</p>
      </div>
    )
  }
}
