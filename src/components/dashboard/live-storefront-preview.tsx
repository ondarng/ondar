'use client'

import { useState } from 'react'
import { Smartphone, Monitor, Sparkles, ExternalLink, RefreshCw, ShoppingBag, Check } from 'lucide-react'

interface LiveStorefrontPreviewProps {
  template: 'classic' | 'editorial'
  storeName: string
  logoUrl: string
  heroBannerUrl: string
  announcementText: string
  accentColor: string
  footerBgColor: string
  heroEyebrow: string
  heroTitle: string
  heroSubtitle: string
  heroBtnText: string
  tickerText: string
  showTicker: boolean
  featureTitle: string
  featureText: string
  featureImageUrl: string
  showFeature: boolean
  showNewsletter: boolean
  newsletterTitle: string
  newsletterSubtitle: string
  products: any[]
  slug: string
}

export function LiveStorefrontPreview({
  template,
  storeName,
  logoUrl,
  heroBannerUrl,
  announcementText,
  accentColor,
  footerBgColor,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
  heroBtnText,
  tickerText,
  showTicker,
  featureTitle,
  featureText,
  featureImageUrl,
  showFeature,
  showNewsletter,
  newsletterTitle,
  newsletterSubtitle,
  products,
  slug,
}: LiveStorefrontPreviewProps) {
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('desktop')

  const previewProducts = products.length > 0 ? products : [
    { id: '1', name: 'Relaxed Cotton Shirt', price: 24000, image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
    { id: '2', name: 'Everyday Linen Set', price: 42000, image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
    { id: '3', name: 'Minimal Wrist Watch', price: 45000, image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=600&q=80' },
    { id: '4', name: 'Structured Leather Bag', price: 55000, image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' },
  ]

  const effectiveHeroBanner = heroBannerUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80'
  const effectiveFeatureImg = featureImageUrl || effectiveHeroBanner

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-4 md:p-5 space-y-4 border border-slate-800 shadow-2xl">
      {/* Device Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-xs font-mono font-bold text-slate-400 ml-2">
            ondar.shop/{slug || 'your-store'}
          </span>
          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 ml-2">
            Live Preview
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-700">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                deviceMode === 'desktop' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                deviceMode === 'mobile' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>

          {/* External Storefront Link */}
          {slug && (
            <a
              href={`/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Open full store in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Screen Frame Container */}
      <div className="flex justify-center bg-slate-950/80 rounded-2xl p-2 md:p-6 overflow-hidden border border-slate-800/80">
        <div
          className={`transition-all duration-300 overflow-y-auto max-h-[680px] rounded-2xl shadow-2xl border ${
            deviceMode === 'mobile'
              ? 'w-[375px] border-slate-700'
              : 'w-full max-w-[960px] border-slate-800'
          }`}
          style={{
            backgroundColor: template === 'editorial' ? '#f4f0e8' : '#ffffff',
            color: '#161616',
          }}
        >
          {/* ════════════════════ EDITORIAL TEMPLATE PREVIEW ════════════════════ */}
          {template === 'editorial' ? (
            <div className="text-[#161616] font-sans antialiased text-xs select-none">
              {/* Top Announcement */}
              {announcementText && (
                <div className="bg-[#161616] text-white text-center py-2 px-3 text-[10px] font-black uppercase tracking-widest">
                  {announcementText}
                </div>
              )}

              {/* Editorial Nav */}
              <div className="px-4 py-3 border-b border-[#d9d4ca] flex items-center justify-between bg-[#f4f0e8]">
                <div className="flex items-center gap-2">
                  {logoUrl && (
                    <img src={logoUrl} alt="" className="w-6 h-6 rounded-full object-cover border border-black/20" />
                  )}
                  <span className="font-black text-sm tracking-tight uppercase">{storeName || 'YOUR BRAND'}</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-black uppercase text-[#161616]">
                  <span className="hidden sm:inline">Shop</span>
                  <span className="hidden sm:inline">Collections</span>
                  <span className="hidden sm:inline">Our Story</span>
                  <div className="w-7 h-7 rounded-full border border-[#d9d4ca] bg-white flex items-center justify-center">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Split Hero */}
              <div className="p-3">
                <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-[#d9d4ca] bg-[#e3dccf]">
                  <div className="p-6 flex flex-col justify-center space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#c95c35]">
                      {heroEyebrow || 'Everyday, considered.'}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-[#161616]">
                      {heroTitle || storeName || 'Good things, simply.'}
                    </h2>
                    <p className="text-[11px] text-[#666158] leading-relaxed">
                      {heroSubtitle || 'A more editorial storefront direction: stronger visuals, confident typography and a calmer shopping experience.'}
                    </p>
                    <div className="pt-1">
                      <span className="inline-block px-4 py-2 bg-[#161616] text-white text-[10px] font-black tracking-wider uppercase">
                        {heroBtnText || 'Shop collection'}
                      </span>
                    </div>
                  </div>
                  <div
                    className="min-h-[180px] bg-cover bg-center"
                    style={{ backgroundImage: `url("${effectiveHeroBanner}")` }}
                  />
                </div>
              </div>

              {/* Scrolling Ticker Ribbon */}
              {showTicker && (
                <div className="bg-[#c95c35] text-white py-2 px-3 text-[10px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap">
                  <span>{tickerText || 'NEW ARRIVALS ✦ MADE FOR EVERYDAY ✦ SHOP LOCAL ✦'}</span>
                </div>
              )}

              {/* Curated Products Grid */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-[#d9d4ca] pb-1.5">
                  <span className="font-black text-sm uppercase tracking-tight">Curated For You</span>
                  <span className="text-[10px] font-bold text-[#c95c35]">4 Items</span>
                </div>

                <div className={`grid gap-3 ${deviceMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {previewProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="space-y-1.5">
                      <div className="aspect-[1/1.15] bg-[#e6e1d8] rounded-xl overflow-hidden border border-[#d9d4ca]">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-[10px]">No image</div>
                        )}
                      </div>
                      <div className="font-bold text-[11px] truncate">{p.name}</div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-black">₦{Number(p.price).toLocaleString()}</span>
                        <span className="px-2 py-0.5 bg-white border border-[#161616] rounded text-[9px] font-black">ADD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Story Feature */}
              {showFeature && (
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 bg-[#161616] text-white rounded-2xl overflow-hidden">
                    <div
                      className="min-h-[140px] bg-cover bg-center"
                      style={{ backgroundImage: `url("${effectiveFeatureImg}")` }}
                    />
                    <div className="p-6 space-y-2 flex flex-col justify-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#c95c35]">Brand Philosophy</span>
                      <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                        {featureTitle || 'Let the products do the talking.'}
                      </h3>
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        {featureText || 'Carefully crafted for discerning individuals. Quality, longevity, and timeless utility in every single piece.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter Box */}
              {showNewsletter && (
                <div className="border-t border-[#d9d4ca] p-6 text-center space-y-2 bg-[#f4f0e8]">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#c95c35]">Stay In The Loop</span>
                  <h4 className="text-base font-black">{newsletterTitle || 'Stay in the loop'}</h4>
                  <p className="text-[10px] text-[#77736c] max-w-xs mx-auto">
                    {newsletterSubtitle || 'New products and exclusive offers, straight to your inbox.'}
                  </p>
                  <div className="flex max-w-xs mx-auto pt-1">
                    <input
                      type="text"
                      disabled
                      placeholder="Your email address..."
                      className="flex-1 px-3 py-1.5 bg-white border border-[#d9d4ca] text-[10px] rounded-l outline-none"
                    />
                    <button className="px-3 py-1.5 bg-[#161616] text-white text-[9px] font-black uppercase rounded-r">
                      JOIN
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ════════════════════ CLASSIC MINIMALIST PREVIEW ════════════════════ */
            <div className="text-slate-900 font-sans antialiased text-xs select-none bg-slate-50">
              {/* Announcement */}
              {announcementText && (
                <div
                  className="text-white text-center py-2 px-3 text-[10px] font-bold"
                  style={{ backgroundColor: accentColor || '#00A859' }}
                >
                  {announcementText}
                </div>
              )}

              {/* Classic Nav */}
              <div className="px-4 py-3 border-b border-slate-200 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="" className="w-6 h-6 rounded-lg object-cover" />
                  ) : (
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-white font-black text-[10px]"
                      style={{ backgroundColor: accentColor || '#00A859' }}
                    >
                      {storeName?.charAt(0) || 'O'}
                    </div>
                  )}
                  <span className="font-black text-sm">{storeName || 'Store Name'}</span>
                </div>
                <ShoppingBag className="w-4 h-4 text-slate-700" />
              </div>

              {/* Hero Banner */}
              {effectiveHeroBanner && (
                <div className="p-3">
                  <div
                    className="h-32 md:h-44 rounded-2xl bg-cover bg-center border border-slate-200 shadow-xs"
                    style={{ backgroundImage: `url("${effectiveHeroBanner}")` }}
                  />
                </div>
              )}

              {/* Products Grid */}
              <div className="p-4 space-y-3">
                <span className="font-extrabold text-xs text-slate-800 block">Available Products</span>
                <div className={`grid gap-3 ${deviceMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {previewProducts.slice(0, 4).map((p) => (
                    <div key={p.id} className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
                      <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        {p.image_url ? (
                          <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-[10px]">No image</div>
                        )}
                      </div>
                      <div className="font-bold text-[11px] truncate">{p.name}</div>
                      <div className="font-black text-[11px]" style={{ color: accentColor || '#00A859' }}>
                        ₦{Number(p.price).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
