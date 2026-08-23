'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Clock, CheckCircle2, Truck, XCircle, Download, Copy, MessageSquare, Laptop, Check } from 'lucide-react'
import html2canvas from 'html2canvas'
import Link from 'next/link'

export default function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Array.isArray(id) ? id[0] : id

  const [order, setOrder] = useState<any>(null)
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [receiptDownloading, setReceiptDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [vendorNotes, setVendorNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  
  const receiptRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/login')
          return
        }

        // Fetch order detail
        const { data: orderData, error: orderErr } = await supabase
          .from('orders')
          .select('*, products(*), stores(*)')
          .eq('id', orderId)
          .single()

        if (orderErr || !orderData) {
          console.error(orderErr)
          router.push('/dashboard/orders')
          return
        }

        // Verify ownership
        if (orderData.stores?.vendor_id !== user.id) {
          router.push('/dashboard/orders')
          return
        }

        setOrder(orderData)
        setStoreInfo(orderData.stores)
        setVendorNotes(orderData.vendor_notes || '')
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  const handleCopyDetails = () => {
    const isDirect = order.delivery_address?.startsWith('[DIRECT]');
    const cleanAddress = order.delivery_address?.replace(/^\[(DIRECT|WHATSAPP)\]\s*/i, '') || '';
    
    const details = `Order #${order.id.slice(0, 8)}\nItem: ${order.quantity}x ${order.products?.name} ${order.specification ? `(${order.specification})` : ''}\nTotal: ₦${order.total_price.toLocaleString()}\n\nCustomer: ${order.customer_name}\nPhone: ${order.customer_phone}\nInstagram: ${order.customer_instagram || 'N/A'}\nAddress: ${cleanAddress}`;
    
    navigator.clipboard.writeText(details);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ vendor_notes: vendorNotes })
        .eq('id', order.id)
      
      if (error) throw error
      alert('Notes saved successfully!')
    } catch (err: any) {
      alert("Error saving notes: " + err.message)
    } finally {
      setSavingNotes(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id)
      
      if (error) throw error

      // Local Stock Adjustment Logic
      if (newStatus === 'CANCELLED' && order.status !== 'CANCELLED') {
        const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', order.product_id).single()
        if (product) {
          await supabase.from('products').update({ stock_quantity: product.stock_quantity + order.quantity }).eq('id', order.product_id)
        }
      }
      
      if (order.status === 'CANCELLED' && newStatus !== 'CANCELLED') {
        const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', order.product_id).single()
        if (product) {
          await supabase.from('products').update({ stock_quantity: Math.max(0, product.stock_quantity - order.quantity) }).eq('id', order.product_id)
        }
      }

      setOrder({ ...order, status: newStatus })
    } catch (err: any) {
      alert("Error updating order status: " + err.message)
    } finally {
      setUpdating(false)
    }
  }

  const handleDownloadReceipt = async () => {
    setReceiptDownloading(true)
    setTimeout(async () => {
      if (receiptRef.current) {
        try {
          const canvas = await html2canvas(receiptRef.current, { 
            scale: 3, 
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
        } catch (e) {
          console.error(e)
        } finally {
          setReceiptDownloading(false)
        }
      }
    }, 150)
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock className="w-5 h-5 text-orange-500" />
      case 'PAID': return <CheckCircle2 className="w-5 h-5 text-blue-500" />
      case 'SHIPPED': return <Truck className="w-5 h-5 text-purple-500" />
      case 'DELIVERED': return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case 'CANCELLED': return <XCircle className="w-5 h-5 text-red-500" />
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

  if (loading || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isDirect = order.delivery_address?.startsWith('[DIRECT]');
  const isWhatsApp = order.delivery_address?.startsWith('[WHATSAPP]');
  const checkoutMode = isDirect ? 'Direct' : (isWhatsApp ? 'Conversational' : null);
  const cleanAddress = order.delivery_address?.replace(/^\[(DIRECT|WHATSAPP)\]\s*/i, '') || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 font-sans">
      <header className="bg-white border-b border-border sticky top-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-primary-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-primary-900">Order Details</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shrink-0 ${getStatusColor(order.status)}`}>
          {getStatusIcon(order.status)}
          {order.status === 'SHIPPED' ? 'ASSIGNED' : order.status}
        </div>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-6">
        
        {/* Core Order Info Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Ordered Product</span>
            <h3 className="font-bold text-lg text-primary-900 mt-1">{order.products?.name}</h3>
            <p className="text-xs text-secondary mt-0.5">Order Ref: #{order.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <div className="border-t border-slate-100 pt-4 flex gap-4">
            {order.products?.image_url && (
              <div className="w-16 h-16 rounded-xl border border-border overflow-hidden bg-slate-50 shrink-0">
                <img src={order.products.image_url} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Unit Price</span>
                <span className="font-medium text-slate-900">₦{Number(order.products?.price).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Quantity</span>
                <span className="font-bold text-slate-900">{order.quantity}x</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold pt-1 border-t border-dashed border-slate-100 mt-1">
                <span className="text-slate-500">Total Price</span>
                <span className="text-primary-600">₦{order.total_price.toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {checkoutMode && (
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Checkout Mode</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${checkoutMode === 'Direct' ? 'bg-purple-100 text-purple-700' : 'bg-[#25D366]/10 text-[#25D366]'}`}>
                {checkoutMode === 'Direct' ? <Laptop className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                {checkoutMode} Checkout
              </span>
            </div>
          )}
        </div>

        {/* Customer Information Card */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Customer Profile</h4>
            <button 
              onClick={handleCopyDetails}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-[10px] font-bold transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
          </div>

          <div className="space-y-3 text-xs leading-relaxed">
            <div className="flex justify-between py-1 border-b border-slate-50">
              <span className="text-slate-400 font-medium">Name</span>
              <span className="font-bold text-slate-800">{order.customer_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-50 items-center">
              <span className="text-slate-400 font-medium">WhatsApp Phone</span>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800">{order.customer_phone || 'N/A'}</span>
                {order.customer_phone && (
                  <a 
                    href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(`Hi ${order.customer_name || 'there'}, this is ${storeInfo?.store_name || 'our store'}. We've received your order for ${order.products?.name}! Just reaching out to confirm...`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366]/10 text-[#25D366] px-2 py-1 rounded text-[10px] font-bold hover:bg-[#25D366]/20 transition-colors flex items-center gap-1"
                  >
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </a>
                )}
              </div>
            </div>
            {order.customer_instagram && (
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400 font-medium">Instagram Handle</span>
                <span className="font-bold text-[#E1306C]">@{order.customer_instagram.replace('@', '')}</span>
              </div>
            )}
            {order.sender_name && (
              <div className="flex justify-between py-1.5 border-b border-amber-100 bg-amber-50/30 px-2 rounded-lg items-center">
                <span className="text-amber-800 font-bold text-[10px] uppercase">Bank Account Name</span>
                <span className="font-extrabold text-amber-950 text-xs">{order.sender_name}</span>
              </div>
            )}
            <div className="flex flex-col py-1 space-y-1">
              <span className="text-slate-400 font-medium">Delivery Address</span>
              <span className="font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-border mt-1">{cleanAddress || 'No address provided'}</span>
            </div>
          </div>
        </div>

        {/* Private Vendor Notes */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Private Notes</h4>
          <p className="text-[10px] text-slate-400">Add reminders or delivery details. Customers cannot see this.</p>
          <textarea
            value={vendorNotes}
            onChange={e => setVendorNotes(e.target.value)}
            placeholder="e.g. Call before delivery, payment received from different account..."
            rows={3}
            className="w-full text-xs p-3 rounded-xl border border-border bg-slate-50 focus:outline-none focus:ring-1 focus:ring-primary-500 resize-none"
          />
          <button
            onClick={handleSaveNotes}
            disabled={savingNotes}
            className="w-full bg-slate-100 text-slate-700 font-bold py-2.5 rounded-xl text-xs hover:bg-slate-200 transition-colors flex items-center justify-center"
          >
            {savingNotes ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Notes'}
          </button>
        </div>

        {/* ── DISPATCH & DELIVERY DETAILS ── */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-3">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Delivery & Courier Info</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rider / Courier Name</label>
              <input
                type="text"
                placeholder="e.g. GIG / Ibrahim Rider"
                value={order.rider_name || ''}
                onChange={(e) => setOrder({ ...order, rider_name: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-slate-50 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Rider Phone</label>
              <input
                type="tel"
                placeholder="e.g. 08012345678"
                value={order.rider_phone || ''}
                onChange={(e) => setOrder({ ...order, rider_phone: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-border bg-slate-50 font-bold"
              />
            </div>
          </div>
        </div>

        {/* ── 1-CLICK WHATSAPP MESSAGE TEMPLATES ── */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs uppercase tracking-widest text-slate-900 font-black flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>1-Click WhatsApp Templates</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              5 Quick Templates
            </span>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Send instant structured updates to customer on WhatsApp or copy the message.
          </p>

          <div className="space-y-2.5">
            {(() => {
              const cleanPhone = (order.customer_phone || '').replace(/[^0-9]/g, '').replace(/^0/, '234')
              const customerName = order.customer_name || 'there'
              const orderRef = 'ORD-' + order.id.slice(0, 8).toUpperCase()
              const shopName = storeInfo?.store_name || 'our store'
              const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${order.id}` : `https://ondar.ng/track/${order.id}`
              const riderName = order.rider_name || 'our dispatch rider'
              const riderPhone = order.rider_phone || ''

              const templates = [
                {
                  id: 'received',
                  title: '1. Order Received',
                  badge: 'PENDING',
                  text: `Hello ${customerName}, thank you for order #${orderRef} with ${shopName}. We have received it and will confirm your payment shortly.`,
                },
                {
                  id: 'paid',
                  title: '2. Payment Confirmed',
                  badge: 'PAID',
                  text: `Hello ${customerName}, payment for order #${orderRef} has been confirmed! We will start preparing your order.`,
                },
                {
                  id: 'preparing',
                  title: '3. Preparing Order',
                  badge: 'PACKING',
                  text: `Hello ${customerName}, we are currently preparing order #${orderRef}. Will notify you once dispatched.`,
                },
                {
                  id: 'dispatched',
                  title: '4. Dispatched',
                  badge: 'DISPATCHED',
                  text: `Hello ${customerName}, order #${orderRef} has been dispatched with ${riderName}${riderPhone ? ` (Phone: ${riderPhone})` : ''}. Tracking: ${trackingUrl}`,
                },
                {
                  id: 'delivered',
                  title: '5. Delivered',
                  badge: 'DELIVERED',
                  text: `Hello ${customerName}, your order #${orderRef} has been delivered. Thank you for shopping with ${shopName}!`,
                },
              ]

              return templates.map((tmpl) => (
                <div key={tmpl.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{tmpl.title}</span>
                    <span className="text-[9px] font-black uppercase text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {tmpl.badge}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200/60 font-medium italic">
                    &ldquo;{tmpl.text}&rdquo;
                  </p>

                  <div className="flex items-center gap-2 pt-0.5">
                    {cleanPhone ? (
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(tmpl.text)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-[#25D366] text-white text-[10px] font-black rounded-lg flex items-center justify-center gap-1 hover:opacity-90 shadow-2xs"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Open WhatsApp</span>
                      </a>
                    ) : null}

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(tmpl.text)
                        alert('Message copied to clipboard!')
                      }}
                      className="px-3 py-1.5 bg-white text-slate-700 border border-slate-300 text-[10px] font-bold rounded-lg hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3 text-[#00A859]" />
                      <span>Copy Text</span>
                    </button>
                  </div>
                </div>
              ))
            })()}
          </div>
        </div>

        {/* Status Actions Form */}
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Process Order</h4>
          
          <div className="grid grid-cols-2 gap-2">
            {order.status === 'PENDING' && (
              <button 
                onClick={() => handleStatusUpdate('PAID')} 
                disabled={updating}
                className="col-span-2 bg-blue-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
              >
                Mark as Paid
              </button>
            )}
            {order.status === 'PAID' && (
              <button 
                onClick={() => handleStatusUpdate('SHIPPED')} 
                disabled={updating}
                className="col-span-2 bg-purple-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-1.5"
              >
                Assign Delivery
              </button>
            )}
            {order.status === 'SHIPPED' && (
              <button 
                onClick={() => handleStatusUpdate('DELIVERED')} 
                disabled={updating}
                className="col-span-2 bg-green-600 text-white py-3 rounded-xl text-xs font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-1.5"
              >
                Mark as Delivered
              </button>
            )}
            {order.status !== 'CANCELLED' && (
              <button 
                onClick={() => handleStatusUpdate('CANCELLED')} 
                disabled={updating}
                className="bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
              >
                Cancel Order
              </button>
            )}
            {order.status !== 'PENDING' && (
              <button 
                onClick={() => handleStatusUpdate('PENDING')} 
                disabled={updating}
                className="bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all"
              >
                Reset Status
              </button>
            )}
          </div>

          {/* Receipt Actions */}
          {(order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'DELIVERED') && (
            <button 
              onClick={handleDownloadReceipt}
              disabled={receiptDownloading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-xs font-bold hover:bg-black transition-all flex items-center justify-center gap-2 border border-slate-800"
            >
              {receiptDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {receiptDownloading ? 'Generating...' : 'Download Image Receipt'}
            </button>
          )}
        </div>

      </main>

      {/* Hidden Receipt Element (used only for generating the image) */}
      {storeInfo && order && (
        <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none w-[400px]">
          <div ref={receiptRef} style={{ backgroundColor: '#ffffff', padding: '3.5rem 2.5rem', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', position: 'relative', width: '400px' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '8px', backgroundColor: storeInfo.accent_color || '#00A859' }}></div>
            
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                {storeInfo.logo_url ? (
                  <img src={storeInfo.logo_url} style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover', border: '2px solid #f1f5f9' }} alt="" />
                ) : (
                  <div style={{ width: '48px', height: '48px', backgroundColor: '#f1f5f9', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/icon.png" style={{ width: '24px', height: '24px' }} alt="" />
                  </div>
                )}
              </div>
              <h1 style={{ fontSize: '0.625rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#94a3b8', marginBottom: '0.75rem' }}>Official Receipt</h1>
              <p style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em', lineHeight: 1.1 }}>{storeInfo.store_name}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', padding: '1.5rem 0' }}>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Order Reference</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>#{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>Date Issued</p>
                <p style={{ fontSize: '0.875rem', fontWeight: 700 }}>{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ marginBottom: '2.5rem' }}>
              <p style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '1rem' }}>Items Ordered</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <p style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>{order.products?.name}</p>
                  <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '0.4rem' }}>Quantity: {order.quantity}</p>
                </div>
                <p style={{ fontSize: '1.125rem', fontWeight: 700 }}>₦{order.total_price.toLocaleString()}</p>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '1.5rem', padding: '1.75rem', marginBottom: '3rem', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: storeInfo.accent_color || '#00A859', letterSpacing: '-0.02em' }}>₦{order.total_price.toLocaleString()}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Thank you for your business!</p>
              {storeInfo.instagram_handle && (
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
    </div>
  )
}
