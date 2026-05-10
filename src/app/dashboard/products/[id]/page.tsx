'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default function EditProductPage() {
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [stock, setStock] = useState('0')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !data) {
        router.push('/dashboard/products')
        return
      }

      setName(data.name)
      setPrice(data.price.toString())
      setDescription(data.description || '')
      setStock(data.stock_quantity.toString())
      setImageUrl(data.image_url)
      setLoading(false)
    }
    fetchProduct()
  }, [id])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0) return

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setImageUrl(publicUrl)
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    const { error } = await supabase
      .from('products')
      .update({
        name,
        price: parseFloat(price),
        description,
        stock_quantity: parseInt(stock),
        image_url: imageUrl
      })
      .eq('id', id)

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Product updated successfully!' })
      setTimeout(() => router.push('/dashboard/products'), 1500)
    }
    setSaving(false)
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
          disabled={saving || uploading}
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
            <label className="text-xs font-bold text-primary-900 uppercase tracking-widest">Product Image</label>
            <div className="relative aspect-square w-full bg-slate-50 rounded-2xl border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden group">
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <p className="text-white text-xs font-bold">Change Image</p>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-slate-300 mb-2" />
                  <p className="text-xs text-secondary font-medium text-center px-6">Tap to upload product photo</p>
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploading}
              />
              {uploading && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
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
