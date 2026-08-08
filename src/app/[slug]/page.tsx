import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Search, Package, Share2, X, Sparkles, ShieldCheck, Clock, ArrowUpRight } from 'lucide-react'
import { CartDrawer } from '@/components/cart-drawer'
import type { Metadata } from 'next'

const RESERVED_SLUGS = ['dashboard', 'login', 'signup', 'onboarding', 'auth', 'api', '_next']
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

        {/* ── STORE HERO BANNER ── */}
        {store.hero_banner_url ? (
          <div className="w-full max-w-2xl mx-auto px-4 pt-4">
            {store.hero_banner_link ? (
              <a 
                href={store.hero_banner_link}
                target={store.hero_banner_link.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 aspect-[2.6/1] md:aspect-[3.2/1] group transition-transform active:scale-[0.99]"
              >
                <img 
                  src={store.hero_banner_url} 
                  alt={store.hero_title || store.store_name} 
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" 
                />
                {(store.hero_title || store.hero_subtitle || store.hero_button_text) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 md:p-6 flex flex-col justify-end text-white space-y-1">
                    {store.hero_title && <h3 className="font-black text-sm md:text-lg leading-tight tracking-tight">{store.hero_title}</h3>}
                    {store.hero_subtitle && <p className="text-[11px] md:text-xs text-slate-200 line-clamp-1">{store.hero_subtitle}</p>}
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
              <div className="relative rounded-3xl overflow-hidden shadow-lg border border-slate-200/60 aspect-[2.6/1] md:aspect-[3.2/1]">
                <img 
                  src={store.hero_banner_url} 
                  alt={store.hero_title || store.store_name} 
                  className="w-full h-full object-cover" 
                />
                {(store.hero_title || store.hero_subtitle || store.hero_button_text) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent p-4 md:p-6 flex flex-col justify-end text-white space-y-1">
                    {store.hero_title && <h3 className="font-black text-sm md:text-lg leading-tight tracking-tight">{store.hero_title}</h3>}
                    {store.hero_subtitle && <p className="text-[11px] md:text-xs text-slate-200 line-clamp-1">{store.hero_subtitle}</p>}
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
          <div className="h-32 md:h-40 w-full bg-slate-950 relative overflow-hidden select-none">
            <div 
              className="absolute inset-0 opacity-20" 
              style={{ 
                backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(255,255,255,0.4) 1px, transparent 0)', 
                backgroundSize: '16px 16px' 
              }} 
            />
            <div 
              className="absolute -right-10 -top-10 w-64 h-64 rounded-full blur-[90px] opacity-40 transition-all duration-700" 
              style={{ backgroundColor: store.accent_color || '#00A859' }} 
            />
            <div 
              className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full blur-[70px] opacity-20 bg-indigo-500" 
            />
          </div>
        )}

        {/* ── STORE HEADER CARD ── */}
        <div className="max-w-2xl mx-auto px-4 -mt-12 relative z-10">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-5 md:p-6 shadow-xl shadow-slate-200/40 space-y-4">
            <div className="flex items-start gap-4">
              {/* Logo / Avatar */}
              {store.logo_url ? (
                <img
                  src={store.logo_url}
                  alt={store.store_name}
                  className="w-18 h-18 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 ring-4 ring-white shadow-lg bg-white"
                />
              ) : (
                <div 
                  style={{ backgroundColor: store.accent_color || '#00A859' }} 
                  className="w-18 h-18 md:w-20 md:h-20 rounded-2xl flex items-center justify-center shrink-0 ring-4 ring-white shadow-lg text-white text-2xl font-black"
                >
                  {store.store_name.charAt(0)}
                </div>
              )}

              {/* Name & Description */}
              <div className="flex-1 min-w-0 pt-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight truncate">
                    {store.store_name}
                  </h1>
                  <ShieldCheck style={{ color: store.accent_color || '#00A859' }} className="w-5 h-5 shrink-0" />
                </div>
                {store.description && (
                  <p className="text-[13px] text-slate-500 mt-1 leading-relaxed line-clamp-2 font-normal">
                    {store.description}
                  </p>
                )}
                {store.response_time && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400 mt-1.5">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Replies in {store.response_time}</span>
                  </div>
                )}
              </div>

              {/* Share/Dashboard Actions */}
              {isOwner ? (
                <Link
                  href="/dashboard"
                  style={{ color: store.accent_color || '#00A859', borderColor: (store.accent_color || '#00A859') + '30' }}
                  className="shrink-0 px-4 py-2 bg-slate-50 border rounded-xl text-xs font-bold hover:bg-slate-100 transition-all active:scale-95 shadow-xs"
                >
                  Dashboard
                </Link>
              ) : (
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out ${store.store_name} on Ondar: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share store"
                  className="shrink-0 w-10 h-10 flex items-center justify-center bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-500 hover:text-slate-900 transition-colors shadow-xs active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                </a>
              )}
            </div>

            {/* Micro badges: Trust Badges */}
            {trustBadges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3.5 border-t border-slate-100/80 mt-2">
                {trustBadges.map((badge: string, i: number) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 bg-slate-50/80 px-3 py-1 rounded-full border border-slate-200/60 shadow-2xs">
                    <span style={{ color: store.accent_color || '#00A859' }}>✓</span>
                    {badge}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4">

          {/* ── SEARCH BAR ── */}
          <form action={`/${slug}`} method="GET" className="mt-5 mb-4">
            {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 pointer-events-none" />
              <input
                type="search"
                name="q"
                defaultValue={searchQuery}
                placeholder={`Search ${store.store_name.replace(/['s]$/i, '')} products…`}
                className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-10 py-3.5 text-xs md:text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 shadow-sm"
              />
              {searchQuery && (
                <Link
                  href={`/${slug}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </form>

          {/* ── CATEGORY PILLS ── */}
          {categories.length > 1 && (
            <div className="overflow-x-auto hide-scrollbar mb-5">
              <div className="flex items-center gap-2 w-max py-1">
                {categories.map((cat: string) => {
                  const isActive = activeCategory === cat
                  return (
                    <Link
                      key={cat}
                      href={`/${slug}${cat === 'All' ? (searchQuery ? `?q=${searchQuery}` : '') : `?category=${encodeURIComponent(cat)}${searchQuery ? `&q=${searchQuery}` : ''}`}`}
                      style={{ 
                        backgroundColor: isActive ? (store.accent_color || '#00A859') : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#475569'
                      }}
                      className={`px-4.5 py-2 rounded-full text-xs font-bold tracking-wide whitespace-nowrap transition-all shadow-xs border border-slate-200/80 hover:border-slate-300 ${
                        isActive ? 'shadow-md border-transparent scale-102 font-extrabold' : ''
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
          <div className="flex items-center justify-between mt-6 mb-4">
            <div>
              <h2 className="text-base md:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>{searchQuery ? `Results for "${searchQuery}"` : 'Featured Inventory'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {products && products.length > 0 ? `${products.length} product${products.length !== 1 ? 's' : ''} available` : 'Updated live'}
              </p>
            </div>
            {searchQuery && (
              <Link
                href={`/${slug}${activeCategory !== 'All' ? `?category=${encodeURIComponent(activeCategory)}` : ''}`}
                className="text-xs font-bold text-slate-600 border border-slate-200 bg-white px-3.5 py-1.5 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-2xs"
              >
                Clear Search
              </Link>
            )}
          </div>

          {/* ── PRODUCT GRID ── */}
          <main className="pb-12">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 md:gap-4">
                {products.map((product) => {
                  const variants: { name: string; price?: number | null }[] = Array.isArray(product.variants) ? product.variants : []
                  const variantHint = variants.length > 0 ? variants.map(v => v.name).join(' • ') : null

                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 border border-slate-200/70 relative"
                    >
                      {/* Image Container */}
                      <Link href={`/${slug}/product/${product.id}`} className="relative block overflow-hidden">
                        <div className="w-full aspect-square bg-slate-50 flex items-center justify-center relative p-3">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
                            loading="lazy"
                          />
                        </div>

                        {/* Availability badge */}
                        <AvailabilityBadge qty={product.stock_quantity ?? 0} />

                        {/* Sold-out overlay */}
                        {product.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center">
                            <span className="bg-white/95 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-xl">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Card Content */}
                      <Link href={`/${slug}/product/${product.id}`} className="p-4 flex flex-col justify-between flex-1 gap-2">
                        <div className="space-y-1">
                          <h3 className="text-xs md:text-sm font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-slate-700 transition-colors">
                            {product.name}
                          </h3>
                          {variantHint && (
                            <p className="text-[10px] text-slate-400 font-medium truncate">
                              {variantHint}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <p 
                            style={{ color: store.accent_color || '#00A859' }} 
                            className="text-base md:text-lg font-black tracking-tight"
                          >
                            ₦{Number(product.price).toLocaleString()}
                          </p>
                          
                          <span className="w-7 h-7 rounded-full bg-slate-50 group-hover:bg-slate-900 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </Link>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-center bg-white rounded-3xl border border-slate-200/60 p-8 shadow-xs">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner mb-1">
                  <Package className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-sm text-slate-900 font-bold">
                  {allProds?.length === 0 ? "This store is updating inventory." : (searchQuery ? `No items match "${searchQuery}"` : 'No products in this category.')}
                </p>
                <p className="text-xs text-slate-500 max-w-[260px] leading-relaxed">
                  {allProds?.length === 0 ? "The merchant will list products soon. Check back shortly!" : "Try adjusting your search terms or filter categories."}
                </p>
                {searchQuery && (
                  <Link 
                    href={`/${slug}`} 
                    style={{ color: store.accent_color || '#00A859' }}
                    className="text-xs font-bold underline underline-offset-4 mt-1"
                  >
                    Clear search filter
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Floating WhatsApp Contact Seller Button */}
        {waPhone && (
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-transform"
            aria-label="Contact seller on WhatsApp"
          >
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </a>
        )}

        {/* Footer Attribution */}
        <footer className="text-center pt-8 pb-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
          >
            <span>Powered by</span>
            <span className="font-black text-slate-700 tracking-tight">Ondar</span>
          </Link>
        </footer>

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
        <p className="text-sm">Could not load catalog.</p>
      </div>
    )
  }
}
