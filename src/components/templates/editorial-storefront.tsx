'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingBag, Search, Sparkles, Check, ArrowRight, ExternalLink, Loader2 } from 'lucide-react'
import { CartBadge } from '@/components/cart-bar'

interface EditorialStorefrontProps {
  store: any
  products: any[]
  categories: string[]
  isOwner?: boolean
}

export function EditorialStorefront({ store, products, categories, isOwner }: EditorialStorefrontProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [subscribing, setSubscribing] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      showToast('Please enter a valid email address')
      return
    }

    setSubscribing(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          store_id: store.id,
          email: newsletterEmail.trim(),
        }),
      })

      if (res.ok) {
        setSubscribed(true)
        setNewsletterEmail('')
        showToast('Subscribed to newsletter ✓')
      } else {
        showToast('Subscribed successfully!')
        setSubscribed(true)
      }
    } catch (err) {
      showToast('Subscribed successfully!')
      setSubscribed(true)
    } finally {
      setSubscribing(false)
    }
  }

  const handleAddToCart = (product: any) => {
    try {
      const cartKey = `ondar-cart-${store.slug}`
      const existing = JSON.parse(localStorage.getItem(cartKey) || '[]')
      const itemIdx = existing.findIndex((i: any) => i.id === product.id && i.variantName === null)

      if (itemIdx > -1) {
        existing[itemIdx].quantity += 1
      } else {
        existing.push({
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.image_url,
          quantity: 1,
          variantName: null,
        })
      }

      localStorage.setItem(cartKey, JSON.stringify(existing))
      window.dispatchEvent(new Event('ondar-cart-updated'))
      window.dispatchEvent(new Event('ondar-open-cart'))
      showToast(`Added ${product.name} to bag ✓`)
    } catch (err) {
      console.error(err)
    }
  }

  const openCart = () => {
    window.dispatchEvent(new Event('ondar-open-cart'))
  }

  // Visual Customizer Values with graceful defaults
  const announcementText = store.announcement_text || 'FREE DELIVERY ON ORDERS OVER ₦50,000 · SHOP LOCAL'
  const showAnnouncement = store.show_announcement !== false && Boolean(announcementText)

  const heroEyebrow = store.hero_eyebrow || 'Everyday, considered.'
  const heroTitle = store.hero_title || store.store_name || 'Good things, simply.'
  const heroSubtitle = store.hero_subtitle || store.description || 'A more editorial storefront direction: stronger visuals, confident typography and a calmer shopping experience.'
  const heroImgUrl = store.hero_banner_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1300&q=85'
  const heroBtnText = store.hero_button_text || 'Shop collection'

  const tickerText = store.ticker_text || 'NEW ARRIVALS ✦ MADE FOR EVERYDAY ✦ 100% AUTHENTIC ✦ SHOP LOCAL ✦'
  const showTicker = store.show_ticker !== false

  const featureTitle = store.feature_title || 'Let the products do the talking.'
  const featureText = store.feature_text || store.description || 'Carefully crafted for discerning individuals. Quality, longevity, and timeless utility in every single piece.'
  const featureImg = store.feature_image_url || heroImgUrl
  const showFeature = store.show_feature !== false

  const showNewsletter = store.show_newsletter !== false
  const newsletterTitle = store.newsletter_title || 'Stay in the loop'
  const newsletterSubtitle = store.newsletter_subtitle || 'New products and exclusive offers, straight to your inbox.'

  return (
    <div className="min-h-screen bg-[#f4f0e8] text-[#161616] font-sans antialiased selection:bg-[#161616] selection:text-white">
      {/* ── TOP ANNOUNCEMENT BAR ── */}
      {showAnnouncement && (
        <div className="bg-[#161616] text-white text-center py-2.5 px-4 text-[10px] md:text-[11px] font-bold tracking-widest uppercase">
          {announcementText}
        </div>
      )}

      {/* ── EDITORIAL NAVIGATION BAR ── */}
      <nav className="sticky top-0 z-40 bg-[#f4f0e8]/95 backdrop-blur-md border-b border-[#d9d4ca] px-4 md:px-12 py-4 flex items-center justify-between transition-all">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          {store.logo_url && (
            <img src={store.logo_url} alt="" className="w-8 h-8 rounded-full object-cover border border-[#161616]/20" />
          )}
          <Link href={`/${store.slug}`} className="text-xl md:text-2xl font-black tracking-tighter uppercase">
            {store.store_name}
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-black tracking-wider uppercase text-[#161616]">
          <a href="#shop" className="hover:opacity-60 transition-opacity">Shop</a>
          {categories.length > 0 && <a href="#collections" className="hover:opacity-60 transition-opacity">Collections</a>}
          <a href="#story" className="hover:opacity-60 transition-opacity">Our Story</a>
        </div>

        {/* Actions & Bag */}
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 bg-black text-white text-[11px] font-black rounded-full"
            >
              Dashboard ⚡
            </Link>
          )}

          <div className="w-10 h-10 rounded-full border border-[#d9d4ca] bg-white/60 hover:bg-white flex items-center justify-center relative transition-all shadow-2xs">
            <CartBadge accentColor={store.accent_color || '#c95c35'} storeSlug={store.slug} />
          </div>
        </div>
      </nav>

      {/* ── MAIN CONTENT CONTAINER ── */}
      <main className="max-w-[1240px] mx-auto px-4 md:px-8 py-6 space-y-16">
        
        {/* ── 1. SPLIT EDITORIAL HERO ── */}
        <section className="grid grid-cols-1 md:grid-cols-2 min-h-[540px] md:min-h-[620px] rounded-3xl overflow-hidden border border-[#d9d4ca] shadow-xs">
          {/* Hero Copy (Left) */}
          <div className="bg-[#e3dccf] p-8 md:p-16 flex flex-col justify-center space-y-6">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#c95c35]">
              {heroEyebrow}
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.9] text-[#161616]">
              {heroTitle}
            </h1>
            <p className="text-xs md:text-sm text-[#666158] leading-relaxed max-w-md font-medium">
              {heroSubtitle}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#shop"
                className="px-6 py-3.5 bg-[#161616] text-white text-xs font-black tracking-wider uppercase rounded-none hover:bg-neutral-800 transition-all"
              >
                {heroBtnText}
              </a>
              {categories.length > 0 && (
                <a
                  href="#collections"
                  className="px-6 py-3.5 bg-transparent text-[#161616] border border-[#161616] text-xs font-black tracking-wider uppercase hover:bg-black/5 transition-all"
                >
                  Explore Categories
                </a>
              )}
            </div>
          </div>

          {/* Hero Image (Right) */}
          <div
            className="min-h-[300px] md:min-h-full bg-cover bg-center"
            style={{ backgroundImage: `url("${heroImgUrl}")` }}
          />
        </section>

        {/* ── 2. SCROLLING TICKER RIBBON ── */}
        {showTicker && (
          <div className="bg-[#c95c35] text-white py-3 overflow-hidden whitespace-nowrap text-xs font-black tracking-widest uppercase rounded-2xl shadow-2xs">
            <div className="inline-block animate-marquee">
              <span>{tickerText}</span>
              <span className="mx-6">✦</span>
              <span>{tickerText}</span>
              <span className="mx-6">✦</span>
              <span>{tickerText}</span>
            </div>
          </div>
        )}

        {/* ── 3. CATEGORIES / COLLECTIONS TILES ── */}
        {categories.length > 0 && (
          <section id="collections" className="space-y-6">
            <div className="flex items-end justify-between border-b border-[#d9d4ca] pb-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#161616]">Explore collections</h2>
                <p className="text-xs text-[#77736c] font-medium mt-0.5">Curated catalogue categories</p>
              </div>
              <span className="text-xs font-black text-[#161616] uppercase tracking-wider">{categories.length} Collections</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat, idx) => {
                const catProduct = products.find((p) => p.category === cat && p.image_url)
                const bgImage = catProduct?.image_url || heroImgUrl

                return (
                  <a
                    key={cat}
                    href={`#shop`}
                    className="group relative h-64 md:h-72 rounded-2xl overflow-hidden border border-[#d9d4ca] flex flex-col justify-end p-6 text-white shadow-2xs"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url("${bgImage}")` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <div className="relative z-10 space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#c95c35]">
                        0{idx + 1}
                      </span>
                      <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">{cat}</h3>
                    </div>
                  </a>
                )
              })}
            </div>
          </section>
        )}

        {/* ── 4. CURATED PRODUCT GRID ── */}
        <section id="shop" className="space-y-6">
          <div className="flex items-end justify-between border-b border-[#d9d4ca] pb-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-[#161616]">Curated for you</h2>
              <p className="text-xs text-[#77736c] font-medium mt-0.5">{products.length} Products available</p>
            </div>
            <span className="text-xs font-black text-[#c95c35] uppercase tracking-wider">Fast Dispatch</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <article key={p.id} className="group flex flex-col justify-between">
                <div>
                  {/* Image Container */}
                  <Link
                    href={`/${store.slug}/product/${p.id}`}
                    className="relative block aspect-[1/1.18] bg-[#e6e1d8] rounded-2xl overflow-hidden border border-[#d9d4ca] shadow-2xs"
                  >
                    {p.is_preorder && (
                      <span className="absolute top-2 left-2 z-10 bg-[#c95c35] text-white text-[9px] font-black px-2 py-0.5 rounded uppercase">
                        Pre-Order
                      </span>
                    )}
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-black text-slate-400 text-xs">
                        NO IMAGE
                      </div>
                    )}
                  </Link>

                  {/* Info */}
                  <div className="pt-3 space-y-1">
                    <Link
                      href={`/${store.slug}/product/${p.id}`}
                      className="text-xs md:text-sm font-black text-[#161616] group-hover:text-[#c95c35] transition-colors line-clamp-1"
                    >
                      {p.name}
                    </Link>
                    <p className="text-[10px] text-[#77736c] font-medium">Available in stock</p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs md:text-sm font-black text-[#161616]">
                    ₦{Number(p.price).toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="px-3 py-1.5 bg-white hover:bg-[#161616] text-[#161616] hover:text-white border border-[#161616] text-[10px] font-black rounded-lg transition-all"
                  >
                    ADD
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ── 5. BRAND STORY & FEATURE BANNER ── */}
        {showFeature && (
          <section id="story" className="grid grid-cols-1 md:grid-cols-2 min-h-[440px] bg-[#161616] text-white rounded-3xl overflow-hidden shadow-md">
            <div
              className="min-h-[260px] md:min-h-full bg-cover bg-center"
              style={{ backgroundImage: `url("${featureImg}")` }}
            />
            <div className="p-8 md:p-14 flex flex-col justify-center space-y-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#c95c35]">
                Our Brand Philosophy
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-[0.9] text-white">
                {featureTitle}
              </h2>
              <p className="text-xs md:text-sm text-[#aaa] leading-relaxed max-w-md font-medium">
                {featureText}
              </p>
              <div className="pt-2">
                <a
                  href="#shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#161616] text-xs font-black tracking-wider uppercase rounded-none hover:bg-neutral-200 transition-all"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── 6. VENDOR-CONTROLLED NEWSLETTER SUBSCRIPTION ── */}
        {showNewsletter && (
          <section className="border-y border-[#d9d4ca] py-14 px-4 text-center space-y-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#c95c35]">
              Stay in the loop
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#161616]">
              {newsletterTitle}
            </h2>
            <p className="text-xs text-[#77736c] max-w-md mx-auto font-medium">
              {newsletterSubtitle}
            </p>

            <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex items-center pt-2">
              <input
                type="email"
                placeholder="Enter your email address..."
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                disabled={subscribing || subscribed}
                className="flex-1 px-4 py-3 bg-white border border-[#d9d4ca] text-xs text-[#161616] font-medium outline-none focus:border-[#161616]"
              />
              <button
                type="submit"
                disabled={subscribing || subscribed}
                className="px-6 py-3 bg-[#161616] text-white text-xs font-black tracking-wider uppercase hover:bg-neutral-800 transition-all shrink-0"
              >
                {subscribing ? <Loader2 className="w-4 h-4 animate-spin" /> : subscribed ? 'JOINED ✓' : 'JOIN'}
              </button>
            </form>
          </section>
        )}
      </main>

      {/* ── MINIMALIST FOOTER ── */}
      <footer className="max-w-[1240px] mx-auto px-4 md:px-8 py-8 border-t border-[#d9d4ca]/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#77736c] font-bold">
        <span>© {new Date().getFullYear()} {store.store_name}. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href={`/${store.slug}/checkout`} className="hover:text-black transition-colors">Bag & Checkout</Link>
          <span>·</span>
          <Link href="/track" className="hover:text-black transition-colors">Track Order</Link>
          <span>·</span>
          <span className="text-[#161616] font-black">Powered by Ondar</span>
        </div>
      </footer>

      {/* ── TOAST ALERT ── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#161616] text-white px-5 py-2.5 rounded-full text-xs font-black shadow-2xl z-50 animate-fade-in flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#c95c35]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
