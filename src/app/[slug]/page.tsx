import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Settings, Search, Package, X } from 'lucide-react'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']
export const revalidate = 0

/** Returns short availability label + CSS classes for the image overlay badge */
function AvailabilityBadge({ qty }: { qty: number }) {
  if (qty > 5) {
    return (
      <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#00A859] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        <span className="text-[8px]">✓</span> Available
      </span>
    )
  }
  if (qty > 0) {
    return (
      <span className="absolute top-2 left-2 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
        ⚠ Limited
      </span>
    )
  }
  return (
    <span className="absolute top-2 left-2 flex items-center gap-1 bg-neutral-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
      ⛔ Out of Stock
    </span>
  )
}

function PreorderBadge() {
  return (
    <span className="absolute top-2 left-2 flex items-center gap-1 bg-[#c0392b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
      🕒 Pre-order
    </span>
  )
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

  const cookieStore = await cookies()
  const supabaseSsr = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  try {
    const { data: store, error: storeError } = await supabase
      .from('stores').select('*').eq('slug', slug).maybeSingle()
    if (storeError) throw storeError
    if (!store) notFound()

    const { data: { user } } = await supabaseSsr.auth.getUser()
    const isOwner = user?.id === store.vendor_id

    // Fetch all categories
    const { data: allProds } = await supabase
      .from('products').select('category, name').eq('store_id', store.id)
    const categories = ['All', ...Array.from(new Set(allProds?.map(p => p.category).filter(Boolean)))] as string[]

    // Fetch products with filters
    let query = supabase
      .from('products').select('*').eq('store_id', store.id)
      .order('created_at', { ascending: false })
    if (activeCategory !== 'All') query = query.eq('category', activeCategory)
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
    const { data: products, error: prodError } = await query
    if (prodError) throw prodError

    const trustBadges: string[] = store.trust_badges || ['Nationwide Delivery', '100% Original', 'Warranty']
    const waPhone = store.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''

    return (
      <div className="min-h-screen bg-[#F5F5F5] font-sans">

        {/* ── TOP HEADER ── */}
        <header className="bg-white px-4 pt-4 pb-3 sticky top-0 z-40 border-b border-neutral-100">
          {/* Row 1: Logo + Name + Settings */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="w-9 h-9 rounded-full object-cover shrink-0 border border-neutral-200"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#00A859] flex items-center justify-center shrink-0">
                <span className="text-white text-sm font-extrabold">{store.store_name.charAt(0)}</span>
              </div>
            )}

            {/* Name + Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-[16px] font-extrabold text-neutral-900 leading-tight truncate">
                {store.store_name}
              </h1>
              {(store.description) && (
                <p className="text-[12px] text-neutral-500 leading-tight truncate">
                  {store.description}
                </p>
              )}
            </div>

            {/* Settings icon or Admin link */}
            {isOwner ? (
              <Link
                href="/dashboard"
                className="shrink-0 px-3 py-1.5 bg-[#00A859]/10 text-[#00A859] rounded-full text-[12px] font-extrabold hover:bg-[#00A859]/20 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href={`/${slug}`}
                aria-label="Settings"
                className="shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}
          </div>

        </header>

        <div className="max-w-2xl mx-auto px-3 md:px-4">

          {/* ── SEARCH BAR ── */}
          <form action={`/${slug}`} method="GET" className="mt-3 mb-3">
            {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search ${store.store_name.replace(/['s]$/i, '')} products…`}
                className="w-full bg-white border border-neutral-200 rounded-full pl-10 pr-10 py-2.5 text-[13px] text-neutral-800 placeholder-neutral-400 outline-none focus:ring-2 focus:ring-[#00A859]/30 focus:border-[#00A859] transition-all"
              />
              {searchQuery && (
                <Link
                  href={`/${slug}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </Link>
              )}
            </div>
          </form>

          {/* ── CATEGORY PILLS ── */}
          {categories.length > 1 && (
            <div className="overflow-x-auto hide-scrollbar mb-4">
              <div className="flex items-center gap-2 w-max">
                {categories.map((cat: string) => {
                  const isActive = activeCategory === cat
                  return (
                    <Link
                      key={cat}
                      href={`/${slug}${cat === 'All' ? (searchQuery ? `?q=${searchQuery}` : '') : `?category=${encodeURIComponent(cat)}${searchQuery ? `&q=${searchQuery}` : ''}`}`}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-[#00A859] text-white'
                          : 'bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      {cat}
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── INVENTORY HEADER ── */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[15px] font-extrabold text-neutral-900">
                {searchQuery ? `Results for "${searchQuery}"` : 'Available Inventory'}
              </h2>
              <p className="text-[11px] text-neutral-400">
                {products && products.length > 0 ? `${products.length} item${products.length !== 1 ? 's' : ''}` : 'Updated just now'}
              </p>
            </div>
            {!searchQuery && (
              <button className="flex items-center gap-1 text-[12px] font-semibold text-neutral-500 border border-neutral-200 bg-white px-3 py-1.5 rounded-full">
                Sort ↕
              </button>
            )}
            {searchQuery && (
              <Link
                href={`/${slug}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`}
                className="text-[12px] font-bold text-neutral-500 border border-neutral-200 bg-white px-3 py-1.5 rounded-full"
              >
                Clear
              </Link>
            )}
          </div>

          {/* ── PRODUCT GRID ── */}
          <main className="pb-10">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => {
                  // Derive first variant hint for subtitle (e.g. "256GB • Titanium Grey")
                  const variants: { name: string; price?: number | null }[] = Array.isArray(product.variants) ? product.variants : []
                  const variantHint = variants.length > 0 ? variants.map(v => v.name).join(' • ') : null

                  return (
                    <div
                      key={product.id}
                      className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm"
                    >
                      {/* Image */}
                      <Link href={`/${slug}/product/${product.id}`} className="relative block">
                        <div className="w-full aspect-square bg-neutral-100 overflow-hidden">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                          />
                        </div>

                        {/* Availability badge — top left */}
                        <AvailabilityBadge qty={product.stock_quantity ?? 0} />

                        {/* Sold-out overlay */}
                        {product.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <span className="bg-white/95 text-neutral-900 text-[10px] font-black px-3 py-1 rounded-sm uppercase tracking-widest rotate-[-12deg] shadow-lg">
                              Sold Out
                            </span>
                          </div>
                        )}

                      </Link>

                      {/* Card Body */}
                      <Link href={`/${slug}/product/${product.id}`} className="p-3 flex flex-col gap-0.5">
                        <h3 className="text-[13px] font-bold text-neutral-800 leading-snug line-clamp-2">
                          {product.name}
                        </h3>
                        {variantHint && (
                          <p className="text-[11px] text-neutral-400 truncate">
                            {variantHint}
                          </p>
                        )}
                        <p className="text-[15px] font-extrabold text-neutral-900 mt-1 tracking-tight">
                          ₦{Number(product.price).toLocaleString()}
                        </p>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border border-neutral-100 shadow-inner mb-2">
                  <Package className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-[15px] text-neutral-900 font-bold">
                  {allProds?.length === 0 ? "This store is getting ready." : (searchQuery ? `No results for "${searchQuery}"` : 'No products in this category.')}
                </p>
                <p className="text-[13px] text-neutral-500 max-w-[250px]">
                  {allProds?.length === 0 ? "The vendor hasn't added any products yet. Check back later!" : "Try adjusting your filters or search term."}
                </p>
                {searchQuery && (
                  <Link href={`/${slug}`} className="text-[13px] font-bold text-[#00A859] underline underline-offset-2">
                    Clear search
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>



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
