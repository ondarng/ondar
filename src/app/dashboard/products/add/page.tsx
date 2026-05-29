'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'

export default function DashboardAddProductPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('10')
  const [description, setDescription] = useState('')
  const [variants, setVariants] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getStore() {
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
    }
    getStore()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImage(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!image || !storeId) {
      setError('Please upload an image for your product.')
      return
    }

    setLoading(true)
    setError(null)

    // 1. Upload image
    const fileExt = image.name.split('.').pop()
    const fileName = `${storeId}/${Math.random()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, image)

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`)
      setLoading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName)

    // 2. Insert product
    const { error: insertError } = await supabase.from('products').insert({
      store_id: storeId,
      name,
      price: parseFloat(price),
      description,
      stock_quantity: parseInt(stock),
      image_url: publicUrl,
      variants: variants ? variants.split(',').map(v => v.trim()).filter(Boolean).join(', ') : null
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard/products')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24">
      <header className="bg-white border-b border-border sticky top-0 z-10 px-4 py-3 flex items-center gap-3">
        <Link href="/dashboard/products" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-primary-900">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <span className="font-bold text-primary-900">Add Product</span>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <form onSubmit={handleAddProduct} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-border">
          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900">Product Image</label>
            <div 
              onClick={() => document.getElementById('image-input')?.click()}
              className="relative w-full aspect-square bg-slate-50 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Upload className="w-8 h-8 text-secondary mb-2" />
                  <span className="text-xs text-secondary font-medium text-center px-4">
                    Tap to upload photo
                  </span>
                </>
              )}
              <input 
                id="image-input"
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900">Product Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-primary-900">Price (₦)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-primary-900">Stock</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900">Variants / Options (Optional)</label>
            <input
              type="text"
              value={variants}
              onChange={(e) => setVariants(e.target.value)}
              placeholder="e.g. Size 40, Size 42, Black, Red, 128GB"
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
            />
            <p className="text-[10px] text-secondary mt-1">Comma-separated list of choices for buyers to select.</p>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all h-24 resize-none"
            />
          </div>

          {error && <p className="text-accent text-sm font-medium bg-accent/5 p-3 rounded-lg border border-accent/10">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Product'}
          </button>
        </form>
      </main>
    </div>
  )
}
