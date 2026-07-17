import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )

  // Fetch all stores
  const { data: stores } = await supabase.from('stores').select('slug, updated_at')
  
  // Fetch all products with their store slug
  const { data: products } = await supabase.from('products').select('id, updated_at, stores(slug)')

  const baseUrl = 'https://ondar.shop'

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ]

  if (stores) {
    stores.forEach((store) => {
      routes.push({
        url: `${baseUrl}/${store.slug}`,
        lastModified: new Date(store.updated_at || new Date()),
        changeFrequency: 'daily',
        priority: 0.9,
      })
    })
  }

  if (products) {
    products.forEach((product) => {
      const storeSlug = (product.stores as any)?.slug
      if (storeSlug) {
        routes.push({
          url: `${baseUrl}/${storeSlug}/product/${product.id}`,
          lastModified: new Date(product.updated_at || new Date()),
          changeFrequency: 'daily',
          priority: 0.8,
        })
      }
    })
  }

  return routes
}
