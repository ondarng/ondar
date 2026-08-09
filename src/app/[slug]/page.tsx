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

        {/* ── TOP NAVBAR HEADER ── */}
        <header className="bg-white border-b border-slate-200/80 px-4 py-3 sticky top-0 z-40 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={store.store_name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100 shadow-xs"
              />
            ) : (
              <div 
                style={{ backgroundColor: store.accent_color || '#00A859' }} 
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-xs"
              >
                {store.store_name.charAt(0)}
              </div>
            )}
            <h1 className="text-base font-black text-slate-900 tracking-tight leading-none truncate max-w-[170px] md:max-w-xs">
              {store.store_name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <Link
                href="/dashboard"
                style={{ color: store.accent_color || '#00A859', borderColor: (store.accent_color || '#00A859') + '40' }}
                className="px-3 py-1.5 bg-slate-50 border rounded-xl text-xs font-bold transition-all active:scale-95 mr-1"
              >
                Dashboard
              </Link>
            )}

            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Check out ${store.store_name} on Ondar: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-500 hover:text-slate-900 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </a>
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
          <div className="bg-slate-900 text-white px-5 py-8 max-w-2xl mx-auto relative overflow-hidden">
            <div className="relative z-10 space-y-1.5">
              <h2 className="text-xl md:text-2xl font-black tracking-tight">{store.store_name}</h2>
              {store.description && <p className="text-xs text-slate-300 max-w-md leading-relaxed">{store.description}</p>}
              {trustBadges.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {trustBadges.map((badge: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                      ✓ {badge}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto px-4 mt-4">

          {/* ── BROWSE COLLECTIONS & SEARCH BAR ── */}
          <div className="space-y-3 mb-4">
            {/* Search Bar */}
            <form action={`/${slug}`} method="GET">
              {activeCategory !== 'All' && <input type="hidden" name="category" value={activeCategory} />}
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

            {/* Category Dropdown & Pills */}
            {categories.length > 1 && (
              <div className="space-y-2">
                <div className="bg-white border border-slate-200/90 rounded-2xl p-3 shadow-2xs flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">Browse Collections</span>
                  <select
                    value={activeCategory}
                    onChange={(e) => {
                      const newCat = e.target.value
                      window.location.href = `/${slug}${newCat === 'All' ? (searchQuery ? `?q=${searchQuery}` : '') : `?category=${encodeURIComponent(newCat)}${searchQuery ? `&q=${searchQuery}` : ''}`}`
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {categories.map((cat: string) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="overflow-x-auto hide-scrollbar">
                  <div className="flex items-center gap-2 w-max py-0.5">
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
                          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide whitespace-nowrap border border-slate-200/80 transition-all ${
                            isActive ? 'shadow-sm border-transparent font-extrabold' : ''
                          }`}
                        >
                          {cat}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── PRODUCT GRID ── */}
          <main className="pb-12 mt-2">
            {products && products.length > 0 ? (
              <div className="grid grid-cols-2 gap-3.5 md:gap-4">
                {products.map((product) => {
                  const variants: { name: string; price?: number | null }[] = Array.isArray(product.variants) ? product.variants : []
                  const hasVariants = variants.length > 0

                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 border border-slate-200/80"
                    >
                      {/* Image Container */}
                      <Link href={`/${slug}/product/${product.id}`} className="relative block overflow-hidden">
                        <div className="w-full aspect-square bg-slate-50 flex items-center justify-center p-3 relative">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-104 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>

                        {/* Availability badge */}
                        <AvailabilityBadge qty={product.stock_quantity ?? 0} />

                        {/* Sold-out overlay */}
                        {product.stock_quantity <= 0 && (
                          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-white/95 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </Link>

                      {/* Card Body */}
                      <div className="p-3 flex flex-col justify-between flex-1 gap-2">
                        <div className="space-y-1">
                          <Link href={`/${slug}/product/${product.id}`} className="block">
                            <h3 className="text-xs font-black text-slate-900 leading-snug line-clamp-2 uppercase tracking-wide group-hover:text-slate-700 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          <p className="text-sm font-black text-slate-950 tracking-tight">
                            ₦{Number(product.price).toLocaleString()}
                          </p>
                        </div>

                        {/* Action Button: Select options / Add to Cart */}
                        <Link
                          href={`/${slug}/product/${product.id}`}
                          style={{ backgroundColor: store.accent_color || '#00A859' }}
                          className="w-full text-white text-xs font-bold py-2.5 rounded-xl text-center shadow-2xs hover:opacity-90 active:scale-97 transition-all mt-1"
                        >
                          {hasVariants ? 'Select options' : 'Add to Cart'}
                        </Link>
                      </div>
                    </div>
                  )
                })}
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
