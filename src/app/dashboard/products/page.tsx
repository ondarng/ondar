'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Package, ArrowLeft, Loader2, Minus } from 'lucide-react'
import Link from 'next/link'

export default function DashboardProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [storeId, setStoreId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProducts() {
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

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

      setProducts(productsData || [])
      setLoading(false)
    }
    fetchProducts()
  }, [])

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    await supabase.from('products').delete().eq('id', productId)
    setProducts(products.filter(p => p.id !== productId))
  }

  const updateStock = async (productId: string, currentStock: number, delta: number) => {
    const newStock = Math.max(0, currentStock + delta)
    const { error } = await supabase.from('products').update({ stock_quantity: newStock }).eq('id', productId)
    
    if (!error) {
      setProducts(products.map(p => p.id === productId ? { ...p, stock_quantity: newStock } : p))
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
          <span className="font-bold text-primary-900">Inventory</span>
        </div>
        <Link 
          href="/dashboard/products/add" 
          className="bg-primary-50 text-primary-700 p-2 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
        </Link>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6 space-y-4">
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className="bg-white p-4 rounded-2xl border border-border shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-primary-900 truncate">{product.name}</h3>
                <p className="font-display font-extrabold text-primary-600 text-sm">₦{product.price.toLocaleString()}</p>
                
                <div className="flex items-center gap-3 mt-2">
                  <button 
                    onClick={() => updateStock(product.id, product.stock_quantity, -1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-primary-900 text-sm w-4 text-center">{product.stock_quantity}</span>
                  <button 
                    onClick={() => updateStock(product.id, product.stock_quantity, 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center hover:bg-slate-200 active:scale-95 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Link 
                  href={`/dashboard/products/${product.id}`}
                  className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button 
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <p className="font-bold text-primary-900">Your inventory is empty</p>
              <p className="text-sm text-secondary">Add some products to start selling.</p>
            </div>
            <Link 
              href="/onboarding/add-product"
              className="mt-4 bg-primary-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary-600/20"
            >
              Add Product
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
