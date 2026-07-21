'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import posthog from 'posthog-js'
import { 
  ShoppingBag, 
  Package, 
  Settings, 
  LogOut, 
  Plus, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Clock,
  Users,
  Share2,
  Check,
  Loader2,
  X
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null)
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [ventText, setVentText] = useState('')
  const [ventSubmitting, setVentSubmitting] = useState(false)
  const [ventSubmitted, setVentSubmitted] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  useEffect(() => {
    async function fetchData() {
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

      // Fetch Stats
      const { count: productCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeData.id)

      const { data: paidOrders } = await supabase
        .from('orders')
        .select('total_price')
        .eq('store_id', storeData.id)
        .in('status', ['PAID', 'SHIPPED', 'DELIVERED'])

      const revenue = paidOrders?.reduce((acc, curr) => acc + Number(curr.total_price), 0) || 0

      // Fetch Total Orders (All statuses)
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', storeData.id)

      // Fetch All Orders to evaluate reminders/notifications
      const { data: allOrders } = await supabase
        .from('orders')
        .select('*, products(name)')
        .eq('store_id', storeData.id)

      const calculatedNotifications = [
        {
          id: 'welcome',
          title: 'Direct checkout is live! ⚡',
          description: 'Your customers can now check out directly on the storefront without needing to redirect to WhatsApp.',
          time: 'System Update',
          type: 'info'
        }
      ]

      if (allOrders) {
        const now = new Date()
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

        // 1. Check for old pending orders (over 24h)
        const oldPending = allOrders.filter(o => o.status === 'PENDING' && new Date(o.created_at) < oneDayAgo)
        oldPending.forEach(o => {
          calculatedNotifications.push({
            id: `pending-${o.id}`,
            title: `Follow Up: Order #${o.id.slice(0, 8).toUpperCase()}`,
            description: `Order for ${o.products?.name || 'product'} has been pending for over 24h. Send them a negotiated checkout link to close the sale!`,
            time: new Date(o.created_at).toLocaleDateString(),
            type: 'warning'
          })
        })

        // 2. Check for new orders in the last 24h
        const newOrders = allOrders.filter(o => new Date(o.created_at) >= oneDayAgo)
        if (newOrders.length > 0) {
          calculatedNotifications.unshift({
            id: 'new-orders-summary',
            title: `🎉 ${newOrders.length} New Orders`,
            description: `You received ${newOrders.length} order(s) in the last 24 hours. Check your inventory sync status!`,
            time: 'Recent',
            type: 'success'
          })
        }
      }

      setStats({
        products: productCount || 0,
        orders: orderCount || 0,
        revenue
      })
      setNotifications(calculatedNotifications)
      setLoading(false)

      // Subscribe to real-time order updates
      const channelName = `realtime-orders-${storeData.id}-${Date.now()}`
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders',
            filter: `store_id=eq.${storeData.id}`,
          },
          (payload) => {
            setStats((prev) => ({
              ...prev,
              orders: prev.orders + 1,
            }))
            setPendingOrdersCount(prev => prev + 1)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    fetchData()
  }, [])

  const handleActivatePremium = async () => {
    if (!store) return
    setLoading(true)
    const { error } = await supabase
      .from('stores')
      .update({ subscription_status: 'ACTIVE' })
      .eq('id', store.id)
    if (!error) {
      setStore({ ...store, subscription_status: 'ACTIVE' })
    } else {
      alert("Error upgrading: " + error.message)
    }
    setLoading(false)
  }



  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleVentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ventText.trim()) return
    setVentSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('vents').insert({
        vendor_id: user.id,
        store_id: store?.id || null,
        content: ventText.trim(),
        route: window.location.pathname
      })
    }

    setVentSubmitting(false)
    setVentSubmitted(true)
    setVentText('')
  }

  const isTrial = store?.subscription_status === 'TRIAL'
  const trialEnds = store?.trial_ends_at ? new Date(store.trial_ends_at) : null
  const now = new Date()
  const trialEnded = isTrial && trialEnds && trialEnds < now
  const daysLeft = isTrial && trialEnds ? Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (trialEnded) {
    return (
      <div className="min-h-screen bg-[#0A0D14] flex flex-col justify-center items-center px-6 text-center text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
        
        <div className="w-full max-w-md bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30">
            <Clock className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-extrabold text-white">Your Trial Has Ended</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Ondar Premium keeps your online store active, processes WhatsApp checkout requests, and manages your real-time inventory sync.
            </p>
          </div>

          <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <p className="text-xs text-neutral-300"><span className="font-bold text-white">Unlimited orders</span> and WhatsApp cart syncing</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <p className="text-xs text-neutral-300"><span className="font-bold text-white">Automated PDF receipts</span> generated instantly</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-green-400 mt-0.5">✓</span>
              <p className="text-xs text-neutral-300"><span className="font-bold text-white">Live storefront hosting</span> on your custom link</p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleActivatePremium}
              className="w-full bg-primary-600 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-primary-600/30 hover:bg-primary-500 active:scale-95 transition-all text-sm"
            >
              Activate Premium (₦2,500/mo)
            </button>
            

            
            <button onClick={handleLogout} className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
              Log Out of Account
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative pb-24">
      {/* Top Nav */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Ondar" className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-primary-900 leading-none">Ondar</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Bell Icon */}
          <button 
            onClick={() => setShowNotifications(true)}
            className="p-2 text-secondary hover:text-primary-900 relative transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white font-black text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white">
                {notifications.length}
              </span>
            )}
          </button>
          
          <button onClick={handleLogout} className="p-2 text-secondary hover:text-accent transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Trial Countdown Banner */}
      {isTrial && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
          <p className="text-xs text-amber-800 font-medium">
            ⏳ Your free trial ends in <span className="font-bold">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>.
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleActivatePremium}
              className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider transition-all"
            >
              Upgrade
            </button>
          </div>
        </div>
      )}

      {/* Pending Orders Alert Banner */}
      {pendingOrdersCount > 0 && (
        <Link 
          href="/dashboard/orders" 
          className="bg-red-50 hover:bg-red-100 border-b border-red-200 px-6 py-3 flex items-center justify-between transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2 text-red-800 text-xs font-bold">
            <span className="text-sm">🚨</span>
            <span>You have {pendingOrdersCount} pending order(s) waiting for confirmation!</span>
          </div>
          <span className="text-red-600 text-[10px] font-extrabold hover:underline">
            Manage Orders ➔
          </span>
        </Link>
      )}

      <main className="flex-1 px-6 py-8 space-y-8 max-w-md mx-auto w-full pb-24">
        {/* PWA Install Prompt (Simple Banner) */}
        <div className="bg-gradient-to-r from-primary-900 to-primary-800 p-5 rounded-2xl shadow-lg flex items-center justify-between text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-10 opacity-10">
            <ShoppingBag className="w-24 h-24" />
          </div>
          <div className="space-y-1 relative z-10">
            <h3 className="font-display font-bold text-sm">Get the Ondar App</h3>
            <p className="text-[11px] text-primary-100 max-w-[180px] leading-relaxed">
              Install Ondar on your phone for faster access to your store.
            </p>
          </div>
          <button 
            onClick={async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt()
                const { outcome } = await deferredPrompt.userChoice
                console.log(`User installation decision: ${outcome}`)
                setDeferredPrompt(null)
              } else {
                alert('To install the app:\n\n📱 iOS (iPhone):\nTap the Share button at the bottom of Safari, then scroll down and tap "Add to Home Screen".\n\n🤖 Android / Chrome:\nTap the 3 dots menu at the top right of Chrome, then tap "Add to Home screen" or "Install App".')
              }
            }}
            className="bg-white text-primary-900 text-[11px] font-extrabold px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-all whitespace-nowrap relative z-10"
          >
            Install App
          </button>
        </div>

        {/* Venting Card: What's stressing you? */}
        <div className="bg-white p-6 rounded-2xl border-2 border-primary-100 shadow-md space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary-600" />
          <div className="space-y-1">
            <h3 className="font-display font-bold text-lg text-primary-900">What’s stressing you?</h3>
            <p className="text-xs text-secondary leading-relaxed">
              Vent freely. Tell us what feels frustrating, stressful, confusing, or annoying while selling online or using Ondar.
            </p>
          </div>

          {ventSubmitted ? (
            <div className="bg-green-50 border border-green-100 p-4 rounded-xl text-green-800 text-xs font-medium leading-relaxed animate-fade-in">
              Thanks for the honesty. Ondar is improving from real vendor experiences.
            </div>
          ) : (
            <form onSubmit={handleVentSubmit} className="space-y-3">
              <textarea
                rows={3}
                required
                value={ventText}
                onChange={(e) => setVentText(e.target.value)}
                placeholder="What annoyed you today?"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none resize-none text-xs text-slate-900 placeholder:text-slate-400"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={ventSubmitting}
                  className="bg-primary-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 hover:bg-primary-700 active:scale-95 transition-all shadow-md shadow-primary-600/10"
                >
                  {ventSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tell Ondar"}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Setup Checklist */}
        {(!store.whatsapp_number || !store.logo_url || stats.products === 0) && (
          <div className="bg-white rounded-3xl border-2 border-primary-100 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-primary-900">Finish Your Setup</h3>
                <p className="text-xs text-secondary font-medium">Your store is hidden until these are done</p>
              </div>
              <div className="bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                Action Required
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href="/dashboard/settings"
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${(!store.whatsapp_number || !store.logo_url) ? 'border-primary-100 bg-primary-50/30' : 'border-green-100 bg-green-50'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(!store.whatsapp_number || !store.logo_url) ? 'bg-white text-primary-600 shadow-sm' : 'bg-green-500 text-white'}`}>
                  {(!store.whatsapp_number || !store.logo_url) ? <Plus className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-bold ${(!store.whatsapp_number || !store.logo_url) ? 'text-primary-900' : 'text-green-800'}`}>
                    Store Profile & WhatsApp
                  </span>
                  {(!store.whatsapp_number || !store.logo_url) && (
                    <span className="text-[10px] text-secondary">
                      {!store.logo_url && !store.whatsapp_number ? 'Add your logo and connect WhatsApp' : !store.logo_url ? 'Add your store logo' : 'Connect your WhatsApp number'}
                    </span>
                  )}
                </div>
              </Link>

              <Link 
                href="/dashboard/products/add"
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${stats.products === 0 ? 'border-primary-100 bg-primary-50/30' : 'border-green-100 bg-green-50'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stats.products === 0 ? 'bg-white text-primary-600 shadow-sm' : 'bg-green-500 text-white'}`}>
                  {stats.products === 0 ? <Plus className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-bold ${stats.products === 0 ? 'text-primary-900' : 'text-green-800'}`}>
                  {stats.products === 0 ? 'Add your first product' : 'First product added'}
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Store Header */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center overflow-hidden border-2 border-primary-100">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.store_name} className="w-full h-full object-cover" />
            ) : (
              <Package className="w-10 h-10 text-primary-400" />
            )}
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-bold text-primary-900">
              {store.store_name}
            </h2>
            <p className="text-secondary text-sm font-medium">
              {typeof window !== 'undefined' ? window.location.host : ''}/{store.slug}
            </p>
            {(!store.whatsapp_number || !store.logo_url || stats.products === 0) ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                <Clock className="w-3 h-3" /> Incomplete Setup
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-green-100">
                <Check className="w-3 h-3" /> Store Live
              </span>
            )}
          </div>
          
          <div className="flex w-full gap-3">
            <button 
              onClick={() => {
                const url = `https://${window.location.host}/${store.slug}`
                navigator.clipboard.writeText(url)
                alert('Store link copied!')
              }}
              className="flex-1 bg-slate-50 text-slate-700 py-2.5 rounded-xl text-sm font-bold border border-slate-200 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
            >
              Copy Link
            </button>
            <Link 
              href={`/${store.slug}`}
              target="_blank"
              className="flex-1 bg-primary-600 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary-600/20"
            >
              View Store
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Auto-Reply Template */}
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary-900 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-green-500" /> WhatsApp Auto-Reply
            </h3>
            <button
              onClick={() => {
                const message = `Hello! Welcome to ${store.store_name}. 🛍️\n\nPlease view our available products and prices here:\nhttps://${window.location.host}/${store.slug}\n\nLet me know what you'd like to order!`;
                navigator.clipboard.writeText(message);
                alert('Auto-reply message copied!');
              }}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              Copy Message
            </button>
          </div>
          <p className="text-xs text-secondary leading-relaxed">
            Paste this into your WhatsApp Business app (Settings &gt; Business tools &gt; Greeting message).
          </p>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap font-medium">
            {`Hello! Welcome to ${store.store_name}. 🛍️\n\nPlease view our available products and prices here:\nhttps://${typeof window !== 'undefined' ? window.location.host : ''}/${store.slug}\n\nLet me know what you'd like to order!`}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-2">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-secondary font-bold">Total Sales</p>
              <p className="text-xl font-display font-extrabold text-primary-900">
                ₦{stats.revenue.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-secondary font-bold">Orders</p>
              <p className="text-xl font-display font-extrabold text-primary-900">
                {stats.orders}
              </p>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-widest text-secondary font-bold">Management</h3>
          
          <Link href="/dashboard/products" className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm active:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-primary-900">Inventory</p>
                <p className="text-xs text-secondary">{stats.products} products listed</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
          </Link>

          <Link href="/dashboard/orders" className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm active:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/5 text-accent rounded-xl flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-primary-900">Manage Orders</p>
                <p className="text-xs text-secondary">Check WhatsApp order inquiries</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
          </Link>

          <Link href="/dashboard/customers" className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm active:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-primary-900">Customer Memory</p>
                <p className="text-xs text-secondary">Your basic CRM & history</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
          </Link>

          <Link href="/dashboard/settings" className="group flex items-center justify-between bg-white p-4 rounded-2xl border border-border shadow-sm active:bg-slate-50 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-primary-900">Store Settings</p>
                <p className="text-xs text-secondary">Store branding & WhatsApp</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary-600 transition-colors" />
          </Link>
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20">
        <Link 
          href="/dashboard/products/add"
          className="bg-primary-600 text-white px-6 py-4 rounded-full shadow-2xl shadow-primary-600/40 flex items-center gap-2 font-bold active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl animate-slide-in">
            {/* Header */}
            <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-lg">Platform Alerts</span>
              </div>
              <button 
                onClick={() => setShowNotifications(false)} 
                className="p-2 -mr-2 rounded-full hover:bg-neutral-50 text-neutral-400 hover:text-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
                  <p className="font-bold text-neutral-500">All caught up! No notifications.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-4 rounded-2xl border text-left space-y-1.5 transition-all shadow-sm ${
                      n.type === 'warning' ? 'bg-amber-50/50 border-amber-200 text-amber-900' :
                      n.type === 'success' ? 'bg-green-50/50 border-green-200 text-green-900' :
                      'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-xs">{n.title}</h4>
                      <span className="text-[9px] text-neutral-400 font-bold shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">{n.description}</p>
                    {n.type === 'warning' && (
                      <Link 
                        href="/dashboard/orders" 
                        onClick={() => setShowNotifications(false)}
                        className="inline-block text-[10px] font-black text-amber-700 underline mt-1"
                      >
                        Go to Orders Panel
                      </Link>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
