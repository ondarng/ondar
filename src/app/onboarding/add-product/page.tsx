'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { posthog } from '@/lib/posthog'
import { ArrowRight, Loader2, Plus, Upload, Package } from 'lucide-react'

export default function AddProductPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('10')
  const [image, setImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [productCount, setProductCount] = useState(0)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getStore() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: store, error } = await supabase
        .from('stores')
        .select('id')
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (!store || error) {
        console.error('Error fetching store:', error)
        router.push('/onboarding/create-store')
        return
      }
      setStoreId(store.id)

      // Check existing products
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('store_id', store.id)
      
      setProductCount(count || 0)
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

    // 1. Upload image to Supabase Storage
    const fileExt = image.name.split('.').pop()
    const fileName = `${storeId}/${Math.random()}.${fileExt}`
    
    const { error: uploadError, data: uploadData } = await supabase.storage
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

    // 2. Insert product record
    const { error: insertError } = await supabase.from('products').insert({
      store_id: storeId,
      name,
      price: parseFloat(price),
      description,
      stock_quantity: parseInt(stock),
      image_url: publicUrl,
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    const newCount = productCount + 1
    setProductCount(newCount)
    posthog.capture(newCount === 1 ? 'first_product_added' : 'product_added', { 
      product_name: name,
      product_count: newCount
    })

    if (newCount >= 3) {
      router.push('/onboarding/share-store')
    } else {
      // Clear form for next product
      setName('')
      setPrice('')
      setDescription('')
      setImage(null)
      setImagePreview(null)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 px-6 py-12">
      <div className="w-full max-w-md mx-auto space-y-8">
        <div className="flex items-center gap-2 text-primary-600 font-bold">
          <div className="w-8 h-1 bg-primary-600 rounded-full" />
          <div className="w-8 h-1 bg-primary-600 rounded-full" />
          <div className="w-8 h-1 bg-slate-200 rounded-full" />
          <span className="ml-2 text-xs uppercase tracking-widest">Step 2 of 3</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary-900">
            Add your products
          </h1>
          <p className="text-secondary font-sans">
            You need at least 3 products to launch. ({productCount}/3 added)
          </p>
        </div>

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
                    Tap to upload product photo
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
            <label className="text-sm font-medium text-primary-900" htmlFor="name">
              Product Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              placeholder="e.g. Vintage Denim Jacket"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-primary-900" htmlFor="description">
              Product Details (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all resize-none"
              placeholder="e.g. 128GB Storage, Excellent condition, Comes with charger..."
            />
            <p className="text-xs text-slate-400">Add details like size, color, condition, or storage capacity.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-primary-900" htmlFor="price">
                Price (₦)
              </label>
              <input
                id="price"
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="5000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-primary-900" htmlFor="stock">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="10"
              />
            </div>
          </div>

          {error && (
            <p className="text-accent text-sm font-medium bg-accent/5 p-3 rounded-lg border border-accent/10">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" />
                {productCount < 2 ? 'Add Next Product' : 'Add & Finish Setup'}
              </>
            )}
          </button>
          
          {productCount > 0 && (
            <button
              type="button"
              onClick={() => router.push('/onboarding/share-store')}
              className="w-full text-secondary font-bold py-2 text-sm hover:text-primary-600 transition-colors"
            >
              Skip and finish for now
            </button>
          )}
        </form>
      </div>
    </div>
  )
}
