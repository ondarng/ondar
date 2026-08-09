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
  TrendingUp,
  Users,
  AlertCircle,
  Truck,
  CheckCircle,
  Clock,
  Save,
  Loader2,
  LogOut,
  X,
  Upload,
  Link as LinkIcon,
  Sparkles,
  DollarSign,
  ChevronRight,
  RefreshCw,
  Search,
} from 'lucide-react'
import Link from 'next/link'

export default function RedesignedDashboardPage() {
  const [activeTab, setActiveTab] = useState<'home' | 'inventory' | 'orders' | 'design' | 'settings'>('home')

  const [store, setStore] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [viewsCount, setViewsCount] = useState(0)
  const [viewsTodayCount, setViewsTodayCount] = useState(0)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
  const [newBadge, setNewBadge] = useState('')

  // Regional Delivery Zones
  const [deliveryZones, setDeliveryZones] = useState<Array<{ name: string; fee: number }>>([])
  const [newZoneName, setNewZoneName] = useState('')
  const [newZoneFee, setNewZoneFee] = useState('')

  // Account Settings Form
  const [bankName, setBankName] = useState('')
  const [bankAccountNumber, setBankAccountNumber] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [slug, setSlug] = useState('')

  const router = useRouter()
  const supabase = createClient()

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

      } catch (err) {
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'PENDING')
  const completedOrdersCount = orders.filter((o) => o.status === 'DELIVERED' || o.status === 'PAID').length

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

  // Save Store Customization
  const handleSaveCustomization = async () => {
    if (!store) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('stores')
        .update({
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
        })
        .eq('id', store.id)

      if (error) throw error

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } catch (err: any) {
      alert('Error saving customization: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  // Save Account Settings
  const handleSaveAccountSettings = async () => {
    if (!store) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('stores')
        .update({
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          bank_account_name: bankAccountName,
          slug,
        })
        .eq('id', store.id)

      if (error) throw error

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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* ── TOP HEADER ── */}
      <header className="bg-slate-900 border-b border-slate-800/80 sticky top-0 z-40 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          {store?.logo_url ? (
            <img src={store.logo_url} alt={store.store_name} className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-700" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-sm shadow">
              {store?.store_name?.charAt(0) || 'O'}
            </div>
          )}
          <div>
            <h1 className="font-black text-white text-sm tracking-tight leading-none">{store?.store_name}</h1>
            <a
              href={`/${store?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-1 mt-0.5"
            >
              <span>ondar.shop/{store?.slug}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBuyLinkModal(true)}
            className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-extrabold hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Story Buy Link</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT WITH TAB NAVIGATION ── */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row gap-6">
        {/* ── SIDEBAR / TAB NAVIGATION ── */}
        <nav className="w-full md:w-56 shrink-0 flex md:flex-col gap-1.5 bg-slate-900/90 p-2 rounded-2xl border border-slate-800/80 overflow-x-auto hide-scrollbar sticky top-20 z-30">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'home'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'inventory'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders</span>
            </div>
            {pendingOrders.length > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('design')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'design'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Store Design</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </nav>

        {/* ── TAB CONTENTS ── */}
        <main className="flex-1 min-w-0 space-y-6">

          {/* ════════════════════ TAB 1: HOME / OVERVIEW ════════════════════ */}
          {activeTab === 'home' && (
            <div className="space-y-6 animate-fade-in">
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Sales</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-xl font-black text-white">₦{totalRevenue.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500">{completedOrdersCount} orders completed</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Total Orders</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="text-xl font-black text-white">{orders.length}</p>
                  <p className="text-[10px] text-amber-400 font-bold">{pendingOrders.length} pending dispatch</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Store Views</span>
                    <Eye className="w-4 h-4 text-purple-400" />
                  </div>
                  <p className="text-xl font-black text-white">{viewsCount}</p>
                  <p className="text-[10px] text-emerald-400 font-bold">+{viewsTodayCount} views today</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-slate-400 text-xs">
                    <span>Active Products</span>
                    <Package className="w-4 h-4 text-amber-400" />
                  </div>
                  <p className="text-xl font-black text-white">{products.length}</p>
                  <p className="text-[10px] text-slate-500">In your catalog</p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Quick Actions</h3>
                  <p className="text-xs text-slate-400">Manage your store in seconds</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/dashboard/products/add"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </Link>
                  <button
                    onClick={() => setShowBuyLinkModal(true)}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Generate Story Buy Link</span>
                  </button>
                </div>
              </div>

              {/* Pending Orders Widget */}
              {pendingOrders.length > 0 && (
                <div className="bg-slate-900 border border-amber-500/30 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300">
                        {pendingOrders.length} Pending Order{pendingOrders.length !== 1 ? 's' : ''} Require Attention
                      </h3>
                    </div>
                    <button
                      onClick={() => setActiveTab('orders')}
                      className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <span>View All</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pendingOrders.slice(0, 2).map((ord) => (
                      <div key={ord.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="font-mono font-bold text-emerald-400">#{ord.id.slice(0, 8).toUpperCase()}</span>
                          <span className="font-black text-white">₦{Number(ord.total_price).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-300 font-bold truncate">{ord.customer_name || 'Customer'}</p>
                        <p className="text-[11px] text-slate-500 truncate">{ord.delivery_address}</p>
                        <button
                          onClick={() => handleUpdateOrderStatus(ord.id, 'SHIPPED')}
                          className="w-full mt-1 bg-amber-500 text-slate-950 font-black py-1.5 rounded-lg text-[11px] hover:bg-amber-400"
                        >
                          Mark as Shipped
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalog Snapshot */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-white">Catalog Inventory</h3>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className="text-xs font-bold text-emerald-400 hover:underline"
                  >
                    Manage Inventory →
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {products.slice(0, 4).map((p) => (
                    <div key={p.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                      <div className="w-full aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-800">
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover p-1" />
                      </div>
                      <p className="font-bold text-white truncate">{p.name}</p>
                      <p className="font-black text-emerald-400">₦{Number(p.price).toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">Stock: {p.stock_quantity ?? 0}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 2: INVENTORY & BULK EDITOR ════════════════════ */}
          {activeTab === 'inventory' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="font-black text-white text-base">Inventory Management</h2>
                  <p className="text-xs text-slate-400">View, search, edit stock & prices</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBulkEditor(true)}
                    className="px-3.5 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Quick Bulk Price & Stock Editor</span>
                  </button>

                  <Link
                    href="/dashboard/products/add"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors flex items-center gap-1.5"
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {/* Product Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products
                  .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                  .map((p) => (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-3">
                      <div className="w-20 h-20 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shrink-0">
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover p-1" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-xs text-white truncate">{p.name}</h4>
                          <p className="font-black text-emerald-400 text-xs mt-0.5">
                            ₦{Number(p.price).toLocaleString()}
                          </p>
                        </div>

                        {/* Quick Stock Buttons */}
                        <div className="flex items-center justify-between border-t border-slate-800 pt-2 mt-2">
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-[11px] text-slate-500 font-bold mr-1">Stock:</span>
                            <button
                              onClick={() => updateProductStock(p.id, -1)}
                              className="w-5 h-5 bg-slate-800 rounded text-slate-300 font-black hover:bg-slate-700 flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold text-white px-1">{p.stock_quantity ?? 0}</span>
                            <button
                              onClick={() => updateProductStock(p.id, 1)}
                              className="w-5 h-5 bg-slate-800 rounded text-slate-300 font-black hover:bg-slate-700 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="text-[10px] font-bold text-red-400 hover:underline"
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
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="font-black text-white text-base">Customer Orders</h2>
                  <p className="text-xs text-slate-400">Track and manage customer deliveries</p>
                </div>

                {/* Status Pipeline Filter */}
                <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
                  {['ALL', 'PENDING', 'PAID', 'SHIPPED', 'DELIVERED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                        orderFilter === st ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
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
                    <div key={ord.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-emerald-400 text-sm">
                            #{ord.id.slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-md font-black text-[10px] uppercase tracking-wider ${
                              ord.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : ord.status === 'SHIPPED'
                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {ord.status}
                          </span>

                          <select
                            value={ord.status}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white rounded-lg px-2 py-1 text-[11px] font-bold outline-none cursor-pointer"
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
                          <p className="text-slate-400 font-bold">Item:</p>
                          <p className="font-black text-white text-sm">
                            {ord.products?.name || 'Product'} {ord.specification ? `(${ord.specification})` : ''}
                          </p>
                          <p className="font-black text-emerald-400 mt-0.5">
                            ₦{Number(ord.total_price).toLocaleString()} (x{ord.quantity})
                          </p>
                        </div>

                        <div className="space-y-1">
                          <p className="text-slate-400 font-bold">Customer Info:</p>
                          <p className="text-white font-bold">{ord.customer_name || 'N/A'}</p>
                          <p className="text-slate-400">Phone: {ord.customer_phone || 'N/A'}</p>
                          <p className="text-slate-400">Address: {ord.delivery_address || 'N/A'}</p>
                          {ord.customer_note && (
                            <p className="text-amber-400 italic mt-1">Note: &ldquo;{ord.customer_note}&rdquo;</p>
                          )}
                          {ord.payment_receipt_url && (
                            <button
                              onClick={() => setViewReceiptUrl(ord.payment_receipt_url)}
                              className="mt-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-lg font-bold text-[11px] hover:bg-emerald-500/30 flex items-center gap-1"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Payment Receipt Proof
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ════════════════════ TAB 4: STORE CUSTOMIZATION (DESIGN) ════════════════════ */}
          {activeTab === 'design' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="font-black text-white text-base">Store Design & Branding</h2>
                  <p className="text-xs text-slate-400">Customize how your public storefront looks</p>
                </div>

                <button
                  onClick={handleSaveCustomization}
                  disabled={saving}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Design'}</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Store design saved successfully!</span>
                </div>
              )}

              {/* Branding Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                  1. Brand Media & Banners
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Logo Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Hero Banner Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={heroBannerUrl}
                      onChange={(e) => setHeroBannerUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Colors & Announcement Bar */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                  2. Colors & Announcement Bar
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Brand Accent Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded-lg"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Footer Background Color</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={footerBgColor}
                        onChange={(e) => setFooterBgColor(e.target.value)}
                        className="w-9 h-9 bg-transparent border-0 cursor-pointer rounded-lg"
                      />
                      <input
                        type="text"
                        value={footerBgColor}
                        onChange={(e) => setFooterBgColor(e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 md:col-span-1">
                    <label className="font-bold text-slate-300">Top Announcement Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Free delivery on orders over ₦50,000!"
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Regional Delivery Zones */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                  3. Regional Delivery Zones
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Zone Name (e.g. Within Lagos)"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Fee ₦ (0 for free)"
                      value={newZoneFee}
                      onChange={(e) => setNewZoneFee(e.target.value)}
                      className="w-32 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newZoneName) return
                        setDeliveryZones([...deliveryZones, { name: newZoneName, fee: Number(newZoneFee) || 0 }])
                        setNewZoneName('')
                        setNewZoneFee('')
                      }}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600"
                    >
                      Add Zone
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {deliveryZones.map((z, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                        <span className="font-bold text-white">{z.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-emerald-400">₦{z.fee.toLocaleString()}</span>
                          <button
                            onClick={() => setDeliveryZones(deliveryZones.filter((_, i) => i !== idx))}
                            className="text-red-400 hover:underline text-[11px]"
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

          {/* ════════════════════ TAB 5: SETTINGS ════════════════════ */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="font-black text-white text-base">Account & Payout Settings</h2>
                  <p className="text-xs text-slate-400">Bank account for payouts & store credentials</p>
                </div>

                <button
                  onClick={handleSaveAccountSettings}
                  disabled={saving}
                  className="px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-600 transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider border-b border-slate-800 pb-2">
                  Bank Account for Direct Transfers
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. GTBank, Kuda, Zenith"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 0123456789"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-300">Account Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Simi Cole Enterprises"
                      value={bankAccountName}
                      onChange={(e) => setBankAccountName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none focus:ring-1 focus:ring-emerald-500"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>Story Buy Link Generator</span>
              </h3>
              <button onClick={() => setShowBuyLinkModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Select a product to generate a 1-click buy link for your Instagram Stories or WhatsApp status.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Select Product:</label>
              <select
                onChange={(e) => {
                  const p = products.find((prod) => prod.id === e.target.value)
                  setSelectedProductForLink(p)
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white outline-none"
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
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <p className="text-xs text-slate-400 font-bold">1-Click Direct Buy URL:</p>
                <p className="text-xs font-mono text-emerald-400 break-all bg-slate-900 p-2 rounded-lg border border-slate-800">
                  {typeof window !== 'undefined' ? `${window.location.origin}/${store?.slug}/checkout?product_id=${selectedProductForLink.id}` : ''}
                </p>
                <button
                  onClick={() => {
                    const url = `${window.location.origin}/${store?.slug}/checkout?product_id=${selectedProductForLink.id}`
                    navigator.clipboard.writeText(url)
                    setCopiedLink(true)
                    setTimeout(() => setCopiedLink(false), 2000)
                  }}
                  className="w-full bg-emerald-500 text-white font-extrabold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-emerald-600"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl p-6 rounded-3xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                <span>Quick Bulk Price & Stock Editor</span>
              </h3>
              <button onClick={() => setShowBulkEditor(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {bulkProducts.map((bp, idx) => (
                <div key={bp.id} className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs gap-3">
                  <span className="font-bold text-white truncate max-w-[200px]">{bp.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-[11px]">Price ₦</span>
                      <input
                        type="number"
                        value={bp.price}
                        onChange={(e) => {
                          const updated = [...bulkProducts]
                          updated[idx].price = e.target.value
                          setBulkProducts(updated)
                        }}
                        className="w-24 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-[11px]">Stock</span>
                      <input
                        type="number"
                        value={bp.stock_quantity}
                        onChange={(e) => {
                          const updated = [...bulkProducts]
                          updated[idx].stock_quantity = e.target.value
                          setBulkProducts(updated)
                        }}
                        className="w-16 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleSaveBulkEdits}
              disabled={bulkSaving}
              className="w-full bg-emerald-500 text-white font-black py-3 rounded-xl text-xs hover:bg-emerald-600 flex items-center justify-center gap-2 shadow-md"
            >
              {bulkSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{bulkSaving ? 'Saving Bulk Edits...' : 'Save All Price & Stock Changes'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ── RECEIPT VIEWER MODAL ── */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg p-5 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Payment Receipt Proof</h3>
              <button onClick={() => setViewReceiptUrl(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
              <img src={viewReceiptUrl} alt="Receipt proof" className="max-w-full h-auto object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
