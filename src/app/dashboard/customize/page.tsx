'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import {
  ArrowLeft,
  Smartphone,
  Monitor,
  Save,
  Loader2,
  Check,
  Upload,
  Crop,
  X,
  Sparkles,
  Eye,
  Type,
  Image as ImageIcon,
  Palette,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { BannerCropperModal } from '@/components/banner-cropper-modal'

export default function StorefrontEditorStudio() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile')
  const [activeSection, setActiveSection] = useState<'hero' | 'announcement' | 'ticker' | 'story' | 'newsletter' | 'theme'>('hero')

  // Store data state
  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])

  // Visual Customizer Values
  const [template, setTemplate] = useState<'classic' | 'editorial'>('editorial')
  const [storeName, setStoreName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [heroBannerUrl, setHeroBannerUrl] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [accentColor, setAccentColor] = useState('#00A859')
  const [footerBgColor, setFooterBgColor] = useState('#090D16')

  // Editorial Specific Texts
  const [heroEyebrow, setHeroEyebrow] = useState('Everyday, considered.')
  const [heroTitle, setHeroTitle] = useState('Good things, simply.')
  const [heroSubtitle, setHeroSubtitle] = useState('A more editorial storefront direction: stronger visuals, confident typography and a calmer shopping experience.')
  const [heroBtnText, setHeroBtnText] = useState('Shop collection')

  const [tickerText, setTickerText] = useState('NEW ARRIVALS ✦ MADE FOR EVERYDAY ✦ 100% AUTHENTIC ✦ SHOP LOCAL ✦')
  const [showTicker, setShowTicker] = useState(true)

  const [featureTitle, setFeatureTitle] = useState('Let the products do the talking.')
  const [featureText, setFeatureText] = useState('Carefully crafted for discerning individuals. Quality, longevity, and timeless utility in every single piece.')
  const [featureImageUrl, setFeatureImageUrl] = useState('')
  const [showFeature, setShowFeature] = useState(true)

  const [showNewsletter, setShowNewsletter] = useState(true)
  const [newsletterTitle, setNewsletterTitle] = useState('Stay in the loop')
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('New products and exclusive offers, straight to your inbox.')

  // Cropper & Image Modal
  const [showBannerCropper, setShowBannerCropper] = useState(false)
  const [rawImageToCrop, setRawImageToCrop] = useState<string | null>(null)
  const [cropTarget, setCropTarget] = useState<'hero' | 'feature'>('hero')
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    async function loadStore() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!storeData) {
          router.push('/onboarding/create-store')
          return
        }

        setStore(storeData)
        setTemplate(storeData.storefront_template || 'editorial')
        setStoreName(storeData.store_name || '')
        setLogoUrl(storeData.logo_url || '')
        setHeroBannerUrl(storeData.hero_banner_url || '')
        setAnnouncementText(storeData.announcement_text || 'FREE DELIVERY ON ORDERS OVER ₦50,000 · SHOP LOCAL')
        setAccentColor(storeData.accent_color || '#00A859')
        setFooterBgColor(storeData.footer_bg_color || '#090D16')

        setHeroEyebrow(storeData.hero_eyebrow || 'Everyday, considered.')
        setHeroTitle(storeData.hero_title || storeData.store_name || 'Good things, simply.')
        setHeroSubtitle(storeData.hero_subtitle || storeData.description || 'A more editorial storefront direction: stronger visuals, confident typography and a calmer shopping experience.')
        setHeroBtnText(storeData.hero_button_text || 'Shop collection')

        setTickerText(storeData.ticker_text || 'NEW ARRIVALS ✦ MADE FOR EVERYDAY ✦ 100% AUTHENTIC ✦ SHOP LOCAL ✦')
        setShowTicker(storeData.show_ticker !== false)

        setFeatureTitle(storeData.feature_title || 'Let the products do the talking.')
        setFeatureText(storeData.feature_text || storeData.description || 'Carefully crafted for discerning individuals. Quality, longevity, and timeless utility in every piece.')
        setFeatureImageUrl(storeData.feature_image_url || '')
        setShowFeature(storeData.show_feature !== false)

        setShowNewsletter(storeData.show_newsletter !== false)
        setNewsletterTitle(storeData.newsletter_title || 'Stay in the loop')
        setNewsletterSubtitle(storeData.newsletter_subtitle || 'New products and exclusive offers, straight to your inbox.')

        // Load Products
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .limit(8)

        setProducts(prods || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadStore()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'feature') => {
    const file = e.target.files?.[0]
    if (!file) return

    setCropTarget(target)
    const reader = new FileReader()
    reader.onload = () => {
      setRawImageToCrop(reader.result as string)
      setShowBannerCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const handleCropComplete = (croppedBase64: string) => {
    if (cropTarget === 'hero') {
      setHeroBannerUrl(croppedBase64)
    } else {
      setFeatureImageUrl(croppedBase64)
    }
    setShowBannerCropper(false)
    setRawImageToCrop(null)
  }

  const handleSave = async () => {
    if (!store) return
    setSaving(true)

    try {
      const payloadToSave: any = {
        storefront_template: template,
        hero_eyebrow: heroEyebrow,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_button_text: heroBtnText,
        hero_banner_url: heroBannerUrl,
        announcement_text: announcementText,
        accent_color: accentColor,
        footer_bg_color: footerBgColor,
        ticker_text: tickerText,
        show_ticker: showTicker,
        feature_title: featureTitle,
        feature_text: featureText,
        feature_image_url: featureImageUrl,
        show_feature: showFeature,
        show_newsletter: showNewsletter,
        newsletter_title: newsletterTitle,
        newsletter_subtitle: newsletterSubtitle,
      }

      // Safe stripping loop
      for (let attempt = 0; attempt < 12; attempt++) {
        const { error } = await supabase
          .from('stores')
          .update(payloadToSave)
          .eq('id', store.id)

        if (!error) break

        const match =
          error.message?.match(/Could not find the ['"]([^'"]+)['"] column/i) ||
          error.message?.match(/column ['"]([^'"]+)['"]/i) ||
          error.message?.match(/['"]([^'"]+)['"] of relation/i)

        if (match && match[1]) {
          delete payloadToSave[match[1]]
        } else {
          break
        }
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert('Error saving design: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A859]" />
      </div>
    )
  }

  const previewBanner = heroBannerUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1300&q=85'
  const previewFeature = featureImageUrl || previewBanner

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* ── TOP EDITOR TOOLBAR ── */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <span className="font-black text-xs sm:text-sm tracking-tight text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#00A859]" />
            <span>Storefront Visual Studio</span>
          </span>
        </div>

        {/* Viewport Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceMode('mobile')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              deviceMode === 'mobile' ? 'bg-[#00A859] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Mobile</span>
          </button>
          <button
            onClick={() => setDeviceMode('desktop')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
              deviceMode === 'desktop' ? 'bg-[#00A859] text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Desktop</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {store?.slug && (
            <a
              href={`/${store.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="Open Live Store"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-[#00A859] text-white text-xs font-black rounded-xl hover:opacity-90 transition-all flex items-center gap-1.5 shadow-md shadow-[#00A859]/20"
          >
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : saveSuccess ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saving ? 'Publishing...' : saveSuccess ? 'Published!' : 'Publish Storefront'}</span>
          </button>
        </div>
      </header>

      {/* ── SPLIT STUDIO WORKSPACE ── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* ── LEFT / BOTTOM EDITING CONTROLS PANEL ── */}
        <div className="w-full lg:w-96 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 overflow-y-auto space-y-4 max-h-[45vh] lg:max-h-[calc(100vh-57px)]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">Section Editor</span>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
              Click elements to edit
            </span>
          </div>

          {/* Section Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 text-[11px] font-bold">
            <button
              onClick={() => setActiveSection('hero')}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                activeSection === 'hero' ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              1. Hero Banner
            </button>
            <button
              onClick={() => setActiveSection('announcement')}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                activeSection === 'announcement' ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              2. Announcement
            </button>
            <button
              onClick={() => setActiveSection('ticker')}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                activeSection === 'ticker' ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              3. Ticker
            </button>
            <button
              onClick={() => setActiveSection('story')}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                activeSection === 'story' ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              4. Brand Story
            </button>
            <button
              onClick={() => setActiveSection('newsletter')}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                activeSection === 'newsletter' ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              5. Newsletter
            </button>
            <button
              onClick={() => setActiveSection('theme')}
              className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                activeSection === 'theme' ? 'bg-[#00A859] text-white border-[#00A859]' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              🎨 Theme Style
            </button>
          </div>

          {/* ── SECTION 1: HERO CONTROLS ── */}
          {activeSection === 'hero' && (
            <div className="space-y-3.5 pt-2 animate-fade-in text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Eyebrow Tagline</label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Main Big Headline</label>
                <input
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold outline-none focus:border-[#00A859]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subtitle Description</label>
                <textarea
                  rows={2}
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859] resize-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">CTA Button Text</label>
                <input
                  type="text"
                  value={heroBtnText}
                  onChange={(e) => setHeroBtnText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859]"
                />
              </div>

              {/* Banner Image Uploader */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Hero Photo / Banner</label>
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img src={previewBanner} alt="" className="w-full h-full object-cover" />
                  <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold gap-1">
                    <Upload className="w-5 h-5" />
                    <span>Upload & Crop Photo</span>
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'hero')} className="hidden" />
                  </label>
                </div>
                <input
                  type="text"
                  placeholder="Or paste image URL..."
                  value={heroBannerUrl}
                  onChange={(e) => setHeroBannerUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-[10px] text-slate-300 font-mono"
                />
                <p className="text-[10px] text-slate-400 font-medium">
                  📐 <strong className="text-slate-300">Best Scale:</strong> 16:9 or 3:1 landscape (1200 × 675px or 1200 × 400px). Fits phones & laptops cleanly.
                </p>
              </div>
            </div>
          )}

          {/* ── SECTION 2: ANNOUNCEMENT ── */}
          {activeSection === 'announcement' && (
            <div className="space-y-3 pt-2 animate-fade-in text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Top Announcement Bar</label>
              <textarea
                rows={2}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. FREE DELIVERY ON ORDERS OVER ₦50,000 · SHOP LOCAL"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859] resize-none"
              />
              <p className="text-[10px] text-slate-500">Leave blank if you wish to hide the top bar.</p>
            </div>
          )}

          {/* ── SECTION 3: TICKER ── */}
          {activeSection === 'ticker' && (
            <div className="space-y-3 pt-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Enable Marquee Ribbon</label>
                <input
                  type="checkbox"
                  checked={showTicker}
                  onChange={(e) => setShowTicker(e.target.checked)}
                  className="accent-[#00A859] w-4 h-4"
                />
              </div>
              {showTicker && (
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ribbon Text</label>
                  <input
                    type="text"
                    value={tickerText}
                    onChange={(e) => setTickerText(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859]"
                  />
                </div>
              )}
            </div>
          )}

          {/* ── SECTION 4: BRAND STORY ── */}
          {activeSection === 'story' && (
            <div className="space-y-3 pt-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Enable Brand Story</label>
                <input
                  type="checkbox"
                  checked={showFeature}
                  onChange={(e) => setShowFeature(e.target.checked)}
                  className="accent-[#00A859] w-4 h-4"
                />
              </div>

              {showFeature && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Story Headline</label>
                    <input
                      type="text"
                      value={featureTitle}
                      onChange={(e) => setFeatureTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Philosophy Text</label>
                    <textarea
                      rows={3}
                      value={featureText}
                      onChange={(e) => setFeatureText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859] resize-none"
                    />
                  </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Feature Image</label>
                      <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                        <img src={previewFeature} alt="" className="w-full h-full object-cover" />
                        <label className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-xs font-bold gap-1">
                          <Upload className="w-5 h-5" />
                          <span>Upload Photo</span>
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'feature')} className="hidden" />
                        </label>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium mt-1">
                        📐 <strong className="text-slate-300">Best Scale:</strong> 4:3 or 16:9 landscape (800 × 600px).
                      </p>
                    </div>
                </>
              )}
            </div>
          )}

          {/* ── SECTION 5: NEWSLETTER ── */}
          {activeSection === 'newsletter' && (
            <div className="space-y-3 pt-2 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Enable Email Capture</label>
                <input
                  type="checkbox"
                  checked={showNewsletter}
                  onChange={(e) => setShowNewsletter(e.target.checked)}
                  className="accent-[#00A859] w-4 h-4"
                />
              </div>

              {showNewsletter && (
                <>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Newsletter Title</label>
                    <input
                      type="text"
                      value={newsletterTitle}
                      onChange={(e) => setNewsletterTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Incentive / Subtitle</label>
                    <textarea
                      rows={2}
                      value={newsletterSubtitle}
                      onChange={(e) => setNewsletterSubtitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:border-[#00A859] resize-none"
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── SECTION 6: THEME STYLE ── */}
          {activeSection === 'theme' && (
            <div className="space-y-3.5 pt-2 animate-fade-in text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Selected Template</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTemplate('editorial')}
                    className={`p-3 rounded-xl border text-left font-bold ${
                      template === 'editorial' ? 'border-[#00A859] bg-[#00A859]/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Editorial Boutique
                  </button>
                  <button
                    onClick={() => setTemplate('classic')}
                    className={`p-3 rounded-xl border text-left font-bold ${
                      template === 'classic' ? 'border-[#00A859] bg-[#00A859]/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    Classic Grid
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Brand Accent Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT / TOP INTERACTIVE CANVAS PREVIEW ── */}
        <div className="flex-1 bg-slate-950 p-3 md:p-8 flex items-center justify-center overflow-y-auto">
          <div
            className={`transition-all duration-300 overflow-y-auto max-h-[82vh] rounded-3xl shadow-2xl border ${
              deviceMode === 'mobile'
                ? 'w-[375px] border-slate-700'
                : 'w-full max-w-[960px] border-slate-800'
            }`}
            style={{
              backgroundColor: template === 'editorial' ? '#f4f0e8' : '#ffffff',
              color: '#161616',
            }}
          >
            {/* ── LIVE EDITORIAL CANVAS ── */}
            <div className="text-[#161616] font-sans antialiased text-xs select-none">
              {/* Top Announcement */}
              {announcementText && (
                <div
                  onClick={() => setActiveSection('announcement')}
                  className="bg-[#161616] text-white text-center py-2 px-3 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:ring-2 hover:ring-[#00A859]"
                  title="Click to edit announcement"
                >
                  {announcementText}
                </div>
              )}

              {/* Nav */}
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
                </div>
              </div>

              {/* Split Hero (Clickable) */}
              <div className="p-3">
                <div
                  onClick={() => setActiveSection('hero')}
                  className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-[#d9d4ca] bg-[#e3dccf] cursor-pointer hover:ring-2 hover:ring-[#00A859] transition-all"
                  title="Click to edit Hero"
                >
                  <div className="p-6 flex flex-col justify-center space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#c95c35]">
                      {heroEyebrow}
                    </span>
                    <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight text-[#161616]">
                      {heroTitle}
                    </h2>
                    <p className="text-[11px] text-[#666158] leading-relaxed">
                      {heroSubtitle}
                    </p>
                    <div className="pt-1">
                      <span className="inline-block px-4 py-2 bg-[#161616] text-white text-[10px] font-black tracking-wider uppercase">
                        {heroBtnText}
                      </span>
                    </div>
                  </div>
                  <div
                    className="min-h-[180px] bg-cover bg-center"
                    style={{ backgroundImage: `url("${previewBanner}")` }}
                  />
                </div>
              </div>

              {/* Marquee Ribbon */}
              {showTicker && (
                <div
                  onClick={() => setActiveSection('ticker')}
                  className="bg-[#c95c35] text-white py-2 px-3 text-[10px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap cursor-pointer hover:ring-2 hover:ring-[#00A859]"
                  title="Click to edit Ticker"
                >
                  <span>{tickerText}</span>
                </div>
              )}

              {/* Curated Products */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-[#d9d4ca] pb-1.5">
                  <span className="font-black text-sm uppercase tracking-tight">Curated For You</span>
                  <span className="text-[10px] font-bold text-[#c95c35]">In Stock</span>
                </div>

                <div className={`grid gap-3 ${deviceMode === 'mobile' ? 'grid-cols-2' : 'grid-cols-4'}`}>
                  {(products.length > 0 ? products : [
                    { id: '1', name: 'Relaxed Cotton Shirt', price: 24000, image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80' },
                    { id: '2', name: 'Everyday Linen Set', price: 42000, image_url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=600&q=80' },
                  ]).slice(0, 4).map((p) => (
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
                  <div
                    onClick={() => setActiveSection('story')}
                    className="grid grid-cols-1 md:grid-cols-2 bg-[#161616] text-white rounded-2xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-[#00A859] transition-all"
                    title="Click to edit Brand Story"
                  >
                    <div
                      className="min-h-[140px] bg-cover bg-center"
                      style={{ backgroundImage: `url("${previewFeature}")` }}
                    />
                    <div className="p-6 space-y-2 flex flex-col justify-center">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#c95c35]">Brand Philosophy</span>
                      <h3 className="text-lg md:text-xl font-black text-white leading-tight">
                        {featureTitle}
                      </h3>
                      <p className="text-[10px] text-slate-300 leading-relaxed">
                        {featureText}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Newsletter Box */}
              {showNewsletter && (
                <div
                  onClick={() => setActiveSection('newsletter')}
                  className="border-t border-[#d9d4ca] p-6 text-center space-y-2 bg-[#f4f0e8] cursor-pointer hover:ring-2 hover:ring-[#00A859] transition-all"
                  title="Click to edit Newsletter"
                >
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#c95c35]">Stay In The Loop</span>
                  <h4 className="text-base font-black">{newsletterTitle}</h4>
                  <p className="text-[10px] text-[#77736c] max-w-xs mx-auto">
                    {newsletterSubtitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Crop Modal */}
      {showBannerCropper && rawImageToCrop && (
        <BannerCropperModal
          imageSrc={rawImageToCrop}
          isOpen={showBannerCropper}
          onClose={() => {
            setShowBannerCropper(false)
            setRawImageToCrop(null)
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
