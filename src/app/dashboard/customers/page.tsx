'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Users, Search, Plus, X, User, Phone } from 'lucide-react'
import Link from 'next/link'

const WhatsAppIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.446 4.432-9.877 9.888-9.877 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.446-4.435 9.877-9.888 9.877m8.415-18.3c-2.251-2.25-5.244-3.487-8.427-3.487-6.559 0-11.9 5.341-11.9 11.9 0 2.09.544 4.132 1.577 5.942L0 24l6.302-1.654a11.852 11.852 0 005.591 1.41h.005c6.56 0 11.9-5.341 11.9-11.9 0-3.184-1.24-6.179-3.492-8.432" />
  </svg>
)

const InstagramIcon = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
)

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newIg, setNewIg] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchCustomers() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!store) {
        router.push('/onboarding/create-store')
        return
      }

      setStoreId(store.id)

      const { data: customersData } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', store.id)
        .order('last_order_at', { ascending: false })

      setCustomers(customersData || [])
      setLoading(false)
    }
    fetchCustomers()
  }, [])

  const handleAddCustomer = async () => {
    if (!newName.trim() || !newPhone.trim() || !storeId) return
    setSaving(true)

    const { data, error } = await supabase.from('customers').upsert({
      store_id: storeId,
      name: newName.trim(),
      phone: newPhone.trim(),
      instagram_handle: newIg.trim() || null,
      last_order_at: new Date().toISOString()
    }, { onConflict: 'store_id,phone' }).select().single()

    if (!error && data) {
      setCustomers(prev => [data, ...prev.filter(c => c.id !== data.id)])
      setNewName('')
      setNewPhone('')
      setNewIg('')
      setShowAddModal(false)
    } else {
      alert('Error adding customer: ' + (error?.message || 'Unknown error'))
    }
    setSaving(false)
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search) ||
    (c.instagram_handle && c.instagram_handle.toLowerCase().includes(search.toLowerCase()))
  )

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
          <span className="font-bold text-primary-900">Customer Memory</span>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input 
            type="text"
            placeholder="Search by name, number, or IG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
          />
        </div>

        <p className="text-xs text-secondary font-bold">{filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}</p>

        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 font-bold text-lg">
                    {customer.name[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-primary-900">{customer.name}</h3>
                    <p className="text-xs text-secondary">{customer.phone}</p>
                    {customer.instagram_handle && (
                      <p className="text-xs font-bold" style={{ color: '#E1306C' }}>@{customer.instagram_handle.replace('@', '')}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={`https://wa.me/${customer.phone.replace(/\D/g, '').replace(/^0/, '234')}`}
                    target="_blank"
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ backgroundColor: '#dcfce7' }}
                  >
                    <WhatsAppIcon className="w-4 h-4" style={{ color: '#25D366' }} />
                  </a>
                  {customer.instagram_handle && (
                    <a 
                      href={`https://ig.me/m/${customer.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                      style={{ backgroundColor: '#fce7f3' }}
                    >
                      <InstagramIcon className="w-4 h-4" style={{ color: '#E1306C' }} />
                    </a>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Last Seen</p>
                  <p className="text-xs font-bold text-primary-900">
                    {new Date(customer.last_order_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-primary-900">No customers found</p>
              <p className="text-sm text-secondary">Customers appear here automatically when they buy, or add them manually.</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Customer
            </button>
          </div>
        )}
      </main>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center">
          <div className="bg-white w-full max-w-md rounded-t-3xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-primary-900">Add Customer</h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5 text-secondary" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                  <User className="w-3 h-3" /> Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900"
                  placeholder="Customer name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                  <Phone className="w-3 h-3" /> Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900"
                  placeholder="e.g. 08012345678"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-primary-900 flex items-center gap-2">
                  <InstagramIcon className="w-3 h-3" style={{ color: '#E1306C' }} /> Instagram Handle
                </label>
                <input
                  type="text"
                  value={newIg}
                  onChange={(e) => setNewIg(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-slate-900"
                  placeholder="@username"
                />
              </div>
            </div>

            <button
              onClick={handleAddCustomer}
              disabled={saving || !newName.trim() || !newPhone.trim()}
              className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Add Customer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
