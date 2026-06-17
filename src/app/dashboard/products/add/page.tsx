'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react'
import Link from 'next/link'

export default function DashboardAddProductPage() {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('10')
  const [description, setDescription] = useState('')
  const [variants, setVariants] = useState('')
  const [category, setCategory] = useState('')
  const [hasManuallyEditedCategory, setHasManuallyEditedCategory] = useState(false)
  
  // Multi-image upload state
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  
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

  // Auto-Categorization Logic
  useEffect(() => {
    if (hasManuallyEditedCategory || !name) return;

    const lowerName = name.toLowerCase();
    
    // Comprehensive dictionary for diverse store types
    const categoryRules: Record<string, string[]> = {
      'Phones': ['iphone', 'samsung', 'pixel', 'tecno', 'infinix', 'redmi', 'smartphone', 'nokia', 'vivo', 'oppo'],
      'Laptops': ['macbook', 'hp', 'dell', 'lenovo', 'asus', 'laptop', 'chromebook', 'thinkpad'],
      'Audio': ['airpods', 'earpods', 'headset', 'headphone', 'speaker', 'jbl', 'sony', 'earbuds', 'boombox'],
      'Wearables': ['watch', 'apple watch', 'smart watch', 'fitbit', 'band'],
      'Accessories': ['charger', 'cable', 'case', 'screen protector', 'power bank', 'adapter', 'hub', 'dongle'],
      'Clothing': ['shirt', 't-shirt', 'dress', 'jeans', 'trousers', 'skirt', 'jacket', 'hoodie', 'suit', 'gown'],
      'Shoes': ['sneakers', 'shoes', 'boots', 'heels', 'sandals', 'slides', 'slippers'],
      'Bags': ['bag', 'handbag', 'backpack', 'purse', 'wallet', 'tote'],
      'Jewelry': ['necklace', 'ring', 'bracelet', 'earrings', 'jewelry', 'chain', 'watch'],
      'Skincare': ['lotion', 'serum', 'cream', 'cleanser', 'sunscreen', 'moisturizer', 'toner'],
      'Makeup': ['lipstick', 'foundation', 'concealer', 'mascara', 'palette', 'powder'],
      'Fragrance': ['perfume', 'cologne', 'fragrance', 'body spray', 'mist'],
      'Groceries': ['rice', 'beans', 'oil', 'pasta', 'milk', 'sugar', 'salt', 'spice', 'flour'],
      'Home Appliances': ['blender', 'microwave', 'tv', 'television', 'fridge', 'refrigerator', 'iron', 'fan', 'ac', 'air conditioner'],
      'Furniture': ['chair', 'table', 'sofa', 'bed', 'wardrobe', 'desk', 'cabinet']
    };

    for (const [cat, keywords] of Object.entries(categoryRules)) {
      if (keywords.some(kw => lowerName.includes(kw))) {
        setCategory(cat);
        break;
      }
    }
  }, [name, hasManuallyEditedCategory]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    // Limit to 4 images total
    const availableSlots = 4 - images.length
    const filesToAdd = files.slice(0, availableSlots)
    
    if (files.length > availableSlots) {
      alert(`You can only upload up to 4 images.`)
    }

    setImages(prev => [...prev, ...filesToAdd])
    
    const newPreviews = filesToAdd.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
    
    // reset input
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      // release memory
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0 || !storeId) {
      setError('Please upload at least one image for your product.')
      return
    }

    setLoading(true)
    setError(null)

    const uploadedUrls: string[] = []

    try {
      // 1. Upload all images
      for (const img of images) {
        const fileExt = img.name.split('.').pop()
        const fileName = `${storeId}/${Math.random()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, img)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName)
          
        uploadedUrls.push(publicUrl)
      }

      // 2. Insert product (first image is main, rest are additional)
      const { error: insertError } = await supabase.from('products').insert({
        store_id: storeId,
        name,
        price: parseFloat(price),
        description,
        stock_quantity: parseInt(stock),
        image_url: uploadedUrls[0],
        additional_images: uploadedUrls.slice(1),
        category: category ? category.trim() : null,
        variants: variants ? variants.split(',').map(v => v.trim()).filter(Boolean).join(', ') : null
      })

      if (insertError) throw insertError

      router.push('/dashboard/products')
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
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
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-primary-900">Product Images</label>
              <span className="text-xs text-secondary font-medium">{images.length}/4</span>
            </div>
            
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-3">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {idx === 0 && (
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-widest uppercase">
                      Main
                    </div>
                  )}
                </div>
              ))}
              
              {images.length < 4 && (
                <div 
                  onClick={() => document.getElementById('image-input')?.click()}
                  className="relative aspect-square bg-slate-50 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-all"
                >
                  <Upload className="w-6 h-6 text-secondary mb-1" />
                  <span className="text-[11px] text-secondary font-medium text-center px-4 leading-tight">
                    Add Photo
                  </span>
                  <input 
                    id="image-input"
                    type="file" 
                    accept="image/*"
                    multiple
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </div>
              )}
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
            <label className="text-sm font-medium text-primary-900">Category (Optional)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value)
                setHasManuallyEditedCategory(true)
              }}
              placeholder="e.g. Laptops, Shoes, Skincare"
              className="w-full px-4 py-3 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none transition-all text-sm"
            />
            <p className="text-[10px] text-secondary mt-1">Auto-fills based on product name. You can freely edit this.</p>
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
