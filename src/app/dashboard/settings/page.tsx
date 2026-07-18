'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon, LogOut, Trash2, MessageCircle, AtSign } from 'lucide-react'
import Link from 'next/link'

export default function DashboardSettingsPage() {
  const [store, setStore] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Form State
  const [storeName, setStoreName] = useState('')
  const [slug, setSlug] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [accentColor, setAccentColor] = useState('#00A859')
  const [trustBadges, setTrustBadges] = useState('Nationwide Delivery, 100% Original, Warranty')
  const [instagram, setInstagram] = useState('')
  const [facebook, setFacebook] = useState('')
  const [twitter, setTwitter] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [enableDirectCheckout, setEnableDirectCheckout] = useState(true)
  const [enableWhatsappCheckout, setEnableWhatsappCheckout] = useState(true)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchStore() {
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
      setStoreName(storeData.store_name || '')
      setSlug(storeData.slug || '')
      setWhatsapp(storeData.whatsapp_number || '')
      setDescription(storeData.description || '')
      setLocation(storeData.location || '')
      setResponseTime(storeData.response_time || '')
      setLogoUrl(storeData.logo_url || '')
      setAccentColor(storeData.accent_color || '#00A859')
      setInstagram(storeData.instagram_handle || '')
      setFacebook(storeData.facebook_handle || '')
      setTwitter(storeData.twitter_handle || '')
      setAnnouncementText(storeData.announcement_text || '')
      setBankName(storeData.bank_name || '')
      setBankAccountNumber(storeData.bank_account_number || '')
      setBankAccountName(storeData.bank_account_name || '')
      setEnableDirectCheckout(storeData.enable_direct_checkout !== false)
      setEnableWhatsappCheckout(storeData.enable_whatsapp_checkout !== false)
      if (storeData.trust_badges && Array.isArray(storeData.trust_badges)) {
        setTrustBadges(storeData.trust_badges.join(', '))
      }
      
      setLoading(false)
    }
    fetchStore()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('stores')
      .update({
        store_name: storeName,
        slug,
        whatsapp_number: whatsapp,
        description,
        location,
        response_time: responseTime,
        logo_url: logoUrl,
        accent_color: accentColor,
        trust_badges: trustBadges.split(',').map(b => b.trim()).filter(Boolean),
        instagram_handle: instagram,
        facebook_handle: facebook,
        twitter_handle: twitter,
        announcement_text: announcementText,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        enable_direct_checkout: enableDirectCheckout,
        enable_whatsapp_checkout: enableWhatsappCheckout
      })
      .eq('id', store.id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you absolutely sure? This will delete your store, products, and all order history forever. This cannot be undone.')) return
    
    setSaving(true)
    try {
      // Delete orders first (foreign key constraints)
      await supabase.from('orders').delete().eq('store_id', store.id)
      // Delete products
      await supabase.from('products').delete().eq('store_id', store.id)
      // Delete store
      await supabase.from('stores').delete().eq('id', store.id)
      
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err: any) {
      alert("Error deleting account: " + err.message)
      setSaving(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingLogo(true)
      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `logo-${store.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setLogoUrl(publicUrl)

      // Auto-save logo
      const { error: dbError } = await supabase.from('stores').update({ logo_url: publicUrl }).eq('id', store.id)
      if (dbError) throw dbError
      
      setMessage({ type: 'success', text: 'Logo uploaded and saved successfully!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <header className="bg-white border-b border-border sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-primary-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-primary-900">Store Settings</span>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <form id="settings-form" onSubmit={handleSave} className="space-y-6">
          
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Basic Info */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-secondary font-bold mb-2">Basic Info</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Store Name</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Store Link (Slug)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-xs">
                    {typeof window !== 'undefined' ? window.location.host : ''}/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full pl-32 pr-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">WhatsApp Number</label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Store Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={160}
                rows={2}
                placeholder="e.g. Original phones and gadgets. Nationwide delivery available."
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
              />
              <p className="text-[10px] text-secondary mt-1">Short bio or catchphrase (max 160 characters).</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Location (Optional)</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Lagos"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Response Time (Optional)</label>
              <input
                type="text"
                value={responseTime}
                onChange={(e) => setResponseTime(e.target.value)}
                placeholder="e.g. Replies in ~15 mins"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Social Media Profiles */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-secondary font-bold mb-2">Social Media Links</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Instagram Handle / URL</label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="e.g. https://instagram.com/yourstore or @yourstore"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Facebook URL</label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="e.g. https://facebook.com/yourstore"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Twitter (X) URL</label>
              <input
                type="text"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="e.g. https://x.com/yourstore"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Checkout Options */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-secondary font-bold mb-2">Checkout Options</h2>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <label className="text-xs font-bold text-primary-900">Enable Direct Checkout</label>
                <p className="text-[10px] text-secondary">Allow customers to order directly with bank details</p>
              </div>
              <input
                type="checkbox"
                checked={enableDirectCheckout}
                onChange={(e) => setEnableDirectCheckout(e.target.checked)}
                className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <label className="text-xs font-bold text-primary-900">Enable WhatsApp DM Checkout</label>
                <p className="text-[10px] text-secondary">Allow customers to send order carts straight to WhatsApp</p>
              </div>
              <input
                type="checkbox"
                checked={enableWhatsappCheckout}
                onChange={(e) => setEnableWhatsappCheckout(e.target.checked)}
                className="w-5 h-5 accent-primary-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Bank Transfer Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-secondary font-bold mb-2">Bank Details (Direct Checkout)</h2>
            <p className="text-[10px] text-secondary leading-relaxed">
              These details will be shown to customers choosing "Direct Checkout" to transfer payment.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. GTBank, Kuda, Access Bank"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Account Number</label>
              <input
                type="text"
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="10-digit Account Number"
                maxLength={10}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Account Name</label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                placeholder="Official Account Name"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-xs"
              />
            </div>
          </div>

          {/* Branding */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-6">
            <h2 className="text-sm uppercase tracking-widest text-secondary font-bold">Store Branding</h2>
            
            <div className="space-y-3">
              <label className="text-xs font-bold text-primary-900">Store Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-border bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-secondary" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="bg-white border border-border px-4 py-2 rounded-lg text-sm font-bold text-primary-900 flex items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors w-fit">
                    {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                    />
                  </label>
                  <p className="text-[10px] text-secondary mt-1">Recommended size: 256x256px (Square)</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-primary-900">Accent Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer p-0 border-0 overflow-hidden shrink-0"
                  style={{ backgroundColor: accentColor }}
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 px-4 py-2 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none uppercase font-mono text-sm"
                  pattern="^#[0-9A-Fa-f]{6}$"
                />
               </div>
               <p className="text-[10px] text-secondary">This color will be used for buttons on your public store.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Trust Badges (Store Guarantees)</label>
              <input
                type="text"
                value={trustBadges}
                onChange={(e) => setTrustBadges(e.target.value)}
                placeholder="e.g. Fast Delivery, 100% Original, Warranty"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
              <p className="text-[10px] text-secondary mt-1">Comma-separated list of badges displayed to customers.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Storefront Announcement Text</label>
              <input
                type="text"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. ⚡ Shopping more than one item? Use our direct checkout!"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
              <p className="text-[10px] text-secondary mt-1">Displays at the very top of your storefront in your accent color.</p>
            </div>
          </div>

          {/* Feedback & Support */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <h2 className="text-sm uppercase tracking-widest text-secondary font-bold">Feedback & Support</h2>
            <p className="text-xs text-secondary leading-relaxed">
              Found a bug? Have a feature suggestion? Talk to the Ondar team directly.
            </p>
            <a 
              href="https://wa.me/2348058424520?text=Hi Ondar Team, I have a suggestion/bug report: "
              target="_blank"
              className="w-full bg-green-50 text-green-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-green-100 transition-all border border-green-200"
            >
              <MessageCircle className="w-4 h-4" />
              Report Bug / Suggest Feature
            </a>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100 space-y-4 mt-8">
            <h2 className="text-sm uppercase tracking-widest text-red-700 font-bold">Danger Zone</h2>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-white text-slate-700 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 transition-all"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
                Log Out
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="w-full bg-white text-red-600 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-red-100 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account & Data
              </button>
            </div>
            <p className="text-[10px] text-red-400 text-center">
              Deleting your account is permanent and cannot be undone.
            </p>
          </div>

        </form>
      </main>
    </div>
  )
}
