'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  Home,
  Package,
  ShoppingBag,
  Palette,
  Settings,
  Plus,
  ExternalLink,
  Share2,
  Copy,
  Check,
  Eye,
  AlertCircle,
  Save,
  Loader2,
  LogOut,
  X,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Search,
  Sun,
  Moon,
  Upload,
  Image as ImageIcon,
  Users,
  MessageSquare,
  Send,
  PhoneCall,
  UserCheck,
  Crop,
  Bell,
  Store,
} from 'lucide-react'
import Link from 'next/link'
import { BannerCropperModal } from '@/components/banner-cropper-modal'

export default function MobileResponsiveDashboard() {
  const [activeTab, setActiveTab] = useState<'home' | 'inventory' | 'orders' | 'customers' | 'design' | 'settings'>('home')
  const [darkMode, setDarkMode] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [viewsCount, setViewsCount] = useState(0)
  const [viewsTodayCount, setViewsTodayCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Uploading state for logo & banner
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [rawBannerToCrop, setRawBannerToCrop] = useState<string | null>(null)
  const [showBannerCropper, setShowBannerCropper] = useState(false)

  // Story Buy Link Generator Modal
  const [showBuyLinkModal, setShowBuyLinkModal] = useState(false)
  const [selectedProductForLink, setSelectedProductForLink] = useState<any>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  // Bulk Price & Stock Editor State
  const [showBulkEditor, setShowBulkEditor] = useState(false)
  const [bulkProducts, setBulkProducts] = useState<any[]>([])
  const [bulkSaving, setBulkSaving] = useState(false)

  // Receipt Modal State
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null)

  // Search & Filter States
  const [orderFilter, setOrderFilter] = useState<string>('ALL')
  const [productSearch, setProductSearch] = useState<string>('')
  const [customerSearch, setCustomerSearch] = useState<string>('')
  const [copiedAllNumbers, setCopiedAllNumbers] = useState(false)

  // Email Marketing & Broadcast States
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSubscribers, setEmailSubscribers] = useState<any[]>([])
  const [sendingBroadcast, setSendingBroadcast] = useState(false)
  const [copiedEmails, setCopiedEmails] = useState(false)
  const [broadcastSent, setBroadcastSent] = useState(false)

  // Form States for Store Customization
  const [storeName, setStoreName] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [heroBannerUrl, setHeroBannerUrl] = useState('')
  const [heroBannerLink, setHeroBannerLink] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [accentColor, setAccentColor] = useState('#00A859')
  const [footerBgColor, setFooterBgColor] = useState('#090D16')
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [location, setLocation] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [returnPolicy, setReturnPolicy] = useState('')
  const [trustBadges, setTrustBadges] = useState<string[]>([])

  // Regional Delivery Zones
  const [deliveryZones, setDeliveryZones] = useState<Array<{ name: string; fee: number }>>([])
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneFee, setNewZoneFee] = useState('')

  // Storefront Template & Editorial Customizer States
  const [storefrontTemplate, setStorefrontTemplate] = useState<'classic' | 'editorial'>('editorial')
  const [heroEyebrow, setHeroEyebrow] = useState('Everyday, considered.')
  const [heroTitle, setHeroTitle] = useState('')
  const [heroSubtitle, setHeroSubtitle] = useState('')
  const [heroBtnText, setHeroBtnText] = useState('Shop collection')
  const [tickerText, setTickerText] = useState('NEW ARRIVALS ✦ MADE FOR EVERYDAY ✦ 100% AUTHENTIC ✦ SHOP LOCAL ✦')
  const [showTicker, setShowTicker] = useState(true)
  const [featureTitle, setFeatureTitle] = useState('Let the products do the talking.')
  const [featureText, setFeatureText] = useState('')
  const [featureImageUrl, setFeatureImageUrl] = useState('')
  const [showFeature, setShowFeature] = useState(true)
  const [showNewsletter, setShowNewsletter] = useState(true)
  const [newsletterTitle, setNewsletterTitle] = useState('Stay in the loop')
  const [newsletterSubtitle, setNewsletterSubtitle] = useState('New products and exclusive offers, straight to your inbox.')

  // Account Settings Form
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [slug, setSlug] = useState('')

  const router = useRouter()
  const supabase = createClient()

  // Auto-load dark mode preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('ondar-theme')
      if (savedTheme === 'dark') setDarkMode(true)
    } catch {}
  }, [])

  const toggleDarkMode = () => {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    try {
      localStorage.setItem('ondar-theme', nextMode ? 'dark' : 'light')
    } catch {}
  }

  // Load Dashboard Data
  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        // Fetch vendor store
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

        // Populate customization form state
        setStoreName(storeData.store_name || '')
        setLogoUrl(storeData.logo_url || '')
        setHeroBannerUrl(storeData.hero_banner_url || '')
        setHeroBannerLink(storeData.hero_banner_link || '')
        setAnnouncementText(storeData.announcement_text || '')
        setAccentColor(storeData.accent_color || '#00A859')
        setFooterBgColor(storeData.footer_bg_color || '#090D16')
        setWhatsappNumber(storeData.whatsapp_number || '')
        setInstagramHandle(storeData.instagram_handle || '')
        setTwitterHandle(storeData.twitter_handle || '')
        setFacebookUrl(storeData.facebook_url || '')
        setWebsiteUrl(storeData.website_url || '')
        setLocation(storeData.location || '')
        setResponseTime(storeData.response_time || '')
        setReturnPolicy(storeData.return_policy || '')
        setTrustBadges(storeData.trust_badges || ['Nationwide Delivery', '100% Original', 'Warranty'])
        setDeliveryZones(Array.isArray(storeData.delivery_zones) ? storeData.delivery_zones : [])

        // Template and Editorial Customizer fields
        setStorefrontTemplate(storeData.storefront_template || 'editorial')
        setHeroEyebrow(storeData.hero_eyebrow || 'Everyday, considered.')
        setHeroTitle(storeData.hero_title || storeData.store_name || '')
        setHeroSubtitle(storeData.hero_subtitle || storeData.description || '')
        setHeroBtnText(storeData.hero_button_text || 'Shop collection')
        setTickerText(storeData.ticker_text || 'NEW ARRIVALS ✦ MADE FOR EVERYDAY ✦ 100% AUTHENTIC ✦ SHOP LOCAL ✦')
        setShowTicker(storeData.show_ticker !== false)
        setFeatureTitle(storeData.feature_title || 'Let the products do the talking.')
        setFeatureText(storeData.feature_text || storeData.description || '')
        setFeatureImageUrl(storeData.feature_image_url || '')
        setShowFeature(storeData.show_feature !== false)
        setShowNewsletter(storeData.show_newsletter !== false)
        setNewsletterTitle(storeData.newsletter_title || 'Stay in the loop')
        setNewsletterSubtitle(storeData.newsletter_subtitle || 'New products and exclusive offers, straight to your inbox.')

        // Account settings state
        setBankName(storeData.bank_name || '')
        setBankAccountNumber(storeData.bank_account_number || '')
        setBankAccountName(storeData.bank_account_name || '')
        setSlug(storeData.slug || '')

        // Fetch Products
        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })

        setProducts(prods || [])
        setBulkProducts(prods?.map((p) => ({ ...p })) || [])

        // Fetch Orders
        const { data: ords } = await supabase
          .from('orders')
          .select('*, products(*)')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })

        setOrders(ords || [])

        // Fetch Newsletter Email Leads
        const { data: leadsData } = await supabase
          .from('leads')
          .select('*')
          .eq('store_id', storeData.id)
          .order('created_at', { ascending: false })

        setEmailSubscribers(leadsData || [])

        // Fetch Page View Analytics
        const { count: totalViews } = await supabase
          .from('store_views')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', storeData.id)

        setViewsCount(totalViews || 0)

        // Fetch Today's Views
        const startOfToday = new Date()
        startOfToday.setHours(0, 0, 0, 0)

        const { count: todayViews } = await supabase
          .from('store_views')
          .select('id', { count: 'exact', head: true })
          .eq('store_id', storeData.id)
          .gte('created_at', startOfToday.toISOString())

        setViewsTodayCount(todayViews || 0)

        // Request browser notification permission
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {})
        }

        // Realtime Order Subscription
        const channel = supabase
          .channel(`dashboard-orders-${storeData.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'orders',
              filter: `store_id=eq.${storeData.id}`,
            },
            (payload) => {
              const newOrder = payload.new
              setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)])

              // Synthesize subtle order chime
              try {
                const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
                const osc = audioCtx.createOscillator()
                const gain = audioCtx.createGain()
                osc.type = 'sine'
                osc.frequency.setValueAtTime(587.33, audioCtx.currentTime)
                osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1)
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35)
                osc.connect(gain)
                gain.connect(audioCtx.destination)
                osc.start()
                osc.stop(audioCtx.currentTime + 0.35)
              } catch {}

              // Trigger Desktop Notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(`⚡ New Order Received!`, {
                  body: `Order #${newOrder.id.slice(0, 8).toUpperCase()} for ₦${Number(newOrder.total_price).toLocaleString()}`,
                })
              }
            }
          )
          .subscribe()

        return () => {
          supabase.removeChannel(channel)
        }
      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Derive Unique Customers CRM List from Orders
  const customerMap = new Map<string, any>()
  orders.forEach((o) => {
    const rawPhone = o.customer_phone || 'No Phone'
    const key = rawPhone.replace(/[^0-9]/g, '') || o.customer_name || 'Anonymous'

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: key,
        name: o.customer_name || 'WhatsApp Customer',
        phone: o.customer_phone || 'No Phone',
        cleanPhone: rawPhone.replace(/[^0-9]/g, '').replace(/^0/, '234'),
        address: o.customer_phone ? o.delivery_address : '',
        totalOrders: 1,
        totalSpent: Number(o.total_price) || 0,
        lastOrderDate: o.created_at,
        notes: o.customer_note ? [o.customer_note] : [],
        recentOrders: [o],
      })
    } else {
      const existing = customerMap.get(key)
      existing.totalOrders += 1
      existing.totalSpent += Number(o.total_price) || 0
      existing.recentOrders.push(o)
      if (o.customer_note && !existing.notes.includes(o.customer_note)) {
        existing.notes.push(o.customer_note)
      }
    }
  })

  const customersList = Array.from(customerMap.values())

  // Copy all customer numbers for WhatsApp broadcast
  const handleCopyAllCustomerNumbers = () => {
    const numbers = customersList
      .map((c) => c.phone)
      .filter((p) => p && p !== 'No Phone')
      .join(', ')

    if (!numbers) {
      alert('No customer phone numbers found yet.')
      return
    }

    navigator.clipboard.writeText(numbers)
    setCopiedAllNumbers(true)
    setTimeout(() => setCopiedAllNumbers(false), 2500)
  }

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const completedOrdersCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'PAID').length

  // Handle Logo Upload
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !store) return
    setUploadingLogo(true)

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `logos/${store.id}_${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        const reader = new FileReader()
        reader.onload = (ev) => setLogoUrl(ev.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
        setLogoUrl(publicUrl)
      }
    } catch {
      const reader = new FileReader()
      reader.onload = (ev) => setLogoUrl(ev.target?.result as string)
      reader.readAsDataURL(file)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handle Banner Upload & Cropping
  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      setRawBannerToCrop(ev.target?.result as string)
      setShowBannerCropper(true)
    }
    reader.readAsDataURL(file)
  }

  // Handle Cropped Banner Result
  const handleCropComplete = (croppedDataUrl: string) => {
    setHeroBannerUrl(croppedDataUrl)
  }

  // Quick Stock adjustment
  const updateProductStock = async (productId: string, delta: number) => {
    const target = products.find((p) => p.id === productId)
    if (!target) return
    const newStock = Math.max(0, (target.stock_quantity || 0) + delta)

    setProducts(products.map((p) => (p.id === productId ? { ...p, stock_quantity: newStock } : p)))

    await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId)
  }

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    setProducts(products.filter((p) => p.id !== productId))
    await supabase.from('products').delete().eq('id', productId)
  }

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
  }

  // Save Store Customization (With Dynamic Auto-Stripping Column Fallback)
  const handleSaveCustomization = async () => {
    if (!store) return
    setSaving(true)

    try {
      const payloadToSave: any = {
        store_name: storeName,
        logo_url: logoUrl,
        hero_banner_url: heroBannerUrl,
        hero_banner_link: heroBannerLink,
        announcement_text: announcementText,
        accent_color: accentColor,
        footer_bg_color: footerBgColor,
        whatsapp_number: whatsappNumber,
        instagram_handle: instagramHandle,
        twitter_handle: twitterHandle,
        facebook_url: facebookUrl,
        website_url: websiteUrl,
        location,
        response_time: responseTime,
        return_policy: returnPolicy,
        trust_badges: trustBadges,
        delivery_zones: deliveryZones,
        storefront_template: storefrontTemplate,
        hero_eyebrow: heroEyebrow,
        hero_title: heroTitle,
        hero_subtitle: heroSubtitle,
        hero_button_text: heroBtnText,
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

      let saveError: any = null

      // Dynamically strip any missing column and retry up to 15 times
      for (let attempt = 0; attempt < 15; attempt++) {
        const { error } = await supabase
          .from('stores')
          .update(payloadToSave)
          .eq('id', store.id)

        if (!error) {
          saveError = null
          break
        }

        saveError = error
        // Regex matches single or double quoted column names: 'XYZ' or "XYZ"
        const match =
          error.message?.match(/Could not find the ['"]([^'"]+)['"] column/i) ||
          error.message?.match(/column ['"]([^'"]+)['"]/i) ||
          error.message?.match(/['"]([^'"]+)['"] of relation/i)

        if (match && match[1]) {
          const missingColumn = match[1]
          console.warn(`Stripping missing column '${missingColumn}' and retrying...`)
          delete payloadToSave[missingColumn]
        } else {
          break
        }
      }

      // If loop still failed on unsupported schema, perform guaranteed base save
      if (saveError) {
        console.warn('Performing guaranteed base store save:', saveError.message)
        const baseGuaranteed: any = {
          store_name: storeName,
          logo_url: logoUrl,
          hero_banner_url: heroBannerUrl,
          accent_color: accentColor,
          announcement_text: announcementText,
          whatsapp_number: whatsappNumber,
        }
        const finalTry = await supabase
          .from('stores')
          .update(baseGuaranteed)
          .eq('id', store.id)

        if (finalTry.error) throw finalTry.error
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err: any) {
      alert('Error saving customization: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Save Account Settings (With Dynamic Auto-Stripping Column Fallback)
  const handleSaveAccountSettings = async () => {
    if (!store) return
    setSaving(true)

    try {
      const payloadToSave: any = {
        store_name: storeName,
        bank_name: bankName,
        bank_account_number: bankAccountNumber,
        bank_account_name: bankAccountName,
        slug,
      }

      let saveError: any = null

      for (let attempt = 0; attempt < 6; attempt++) {
        const { error } = await supabase
          .from('stores')
          .update(payloadToSave)
          .eq('id', store.id)

        if (!error) {
          saveError = null
          break
        }

        saveError = error
        const match = error.message?.match(/Could not find the '([^']+)' column/)
        if (match && match[1]) {
          const missingColumn = match[1]
          delete payloadToSave[missingColumn]
        } else {
          break
        }
      }

      if (saveError) throw saveError

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err: any) {
      alert('Error saving settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Save Bulk Edits
  const handleSaveBulkEdits = async () => {
    setBulkSaving(true)

    try {
      for (const p of bulkProducts) {
        await supabase
          .from('products')
          .update({
            price: Number(p.price) || 0,
            stock_quantity: Number(p.stock_quantity) || 0,
          })
          .eq('id', p.id)
      }

      setProducts(bulkProducts.map((p) => ({ ...p })))
      setShowBulkEditor(false)
      alert('All prices and stock levels updated successfully!')
    } catch (err: any) {
      alert('Failed to save bulk edits: ' + err.message)
    } finally {
      setBulkSaving(false)
    }
  }

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <Loader2 className="w-8 h-8 text-[#00A859] animate-spin" />
      </div>
    )
  }

  // Pure Ondar Branding Classes
  const bgClass = darkMode ? 'bg-black text-white' : 'bg-white text-black'
  const cardClass = darkMode ? 'bg-neutral-950 border border-neutral-800' : 'bg-white border border-black'
  const inputClass = darkMode ? 'bg-neutral-900 border border-neutral-800 text-white' : 'bg-neutral-50 border border-black text-black font-medium'
  const subCardClass = darkMode ? 'bg-neutral-900 border border-neutral-800' : 'bg-neutral-50 border border-black'
  const headerClass = darkMode ? 'bg-neutral-950 border-b border-neutral-800' : 'bg-white border-b border-black'

  return (
    <div className={`min-h-screen ${bgClass} font-sans flex flex-col antialiased selection:bg-[#00A859] selection:text-white pb-20 md:pb-8`}>
      {/* ── TOP HEADER (BLACK THIN LINE) ── */}
      <header className={`${headerClass} sticky top-0 z-40 px-4 md:px-8 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2.5">
          {store?.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="w-8 h-8 rounded-xl object-cover border border-black" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center font-black text-xs">
              {store?.store_name?.charAt(0) || 'O'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="font-black text-xs md:text-sm tracking-tight leading-none truncate max-w-[130px] md:max-w-xs">{store?.store_name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <a
                href={`/${store?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] md:text-[11px] text-[#00A859] font-bold hover:underline flex items-center gap-1 truncate"
              >
                <span>ondar.shop/{store?.slug}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
              <span className="hidden sm:inline-block text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                14-Day Free Trial
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* ── NOTIFICATION BELL & ACTION ITEMS DROPDOWN ── */}
          {(() => {
            const lowStockAlerts = products.filter((p) => p.stock_quantity !== null && p.stock_quantity <= 3)
            const pendingFollowups = orders.filter((o) => o.status === 'PENDING')
            const totalAlertsCount = lowStockAlerts.length + pendingFollowups.length

            return (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2 rounded-xl border relative transition-colors ${
                    showNotifications
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black'
                      : darkMode
                      ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-300'
                      : 'border-black hover:bg-neutral-100 text-black'
                  }`}
                  title="Notifications & Action Items"
                >
                  <Bell className="w-4 h-4" />
                  {totalAlertsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-black animate-pulse">
                      {totalAlertsCount}
                    </span>
                  )}
                </button>

                {/* Floating Dropdown Panel */}
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <div
                      className={`absolute right-0 mt-2 w-80 md:w-96 rounded-2xl border shadow-2xl z-50 p-4 space-y-3 animate-fade-in ${
                        darkMode ? 'bg-neutral-950 border-neutral-800 text-white' : 'bg-white border-black text-black'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-2">
                        <div className="flex items-center gap-1.5 font-black text-xs">
                          <Bell className="w-3.5 h-3.5 text-[#00A859]" />
                          <span>Action Items & Alerts</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                          {totalAlertsCount} pending
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {totalAlertsCount === 0 ? (
                          <p className="text-xs text-slate-400 py-4 text-center font-medium">
                            🎉 All caught up! No low-stock items or pending follow-ups.
                          </p>
                        ) : (
                          <>
                            {/* Low Stock Alerts */}
                            {lowStockAlerts.map((p) => (
                              <div
                                key={p.id}
                                className="p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-amber-900 dark:text-amber-300">
                                    ⚠️ Low Stock Alert
                                  </span>
                                  <span className="font-bold text-[10px] text-amber-800 dark:text-amber-400 bg-white dark:bg-black px-1.5 py-0.5 rounded border border-amber-200">
                                    {p.stock_quantity === 0 ? 'Out of stock' : `${p.stock_quantity} left`}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                                  <strong>{p.name}</strong> is running low.
                                </p>
                                <button
                                  onClick={() => {
                                    setShowNotifications(false)
                                    setActiveTab('inventory')
                                  }}
                                  className="text-[10px] font-black text-[#00A859] hover:underline block pt-0.5"
                                >
                                  Manage Inventory →
                                </button>
                              </div>
                            ))}

                            {/* Follow-up Reminders */}
                            {pendingFollowups.map((o) => (
                              <div
                                key={o.id}
                                className="p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20 text-xs space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-blue-900 dark:text-blue-300">
                                    ⏳ Order Follow-Up Due
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-500 font-bold">
                                    #{o.id.slice(0, 8).toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                                  <strong>{o.customer_name || 'Customer'}</strong> (₦{Number(o.total_price).toLocaleString()}) awaiting confirmation.
                                </p>
                                <div className="flex items-center gap-2 pt-0.5">
                                  <button
                                    onClick={() => {
                                      setShowNotifications(false)
                                      setActiveTab('orders')
                                    }}
                                    className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:underline"
                                  >
                                    View in Orders →
                                  </button>
                                  {o.customer_phone && (
                                    <a
                                      href={`https://wa.me/${o.customer_phone.replace(/[^0-9]/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(
                                        `Hi ${o.customer_name || 'there'}, following up on your order #${o.id.slice(0, 8).toUpperCase()}!`
                                      )}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[10px] font-black text-[#25D366] hover:underline"
                                    >
                                      WhatsApp DM →
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )
          })()}

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-xl border transition-colors ${darkMode ? 'border-neutral-800 hover:bg-neutral-900 text-amber-400' : 'border-black hover:bg-neutral-100 text-black'}`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowBuyLinkModal(true)}
            className="px-2.5 py-1.5 md:px-3.5 bg-[#00A859] text-white border border-black rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Story Buy Link</span>
            <span className="sm:hidden">Buy Link</span>
          </button>

          <button
            onClick={handleLogout}
            className={`p-2 rounded-xl border transition-colors ${darkMode ? 'border-neutral-800 hover:bg-neutral-900 text-neutral-400 hover:text-white' : 'border-black hover:bg-neutral-100 text-black'}`}
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT WITH TAB NAVIGATION ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-4 md:py-6 flex flex-col md:flex-row gap-6">
        {/* ── DESKTOP SIDEBAR TAB NAVIGATION ── */}
        <nav className={`hidden md:flex w-56 shrink-0 flex-col gap-1.5 p-2 rounded-2xl border ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-black'} sticky top-20 z-30`}>
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'home'
                ? 'bg-[#00A859] text-white border border-black'
                : darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'inventory'
                ? 'bg-[#00A859] text-white border border-black'
                : darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'orders'
                ? 'bg-[#00A859] text-white border border-black'
                : darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </div>
            {pendingOrders.length > 0 && (
              <span className="bg-black text-white text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white/20">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('customers')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'customers'
                ? 'bg-[#00A859] text-white border border-black'
                : darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4" />
              <span>Customers CRM</span>
            </div>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-black/10 text-neutral-800">
              {customersList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'design'
                ? 'bg-[#00A859] text-white border border-black'
                : darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Store Design</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
              activeTab === 'settings'
                ? 'bg-[#00A859] text-white border border-black'
                : darkMode
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                : 'text-neutral-700 hover:text-black hover:bg-neutral-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* ── MOBILE TOP HORIZONTAL TAB SWITCHER ── */}
        <div className={`md:hidden flex items-center justify-between gap-1 p-1.5 rounded-2xl border ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-black'} overflow-x-auto hide-scrollbar`}>
          {[
            { id: 'home', label: 'Home', icon: Home },
            { id: 'inventory', label: 'Items', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'customers', label: 'CRM', icon: Users },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((t) => {
            const Icon = t.icon
            const isSel = activeTab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex-1 py-2 px-2.5 rounded-xl text-[11px] font-extrabold flex items-center justify-center gap-1.5 whitespace-nowrap border ${
                  isSel
                    ? 'bg-[#00A859] text-white border-black shadow-xs'
                    : 'border-transparent text-neutral-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* ── TAB CONTENTS ── */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* ════════════════════ TAB 1: HOME / OVERVIEW ════════════════════ */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fade-in">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className={`${cardClass} p-4 rounded-2xl space-y-1`}>
                  <p className="text-xs font-bold opacity-60">Total Sales</p>
                  <p className="text-lg md:text-xl font-black">₦{totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] font-bold opacity-60">{completedOrdersCount} orders completed</p>
                </div>

                <div className={`${cardClass} p-4 rounded-2xl space-y-1`}>
                  <p className="text-xs font-bold opacity-60">Total Orders</p>
                  <p className="text-lg md:text-xl font-black">{orders.length}</p>
                  <p className="text-[10px] font-bold text-[#00A859]">{pendingOrders.length} pending dispatch</p>
                </div>

                <div className={`${cardClass} p-4 rounded-2xl space-y-1`}>
                  <p className="text-xs font-bold opacity-60">Store Views</p>
                  <p className="text-lg md:text-xl font-black">{viewsCount}</p>
                  <p className="text-[10px] font-bold text-[#00A859]">+{viewsTodayCount} views today</p>
                </div>

                <div className={`${cardClass} p-4 rounded-2xl space-y-1`}>
                  <p className="text-xs font-bold opacity-60">WhatsApp Buyers</p>
                  <p className="text-lg md:text-xl font-black">{customersList.length}</p>
                  <p className="text-[10px] font-bold opacity-60">Unique contacts saved</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className={`${cardClass} p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3`}>
                <div>
                  <h3 className="font-black text-sm">Quick Actions</h3>
                  <p className="text-xs opacity-60">Manage your store in seconds</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    href="/dashboard/products/add"
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-black text-white border border-black rounded-xl text-xs font-bold hover:bg-neutral-900 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </Link>
                  <button
                    onClick={() => setShowBuyLinkModal(true)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 bg-white text-black border border-black rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>Story Buy Link</span>
                  </button>
                </div>
              </div>

              {/* Pending Orders Widget */}
              {pendingOrders.length > 0 && (
                <div className={`${cardClass} p-5 rounded-2xl space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#00A859]" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider">
                        {pendingOrders.length} Pending Order{pendingOrders.length !== 1 ? 's' : ''} Require Attention
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-[#00A859] hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingOrders.slice(0, 2).map((ord) => (
                      <div key={ord.id} className={`${subCardClass} p-3.5 rounded-xl text-xs space-y-2`}>
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold">#{ord.id.slice(0, 8).toUpperCase()}</span>
                          <span className="font-black">₦{Number(ord.total_price).toLocaleString()}</span>
                        </div>
                        <p className="font-bold truncate">{ord.customer_name || 'Customer'}</p>
                        <p className="text-[11px] opacity-60 truncate">{ord.delivery_address}</p>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'SHIPPED')}
                          className="w-full mt-1 bg-[#00A859] text-white font-black py-1.5 rounded-lg text-[11px] border border-black hover:opacity-90"
                        >
                          Mark as Shipped
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════════════════════ TAB 2: INVENTORY & BULK EDITOR ════════════════════ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl`}>
                <div>
                  <h2 className="font-black text-base">Inventory Management</h2>
                  <p className="text-xs opacity-60">View, search, edit stock & prices</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setShowBulkEditor(true)}
                    className="flex-1 sm:flex-initial px-3.5 py-2 bg-white text-black border border-black rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#00A859]" />
                    <span>Bulk Price & Stock Editor</span>
                  </button>

                  <Link
                    href="/dashboard/products/add"
                    className="flex-1 sm:flex-initial px-4 py-2 bg-[#00A859] text-white border border-black rounded-xl text-xs font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Product</span>
                  </Link>
                </div>
              </div>

              {/* Product Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none ${inputClass}`}
                />
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((p) => (
                    <div key={p.id} className={`${cardClass} rounded-2xl p-4 flex gap-3`}>
                      <div className="w-20 h-20 bg-white rounded-xl border border-black overflow-hidden shrink-0">
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover p-1" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs truncate">{p.name}</h4>
                          <p className="font-black text-xs mt-0.5">
                            ₦{Number(p.price).toLocaleString()}
                          </p>
                        </div>

                        {/* Quick Stock Buttons */}
                        <div className="flex items-center justify-between border-t border-black/10 pt-2 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-[11px] opacity-60 font-bold mr-1">Stock:</span>
                            <button
                              onClick={() => updateProductStock(p.id, -1)}
                              className="w-5 h-5 bg-white rounded text-black font-black hover:bg-neutral-100 flex items-center justify-center border border-black"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold px-1">{p.stock_quantity ?? 0}</span>
                            <button
                              onClick={() => updateProductStock(p.id, 1)}
                              className="w-5 h-5 bg-white rounded text-black font-black hover:bg-neutral-100 flex items-center justify-center border border-black"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-[10px] font-bold text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 3: ORDERS ════════════════════ */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl`}>
                <div>
                  <h2 className="font-black text-base">Customer Orders</h2>
                  <p className="text-xs opacity-60">Track and manage customer deliveries</p>
                </div>

                {/* Status Pipeline Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar w-full sm:w-auto">
                  {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border border-black transition-all whitespace-nowrap ${
                        orderFilter === st ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {orders
                  .filter((o) => (orderFilter === 'ALL' ? true : o.status === orderFilter))
                  .map((ord) => (
                    <div key={ord.id} className={`${cardClass} p-4 rounded-2xl space-y-3 text-xs`}>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm">
                            #{ord.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] opacity-60">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider border border-black ${
                              ord.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-900'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-100 text-blue-900'
                                : 'bg-[#00A859] text-white'
                            }`}
                          >
                            {ord.status}
                          </span>

                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className={`rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer ${inputClass}`}
                          >
                            <option value="PENDING">Set PENDING</option>
                            <option value="PAID">Set PAID</option>
                            <option value="SHIPPED">Set SHIPPED</option>
                            <option value="DELIVERED">Set DELIVERED</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        <div>
                          <p className="opacity-60 font-bold">Item:</p>
                          <p className="font-black text-sm">
                            {ord.products?.name || 'Product'} {ord.specification ? `(${ord.specification})` : ''}
                          </p>
                          <p className="font-black text-[#00A859] mt-0.5">
                            ₦{Number(ord.total_price).toLocaleString()} (x{ord.quantity})
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="opacity-60 font-bold">Customer Info:</p>
                          <p className="font-bold">{ord.customer_name || 'N/A'}</p>
                          <p className="opacity-80">Phone: {ord.customer_phone || 'N/A'}</p>
                          <p className="opacity-80">Address: {ord.delivery_address || 'N/A'}</p>
                          {ord.customer_note && (
                            <p className="text-amber-600 italic mt-1 font-medium">Note: &ldquo;{ord.customer_note}&rdquo;</p>
                          )}
                          {ord.payment_receipt_url && (
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => setViewReceiptUrl(ord.payment_receipt_url)}
                                className="px-3 py-1.5 bg-[#00A859] text-white border border-black rounded-xl font-black text-[11px] hover:opacity-90 flex items-center gap-1.5 shadow-2xs"
                              >
                                <Eye className="w-3.5 h-3.5" /> View Payment Receipt Proof
                              </button>
                              {ord.status === 'PENDING' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(ord.id, 'PAID')}
                                  className="px-3 py-1.5 bg-black text-white border border-black rounded-xl font-black text-[11px] hover:bg-neutral-900 flex items-center gap-1 shadow-2xs"
                                >
                                  <Check className="w-3.5 h-3.5 text-[#00A859]" /> Mark as Paid
                                </button>
                              )}
                            </div>
                          )}

                          {/* ── RELEASE LIVE TRACKING & 1-CLICK WHATSAPP TEMPLATES ── */}
                          <div className="pt-2.5 flex flex-wrap items-center gap-2 border-t border-black/10 mt-2">
                            {(() => {
                              const cleanCustomerPhone = (ord.customer_phone || '').replace(/[^0-9]/g, '').replace(/^0/, '234')
                              const trackingUrl = typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.host}/track/${ord.id}` : `/track/${ord.id}`
                              const orderRef = 'ORD-' + ord.id.slice(0, 8).toUpperCase()
                              const customerName = ord.customer_name || 'there'
                              const shopName = store?.store_name || 'our store'

                              const defaultMsg = `Hello ${customerName}! Your order #${orderRef} with ${shopName} is confirmed. You can track your order status live here:\n${trackingUrl}`

                              return (
                                <>
                                  {cleanCustomerPhone && cleanCustomerPhone.length > 5 ? (
                                    <a
                                      href={`https://wa.me/${cleanCustomerPhone}?text=${encodeURIComponent(defaultMsg)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-3 py-1.5 bg-[#25D366] text-white font-black text-[11px] rounded-xl flex items-center gap-1.5 hover:opacity-90 transition-all shadow-2xs"
                                    >
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <span>Send Tracking on WhatsApp</span>
                                    </a>
                                  ) : null}

                                  <Link
                                    href={`/dashboard/orders/${ord.id}`}
                                    className="px-3 py-1.5 bg-black text-white border border-black rounded-xl font-bold text-[11px] hover:bg-neutral-800 flex items-center gap-1.5 shadow-2xs"
                                  >
                                    <span>5 WhatsApp Templates →</span>
                                  </Link>

                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(trackingUrl)
                                      alert('Tracking URL copied: ' + trackingUrl)
                                    }}
                                    className="px-3 py-1.5 bg-white text-black border border-black rounded-xl font-bold text-[11px] hover:bg-neutral-100 flex items-center gap-1.5 shadow-2xs"
                                  >
                                    <Copy className="w-3.5 h-3.5 text-[#00A859]" />
                                    <span>Copy Link</span>
                                  </button>
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 4: CUSTOMERS CRM & WHATSAPP ORGANIZER ════════════════════ */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl`}>
                <div>
                  <h2 className="font-black text-base flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#00A859]" />
                    <span>WhatsApp Customers CRM</span>
                  </h2>
                  <p className="text-xs opacity-60">Auto-saved contacts of every customer who ordered from your store</p>
                </div>

                <button
                  onClick={handleCopyAllCustomerNumbers}
                  className="px-4 py-2 bg-white text-black border border-black rounded-xl text-xs font-black hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                >
                  {copiedAllNumbers ? <Check className="w-4 h-4 text-[#00A859]" /> : <Copy className="w-4 h-4 text-[#00A859]" />}
                  <span>{copiedAllNumbers ? 'Copied All Numbers!' : 'Copy All Numbers for Broadcast'}</span>
                </button>
              </div>

              {/* ── 📧 EMAIL MARKETING & NEWSLETTER BROADCAST STUDIO ── */}
              <div className={`${cardClass} p-5 rounded-2xl space-y-4 border-2 border-slate-200 dark:border-neutral-800`}>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-[#00A859]" />
                    <h3 className="text-xs font-black uppercase tracking-wider">Email Newsletter Broadcast Studio</h3>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    {emailSubscribers.length} Subscriber{emailSubscribers.length !== 1 ? 's' : ''} captured
                  </span>
                </div>

                <p className="text-[11px] opacity-70 leading-relaxed">
                  Compose an email announcement, promotion, or new drop alert to send to your newsletter subscribers.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-70">Email Subject Line</label>
                    <input
                      type="text"
                      placeholder="e.g. 🔥 Weekend Flash Sale — 10% Off All Items!"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${inputClass}`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider block mb-1 opacity-70">Message Body</label>
                    <textarea
                      rows={3}
                      placeholder="Type your announcement or offer here..."
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${inputClass} resize-none`}
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {(() => {
                      const allEmails = Array.from(
                        new Set(
                          emailSubscribers
                            .map((s) => s.email)
                            .filter((e) => e && e.includes('@'))
                        )
                      ).join(',')

                      return (
                        <>
                          <a
                            href={`mailto:?bcc=${encodeURIComponent(allEmails)}&subject=${encodeURIComponent(emailSubject || 'Special Announcement')}&body=${encodeURIComponent(emailBody || 'Check out our latest products at our store!')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-[#00A859] text-white border border-black rounded-xl text-xs font-black hover:opacity-90 transition-all flex items-center gap-1.5 shadow-2xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Launch Email Broadcast (BCC)</span>
                          </a>

                          <button
                            onClick={() => {
                              if (!allEmails) {
                                alert('No email subscribers captured yet. They will appear here when visitors join your storefront newsletter!')
                                return
                              }
                              navigator.clipboard.writeText(allEmails)
                              setCopiedEmails(true)
                              setTimeout(() => setCopiedEmails(false), 2000)
                            }}
                            className="px-4 py-2 bg-white text-black border border-black rounded-xl text-xs font-bold hover:bg-neutral-100 transition-colors flex items-center gap-1.5"
                          >
                            {copiedEmails ? <Check className="w-3.5 h-3.5 text-[#00A859]" /> : <Copy className="w-3.5 h-3.5 text-[#00A859]" />}
                            <span>{copiedEmails ? 'Copied Emails!' : 'Copy Subscriber Emails'}</span>
                          </button>
                        </>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Customer Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customers by name, phone, or address..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none ${inputClass}`}
                />
              </div>

              {/* Customers Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customersList
                  .filter(
                    (c) =>
                      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.phone.toLowerCase().includes(customerSearch.toLowerCase()) ||
                      c.address.toLowerCase().includes(customerSearch.toLowerCase())
                  )
                  .map((cust) => (
                    <div key={cust.id} className={`${cardClass} p-4 rounded-2xl space-y-3 text-xs`}>
                      <div className="flex items-start justify-between border-b border-black/10 pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center font-black text-sm border border-black">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-black text-sm">{cust.name}</h4>
                            <p className="text-[11px] font-mono font-bold text-[#00A859]">{cust.phone}</p>
                          </div>
                        </div>

                        <span className="bg-emerald-100 text-emerald-900 border border-black/20 text-[10px] font-black px-2 py-0.5 rounded-full">
                          {cust.totalOrders} Order{cust.totalOrders !== 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="opacity-60 block font-bold">Total Spent:</span>
                          <span className="font-black text-sm">₦{cust.totalSpent.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="opacity-60 block font-bold">Last Order:</span>
                          <span className="font-bold">{new Date(cust.lastOrderDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {cust.address && (
                        <div>
                          <span className="opacity-60 block font-bold">Saved Address:</span>
                          <p className="font-medium text-[11px] truncate">{cust.address}</p>
                        </div>
                      )}

                      {/* Quick 1-Click WhatsApp Buttons */}
                      <div className="pt-2 border-t border-black/10 flex flex-wrap gap-2">
                        {/* 1. Open Direct WhatsApp Chat */}
                        <a
                          href={`https://wa.me/${cust.cleanPhone}?text=${encodeURIComponent(`Hi ${cust.name}! Thanks for shopping with ${store?.store_name || 'us'}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[120px] bg-[#00A859] text-white border border-black py-2 px-2.5 rounded-xl font-black text-[11px] hover:opacity-90 flex items-center justify-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat on WhatsApp</span>
                        </a>

                        {/* 2. Send Dispatch Update */}
                        <a
                          href={`https://wa.me/${cust.cleanPhone}?text=${encodeURIComponent(`Hi ${cust.name}! Your order from ${store?.store_name || 'us'} is ready and being prepared for delivery!`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-white text-black border border-black py-2 px-2.5 rounded-xl font-bold text-[11px] hover:bg-neutral-100 flex items-center justify-center gap-1"
                          title="Send Dispatch Status Update"
                        >
                          <Send className="w-3.5 h-3.5 text-[#00A859]" />
                          <span>Send Update</span>
                        </a>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 5: STORE INFO & BRANDING ════════════════════ */}
          {activeTab === 'design' && (
            <div className="space-y-6 animate-fade-in">
              {/* Top Header */}
              <div className={`${cardClass} flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl`}>
                <div>
                  <h2 className="font-black text-base flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#00A859]" />
                    <span>Store Info & Branding</span>
                  </h2>
                  <p className="text-xs opacity-60">Manage your business profile, logo, banner, and delivery settings</p>
                </div>

                <button
                  onClick={handleSaveCustomization}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#00A859] text-white border border-black rounded-xl text-xs font-extrabold hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Store Info'}</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="bg-[#00A859] text-white border border-black p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Store settings saved successfully!</span>
                </div>
              )}

              {/* Templates & Customizer Teaser (Coming Soon) */}
              <div className={`${cardClass} p-4 rounded-2xl flex items-center justify-between gap-4 border border-black/10`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-[#00A859]">
                    <Palette className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-xs">Storefront Templates & Visual Studio</h4>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-0.5 rounded">
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-[11px] opacity-60">
                      Multi-theme templates and the full-screen visual studio will launch together in a dedicated upcoming update.
                    </p>
                  </div>
                </div>
              </div>

              {/* 1. Basic Identity & URL */}
                  <div className={`${cardClass} rounded-2xl p-5 space-y-4`}>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b border-black/10 pb-2">
                      1. Brand Identity & Store Link
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold opacity-80">Store Name</label>
                        <input
                          type="text"
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold ${inputClass}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold opacity-80">Store URL Slug</label>
                        <div className="flex items-center">
                          <span className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-r-0 border-black/20 rounded-l-xl text-xs font-mono opacity-70">
                            ondar.shop/
                          </span>
                          <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                            className={`flex-1 px-3 py-2 rounded-r-xl text-xs font-mono font-bold ${inputClass}`}
                          />
                        </div>
                      </div>

                      {/* Store Logo Box */}
                      <div className="space-y-1 md:col-span-2">
                        <label className="font-bold opacity-80">Store Logo</label>
                        <div className="flex items-center gap-3">
                          {logoUrl ? (
                            <div className="relative w-14 h-14 rounded-2xl border-2 border-black overflow-hidden bg-white shrink-0">
                              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                              <button
                                onClick={() => setLogoUrl('')}
                                className="absolute top-0.5 right-0.5 bg-black/80 text-white p-0.5 rounded-full"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-2xl border-2 border-dashed border-black/30 flex items-center justify-center bg-neutral-50 shrink-0">
                              <ImageIcon className="w-5 h-5 opacity-40" />
                            </div>
                          )}

                          <div className="flex-1 space-y-1">
                            <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-black text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-neutral-900 transition-colors">
                              <Upload className="w-3.5 h-3.5" />
                              <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo'}</span>
                              <input type="file" accept="image/*" onChange={handleLogoFileChange} className="hidden" />
                            </label>
                            <input
                              type="text"
                              placeholder="Or paste image URL..."
                              value={logoUrl}
                              onChange={(e) => setLogoUrl(e.target.value)}
                              className={`w-full px-3 py-1.5 rounded-lg text-[11px] font-mono ${inputClass}`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. Socials & Contact */}
                  <div className={`${cardClass} rounded-2xl p-5 space-y-4`}>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b border-black/10 pb-2">
                      2. WhatsApp & Social Handles
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <label className="font-bold opacity-80">WhatsApp Phone</label>
                        <input
                          type="tel"
                          placeholder="e.g. 08123456789"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold opacity-80">Instagram Handle</label>
                        <input
                          type="text"
                          placeholder="e.g. @yourstore"
                          value={instagramHandle}
                          onChange={(e) => setInstagramHandle(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold opacity-80">X / Twitter Handle</label>
                        <input
                          type="text"
                          placeholder="e.g. @yourstore"
                          value={twitterHandle}
                          onChange={(e) => setTwitterHandle(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold opacity-80">Dispatch Location / Hub</label>
                        <input
                          type="text"
                          placeholder="e.g. Ikeja, Lagos"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                      </div>

                      <div className="space-y-1 md:col-span-2">
                        <label className="font-bold opacity-80">Return & Exchange Policy</label>
                        <input
                          type="text"
                          placeholder="e.g. 7-day hassle-free exchange on all items"
                          value={returnPolicy}
                          onChange={(e) => setReturnPolicy(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. Regional Delivery Zones */}
                  <div className={`${cardClass} rounded-2xl p-5 space-y-4`}>
                    <h3 className="text-xs font-black uppercase tracking-wider border-b border-black/10 pb-2">
                      3. Regional Delivery Zones & Fees
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Zone Name (e.g. Within Lagos)"
                          value={newZoneName}
                          onChange={(e) => setNewZoneName(e.target.value)}
                          className={`flex-1 px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                        <input
                          type="number"
                          placeholder="Fee ₦ (0 for free)"
                          value={newZoneFee}
                          onChange={(e) => setNewZoneFee(e.target.value)}
                          className={`w-32 px-3 py-2 rounded-xl text-xs ${inputClass}`}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newZoneName) return
                            setDeliveryZones([...deliveryZones, { name: newZoneName, fee: Number(newZoneFee) || 0 }])
                            setNewZoneName('')
                            setNewZoneFee('')
                          }}
                          className="px-4 py-2 bg-black text-white border border-black rounded-xl text-xs font-bold hover:bg-neutral-900"
                        >
                          Add Zone
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {deliveryZones.map((z, idx) => (
                          <div key={idx} className={`${subCardClass} flex items-center justify-between p-2.5 rounded-xl text-xs`}>
                            <span className="font-bold">{z.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-[#00A859]">₦{z.fee.toLocaleString()}</span>
                              <button
                                onClick={() => setDeliveryZones(deliveryZones.filter((_, i) => i !== idx))}
                                className="text-red-600 hover:underline text-[11px] font-bold"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 6: SETTINGS ════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className={`${cardClass} flex items-center justify-between p-4 rounded-2xl`}>
                <div>
                  <h2 className="font-black text-base">Account & Payout Settings</h2>
                  <p className="text-xs opacity-60">Bank account for payouts & store credentials</p>
                </div>

                <button
                  onClick={handleSaveAccountSettings}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#00A859] text-white border border-black rounded-xl text-xs font-extrabold hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              {/* Store Identity & Subdomain */}
              <div className={`${cardClass} rounded-2xl p-5 space-y-4`}>
                <h3 className="text-xs font-black uppercase tracking-wider border-b border-black/10 pb-2">
                  Store Information & URL
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold opacity-80">Store Name</label>
                    <input
                      type="text"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold opacity-80">Store Slug / URL Subdomain</label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono ${inputClass}`}
                    />
                    <p className="text-[10px] opacity-60">Your store link: ondar.shop/{slug}</p>
                  </div>
                </div>
              </div>

              {/* Bank Details */}
              <div className={`${cardClass} rounded-2xl p-5 space-y-4`}>
                <h3 className="text-xs font-black uppercase tracking-wider border-b border-black/10 pb-2">
                  Bank Account for Direct Transfers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold opacity-80">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GTBank, Kuda, Zenith"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold opacity-80">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 0123456789"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs font-mono ${inputClass}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold opacity-80">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Simi Cole Enterprises"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      className={`w-full px-3 py-2 rounded-xl text-xs ${inputClass}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── STORY BUY LINK GENERATOR MODAL ── */}
      {showBuyLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`${cardClass} w-full max-w-md p-6 rounded-3xl space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00A859]" />
                <span>Story Buy Link Generator</span>
              </h3>
              <button onClick={() => setShowBuyLinkModal(false)} className="opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs opacity-70">
              Select a product to generate a 1-click buy link for your Instagram Stories or WhatsApp status.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold">Select Product:</label>
              <select
                onChange={(e) => {
                  const p = products.find((prod) => prod.id === e.target.value)
                  setSelectedProductForLink(p)
                }}
                className={`w-full px-3 py-2 rounded-xl text-xs outline-none ${inputClass}`}
              >
                <option value="">Choose product...</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₦{Number(p.price).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            {selectedProductForLink && (
              <div className={`${subCardClass} p-4 rounded-2xl space-y-3`}>
                <p className="text-xs font-bold opacity-70">1-Click Direct Buy URL:</p>
                <p className={`text-xs font-mono break-all p-2 rounded-lg ${inputClass}`}>
                  {typeof window !== 'undefined' ? `${window.location.origin}/${store?.slug}/checkout?product_id=${selectedProductForLink.id}` : ''}
                </p>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${store?.slug}/checkout?product_id=${selectedProductForLink.id}`
                    navigator.clipboard.writeText(url)
                    setCopiedLink(true)
                    setTimeout(() => setCopiedLink(false), 2000)
                  }}
                  className="w-full bg-[#00A859] text-white border border-black font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:opacity-90"
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? 'Copied to Clipboard!' : 'Copy Story Link'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── BULK PRICE & STOCK EDITOR MODAL ── */}
      {showBulkEditor && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className={`${cardClass} w-full max-w-2xl p-6 rounded-3xl space-y-4 max-h-[85vh] flex flex-col`}>
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#00A859]" />
                <span>Quick Bulk Price & Stock Editor</span>
              </h3>
              <button onClick={() => setShowBulkEditor(false)} className="opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {bulkProducts.map((bp, idx) => (
                <div key={bp.id} className={`${subCardClass} flex items-center justify-between p-3 rounded-xl text-xs gap-3`}>
                  <span className="font-bold truncate max-w-[200px]">{bp.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] opacity-60">Price ₦</span>
                      <input
                        type="number"
                        value={bp.price}
                        onChange={(e) => {
                          const updated = [...bulkProducts]
                          updated[idx].price = e.target.value
                          setBulkProducts(updated)
                        }}
                        className={`w-24 px-2 py-1 rounded-lg text-xs font-mono ${inputClass}`}
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] opacity-60">Stock</span>
                      <input
                        type="number"
                        value={bp.stock_quantity}
                        onChange={(e) => {
                          const updated = [...bulkProducts]
                          updated[idx].stock_quantity = e.target.value
                          setBulkProducts(updated)
                        }}
                        className={`w-16 px-2 py-1 rounded-lg text-xs font-mono ${inputClass}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveBulkEdits}
              disabled={bulkSaving}
              className="w-full bg-[#00A859] text-white border border-black font-black py-3 rounded-xl text-xs hover:opacity-90 flex items-center justify-center gap-2"
            >
              {bulkSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{bulkSaving ? 'Saving Bulk Edits...' : 'Save All Price & Stock Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── RECEIPT VIEWER MODAL ── */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-md">
          <div className={`${cardClass} w-full max-w-lg p-5 rounded-3xl space-y-4`}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Payment Receipt Proof</h3>
              <button onClick={() => setViewReceiptUrl(null)} className="opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className={`max-h-[70vh] overflow-y-auto rounded-xl p-2 flex items-center justify-center ${subCardClass}`}>
              <img src={viewReceiptUrl} alt="Receipt proof" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER CROPPER MODAL ── */}
      {showBannerCropper && rawBannerToCrop && (
        <BannerCropperModal
          imageSrc={rawBannerToCrop}
          isOpen={showBannerCropper}
          onClose={() => {
            setShowBannerCropper(false)
            setRawBannerToCrop(null)
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </div>
  )
}
