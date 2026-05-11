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
  Share2
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null)
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [isExpired, setIsExpired] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
        .single()

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

      setStats({
        products: productCount || 0,
        orders: orderCount || 0,
        revenue
      })

      // Subscription check
      const trialEnds = storeData.trial_ends_at ? new Date(storeData.trial_ends_at) : null;
      const expiredStatus = !!(trialEnds && trialEnds < new Date() && storeData.subscription_status !== 'PAID');
      setIsExpired(expiredStatus);

      if (expiredStatus) {
        posthog.capture('trial_expired_view', { store_id: storeData.id })
      }

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
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Trial Expired Overlay */}
      {isExpired && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/95 backdrop-blur-md flex items-center justify-center p-6 text-center">
          <div className="max-w-xs w-full bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="w-20 h-20 bg-accent/10 text-accent rounded-full flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-display font-bold text-primary-900">Trial Expired</h2>
              <p className="text-sm text-secondary leading-relaxed">
                Your 7-day free trial has ended. To continue managing your store and receiving orders, please subscribe for <b>₦1,500 / month</b>.
              </p>
            </div>
            <a 
              href={`https://wa.me/2348058424520?text=Hi Ondar Team, I want to pay for my subscription for ${store.store_name} (ID: ${store.id})`}
              className="block w-full bg-primary-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all"
            >
              Pay Now via WhatsApp
            </a>
            <button 
              onClick={handleLogout}
              className="block w-full text-secondary text-sm font-bold hover:text-primary-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
      {/* Top Nav */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Ondar" className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-primary-900 leading-none">Ondar</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${store?.subscription_status === 'PAID' ? 'text-green-600' : 'text-accent'}`}>
              {store?.subscription_status === 'PAID' ? '• Pro Account' : '• 7-Day Free Trial'}
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-secondary hover:text-accent transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

        {/* Setup Checklist */}
        {(!store.bank_name || !store.bank_account_number || !store.whatsapp_number || stats.products === 0) && (
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
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${(!store.bank_name || !store.bank_account_number) ? 'border-primary-100 bg-primary-50/30' : 'border-slate-50 bg-slate-50/50 opacity-60'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${(!store.bank_name || !store.bank_account_number) ? 'bg-white text-primary-600 shadow-sm' : 'bg-green-500 text-white'}`}>
                  {(!store.bank_name || !store.bank_account_number) ? <Plus className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-bold text-primary-900">Add Bank Transfer Details</span>
              </Link>

              <Link 
                href="/dashboard/settings"
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${!store.whatsapp_number ? 'border-primary-100 bg-primary-50/30' : 'border-slate-50 bg-slate-50/50 opacity-60'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${!store.whatsapp_number ? 'bg-white text-primary-600 shadow-sm' : 'bg-green-500 text-white'}`}>
                  {!store.whatsapp_number ? <Plus className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-bold text-primary-900">Connect WhatsApp Number</span>
              </Link>

              <Link 
                href="/dashboard/products/add"
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${stats.products === 0 ? 'border-primary-100 bg-primary-50/30' : 'border-slate-50 bg-slate-50/50 opacity-60'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${stats.products === 0 ? 'bg-white text-primary-600 shadow-sm' : 'bg-green-500 text-white'}`}>
                  {stats.products === 0 ? <Plus className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                </div>
                <span className="text-sm font-bold text-primary-900">Add your first product</span>
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
          </div>
          
          <div className="flex w-full gap-3">
            <button 
              onClick={() => {
                const url = `${window.location.host}/${store.slug}`
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
                <p className="text-xs text-secondary">Check payments & shipping</p>
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
                <p className="text-xs text-secondary">Bank info & branding</p>
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
    </div>
  )
}
