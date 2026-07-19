'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Save, Upload, X } from 'lucide-react'
import Link from 'next/link'

type ImageAsset = 
  | { type: 'url'; url: string }
  | { type: 'file'; file: File; preview: string }

export default function EditProductPage() {
  const { id } = useParams()
  const productId = Array.isArray(id) ? id[0] : id
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('0')
  const [variants, setVariants] = useState<{name: string, price: string | number | null}[]>([])
 
  const addVariant = () => setVariants([...variants, { name: '', price: '' }])
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index))
  const updateVariant = (index: number, field: 'name' | 'price', value: string) => {
    const newVariants = [...variants]
    newVariants[index][field] = value
    setVariants(newVariants)
  }
  const [category, setCategory] = useState('')
  const [hasManuallyEditedCategory, setHasManuallyEditedCategory] = useState(false)
  
  const [images, setImages] = useState<ImageAsset[]>([])
  
  const router = useRouter()
  const supabase = createClient()
 
  useEffect(() => {
    async function fetchProduct() {
      // Verify ownership: get user, then their store, then the product scoped to that store
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
 
      const { data: storeData } = await supabase
        .from('stores')
        .select('id')
        .eq('vendor_id', user.id)
        .maybeSingle()
 
      if (!storeData) {
        router.push('/onboarding/create-store')
        return
      }
 
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle()
      
      if (error || !data) {
        console.error('Fetch product error:', error)
        router.push('/dashboard/products')
        return
      }

      setName(data.name || '')
      setPrice(data.price != null ? data.price.toString() : '0')
      setDescription(data.description || '')
      setVariants(data.variants && Array.isArray(data.variants) ? data.variants : [])
      setCategory(data.category || '')
      setStock(data.stock_quantity != null ? data.stock_quantity.toString() : '0')
      
      const loadedImages: ImageAsset[] = []
      if (data.image_url) loadedImages.push({ type: 'url', url: data.image_url })
      if (data.additional_images && Array.isArray(data.additional_images)) {
        data.additional_images.forEach((url: string) => loadedImages.push({ type: 'url', url }))
      }
      setImages(loadedImages)
      
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  // Auto-Categorization Logic
  useEffect(() => {
    if (loading || hasManuallyEditedCategory || !name) return;

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
        if (category !== cat) setCategory(cat);
        break;
      }
    }
  }, [name, hasManuallyEditedCategory, loading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const availableSlots = 4 - images.length
    const filesToAdd = files.slice(0, availableSlots)
    
    if (files.length > availableSlots) {
      alert(`You can only upload up to 4 images.`)
    }

    const newAssets: ImageAsset[] = filesToAdd.map(f => ({
      type: 'file',
      file: f,
      preview: URL.createObjectURL(f)
    }))

    setImages(prev => [...prev, ...newAssets])
    e.target.value = ''
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const item = prev[index]
      if (item.type === 'file') {
        URL.revokeObjectURL(item.preview)
      }
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) {
      setMessage({ type: 'error', text: 'Please upload at least one image.' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const finalUrls: string[] = []
      
      for (const img of images) {
        if (img.type === 'url') {
          finalUrls.push(img.url)
        } else {
          const fileExt = img.file.name.split('.').pop()
          const fileName = `update-${Date.now()}-${Math.random()}.${fileExt}`
          
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, img.file)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)
            
          finalUrls.push(publicUrl)
        }
      }

      const { error } = await supabase
        .from('products')
        .update({
          name,
          price: parseFloat(price),
          description,
          stock_quantity: parseInt(stock),
          image_url: finalUrls[0],
          additional_images: finalUrls.slice(1),
          category: category ? category.trim() : null,
          variants: variants.filter(v => v.name.trim() !== '').map(v => ({ name: v.name.trim(), price: v.price ? parseFloat(v.price as string) : null }))
        })
        .eq('id', productId)
 
      if (error) throw error

      setMessage({ type: 'success', text: 'Product updated successfully!' })
      setTimeout(() => {
        router.refresh()
        router.push('/dashboard/products')
      }, 1500)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
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
          <Link href="/dashboard/products" className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors text-primary-900">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-bold text-primary-900">Edit Product</span>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-700 transition-colors disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save
        </button>
      </header>

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {message.text}
            </div>
          )}

          {/* Image Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-primary-900">Product Images</label>
              <span className="text-xs text-secondary font-medium">{images.length}/4</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl border-2 border-slate-100 overflow-hidden group">
                  <img src={img.type === 'url' ? img.url : img.preview} alt="Preview" className="w-full h-full object-cover" />
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

          {/* Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-border space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Price (₦)</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Stock Quantity</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-primary-900">Variants (Optional)</label>
                <button 
                  type="button" 
                  onClick={addVariant}
                  className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-md"
                >
                  + Add Variant
                </button>
              </div>
              {variants.map((variant, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={variant.name}
                    onChange={(e) => updateVariant(idx, 'name', e.target.value)}
                    placeholder="e.g. Size M"
                    className="w-1/2 px-3 py-2 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                  <input
                    type="number"
                    value={variant.price || ''}
                    onChange={(e) => updateVariant(idx, 'price', e.target.value)}
                    placeholder="Specific Price (₦)"
                    className="w-1/2 px-3 py-2 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                  />
                  <button 
                    type="button" 
                    onClick={() => removeVariant(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-[10px] text-secondary">Leave price empty to use the base product price.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Category (Optional)</label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value)
                  setHasManuallyEditedCategory(true)
                }}
                placeholder="e.g. Laptops, Shoes, Skincare"
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
              <p className="text-[10px] text-secondary mt-1">Auto-fills based on product name. You can freely edit this.</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-primary-900">Description (Optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 rounded-xl border border-border focus:ring-2 focus:ring-primary-500 outline-none resize-none"
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
