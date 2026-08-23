import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Search, Package, Share2, X, Sparkles, ShieldCheck, Star } from 'lucide-react'
import { CartDrawer } from '@/components/cart-drawer'
import { CartBadge, CartBar } from '@/components/cart-bar'
import { StorefrontFilters } from '@/components/storefront-filters'
import { StorefrontProductCard } from '@/components/storefront-product-card'
import { StorefrontFooter } from '@/components/storefront-footer'
import { EditorialStorefront } from '@/components/templates/editorial-storefront'
import type { Metadata } from 'next'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next', 'poll', 'vendor-poll']
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  if (RESERVED_SLUGS.includes(slug)) return { title: 'Not Found' }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  const { data: store } = await supabase
    .from('stores').select('store_name, description, logo_url').eq('slug', slug).maybeSingle()

  if (!store) return { title: 'Store Not Found | Ondar' }

  const title = `${store.store_name} | Ondar`
  const description = store.description || `Shop ${store.store_name} on Ondar`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: store.logo_url ? [{ url: store.logo_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: store.logo_url ? [store.logo_url] : [],
    },
    alternates: {
      canonical: `https://ondar.shop/${slug}`,
    }
  }
}

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
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}) {
  const { slug } = await props.params
  const { category, q, sort } = await props.searchParams
  const activeCategory = category || 'All'
  const searchQuery = q || ''
  const activeSort = sort || 'newest'

  if (RESERVED_SLUGS.includes(slug)) notFound()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  try {
    const { data: store, error: storeError } = await supabase
      .from('stores').select('*').eq('slug', slug).maybeSingle()
    if (storeError || !store) notFound()

    const isTrial = store.subscription_status === 'TRIAL'
    const trialEnds = store.trial_ends_at ? new Date(store.trial_ends_at) : null
    const trialEnded = isTrial && trialEnds && trialEnds < new Date()

    if (trialEnded) {
      return (
        <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center items-center px-6 text-center text-white relative overflow-hidden">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-500/10 rounded-full blur-[120px] -z-10" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -z-10" />
          
          <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-display font-extrabold text-white">Store Temporarily Offline</h2>
              <p className="text-sm text-neutral-400 leading-relaxed">
                The trial period for <span className="font-bold text-white">{store.store_name}</span> has expired.
              </p>
            </div>

            <div className="border-t border-white/10 pt-4">
              <p className="text-xs text-neutral-500">
                Are you the store owner? Log in to your Ondar dashboard to renew your subscription and bring your store back online instantly.
              </p>
            </div>

            <div>
              <Link 
                href="/login"
                className="inline-block w-full bg-primary-600 text-white font-extrabold py-3.5 rounded-2xl shadow-lg hover:bg-primary-500 active:scale-95 transition-all text-xs"
              >
                Log In to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )
    }

    // Safely check if current visitor is store owner without crashing on invalid cookies
    let isOwner = false
    try {
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
      const { data: { user } } = await supabaseSsr.auth.getUser()
      isOwner = user?.id === store.vendor_id
    } catch {
      isOwner = false
    }

    // Fetch all categories safely
    const { data: allProds } = await supabase
      .from('products').select('category, name').eq('store_id', store.id)
    const categories = ['All', ...Array.from(new Set(allProds?.map(p => p.category).filter(Boolean)))] as string[]

    // Fetch products with sorting & filtering
    let query = supabase.from('products').select('*').eq('store_id', store.id)
    
    if (activeSort === 'price_asc') {
      query = query.order('price', { ascending: true })
    } else if (activeSort === 'price_desc') {
      query = query.order('price', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    if (activeCategory !== 'All') query = query.eq('category', activeCategory)
    if (searchQuery) query = query.ilike('name', `%${searchQuery}%`)
    
    const { data: products } = await query
    const safeProducts = products || []

    // Fetch real reviews for this store
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('store_id', store.id)
      .order('created_at', { ascending: false })
      .limit(6)
    const safeReviews = reviews || []
    const avgRating = safeReviews.length > 0
      ? (safeReviews.reduce((a, r) => a + r.rating, 0) / safeReviews.length).toFixed(1)
      : null

    const trustBadges: string[] = store.trust_badges || ['Nationwide Delivery', '100% Original', 'Warranty']
    const waPhone = store.whatsapp_number?.replace(/[^0-9]/g, '')?.replace(/^0/, '234') || ''
    const accentColor = store.accent_color || '#00A859'

    if (store.storefront_template === 'editorial') {
      return (
        <>
          <EditorialStorefront
            store={store}
            products={safeProducts}
            categories={categories.filter((c) => c !== 'All')}
            isOwner={isOwner}
          />
          <CartBar accentColor={store.accent_color || '#c95c35'} storeSlug={store.slug} />
          <CartDrawer store={store} />
        </>
      )
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 antialiased selection:bg-primary-500 selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": store.store_name,
              "description": store.description || `Shop ${store.store_name} on Ondar.`,
              "image": store.logo_url || "https://ondar.shop/og-image.jpg",
              "url": `https://ondar.shop/${store.slug}`,
              "telephone": store.whatsapp_number || undefined,
            })
          }}
        />

        {/* ── TOP ANNOUNCEMENT BANNER ── */}
        {store.announcement_text && (
          <div 
            style={{ backgroundColor: store.accent_color || '#00A859' }} 
            className="text-white text-[11px] uppercase tracking-wider font-extrabold py-2 px-4 text-center select-none shadow-sm sticky top-0 z-50 flex items-center justify-center gap-2 backdrop-blur-md bg-opacity-95"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>{store.announcement_text}</span>
          </div>
        )}

        {/* ── TOP NAVBAR HEADER (Glassmorphic) ── */}
        <header className="bg-white/85 backdrop-blur-md border-b border-slate-200/70 px-4 md:px-6 py-3 sticky top-0 z-40 shadow-xs flex items-center justify-between transition-all">
          <div className="flex items-center gap-2.5">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="w-9 h-9 rounded-2xl object-cover ring-1 ring-black/10 shadow-xs"
              />
            ) : (
              <div 
                style={{ backgroundColor: store.accent_color || '#00A859' }} 
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-xs"
              >
                {store.store_name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-sm font-black text-slate-900 tracking-tight leading-none truncate max-w-[170px] md:max-w-xs">
                {store.store_name}
              </h1>
              <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]" />
                <span>Verified Merchant</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isOwner && (
              <Link
                href="/dashboard"
                style={{ color: accentColor, borderColor: accentColor + '40' }}
                className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-black transition-all active:scale-95 mr-1"
              >
                Dashboard
              </Link>
            )}

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${store.store_name} on Ondar`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-black hover:bg-slate-100 rounded-xl transition-colors"
              title="Share store link"
            >
              <Share2 className="w-4 h-4" />
            </a>

            {/* Cart badge — opens drawer */}
            <CartBadge accentColor={accentColor} storeSlug={store.slug} />
          </div>
        </header>

        {/* ── HERO BANNER (Starts immediately below header) ── */}
        {store.hero_banner_url ? (
          <div className="w-full max-w-2xl mx-auto px-4 pt-3">
            {store.hero_banner_link ? (
              <a 
                href={store.hero_banner_link}
                target={store.hero_banner_link.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block relative rounded-2xl overflow-hidden shadow-md border border-slate-200/60 aspect-[2.7/1] md:aspect-[3.2/1] group transition-transform active:scale-[0.99]"
              >
                <img 
                  src={store.hero_banner_url} 
                  alt={store.hero_title || store.store_name} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" 
                />
                {(store.hero_title || store.hero_subtitle || store.hero_button_text) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white space-y-1">
                    {store.hero_title && <h3 className="font-black text-sm md:text-lg leading-tight">{store.hero_title}</h3>}
                    {store.hero_subtitle && <p className="text-[11px] text-slate-200 line-clamp-1">{store.hero_subtitle}</p>}
                    {store.hero_button_text && (
                      <span 
                        style={{ backgroundColor: store.accent_color || '#00A859' }}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-white w-fit shadow-md mt-1"
                      >
                        {store.hero_button_text} ➔
                      </span>
                    )}
                  </div>
                )}
              </a>
            ) : (
              <div className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/60 aspect-[2.7/1] md:aspect-[3.2/1]">
                <img 
                  src={store.hero_banner_url} 
                  alt={store.hero_title || store.store_name} 
                  className="w-full h-full object-cover" 
                />
                {(store.hero_title || store.hero_subtitle || store.hero_button_text) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent p-4 flex flex-col justify-end text-white space-y-1">
                    {store.hero_title && <h3 className="font-black text-sm md:text-lg leading-tight">{store.hero_title}</h3>}
                    {store.hero_subtitle && <p className="text-[11px] text-slate-200 line-clamp-1">{store.hero_subtitle}</p>}
                    {store.hero_button_text && (
                      <span 
                        style={{ backgroundColor: store.accent_color || '#00A859' }}
                        className="inline-flex items-center gap-1 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider text-white w-fit shadow-md mt-1"
                      >
                        {store.hero_button_text}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto px-4 pt-3">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00A859] animate-pulse" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#00A859]">Verified Social Merchant</span>
                </div>
                {store.response_time && (
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                    ⚡ {store.response_time}
                  </span>
                )}
              </div>

              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900">{store.store_name}</h2>
              {store.description && (
                <p className="text-xs text-slate-600 leading-relaxed max-w-lg font-medium">{store.description}</p>
              )}

              {trustBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {trustBadges.map((badge: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 mt-4">

          {/* ── SEARCH BAR ── */}
          <form action={`/${slug}`} method="GET" className="mb-3">
            {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
            {activeSort !== 'newest' && <input type="hidden" name="sort" value={activeSort} />}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search ${store.store_name.replace(/['s]$/i, '')} products…`}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-900/10 shadow-2xs"
              />
              {searchQuery && (
                <Link
                  href={`/${slug}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full"
                >
                  <X className="w-3 h-3" />
                </Link>
              )}
            </div>
          </form>

          {/* ── COLLECTIONS, SORT & CATEGORY PILLS (Client Component) ── */}
          <div className="mb-4">
            <StorefrontFilters
              slug={slug}
              categories={categories}
              activeCategory={activeCategory}
              activeSort={activeSort}
              searchQuery={searchQuery}
            />
          </div>

          {/* ── PRODUCT GRID ── */}
          <main className="pb-8 mt-2">
            {safeProducts.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 md:gap-4">
                {safeProducts.map((product) => (
                  <StorefrontProductCard
                    key={product.id}
                    product={product}
                    slug={slug}
                    accentColor={accentColor}
                    storeSlug={store.slug}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-2xl border border-slate-200/80 p-8">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 mb-1">
                  <Package className="w-7 h-7 text-slate-300" />
                </div>
                <p className="text-sm text-slate-900 font-bold">
                  {allProds?.length === 0 ? "This store is updating inventory." : (searchQuery ? `No items match "${searchQuery}"` : 'No products in this category.')}
                </p>
                <p className="text-xs text-slate-500 max-w-[250px] leading-relaxed">
                  {allProds?.length === 0 ? "Check back shortly for new products!" : "Try adjusting your search terms or filters."}
                </p>
                {searchQuery && (
                  <Link 
                    href={`/${slug}`} 
                    style={{ color: accentColor }}
                    className="text-xs font-bold underline underline-offset-4 mt-1"
                  >
                    Clear search filter
                  </Link>
                )}
              </div>
            )}
          </main>

          {/* ── REAL CUSTOMER REVIEWS ── */}
          {safeReviews.length > 0 && (
            <section className="mb-8 bg-white border border-slate-200/90 rounded-3xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs uppercase font-black tracking-wider text-slate-900">Customer Reviews</h3>
                  {avgRating && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-black text-amber-800">{avgRating}</span>
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                  {safeReviews.length} Verified Review{safeReviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {safeReviews.slice(0, 4).map((review: any) => (
                  <div key={review.id} className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200/60 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                      </div>
                      {review.is_verified && (
                        <span className="text-[9px] font-black text-emerald-700">✓ Verified Buyer</span>
                      )}
                    </div>
                    {review.comment && (
                      <p className="text-xs text-slate-700 leading-relaxed font-medium line-clamp-3">
                        &ldquo;{review.comment}&rdquo;
                      </p>
                    )}
                    <p className="text-[10px] font-black text-slate-500">— {review.customer_name}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── STORE DETAILS & POLICY GUARANTEE ── */}
          <section className="mb-10 bg-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-100 flex items-center gap-2">
                <ShieldCheck style={{ color: accentColor }} className="w-4 h-4" />
                <span>About {store.store_name} & Policies</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-relaxed text-slate-300 pt-1">
              {store.location && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">📍 Dispatch Hub:</span>
                  <span className="font-medium text-white">{store.location}</span>
                </div>
              )}
              {store.response_time && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold shrink-0">⚡ Response Time:</span>
                  <span className="font-medium text-white">Under {store.response_time}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-bold shrink-0">🚚 Delivery Policy:</span>
                <span className="font-medium text-white">Fast dispatch via verified logistics dispatch riders.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-slate-400 font-bold shrink-0">🔒 Secure Payments:</span>
                <span className="font-medium text-white">Direct Bank Transfer or 1-click WhatsApp order confirmation.</span>
              </div>
            </div>
          </section>
        </div>

        {/* ── FOOTER ── */}
        <StorefrontFooter store={store} />

        {/* Floating WhatsApp Contact Seller Button */}
        {waPhone && (
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-5 z-40 w-13 h-13 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-transform"
            aria-label="Contact seller on WhatsApp"
          >
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        )}

        {/* Persistent Cart Drawer component */}
        <CartDrawer store={store} />

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
        <p className="text-sm">Could not load catalog. Please try reloading.</p>
      </div>
    )
  }
}
