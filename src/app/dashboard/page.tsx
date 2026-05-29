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
  Loader2
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [store, setStore] = useState<any>(null)
  const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 })
  const [loading, setLoading] = useState(true)
  const [ventText, setVentText] = useState('')
  const [ventSubmitting, setVentSubmitting] = useState(false)
  const [ventSubmitted, setVentSubmitted] = useState(false)
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

      setStats({
        products: productCount || 0,
        orders: orderCount || 0,
        revenue
      })

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative">
      {/* Top Nav */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src="/icon.png" alt="Ondar" className="w-8 h-8" />
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg text-primary-900 leading-none">Ondar</span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00A859]">
              • Early Access Beta
            </span>
          </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-secondary hover:text-accent transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 px-6 py-8 space-y-8 max-w-md mx-auto w-full pb-24">
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
        {(!store.whatsapp_number || stats.products === 0) && (
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
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${!store.whatsapp_number ? 'border-primary-100 bg-primary-50/30' : 'border-green-100 bg-green-50'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${!store.whatsapp_number ? 'bg-white text-primary-600 shadow-sm' : 'bg-green-500 text-white'}`}>
                  {!store.whatsapp_number ? <Plus className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                </div>
                <span className={`text-sm font-bold ${!store.whatsapp_number ? 'text-primary-900' : 'text-green-800'}`}>
                  {!store.whatsapp_number ? 'Connect WhatsApp Number' : 'WhatsApp Connected'}
                </span>
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
            {(!store.whatsapp_number || stats.products === 0) ? (
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
    </div>
  )
}
