'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Clock, CheckCircle2, Package, Truck, XCircle, Download, Copy, MessageSquare, Laptop } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useRef } from 'react'
import Link from 'next/link'

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [receiptOrder, setReceiptOrder] = useState<any>(null)
  const [editingOrderForLink, setEditingOrderForLink] = useState<any>(null)
  const [customPrice, setCustomPrice] = useState<number>(0)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null)
  const receiptRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12) // A5
      
      gain.gain.setValueAtTime(0.2, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start()
      osc.stop(ctx.currentTime + 0.35)
    } catch (e) {
      console.warn("Chime play error:", e)
    }
  }

  useEffect(() => {
    async function fetchOrders() {

      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        const { data: store } = await supabase
          .from('stores')
          .select('id, store_name, logo_url, accent_color, slug')
          .eq('vendor_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (!store) {
          router.push('/onboarding/create-store')
          return
        }

        const { data: ordersData } = await supabase
          .from('orders')
          .select('*, products(name)')
          .eq('store_id', store.id)
          .order('created_at', { ascending: false })

        setStoreInfo(store)
        setOrders(ordersData as any[])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    if (!storeInfo?.id) return

    const channel = supabase
      .channel('dashboard-orders-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
          filter: `store_id=eq.${storeInfo.id}`
        },
        async (payload) => {
          // Play chime
          playChime()

          // Browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`New Order Placed! 🛍️`, {
              body: `An order of ₦${payload.new.total_price.toLocaleString()} has been received!`,
              icon: '/icon.png'
            })
          }

          // Fetch product name for the list item
          const { data: prod } = await supabase.from('products').select('name').eq('id', payload.new.product_id).single()
          const orderWithProduct = {
            ...payload.new,
            products: prod ? { name: prod.name } : null
          }

          // Prepend new order
          setOrders(prev => [orderWithProduct, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [storeInfo?.id])

  const handleCopyDetails = (order: any, cleanAddress: string) => {
    const details = `Order #${order.id.slice(0, 8)}\nItem: ${order.quantity}x ${order.products?.name} ${order.specification ? `(${order.specification})` : ''}\nTotal: ₦${order.total_price.toLocaleString()}\n\nCustomer: ${order.customer_name}\nPhone: ${order.customer_phone}\nInstagram: ${order.customer_instagram || 'N/A'}\nAddress: ${cleanAddress}`;
    navigator.clipboard.writeText(details);
    setCopiedOrderId(order.id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  }

  const handleStatusUpdate = async (order: any, newStatus: string) => {
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
    
    if (error) {
      alert("Error updating status: " + error.message)
      return
    }

    // Stock logic: Only change stock when moving TO or FROM CANCELLED status
    // Since stock is now decremented instantly upon order placement
    
    // Moving TO Cancelled from a non-cancelled state: Restore stock
    if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
      const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', order.product_id).single()
      if (product) {
        await supabase.from('products').update({ stock_quantity: product.stock_quantity + order.quantity }).eq('id', order.product_id)
      }
    }
    
    // Moving FROM Cancelled back to an active state: Re-decrement stock
    if (order.status === 'CANCELLED' && newStatus !== 'CANCELLED') {
      const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', order.product_id).single()
      if (product) {
        await supabase.from('products').update({ stock_quantity: Math.max(0, product.stock_quantity - order.quantity) }).eq('id', order.product_id)
      }
    }

      setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
  }

  const handleGenerateCheckoutLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOrderForLink) return

    // 1. Update order price in Supabase
    const { error } = await supabase
      .from('orders')
      .update({ total_price: customPrice })
      .eq('id', editingOrderForLink.id)

    if (error) {
      alert("Error updating order price: " + error.message)
      return
    }

    // 2. Generate link
    const link = `${window.location.protocol}//${window.location.host}/${storeInfo?.slug}/checkout?order_id=${editingOrderForLink.id}`
    setGeneratedLink(link)
    navigator.clipboard.writeText(link)

    // Update local orders list state
    setOrders(orders.map(o => o.id === editingOrderForLink.id ? { ...o, total_price: customPrice } : o))
  }

  const handleDownloadReceipt = (order: any) => {
    setReceiptOrder(order)
    // Wait for the DOM to render the hidden receipt
    setTimeout(async () => {
      if (receiptRef.current) {
        const canvas = await html2canvas(receiptRef.current, { 
          scale: 3, // High resolution
          useCORS: true, 
          backgroundColor: '#ffffff' 
        })
        const image = canvas.toDataURL('image/png')
        
        const a = document.createElement('a')
        a.href = image
        a.download = `Receipt_${order.id.slice(0, 8)}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        setReceiptOrder(null) // Hide it again
      }
    }, 150)
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-4 h-4 text-orange-500" />
      case 'PAID': return <CheckCircle2 className="w-4 h-4 text-blue-500" />
      case 'SHIPPED': return <Truck className="w-4 h-4 text-purple-500" />
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-500" />
      default: return null
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'PAID': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'SHIPPED': return 'bg-purple-50 text-purple-700 border-purple-200'
      case 'DELIVERED': return 'bg-green-50 text-green-700 border-green-200'
      case 'CANCELLED': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-slate-50 text-slate-700 border-slate-200'
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
      <header className="bg-white border-b border-border sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-primary-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-primary-900">Manage Orders</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-4">
        {orders.length > 0 ? (
          orders.map((order) => {
            const isDirect = order.delivery_address?.startsWith('[DIRECT]');
            const isWhatsApp = order.delivery_address?.startsWith('[WHATSAPP]');
            const checkoutMode = isDirect ? 'Direct' : (isWhatsApp ? 'Conversational' : null);
            const cleanAddress = order.delivery_address?.replace(/^\[(DIRECT|WHATSAPP)\]\s*/i, '') || '';

            return (
            <div key={order.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <Link href={`/dashboard/orders/${order.id}`} className="block hover:opacity-80 active:opacity-95 transition-opacity space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-primary-900">{order.products?.name}</h3>
                      <p className="text-xs text-secondary mt-0.5">
                        Order #{order.id.slice(0, 8)} • {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center gap-1.5 shrink-0 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status === 'SHIPPED' ? 'ASSIGNED' : order.status}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-border text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-secondary">Quantity</span>
                    <span className="font-medium text-primary-900">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Total Price</span>
                    <span className="font-bold text-primary-900">₦{order.total_price.toLocaleString()}</span>
                  </div>
                  {order.specification && (
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="text-secondary">Specification</span>
                      <span className="font-bold text-primary-900 text-right text-xs max-w-[200px]">{order.specification}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                    <span className="text-secondary">Customer</span>
                    <span className="font-medium text-primary-900 text-right">
                      {order.customer_name}<br/>
                      <span className="text-xs text-blue-600">{order.customer_phone}</span>
                    </span>
                  </div>
                  {cleanAddress && (
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                      <span className="text-secondary">Address</span>
                      <span className="font-medium text-primary-900 text-right text-xs max-w-[200px] truncate">
                        {cleanAddress}
                      </span>
                    </div>
                  )}
                </div>
              </Link>

              {/* Checkout Mode Badge */}
              {(checkoutMode || isDirect) && (
                <div className="flex items-center gap-2">
                  {checkoutMode && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${checkoutMode === 'Direct' ? 'bg-purple-100 text-purple-700' : 'bg-[#25D366]/10 text-[#25D366]'}`}>
                      {checkoutMode === 'Direct' ? <Laptop className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                      {checkoutMode} Checkout
                    </span>
                  )}
                  
                  {checkoutMode === 'Direct' && (
                    <button 
                      onClick={() => handleCopyDetails(order, cleanAddress)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-[10px] font-bold transition-colors"
                    >
                      {copiedOrderId === order.id ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      {copiedOrderId === order.id ? 'Copied!' : 'Copy Details'}
                    </button>
                  )}
                </div>
              )}

              <div className="pt-2 border-t border-border flex flex-wrap gap-2">
                {order.status === 'PENDING' && (
                  <button onClick={() => handleStatusUpdate(order, 'PAID')} className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors">
                    Mark as Paid
                  </button>
                )}
                {order.status === 'PAID' && (
                  <button onClick={() => handleStatusUpdate(order, 'SHIPPED')} className="flex-1 bg-purple-50 text-purple-700 py-2 rounded-lg text-sm font-bold hover:bg-purple-100 transition-colors">
                    Assign Delivery
                  </button>
                )}
                {order.status === 'SHIPPED' && (
                  <button onClick={() => handleStatusUpdate(order, 'DELIVERED')} className="flex-1 bg-green-50 text-green-700 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors">
                    Mark Delivered
                  </button>
                )}
                {order.status !== 'PENDING' && order.status !== 'CANCELLED' && (
                  <button onClick={() => handleStatusUpdate(order, 'PENDING')} className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                    Reset
                  </button>
                )}
                {(order.status !== 'DELIVERED' && order.status !== 'CANCELLED') && (
                  <button onClick={() => handleStatusUpdate(order, 'CANCELLED')} className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors mt-2">
                    Cancel Order
                  </button>
                )}
                
                {/* Download Receipt Button for non-pending and non-cancelled orders */}
                {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
                  <button 
                    onClick={() => handleDownloadReceipt(order)} 
                    className="w-full bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors mt-2 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Receipt
                  </button>
                )}

                <button 
                  onClick={() => {
                    setEditingOrderForLink(order)
                    setCustomPrice(order.total_price)
                    setGeneratedLink(null)
                  }}
                  className="w-full bg-amber-50 hover:bg-amber-100 text-amber-700 py-2 rounded-lg text-sm font-bold transition-colors mt-2 flex items-center justify-center gap-2 border border-amber-200"
                >
                  Create Checkout Link
                </button>
              </div>
            </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-primary-900">No orders yet</p>
              <p className="text-sm text-secondary">Share your store link to get sales!</p>
            </div>
          </div>
        )}
      </main>

      {/* Hidden Receipt Element (used only for generating the image) */}
      {receiptOrder && (
        <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none w-[400px]">
          <div ref={receiptRef} style={{ backgroundColor: '#ffffff', padding: '3.5rem 2.5rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', position: 'relative', width: '400px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: storeInfo?.accent_color || '#00A859' }}></div>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                {storeInfo?.logo_url ? (
                  <img src={storeInfo.logo_url} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #f1f5f9' }} alt="" />
                ) : (
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/icon.png" style={{ width: '24px', height: '24px' }} alt="" />
                  </div>
                )}
              </div>
              <h1 style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8', marginBottom: '0.75rem' }}>Official Receipt</h1>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1 }}>{storeInfo?.store_name || 'Store'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '1.5rem 0' }}>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Order Reference</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>#{receiptOrder.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Date Issued</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{new Date(receiptOrder.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Items Ordered</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{receiptOrder.products?.name}</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.4rem' }}>Quantity: {receiptOrder.quantity}</p>
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>₦{receiptOrder.total_price.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '1.5rem', padding: '1.75rem', marginBottom: '3rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: storeInfo?.accent_color || '#00A859', letterSpacing: '-0.02em' }}>₦{receiptOrder.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Thank you for your business!</p>
              {storeInfo?.instagram_handle && (
                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#db2777', marginBottom: '2rem' }}>
                  @{storeInfo.instagram_handle.replace('@', '')}
                </p>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <span style={{ height: '1px', flex: 1, backgroundColor: '#f1f5f9' }}></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <img src="/icon.png" style={{ width: '12px', height: '12px', opacity: 0.3 }} alt="" />
                  <span style={{ fontSize: '0.625rem', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Powered by Ondar</span>
                </div>
                <span style={{ height: '1px', flex: 1, backgroundColor: '#f1f5f9' }}></span>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Custom Checkout Link Modal */}
      {editingOrderForLink && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md p-6 rounded-3xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-100">
              <h3 className="font-bold text-primary-900">Custom Checkout Link</h3>
              <button 
                onClick={() => setEditingOrderForLink(null)} 
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {!generatedLink ? (
              <form onSubmit={handleGenerateCheckoutLink} className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs text-secondary leading-relaxed">
                    Set the negotiated discounted price for this order before generating the customer link.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary-900">Negotiated Total Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl text-xs active:scale-95 transition-all"
                >
                  Generate & Copy Link
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="p-3 bg-green-50 text-green-800 rounded-xl text-xs font-medium leading-relaxed border border-green-100">
                  🎉 Link generated and copied to clipboard! Send it to the customer on WhatsApp.
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-primary-900">Checkout URL</label>
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full px-3 py-2 bg-slate-50 border border-border rounded-xl text-[10px] font-mono outline-none select-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingOrderForLink(null)}
                    className="flex-1 bg-slate-900 hover:bg-black text-white font-bold py-3 rounded-xl text-xs"
                  >
                    Done
                  </button>
                  {editingOrderForLink.customer_phone && (
                    <a
                      href={`https://wa.me/${editingOrderForLink.customer_phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Here is your custom checkout link with the negotiated price: ${generatedLink}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5"
                    >
                      Send via WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
